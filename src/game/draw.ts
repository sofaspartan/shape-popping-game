import type { ShapeKind } from './types'

const OUTLINE = '#111111'
/** Absolute outline thickness in CSS pixels — does not scale with shape size. */
export const OUTLINE_WIDTH = 5

export function buildPath(
  ctx: CanvasRenderingContext2D,
  kind: ShapeKind,
  size: number,
): void {
  const r = size / 2
  ctx.beginPath()

  switch (kind) {
    case 'circle':
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      break
    case 'square':
      ctx.rect(-r, -r, size, size)
      break
    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      break
    }
    case 'star': {
      const spikes = 5
      const outer = r
      const inner = r * 0.42
      let rot = -Math.PI / 2
      const step = Math.PI / spikes
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(Math.cos(rot) * outer, Math.sin(rot) * outer)
        rot += step
        ctx.lineTo(Math.cos(rot) * inner, Math.sin(rot) * inner)
        rot += step
      }
      ctx.closePath()
      break
    }
  }
}

export function drawShapeBody(
  ctx: CanvasRenderingContext2D,
  kind: ShapeKind,
  size: number,
  color: string,
  options: { shadow?: boolean; alpha?: number } = {},
): void {
  const { shadow = true, alpha = 1 } = options
  ctx.save()
  ctx.globalAlpha = alpha

  if (shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 5
    ctx.shadowOffsetY = 7
  } else {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  buildPath(ctx, kind, size)
  ctx.fillStyle = color
  ctx.fill()

  // Clear shadow before stroke so outline stays crisp
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  buildPath(ctx, kind, size)
  ctx.lineWidth = OUTLINE_WIDTH
  ctx.strokeStyle = OUTLINE
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.restore()
}
