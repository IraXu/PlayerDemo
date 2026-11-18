<template>
  <div class="page" :class="{ immersive: pseudoFullscreen || isFullscreen, touch: touchMode }">
    <div class="bg-decor" aria-hidden="true">
      <svg class="deco-sprite" width="0" height="0">
        <defs>
          <symbol id="cute-cat-sit" viewBox="0 0 120 120">
            <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M86 96c10 1 15-5 13-13-1-5-5-8-10-8" />
              <path d="M46 78c-9 3-15 11-15 20 0 7 5 11 13 11h30c8 0 13-4 13-11 0-9-6-17-15-20" />
              <path d="M49 78c7 4 15 4 22 0" />
              <path d="M38 54c0-14 10-24 22-24s22 10 22 24c0 13-10 22-22 22S38 67 38 54Z" />
              <path d="M42 39 38 23 55 33" />
              <path d="M78 33 95 23 91 39" />
              <path d="M49 54c2-3 5-3 7 0" />
              <path d="M64 54c2-3 5-3 7 0" />
              <path d="M58 60 62 60 60 63Z" />
              <path d="M60 63c0 2-3 2-4 1M60 63c0 2 3 2 4 1" />
              <path d="M47 60 37 58M47 65 37 66M73 60 83 58M73 65 83 66" />
              <path d="M52 109v-7M68 109v-7" />
            </g>
          </symbol>
          <symbol id="cute-cat-peek" viewBox="0 0 120 120">
            <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 92h100" />
              <path d="M91 92c10-1 14-8 11-16" />
              <path d="M36 88c0-18 11-30 24-30s24 12 24 30" />
              <path d="M41 64 37 47 54 58" />
              <path d="M66 58 83 47 79 64" />
              <path d="M48 72c2-3 5-3 7 0" />
              <path d="M65 72c2-3 5-3 7 0" />
              <path d="M58 78 62 78 60 81Z" />
              <path d="M60 81c0 2-3 2-4 1M60 81c0 2 3 2 4 1" />
              <path d="M47 78 38 76M47 82 38 84M73 78 82 76M73 82 82 84" />
              <path d="M43 92c0-5 4-8 8-8s8 3 8 8" />
              <path d="M61 92c0-5 4-8 8-8s8 3 8 8" />
            </g>
          </symbol>
        </defs>
      </svg>
      <svg class="deco deco-cat deco-cat-main" viewBox="0 0 120 120"><use href="#cute-cat-peek" /></svg>
      <svg class="deco deco-cat deco-cat-side" viewBox="0 0 120 120"><use href="#cute-cat-sit" /></svg>
      <svg class="deco deco-cat deco-cat-top" viewBox="0 0 120 120"><use href="#cute-cat-peek" /></svg>
      <PawPrintIcon class="deco deco-paw deco-paw-1" :size="34" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-2" :size="30" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-3" :size="28" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-4" :size="26" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-5" :size="24" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-6" :size="22" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-7" :size="20" color="currentColor" />
      <FishIcon class="deco deco-fish deco-fish-1" :size="50" color="currentColor" />
      <FishIcon class="deco deco-fish deco-fish-2" :size="34" color="currentColor" />
      <BoneIcon class="deco deco-bone deco-bone-1" :size="28" color="currentColor" />
      <BoneIcon class="deco deco-bone deco-bone-2" :size="22" color="currentColor" />
      <HeartIcon class="deco deco-heart deco-heart-1" :size="26" color="currentColor" />
      <HeartIcon class="deco deco-heart deco-heart-2" :size="20" color="currentColor" />
      <StarIcon class="deco deco-star deco-star-1" :size="24" color="currentColor" />
      <CloudIcon class="deco deco-cloud deco-cloud-1" :size="120" color="currentColor" />
      <CloudIcon class="deco deco-cloud deco-cloud-2" :size="88" color="currentColor" />
    </div>

    <header class="masthead">
      <div class="brand">
        <Title class="brand-title" size="middle" color="app-teal">十七的逗猫室</Title>
        <p class="brand-sub">
          <PawPrintIcon :size="14" color="currentColor" />
          一只猫，一台摄像头，和想来看他的人
        </p>
      </div>
      <Tooltip title="摸摸小猫" placement="bottom-end" variant="island">
        <button class="page-cat" type="button" aria-label="摸摸小猫" @click="openEgg">
          <svg class="cat-mascot" viewBox="0 0 120 110" fill="none" aria-hidden="true">
            <circle cx="60" cy="58" r="47" fill="#F7F3DF" stroke="#D4C4A8" stroke-width="2.5" />
            <path class="cat-tail" d="M42 95c-15 2-25-7-21-20 2-8 10-12 16-8" stroke="#794F27" stroke-width="4" stroke-linecap="round" />
            <path d="M42 92c-10-4-14-16-8-26 5-8 16-12 26-12s21 4 26 12c6 10 2 22-8 26-8 4-28 4-36 0Z" fill="#FAEDCD" stroke="#794F27" stroke-width="3.5" />
            <path d="M34 48c0-16 11-27 26-27s26 11 26 27c0 15-11 25-26 25S34 63 34 48Z" fill="#FAEDCD" stroke="#794F27" stroke-width="3.5" />
            <path d="M42 28 36 8 56 20Z" fill="#FAEDCD" stroke="#794F27" stroke-width="3.5" stroke-linejoin="round" />
            <path d="M78 20 98 8 92 28Z" fill="#FAEDCD" stroke="#794F27" stroke-width="3.5" stroke-linejoin="round" />
            <path d="M44 24 41 13 51 20Z" fill="#F4A6A4" />
            <path d="M81 20 91 13 88 24Z" fill="#F4A6A4" />
            <ellipse class="cat-eye" cx="52" cy="46" rx="3.2" ry="4.2" fill="#2A2A2A" />
            <ellipse class="cat-eye" cx="76" cy="46" rx="3.2" ry="4.2" fill="#2A2A2A" />
            <circle cx="53" cy="44.5" r="1" fill="#fff" />
            <circle cx="77" cy="44.5" r="1" fill="#fff" />
            <circle cx="45" cy="54" r="3" fill="#F4A6A4" opacity=".55" />
            <circle cx="83" cy="54" r="3" fill="#F4A6A4" opacity=".55" />
            <path d="M61 54 69 54 65 58Z" fill="#F4A6A4" />
            <path d="M65 58c0 3-4 3-5 1M65 58c0 3 4 3 5 1" stroke="#794F27" stroke-width="1.8" stroke-linecap="round" />
            <path d="M44 52 30 49M44 58 30 57M86 52 100 49M86 58 100 57" stroke="#794F27" stroke-width="1.8" stroke-linecap="round" />
            <path d="M48 68c8 5 26 5 34 0" stroke="#2A9D8F" stroke-width="7" stroke-linecap="round" />
            <path class="cat-scarf" d="M50 70c-6 3-8 9-6 15" stroke="#2A9D8F" stroke-width="6" stroke-linecap="round" />
            <ellipse cx="50" cy="98" rx="9" ry="6" fill="#FAEDCD" stroke="#794F27" stroke-width="3" />
            <ellipse cx="72" cy="98" rx="9" ry="6" fill="#FAEDCD" stroke="#794F27" stroke-width="3" />
            <path d="M46 98c0 2 2 3 4 3M76 98c0 2-2 3-4 3" stroke="#794F27" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <HeartIcon class="page-cat-heart" :size="17" color="#ff8fb1" />
        </button>
      </Tooltip>
    </header>

    <Card class="player">
      <div
        ref="stageRef"
        :class="['stage', { live: isLive, pseudo: pseudoFullscreen, rotated }]"
        @click="onStageTap"
        @dblclick="onStageDoubleClick"
      >
        <div ref="containerRef" class="video"></div>

        <div v-if="rotateHint" class="rotate-hint">
          <SmartphoneIcon :size="16" color="currentColor" />
          <span>请将手机横过来观看</span>
        </div>

        <div v-if="!isLive" class="placeholder">
          <span v-if="status === 'error'" class="glyph">
            <VideoOffIcon :size="32" color="currentColor" />
          </span>
          <SpinnerIcon v-else class="spinner" :size="34" color="#19c8b9" />

          <h1>{{ placeholderTitle }}</h1>
          <p>{{ placeholderText }}</p>

          <Button v-if="status === 'error'" type="primary" size="small" class="retry" @click="connect">
            <template #icon><RefreshIcon :size="16" color="currentColor" /></template>
            重新连接
          </Button>
        </div>

        <div class="toolbar" @click.stop>
          <Tabs
            class="quality-tabs"
            :items="qualityItems"
            :model-value="String(stream)"
            :leaf-animation="false"
            :shadow="false"
            aria-label="清晰度"
            @change="onQualityChange"
          />

          <span class="divider"></span>

          <Tooltip :title="muted ? '开启声音' : '静音'" placement="top" variant="island">
            <Button
              class="icon"
              type="text"
              size="small"
              :aria-label="muted ? '开启声音' : '静音'"
              @click="toggleMute"
            >
              <template #icon>
                <VolumeXIcon v-if="muted" :size="19" color="currentColor" />
                <Volume2Icon v-else :size="19" color="currentColor" />
              </template>
            </Button>
          </Tooltip>

          <input
            class="slider"
            type="range"
            min="0"
            max="100"
            step="1"
            aria-label="音量"
            :value="volumePercent"
            :style="{ '--fill': `${volumePercent}%` }"
            @input="onVolumeInput"
          />

          <Tooltip title="截图" placement="top" variant="island">
            <Button class="icon" type="text" size="small" aria-label="截图" @click="takeScreenshot">
              <template #icon><CameraIcon :size="19" color="currentColor" /></template>
            </Button>
          </Tooltip>

          <Tooltip title="猫猫要和你互动咯～" placement="top" variant="island">
            <Button
              class="action"
              size="small"
              :class="{ busy: interacting }"
              :disabled="interacting"
              @click="triggerInteract"
            >
              <template #icon>
                <svg class="wand" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3.2 20.8 12.6 11.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <g class="wand-tip">
                    <path d="M12.6 11.4c1.6-2.6 3.8-4.2 6.4-4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M16.4 4.2c1.8 1.4 2.6 3.2 2.4 5.4-.2 2-1.4 3.5-3.6 4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <circle cx="18.4" cy="13.4" r="1.5" fill="currentColor" />
                    <path d="M20.2 15.2c1.2 1.4 1.6 3 1.2 4.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                  </g>
                </svg>
              </template>
              <span>{{ interacting ? '逗猫中' : '逗猫棒' }}</span>
            </Button>
          </Tooltip>

          <Tooltip :title="fullActive ? '退出全屏' : '全屏'" placement="top" variant="island">
            <Button class="icon" type="text" size="small" aria-label="全屏" @click="toggleFullscreen">
              <template #icon>
                <MinimizeIcon v-if="fullActive" :size="19" color="currentColor" />
                <MaximizeIcon v-else :size="19" color="currentColor" />
              </template>
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>

    <Collapse v-model:expanded="infoOpen" class="info">
      <template #question>
        <span class="info-question">
          <PawPrintIcon class="info-cat" :size="20" color="#19c8b9" />
          <span class="info-name">{{ device?.name || '设备信息' }}</span>
        </span>
      </template>
      <dl class="info-list">
        <div class="info-cell">
          <dt><QrCodeIcon :size="14" color="currentColor" /> DID</dt>
          <dd class="mono">{{ device?.did || did }}</dd>
        </div>
        <div class="info-cell">
          <dt><IdCardIcon :size="14" color="currentColor" /> License</dt>
          <dd class="mono">{{ device?.license || '—' }}</dd>
        </div>
        <div class="info-cell">
          <dt><CpuIcon :size="14" color="currentColor" /> 固件版本</dt>
          <dd>{{ device?.version || '—' }}</dd>
        </div>
        <div class="info-cell">
          <dt><HardDriveIcon :size="14" color="currentColor" /> MAC</dt>
          <dd class="mono">{{ device?.mac || '—' }}</dd>
        </div>
        <div class="info-cell">
          <dt><WifiIcon :size="14" color="currentColor" /> 所连 WiFi</dt>
          <dd>{{ device?.ssid || '—' }}</dd>
        </div>
      </dl>
    </Collapse>

    <footer class="meta">
      <span class="dot" :class="statusKey"></span>
      <span class="state">{{ statusLabel }}</span>
      <span class="grow"></span>
      <Tooltip title="刷新画面" placement="top" variant="island">
        <Button class="ghost" type="text" size="small" aria-label="刷新" @click="connect">
          <template #icon><RefreshIcon :size="17" color="currentColor" /></template>
        </Button>
      </Tooltip>
    </footer>

    <Footer class="page-footer" text="十七的逗猫室 · 猫猫万岁" />

    <div class="tree-fab-slot">
      <Tooltip title="把心事悄悄投进树洞" placement="top-end" variant="island">
        <Button class="tree-fab" @click="openTreeHole">
          <template #icon><TreeIcon :size="20" color="currentColor" /></template>
          树洞
        </Button>
      </Tooltip>
    </div>

    <Modal v-model:open="treeOpen" :typewriter="false" :width="460">
      <div class="tree-hole">
        <div class="tree-head">
          <TreeIcon :size="38" color="#19c8b9" />
          <h2>树洞</h2>
          <Typewriter :speed="55" :trigger="treeOpen" @done="treeTyped = true">
            <p :class="{ typed: treeTyped }">把想说的话悄悄放进树洞吧，只有树和猫会听到。</p>
          </Typewriter>
        </div>
        <textarea
          v-model="treeMessage"
          class="tree-input"
          maxlength="500"
          rows="5"
          placeholder="写下你的心事…"
          aria-label="树洞留言"
        ></textarea>
        <div class="tree-meta">
          <span>{{ treeMessage.length }}/500</span>
          <span v-if="treeError" class="tree-error">{{ treeError }}</span>
        </div>
      </div>
      <template #footer>
        <Button type="default" @click="treeOpen = false">先不投了</Button>
        <Button
          class="tree-submit"
          type="primary"
          :loading="treeSending"
          :disabled="!treeMessage.trim() || treeSending"
          @click="submitTreeHole"
        >
          投入树洞
        </Button>
      </template>
    </Modal>

    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>

    <transition name="egg-fade">
      <div v-if="eggOpen" class="egg-overlay" role="dialog" aria-modal="true" aria-label="给十七的彩蛋" @click.self="closeEgg">
        <span
          v-for="word in eggWords"
          :key="word.id"
          class="egg-word"
          aria-hidden="true"
          :style="{
            left: word.left + '%',
            '--size': word.size + 'px',
            '--rot': word.rot + 'deg',
            '--delay': word.delay + 's',
            '--dur': word.duration + 's',
            '--alpha': word.alpha,
          }"
          >娇娇</span
        >
        <figure
          v-for="item in eggPhotos"
          :key="item.id"
          class="egg-photo"
          :style="{
            left: item.left + '%',
            top: item.top + '%',
            '--w': item.width + 'px',
            '--rot': item.rot + 'deg',
            '--spin': item.spin + 'deg',
            '--delay': item.delay + 's',
            '--dur': item.duration + 's',
          }"
        >
          <img :src="eggPhoto" alt="" draggable="false" />
        </figure>
        <div class="egg-note">
          <HeartIcon :size="30" color="#ff8fb1" />
          <p>给十七：<br />愿你每天都被小猫治愈。每天保持好心情～</p>
        </div>
        <button class="egg-close" type="button" aria-label="关闭" @click="closeEgg">
          <CloseIcon :size="20" color="currentColor" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Button, Card, Collapse, Footer, Modal, Tabs, Title, Tooltip, Typewriter } from 'animal-island-vue'
