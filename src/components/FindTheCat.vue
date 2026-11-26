<template>
  <button
    v-if="!found"
    class="hunt-cat"
    :class="{ searching }"
    :style="spot"
    type="button"
    :aria-label="copy.huntAria"
    @click="catchCat"
  >
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <AnimalArtwork :animal="isBear ? 'bear' : 'cat'" />
    </svg>
  </button>

  <span v-if="burst" class="hunt-burst" :style="spot" aria-hidden="true">
    <SparklesIcon :size="44" color="#ffd166" />
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SparklesIcon } from '../ui/icons'
import AnimalArtwork from './AnimalArtwork.vue'
import { playBearCall, playMeow } from '../sfx'
import { copy, isBear, theme } from '../theme'

withDefaults(defineProps<{ searching?: boolean }>(), { searching: false })
const found = defineModel<boolean>('found', { default: false })
const emit = defineEmits<{ found: [] }>()

/** 只放在页面边缘，避免挡住视频和按钮 */
const SPOTS_DESKTOP: Record<string, string>[] = [
  { top: '9%', left: '5%' },
  { top: '19%', right: '4%' },
  { top: '33%', left: '2%' },
  { top: '44%', right: '2%' },
  { bottom: '26%', left: '3%' },
  { bottom: '34%', right: '3%' },
  { bottom: '12%', right: '16%' },
]

const SPOTS_MOBILE: Record<string, string>[] = [
  { top: '11%', left: '6%' },
  { top: '14%', right: '22%' },
  { bottom: '30%', left: '5%' },
  { bottom: '30%', right: '5%' },
  { bottom: '12%', left: '10%' },
]

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function todayKey() {
  const date = new Date()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function hash(value: string) {
  let result = 2166136261
  for (let i = 0; i < value.length; i++) {
    result ^= value.charCodeAt(i)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

// 两个主题的进度分开记，换回来的时候各自的猫/熊还在原地
function storageKey() {
  return `${isBear.value ? 'bear' : 'cat'}-hunt:${todayKey()}`
}

const burst = ref(false)
const spot = ref<Record<string, string>>(SPOTS_DESKTOP[0])

function pickSpot() {
  const spots = window.innerWidth <= 720 ? SPOTS_MOBILE : SPOTS_DESKTOP
  spot.value = spots[hash(todayKey()) % spots.length]
}

function readFound() {
  try {
    return localStorage.getItem(storageKey()) === '1'
  } catch {
    return false
  }
}

function catchCat() {
  if (found.value) return
  if (isBear.value) playBearCall()
  else playMeow()
  found.value = true
  burst.value = true
  try {
    localStorage.setItem(storageKey(), '1')
  } catch {
    /* 隐私模式下忽略存储失败 */
  }
  emit('found')
  setTimeout(() => (burst.value = false), 1200)
}

watch(theme, () => {
  found.value = readFound()
  burst.value = false
})

onMounted(() => {
  found.value = readFound()
  pickSpot()
  window.addEventListener('resize', pickSpot)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', pickSpot)
})
</script>

<style scoped>
.hunt-cat {
  position: fixed;
  z-index: 12;
  width: 46px;
  height: 46px;
  padding: 0;
  border: none;
  background: transparent;
  color: #8a7560;
  cursor: pointer;
  opacity: 0.3;
  filter: saturate(0.8);
  animation: huntBreathe 5.4s ease-in-out infinite;
  transition: opacity 0.25s ease, transform 0.25s ease;
  -webkit-tap-highlight-color: transparent;
}

.hunt-cat:hover {
  opacity: 0.62;
  transform: scale(1.12) rotate(-4deg);
}

.hunt-cat:focus-visible {
  outline: 2px solid #19c8b9;
  outline-offset: 4px;
  border-radius: 50%;
}

.hunt-cat svg {
  display: block;
  width: 100%;
  height: 100%;
}

.hunt-burst {
  position: fixed;
  z-index: 13;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  pointer-events: none;
  animation: huntBurst 1.1s ease-out forwards;
}

@keyframes huntBreathe {
  0%,
  100% {
    opacity: 0.24;
    transform: scale(1);
  }
  50% {
    opacity: 0.36;
    transform: scale(1.04);
  }
}

@keyframes huntBurst {
  0% {
    opacity: 0;
    transform: scale(0.4) rotate(-20deg);
  }
  40% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.7) rotate(18deg);
  }
}

@media (max-width: 720px) {
  .hunt-cat {
    width: 38px;
    height: 38px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hunt-cat,
  .hunt-burst {
    animation: none;
  }
}
</style>
