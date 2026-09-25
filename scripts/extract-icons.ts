// Recorta public/iconos.svg (una sola hoja con los 21 iconos hechos a mano)
// en un SVG suelto por icono (public/icons/*.svg) y un componente React por
// icono (src/components/icons/*.tsx), listo para sustituir al lucide-react
// equivalente. Ejecutar de nuevo solo si se actualiza public/iconos.svg:
//
//   npx tsx scripts/extract-icons.ts
//
// El mapeo de qué <path>/<circle> (por orden de aparición en el documento)
// pertenece a qué icono está hardcodeado en ICONS de abajo -- se hizo a mano
// comparando la posición de cada trazo con la cuadrícula de referencia que
// dio el usuario. Si se vuelve a generar iconos.svg desde cero (con otro
// orden de trazos), este mapeo hay que rehacerlo.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const SRC = path.join(__dirname, "..", "public", "iconos.svg");
const SVG_OUT_DIR = path.join(__dirname, "..", "public", "icons");
const COMPONENT_OUT_DIR = path.join(__dirname, "..", "src", "components", "icons");

type Elem = { tag: "path"; d: string } | { tag: "circle"; cx: number; cy: number; r: number };

function extractElements(svg: string): Elem[] {
  const elements: Elem[] = [];
  const tagRegex = /<(path|circle)\b([^>]*)\/>/g;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(svg))) {
    const [, tag, attrs] = match;
    if (tag === "path") {
      const d = /d="([^"]*)"/.exec(attrs)?.[1];
      if (!d) throw new Error("path sin d");
      elements.push({ tag: "path", d });
    } else {
      const cx = Number(/cx="([^"]*)"/.exec(attrs)?.[1]);
      const cy = Number(/cy="([^"]*)"/.exec(attrs)?.[1]);
      const r = Number(/r="([^"]*)"/.exec(attrs)?.[1]);
      elements.push({ tag: "circle", cx, cy, r });
    }
  }
  return elements;
}

type BBox = { minX: number; minY: number; maxX: number; maxY: number };

function bboxOfPath(d: string): BBox {
  const tokens = d.match(/[MLCSZHVmlcszhv]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  const box: BBox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  function visit(x: number, y: number) {
    if (x < box.minX) box.minX = x;
    if (y < box.minY) box.minY = y;
    if (x > box.maxX) box.maxX = x;
    if (y > box.maxY) box.maxY = y;
  }
  function num() {
    return Number(tokens[i++]);
  }
  function isNumberToken(tok: string | undefined) {
    return tok !== undefined && !/^[A-Za-z]$/.test(tok);
  }
  while (i < tokens.length) {
    const cmd = tokens[i++];
    switch (cmd) {
      case "M":
        cx = num();
        cy = num();
        startX = cx;
        startY = cy;
        visit(cx, cy);
        while (i < tokens.length && isNumberToken(tokens[i])) {
          cx = num();
          cy = num();
          visit(cx, cy);
        }
        break;
      case "m":
        cx += num();
        cy += num();
        startX = cx;
        startY = cy;
        visit(cx, cy);
        while (i < tokens.length && isNumberToken(tokens[i])) {
          cx += num();
          cy += num();
          visit(cx, cy);
        }
        break;
      case "L":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          cx = num();
          cy = num();
          visit(cx, cy);
        }
        break;
      case "l":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          cx += num();
          cy += num();
          visit(cx, cy);
        }
        break;
      case "C":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          const x1 = num();
          const y1 = num();
          const x2 = num();
          const y2 = num();
          cx = num();
          cy = num();
          visit(x1, y1);
          visit(x2, y2);
          visit(cx, cy);
        }
        break;
      case "c":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          const x1 = cx + num();
          const y1 = cy + num();
          const x2 = cx + num();
          const y2 = cy + num();
          cx += num();
          cy += num();
          visit(x1, y1);
          visit(x2, y2);
          visit(cx, cy);
        }
        break;
      case "S":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          const x2 = num();
          const y2 = num();
          cx = num();
          cy = num();
          visit(x2, y2);
          visit(cx, cy);
        }
        break;
      case "s":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          const x2 = cx + num();
          const y2 = cy + num();
          cx += num();
          cy += num();
          visit(x2, y2);
          visit(cx, cy);
        }
        break;
      case "H":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          cx = num();
          visit(cx, cy);
        }
        break;
      case "h":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          cx += num();
          visit(cx, cy);
        }
        break;
      case "V":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          cy = num();
          visit(cx, cy);
        }
        break;
      case "v":
        while (i < tokens.length && isNumberToken(tokens[i])) {
          cy += num();
          visit(cx, cy);
        }
        break;
      case "Z":
      case "z":
        cx = startX;
        cy = startY;
        break;
      default:
        throw new Error(`Comando de path no soportado: "${cmd}" en "${d}"`);
    }
  }
  return box;
}