import {
  BoneIcon,
  CameraIcon,
  CloseIcon,
  CloudIcon,
  CpuIcon,
  FishIcon,
  HardDriveIcon,
  HeartIcon,
  IdCardIcon,
  MaximizeIcon,
  MinimizeIcon,
  PawPrintIcon,
  QrCodeIcon,
  RefreshIcon,
  SmartphoneIcon,
  SpinnerIcon,
  StarIcon,
  TreeIcon,
  VideoOffIcon,
  Volume2Icon,
  VolumeXIcon,
  WifiIcon,
} from 'naive-icons-vue'
import { interact, queryDevice, queryStream, type DeviceInfo, type StreamInfo } from './api'
import eggPhoto from './assets/easter-egg.jpg'

const did = '1200010180ee9bea'
const TREE_WEBHOOK = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ab1da84d-6f0f-4d9f-8f7b-73ea0dc9db3b'

const containerRef = ref<HTMLElement>()
const stageRef = ref<HTMLElement>()
const status = ref<'loading' | 'switching' | 'playing' | 'error'>('loading')
const errorMsg = ref('')
const stream = ref<0 | 1>(0)
const qualityItems = [
  { key: '0', label: '超清' },
  { key: '1', label: '高清' },
]
const muted = ref(true)
const volumePercent = ref(60)
const fps = ref(0)
const resolution = ref<{ width: number; height: number } | null>(null)
const videoCodec = ref('—')
const toast = ref('')
const isFullscreen = ref(false)
const pseudoFullscreen = ref(false)
const rotated = ref(false)
const rotateHint = ref(false)
const device = ref<DeviceInfo | null>(null)
const interacting = ref(false)
// 触屏设备不展示悬浮提示，避免提示浮层干扰点击
const touchMode = ref(false)
// 设备信息默认折叠
const infoOpen = ref(false)
// 彩蛋
const eggOpen = ref(false)
// 树洞
const treeOpen = ref(false)
const treeMessage = ref('')
const treeSending = ref(false)
const treeError = ref('')
const treeTyped = ref(false)
interface EggPhotoItem {
  id: number
  left: number
  top: number
  width: number
  rot: number
  spin: number
  delay: number
  duration: number
}
interface EggWordItem {
  id: number
  left: number
  size: number
  rot: number
  delay: number
  duration: number
  alpha: number
}
const eggPhotos = ref<EggPhotoItem[]>([])
const eggWords = ref<EggWordItem[]>([])

