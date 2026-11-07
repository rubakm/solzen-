import { promises as fs, createReadStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

/**
 * Editable website content (updates, team, insights, socials, gallery), photo uploads and admin auth.
 *
 * Storage:
 *  - Production: MongoDB (set MONGODB_URI). Content lives in the "content" collection,
 *    photos in GridFS ("uploads" bucket). Survives restarts and redeploys.
 *  - Local development: a JSON file + an uploads folder in backend/data (no setup needed).
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_FILE = process.env.CONTENT_FILE || path.join(__dirname, 'data', 'content.json');
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(path.dirname(CONTENT_FILE), 'uploads');
const USE_MONGO = Boolean(process.env.MONGODB_URI);
export const STORAGE = USE_MONGO ? 'mongodb' : 'file';

export const SECTIONS = ['updates', 'team', 'insights', 'socials', 'gallery'];
const SOCIAL_PLATFORMS = ['linkedin', 'x', 'instagram', 'youtube', 'facebook', 'whatsapp', 'email'];
const FILE_NAME = /^[\w-]+\.(jpg|png|webp)$/;
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

/* ---------------- MongoDB connection (production) ---------------- */

let mongoPromise = null;
function getMongo() {
  if (!mongoPromise) {
    mongoPromise = (async () => {
      const { MongoClient, GridFSBucket } = await import(process.env.MONGODB_MODULE || 'mongodb');
      const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || 'solzen');
      return { client, content: db.collection('content'), bucket: new GridFSBucket(db, { bucketName: 'uploads' }) };
    })().catch(err => {
      mongoPromise = null; // retry on next request
      throw err;
    });
  }
  return mongoPromise;
}

/** Connect early so problems show up in the logs at start-up. */
export async function initStorage() {
  if (!USE_MONGO) return 'file';
  await getMongo();
  return 'mongodb';
}

/* ---------------- Content ---------------- */

export async function readContent() {
  if (USE_MONGO) {
    const { content } = await getMongo();
    const docs = await content.find({}).toArray();
    const out = {};
    let updatedAt = '';
    docs.forEach(d => {
      if (SECTIONS.includes(d._id)) out[d._id] = d.items || [];
      if (d.updatedAt && d.updatedAt > updatedAt) updatedAt = d.updatedAt;
    });
    if (updatedAt) out.updatedAt = updatedAt;
    return out;
  }
  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf8');
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Could not read content file:', err.message);
    return {};
  }
}

export async function writeSection(section, items) {
  const updatedAt = new Date().toISOString();
  if (USE_MONGO) {
    const { content } = await getMongo();
    await content.updateOne({ _id: section }, { $set: { items, updatedAt } }, { upsert: true });
    return readContent();
  }
  const current = await readContent();
  const next = { ...current, [section]: items, updatedAt };
  await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true });
  const tmp = `${CONTENT_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf8');
  await fs.rename(tmp, CONTENT_FILE);
  return next;
}

/* ---------------- Validation ---------------- */

const str = (v, max, { required = false, field = 'field' } = {}) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (required && !s) throw new Error(`${field} is required.`);
  if (s.length > max) throw new Error(`${field} must be ${max} characters or fewer.`);
  return s;
};

const url = (v, field, { allowMailto = false } = {}) => {
  const s = str(v, 500, { field });
  if (!s) return '';
  const ok = /^https?:\/\/[^\s]+$/i.test(s) || (allowMailto && /^mailto:[^\s@]+@[^\s@]+$/i.test(s));
  if (!ok) throw new Error(`${field} must be a full link starting with https://${allowMailto ? ' (or mailto:)' : ''}.`);
  return s;
};

const UPLOAD_PATH = /^\/uploads\/[\w-]+\.(jpg|png|webp)$/;

const photo = v => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return '';
  if (UPLOAD_PATH.test(s)) return s; // uploaded through the admin panel
  if (/^\/[\w\-./]+\.(png|jpe?g|webp)$/i.test(s) && !s.includes('..')) return s; // file in /public
  if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s)) {
    if (s.length > 400_000) throw new Error('Photo is too large. Please use an image under ~300 KB.');
    return s;
  }
  throw new Error('Photo must be an uploaded image.');
};

const id = v => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : crypto.randomUUID().slice(0, 8));

const validators = {
  updates: item => {
    const images = Array.isArray(item.images) ? item.images : [];
    if (images.length > 6) throw new Error('An update can have at most 6 photos.');
    return {
      id: id(item.id),
      date: str(item.date, 40, { required: true, field: 'Date' }),
      tag: str(item.tag, 40, { field: 'Tag' }),
      title: str(item.title, 140, { required: true, field: 'Title' }),
      desc: str(item.desc, 600, { field: 'Description' }),
      images: images.map(photo).filter(Boolean)
    };
  },
  gallery: item => {
    const image = photo(item.image);
    if (!image) throw new Error('Photo is required.');
    return {
      id: id(item.id),
      image,
      caption: str(item.caption, 160, { field: 'Caption' }),
      event: str(item.event, 60, { field: 'Event' }),
      date: str(item.date, 40, { field: 'Date' })
    };
  },
  team: item => {
    const name = str(item.name, 80, { required: true, field: 'Name' });
    const initials =
      str(item.initials, 3, { field: 'Initials' }) ||
      name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return {
      id: id(item.id),
      name,
      initials,
      role: str(item.role, 80, { required: true, field: 'Role' }),
      bio: str(item.bio, 400, { field: 'Bio' }),
      linkedin: url(item.linkedin, 'LinkedIn link'),
      photo: photo(item.photo)
    };
  },
  insights: item => ({
    id: id(item.id),
    tag: str(item.tag, 40, { field: 'Tag' }),
    time: str(item.time, 30, { field: 'Read time' }),
    title: str(item.title, 160, { required: true, field: 'Title' }),
    subtitle: str(item.subtitle, 300, { field: 'Subtitle' }),
    link: url(item.link, 'Article link')
  }),
  socials: item => {
    const platform = str(item.platform, 20, { required: true, field: 'Platform' }).toLowerCase();
    if (!SOCIAL_PLATFORMS.includes(platform)) throw new Error(`Platform must be one of: ${SOCIAL_PLATFORMS.join(', ')}.`);
    return {
      id: id(item.id),
      platform,
      url: url(item.url, 'Link', { allowMailto: platform === 'email' })
    };
  }
};

