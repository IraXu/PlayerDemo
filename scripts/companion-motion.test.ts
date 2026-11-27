import { createWalkRoute, sampleWalkRoute, sampleWalkPair, leashPath } from '../src/companion/dogWalk.ts'
import { createScenePicker, interactionScenes, createDogPicker, dogStyles } from '../src/companion/selection.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { catBitePoint, cues, durations, foxMouth, sampleScene } from '../src/companion/motion.ts'
import type { ActorPose, BiteTarget, TheaterScene } from '../src/companion/motion.ts'

const targets: BiteTarget[] = [
  { x: 73, y: 23, label: '耳朵' },
  { x: 75, y: 53, label: '脸颊' },
  { x: 84, y: 68, label: '尾巴' },
  { x: 64, y: 87, label: '前爪' },
]
const scenes = Object.keys(durations) as TheaterScene[]
const near = (a: number, b: number, epsilon = 1e-8) => assert.ok(Math.abs(a - b) < epsilon, `${a} should be close to ${b}`)

// These matrices describe the SVG transform contract, independently of the
// procedural timeline implementation. A rotated head translated inside a
// squashed/leaning torso must yield the same world-space mouth location.
type Matrix = [number, number, number, number, number, number]
function product(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
  ]
}
const translate = (x: number, y: number): Matrix => [1, 0, 0, 1, x, y]
function rotation(degrees: number, x: number, y: number): Matrix {
  const angle = degrees * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle)
  return product(product(translate(x, y), [c, s, -s, c, 0, 0]), translate(-x, -y))
}
function svgMouth(p: ActorPose) {
  const transforms: Matrix[] = [
    translate(p.x, p.y), rotation(p.lean, 50, 91),
    translate(0, 91 * (1 - p.squash)), [1, 0, 0, p.squash, 0, 0],
    translate(p.headX, p.headY), rotation(p.head, 50, 65),
  ]
  const m = transforms.reduce(product)
  return { x: m[0] * 42 + m[2] * 59 + m[4], y: m[1] * 42 + m[3] * 59 + m[5] }
}

test('mouth geometry matches the nested SVG transforms, including squash and both translations', () => {
  const pose = { ...sampleScene('pet', 0, targets[0]!).fox,
    x: 81, y: -14, lean: 17, squash: .83, head: -24, headX: 3.5, headY: -2,
  }
  const expected = svgMouth(pose), actual = foxMouth(pose)
  near(actual.x, expected.x)
  near(actual.y, expected.y)
})

test('the fox holds each bitten feature as the cat flinches, rather than the untransformed target', () => {
  for (const target of targets) {
    for (let ms = 2220; ms <= 2550; ms += 10) {
      const frame = sampleScene('bite', ms / 1000, target)
      const mouth = foxMouth(frame.fox), point = catBitePoint(frame.cat, target)
      near(mouth.x, point.x)
      near(mouth.y, point.y)
      assert.deepEqual(frame.bitePoint, point, 'impact and mark need the same moving anchor')
    }
    const flinchFrame = sampleScene('bite', 2.44, target)
    assert.ok(Math.hypot(flinchFrame.bitePoint.x - target.x, flinchFrame.bitePoint.y - target.y) > 1,
      'a flinching feature must not be anchored to its original position')
  }
})

test('each feature inherits only its proper joint', () => {
  const base = sampleScene('pet', 0, targets[0]!).cat
  const pose = { ...base, head: 25, headX: 4, headY: -3, earRight: 17, tail: -20, pawRight: -30 }
  for (const target of targets) {
    const onHead = ['耳朵', '脸颊'].includes(target.label)
    const changedOtherJoints = { ...pose, ...(onHead ? { tail: 99, pawRight: 99 } : { head: 99, headX: 99, headY: 99, earRight: 99 }) }
    assert.deepEqual(catBitePoint(pose, target), catBitePoint(changedOtherJoints, target))
    assert.notDeepEqual(catBitePoint(base, target), catBitePoint(pose, target))
  }
})