const isLive = computed(() => status.value === 'playing')
const fullActive = computed(() => isFullscreen.value || pseudoFullscreen.value)
const statusKey = computed(() =>
  status.value === 'playing' ? 'ok' : status.value === 'error' ? 'bad' : 'wait',
)
const statusLabel = computed(() => {
  if (status.value === 'playing') return '猫猫丧丧の，尝试逗逗吧～'
  if (status.value === 'error') return '未连接'
  return status.value === 'switching' ? '切换中' : '连接中'
})
const placeholderTitle = computed(() => {
  if (status.value === 'error') return '暂时无法连接'
  return status.value === 'switching' ? '正在切换码流' : '正在连接设备'
})
const placeholderText = computed(() => {
  if (status.value === 'error') return errorMsg.value || '请稍后重试'
  return '正在建立加密视频通道'
})

let player: HMPlayerInstance | null = null
let cachedStream: StreamInfo | null = null
let resizeObserver: ResizeObserver | null = null
let videoGuard: MutationObserver | null = null
let watchdogTimer: ReturnType<typeof setTimeout> | null = null
let toastTimer: ReturnType<typeof setTimeout> | null = null
let rotateHintTimer: ReturnType<typeof setTimeout> | null = null
const redrawTimers: Array<ReturnType<typeof setTimeout>> = []
let autoRetried = false

