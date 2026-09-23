// Earn cycle diagram, Gizu design language.
// Card sizing follows the portfolio component library: 12px radius, hairline
// border, 32px padding, one vertical rhythm. Every block lays itself out, so
// nothing can drift out of alignment.
// Usage: node brand/diagrams/earn-cycle.mjs

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))

/* -------------------------------------------------------------- tokens */

const W = 2440
const H = 1440

const INK = '#070a09'
const CARD = '#0d1211'
const CARD_PRIVATE = '#0c1712'
const NEON = '#31c47e'
const TEXT = '#f2f7f4'
const MUTED = 'rgba(242,247,244,0.58)'
const FAINT = 'rgba(242,247,244,0.34)'
const HAIR = 'rgba(255,255,255,0.1)'
const HAIR_SOFT = 'rgba(255,255,255,0.06)'
const PRIVATE_EDGE = 'rgba(49,196,126,0.3)'
const FLOW = 'rgba(242,247,244,0.3)'
const FLOW_PRIVATE = 'rgba(49,196,126,0.55)'
const SANS = 'Helvetica Neue'

const PAD = 32
const ROW = 26

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const out = []
const add = (...s) => out.push(...s)

/* --------------------------------------------------------------- atoms */

const text = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${SANS}" font-size="${o.size ?? 15}" font-weight="${o.weight ?? 400}" fill="${o.fill ?? TEXT}" letter-spacing="${o.ls ?? 0}" text-anchor="${o.anchor ?? 'start'}">${esc(s)}</text>`

const label = (x, y, s, o = {}) =>
  text(x, y, String(s).toUpperCase(), { size: 11, fill: FAINT, ls: 1.8, weight: 600, ...o })

const G = {
  wallet: `<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="17" cy="14.5" r="1.1" fill="currentColor" stroke="none"/>`,
  file: `<path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M13 3v6h6"/>`,
  lock: `<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>`,
  ledger: `<ellipse cx="12" cy="6.5" rx="7" ry="2.8"/><path d="M5 6.5v11c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8v-11"/><path d="M5 12c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8"/>`,
  coin: `<circle cx="12" cy="12" r="8"/><path d="M12 8v8M14 9.8c-.5-.6-1.3-.9-2.2-.9-1.3 0-2.3.7-2.3 1.7s.9 1.5 2.3 1.7 2.4.6 2.4 1.7-1 1.7-2.4 1.7c-1 0-1.8-.3-2.3-1"/>`,
  user: `<circle cx="12" cy="8.5" r="3.6"/><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0"/>`,
  route: `<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M6.6 12h4.4"/><path d="M11 12l7 -4.5"/><path d="M11 12l7 4.5"/>`,
  exit: `<path d="M13.5 5H17a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3.5"/><path d="M9.5 8.5 6 12l3.5 3.5"/><path d="M6 12h7.5"/>`,
}

const glyph = (x, y, name, o = {}) => {
  const size = o.size ?? 40
  const tone = o.private ? NEON : 'rgba(242,247,244,0.7)'
  const scale = (size - 16) / 24
  return (
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${o.private ? 'rgba(49,196,126,0.12)' : 'rgba(255,255,255,0.045)'}" stroke="${o.private ? 'rgba(49,196,126,0.22)' : HAIR_SOFT}"/>` +
    `<g transform="translate(${x + 8} ${y + 8}) scale(${scale})" color="${tone}" stroke="${tone}" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round">${G[name]}</g>`
  )
}

const stepDot = (x, y, n) =>
  `<circle cx="${x + 13}" cy="${y + 13}" r="13" fill="${NEON}"/>` +
  text(x + 13, y + 18, n, { size: 13, weight: 700, fill: '#06170e', anchor: 'middle' })

const chipRow = (x, y, w, items, o = {}) => {
  const gap = 12
  const cw = (w - gap * (items.length - 1)) / items.length
  return items
    .map(
      (s, i) =>
        `<rect x="${x + i * (cw + gap)}" y="${y}" width="${cw}" height="44" rx="10" fill="${o.private ? 'rgba(49,196,126,0.07)' : 'rgba(255,255,255,0.035)'}" stroke="${o.private ? 'rgba(49,196,126,0.18)' : HAIR_SOFT}"/>` +
        text(x + i * (cw + gap) + cw / 2, y + 28, s, { size: 13.5, weight: 500, anchor: 'middle' }),
    )
    .join('')
}

/**
 * Self-measuring card. Content flows top down on a fixed rhythm, so a block can
 * never overlap the one below it.
 */
