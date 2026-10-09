/**
 * FractionShape.jsx
 *
 * Renders mathematical fraction shapes as crisp, accessible SVGs.
 * Accepts: shapeType, totalParts, coloredParts, colorScheme
 *
 * Supported shape types:
 *   'circle'    — Circle divided into equal sectors
 *   'pizza'     — Circle with thicker borders and a slice highlight style
 *   'rectangle' — Rectangle divided into equal columns
 *   'strip'     — Horizontal fraction strip divided into equal segments
 *   'grid'      — Square divided into a grid of equal cells
 *
 * All shapes use SVG for precise, scalable rendering.
 * Colors: filled = indigo/violet; empty = light gray
 */

// ─── Color palettes ────────────────────────────────────────────────────────────
const PALETTES = {
  default: { fill: '#6366f1', stroke: '#4f46e5', empty: '#e2e8f0', emptyStroke: '#cbd5e1' },
  emerald: { fill: '#10b981', stroke: '#059669', empty: '#dcfce7', emptyStroke: '#a7f3d0' },
  amber:   { fill: '#f59e0b', stroke: '#d97706', empty: '#fef3c7', emptyStroke: '#fde68a' },
  rose:    { fill: '#f43f5e', stroke: '#e11d48', empty: '#ffe4e6', emptyStroke: '#fecdd3' },
  blue:    { fill: '#3b82f6', stroke: '#2563eb', empty: '#dbeafe', emptyStroke: '#bfdbfe' },
};