function showToast(message: string) {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2000)
}

// ==================== 播放器 ====================
function resetMeta() {
  fps.value = 0
  videoCodec.value = '—'
  resolution.value = null
}

function applyVideoFix(video: HTMLVideoElement) {
  video.controls = false
  if (video.hasAttribute('controls')) video.removeAttribute('controls')
  video.muted = muted.value
  video.defaultMuted = muted.value
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.setAttribute('autoplay', '')
  if (muted.value) video.setAttribute('muted', '')
  else video.removeAttribute('muted')
  video.style.setProperty('width', '100%', 'important')
  video.style.setProperty('height', '100%', 'important')
  const played = video.play()
  if (played) played.catch(() => undefined)
}

function setupVideoGuard(el: HTMLElement) {
  const existing = el.querySelector('video')
  if (existing) applyVideoFix(existing as HTMLVideoElement)

  videoGuard?.disconnect()
  videoGuard = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'controls') {
        applyVideoFix(m.target as HTMLVideoElement)
        continue
      }
      m.addedNodes.forEach((node) => {
        const target = node as HTMLElement
        if (target.nodeType !== 1) return
        if (target.tagName === 'VIDEO') {
          applyVideoFix(target as HTMLVideoElement)
        } else if (target.querySelector) {
          const video = target.querySelector('video')
          if (video) applyVideoFix(video as HTMLVideoElement)
        }
      })
    }
  })
  videoGuard.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['controls'] })
}

