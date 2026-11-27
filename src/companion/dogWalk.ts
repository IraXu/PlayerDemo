export interface Point { x: number; y: number }
export interface WalkRoute { start: Point; controlA: Point; controlB: Point; end: Point }
export const DOG_COLLAR = { x: 34, y: 71 }
export const CAT_LEASH = { x: 64, y: 87 }
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n))

/** Keep the entire pair in view; the curve stays inside its control points' bounds. */
export function createWalkRoute(start: Point, bounds: { minX: number; maxX: number; minY: number; maxY: number }, random = Math.random, direction?: 'left' | 'right'): WalkRoute {
  const { minX, maxX, minY, maxY } = bounds
  const width = maxX - minX, height = maxY - minY
  const right = direction ? direction === 'right' : start.x < (minX + maxX) / 2
  const end = {
    x: right ? maxX - width * random() * .22 : minX + width * random() * .22,
    y: clamp(start.y + (random() - .5) * height * .8, minY, maxY),
  }
  return {
    start, end,
    controlA: { x: clamp(start.x + (end.x - start.x) * .3, minX, maxX), y: minY + height * random() },
    controlB: { x: clamp(start.x + (end.x - start.x) * .75, minX, maxX), y: minY + height * random() },
  }
}
export function sampleWalkRoute(route: WalkRoute, progress: number): Point {
  const p = clamp(progress, 0, 1), t = p * p * (3 - 2 * p), u = 1 - t
  return {
    x: u ** 3 * route.start.x + 3 * u * u * t * route.controlA.x + 3 * u * t * t * route.controlB.x + t ** 3 * route.end.x,
    y: u ** 3 * route.start.y + 3 * u * u * t * route.controlA.y + 3 * u * t * t * route.controlB.y + t ** 3 * route.end.y,
  }
}
export function leashPath(hand: Point, collar: Point, time: number) {
  const slack = Math.min(22, Math.hypot(hand.x - collar.x, hand.y - collar.y) * .28)
  return `M${hand.x} ${hand.y} Q${(hand.x + collar.x) / 2} ${Math.max(hand.y, collar.y) + slack + Math.sin(time * 5) * 1.5} ${collar.x} ${collar.y}`
}

/** The dog samples the earlier part of the same path, behind the leading cat. */
export function sampleWalkPair(route: WalkRoute, progress: number, dogOffset: Point) {
  const cat = sampleWalkRoute(route, progress)
  const behind = sampleWalkRoute(route, Math.max(0, progress - .055 * Math.sin(Math.PI * progress)))
  return { cat, dog: { x: behind.x + dogOffset.x, y: behind.y + dogOffset.y } }
}