function block(x, y, w, spec) {
  const body = []
  let cur = y + PAD

  if (spec.step || spec.title) {
    if (spec.step) body.push(stepDot(x + PAD, cur, spec.step))
    const tx = spec.step ? x + PAD + 40 : x + PAD
    body.push(text(tx, cur + 17, spec.title, { size: 20, weight: 600, ls: -0.3 }))
    if (spec.sub) body.push(text(tx, cur + 41, spec.sub, { size: 14, fill: MUTED }))
    cur += spec.sub ? 62 : 40
  }

  if (spec.rows) {
    body.push(`<path d="M${x + PAD},${cur} H${x + w - PAD}" stroke="${HAIR_SOFT}"/>`)
    cur += 26
    if (spec.rowsLabel) {
      body.push(label(x + PAD, cur, spec.rowsLabel, { fill: NEON }))
      cur += 24
    }
    spec.rows.forEach(([k, v]) => {
      body.push(text(x + PAD, cur, k, { size: 13.5, weight: 600, fill: NEON }))
      body.push(text(x + PAD + 112, cur, v, { size: 13.5, fill: MUTED }))
      cur += ROW
    })
    cur += 6
  }

  if (spec.glyphs) {
    spec.glyphs.forEach((g, i) => body.push(glyph(x + PAD + i * 52, cur, g, { private: spec.private })))
    if (spec.glyphNote) body.push(text(x + PAD + spec.glyphs.length * 52 + 12, cur + 25, spec.glyphNote, { size: 13.5, fill: MUTED }))
    cur += 56
  }

  if (spec.chips) {
    body.push(chipRow(x + PAD, cur, w - PAD * 2, spec.chips, { private: spec.private }))
    cur += 56
  }

  if (spec.note) {
    body.push(label(x + PAD, cur + 6, spec.note, { fill: spec.noteNeon ? NEON : FAINT }))
    cur += 22
  }

  const h = cur + PAD - y - 8
  add(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${spec.private ? CARD_PRIVATE : CARD}" stroke="${spec.private ? PRIVATE_EDGE : HAIR}"/>`,
  )
  add(...body)
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, right: x + w, bottom: y + h }
}

/** Compact tile used for wallets and deposit addresses. */
function tile(x, y, w, name, caption, o = {}) {
  const h = 104
  add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${CARD}" stroke="${HAIR}"/>`)
  add(glyph(x + w / 2 - 20, y + 18, name, o))
  add(text(x + w / 2, y + 82, caption, { size: 15, weight: 600, anchor: 'middle' }))
  return { x, y, w, h, cx: x + w / 2, bottom: y + h, right: x + w }
}

