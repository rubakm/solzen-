import { useEffect, useRef, useState } from 'react';
import { SOCIAL_PLATFORMS, getApiBase, mediaUrl } from './content';
import './admin.css';

/**
 * SOLZEN admin panel.
 * Open with Ctrl + Alt + A (or solzen.in/#admin). Login is checked by the backend;
 * nothing secret lives in this file.
 */

const TOKEN_KEY = 'solzen-admin-token';

const SECTIONS = {
  updates: {
    label: 'Updates',
    hint: 'News and milestones shown under “News & Updates”. Newest first.',
    itemName: 'update',
    blank: () => ({ date: '', tag: '', title: '', desc: '', images: [] }),
    summary: it => it.title || 'Untitled update',
    thumb: it => (it.images && it.images[0]) || '',
    fields: [
      { key: 'date', label: 'Date', placeholder: 'November 2026', half: true, required: true },
      { key: 'tag', label: 'Tag', placeholder: 'Milestone', half: true },
      { key: 'title', label: 'Title', placeholder: 'What happened', required: true },
      { key: 'desc', label: 'Description', type: 'textarea', placeholder: 'One or two sentences' },
      { key: 'images', label: 'Photos (up to 6)', type: 'photos', max: 6 }
    ]
  },
  team: {
    label: 'Team',
    hint: 'People shown in “The people behind SOLZEN”, in this order.',
    itemName: 'team member',
    blank: () => ({ name: '', role: '', initials: '', bio: '', linkedin: '', photo: '' }),
    summary: it => (it.name ? `${it.name}${it.role ? ` · ${it.role}` : ''}` : 'New team member'),
    fields: [
      { key: 'photo', label: 'Photo', type: 'photo', size: 480 },
      { key: 'name', label: 'Full name', placeholder: 'Name', half: true, required: true },
      { key: 'role', label: 'Role', placeholder: 'Founder & CEO', half: true, required: true },
      { key: 'initials', label: 'Initials (if no photo)', placeholder: 'Auto from name', half: true },
      { key: 'linkedin', label: 'LinkedIn link', placeholder: 'https://www.linkedin.com/in/…', half: true },
      { key: 'bio', label: 'Short bio', type: 'textarea', placeholder: 'One or two sentences' }
    ]
  },
  insights: {
    label: 'Insights',
    hint: 'Articles shown under “Insights & Ideas”. Add a link once an article is published.',
    itemName: 'article',
    blank: () => ({ title: '', subtitle: '', tag: '', time: '', link: '' }),
    summary: it => it.title || 'Untitled article',
    fields: [
      { key: 'title', label: 'Title', placeholder: 'Article title', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'One line about the article' },
      { key: 'tag', label: 'Tag', placeholder: 'Perspective', half: true },
      { key: 'time', label: 'Read time', placeholder: '5 min read', half: true },
      { key: 'link', label: 'Link to article (optional)', placeholder: 'https://…' }
    ]
  },
  gallery: {
    label: 'Gallery',
    hint: 'Photos shown in the gallery below the updates. Use the same Event name to group photos (e.g. Classroom Connect).',
    itemName: 'photos',
    addLabel: '+ Upload photos',
    upload: true,
    blank: () => ({ image: '', caption: '', event: '', date: '' }),
    summary: it => it.caption || it.event || 'Photo without caption',
    thumb: it => it.image,
    fields: [
      { key: 'image', label: 'Photo', type: 'photo', size: 1600, required: true },
      { key: 'caption', label: 'Caption', placeholder: 'Students exploring fractions with 3D models' },
      { key: 'event', label: 'Event', placeholder: 'Classroom Connect', half: true, list: 'admin-events' },
      { key: 'date', label: 'Date', placeholder: 'November 2026', half: true }
    ]
  },
  socials: {
    label: 'Social links',
    hint: 'Icons shown under “Follow SOLZEN” in the footer.',
    itemName: 'social link',
    blank: () => ({ platform: 'instagram', url: '' }),
    summary: it => `${SOCIAL_PLATFORMS[it.platform]?.label || it.platform}${it.url ? ` · ${it.url.replace(/^https?:\/\/(www\.)?|^mailto:/, '')}` : ''}`,
    fields: [
      { key: 'platform', label: 'Platform', type: 'platform', half: true },
      { key: 'url', label: 'Link', placeholder: 'https://instagram.com/solzen', half: true, required: true }
    ]
  }
};

