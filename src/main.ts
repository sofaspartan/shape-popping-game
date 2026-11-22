import './style.css'
import { Game } from './game/Game'

const canvas = document.querySelector<HTMLCanvasElement>('#game')
const scoreEl = document.querySelector<HTMLElement>('#score')
const hintEl = document.querySelector<HTMLElement>('#hint')

if (!canvas || !scoreEl || !hintEl) {
  throw new Error('Missing game DOM nodes')
}

const game = new Game(canvas, scoreEl, hintEl)
game.start()

// Prevent rubber-band scroll / accidental gestures on iOS
document.body.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault()
  },
  { passive: false },
)