function resizePlayer() {
  if (!player || !containerRef.value) return
  const { clientWidth, clientHeight } = containerRef.value
  player.resizeView(0, 0, Math.max(1, clientWidth), Math.max(1, clientHeight))
}

async function waitForStableSize(el: HTMLElement) {
  for (let i = 0; i < 24; i++) {
    if (el.clientWidth >= 240 && el.clientHeight >= 120) return
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }
}

function clearRedrawTimers() {
  redrawTimers.forEach((timer) => clearTimeout(timer))
  redrawTimers.length = 0
}

function forceRedraw() {
  if (!player || !containerRef.value) return
  clearRedrawTimers()
  const run = () => {
    if (!player || !containerRef.value) return
    try {
      resizePlayer()
      const video = containerRef.value.querySelector('video') as HTMLVideoElement | null
      if (video && video.paused) {
        video.controls = false
        video.play().catch(() => undefined)
      }
    } catch {
      /* ignore */
    }
  }
  ;[0, 120, 320].forEach((delay) => redrawTimers.push(setTimeout(run, delay)))
}

function applyAudioState() {
  if (!player) return
  try {
    if (muted.value) player.mute()
    else {
      player.unMute()
      player.setVolume(volumePercent.value / 100)
    }
  } catch {
    /* ignore */
  }
}

