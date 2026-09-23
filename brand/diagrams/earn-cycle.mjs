// Builds the Earn cycle diagram in the Gizu design language.
// Usage: node brand/diagrams/earn-cycle.mjs  (writes earn-cycle.svg next to it)
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))

const W = 1680
const H = 1120

const INK = '#050706'
const NEON = '#31c47e'
const SURFACE = 'rgba(14,19,16,0.9)'
const LINE = 'rgba(255,255,255,0.07)'
const TEXT = '#dfe8e3'
const MUTED = 'rgba(223,232,227,0.45)'
const FAINT = 'rgba(223,232,227,0.3)'
const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const text = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${SANS}" font-size="${o.size ?? 14}" font-weight="${o.weight ?? 400}" fill="${o.fill ?? TEXT}" letter-spacing="${o.ls ?? 0}" text-anchor="${o.anchor ?? 'start'}">${esc(s)}</text>`

const mono = (x, y, s, o = {}) =>
  text(x, y, String(s).toUpperCase(), {
    size: 10,
    fill: FAINT,
    ls: 2.2,
    weight: 500,
    ...o,
  })

const card = (x, y, w, h, o = {}) => {
  const fill = o.private ? 'rgba(49,196,126,0.07)' : SURFACE
  const stroke = o.private ? 'rgba(49,196,126,0.28)' : LINE
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 18}" fill="${fill}" stroke="${stroke}"/>`
}

const chip = (x, y, w, h, label, o = {}) =>
  `${card(x, y, w, h, { r: 12, ...o })}${text(x + w / 2, y + h / 2 + 5, label, { size: o.size ?? 13, weight: 500, anchor: 'middle', fill: o.fill ?? TEXT })}`

const badge = (x, y, n) =>
  `<circle cx="${x}" cy="${y}" r="15" fill="${NEON}"/>${text(x, y + 5, n, { size: 14, weight: 700, fill: '#04150c', anchor: 'middle' })}`

const arrow = (x1, y1, x2, y2, o = {}) =>
  `<path d="M${x1},${y1} L${x2},${y2}" stroke="${o.stroke ?? 'rgba(223,232,227,0.35)'}" stroke-width="${o.w ?? 1.4}" marker-end="url(#head${o.neon ? 'Neon' : ''})" fill="none"/>`

const elbow = (x1, y1, x2, y2, o = {}) => {
  const midY = o.midY ?? (y1 + y2) / 2
  return `<path d="M${x1},${y1} V${midY} H${x2} V${y2}" stroke="${o.stroke ?? NEON}" stroke-opacity="${o.op ?? 0.45}" stroke-width="1.4" fill="none" marker-end="url(#headNeon)"/>`
}

const walletIcon = (x, y) =>
  `<g transform="translate(${x} ${y})" stroke="${NEON}" stroke-opacity="0.85" fill="none" stroke-width="1.5">
     <rect x="0" y="0" width="22" height="16" rx="4"/>
     <path d="M0 5 H22"/>
     <circle cx="16.5" cy="10.5" r="1.6" fill="${NEON}" stroke="none"/>
   </g>`

const docIcon = (x, y) =>
  `<g transform="translate(${x} ${y})" stroke="${NEON}" stroke-opacity="0.8" fill="none" stroke-width="1.4">
     <path d="M2 0 H12 L17 5 V18 H2 Z"/>
     <path d="M12 0 V5 H17"/>
     <path d="M5.5 9 H13.5 M5.5 13 H11"/>
   </g>`

const lockIcon = (x, y) =>
  `<g transform="translate(${x} ${y})" stroke="${NEON}" fill="none" stroke-width="1.6">
     <rect x="0" y="7" width="16" height="11" rx="3"/>
     <path d="M3.5 7 V4.5 a4.5 4.5 0 0 1 9 0 V7"/>
   </g>`

const parts = []

// ---------------------------------------------------------------- background
parts.push(`<rect width="${W}" height="${H}" fill="${INK}"/>`)
parts.push(
  `<radialGradient id="glow" cx="50%" cy="0%" r="70%"><stop offset="0%" stop-color="${NEON}" stop-opacity="0.07"/><stop offset="100%" stop-color="${NEON}" stop-opacity="0"/></radialGradient>`,
)
parts.push(`<rect width="${W}" height="${H}" fill="url(#glow)"/>`)