// ─── Circle / Pizza ────────────────────────────────────────────────────────────
function CircleOrPizzaShape({ totalParts, coloredParts, palette, isPizza }) {
  const cx = 100;
  const cy = 100;
  const r  = 82;
  const size = 200;

  // Generate sectors
  const anglePerSlice = (2 * Math.PI) / totalParts;
  const startAngleOffset = -Math.PI / 2; // Start from top (12 o'clock)

  const sectors = [];
  for (let i = 0; i < totalParts; i++) {
    const startAngle = startAngleOffset + i * anglePerSlice;
    const endAngle   = startAngle + anglePerSlice;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = anglePerSlice > Math.PI ? 1 : 0;

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1.toFixed(3)} ${y1.toFixed(3)}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`,
      'Z',
    ].join(' ');

    const isColored = i < coloredParts;
    sectors.push({ d, isColored });
  }

  const strokeW = isPizza ? 2.5 : 1.8;
  const outerStrokeW = isPizza ? 3.5 : 2.5;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full"
      aria-label={`Shape divided into ${totalParts} equal parts with ${coloredParts} colored`}
      role="img"
    >
      {/* Outer circle background */}
      <circle cx={cx} cy={cy} r={r} fill={palette.empty} stroke={palette.emptyStroke} strokeWidth={outerStrokeW} />

      {/* Sectors */}
      {sectors.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.isColored ? palette.fill : palette.empty}
          stroke={palette.stroke}
          strokeWidth={strokeW}
          strokeLinejoin="round"
          style={{ transition: 'fill 0.3s ease' }}
        />
      ))}

      {/* Pizza crust ring on top */}
      {isPizza && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={palette.stroke}
          strokeWidth={outerStrokeW + 1}
          opacity={0.35}
        />
      )}
    </svg>
  );
}

// ─── Rectangle ────────────────────────────────────────────────────────────────
function RectangleShape({ totalParts, coloredParts, palette }) {
  const width  = 240;
  const height = 140;
  const partW  = width / totalParts;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      aria-label={`Rectangle divided into ${totalParts} equal parts with ${coloredParts} colored`}
      role="img"
    >
      {Array.from({ length: totalParts }, (_, i) => (
        <rect
          key={i}
          x={i * partW}
          y={0}
          width={partW}
          height={height}
          fill={i < coloredParts ? palette.fill : palette.empty}
          stroke={palette.stroke}
          strokeWidth={1.5}
          style={{ transition: 'fill 0.3s ease' }}
        />
      ))}
    </svg>
  );
}

// ─── Fraction Strip ────────────────────────────────────────────────────────────
function StripShape({ totalParts, coloredParts, palette }) {
  const width   = 280;
  const height  = 72;
  const partW   = width / totalParts;
  const radius  = 6;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      aria-label={`Fraction strip with ${totalParts} equal segments, ${coloredParts} colored`}
      role="img"
    >
      {/* Background strip */}
      <rect x={0} y={0} width={width} height={height} rx={radius} ry={radius} fill={palette.empty} stroke={palette.emptyStroke} strokeWidth={1.5} />

      {/* Colored segment(s) */}
      {coloredParts > 0 && (
        <rect
          x={0}
          y={0}
          width={coloredParts * partW}
          height={height}
          rx={radius}
          ry={radius}
          fill={palette.fill}
          style={{ transition: 'width 0.4s ease' }}
        />
      )}

      {/* Dividers */}
      {Array.from({ length: totalParts - 1 }, (_, i) => (
        <line
          key={i}
          x1={(i + 1) * partW}
          y1={0}
          x2={(i + 1) * partW}
          y2={height}
          stroke={palette.stroke}
          strokeWidth={1.5}
          opacity={0.7}
        />
      ))}

      {/* Border */}
      <rect x={0} y={0} width={width} height={height} rx={radius} ry={radius} fill="none" stroke={palette.stroke} strokeWidth={2} />
    </svg>
  );
}

// ─── Square Grid ───────────────────────────────────────────────────────────────
function GridShape({ totalParts, coloredParts, palette }) {
  // Compute best grid layout: closest to square
  let cols = Math.ceil(Math.sqrt(totalParts));
  let rows = Math.ceil(totalParts / cols);
  if (cols * rows < totalParts) rows++;

  const cellSize = 42;
  const gap      = 3;
  const width    = cols * cellSize + (cols - 1) * gap;
  const height   = rows * cellSize + (rows - 1) * gap;
  const rx       = 6;

  const cells = [];
  for (let i = 0; i < totalParts; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    cells.push({
      x: col * (cellSize + gap),
      y: row * (cellSize + gap),
      colored: i < coloredParts,
    });
  }

  return (
    <svg
      viewBox={`-2 -2 ${width + 4} ${height + 4}`}
      className="w-full h-full"
      aria-label={`Grid of ${totalParts} equal cells with ${coloredParts} colored`}
      role="img"
    >
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.x}
          y={cell.y}
          width={cellSize}
          height={cellSize}
          rx={rx}
          ry={rx}
          fill={cell.colored ? palette.fill : palette.empty}
          stroke={palette.stroke}
          strokeWidth={1.5}
          style={{ transition: 'fill 0.3s ease' }}
        />
      ))}
    </svg>
  );
}

// ─── Main FractionShape component ─────────────────────────────────────────────
/**
 * FractionShape — renders the correct SVG shape for a fraction question.
 *
 * Props:
 *   shapeType    — 'circle' | 'pizza' | 'rectangle' | 'strip' | 'grid'
 *   totalParts   — integer ≥ 2
 *   coloredParts — integer ≥ 1, < totalParts
 *   colorScheme  — optional: 'default' | 'emerald' | 'amber' | 'rose' | 'blue'
 */
export default function FractionShape({ shapeType = 'circle', totalParts = 4, coloredParts = 1, colorScheme = 'default' }) {
  // Validate props
  const safeParts   = Math.max(2, Math.min(20, Math.round(totalParts)));
  const safeColored = Math.max(1, Math.min(safeParts - 1, Math.round(coloredParts)));
  const palette     = PALETTES[colorScheme] || PALETTES.default;

  return (
    <div className="flex items-center justify-center w-full max-w-xs mx-auto" style={{ aspectRatio: shapeType === 'grid' ? '1.2/1' : shapeType === 'strip' ? '4/1' : '1/1', minHeight: '130px', maxHeight: '200px' }}>
      {shapeType === 'circle' && (
        <CircleOrPizzaShape totalParts={safeParts} coloredParts={safeColored} palette={palette} isPizza={false} />
      )}
      {shapeType === 'pizza' && (
        <CircleOrPizzaShape totalParts={safeParts} coloredParts={safeColored} palette={palette} isPizza={true} />
      )}
      {shapeType === 'rectangle' && (
        <RectangleShape totalParts={safeParts} coloredParts={safeColored} palette={palette} />
      )}
      {shapeType === 'strip' && (
        <StripShape totalParts={safeParts} coloredParts={safeColored} palette={palette} />
      )}
      {shapeType === 'grid' && (
        <GridShape totalParts={safeParts} coloredParts={safeColored} palette={palette} />
      )}
    </div>
  );
}