function zone(x, y, w, h, title, o = {}) {
  add(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="rgba(255,255,255,0.014)" stroke="${o.stroke ?? HAIR_SOFT}"/>`,
  )
  add(label(x + 28, y + 34, title, { fill: o.fill ?? MUTED }))
}

const flowV = (x, y1, y2, o = {}) =>
  `<path d="M${x},${y1} V${y2}" stroke="${o.private ? FLOW_PRIVATE : FLOW}" stroke-width="1.5" fill="none" marker-end="url(#${o.private ? 'tipP' : 'tipN'})"/>`

const flowH = (y, x1, x2, o = {}) =>
  `<path d="M${x1},${y} H${x2}" stroke="${o.private ? FLOW_PRIVATE : FLOW}" stroke-width="1.5" fill="none" marker-end="url(#${o.private ? 'tipP' : 'tipN'})"/>`

/** Orthogonal path through waypoints, rounded corners, single arrow head. */
const route = (pts, o = {}) => {
  const r = o.r ?? 12
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1]
    const [cx, cy] = pts[i]
    const [nx, ny] = pts[i + 1]
    const dx1 = Math.sign(cx - px)
    const dy1 = Math.sign(cy - py)
    const dx2 = Math.sign(nx - cx)
    const dy2 = Math.sign(ny - cy)
    d += ` L${cx - dx1 * r},${cy - dy1 * r} Q${cx},${cy} ${cx + dx2 * r},${cy + dy2 * r}`
  }
  const last = pts[pts.length - 1]
  d += ` L${last[0]},${last[1]}`
  return `<path d="${d}" stroke="${o.private ? FLOW_PRIVATE : FLOW}" stroke-width="1.5" fill="none" marker-end="url(#${o.private ? 'tipP' : 'tipN'})"/>`
}

const tag = (cx, cy, s) => {
  const w = s.length * 6.6 + 28
  return (
    `<rect x="${cx - w / 2}" y="${cy - 14}" width="${w}" height="28" rx="14" fill="${INK}" stroke="${HAIR}"/>` +
    text(cx, cy + 5, s, { size: 12, fill: MUTED, anchor: 'middle' })
  )
}

/* -------------------------------------------------------------- canvas */

add(`<rect width="${W}" height="${H}" fill="${INK}"/>`)
add(text(120, 108, 'One passkey. The complete Earn cycle.', { size: 62, weight: 700, ls: -1.8 }))
add(`<path d="M120,178 H2320" stroke="${HAIR_SOFT}"/>`)

/* --------------------------------------------------------------- zones */

const Z1 = { x: 120, y: 216, w: 620, h: 560 }
const Z2 = { x: 800, y: 216, w: 700, h: 1160 }
const Z3 = { x: 1560, y: 216, w: 760, h: 1160 }
const Z4 = { x: 120, y: 816, w: 620, h: 560 }

zone(Z1.x, Z1.y, Z1.w, Z1.h, 'Monad · source chain')
zone(Z2.x, Z2.y, Z2.w, Z2.h, 'Confidential layer · FAR private ledger', {
  stroke: 'rgba(49,196,126,0.22)',
  fill: NEON,
})
zone(Z3.x, Z3.y, Z3.w, Z3.h, 'Monad')
zone(Z4.x, Z4.y, Z4.w, Z4.h, 'Monad · payout')

/* ------------------------------------------------------------ column 1 */

const login = block(Z1.x + 30, Z1.y + 64, Z1.w - 60, {
  step: '1',
  title: 'Log in with Mera',
  sub: 'One master passkey, no wallet switching',
  rowsLabel: 'Locally derived keys',
  rows: [
    ['F', 'Funding wallet'],
    ['C', 'Confidential account signer'],
    ['A1 – A4', 'Investment wallets'],
    ['R1 – R3', 'Fresh withdrawal wallets'],
  ],
})

const fund = block(Z1.x + 30, login.bottom + 28, 270, {
  step: '2',
  title: 'Fund wallet F',
  sub: 'USDC on Monad',
  glyphs: ['coin'],
  glyphNote: 'Public transfer',
})

const deposit = block(Z1.x + 320, login.bottom + 28, 270, {
  title: 'Deposit address',
  sub: '0xABCD . . . 1234',
  glyphs: ['file'],
  glyphNote: 'Generated',
})

add(flowV(login.x + 40, login.bottom, fund.y))
add(flowH(fund.y + 60, fund.right, deposit.x))

/* ------------------------------------------------------------ column 2 */

const balance = block(Z2.x + 30, Z2.y + 64, Z2.w - 60, {
  step: '3',
  title: 'Confidential balance C',
  sub: 'The Aurora deposit route credits the FAR ledger',
  private: true,
  glyphs: ['ledger', 'lock'],
  glyphNote: 'Balances never leave the private ledger',
})

const intents = block(Z2.x + 30, balance.bottom + 28, Z2.w - 60, {
  step: '4',
  title: 'Aurora Confidential Intents',
  sub: 'One payout quote per recipient wallet',
  private: true,
  chips: ['A1 route', 'A2 route', 'A3 route', 'A4 route'],
})

const returns = block(Z2.x + 30, intents.bottom + 120, Z2.w - 60, {
  step: '7',
  title: 'Aurora confidential return routes',
  sub: 'One return route per investment wallet',
  private: true,
  chips: ['D1 › C', 'D2 › C', 'D3 › C', 'D4 › C'],
})

const balance2 = block(Z2.x + 30, returns.bottom + 28, Z2.w - 60, {
  title: 'Confidential balance C',
  sub: 'Same account, credited by every return route',
  private: true,
  glyphs: ['ledger'],
  glyphNote: 'FAR · private ledger',
})

const quotes = block(Z2.x + 30, balance2.bottom + 28, Z2.w - 60, {
  step: '8',
  title: 'Aurora confidential payout quotes',
  sub: 'One quote per fresh withdrawal wallet',
  private: true,
  chips: ['R1 quote', 'R2 quote', 'R3 quote'],
})

add(flowV(balance.cx, balance.bottom, intents.y, { private: true }))
add(flowV(returns.cx, returns.bottom, balance2.y, { private: true }))
add(flowV(balance2.cx, balance2.bottom, quotes.y, { private: true }))

// deposit address feeds the confidential balance
add(route([[deposit.right, deposit.y + 60], [Z2.x - 30, deposit.y + 60], [Z2.x - 30, balance.cy], [balance.x, balance.cy]], { private: true }))

/* ------------------------------------------------------------ column 3 */

const AX = [Z3.x + 30, Z3.x + 210, Z3.x + 390, Z3.x + 570]
const AW = 160

const wallets = AX.map((x, i) => tile(x, Z3.y + 64, AW, 'wallet', `A${i + 1}`))

const invest = block(Z3.x + 30, wallets[0].bottom + 86, Z3.w - 60, {
  step: '5',
  title: 'Invest in vaults',
  sub: 'Morpho / Aave / compatible Euler application',
  chips: ['A1 position', 'A2 position', 'A3 position', 'A4 position'],
})

const exitStep = block(Z3.x + 30, invest.bottom + 64, Z3.w - 60, {
  step: '6',
  title: 'Partial withdrawal',
  sub: 'Redeem part of each position, the rest stays invested',
})

const wallets2 = AX.map((x, i) => tile(x, exitStep.bottom + 86, AW, 'wallet', `A${i + 1}`))
const deposits = AX.map((x, i) => tile(x, wallets2[0].bottom + 54, AW, 'file', `Deposit D${i + 1}`))

// intents rail into the wallets
add(
  route(
    [
      [intents.right, intents.y + 60],
      [Z3.x - 24, intents.y + 60],
      [Z3.x - 24, Z3.y + 40],
      [wallets[3].cx, Z3.y + 40],
    ],
    { private: true },
  ),
)
wallets.forEach((w) => add(flowV(w.cx, Z3.y + 40, w.y, { private: true })))

wallets.forEach((w) => add(flowV(w.cx, w.bottom, invest.y)))
add(tag(wallets[0].cx + 92, wallets[0].bottom + 42, 'Approve + deposit'))
add(tag(wallets[2].cx + 92, wallets[0].bottom + 42, 'Approve + deposit'))

AX.forEach((x) => add(flowV(x + AW / 2, invest.bottom, exitStep.y)))
wallets2.forEach((w, i) => {
  add(flowV(w.cx, exitStep.bottom, w.y))
  if (i === 0 || i === 2) add(tag(w.cx + 62, exitStep.bottom + 42, 'Redeem'))
  add(flowV(w.cx, w.bottom, deposits[i].y))
})
add(label(Z3.x + Z3.w / 2, deposits[0].bottom + 40, 'Same investment wallets · separate deposit addresses', { anchor: 'middle' }))

// deposits return to the confidential layer
deposits.forEach((d, i) => {
  const lane = deposits[0].bottom + 78 + i * 16
  add(
    route(
      [
        [d.cx, d.bottom],
        [d.cx, lane],
        [Z3.x - 24 - i * 16, lane],
        [Z3.x - 24 - i * 16, returns.cy],
        [returns.right, returns.cy],
      ],
      { private: true },
    ),
  )
})

/* ------------------------------------------------------------ column 4 */

const RX = [Z4.x + 30, Z4.x + 220, Z4.x + 410]
const fresh = RX.map((x, i) => tile(x, Z4.y + 64, 170, 'wallet', `R${i + 1}`))

const freshNote = block(Z4.x + 30, fresh[0].bottom + 28, Z4.w - 60, {
  title: 'Fresh withdrawal addresses',
  sub: 'Controlled by the same Mera passkey, no new enrolment',
  glyphs: ['exit'],
  glyphNote: 'One quote per address',
})

// payout quotes back to the fresh wallets
const payoutRail = fresh[0].y - 18
add(
  route(
    [
      [quotes.x, quotes.cy],
      [Z4.x + Z4.w + 28, quotes.cy],
      [Z4.x + Z4.w + 28, payoutRail],
      [fresh[0].cx, payoutRail],
    ],
    { private: true, r: 14 },
  ),
)
fresh.forEach((f) => add(flowV(f.cx, payoutRail, f.y, { private: true })))

/* ------------------------------------------------------------------ svg */

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <marker id="tipN" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,1.5 L8.5,5 L0,8.5 Z" fill="${FLOW}"/>
    </marker>
    <marker id="tipP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,1.5 L8.5,5 L0,8.5 Z" fill="${NEON}" fill-opacity="0.85"/>
    </marker>
  </defs>
  ${out.join('\n  ')}
</svg>`

writeFileSync(join(HERE, 'earn-cycle.svg'), svg)
console.log('earn-cycle.svg written')