// ---------------------------------------------------------------- title
parts.push(
  text(W / 2, 74, 'One passkey. The complete Earn cycle.', {
    size: 40,
    weight: 700,
    anchor: 'middle',
    ls: -0.8,
  }),
)
parts.push(
  `<text x="${W / 2}" y="112" font-family="${SANS}" font-size="19" fill="${MUTED}" text-anchor="middle">Monad <tspan fill="${NEON}">&#8594;</tspan> confidential balance <tspan fill="${NEON}">&#8594;</tspan> Ethereum vaults <tspan fill="${NEON}">&#8594;</tspan> fresh Monad wallets</text>`,
)

// ---------------------------------------------------------------- row 1
// investor
parts.push(
  `<g transform="translate(58 196)" stroke="${TEXT}" stroke-opacity="0.65" fill="none" stroke-width="2">
     <circle cx="20" cy="14" r="12"/>
     <path d="M0 52 a20 22 0 0 1 40 0"/>
   </g>`,
)
parts.push(mono(78, 286, 'Investor', { anchor: 'middle', fill: MUTED }))

// 1 login
parts.push(card(158, 178, 320, 214))
parts.push(badge(190, 210, '1'))
parts.push(text(216, 206, 'Log in with Mera', { size: 17, weight: 600 }))
parts.push(text(216, 226, 'One master passkey', { size: 12, fill: MUTED }))
parts.push(`<path d="M182,246 H454" stroke="${LINE}"/>`)
parts.push(mono(182, 268, 'Locally derived keys', { fill: NEON }))
const keys = [
  ['F', 'Funding wallet'],
  ['C', 'Confidential account signer'],
  ['A1 – A4', 'Investment wallets'],
  ['R1 – R3', 'Fresh withdrawal wallets'],
]
keys.forEach(([k, v], i) => {
  const y = 292 + i * 20
  parts.push(text(182, y, k, { size: 12, weight: 600, fill: NEON }))
  parts.push(text(268, y, v, { size: 12, fill: MUTED }))
})
parts.push(text(182, 372, 'One unlock · separate signatures · no wallet switching', { size: 11, fill: FAINT }))

// 2 fund wallet
parts.push(card(520, 214, 210, 118))
parts.push(badge(552, 246, '2'))
parts.push(text(578, 242, 'Fund wallet F', { size: 16, weight: 600 }))
parts.push(text(578, 262, 'USDC on Monad', { size: 12, fill: MUTED }))
parts.push(`<circle cx="562" cy="298" r="14" fill="none" stroke="${NEON}" stroke-opacity="0.6"/>`)
parts.push(text(562, 303, '$', { size: 14, weight: 700, fill: NEON, anchor: 'middle' }))
parts.push(text(586, 303, 'USDC', { size: 13, weight: 500 }))

// deposit address
parts.push(card(772, 214, 216, 118))
parts.push(text(796, 248, 'Generated Monad', { size: 14, weight: 600 }))
parts.push(text(796, 268, 'deposit address', { size: 14, weight: 600 }))
parts.push(docIcon(796, 288))
parts.push(text(822, 305, '0xABCD . . . 1234', { size: 12, fill: MUTED }))

// 3 confidential balance
parts.push(card(1030, 200, 262, 148, { private: true }))
parts.push(badge(1062, 232, '3'))
parts.push(text(1088, 228, 'Confidential balance C', { size: 16, weight: 600 }))
parts.push(text(1088, 248, 'Aurora deposit route → FAR credit', { size: 11.5, fill: MUTED }))
parts.push(`<g transform="translate(1058 272)" fill="none" stroke="${NEON}" stroke-width="1.6" stroke-opacity="0.85">
    <ellipse cx="14" cy="6" rx="14" ry="6"/><path d="M0 6 V20 a14 6 0 0 0 28 0 V6"/>
  </g>`)
parts.push(lockIcon(1112, 272))
parts.push(mono(1058, 330, 'FAR · private ledger', { fill: NEON }))

// 4 intents
parts.push(card(1330, 200, 292, 148, { private: true }))
parts.push(badge(1362, 232, '4'))
parts.push(text(1388, 228, 'Aurora Confidential Intents', { size: 15, weight: 600 }))
parts.push(text(1388, 248, 'One payout quote per recipient', { size: 11.5, fill: MUTED }))
parts.push(
  `<g stroke="${NEON}" stroke-width="1.8" fill="none" marker-end="url(#headNeon)" stroke-opacity="0.75">
     <path d="M1372,300 H1436"/><path d="M1436,300 L1476,282"/><path d="M1436,300 L1476,318"/>
   </g>`,
)

