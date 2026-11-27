<template>
  <canvas ref="canvasRef" class="kuro-cat" width="720" height="640" aria-hidden="true"
    @pointerdown="pointerDown" @pointerup="endDrag" @pointercancel="endDrag" @lostpointercapture="endDrag" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ mode: string; reducedMotion: boolean }>()
const emit = defineEmits<{
  dragStart: []
  dragMove: [dx: number, dy: number]
  dragEnd: []
}>()
const canvasRef = ref<HTMLCanvasElement>()
// The upstream renderer is intentionally kept intact; its dynamic skin/state API stays at this boundary.
type Dynamic = Record<string, any>
let renderer: Dynamic, skin: Dynamic, state: Dynamic
let frame = 0, disposed = false, lastFrame = 0, nextBlink = 3
let yaw = 0, pitch = 0, petHead = 0
let drag: { id: number; x: number; y: number; lastX: number; lastY: number; active: boolean } | null = null
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function loadScript(name: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${import.meta.env.BASE_URL}vendor/kurocat/${name}.js`
    script.onload = () => resolve()
    script.onerror = () => { script.remove(); reject(new Error(`Cannot load KuroCat ${name}`)) }
    document.head.append(script)
  })
}

function pointerDown(event: PointerEvent) {
  if (!state || event.button !== 0) return
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, active: false }
  canvasRef.value?.setPointerCapture(event.pointerId)
}
function pointerMove(event: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas || !state) return
  const rect = canvas.getBoundingClientRect()
  yaw = clamp((event.clientX - rect.left - rect.width / 2) / Math.max(220, innerWidth * .42), -1, 1)
  pitch = clamp((event.clientY - rect.top - rect.height * .42) / Math.max(180, innerHeight * .42), -1, 1)
  if (drag && event.pointerId === drag.id) {
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y
    if (!drag.active && Math.hypot(dx, dy) > 6) { drag.active = true; emit('dragStart') }
    if (drag.active) {
      state.dragSwingTarget = clamp((state.dragSwingTarget || 0) * .65 - (event.clientX - drag.lastX) * .065 * .65, -.95, .95)
      state.dragSwingYTarget = clamp((state.dragSwingYTarget || 0) * .65 - (event.clientY - drag.lastY) * .055 * .65, -.78, .78)
      emit('dragMove', dx, dy)
    }
    drag.lastX = event.clientX; drag.lastY = event.clientY
  } else if (event.target === canvas) {
    const hit = renderer.hitTestCat({ x: (event.clientX - rect.left) / rect.width * 360, y: (event.clientY - rect.top) / rect.height * 320 }, skin, state)
    if (hit === 'head') petHead = Math.min(1, petHead + .14)
  }
}
function endDrag(event?: PointerEvent) {
  if (!drag || (event && event.pointerId !== drag.id)) return
  const previous = drag
  drag = null
  if (previous.active) emit('dragEnd')
  else petHead = 1
  if (canvasRef.value?.hasPointerCapture(previous.id)) canvasRef.value.releasePointerCapture(previous.id)
}
function tick(now: number) {
  frame = requestAnimationFrame(tick)
  const dt = Math.min(.05, Math.max(.001, (now - lastFrame) / 1000))
  lastFrame = now
  if (document.hidden) return
  const active = !!drag?.active
  const reduced = props.reducedMotion
  state.time += dt
  state.tailPhase += reduced ? 0 : dt * 2.2
  petHead = Math.max(0, petHead - dt * .55)
  const sleeping = props.mode === 'sleep' && !active
  const happy = props.mode === 'happy' ? 1 : petHead
  const pose = active ? 'drag' : sleeping ? 'sleep' : happy > .15 ? 'petHead' : 'idle'
  const blend = (key: string, target: number) => { state[key] += (target - state[key]) * Math.min(1, dt * 9) }
  blend('headYaw', active || reduced ? 0 : yaw)
  blend('headPitch', active ? 0 : sleeping ? .35 : pitch * .85)
  blend('headTilt', active || reduced ? 0 : yaw * .06)
  blend('bodyTilt', active || reduced ? 0 : yaw * .04)
  blend('eyeGazeX', reduced ? 0 : yaw); blend('eyeGazeY', reduced ? 0 : pitch)
  blend('petHead', active ? 0 : happy); blend('petBody', 0)
  blend('sleepiness', sleeping ? 1 : 0)
  blend('earFold', active ? 0 : sleeping ? .32 : happy * .78)
  blend('bodySquash', active ? 1 : 1 - happy * .05)
  blend('headOffsetY', active ? 0 : sleeping ? 6 : happy * 3)
  if (!reduced && !sleeping && happy < .35 && state.time >= nextBlink) {
    const elapsed = state.time - nextBlink
    state.blinkProgress = elapsed < .08 ? elapsed / .08 : elapsed < .17 ? 1 - (elapsed - .08) / .09 : 0
    if (elapsed >= .17) nextBlink = state.time + 2.6 + Math.random() * 2.4
  } else state.blinkProgress = 0
  state.leftPawActive = false; state.rightPawActive = false
  renderer.stepPhysicsExtras(state, skin, pose, dt)
  for (const [key, rest] of [['leftPaw', renderer.LEFT_PAW_REST], ['rightPaw', renderer.RIGHT_PAW_REST]] as const) {
    if (!state[`${key}Active`]) {
      state[key].x += (rest.x - state[key].x) * Math.min(1, dt * 9)
      state[key].y += (rest.y - state[key].y) * Math.min(1, dt * 9)
    }
  }
  const ctx = canvasRef.value?.getContext('2d')
  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    renderer.drawScene(ctx, skin, state, { kbTheme: 'classicMilk', eyeTheme: 'siameseBlue', whiteOutline: true, hideEquipment: true })
  }
}
onMounted(async () => {
  try {
    const globals = window as unknown as Dynamic
    if (!globals.KuroSpec) await loadScript('spec')
    if (!globals.KuroRenderer) await loadScript('renderer')
    if (disposed) return
    renderer = globals.KuroRenderer
    const spec = globals.KuroSpec
    const response = await fetch(`${import.meta.env.BASE_URL}vendor/kurocat/skins.json`)
    if (!response.ok) throw new Error('Cannot load KuroCat skins')
    const skins: Dynamic[] = await response.json()
    if (disposed) return
    skin = spec.resolveSkin(skins.find(t => t.id === 'siamese')!.skin)
    state = renderer.createDefaultState()
    renderer.preloadDecorations(skin.decorations)
    window.addEventListener('pointermove', pointerMove, { passive: true })
    window.addEventListener('blur', onBlur)
    lastFrame = performance.now()
    frame = requestAnimationFrame(tick)
  } catch (error) { console.error('猫猫加载失败', error) }
})
function onBlur() { endDrag() }
onBeforeUnmount(() => {
  disposed = true
  endDrag()
  cancelAnimationFrame(frame)
  window.removeEventListener('pointermove', pointerMove)
  window.removeEventListener('blur', onBlur)
})
</script>

<style scoped>
.kuro-cat { display: block; width: 100%; height: 100%; touch-action: none; cursor: grab; }
.kuro-cat:active { cursor: grabbing; }
</style>