const clone = v => JSON.parse(JSON.stringify(v || []));

// Friendly link clean-up: "linkedin.com/in/x" → "https://linkedin.com/in/x", "info@solzen.in" → "mailto:info@solzen.in"
const fixLink = v => {
  const s = (v || '').trim();
  if (!s || /^(https?:|mailto:)/i.test(s)) return s;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return `mailto:${s}`;
  return `https://${s.replace(/^\/+/, '')}`;
};

const normalise = (section, items) =>
  items.map(it => {
    if (section === 'team') return { ...it, linkedin: fixLink(it.linkedin) };
    if (section === 'insights') return { ...it, link: fixLink(it.link) };
    if (section === 'socials') return { ...it, url: fixLink(it.url) };
    return it;
  });

// Resize an uploaded photo to a small square-ish JPEG so it stays light
function resizeImage(file, max = 1600) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'));
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('That image could not be read.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('That image could not be read.'));
    reader.readAsDataURL(file);
  });
}

async function api(path, { token, ...opts } = {}) {
  const base = getApiBase();
  if (!base) throw new Error('No backend configured (VITE_API_URL).');
  let res;
  try {
    res = await fetch(`${base}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {})
      }
    });
  } catch {
    throw new Error(`Can't reach the backend at ${base}. Is it running?`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data.error || `Request failed (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function readToken() {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function writeToken(t) {
  try {
    if (t) window.sessionStorage.setItem(TOKEN_KEY, t);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: session lasts until the panel closes */
  }
}

/* ======================================================================== */

export default function AdminPanel({ content, onSaved, onClose }) {
  const [token, setToken] = useState(readToken);
  const [checking, setChecking] = useState(Boolean(readToken()));

  // Validate a remembered session
  useEffect(() => {
    if (!token) return;
    api('/api/admin/session', { token })
      .catch(() => {
        writeToken('');
        setToken('');
      })
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    writeToken('');
    setToken('');
  };

  return (
    <div className="admin-overlay" role="dialog" aria-modal="true" aria-label="SOLZEN admin">
      {checking ? (
        <div className="admin-login-card">
          <p className="admin-muted">Checking your session…</p>
        </div>
      ) : token ? (
        <Editor
          token={token}
          content={content}
          onSaved={onSaved}
          onClose={onClose}
          onLogout={logout}
          onExpired={logout}
        />
      ) : (
        <Login
          onClose={onClose}
          onLogin={t => {
            writeToken(t);
            setToken(t);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Login ---------------- */

function Login({ onLogin, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current?.focus();
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async e => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="admin-login-card" onSubmit={submit}>
      <button type="button" className="admin-x" onClick={onClose} aria-label="Close admin">
        ×
      </button>
      <img src="/solzen-mark.png" alt="" width="44" height="44" className="admin-login-logo" />
      <h2>SOLZEN Admin</h2>
      <p className="admin-muted">Sign in to edit updates, team, insights and social links.</p>

      <label className="admin-field">
        <span>Username</span>
        <input ref={userRef} value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required />
      </label>
      <label className="admin-field">
        <span>Password</span>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
      </label>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <button type="submit" className="admin-btn admin-btn-primary admin-btn-block" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="admin-hint">Shortcut: Ctrl + Alt + A</p>
    </form>
  );
}

/* ---------------- Editor ---------------- */

function Editor({ token, content, onSaved, onClose, onLogout, onExpired }) {
  const [tab, setTab] = useState('updates');
  const [drafts, setDrafts] = useState(() => ({
    updates: clone(content.updates),
    team: clone(content.team),
    insights: clone(content.insights),
    gallery: clone(content.gallery),
    socials: clone(content.socials)
  }));
  const [uploading, setUploading] = useState(0);
  const galleryInput = useRef(null);

  // Upload one image file; returns its /uploads/... path
  const uploadFile = async (file, size) => {
    const dataUrl = await resizeImage(file, size);
    setUploading(n => n + 1);
    try {
      const data = await api('/api/admin/upload', { method: 'POST', token, body: JSON.stringify({ image: dataUrl }) });
      return data.url;
    } catch (err) {
      if (err.status === 401) onExpired();
      throw err;
    } finally {
      setUploading(n => n - 1);
    }
  };

  const addGalleryPhotos = async files => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const lastEvent = [...drafts.gallery].reverse().find(g => g.event)?.event || '';
    setStatus({ type: '', text: `Uploading ${list.length} photo${list.length > 1 ? 's' : ''}…` });
    const added = [];
    for (const f of list) {
      try {
        const url = await uploadFile(f, 1600);
        added.push({ image: url, caption: '', event: lastEvent, date: '' });
      } catch (err) {
        setStatus({ type: 'error', text: `${f.name}: ${err.message}` });
      }
    }
    if (added.length) {
      setDrafts(d => ({ ...d, gallery: [...added, ...d.gallery] }));
      setOpenIndex(0);
      setStatus({ type: '', text: `${added.length} photo${added.length > 1 ? 's' : ''} uploaded. Add captions, then save.` });
    }
  };
  const [saved, setSaved] = useState(() => JSON.stringify(drafts));
  const [openIndex, setOpenIndex] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const savedObj = JSON.parse(saved);
  const dirty = s => JSON.stringify(drafts[s]) !== JSON.stringify(savedObj[s]);
  const anyDirty = Object.keys(SECTIONS).some(dirty);

  const requestClose = () => (anyDirty ? setConfirmClose(true) : onClose());

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && requestClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const cfg = SECTIONS[tab];
  const items = drafts[tab];

  const setItems = next => setDrafts(d => ({ ...d, [tab]: next }));
  const update = (i, key, value) => setItems(items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    setOpenIndex(openIndex === i ? j : openIndex === j ? i : openIndex);
  };
  const remove = i => {
    setItems(items.filter((_, idx) => idx !== i));
    setConfirmDelete(null);
    setOpenIndex(null);
  };
  const add = () => {
    const next = tab === 'updates' ? [cfg.blank(), ...items] : [...items, cfg.blank()];
    setItems(next);
    setOpenIndex(tab === 'updates' ? 0 : next.length - 1);
    setStatus({ type: '', text: '' });
  };

  const switchTab = t => {
    setTab(t);
    setOpenIndex(null);
    setConfirmDelete(null);
    setStatus({ type: '', text: '' });
  };

  const save = async () => {
    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      const data = await api(`/api/admin/content/${tab}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ items: normalise(tab, items) })
      });
      const clean = data.content[tab];
      onSaved(data.content);
      setDrafts(d => ({ ...d, [tab]: clone(clean) }));
      setSaved(s => JSON.stringify({ ...JSON.parse(s), [tab]: clean }));
      setStatus({ type: 'success', text: `${cfg.label} saved. The website now shows your changes.` });
    } catch (err) {
      if (err.status === 401) {
        onExpired();
        return;
      }
      setStatus({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const discard = () => {
    setDrafts(d => ({ ...d, [tab]: clone(savedObj[tab]) }));
    setOpenIndex(null);
    setStatus({ type: '', text: '' });
  };

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div className="admin-brand">
          <img src="/solzen-mark.png" alt="" width="30" height="30" />
          <span>SOLZEN Admin</span>
        </div>
        <div className="admin-top-actions">
          <button type="button" className="admin-btn admin-btn-ghost-dark" onClick={onLogout}>
            Log out
          </button>
          <button type="button" className="admin-x admin-x-dark" onClick={requestClose} aria-label="Close admin">
            ×
          </button>
        </div>
      </header>

      <nav className="admin-tabs" role="tablist" aria-label="Content sections">
        {Object.entries(SECTIONS).map(([key, s]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`admin-tab ${tab === key ? 'is-active' : ''}`}
            onClick={() => switchTab(key)}
          >
            {s.label}
            <span className="admin-count">{drafts[key].length}</span>
            {dirty(key) && <i className="admin-dot" title="Unsaved changes" />}
          </button>
        ))}
      </nav>

      <main className="admin-body">
        <div className="admin-section-head">
          <p className="admin-muted">{cfg.hint}</p>
          {cfg.upload ? (
            <>
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => galleryInput.current?.click()} disabled={uploading > 0}>
                {uploading > 0 ? 'Uploading…' : cfg.addLabel}
              </button>
              <input
                ref={galleryInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                hidden
                onChange={e => {
                  const files = e.target.files;
                  addGalleryPhotos(files).finally(() => {
                    e.target.value = '';
                  });
                }}
              />
            </>
          ) : (
            <button type="button" className="admin-btn admin-btn-outline" onClick={add}>
              + Add {cfg.itemName}
            </button>
          )}
        </div>

        {tab === 'gallery' && (
          <datalist id="admin-events">
            {[...new Set(drafts.gallery.map(g => g.event).filter(Boolean))].map(ev => (
              <option key={ev} value={ev} />
            ))}
          </datalist>
        )}
        {items.length === 0 && <p className="admin-empty">Nothing here yet. Use “Add {cfg.itemName}” to create one.</p>}

        <ol className="admin-list">
          {items.map((it, i) => {
            const open = openIndex === i;
            return (
              <li key={it.id || `new-${i}`} className={`admin-item ${open ? 'is-open' : ''}`}>
                <div className="admin-item-head">
                  <button type="button" className="admin-item-title" onClick={() => setOpenIndex(open ? null : i)} aria-expanded={open}>
                    {tab === 'team' && (
                      <span className="admin-avatar">
                        {it.photo ? <img src={mediaUrl(it.photo)} alt="" /> : (it.initials || it.name?.split(/\s+/).map(w => w[0]).join('').slice(0, 2) || '?').toUpperCase()}
                      </span>
                    )}
                    {cfg.thumb && cfg.thumb(it) && (
                      <span className="admin-thumb">
                        <img src={mediaUrl(cfg.thumb(it))} alt="" />
                      </span>
                    )}
                    <span className="admin-item-text">{cfg.summary(it)}</span>
                    <span className="admin-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
                  </button>
                  <div className="admin-item-tools">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" title="Move up">↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" title="Move down">↓</button>
                    {confirmDelete === i ? (
                      <>
                        <button type="button" className="admin-danger" onClick={() => remove(i)}>Delete</button>
                        <button type="button" onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setConfirmDelete(i)} aria-label="Delete" title="Delete">🗑</button>
                    )}
                  </div>
                </div>

                {open && (
                  <div className="admin-fields">
                    {cfg.fields.map(f => (
                      <Field
                        key={f.key}
                        field={f}
                        value={it[f.key] || (f.type === 'photos' ? [] : '')}
                        onChange={v => update(i, f.key, v)}
                        uploadFile={uploadFile}
                      />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </main>

      <footer className="admin-bar">
        <div className="admin-bar-status" aria-live="polite">
          {status.text ? (
            <span className={`admin-status ${status.type}`}>{status.text}</span>
          ) : dirty(tab) ? (
            <span className="admin-status pending">Unsaved changes in {cfg.label}</span>
          ) : (
            <span className="admin-muted">All changes saved</span>
          )}
        </div>
        <div className="admin-bar-actions">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={discard} disabled={!dirty(tab) || busy}>
            Discard
          </button>
          <button type="button" className="admin-btn admin-btn-primary" onClick={save} disabled={!dirty(tab) || busy || uploading > 0}>
            {busy ? 'Saving…' : `Save ${cfg.label}`}
          </button>
        </div>
      </footer>

      {confirmClose && (
        <div className="admin-confirm" role="alertdialog" aria-label="Unsaved changes">
          <div className="admin-confirm-card">
            <h3>You have unsaved changes</h3>
            <p className="admin-muted">Close the admin panel and lose them?</p>
            <div className="admin-bar-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setConfirmClose(false)}>Keep editing</button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={onClose}>Discard and close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Field ---------------- */

function Field({ field, value, onChange, uploadFile }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const cls = `admin-field ${field.half ? 'is-half' : ''}`;

  const pick = async (files, multi) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setError('');
    setBusy(true);
    try {
      if (multi) {
        const room = (field.max || 6) - value.length;
        if (room <= 0) throw new Error(`You can add up to ${field.max} photos.`);
        const urls = [];
        for (const f of list.slice(0, room)) urls.push(await uploadFile(f, field.size || 1600));
        onChange([...value, ...urls]);
        if (list.length > room) setError(`Only ${room} more photo${room === 1 ? '' : 's'} could be added (max ${field.max}).`);
      } else {
        onChange(await uploadFile(list[0], field.size || 1600));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fileInput = multi => (
    <input
      ref={fileRef}
      type="file"
      accept="image/png,image/jpeg,image/webp"
      multiple={multi}
      hidden
      onChange={e => {
        const files = e.target.files;
        pick(files, multi).finally(() => {
          e.target.value = '';
        });
      }}
    />
  );

  if (field.type === 'photos') {
    return (
      <div className="admin-field admin-photo-field">
        <span>{field.label}</span>
        <div className="admin-photos">
          {value.map((src, idx) => (
            <div key={src} className="admin-photos-item">
              <img src={mediaUrl(src)} alt={`Photo ${idx + 1}`} />
              <button type="button" onClick={() => onChange(value.filter(v => v !== src))} aria-label={`Remove photo ${idx + 1}`}>
                ×
              </button>
            </div>
          ))}
          {value.length < (field.max || 6) && (
            <button type="button" className="admin-photos-add" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? 'Uploading…' : '+ Add photos'}
            </button>
          )}
          {fileInput(true)}
        </div>
        {error && <p className="admin-error">{error}</p>}
      </div>
    );
  }

  if (field.type === 'photo') {
    return (
      <div className="admin-field admin-photo-field">
        <span>
          {field.label}
          {field.required && <b aria-hidden="true"> *</b>}
        </span>
        <div className="admin-photo-row">
          <div className={`admin-photo-preview ${field.size > 600 ? 'is-wide' : ''}`}>
            {value ? <img src={mediaUrl(value)} alt="Preview" /> : <em>No photo</em>}
          </div>
          <div className="admin-photo-actions">
            <button type="button" className="admin-btn admin-btn-outline" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
            </button>
            {value && !field.required && (
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onChange('')}>
                Remove
              </button>
            )}
            {fileInput(false)}
            <small className="admin-muted">Resized automatically before upload.</small>
          </div>
        </div>
        {error && <p className="admin-error">{error}</p>}
      </div>
    );
  }

  if (field.type === 'platform') {
    return (
      <label className={cls}>
        <span>{field.label}</span>
        <select value={value} onChange={e => onChange(e.target.value)}>
          {Object.entries(SOCIAL_PLATFORMS).map(([key, p]) => (
            <option key={key} value={key}>{p.label}</option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className={cls}>
      <span>
        {field.label}
        {field.required && <b aria-hidden="true"> *</b>}
      </span>
      {field.type === 'textarea' ? (
        <textarea rows="3" value={value} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} />
      ) : (
        <input value={value} placeholder={field.placeholder} list={field.list} onChange={e => onChange(e.target.value)} />
      )}
    </label>
  );
}
