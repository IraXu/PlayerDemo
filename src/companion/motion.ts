/** Scene coordinates are shared by both actors: a mouth can actually meet its target. */
export type TheaterScene = 'pet' | 'nuzzle' | 'bite' | 'grape' | 'coffee'
export type Expression = 'calm' | 'content' | 'curious' | 'mischief' | 'surprised'
export interface BiteTarget { x: number; y: number; label: string }
export interface ActorPose {
  x: number; y: number; lean: number; squash: number
  head: number; headX: number; headY: number
  earLeft: number; earRight: number; tail: number
  pawLeft: number; pawRight: number
  jaw: number; blink: number; expression: Expression; opacity: number
}
export interface SceneFrame {
  cat: ActorPose; fox: ActorPose; impact: number; sniff: number; sparkle: number
  coffee?: { x: number; y: number; angle: number; opacity: number; held: number; sip: number }
  biteMark: number; foxInFront: boolean; bitePoint: { x: number; y: number }
}
export const durations: Record<TheaterScene, number> = { pet: 2.8, nuzzle: 5.8, bite: 5.1, grape: 7.4, coffee: 8.4 }
export const cues: Record<TheaterScene, { at: number; name: string }[]> = {
  coffee: [{ at: 1, name: 'coffee-fox' }, { at: 4.4, name: 'coffee-cat' }],
  pet: [{ at: .45, name: 'hearts' }],
  nuzzle: [{ at: 1.55, name: 'contact' }, { at: 1.7, name: 'hearts' }, { at: 2.65, name: 'hearts' }, { at: 3.5, name: 'hearts' }],
  bite: [{ at: 1.5, name: 'ready' }, { at: 2.22, name: 'bite' }, { at: 2.65, name: 'reveal' }],
  grape: [{ at: 1.4, name: 'contact' }, { at: 3.15, name: 'reveal' }, { at: 3.85, name: 'grapes' }],
}
const clamp = (x: number) => Math.max(0, Math.min(1, x))
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p) }
const ramp = (t: number, from: number, to: number) => ease((t - from) / (to - from))
const pulse = (t: number, from: number, peak: number, to: number) => ramp(t, from, peak) * (1 - ramp(t, peak, to))
const neutral = (x = 0): ActorPose => ({
  x, y: 0, lean: 0, squash: 1, head: 0, headX: 0, headY: 0,
  earLeft: 0, earRight: 0, tail: 0, pawLeft: 0, pawRight: 0,
  jaw: 0, blink: 1, expression: 'calm', opacity: 1,
})
function blink(t: number, at: number) { return 1 - .93 * pulse(t, at, at + .065, at + .16) }

interface Point { x: number; y: number }
function rotatePoint(point: Point, cx: number, cy: number, degrees: number): Point {
  const angle = degrees * Math.PI / 180, dx = point.x - cx, dy = point.y - cy
  return { x: cx + dx * Math.cos(angle) - dy * Math.sin(angle), y: cy + dx * Math.sin(angle) + dy * Math.cos(angle) }
}
/** Apply the same head, body squash and body lean order as CompanionActor's SVG groups. */
function actorPoint(pose: ActorPose, point: Point, onHead = false): Point {
  let transformed = point
  if (onHead) {
    transformed = rotatePoint(transformed, 50, 65, pose.head)
    transformed = { x: transformed.x + pose.headX, y: transformed.y + pose.headY }
  }
  transformed = { x: transformed.x, y: 91 + (transformed.y - 91) * pose.squash }
  transformed = rotatePoint(transformed, 50, 91, pose.lean)
  return { x: transformed.x + pose.x, y: transformed.y + pose.y }
}

/** Bubble tail follows the actor's head through its body and neck transforms. */
export function actorSpeechAnchor(pose: ActorPose): Point {
  const top = actorPoint(pose, { x: 50, y: 10 }, true)
  return { x: top.x, y: top.y - 10 }
}

/** Compact muzzle: the animated lip contact stays at (42,59). */
export function foxMouth(pose: ActorPose): Point {
  return actorPoint(pose, { x: 42, y: 59 }, true)
}

/** A bitten feature moves with its actual parent joint, not just the cat's translation. */
export function catBitePoint(pose: ActorPose, target: BiteTarget): Point {
  let point: Point = { x: target.x, y: target.y }
  const right = target.x >= 50
  const onHead = ['耳朵', '头顶', '脸颊'].includes(target.label)
  if (target.label === '耳朵') point = rotatePoint(point, right ? 68 : 33, 31, right ? pose.earRight : pose.earLeft)
  else if (target.label === '前爪') point = rotatePoint(point, right ? 65 : 35, 72, right ? pose.pawRight : pose.pawLeft)
  else if (target.label === '尾巴') point = rotatePoint(point, 69, 80, pose.tail)
  return actorPoint(pose, point, onHead)
}