// row 1 arrows
parts.push(arrow(104, 272, 150, 272))
parts.push(arrow(486, 272, 512, 272))
parts.push(arrow(738, 272, 764, 272))
parts.push(arrow(996, 272, 1022, 272))
parts.push(arrow(1300, 272, 1322, 272))

// ---------------------------------------------------------------- chain divider
parts.push(
  `<path d="M20,466 H520 C640,466 700,392 860,390 H1660" stroke="${NEON}" stroke-opacity="0.25" stroke-dasharray="7 9" fill="none"/>`,
)
parts.push(mono(1004, 428, 'Ethereum', { anchor: 'end', fill: NEON }))
parts.push(mono(40, 452, 'Monad', { fill: NEON }))

// ---------------------------------------------------------------- investment wallets
const walletsX = [1032, 1180, 1328, 1476]
walletsX.forEach((x, i) => {
  parts.push(card(x, 404, 120, 74, { r: 14 }))
  parts.push(walletIcon(x + 49, 420))
  parts.push(text(x + 60, 462, `A${i + 1}`, { size: 15, weight: 600, anchor: 'middle' }))
  parts.push(arrow(x + 60, 478, x + 60, 528, { neon: true, stroke: `rgba(49,196,126,0.5)` }))
  if (i < 3) parts.push(text(x + 68, 502, 'Approve + deposit', { size: 10, fill: FAINT }))
})
parts.push(elbow(1161, 348, 1092, 404, { midY: 380 }))
parts.push(elbow(1161, 348, 1240, 404, { midY: 380 }))
parts.push(elbow(1476, 348, 1388, 404, { midY: 380 }))
parts.push(elbow(1476, 348, 1536, 404, { midY: 380 }))

// ---------------------------------------------------------------- 5 invest in vaults
parts.push(card(1006, 540, 620, 138, { private: true }))
parts.push(badge(1040, 574, '5'))
parts.push(text(1066, 570, 'Invest in vaults', { size: 17, weight: 600 }))
parts.push(text(1066, 590, 'Morpho / Aave / compatible Zama application', { size: 12, fill: MUTED }))
walletsX.forEach((x, i) => {
  parts.push(chip(x - 6, 614, 132, 44, `A${i + 1} position`, { size: 12.5 }))
})

// ---------------------------------------------------------------- 6 withdrawal
parts.push(card(1006, 716, 620, 92))
parts.push(badge(1040, 750, '6'))
parts.push(text(1066, 746, 'User requests a partial withdrawal', { size: 16, weight: 600 }))
parts.push(text(1066, 766, 'Redeem from each position; remaining positions stay invested', { size: 11.5, fill: MUTED }))
walletsX.forEach((x) => parts.push(arrow(x + 60, 678, x + 60, 712, { neon: true, stroke: 'rgba(49,196,126,0.5)' })))

// redeem row
walletsX.forEach((x, i) => {
  parts.push(arrow(x + 60, 808, x + 60, 844, { neon: true, stroke: 'rgba(49,196,126,0.5)' }))
  parts.push(text(x + 68, 832, 'Redeem', { size: 10, fill: FAINT }))
  parts.push(card(x, 850, 120, 70, { r: 14 }))
  parts.push(walletIcon(x + 49, 864))
  parts.push(text(x + 60, 904, `A${i + 1}`, { size: 15, weight: 600, anchor: 'middle' }))
  parts.push(arrow(x + 60, 920, x + 60, 946, { neon: true, stroke: 'rgba(49,196,126,0.5)' }))
  parts.push(card(x - 8, 950, 136, 48, { r: 12 }))
  parts.push(docIcon(x + 6, 962))
  parts.push(text(x + 34, 980, `Deposit D${i + 1}`, { size: 12.5, weight: 500 }))
})
parts.push(text(1316, 1052, 'Same investment wallets · separate Ethereum deposit addresses', { size: 11.5, fill: FAINT, anchor: 'middle' }))