test('jaw opens clearly before contact, then closes and retreats', () => {
  const target = targets[1]!
  const biteCue = cues.bite.find(cue => cue.name === 'bite')!.at
  for (const at of [1.85, 1.95, 2.05, 2.15, biteCue]) {
    assert.ok(sampleScene('bite', at, target).fox.jaw >= 30, `mouth should be open at ${at}s`)
  }
  assert.ok(sampleScene('bite', 2.5, target).fox.jaw < 5)
  const retreat = sampleScene('bite', 3.3, target)
  assert.ok(Math.hypot(foxMouth(retreat.fox).x - retreat.bitePoint.x, foxMouth(retreat.fox).y - retreat.bitePoint.y) > 15)
})

test('cues are ordered, fall inside their scene, and the grape reveal follows all three sniffs', () => {
  for (const scene of scenes) {
    for (let i = 0; i < cues[scene].length; i++) {
      const cue = cues[scene][i]!
      assert.ok(cue.at >= 0 && cue.at < durations[scene])
      if (i) assert.ok(cue.at > cues[scene][i - 1]!.at)
    }
  }
  const reveal = cues.grape.find(cue => cue.name === 'reveal')!.at
  const grapes = cues.grape.find(cue => cue.name === 'grapes')!.at
  assert.ok(reveal >= 1.4 + .56 * 3)
  assert.ok(grapes > reveal)
})

test('poses remain finite and bounded for every target across all scenes', () => {
  for (const scene of scenes) {
    for (const target of targets) {
      for (let t = 0; t <= durations[scene]; t += 1 / 60) {
        const frame = sampleScene(scene, t, target)
        for (const pose of [frame.cat, frame.fox]) {
          for (const [key, value] of Object.entries(pose)) if (typeof value === 'number') assert.ok(Number.isFinite(value), `${scene} ${t} ${key}`)
          assert.ok(pose.squash > 0 && pose.squash <= 1.1)
          assert.ok(pose.opacity >= 0 && pose.opacity <= 1)
          assert.ok(pose.blink >= 0 && pose.blink <= 1)
        }
      }
    }
  }
})

test('head rotation does not snap at the grape cue and returns to rest before departure', () => {
  const left = sampleScene('grape', 3.85 - 1e-6, targets[1]!)
  const right = sampleScene('grape', 3.85 + 1e-6, targets[1]!)
  assert.ok(Math.abs(left.cat.head - right.cat.head) < .001)
  near(sampleScene('grape', durations.grape - .1, targets[1]!).cat.head, 0)
})

test('reduced motion removes travel and body movement while keeping mouth and expressions', () => {
  for (const scene of scenes) {
    for (let t = 0; t <= durations[scene]; t += .05) {
      const { cat, fox, impact, sniff, sparkle } = sampleScene(scene, t, targets[1]!, true)
      for (const pose of [cat, fox]) {
        for (const key of ['y', 'lean', 'head', 'headX', 'headY', 'tail', 'earLeft', 'earRight', 'pawLeft', 'pawRight'] as const) assert.equal(pose[key], 0)
        assert.equal(pose.squash, 1)
      }
      assert.equal(cat.x, scene === 'cry' ? 15 : scene === 'nuzzle' ? 10 : 0)
      assert.equal(fox.x, scene === 'cry' ? 46 : scene === 'nuzzle' ? 70 : 88)
      assert.equal(impact + sniff + sparkle, 0)
    }
  }
  assert.ok(sampleScene('bite', 2, targets[1]!, true).fox.jaw >= 30)
  assert.equal(sampleScene('bite', 2.4, targets[1]!, true).cat.expression, 'surprised')
})

test('sampling is deterministic and never mutates the caller target', () => {
  const target = Object.freeze({ ...targets[0]! })
  const a = sampleScene('bite', 2.44, target)
  const b = sampleScene('bite', 2.44, target)
  assert.deepEqual(a, b)
  a.cat.head = 999
  assert.notEqual(sampleScene('bite', 2.44, target).cat.head, 999)
  assert.deepEqual(target, targets[0])
})

test('a low front-paw bite lowers the head instead of pushing the fox feet through the floor', () => {
  const target = targets.find(item => item.label === '前爪')!
  for (let ms = 1850; ms <= 3250; ms += 10) {
    const { fox } = sampleScene('bite', ms / 1000, target)
    assert.ok(fox.y + 91 <= 96 + 1e-8,
      `front-paw bite placed the planted body pivot below the floor at ${ms}ms: ${fox.y + 91}`)
  }
  for (const t of [2.22, 2.4, 2.55]) {
    const { fox } = sampleScene('bite', t, target)
    assert.ok(fox.head < -30, 'the muzzle should lead downwards toward the paw')
    assert.ok(fox.squash < .96, 'the body should crouch to reach the low target')
  }
})

