export type ShapeKind = 'circle' | 'square' | 'hexagon' | 'star'

export interface Shape {
  id: number
  kind: ShapeKind
  x: number
  y: number
  size: number
  rotation: number
  color: string
  scale: number
  spawnProgress: number
  wobblePhase: number
  wobbleSpeed: number
  exiting: boolean
  exitProgress: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  rotation: number
  spin: number
}
