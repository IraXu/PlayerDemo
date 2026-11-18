<template>
  <button
    v-if="!found"
    class="hunt-cat"
    :style="spot"
    type="button"
    aria-label="躲起来的小猫"
    @click="catchCat"
  >
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <g stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M86 96c10 1 15-5 13-13-1-5-5-8-10-8" />
        <path d="M46 78c-9 3-15 11-15 20 0 7 5 11 13 11h30c8 0 13-4 13-11 0-9-6-17-15-20" />
        <path d="M49 78c7 4 15 4 22 0" />
        <path d="M38 54c0-14 10-24 22-24s22 10 22 24c0 13-10 22-22 22S38 67 38 54Z" />
        <path d="M42 39 38 23 55 33" />
        <path d="M65 33 82 23 78 39" />
        <path d="M49 54c2-3 5-3 7 0" />
        <path d="M64 54c2-3 5-3 7 0" />
        <path d="M58 60 62 60 60 63Z" />
        <path d="M60 63c0 2-3 2-4 1M60 63c0 2 3 2 4 1" />
        <path d="M47 60 37 58M47 65 37 66M73 60 83 58M73 65 83 66" />
      </g>
    </svg>
  </button>

  <span v-if="burst" class="hunt-burst" :style="spot" aria-hidden="true">
    <SparklesIcon :size="44" color="#ffd166" />
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { SparklesIcon } from 'naive-icons-vue'
import { playMeow } from '../sfx'

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

const storageKey = `cat-hunt:${todayKey()}`
const burst = ref(false)
const spot = ref<Record<string, string>>(SPOTS_DESKTOP[0])

function pickSpot() {
  const spots = window.innerWidth <= 720 ? SPOTS_MOBILE : SPOTS_DESKTOP
  spot.value = spots[hash(todayKey()) % spots.length]
}

function catchCat() {
  if (found.value) return
  playMeow()
  found.value = true
  burst.value = true
  try {
    localStorage.setItem(storageKey, '1')
  } catch {
    /* 隐私模式下忽略存储失败 */
  }
  emit('found')
  setTimeout(() => (burst.value = false), 1200)
}

onMounted(() => {
  try {
    if (localStorage.getItem(storageKey) === '1') found.value = true
  } catch {
    /* ignore */
  }
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
