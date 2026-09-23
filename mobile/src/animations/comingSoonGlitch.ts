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

const cyanOpacity = [
  { t: 0, s: [0], h: 1 },
  { t: 8, s: [0], h: 1 },
  { t: 20, s: [0], h: 1 },
  { t: 21, s: [38], h: 1 },
  { t: 26, s: [0], h: 1 },
  { t: 61, s: [0], h: 1 },
  { t: 62, s: [32], h: 1 },
  { t: 67, s: [0], h: 1 },
  { t: 150, s: [0], h: 1 },
] as const;

const magentaOpacity = [
  { t: 0, s: [0], h: 1 },
  { t: 22, s: [0], h: 1 },
  { t: 23, s: [26], h: 1 },
  { t: 28, s: [0], h: 1 },
  { t: 63, s: [0], h: 1 },
  { t: 64, s: [24], h: 1 },
  { t: 69, s: [0], h: 1 },
  { t: 150, s: [0], h: 1 },
] as const;

const cyanPositions = [
  { t: 0, s: [240, 56, 0], h: 1 },
  { t: 21, s: [236, 56, 0], h: 1 },
  { t: 24, s: [244, 56, 0], h: 1 },
  { t: 26, s: [240, 56, 0], h: 1 },
  { t: 62, s: [243, 56, 0], h: 1 },
  { t: 65, s: [237, 56, 0], h: 1 },
  { t: 67, s: [240, 56, 0], h: 1 },
  { t: 150, s: [240, 56, 0], h: 1 },
] as const;

const magentaPositions = [
  { t: 0, s: [240, 56, 0], h: 1 },
  { t: 23, s: [244, 56, 0], h: 1 },
  { t: 26, s: [238, 56, 0], h: 1 },
  { t: 28, s: [240, 56, 0], h: 1 },
  { t: 64, s: [236, 56, 0], h: 1 },
  { t: 67, s: [243, 56, 0], h: 1 },
  { t: 69, s: [240, 56, 0], h: 1 },
  { t: 150, s: [240, 56, 0], h: 1 },
] as const;

export const comingSoonGlitch: AnimationObject = {
  v: "5.12.2",
  fr: 30,
  ip: 0,
  op: 150,
  w: 480,
  h: 112,
  nm: "Gizu clean type glitch overlay",
  ddd: 0,
  assets: [],
  layers: [
    scanLayer("Cyan fragments", 1, [0.1, 0.9, 0.85, 1], cyanOpacity, cyanPositions, [
      [240, 38, 260, 1.5],
      [175, 56, 88, 2],
      [320, 74, 60, 1.5],
    ]),
    scanLayer("Mint fragments", 2, [0.6, 1, 0.75, 1], magentaOpacity, magentaPositions, [
      [245, 46, 180, 1.5],
      [150, 66, 58, 2],
    ]),
  ],
  markers: [],
};