test('an ear bite lifts off the floor and reaches upward, distinct from the low bite posture', () => {
  const target = targets.find(item => item.label === '耳朵')!
  for (const t of [2.22, 2.4, 2.55]) {
    const { fox } = sampleScene('bite', t, target)
    assert.ok(fox.y < -12, `ear bite should be airborne at ${t}s, got y=${fox.y}`)
    assert.ok(fox.head > 8, 'an ear bite should tilt the muzzle upwards')
  }
})

test('iced coffee reaches the lips for both sips, then lowers before departure', () => {
  for (const t of [2.85, 3.45]) {
    const frame = sampleScene('coffee', t, targets[1]!)
    assert.ok(frame.coffee && frame.coffee.sip > .9)
    const mouth = foxMouth(frame.fox)
    near(frame.coffee.x, mouth.x)
    near(frame.coffee.y, mouth.y)
    assert.ok(frame.coffee.held > .99)
    assert.ok(frame.fox.blink < .2, 'fox enjoys its drink with closed eyes')
  }
  const lowered = sampleScene('coffee', 5.6, targets[1]!).coffee!
  near(lowered.y, 60)
  near(lowered.held, 0)
  const reduced = sampleScene('coffee', 3, targets[1]!, true).coffee!
  near(reduced.angle, 0)
  near(reduced.sip, 0)
  near(reduced.y, 60)
})

test('coffee conversation cues give the fox its line before the cat asks', () => {
  assert.deepEqual(cues.coffee.map(cue => cue.name), ['coffee-fox', 'coffee-cat'])
  assert.ok(cues.coffee[0]!.at < 2.65)
  assert.ok(cues.coffee[1]!.at > 3.7)
  assert.ok(sampleScene('coffee', 5.1, targets[1]!).cat.pawRight < -20)
})


test('coffee keeps the head attached and the lifted cup above the floor', () => {
  for (let t = 0; t < durations.coffee; t += 1 / 60) {
    const { fox, coffee } = sampleScene('coffee', t, targets[1]!)
    assert.ok(fox.headY >= -2, 'head must not lift away from shoulders')
    assert.ok(coffee!.y + 34 <= 95, 'cup should remain above the floor')
  }
})


test('every remaining scene has an equal bucket at every position in a round', () => {
  function checkPrefix(indices: number[], remaining: readonly TheaterScene[]) {
    for (let i = 0; i < remaining.length; i++) {
      for (const fraction of [.01, .5, .99]) {
        let draw = 0
        const pick = createScenePicker(() => {
          const step = draw++
          const rank = step < indices.length ? indices[step]! : i
          const offset = step < indices.length ? .5 : fraction
          return (rank + offset) / (interactionScenes.length - step)
        })
        for (let step = 0; step < indices.length; step++) pick()
        assert.equal(pick(), remaining[i])
      }
      checkPrefix([...indices, i], remaining.filter((_, index) => index !== i))
    }
  }
  checkPrefix([], interactionScenes)
})

test('each round contains every scene exactly once, including across refills', () => {
  let seed = 42
  const seededRandom = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32 }
  for (const random of [() => 0, () => .999999, () => .5, seededRandom]) {
    const pick = createScenePicker(random)
    for (let round = 0; round < 100; round++) {
      const drawn = Array.from({ length: interactionScenes.length }, () => pick())
      assert.equal(new Set(drawn).size, interactionScenes.length)
      assert.deepEqual([...drawn].sort(), [...interactionScenes].sort())
    }
  }
})

test('starting a new round restores equal eligibility for all scenes', () => {
  for (let i = 0; i < interactionScenes.length; i++) {
    let draw = 0
    const pick = createScenePicker(() => draw++ < interactionScenes.length ? 0 : (i + .5) / interactionScenes.length)
    for (let step = 0; step < interactionScenes.length; step++) pick()
    assert.equal(pick(), interactionScenes[i])
  }
})