async function startPlayer(info: StreamInfo, streamId: number) {
  await nextTick()
  const el = containerRef.value
  if (!el) throw new Error('播放器容器未就绪')
  await waitForStableSize(el)

  const instance = new window.HMWebPlayer({
    container: el,
    x: 0,
    y: 0,
    width: el.clientWidth || 960,
    height: el.clientHeight || 540,
    renderMode: 'mse',
    decoderMode: 'soft-simd',
    audioEngine: 'worklet',
    useWorkerForMSE: true,
    useOffScreenCanvasRender: false,
    retryCnt: 0,
  })
  player = instance

  setupVideoGuard(el)

  instance.on('state', ({ state }) => {
    if (player !== instance) return
    if (state === 2 || state === 4) {
      status.value = 'playing'
      stopWatchdog()
      forceRedraw()
      applyAudioState()
    } else if (state === 5) {
      status.value = 'error'
      errorMsg.value = '播放通道已中断'
      stopWatchdog()
    }
  })

  instance.on('videoInfo', ({ vtype, width, height }) => {
    if (player !== instance) return
    videoCodec.value = vtype === 2 ? 'H.265' : 'H.264'
    resolution.value = { width, height }
  })

  instance.on('stats', (stats) => {
    if (player !== instance) return
    fps.value = stats.vFramerate || stats.yuvFramerate || stats.vRemuxFramerate || 0
    if (status.value !== 'playing' && (stats.vFramerate > 0 || stats.yuvFramerate > 0)) {
      status.value = 'playing'
      stopWatchdog()
    }
  })

  instance.on('error', () => {
    if (player !== instance) return
    status.value = 'error'
    errorMsg.value = '拉流异常，请确认设备在线'
    stopWatchdog()
  })

  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(() => resizePlayer())
  resizeObserver.observe(el)

  instance.startHMLiveStream(
    '',
    did,
    info.ws_url,
    info.resource_id,
    Number(info.enc_type) || 49,
    info.enc_key,
    info.enc_load,
    0,
    streamId,
    0,
    0,
  )

  applyAudioState()
}

async function destroyPlayer() {
  stopWatchdog()
  clearRedrawTimers()
  resizeObserver?.disconnect()
  resizeObserver = null
  videoGuard?.disconnect()
  videoGuard = null

  const instance = player
  player = null
  if (instance) {
    try {
      await instance.destroy()
    } catch {
      /* ignore */
    }
  }
  if (containerRef.value) containerRef.value.innerHTML = ''
}

function startWatchdog() {
  stopWatchdog()
  watchdogTimer = setTimeout(() => {
    watchdogTimer = null
    if (status.value !== 'loading' && status.value !== 'switching') return
    if (autoRetried) {
      status.value = 'error'
      errorMsg.value = '视频通道建立超时'
      return
    }
    autoRetried = true
    void connect()
  }, 9000)
}

function stopWatchdog() {
  if (watchdogTimer) {
    clearTimeout(watchdogTimer)
    watchdogTimer = null
  }
}

// ==================== 取流 ====================
async function fetchStream(force = false): Promise<StreamInfo> {
  if (!force && cachedStream) return cachedStream
  cachedStream = await queryStream()
  return cachedStream
}

async function connect() {
  await destroyPlayer()
  stopWatchdog()
  resetMeta()
  status.value = 'loading'
  errorMsg.value = ''
  autoRetried = false

  try {
    const info = await fetchStream(true)
    await startPlayer(info, stream.value)
    startWatchdog()
  } catch (error) {
    status.value = 'error'
    errorMsg.value = (error as Error).message || '连接失败'
  }
}

async function switchStream(target: 0 | 1) {
  if (target === stream.value || status.value === 'switching') return
  stream.value = target

  await destroyPlayer()
  resetMeta()
  status.value = 'switching'
  errorMsg.value = ''
  autoRetried = false

  try {
    const info = await fetchStream()
    await startPlayer(info, target)
    startWatchdog()
  } catch (error) {
    status.value = 'error'
    errorMsg.value = (error as Error).message || '切换码流失败'
  }
}

function onQualityChange(key: string) {
  void switchStream(Number(key) === 1 ? 1 : 0)
}

// ==================== 设备信息 / 互动 ====================
async function loadDevice() {
  try {
    device.value = await queryDevice()
  } catch {
    /* 信息获取失败不影响播放 */
  }
}

