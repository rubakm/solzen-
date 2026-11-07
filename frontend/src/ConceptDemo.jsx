import { useEffect, useRef, useState } from 'react';

/**
 * About-section demo: the same idea, memorised vs. understood.
 * a² + b² = c² on a 3-4-5 triangle. In "Understand" mode the squares on the
 * two shorter sides fill cell by cell, then the same 9 + 16 cells fill the
 * square on the long side, so the rule becomes something you can count.
 * Auto-switches every few seconds until the visitor picks a mode.
 */

const U = 22; // one unit in SVG px
const A = { x: 200, y: 250 }; // right angle
const B = { x: A.x, y: A.y - 3 * U }; // end of side a (3)
const C = { x: A.x + 4 * U, y: A.y }; // end of side b (4)
const N = { x: 3 * U, y: -4 * U }; // outward edge of the c² square (length 5)
const BC = { x: C.x - B.x, y: C.y - B.y };

const pts = list => list.map(p => `${p.x},${p.y}`).join(' ');

// Cells of the square on side a: left of AB
const cellsA = [];
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    cellsA.push({ x: A.x - 3 * U + c * U, y: B.y + r * U });
  }
}

// Cells of the square on side b: below AC
const cellsB = [];
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    cellsB.push({ x: A.x + c * U, y: A.y + r * U });
  }
}

// Cells of the square on the hypotenuse, as rotated quads
const cellsC = [];
for (let j = 0; j < 5; j++) {
  for (let i = 0; i < 5; i++) {
    const at = (ii, jj) => ({
      x: B.x + (ii / 5) * BC.x + (jj / 5) * N.x,
      y: B.y + (ii / 5) * BC.y + (jj / 5) * N.y
    });
    cellsC.push(pts([at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)]));
  }
}

export default function ConceptDemo() {
  const [mode, setMode] = useState('memorise');
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!auto || !inView || reduced) return undefined;
    const t = setTimeout(() => setMode(m => (m === 'memorise' ? 'understand' : 'memorise')), mode === 'memorise' ? 2600 : 6200);
    return () => clearTimeout(t);
  }, [auto, inView, mode]);

  const choose = m => {
    setAuto(false);
    setMode(m);
  };

  const understand = mode === 'understand';

  return (
    <figure ref={ref} className={`concept-demo ${understand ? 'is-understand' : 'is-memorise'}`}>
      <div className="concept-demo-top">
        <span className="concept-demo-label">One idea, two ways to learn it</span>
        <div className="concept-demo-toggle" role="group" aria-label="Learning mode">
          <button type="button" aria-pressed={!understand} onClick={() => choose('memorise')}>
            Memorise
          </button>
          <button type="button" aria-pressed={understand} onClick={() => choose('understand')}>
            Understand
          </button>
        </div>
      </div>

      <div className="concept-demo-stage">
        <svg viewBox="118 82 252 270" role="img" aria-label="Right triangle with squares on each side: 9 plus 16 squares equal 25 squares">
          {/* squares on a and b */}
          {cellsA.map((c, i) => (
            <rect key={`a${i}`} x={c.x} y={c.y} width={U} height={U} className="cell cell-a" style={{ transitionDelay: `${understand ? i * 40 : 0}ms` }} />
          ))}
          {cellsB.map((c, i) => (
            <rect key={`b${i}`} x={c.x} y={c.y} width={U} height={U} className="cell cell-b" style={{ transitionDelay: `${understand ? 360 + i * 30 : 0}ms` }} />
          ))}
          {/* square on c: first 9 cells gold, next 16 lime */}
          {cellsC.map((p, i) => (
            <polygon
              key={`c${i}`}
              points={p}
              className={`cell ${i < 9 ? 'cell-a' : 'cell-b'} cell-c`}
              style={{ transitionDelay: `${understand ? 1100 + i * 45 : 0}ms` }}
            />
          ))}

          {/* outlines */}
          <rect x={A.x - 3 * U} y={B.y} width={3 * U} height={3 * U} className="outline" />
          <rect x={A.x} y={A.y} width={4 * U} height={4 * U} className="outline" />
          <polygon points={pts([B, C, { x: C.x + N.x, y: C.y + N.y }, { x: B.x + N.x, y: B.y + N.y }])} className="outline" />
          <polygon points={pts([A, B, C])} className="triangle" />
          <path d={`M${A.x + 10},${A.y} V${A.y - 10} H${A.x}`} className="right-angle" />

          {/* side labels */}
          <text x={A.x - 1.5 * U} y={B.y + 1.5 * U + 5} className="sq-label">a²</text>
          <text x={A.x + 2 * U} y={A.y + 2 * U + 5} className="sq-label">b²</text>
          <text x={B.x + BC.x / 2 + N.x / 2} y={B.y + BC.y / 2 + N.y / 2 + 5} className="sq-label">c²</text>
        </svg>
      </div>

      <div className="concept-demo-equation" aria-live="polite">
        {understand ? (
          <>
            <span className="eq-a">9</span> + <span className="eq-b">16</span> = <span className="eq-c">25</span>
          </>
        ) : (
          <>a² + b² = c²</>
        )}
      </div>
      <figcaption className="concept-demo-caption">
        {understand
          ? 'Count the squares. The two small ones fill the big one exactly. Now the rule is something you can see.'
          : 'A rule to remember for the exam, and forget soon after.'}
      </figcaption>
    </figure>
  );
}