export function validateSection(section, items) {
  if (!SECTIONS.includes(section)) throw new Error('Unknown section.');
  if (!Array.isArray(items)) throw new Error('Expected a list of items.');
  const max = section === 'gallery' ? 200 : 50;
  if (items.length > max) throw new Error(`Too many items (max ${max}).`);
  return items.map((item, i) => {
    if (!item || typeof item !== 'object') throw new Error(`Item ${i + 1} is invalid.`);
    try {
      return validators[section](item);
    } catch (err) {
      throw new Error(`Item ${i + 1}: ${err.message}`);
    }
  });
}

/* ---------------- Uploads ---------------- */

const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024;
const MAGIC = {
  jpg: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  png: b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  webp: b => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP'
};

/** Save an uploaded image (data URL) and return its public path, e.g. /uploads/abc.jpg */
export async function saveUpload(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(typeof dataUrl === 'string' ? dataUrl : '');
  if (!m) throw new Error('Please upload a JPG, PNG or WebP image.');
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const buf = Buffer.from(m[2], 'base64');
  if (!buf.length || buf.length > MAX_UPLOAD_BYTES) throw new Error('Image must be smaller than 2.5 MB.');
  if (!MAGIC[ext](buf)) throw new Error('That file is not a valid image.');
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

  if (USE_MONGO) {
    const { bucket } = await getMongo();
    await new Promise((resolve, reject) => {
      const up = bucket.openUploadStream(name, { metadata: { contentType: MIME[ext] } });
      up.once('finish', resolve);
      up.once('error', reject);
      up.end(buf);
    });
  } else {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  }
  return `/uploads/${name}`;
}

/** Stream an uploaded photo to the response (404 if missing). */
export async function sendUpload(name, res) {
  if (!FILE_NAME.test(name || '')) return res.status(404).end();
  const ext = name.split('.').pop();
  const headers = {
    'Content-Type': MIME[ext],
    'Cache-Control': 'public, max-age=2592000, immutable',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'X-Content-Type-Options': 'nosniff'
  };
  try {
    if (USE_MONGO) {
      const { bucket } = await getMongo();
      const found = await bucket.find({ filename: name }).limit(1).toArray();
      if (!found.length) return res.status(404).end();
      res.set({ ...headers, 'Content-Length': String(found[0].length) });
      return bucket
        .openDownloadStreamByName(name)
        .on('error', () => (res.headersSent ? res.end() : res.status(404).end()))
        .pipe(res);
    }
    const file = path.join(UPLOAD_DIR, name);
    const stat = await fs.stat(file);
    res.set({ ...headers, 'Content-Length': String(stat.size) });
    return createReadStream(file).pipe(res);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Photo read failed:', err.message);
    return res.headersSent ? res.end() : res.status(404).end();
  }
}

/** Delete uploaded photos no longer used anywhere (older than 1 hour, so fresh uploads are safe). */
export async function cleanupUploads() {
  try {
    const used = JSON.stringify(await readContent());
    const cutoff = Date.now() - 60 * 60 * 1000;
    if (USE_MONGO) {
      const { bucket } = await getMongo();
      const files = await bucket.find({}).toArray();
      for (const f of files) {
        if (!used.includes(`/uploads/${f.filename}`) && new Date(f.uploadDate).getTime() < cutoff) await bucket.delete(f._id);
      }
      return;
    }
    const files = await fs.readdir(UPLOAD_DIR);
    await Promise.all(
      files.map(async f => {
        if (used.includes(`/uploads/${f}`)) return;
        const stat = await fs.stat(path.join(UPLOAD_DIR, f));
        if (stat.mtimeMs < cutoff) await fs.unlink(path.join(UPLOAD_DIR, f));
      })
    );
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Upload cleanup failed:', err.message);
  }
}

/* ---------------- Auth ---------------- */

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
// If ADMIN_TOKEN_SECRET is not set, a random secret is used (sessions end when the server restarts).
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

const sha = v => crypto.createHash('sha256').update(String(v)).digest();
const sign = data => crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('base64url');

export function adminConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

export function checkCredentials(username, password) {
  if (!adminConfigured()) return false;
  const userOk = crypto.timingSafeEqual(sha(username), sha(process.env.ADMIN_USERNAME));
  const passOk = crypto.timingSafeEqual(sha(password), sha(process.env.ADMIN_PASSWORD));
  return userOk && passOk;
}

export function issueToken(username) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export function requireAdmin(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Your admin session has expired. Please log in again.' });
  }
  req.admin = session;
  return next();
}