export function sampleScene(scene: TheaterScene, t: number, target: BiteTarget, reduced = false): SceneFrame {
  const cat = neutral(), fox = neutral(89)
  const frame: SceneFrame = { cat, fox, impact: 0, sniff: 0, sparkle: 0, biteMark: 0, foxInFront: false, bitePoint: { x: target.x, y: target.y } }
  cat.y = Math.sin(t * 2.4) * -.5
  cat.tail = Math.sin(t * 2.5) * 5
  cat.blink = blink(t, .8) * blink(t, 4.1)
  fox.blink = blink(t, .5) * blink(t, 3.6)
  fox.tail = Math.sin(t * 3.1) * 9
  if (scene !== 'pet') {
    const arrive = ramp(t, 0, .8), leave = ramp(t, durations[scene] - .8, durations[scene])
    fox.x += 48 * (1 - arrive) + 48 * leave
    fox.opacity = ramp(t, 0, .15) * (1 - leave)
    fox.y = -Math.abs(Math.sin(t * 15)) * 2.6 * (1 - arrive)
    fox.pawLeft = Math.sin(t * 15) * 16 * (1 - arrive)
    fox.pawRight = -fox.pawLeft
    fox.earRight = -8 * pulse(t, .8, .95, 1.2)
  }
  if (scene === 'pet') {
    const receive = pulse(t, .08, .4, 2.4), purr = Math.sin(t * 11) * receive
    cat.expression = 'content'
    cat.blink = 1 - receive * .93
    cat.head = -9 * receive + purr * 1.5
    cat.headY = 2 * receive
    cat.squash = 1 - .035 * receive
    cat.pawRight = -18 * pulse(t, .5, .85, 1.7)
    cat.earLeft = 12 * pulse(t, .3, .42, .65)
    cat.earRight = -8 * pulse(t, .65, .77, 1)
    cat.tail = Math.sin(t * 5) * 14 * receive
    fox.opacity = 0
  }
  if (scene === 'nuzzle') {
    const meet = ramp(t, .85, 1.55) * (1 - ramp(t, 4.15, 4.85))
    const rub = Math.sin((t - 1.55) * Math.PI * 2 / 1.12) * pulse(t, 1.35, 1.65, 4.25)
    cat.x = 12 * meet
    cat.lean = 3 * meet
    cat.head = 9 * meet + rub * 5
    cat.headX = meet * (3 + rub * 2)
    cat.headY = rub * 1.5
    cat.pawRight = -22 * meet
    cat.pawLeft = 3 * meet
    cat.blink = 1 - .94 * meet
    cat.expression = meet > .5 ? 'content' : 'curious'
    cat.tail = Math.sin(t * 4) * (6 + meet * 7)
    fox.x -= 38 * meet
    fox.head = -9 * meet - rub * 3
    fox.headX = -meet * 2
    fox.headY = meet + rub
    fox.blink = 1 - .94 * meet
    fox.expression = 'content'
    fox.pawLeft = 10 * meet
    fox.earLeft = Math.sin(t * 5) * 4 * meet
    fox.tail = Math.sin(t * 3.8 - .4) * 16
  }
  if (scene === 'bite') {
    const crouch = pulse(t, 1.05, 1.5, 1.9)
    const launch = ramp(t, 1.85, 2.22), release = ramp(t, 2.55, 3.25)
    const grab = launch * (1 - release)
    fox.expression = 'mischief'
    fox.head = -5 * pulse(t, .8, 1.1, 1.45)
    fox.squash = 1 - crouch * .1
    fox.lean = crouch * 4
    fox.earLeft = 18 * crouch; fox.earRight = -15 * crouch
    const lowTarget = target.label === '前爪'
    const reach = ramp(t, 1.5, 1.92) * (1 - ramp(t, 2.65, 3.25))
    // Low bites bend the neck and torso; they must not translate the feet underground.
    const reachAngle = lowTarget ? -48 : target.label === '尾巴' ? -14 : target.label === '脸颊' ? 8 : 18
    fox.head += reachAngle * reach
    fox.headY += (lowTarget ? 19 : target.label === '尾巴' ? 2 : 0) * reach
    fox.squash -= (lowTarget ? .12 : 0) * reach
    const liftPaws = lowTarget ? .2 : 1
    fox.pawLeft += -27 * pulse(t, 1.8, 2.12, 2.7) * liftPaws
    fox.pawRight += 20 * pulse(t, 1.8, 2.12, 2.7) * liftPaws
    fox.jaw = 32 * ramp(t, 1.5, 1.85) * (1 - ramp(t, 2.22, 2.42))
    fox.jaw += 3 * pulse(t, 2.25, 2.43, 2.65)
    frame.foxInFront = t > 1.8 && t < 3.25
    const flinch = pulse(t, 2.22, 2.44, 3.2)
    cat.x = -4 * flinch
    cat.y -= 5 * flinch
    cat.head = -9 * flinch
    cat.earLeft = 15 * flinch; cat.earRight = -12 * flinch
    cat.pawRight = -23 * flinch
    cat.tail = -18 * flinch
    cat.jaw = 15 * flinch
    cat.expression = t > 2.22 && t < 3.2 ? 'surprised' : t > 3.2 ? 'curious' : 'calm'
    cat.blink = t > 2.24 && t < 2.47 ? .12 : 1
    fox.blink *= 1 - .8 * pulse(t, 2.23, 2.36, 2.56)
    frame.impact = pulse(t, 2.22, 2.29, 2.55)
    frame.biteMark = pulse(t, 2.3, 2.5, 3.4)
    if (t > 3.2) {
      cat.head = 6 * pulse(t, 3.2, 3.65, 4.5)
      fox.head = -7 * pulse(t, 3.2, 3.65, 4.3)
    }
    // Compute the cat's final pose first. During the grasp, track the feature as
    // the cat flinches, including rotations of the head, ears, tail and paw.
    const contact = catBitePoint(cat, target)
    const mouth = foxMouth(fox)
    fox.x += (contact.x - mouth.x) * grab
    fox.y += (contact.y - mouth.y) * grab - (lowTarget ? 3 : 12) * Math.sin(Math.PI * launch) * (1 - release)

  }
  if (scene === 'grape') {
    const meet = ramp(t, .85, 1.4) * (1 - ramp(t, 3.1, 3.55))
    const nose = Math.max(0, Math.sin((t - 1.4) * Math.PI * 2 / .56)) * (t >= 1.4 && t < 3.08 ? 1 : 0)
    fox.x -= 45 * meet + nose * 1.8
    fox.head = -10 * meet - nose * 3
    fox.headY = 2 * meet
    fox.earLeft = -4 * nose; fox.earRight = 6 * nose
    fox.expression = 'curious'
    cat.expression = t > 3.15 ? 'surprised' : 'curious'
    const gaze = ramp(t, 3.65, 4.1) * (1 - ramp(t, 5.45, 6.25))
    cat.head = 6 * meet - 8 * gaze
    cat.blink = blink(t, 1.9) * blink(t, 5)
    cat.earRight = -12 * pulse(t, 1.45, 1.55, 1.8)
    cat.jaw = 7 * pulse(t, 3.6, 3.9, 4.4)
    fox.jaw = 7 * pulse(t, 3.15, 3.33, 3.5) + 6 * pulse(t, 3.5, 3.66, 3.82)
    const follow = pulse(t, 3.85, 4.35, 5.4)
    cat.head += follow * 14
    fox.head += follow * 12
    cat.headY = 2 * follow
    fox.headY += 2 * follow
    cat.pawRight = -12 * pulse(t, 4.2, 4.5, 5)
    frame.sniff = nose * .65
    frame.sparkle = pulse(t, 3.15, 3.4, 3.9)
  }
  if (scene === 'coffee') {
    const lift = ramp(t, 1.95, 2.6) * (1 - ramp(t, 4.65, 5.35))
    const ask = ramp(t, 4.4, 5.1) * (1 - ramp(t, 6.4, 7.1))
    const sip = (pulse(t, 2.65, 2.85, 3.1) + pulse(t, 3.25, 3.45, 3.7))
    // Keep the chin overlapping the shoulders; lift the cup, not the detached head.
    fox.headY = -2 * lift
    fox.head = -4 * lift
    fox.blink = 1 - .9 * lift
    fox.expression = 'content'
    fox.pawLeft = -65 * lift
    fox.pawRight = 60 * lift
    fox.tail = Math.sin(t * 3) * (8 + 5 * lift)
    fox.jaw = 5 * pulse(t, 1, 1.18, 1.42) + 5 * pulse(t, 1.45, 1.65, 1.88) + 3 * sip
    cat.x = 13 * ask
    cat.head = 8 * ask
    cat.pawRight = -24 * ask
    cat.expression = ask > .2 ? 'curious' : 'calm'
    cat.jaw = 6 * pulse(t, 4.4, 4.6, 4.85) + 6 * pulse(t, 4.9, 5.1, 5.35)
    const mouth = foxMouth(fox)
    frame.coffee = {
      x: (fox.x + 48) * (1 - lift) + mouth.x * lift,
      y: 60 * (1 - lift) + mouth.y * lift,
      angle: -5 * lift, opacity: fox.opacity, held: lift, sip,
    }
  }
  if (reduced) {
    // Keep the story's expressions and open mouth, without travel, shaking or floating.
    Object.assign(cat, { x: scene === 'nuzzle' ? 10 : 0, y: 0, lean: 0, squash: 1, head: 0, headX: 0, headY: 0, tail: 0, earLeft: 0, earRight: 0, pawLeft: 0, pawRight: 0 })
    Object.assign(fox, { x: scene === 'nuzzle' ? 70 : 88, y: 0, lean: 0, squash: 1, head: 0, headX: 0, headY: 0, tail: 0, earLeft: 0, earRight: 0, pawLeft: 0, pawRight: 0, opacity: scene === 'pet' ? 0 : 1 })
    frame.impact = frame.sniff = frame.sparkle = 0
    if (frame.coffee) frame.coffee = { x: fox.x + 44, y: 60, angle: 0, opacity: 1, held: 0, sip: 0 }
  }
  frame.bitePoint = catBitePoint(cat, target)
  return frame
}
