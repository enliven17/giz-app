import type { AnimationObject } from "lottie-react-native";

type Point = readonly [number, number];

const glyphBlocks: readonly (readonly [Point, Point])[] = [
  // G
  [
    [48, 24],
    [44, 8],
  ],
  [
    [30, 48],
    [8, 56],
  ],
  [
    [48, 72],
    [44, 8],
  ],
  [
    [62, 58],
    [8, 28],
  ],
  [
    [56, 48],
    [20, 8],
  ],
  // I
  [
    [111, 24],
    [44, 8],
  ],
  [
    [111, 48],
    [8, 56],
  ],
  [
    [111, 72],
    [44, 8],
  ],
  // Z
  [
    [174, 24],
    [44, 8],
  ],
  [
    [174, 72],
    [44, 8],
  ],
  [
    [190, 32],
    [9, 9],
  ],
  [
    [182, 40],
    [9, 9],
  ],
  [
    [174, 48],
    [9, 9],
  ],
  [
    [166, 56],
    [9, 9],
  ],
  [
    [158, 64],
    [9, 9],
  ],
  // U
  [
    [224, 46],
    [8, 52],
  ],
  [
    [260, 46],
    [8, 52],
  ],
  [
    [242, 72],
    [44, 8],
  ],
];

function rectangle([x, y]: Point, [width, height]: Point) {
  return {
    ty: "rc",
    d: 1,
    s: { a: 0, k: [width, height] },
    p: { a: 0, k: [x, y] },
    r: { a: 0, k: 1 },
  };
}

const letterShapes = glyphBlocks.map(([position, size]) => rectangle(position, size));

function wordLayer(
  name: string,
  index: number,
  color: readonly [number, number, number, number],
  positions: readonly { t: number; s: readonly [number, number, number]; h: 1 }[],
  opacity: readonly { t: number; s: readonly [number]; h: 1 }[],
) {
  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 1, k: opacity },
      r: { a: 0, k: 0 },
      p: { a: 1, k: positions },
      a: { a: 0, k: [160, 48, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [
      ...letterShapes,
      { ty: "fl", c: { a: 0, k: color }, o: { a: 0, k: 100 }, r: 1, nm: `${name} fill` },
    ],
    ip: 0,
    op: 90,
    st: 0,
    bm: 0,
  };
}

const mainPositions = [
  { t: 0, s: [160, 48, 0], h: 1 },
  { t: 14, s: [160, 48, 0], h: 1 },
  { t: 15, s: [154, 48, 0], h: 1 },
  { t: 17, s: [164, 48, 0], h: 1 },
  { t: 19, s: [160, 48, 0], h: 1 },
  { t: 47, s: [160, 48, 0], h: 1 },
  { t: 48, s: [166, 48, 0], h: 1 },
  { t: 50, s: [157, 48, 0], h: 1 },
  { t: 52, s: [160, 48, 0], h: 1 },
  { t: 90, s: [160, 48, 0], h: 1 },
] as const;

const alwaysVisible = [
  { t: 0, s: [100], h: 1 },
  { t: 90, s: [100], h: 1 },
] as const;

const cyanOpacity = [
  { t: 0, s: [0], h: 1 },
  { t: 14, s: [0], h: 1 },
  { t: 15, s: [85], h: 1 },
  { t: 19, s: [0], h: 1 },
  { t: 47, s: [0], h: 1 },
  { t: 48, s: [80], h: 1 },
  { t: 53, s: [0], h: 1 },
  { t: 90, s: [0], h: 1 },
] as const;

const magentaOpacity = [
  { t: 0, s: [0], h: 1 },
  { t: 15, s: [0], h: 1 },
  { t: 16, s: [75], h: 1 },
  { t: 20, s: [0], h: 1 },
  { t: 49, s: [0], h: 1 },
  { t: 50, s: [70], h: 1 },
  { t: 54, s: [0], h: 1 },
  { t: 90, s: [0], h: 1 },
] as const;

const offsetLeft = [
  { t: 0, s: [154, 48, 0], h: 1 },
  { t: 90, s: [154, 48, 0], h: 1 },
] as const;

const offsetRight = [
  { t: 0, s: [166, 48, 0], h: 1 },
  { t: 90, s: [166, 48, 0], h: 1 },
] as const;

export const glitchWordmark: AnimationObject = {
  v: "5.12.2",
  fr: 30,
  ip: 0,
  op: 90,
  w: 320,
  h: 96,
  nm: "Gizu glitch wordmark",
  ddd: 0,
  assets: [],
  layers: [
    wordLayer("Cyan split", 1, [0.1, 0.9, 0.85, 1], offsetLeft, cyanOpacity),
    wordLayer("Magenta split", 2, [1, 0.2, 0.55, 1], offsetRight, magentaOpacity),
    wordLayer("Gizu", 3, [0.19, 0.77, 0.49, 1], mainPositions, alwaysVisible),
  ],
  markers: [],
};
