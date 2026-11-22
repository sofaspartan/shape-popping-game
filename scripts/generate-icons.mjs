import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

function iconSvg(size) {
  const stroke = Math.max(8, Math.round(size * 0.045))
  const r = size * 0.34
  const cx = size / 2
  const cy = size / 2
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  <defs>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="${size * 0.02}" dy="${size * 0.03}" stdDeviation="${size * 0.02}" flood-color="#000" flood-opacity="0.22"/>
    </filter>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FF4D6D" stroke="#111111" stroke-width="${stroke}" filter="url(#s)"/>
  <polygon
    points="${starPoints(cx, cy, 5, r * 0.55, r * 0.24)}"
    fill="#FFE566"
    stroke="#111111"
    stroke-width="${stroke * 0.7}"
    stroke-linejoin="round"
  />
</svg>`
}

function starPoints(cx, cy, spikes, outer, inner) {
  const pts = []
  let rot = -Math.PI / 2
  const step = Math.PI / spikes
  for (let i = 0; i < spikes; i++) {
    pts.push(`${cx + Math.cos(rot) * outer},${cy + Math.sin(rot) * outer}`)
    rot += step
    pts.push(`${cx + Math.cos(rot) * inner},${cy + Math.sin(rot) * inner}`)
    rot += step
  }
  return pts.join(' ')
}

async function writePng(name, size) {
  const buf = await sharp(Buffer.from(iconSvg(size))).png().toBuffer()
  await sharp(buf).toFile(join(outDir, name))
}

await writePng('icon-192.png', 192)
await writePng('icon-512.png', 512)
await writePng('apple-touch-icon.png', 180)

const favicon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#ffffff"/>
  <circle cx="32" cy="32" r="22" fill="#FF4D6D" stroke="#111" stroke-width="4"/>
  <polygon points="32,16 35.5,26.5 46.5,26.5 37.7,33.2 41,44 32,37.8 23,44 26.3,33.2 17.5,26.5 28.5,26.5" fill="#FFE566" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>
</svg>`
await sharp(Buffer.from(favicon)).resize(64, 64).png().toFile(join(root, 'public', 'favicon.png'))

console.log('Icons generated in public/icons')
