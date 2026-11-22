export type ShapeKind = 'circle' | 'square' | 'hexagon' | 'star'

export type ExitEffect = 'burst' | 'shatter' | 'shrink'

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
  exitEffect: ExitEffect | null
  exitProgress: number
  pieces: Piece[]
}

export interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  spin: number
  size: number
  alpha: number
  color: string
  kind: ShapeKind
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