test('cry scene brings the pair together, sobs, then releases the hug', () => {
  const approaching = sampleScene('cry', 0, targets[0]!)
  const hugging = sampleScene('cry', 3, targets[0]!)
  assert.ok(hugging.fox.x - hugging.cat.x < 35)
  assert.ok(approaching.fox.x - approaching.cat.x > 85)
  assert.ok(hugging.cat.pawRight < -60)
  assert.ok(hugging.fox.pawLeft > 50)
  assert.ok(hugging.cat.blink < .2)
  assert.ok(sampleScene('cry', 7.9, targets[0]!).cat.pawRight > -1)
  assert.deepEqual(cues.cry.map(cue => cue.name), ['sob', 'comfort'])
})


test('random dog walks traverse a broad curve while keeping the pair in bounds', () => {
  for (const width of [320, 390, 1280]) {
    const bounds = { minX: 16, maxX: width - 170, minY: 110, maxY: 550 }
    for (const randomValue of [0, .25, .5, .75, .999]) {
      for (const startX of [bounds.minX, bounds.maxX]) {
        const start = { x: startX, y: 300 }
        const route = createWalkRoute(start, bounds, () => randomValue)
        assert.deepEqual(sampleWalkRoute(route, 0), start)
        assert.deepEqual(sampleWalkRoute(route, 1), route.end)
        assert.ok(Math.abs(route.end.x - start.x) >= (bounds.maxX - bounds.minX) * .77)
        for (let step = 0; step <= 100; step++) {
          const point = sampleWalkRoute(route, step / 100)
          assert.ok(point.x >= bounds.minX - 1e-8 && point.x <= bounds.maxX + 1e-8)
          assert.ok(point.y >= bounds.minY - 1e-8 && point.y <= bounds.maxY + 1e-8)
        }
      }
    }
    const start = { x: bounds.minX, y: 300 }
    assert.notDeepEqual(createWalkRoute(start, bounds, () => .1), createWalkRoute(start, bounds, () => .9))
  }
})

test('leash keeps its exact hand and collar endpoints as its slack moves', () => {
  const hand = { x: 123.25, y: 211.5 }, collar = { x: 178.75, y: 201.25 }
  for (const time of [0, .2, 1, 3]) {
    const path = leashPath(hand, collar, time)
    assert.ok(path.startsWith(`M${hand.x} ${hand.y} Q`))
    assert.ok(path.endsWith(` ${collar.x} ${collar.y}`))
  }
})


test('the dog follows behind the cat for the entire walk in both directions', () => {
  for (const direction of ['left', 'right'] as const) {
    for (const width of [320, 390, 1280]) {
      for (const value of [0, .25, .75, .999]) {
        const bounds = { minX: 100, maxX: width - 100, minY: 110, maxY: 550 }
        const start = { x: direction === 'right' ? bounds.minX : bounds.maxX, y: 300 }
        const offset = { x: direction === 'right' ? -80 : 92, y: 14 }
        const route = createWalkRoute(start, bounds, () => value, direction)
        let previous = start
        for (let step = 0; step <= 200; step++) {
          const pair = sampleWalkPair(route, step / 200, offset)
          if (direction === 'right') {
            assert.ok(pair.cat.x >= previous.x - 1e-8)
            assert.ok(pair.cat.x - pair.dog.x >= 80 - 1e-8, 'dog must stay behind the cat when moving right')
          } else {
            assert.ok(pair.cat.x <= previous.x + 1e-8)
            assert.ok(pair.dog.x - pair.cat.x >= 92 - 1e-8, 'dog must stay behind the cat when moving left')
          }
          previous = pair.cat
        }
      }
    }
  }
})


test('each dog round shows all three dogs once before refilling', () => {
  for (const value of [0, .2, .5, .999]) {
    const pick = createDogPicker(() => value)
    for (let round = 0; round < 100; round++) {
      const dogs = Array.from({ length: dogStyles.length }, () => pick())
      assert.deepEqual([...dogs].sort(), [...dogStyles].sort())
    }
  }
})

test('dog draws are uniform among remaining dogs and independent from cat scenes', () => {
  for (let first = 0; first < 3; first++) {
    for (let second = 0; second < 2; second++) {
      let draw = 0
      const pick = createDogPicker(() => draw++ === 0 ? (first + .5) / 3 : (second + .5) / 2)
      assert.equal(pick(), dogStyles[first])
      const remaining = dogStyles.filter((_, index) => index !== first)
      const scene = createScenePicker(() => 0)
      for (let i = 0; i < 10; i++) scene()
      assert.equal(pick(), remaining[second])
      assert.equal(pick(), remaining[1 - second])
    }
  }
})
