import type { AnimationObject } from "lottie-react-native";

type OpacityKeyframe = { t: number; s: readonly [number]; h: 1 };

function scanLayer(
  name: string,
  index: number,
  color: readonly [number, number, number, number],
  opacity: readonly OpacityKeyframe[],
  positions: readonly { t: number; s: readonly [number, number, number]; h: 1 }[],
  blocks: readonly (readonly [number, number, number, number])[],
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
      a: { a: 0, k: [240, 56, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [
      ...blocks.map(([x, y, width, height]) => ({
        ty: "rc",
        d: 1,
        s: { a: 0, k: [width, height] },
        p: { a: 0, k: [x, y] },
        r: { a: 0, k: 1 },
      })),
      { ty: "fl", c: { a: 0, k: color }, o: { a: 0, k: 100 }, r: 1, nm: `${name} fill` },
    ],
    ip: 0,
    op: 150,
    st: 0,
    bm: 0,
  };
}

// Short, stepped bursts; the rest of the five-second loop is deliberately still.
const cyanOpacity = [
  { t: 0, s: [0], h: 1 },
  { t: 21, s: [85], h: 1 },
  { t: 25, s: [60], h: 1 },
  { t: 29, s: [85], h: 1 },
  { t: 33, s: [0], h: 1 },
  { t: 78, s: [80], h: 1 },
  { t: 82, s: [55], h: 1 },
  { t: 86, s: [80], h: 1 },
  { t: 90, s: [0], h: 1 },
  { t: 150, s: [0], h: 1 },
] as const;
const magentaOpacity = cyanOpacity;
const cyanPositions = [
  { t: 0, s: [240, 56, 0], h: 1 },
  { t: 21, s: [252, 56, 0], h: 1 },
  { t: 25, s: [231, 56, 0], h: 1 },
  { t: 29, s: [245, 56, 0], h: 1 },
  { t: 33, s: [240, 56, 0], h: 1 },
  { t: 78, s: [252, 56, 0], h: 1 },
  { t: 82, s: [231, 56, 0], h: 1 },
  { t: 86, s: [245, 56, 0], h: 1 },
  { t: 90, s: [240, 56, 0], h: 1 },
  { t: 150, s: [240, 56, 0], h: 1 },
] as const;
const magentaPositions = cyanPositions.map((frame) => ({
  ...frame,
  s: [480 - frame.s[0], 56, 0] as const,
}));

export const comingSoonGlitch: AnimationObject = {
  v: "5.12.2",
  fr: 30,
  ip: 0,
  op: 150,
  w: 480,
  h: 80,
  nm: "Coming soon chromatic tear accents",
  ddd: 0,
  assets: [],
  layers: [
    scanLayer("Cyan fragments", 1, [0.1, 0.9, 0.85, 1], cyanOpacity, cyanPositions, [
      [240, 38, 310, 3],
      [175, 56, 104, 4],
      [320, 74, 80, 3],
    ]),
    scanLayer("Magenta fragments", 2, [0.9, 0.46, 0.79, 1], magentaOpacity, magentaPositions, [
      [245, 46, 180, 1.5],
      [150, 66, 58, 2],
    ]),
  ],
  markers: [],
};
