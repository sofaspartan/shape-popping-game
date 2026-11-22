/** Saturated cartoon fills — coral/lime/sky/gold, not purple-on-white defaults. */
export const FILL_COLORS = [
  '#FF4D6D', // hot coral
  '#FF8A3D', // tangerine
  '#FFE566', // sunny yellow
  '#7CFF6B', // lime
  '#3DDCFF', // sky
  '#4D7CFF', // royal blue
  '#FF5EC8', // magenta pink
  '#FFB347', // soft orange
  '#2EE6A6', // mint
  '#FFFFFF', // crisp white
] as const

export function randomColor(): string {
  return FILL_COLORS[Math.floor(Math.random() * FILL_COLORS.length)]!
}