async function triggerInteract() {
  if (interacting.value) return
  interacting.value = true
  try {
    await interact()
    showToast('已挥动逗猫棒，瞧瞧小猫发现了啥！')
  } catch (error) {
    showToast((error as Error).message || '逗猫棒指令下发失败')
  } finally {
    setTimeout(() => (interacting.value = false), 1200)
  }
}

// ==================== 交互 ====================
function toggleMute() {
  if (!player) return
  if (muted.value) {
    if (volumePercent.value === 0) volumePercent.value = 50
    muted.value = false
    try {
      player.unMute()
      player.setVolume(volumePercent.value / 100)
    } catch {
      /* ignore */
    }
  } else {
    muted.value = true
    try {
      player.mute()
    } catch {
      /* ignore */
    }
  }
}

function onVolumeChange(value: number | number[]) {
  const next = Array.isArray(value) ? value[0] : value
  volumePercent.value = next
  if (!player) return
  try {
    if (next === 0) {
      muted.value = true
      player.mute()
    } else {
      muted.value = false
      player.unMute()
      player.setVolume(next / 100)
    }
  } catch {
    /* ignore */
  }
}

function onVolumeInput(event: Event) {
  onVolumeChange(Number((event.target as HTMLInputElement).value))
}

function takeScreenshot() {
  if (!player) return
  try {
    player.screenshot()
    showToast('已保存截图')
  } catch {
    showToast('截图失败')
  }
}

function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
}

function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  document.body.style.overflow = locked ? 'hidden' : ''
}

function showRotateHint() {
  rotateHint.value = true
  if (rotateHintTimer) clearTimeout(rotateHintTimer)
  rotateHintTimer = setTimeout(() => (rotateHint.value = false), 2600)
}

function enterPseudoFullscreen() {
  pseudoFullscreen.value = true
  // 竖屏手机进入全屏时旋转成横屏
  rotated.value = isTouchDevice() && window.innerHeight > window.innerWidth
  if (rotated.value) showRotateHint()
  lockScroll(true)
  setTimeout(() => {
    resizePlayer()
    forceRedraw()
  }, 160)
}

function exitPseudoFullscreen() {
  pseudoFullscreen.value = false
  rotated.value = false
  rotateHint.value = false
  lockScroll(false)
  setTimeout(() => {
    resizePlayer()
    forceRedraw()
  }, 160)
}

async function toggleFullscreen() {
  const stage = stageRef.value
  if (!stage) return

  if (pseudoFullscreen.value) {
    exitPseudoFullscreen()
    return
  }
  if (document.fullscreenElement) {
    await document.exitFullscreen().catch(() => undefined)
    return
  }

  // 触屏设备统一走伪全屏：可稳定旋转为横屏，也不受 iOS 全屏 API 限制
  if (isTouchDevice()) {
    enterPseudoFullscreen()
    return
  }

  try {
    await stage.requestFullscreen()
    const orientation = screen.orientation as
      | (ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> })
      | undefined
    await orientation?.lock?.('landscape').catch(() => undefined)
  } catch {
    enterPseudoFullscreen()
  }
}

function isToolbarEvent(event: Event) {
  const target = event.target as Element | null
  return Boolean(target?.closest?.('.toolbar, button, a, input, .animal-tooltip'))
}

function onStageTap(event: MouseEvent) {
  // 手机端：点画面直接进横屏全屏，和原生播放器一致
  if (!isLive.value || !isTouchDevice() || isToolbarEvent(event)) return
  void toggleFullscreen()
}

function onStageDoubleClick(event: MouseEvent) {
  // 桌面端：双击画面切换全屏
  if (isTouchDevice() || isToolbarEvent(event)) return
  void toggleFullscreen()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (eggOpen.value) {
    closeEgg()
    return
  }
  if (pseudoFullscreen.value) exitPseudoFullscreen()
}