function unionBBox(boxes: BBox[]): BBox {
  return boxes.reduce((acc, box) => ({
    minX: Math.min(acc.minX, box.minX),
    minY: Math.min(acc.minY, box.minY),
    maxX: Math.max(acc.maxX, box.maxX),
    maxY: Math.max(acc.maxY, box.maxY),
  }));
}

// Índices (0-based, orden de aparición en el documento) -> icono.
const ICONS: { name: string; indices: number[] }[] = [
  { name: "Loader2Icon", indices: [0, 1, 2, 3, 4, 5, 6, 7] },
  { name: "PlusIcon", indices: [8] },
  { name: "ChevronLeftIcon", indices: [9] },
  { name: "HeartIcon", indices: [10] },
  { name: "XIcon", indices: [11] },
  { name: "CheckIcon", indices: [12] },
  { name: "ChevronDownIcon", indices: [13] },
  { name: "ShoppingBagIcon", indices: [14] },
  { name: "ChevronRightIcon", indices: [15] },
  { name: "MinusIcon", indices: [16] },
  { name: "InfoIcon", indices: [17, 18, 19] },
  { name: "MenuIcon", indices: [20, 21, 22] },
  { name: "SquareIcon", indices: [23] },
  { name: "CircleCheckIcon", indices: [24, 25] },
  { name: "UserIcon", indices: [26, 27] },
  { name: "Grid2x2Icon", indices: [28, 29, 30, 31] },
  { name: "ChevronUpIcon", indices: [32] },
  { name: "OctagonXIcon", indices: [33, 34] },
  { name: "TriangleAlertIcon", indices: [35, 36, 37] },
  { name: "Grid3x3Icon", indices: [38, 39, 40, 41, 42, 43, 44, 45, 46] },
  { name: "ShoppingCartIcon", indices: [47, 48, 49] },
  { name: "ShieldIcon", indices: [50, 51] },
];

function kebabCase(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function main() {
  const svg = readFileSync(SRC, "utf-8");
  const elements = extractElements(svg);
  console.log(`Elementos encontrados: ${elements.length}`);

  const assigned = new Set(ICONS.flatMap((icon) => icon.indices));
  if (assigned.size !== elements.length) {
    throw new Error(
      `El mapeo cubre ${assigned.size} elementos pero el archivo tiene ${elements.length} -- revisa ICONS.`
    );
  }

  mkdirSync(SVG_OUT_DIR, { recursive: true });
  mkdirSync(COMPONENT_OUT_DIR, { recursive: true });

  const PADDING = 6;

  for (const icon of ICONS) {
    const els = icon.indices.map((i) => elements[i]);
    const boxes = els.map((el) =>
      el.tag === "path"
        ? bboxOfPath(el.d)
        : { minX: el.cx - el.r, minY: el.cy - el.r, maxX: el.cx + el.r, maxY: el.cy + el.r }
    );
    const box = unionBBox(boxes);
    const minX = Math.floor(box.minX - PADDING);
    const minY = Math.floor(box.minY - PADDING);
    const width = Math.ceil(box.maxX - box.minX) + PADDING * 2;
    const height = Math.ceil(box.maxY - box.minY) + PADDING * 2;

    const inner = els
      .map((el) =>
        el.tag === "path"
          ? `  <path d="${el.d}"/>`
          : `  <circle cx="${el.cx}" cy="${el.cy}" r="${el.r}"/>`
      )
      .join("\n");

    const viewBox = `${minX} ${minY} ${width} ${height}`;
    const kebab = kebabCase(icon.name);

    const standaloneSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">\n${inner}\n</svg>\n`;
    writeFileSync(path.join(SVG_OUT_DIR, `${kebab}.svg`), standaloneSvg);

    const component = `import { cn } from "@/lib/utils";

export function ${icon.name}({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="${viewBox}"
      fill="currentColor"
      className={cn("size-4", className)}
      {...props}
    >
${inner}
    </svg>
  );
}
`;
    writeFileSync(path.join(COMPONENT_OUT_DIR, `${kebab}.tsx`), component);

    console.log(`${icon.name}: ${els.length} elemento(s), viewBox="${viewBox}"`);
  }

  console.log(`\nGenerados ${ICONS.length} iconos en ${SVG_OUT_DIR} y ${COMPONENT_OUT_DIR}`);
}

main();
