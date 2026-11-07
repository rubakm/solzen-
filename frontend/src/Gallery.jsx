import { useEffect, useMemo, useRef, useState } from 'react';
import { mediaUrl } from './content';

/**
 * Full-screen photo viewer. Keyboard: ← → to browse, Esc to close.
 * photos: [{ src, caption, meta }]
 */
export function Lightbox({ photos, index, onClose, onIndex }) {
  const closeRef = useRef(null);
  const returnFocus = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const photo = photos[index];
  const many = photos.length > 1;

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusBack = returnFocus.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      focusBack?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (many && e.key === 'ArrowRight') onIndex((index + 1) % photos.length);
      if (many && e.key === 'ArrowLeft') onIndex((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, many, onClose, onIndex, photos.length]);

  // Basic swipe on touch screens
  const touch = useRef(null);
  const onTouchStart = e => (touch.current = e.touches[0].clientX);
  const onTouchEnd = e => {
    if (touch.current == null || !many) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 50) onIndex((index + (dx < 0 ? 1 : -1) + photos.length) % photos.length);
    touch.current = null;
  };

  if (!photo) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose} aria-label="Close photo viewer">
          ×
        </button>
        <figure className="lightbox-figure">
          <img src={photo.src} alt={photo.caption || 'SOLZEN photo'} />
          {(photo.caption || photo.meta || many) && (
            <figcaption>
              {photo.caption && <span className="lightbox-caption">{photo.caption}</span>}
              <span className="lightbox-meta">
                {photo.meta}
                {many && <span aria-live="polite">{`${photo.meta ? ' · ' : ''}${index + 1} / ${photos.length}`}</span>}
              </span>
            </figcaption>
          )}
        </figure>
        {many && (
          <>
            <button
              type="button"
              className="lightbox-nav lightbox-prev"
              onClick={() => onIndex((index - 1 + photos.length) % photos.length)}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="lightbox-nav lightbox-next"
              onClick={() => onIndex((index + 1) % photos.length)}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Photo strip under an update. */
export function UpdatePhotos({ images, title }) {
  const [open, setOpen] = useState(null);
  if (!images || images.length === 0) return null;
  const photos = images.map(src => ({ src: mediaUrl(src), caption: title }));
  const shown = images.slice(0, 4);
  return (
    <>
      <div className="update-photos">
        {shown.map((src, i) => (
          <button
            key={src}
            type="button"
            className="update-photo"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${images.length}: ${title}`}
          >
            <img src={mediaUrl(src)} alt="" loading="lazy" decoding="async" />
            {i === 3 && images.length > 4 && <span className="update-photo-more">+{images.length - 4}</span>}
          </button>
        ))}
      </div>
      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}

/** Gallery block shown below the updates. Renders nothing until photos are added in the admin panel. */
export default function Gallery({ items }) {
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(null);

  const events = useMemo(() => {
    const set = [];
    (items || []).forEach(it => it.event && !set.includes(it.event) && set.push(it.event));
    return set;
  }, [items]);

  const visible = useMemo(() => (items || []).filter(it => filter === 'All' || it.event === filter), [items, filter]);

  useEffect(() => {
    if (filter !== 'All' && !events.includes(filter)) setFilter('All');
  }, [events, filter]);

  if (!items || items.length === 0) return null;

  const photos = visible.map(it => ({
    src: mediaUrl(it.image),
    caption: it.caption,
    meta: [it.event, it.date].filter(Boolean).join(' · ')
  }));

  return (
    <div className="gallery" aria-labelledby="gallery-title">
      <div className="gallery-head">
        <div>
          <p className="kicker">Gallery</p>
          <h3 id="gallery-title">
            Moments from the <i>field.</i>
          </h3>
        </div>
        {events.length > 1 && (
          <div className="gallery-filters" role="group" aria-label="Filter photos by event">
            {['All', ...events].map(ev => (
              <button key={ev} type="button" className="gallery-chip" aria-pressed={filter === ev} onClick={() => setFilter(ev)}>
                {ev}
              </button>
            ))}
          </div>
        )}
      </div>

      <ul className="gallery-grid">
        {visible.map((it, i) => (
          <li key={it.id || it.image} className="gallery-item">
            <button type="button" onClick={() => setOpen(i)} aria-label={`Open photo${it.caption ? `: ${it.caption}` : ''}`}>
              <img src={mediaUrl(it.image)} alt={it.caption || ''} loading="lazy" decoding="async" />
              {(it.caption || it.event) && (
                <span className="gallery-overlay" aria-hidden="true">
                  {it.event && <span className="gallery-event">{it.event}</span>}
                  {it.caption && <span className="gallery-caption">{it.caption}</span>}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}