// ==================== 彩蛋 ====================
function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function buildEggScene() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const mobile = vw <= 720
  const cols = mobile ? 3 : 4
  const rows = 3
  const cellW = vw / cols
  const cellH = vh / rows
  const stamp = Date.now()
  const photos: EggPhotoItem[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const width = Math.round(mobile ? rand(96, 142) : rand(136, 200))
      const cardH = (width - 12) * (1100 / 825) + 12
      const rot = Math.round(rand(-24, 24))
      const rad = (rot * Math.PI) / 180
      const bboxW = Math.abs(width * Math.cos(rad)) + Math.abs(cardH * Math.sin(rad))
      const bboxH = Math.abs(width * Math.sin(rad)) + Math.abs(cardH * Math.cos(rad))
      const cx = cellW * (col + 0.5) + rand(-cellW * 0.24, cellW * 0.24)
      const cy = cellH * (row + 0.5) + rand(-cellH * 0.18, cellH * 0.18)
      const x = Math.min(Math.max(cx, bboxW / 2 + 6), vw - bboxW / 2 - 6)
      const y = Math.min(Math.max(cy, bboxH / 2 + 6), vh - bboxH / 2 - 6)
      const index = row * cols + col

      photos.push({
        id: stamp + index,
        left: Math.round((x / vw) * 1000) / 10,
        top: Math.round((y / vh) * 1000) / 10,
        width,
        rot,
        spin: (2 + Math.floor(Math.random() * 2)) * 360,
        delay: Math.round(rand(0, 0.3) * 100) / 100,
        duration: Math.round(rand(1.3, 2) * 100) / 100,
      })
    }
  }
  eggPhotos.value = photos

  const count = mobile ? 52 : 86
  eggWords.value = Array.from({ length: count }, (_, index) => {
    const duration = Math.round(rand(2.8, 6) * 100) / 100
    return {
      id: stamp + 500 + index,
      left: Math.round(rand(0, 96)),
      size: Math.round(mobile ? rand(13, 28) : rand(15, 42)),
      rot: Math.round(rand(-32, 32)),
      // 负延迟让文字一打开就已经铺满整个屏幕，避免出现空档
      delay: -Math.round(rand(0, duration) * 100) / 100,
      duration,
      alpha: Math.round(rand(0.32, 0.72) * 100) / 100,
    }
  })
}

function openEgg() {
  buildEggScene()
  eggOpen.value = true
  lockScroll(true)
}

function closeEgg() {
  eggOpen.value = false
  eggPhotos.value = []
  eggWords.value = []
  if (!pseudoFullscreen.value) lockScroll(false)
}

// ==================== 树洞 ====================
function openTreeHole() {
  treeError.value = ''
  treeTyped.value = false
  treeOpen.value = true
}

async function submitTreeHole() {
  const content = treeMessage.value.trim()
  if (!content || treeSending.value) return
  treeSending.value = true
  treeError.value = ''
  try {
    const payload = JSON.stringify({
      msgtype: 'text',
      text: { content: `【十七的逗猫室 · 树洞】\n${content}` },
    })

    // 企业微信机器人不支持浏览器 CORS；用 text/plain 的简单请求直发，
    // sendBeacon 失败时再退回 no-cors fetch，避免预检被拦截。
    let queued = false
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      queued = navigator.sendBeacon(TREE_WEBHOOK, new Blob([payload], { type: 'text/plain;charset=UTF-8' }))
    }
    if (!queued) {
      await fetch(TREE_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: payload,
        keepalive: true,
      })
    }

    treeOpen.value = false
    treeMessage.value = ''
    showToast('已经悄悄投进树洞啦，猫猫会替你保密的～')
  } catch {
    treeError.value = '树洞暂时堵住了，稍后再试试吧'
  } finally {
    treeSending.value = false
  }
}

function onViewportResize() {
  if (!pseudoFullscreen.value) return
  const shouldRotate = isTouchDevice() && window.innerHeight > window.innerWidth
  if (shouldRotate !== rotated.value) {
    rotated.value = shouldRotate
    if (!shouldRotate) rotateHint.value = false
  }
  setTimeout(() => {
    resizePlayer()
    forceRedraw()
  }, 120)
}

function onFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement)
  setTimeout(resizePlayer, 120)
}

function onVisibilityChange() {
  if (!document.hidden && player) {
    forceRedraw()
    applyAudioState()
  }
}

onMounted(() => {
  touchMode.value = isTouchDevice()
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('resize', onViewportResize)
  window.addEventListener('orientationchange', onViewportResize)
  window.visualViewport?.addEventListener('resize', onViewportResize)
  window.addEventListener('keydown', onKeydown)
  void loadDevice()
  void connect()
})

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', onViewportResize)
  window.removeEventListener('orientationchange', onViewportResize)
  window.visualViewport?.removeEventListener('resize', onViewportResize)
  window.removeEventListener('keydown', onKeydown)
  if (rotateHintTimer) clearTimeout(rotateHintTimer)
  lockScroll(false)
  void destroyPlayer()
})
</script>

<style scoped src="./player.css"></style>
