import type { AnimationObject } from "lottie-react-native";

type Rgba = readonly [number, number, number, number];

const NEON: Rgba = [0.192, 0.769, 0.494, 1];
const ROSE: Rgba = [0.769, 0.341, 0.416, 1];

// A stroked path that draws itself with a trim, then a ring that pops open.
function strokeLayer(
  name: string,
  index: number,
  color: Rgba,
  vertices: readonly (readonly [number, number])[],
  drawIn: readonly [number, number],
) {
  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [120, 120, 0] },
      a: { a: 0, k: [120, 120, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [
      {
        ty: "sh",
        d: 1,
        ks: {
          a: 0,
          k: {
            i: vertices.map(() => [0, 0]),
            o: vertices.map(() => [0, 0]),
            v: vertices.map(([x, y]) => [x, y]),
            c: false,
          },
        },
        nm: `${name} path`,
      },
      {
        ty: "st",
        c: { a: 0, k: color },
        o: { a: 0, k: 100 },
        w: { a: 0, k: 12 },
        lc: 2,
        lj: 2,
        nm: `${name} stroke`,
      },
      {
        ty: "tm",
        s: { a: 0, k: 0 },
        e: {
          a: 1,
          k: [
            { t: drawIn[0], s: [0], i: { x: [0.2], y: [1] }, o: { x: [0.3], y: [0] } },
            { t: drawIn[1], s: [100] },
          ],
        },
        o: { a: 0, k: 0 },
        m: 1,
        nm: `${name} trim`,
      },
    ],
    ip: 0,
    op: 60,
    st: 0,
    bm: 0,
  };
}

function ringLayer(index: number, color: Rgba) {
  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: "ring",
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: 0, s: [0], i: { x: [0.2], y: [1] }, o: { x: [0.3], y: [0] } },
          { t: 10, s: [55] },
          { t: 44, s: [0] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [120, 120, 0] },
      a: { a: 0, k: [120, 120, 0] },
      s: {
        a: 1,
        k: [
          {
            t: 0,
            s: [58, 58, 100],
            i: { x: [0.2, 0.2, 0.2], y: [1, 1, 1] },
            o: { x: [0.3, 0.3, 0.3], y: [0, 0, 0] },
          },
          { t: 44, s: [112, 112, 100] },
        ],
      },
    },
    ao: 0,
    shapes: [
      { ty: "el", d: 1, s: { a: 0, k: [170, 170] }, p: { a: 0, k: [120, 120] }, nm: "ring shape" },
      {
        ty: "st",
        c: { a: 0, k: color },
        o: { a: 0, k: 100 },
        w: { a: 0, k: 4 },
        lc: 2,
        lj: 2,
        nm: "ring stroke",
      },
    ],
    ip: 0,
    op: 60,
    st: 0,
    bm: 0,
  };
}

function build(name: string, color: Rgba, layers: readonly unknown[]): AnimationObject {
  return {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 60,
    w: 240,
    h: 240,
    nm: name,
    ddd: 0,
    assets: [],
    layers,
    markers: [],
  } as unknown as AnimationObject;
}

const CHECK = [
  [72, 124],
  [106, 158],
  [168, 88],
] as const;

const CROSS_A = [
  [80, 80],
  [160, 160],
] as const;

const CROSS_B = [
  [160, 80],
  [80, 160],
] as const;

/** Order filled, drawn in neon. */
export const signSuccess = build("sign-success", NEON, [
  strokeLayer("check", 1, NEON, CHECK, [4, 26]),
  ringLayer(2, NEON),
]);

/** Signature rejected, drawn in rose. */
export const signFailure = build("sign-failure", ROSE, [
  strokeLayer("cross-a", 1, ROSE, CROSS_A, [4, 20]),
  strokeLayer("cross-b", 2, ROSE, CROSS_B, [14, 30]),
  ringLayer(3, ROSE),
]);