// ---------------------------------------------------------------- 7 return routes
parts.push(card(560, 828, 300, 150, { private: true }))
parts.push(badge(592, 862, '7'))
parts.push(text(618, 858, 'Aurora confidential', { size: 16, weight: 600 }))
parts.push(text(618, 878, 'return routes', { size: 16, weight: 600 }))
parts.push(text(592, 902, 'One return route per investment wallet', { size: 11, fill: MUTED }))
parts.push(
  `<g stroke="${NEON}" stroke-width="1.8" fill="none" marker-end="url(#headNeon)" stroke-opacity="0.75">
     <path d="M600,944 H664"/><path d="M664,944 L704,926"/><path d="M664,944 L704,962"/>
   </g>`,
)

// deposit -> return route rails, collected under the cards
;[0, 1, 2, 3].forEach((i) => {
  const from = walletsX[i] + 52
  const railY = 1004 + i * 10
  // land under card 7 (x 560-860), evenly spaced
  const up = 806 - i * 62
  parts.push(
    `<path d="M${from},998 V${railY} H${up} V980" stroke="${NEON}" stroke-opacity="0.4" stroke-width="1.4" fill="none" marker-end="url(#headNeon)"/>`,
  )
})

// ---------------------------------------------------------------- confidential balance C (return)
parts.push(card(70, 828, 300, 150, { private: true }))
parts.push(`<g transform="translate(104 862)" fill="none" stroke="${NEON}" stroke-width="1.6" stroke-opacity="0.85">
    <ellipse cx="14" cy="6" rx="14" ry="6"/><path d="M0 6 V20 a14 6 0 0 0 28 0 V6"/>
  </g>`)
parts.push(lockIcon(158, 862))
parts.push(text(104, 916, 'Confidential balance C', { size: 16, weight: 600 }))
parts.push(text(104, 936, 'Same account C', { size: 12, fill: MUTED }))
parts.push(mono(104, 962, 'FAR · private ledger', { fill: NEON }))
parts.push(arrow(552, 902, 382, 902, { neon: true, stroke: 'rgba(49,196,126,0.5)' }))

// ---------------------------------------------------------------- 8 payout quotes
parts.push(card(120, 622, 300, 96))
parts.push(badge(152, 656, '8'))
parts.push(text(178, 652, 'Aurora confidential', { size: 15, weight: 600 }))
parts.push(text(178, 672, 'payout quotes', { size: 15, weight: 600 }))
parts.push(arrow(220, 820, 220, 726, { neon: true, stroke: 'rgba(49,196,126,0.5)' }))

// ---------------------------------------------------------------- fresh wallets
const freshX = [120, 226, 332]
freshX.forEach((x, i) => {
  parts.push(card(x, 470, 92, 74, { r: 14 }))
  parts.push(walletIcon(x + 35, 486))
  parts.push(text(x + 46, 528, `R${i + 1}`, { size: 15, weight: 600, anchor: 'middle' }))
  parts.push(arrow(x + 46, 614, x + 46, 552, { neon: true, stroke: 'rgba(49,196,126,0.5)' }))
})
parts.push(text(452, 500, 'Fresh withdrawal addresses', { size: 15, weight: 600 }))
parts.push(text(452, 522, 'Controlled by the same Mera passkey', { size: 12, fill: MUTED }))

// ---------------------------------------------------------------- footer notes
parts.push(card(70, 1058, 1540, 0.5, { r: 0 }))
const notes = [
  ['Same passkey controls F, C, A1-A4 and R1-R3.', 'New addresses do not require new passkeys.'],
  ['Public: chain transfers and vault activity.', 'Private: internal FAR balances and routing.'],
  ['Amounts and timing can still correlate activity.', 'App coordinates separate routes; execution is not atomic.'],
]
notes.forEach(([a, b], i) => {
  const x = 340 + i * 500
  parts.push(text(x, 1082, a, { size: 11.5, fill: MUTED, anchor: 'middle' }))
  parts.push(text(x, 1100, b, { size: 11.5, fill: FAINT, anchor: 'middle' }))
  if (i < 2) parts.push(`<path d="M${x + 250},1070 V1104" stroke="${LINE}"/>`)
})

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <marker id="head" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="rgba(223,232,227,0.45)"/>
    </marker>
    <marker id="headNeon" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="${NEON}" fill-opacity="0.7"/>
    </marker>
  </defs>
  ${parts.join('\n  ')}
</svg>`

writeFileSync(join(HERE, 'earn-cycle.svg'), svg)
console.log('earn-cycle.svg written')
