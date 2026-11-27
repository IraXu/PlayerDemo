<template>
  <div class="kuro-habitat">
    <div ref="petRef" class="kuro-pet" :class="{ carrying, detached }"
      :style="detached ? { left: `${position.x}px`, top: `${position.y}px` } : undefined">
      <KuroCat mode="sit" :reduced-motion="reducedMotion" @drag-start="startDrag" @drag-move="moveDrag" @drag-end="carrying = false" />
      <span class="kuro-pet-hint">按住拎起</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import KuroCat from './KuroCat.vue'
const petRef = ref<HTMLElement>()
const detached = ref(false)
const carrying = ref(false)
const reducedMotion = ref(false)
const position = reactive({ x: 0, y: 0 })
let origin = { x: 0, y: 0 }
let preference: MediaQueryList | undefined
const size = () => ({ w: petRef.value?.offsetWidth ?? 280, h: petRef.value?.offsetHeight ?? 249 })
function clampPosition() {
  if (!detached.value) return
  const { w, h } = size()
  position.x = Math.max(0, Math.min(innerWidth - w, position.x))
  position.y = Math.max(0, Math.min(innerHeight - h - 16, position.y))
}
function startDrag() {
  const rect = petRef.value!.getBoundingClientRect()
  position.x = rect.left
  position.y = rect.top
  detached.value = true
  origin = { ...position }
  carrying.value = true
}
function moveDrag(dx: number, dy: number) {
  position.x = origin.x + dx
  position.y = origin.y + dy
  clampPosition()
}
function syncMotion() { reducedMotion.value = preference?.matches ?? false }
onMounted(() => {
  preference = matchMedia('(prefers-reduced-motion: reduce)')
  syncMotion()
  preference.addEventListener('change', syncMotion)
  window.addEventListener('resize', clampPosition)
})
onBeforeUnmount(() => {
  preference?.removeEventListener('change', syncMotion)
  window.removeEventListener('resize', clampPosition)
})
</script>

<style scoped>
.kuro-habitat { flex: 1; min-height: 240px; display: grid; place-items: center; }
.kuro-pet { position: relative; z-index: 25; width: 280px; height: 249px; user-select: none; -webkit-touch-callout: none; }
.kuro-pet.detached { position: fixed; }
.kuro-pet-hint { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 10px; color: #829aac; pointer-events: none; opacity: 0; transition: opacity .2s; }
.kuro-pet:hover .kuro-pet-hint { opacity: 1; }
.kuro-pet.carrying .kuro-pet-hint { opacity: 0; }
@media (max-width: 720px) {
  .kuro-habitat { min-height: 200px; }
  .kuro-pet { width: min(216px, 72vw); height: auto; aspect-ratio: 9 / 8; }
}
</style>
