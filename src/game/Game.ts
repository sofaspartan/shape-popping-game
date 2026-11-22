import { randomColor } from './colors'
import { drawShapeBody } from './draw'
import type { ExitEffect, Particle, Piece, Shape, ShapeKind } from './types'

const KINDS: ShapeKind[] = ['circle', 'square', 'hexagon', 'star']
const EXIT_EFFECTS: ExitEffect[] = ['burst', 'shatter', 'shrink']
const TARGET_COUNT = 11

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

function easeInBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return c3 * t * t * t - c1 * t * t
}

export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private shapes: Shape[] = []
  private particles: Particle[] = []
  private nextId = 1
  private score = 0
  private scoreEl: HTMLElement
  private hintEl: HTMLElement
  private hintHidden = false
  private running = false
  private raf = 0
  private lastTs = 0
  private dpr = 1
  private width = 0
  private height = 0
  private spawnCooldown = 0

  constructor(canvas: HTMLCanvasElement, scoreEl: HTMLElement, hintEl: HTMLElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.ctx = ctx
    this.scoreEl = scoreEl
    this.hintEl = hintEl

    this.onPointer = this.onPointer.bind(this)
    this.onResize = this.onResize.bind(this)
    this.frame = this.frame.bind(this)
  }

  start(): void {
    this.onResize()
    window.addEventListener('resize', this.onResize)
    this.canvas.addEventListener('pointerdown', this.onPointer)
    for (let i = 0; i < TARGET_COUNT; i++) {
      this.shapes.push(this.createShape(true))
    }
    this.running = true
    this.lastTs = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    this.canvas.removeEventListener('pointerdown', this.onPointer)
  }

  private onResize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5)
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = Math.floor(this.width * this.dpr)
    this.canvas.height = Math.floor(this.height * this.dpr)
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  private createShape(initial = false): Shape {
    const size = rand(56, Math.min(this.width, this.height) * 0.42)
    // Allow partial off-screen scatter like the reference
    const margin = size * 0.35
    const x = rand(-margin, this.width + margin)
    const y = rand(-margin, this.height + margin)

    return {
      id: this.nextId++,
      kind: pick(KINDS),
      x,
      y,
      size,
      rotation: rand(0, Math.PI * 2),
      color: randomColor(),
      scale: initial ? rand(0.85, 1) : 0,
      spawnProgress: initial ? 1 : 0,
      wobblePhase: rand(0, Math.PI * 2),
      wobbleSpeed: rand(0.8, 1.6),
      exiting: false,
      exitEffect: null,
      exitProgress: 0,
      pieces: [],
    }
  }

  private onPointer(e: PointerEvent): void {
    e.preventDefault()
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Top-most first
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i]!
      if (shape.exiting || shape.spawnProgress < 0.6) continue
      if (this.hitTest(shape, x, y)) {
        this.popShape(shape)
        if (!this.hintHidden) {
          this.hintHidden = true
          this.hintEl.classList.add('hidden')
        }
        break
      }
    }
  }

  private hitTest(shape: Shape, x: number, y: number): boolean {
    const dx = x - shape.x
    const dy = y - shape.y
    const c = Math.cos(-shape.rotation)
    const s = Math.sin(-shape.rotation)
    const lx = dx * c - dy * s
    const ly = dx * s + dy * c
    const half = (shape.size * shape.scale) / 2
    const pad = half * 1.08

    switch (shape.kind) {
      case 'circle':
        return lx * lx + ly * ly <= pad * pad
      case 'square':
        return Math.abs(lx) <= pad && Math.abs(ly) <= pad
      case 'hexagon':
      case 'star':
        return lx * lx + ly * ly <= pad * pad
    }
  }

  private popShape(shape: Shape): void {
    shape.exiting = true
    shape.exitEffect = pick(EXIT_EFFECTS)
    shape.exitProgress = 0
    this.score += 1
    this.scoreEl.textContent = String(this.score)
    this.scoreEl.parentElement?.classList.remove('bump')
    // retrigger CSS animation
    void this.scoreEl.parentElement?.offsetWidth
    this.scoreEl.parentElement?.classList.add('bump')

    if (shape.exitEffect === 'shatter') {
      shape.pieces = this.makePieces(shape)
    }

    if (shape.exitEffect === 'burst') {
      this.spawnBurstParticles(shape)
    }
  }

  private makePieces(shape: Shape): Piece[] {
    const pieces: Piece[] = []
    const count = 5 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rand(-0.3, 0.3)
      const speed = rand(180, 420)
      pieces.push({
        x: shape.x,
        y: shape.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(40, 120),
        rotation: shape.rotation + rand(-0.5, 0.5),
        spin: rand(-8, 8),
        size: shape.size * rand(0.18, 0.38),
        alpha: 1,
        color: shape.color,
        kind: shape.kind,
      })
    }
    return pieces
  }

  private spawnBurstParticles(shape: Shape): void {
    const n = 14 + Math.floor(Math.random() * 8)
    for (let i = 0; i < n; i++) {
      const angle = rand(0, Math.PI * 2)
      const speed = rand(120, 520)
      this.particles.push({
        x: shape.x,
        y: shape.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: rand(0.35, 0.7),
        size: rand(4, 14),
        color: Math.random() > 0.35 ? shape.color : '#111111',
        rotation: rand(0, Math.PI * 2),
        spin: rand(-10, 10),
      })
    }
  }

  private frame(ts: number): void {
    if (!this.running) return
    const dt = Math.min(0.033, (ts - this.lastTs) / 1000)
    this.lastTs = ts

    this.update(dt)
    this.draw()
    this.raf = requestAnimationFrame(this.frame)
  }

  private update(dt: number): void {
    this.spawnCooldown = Math.max(0, this.spawnCooldown - dt)

    for (const shape of this.shapes) {
      if (!shape.exiting && shape.spawnProgress < 1) {
        shape.spawnProgress = Math.min(1, shape.spawnProgress + dt * 2.4)
        shape.scale = easeOutBack(shape.spawnProgress)
      }

      shape.wobblePhase += dt * shape.wobbleSpeed

      if (shape.exiting && shape.exitEffect) {
        shape.exitProgress = Math.min(1, shape.exitProgress + dt * (shape.exitEffect === 'shrink' ? 2.2 : 2.8))

        if (shape.exitEffect === 'burst') {
          const t = shape.exitProgress
          if (t < 0.35) {
            shape.scale = 1 + easeOutBack(t / 0.35) * 0.55
          } else {
            shape.scale = Math.max(0, 1.55 * (1 - (t - 0.35) / 0.65) ** 1.4)
          }
        } else if (shape.exitEffect === 'shrink') {
          const t = easeInBack(shape.exitProgress)
          shape.scale = Math.max(0, 1 - t)
          shape.rotation += dt * 10
        } else if (shape.exitEffect === 'shatter') {
          shape.scale = Math.max(0, 1 - shape.exitProgress * 3)
          for (const p of shape.pieces) {
            p.vy += 980 * dt
            p.x += p.vx * dt
            p.y += p.vy * dt
            p.rotation += p.spin * dt
            p.alpha = Math.max(0, 1 - shape.exitProgress)
          }
        }
      }
    }

    this.shapes = this.shapes.filter((s) => !(s.exiting && s.exitProgress >= 1))

    for (const p of this.particles) {
      p.life -= dt / p.maxLife
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.96
      p.vy *= 0.96
      p.rotation += p.spin * dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)

    const live = this.shapes.filter((s) => !s.exiting).length
    if (live < TARGET_COUNT && this.spawnCooldown <= 0) {
      this.shapes.push(this.createShape(false))
      this.spawnCooldown = rand(0.05, 0.22)
    }
  }

  private draw(): void {
    const { ctx, width, height } = this
    ctx.clearRect(0, 0, width, height)

    // Soft paper wash so the white field isn't flat
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.35,
      0,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.85,
    )
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(1, '#f3f5f8')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    for (const shape of this.shapes) {
      if (shape.exitEffect === 'shatter' && shape.exiting) {
        for (const p of shape.pieces) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)
          drawShapeBody(ctx, p.kind, p.size, p.color, { shadow: false, alpha: p.alpha })
          ctx.restore()
        }
        if (shape.scale <= 0.05) continue
      }

      const wobble = Math.sin(shape.wobblePhase) * 0.035
      const floatY = Math.sin(shape.wobblePhase * 0.7) * 3.5
      ctx.save()
      ctx.translate(shape.x, shape.y + floatY)
      ctx.rotate(shape.rotation + wobble)
      ctx.scale(shape.scale, shape.scale)
      const alpha =
        shape.exitEffect === 'burst' && shape.exitProgress > 0.45
          ? Math.max(0, 1 - (shape.exitProgress - 0.45) / 0.55)
          : 1
      drawShapeBody(ctx, shape.kind, shape.size, shape.color, { alpha })
      ctx.restore()
    }

    for (const p of this.particles) {
      ctx.save()
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.strokeStyle = '#111111'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
  }
}
