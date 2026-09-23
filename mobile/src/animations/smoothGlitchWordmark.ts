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
      a: { a: 0, k: [160, 48, 0] },
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
    op: 96,
    st: 0,
    bm: 0,
  };
}

const cyanOpacity = [
  { t: 0, s: [12], h: 1 },
  { t: 8, s: [0], h: 1 },
  { t: 20, s: [0], h: 1 },
  { t: 21, s: [90], h: 1 },
  { t: 26, s: [0], h: 1 },
  { t: 61, s: [0], h: 1 },
  { t: 62, s: [82], h: 1 },
  { t: 67, s: [0], h: 1 },
  { t: 96, s: [12], h: 1 },
] as const;

const magentaOpacity = [
  { t: 0, s: [0], h: 1 },
  { t: 22, s: [0], h: 1 },
  { t: 23, s: [80], h: 1 },
  { t: 28, s: [0], h: 1 },
  { t: 63, s: [0], h: 1 },
  { t: 64, s: [74], h: 1 },
  { t: 69, s: [0], h: 1 },
  { t: 96, s: [0], h: 1 },
] as const;

const cyanPositions = [
  { t: 0, s: [160, 48, 0], h: 1 },
  { t: 21, s: [150, 48, 0], h: 1 },
  { t: 24, s: [170, 48, 0], h: 1 },
  { t: 26, s: [160, 48, 0], h: 1 },
  { t: 62, s: [168, 48, 0], h: 1 },
  { t: 65, s: [152, 48, 0], h: 1 },
  { t: 67, s: [160, 48, 0], h: 1 },
  { t: 96, s: [160, 48, 0], h: 1 },
] as const;

const magentaPositions = [
  { t: 0, s: [160, 48, 0], h: 1 },
  { t: 23, s: [170, 48, 0], h: 1 },
  { t: 26, s: [153, 48, 0], h: 1 },
  { t: 28, s: [160, 48, 0], h: 1 },
  { t: 64, s: [151, 48, 0], h: 1 },
  { t: 67, s: [169, 48, 0], h: 1 },
  { t: 69, s: [160, 48, 0], h: 1 },
  { t: 96, s: [160, 48, 0], h: 1 },
] as const;

export const smoothGlitchWordmark: AnimationObject = {
  v: "5.12.2",
  fr: 30,
  ip: 0,
  op: 96,
  w: 320,
  h: 96,
  nm: "Gizu clean type glitch overlay",
  ddd: 0,
  assets: [],
  layers: [
    scanLayer("Cyan fragments", 1, [0.1, 0.9, 0.85, 1], cyanOpacity, cyanPositions, [
      [160, 35, 240, 3],
      [120, 52, 128, 4],
      [230, 68, 76, 3],
    ]),
    scanLayer("Magenta fragments", 2, [1, 0.2, 0.55, 1], magentaOpacity, magentaPositions, [
      [180, 42, 206, 3],
      [94, 62, 82, 4],
    ]),
  ],
  markers: [],
};
