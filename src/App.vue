<template>
  <div class="page" :class="{ immersive: pseudoFullscreen || isFullscreen }">
    <section class="player">
      <div
        ref="stageRef"
        :class="['stage', { live: isLive, pseudo: pseudoFullscreen, rotated }]"
        @click="onStageTap"
        @dblclick="onStageDoubleClick"
      >
        <div ref="containerRef" class="video"></div>

        <div v-if="isLive" class="cat-chip" aria-hidden="true">
          <svg class="cat" viewBox="0 0 64 44" fill="none">
            <g class="cat-bob">
              <path
                d="M7.4 32.4h5.6M3.6 36.2h4.4"
                class="cat-dust"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                opacity=".45"
              />
              <path
                class="cat-tail"
                d="M16.8 22c-5 1.4-9-1.2-10.2-5.4"
                stroke="currentColor"
                stroke-width="2.8"
                stroke-linecap="round"
              />
              <ellipse cx="28.6" cy="25" rx="13.2" ry="7.2" fill="currentColor" transform="rotate(-8 28.6 25)" />
              <circle cx="46.4" cy="17" r="8.2" fill="currentColor" />
              <path
                d="M39.6 12.8 42.4 5.4 47 11.2Z"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linejoin="round"
              />
              <path
                d="M47.6 10.6 51.6 3.6 53.4 12.8Z"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linejoin="round"
              />
              <circle cx="49" cy="19" r="1.6" fill="#0b0f18" />
              <circle cx="49.55" cy="18.4" r=".55" fill="#fff" />
              <path
                d="M50.6 21.9c.7.7 1.7.7 2.2 0"
                stroke="#0b0f18"
                stroke-width="1.2"
                stroke-linecap="round"
              />
              <path
                class="cat-leg leg1"
                d="M19.8 28.8 17 35.8"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                class="cat-leg leg2"
                d="M24.8 29.6 24.4 36.8"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                class="cat-leg leg3"
                d="M38.4 28.6 37.2 35.6"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                class="cat-leg leg4"
                d="M40.4 27.4 42 34.6"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </g>
          </svg>
        </div>

        <div v-if="rotateHint" class="rotate-hint">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="7.6" y="2.8" width="8.8" height="18.4" rx="2.4" stroke="currentColor" stroke-width="1.5" />
            <path d="M4.2 9.4A8.2 8.2 0 0 0 4.2 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <span>请将手机横过来观看</span>
        </div>

        <div v-if="!isLive" class="placeholder">
          <span v-if="status === 'error'" class="glyph">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6.6" width="12.4" height="10.8" rx="3" stroke="currentColor" stroke-width="1.5" />
              <path d="m15.4 11 4.2-2.3a.7.7 0 0 1 1.1.6v5.4a.7.7 0 0 1-1.1.6l-4.2-2.3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              <path d="m9 10.4 6.2 6.2M15.2 10.4 9 16.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5" />
            </svg>
          </span>
          <span v-else class="spinner"></span>

          <h1>{{ placeholderTitle }}</h1>
          <p>{{ placeholderText }}</p>

          <a-button v-if="status === 'error'" type="primary" size="small" class="retry" @click="connect">
            重新连接
          </a-button>
        </div>

        <div class="toolbar" @click.stop>
          <div class="seg" role="group" aria-label="清晰度">
            <button type="button" :class="{ on: stream === 0 }" @click="switchStream(0)">超清</button>
            <button type="button" :class="{ on: stream === 1 }" @click="switchStream(1)">高清</button>
          </div>

          <span class="divider"></span>

          <a-tooltip :content="muted ? '开启声音' : '静音'" position="top" :disabled="touchMode">
            <button class="icon" type="button" aria-label="音量" @click="toggleMute">
              <svg v-if="!muted" viewBox="0 0 24 24" fill="none">
                <path d="M4.5 9.7v4.6h2.7L10.8 17.4V6.6L7.2 9.7H4.5Z" fill="currentColor" />
                <path d="M14.2 9.4a3.8 3.8 0 0 1 0 5.2M16.8 7a7.1 7.1 0 0 1 0 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none">
                <path d="M4.5 9.7v4.6h2.7L10.8 17.4V6.6L7.2 9.7H4.5Z" fill="currentColor" />
                <path d="m14.9 10.2 3.9 3.6m0-3.6-3.9 3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </a-tooltip>

          <a-slider
            class="slider"
            :model-value="volumePercent"
            :show-tooltip="false"
            @change="onVolumeChange"
          />

          <a-tooltip content="截图" position="top" :disabled="touchMode">
            <button class="icon" type="button" aria-label="截图" @click="takeScreenshot">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 8.8h3l1-1.9h8l1 1.9h3v9.4H4V8.8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <circle cx="12" cy="13.2" r="2.9" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </button>
          </a-tooltip>

          <a-tooltip content="挥动逗猫棒，猫猫会吓一跳～" position="top" :disabled="touchMode">
            <button
              class="action"
              type="button"
              :class="{ busy: interacting }"
              :disabled="interacting"
              @click="triggerInteract"
            >
              <svg class="wand" viewBox="0 0 24 24" fill="none">
                <path d="M3.4 20.8 13 10.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                <path d="M3.4 20.8 6 18" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" opacity=".55" />
                <g class="wand-tip">
                  <path d="M13 10.6c1.3 1.1 2.1 2.4 2.4 3.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                  <circle cx="16.1" cy="15.6" r="1.5" fill="currentColor" />
                  <path
                    d="M17 17.9c1.8 1.2 2.7 3 2.7 5.1 0 .5-.1 1-.3 1.4-1.8-1-2.8-2.8-3-4.9-.1-.6 0-1.2.6-1.6Z"
                    fill="currentColor"
                    fill-opacity=".92"
                  />
                </g>
              </svg>
              <span>{{ interacting ? '逗猫中' : '逗猫棒' }}</span>
            </button>
          </a-tooltip>

          <a-tooltip :content="fullActive ? '退出全屏' : '全屏'" position="top" :disabled="touchMode">
            <button class="icon" type="button" aria-label="全屏" @click="toggleFullscreen">
              <svg v-if="!fullActive" viewBox="0 0 24 24" fill="none">
                <path d="M9.4 4.6H4.6v4.8m10-4.8h4.8v4.8m0 5.2v4.8h-4.8M9.4 19.4H4.6v-4.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none">
                <path d="M4.6 9.4h4.8V4.6m5.2 0v4.8h4.8M19.4 14.6h-4.8v4.8M9.4 19.4v-4.8H4.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </a-tooltip>
        </div>
      </div>
    </section>

    <section class="info" :class="{ open: infoOpen }">
      <button class="info-head" type="button" :aria-expanded="infoOpen" @click="infoOpen = !infoOpen">
        <span class="info-name">{{ device?.name || '设备名称' }}</span>
        <span v-if="device" class="info-state" :class="device.online ? 'on' : 'off'">
          <i></i>{{ device.online ? '在线' : '离线' }}
        </span>
        <svg class="info-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="info-body">
        <dl class="info-list">
          <div class="info-cell">
            <dt>DID</dt>
            <dd class="mono">{{ device?.did || did }}</dd>
          </div>
          <div class="info-cell">
            <dt>License</dt>
            <dd class="mono">{{ device?.license || '—' }}</dd>
          </div>
          <div class="info-cell">
            <dt>固件版本</dt>
            <dd>{{ device?.version || '—' }}</dd>
          </div>
          <div class="info-cell">
            <dt>MAC</dt>
            <dd class="mono">{{ device?.mac || '—' }}</dd>
          </div>
          <div class="info-cell">
            <dt>所连WiFi</dt>
            <dd>{{ device?.ssid || '—' }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <footer class="meta">
      <span class="dot" :class="statusKey"></span>
      <span class="state">{{ statusLabel }}</span>
      <template v-if="isLive">
        <span class="sep"></span>
        <span class="mono">{{ resolutionLabel }}</span>
        <span class="sep">·</span>
        <span class="mono">{{ fpsLabel }}</span>
        <span class="sep">·</span>
        <span>{{ videoCodec }}</span>
      </template>
      <span class="grow"></span>
      <a-tooltip content="刷新" position="top">
        <button class="ghost" type="button" @click="connect">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M19.2 12a7.2 7.2 0 1 1-2.1-5.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            <path d="M19.4 4.8v4.4h-4.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </a-tooltip>
    </footer>

    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { interact, queryDevice, queryStream, type DeviceInfo, type StreamInfo } from './api'

const did = '1200010180ee9bea'

const containerRef = ref<HTMLElement>()
const stageRef = ref<HTMLElement>()
const status = ref<'loading' | 'switching' | 'playing' | 'error'>('loading')
const errorMsg = ref('')
const stream = ref<0 | 1>(0)
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

const isLive = computed(() => status.value === 'playing')
const fullActive = computed(() => isFullscreen.value || pseudoFullscreen.value)
const statusKey = computed(() =>
  status.value === 'playing' ? 'ok' : status.value === 'error' ? 'bad' : 'wait',
)
const statusLabel = computed(() => {
  if (status.value === 'playing') return '丧丧の工作中，尝试逗逗吧～'
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
const resolutionLabel = computed(() =>
  resolution.value ? `${resolution.value.width}×${resolution.value.height}` : '—',
)
const fpsLabel = computed(() => (fps.value > 0 ? `${fps.value} fps` : '—'))

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
  return Boolean(target?.closest?.('.toolbar, button, a, input, .arco-slider, .arco-tooltip'))
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
  if (event.key === 'Escape' && pseudoFullscreen.value) exitPseudoFullscreen()
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

<style scoped>
.page {
  /* 同时受宽、高约束：横屏大屏时也能把 16:9 画面顶到视口极限 */
  width: min(100%, 1760px, calc((100svh - 214px) * 16 / 9 + 48px));
  min-height: 100vh;
  min-height: 100svh;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

/* ==================== 播放器 ==================== */
.player {
  position: relative;
  border-radius: 28px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: linear-gradient(
    155deg,
    rgba(255, 255, 255, 0.46) 0%,
    rgba(255, 255, 255, 0.14) 46%,
    rgba(255, 255, 255, 0.3) 100%
  );
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(255, 255, 255, 0.42),
    inset 1px 0 0 rgba(255, 255, 255, 0.6),
    inset -1px 0 0 rgba(255, 255, 255, 0.6),
    0 40px 80px -40px rgba(35, 52, 92, 0.45),
    0 10px 24px -18px rgba(35, 52, 92, 0.28);
  animation: rise 0.55s cubic-bezier(0.22, 0.9, 0.3, 1) both;
}

.stage {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 21px;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background:
    radial-gradient(120% 90% at 50% -25%, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0) 58%),
    linear-gradient(
      150deg,
      rgba(255, 255, 255, 0.44) 0%,
      rgba(233, 240, 252, 0.3) 45%,
      rgba(213, 227, 247, 0.4) 100%
    );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 40px 70px -60px rgba(96, 138, 224, 0.65),
    inset 0 -24px 48px -34px rgba(35, 52, 92, 0.28);
}

/* 玻璃表面的高光与色散 */
.stage::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(64% 52% at 16% 2%, rgba(255, 255, 255, 0.9), transparent 62%),
    radial-gradient(52% 48% at 102% 100%, rgba(122, 174, 255, 0.36), transparent 68%),
    radial-gradient(48% 44% at -2% 100%, rgba(140, 218, 255, 0.34), transparent 70%);
  mix-blend-mode: screen;
}

.stage.live {
  background: #05070c;
}

.stage.live::before {
  display: none;
}

.stage.pseudo {
  position: fixed;
  inset: 0;
  z-index: 1000;
  aspect-ratio: auto;
  border-radius: 0;
  border: none;
}

/* 全屏时隐藏页面其余内容，避免盖在画面之上 */
.page.immersive .info,
.page.immersive .meta {
  display: none;
}

.page.immersive .player {
  /* backdrop-filter 会让 fixed 子元素相对 .player 定位，全屏时必须关掉 */
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  animation: none;
  z-index: 1000;
}

/* 移动端竖屏伪全屏：旋转 90° 变成横屏 */
.stage.rotated {
  position: fixed;
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  width: 100vh;
  height: 100vw;
  margin-top: -50vw;
  margin-left: -50vh;
  /* 用 dvh/dvw 贴合手机浏览器地址栏占位后的可视区 */
  width: 100dvh;
  height: 100dvw;
  margin-top: -50dvw;
  margin-left: -50dvh;
  transform: rotate(90deg);
  transform-origin: center center;
  aspect-ratio: auto;
  border-radius: 0;
}

.video {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video :deep(video),
.video :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
  object-fit: contain;
  background: #000;
}

/* ==================== 占位 / 状态 ==================== */
.placeholder {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 24px 76px;
  text-align: center;
}

.glyph {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #5f7089;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.42));
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    inset 0 -1px 0 rgba(255, 255, 255, 0.4),
    0 14px 26px -18px rgba(35, 52, 92, 0.6);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
}

.glyph svg {
  width: 26px;
  height: 26px;
}

.spinner {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgba(29, 33, 41, 0.1);
  border-top-color: #165dff;
  animation: spin 0.85s linear infinite;
}

.placeholder h1 {
  margin: 6px 0 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #1d2129;
}

.placeholder p {
  margin: 0;
  max-width: 380px;
  font-size: 12.5px;
  line-height: 1.6;
  color: #86909c;
}

.retry {
  margin-top: 6px;
}

.placeholder .retry.arco-btn {
  height: 34px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: #f2f6ff;
  background: linear-gradient(155deg, rgba(24, 32, 48, 0.86), rgba(24, 32, 48, 0.66));
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 14px 26px -16px rgba(23, 36, 66, 0.8);
}

.placeholder .retry.arco-btn:hover {
  background: linear-gradient(155deg, rgba(42, 54, 78, 0.9), rgba(30, 40, 60, 0.7));
}

/* ==================== 右上角奔跑的小猫 ==================== */
.cat-chip {
  position: absolute;
  z-index: 4;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  color: #fff;
  background-color: rgba(8, 12, 20, 0.52);
  background-image: linear-gradient(160deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 10px 20px -14px rgba(0, 0, 0, 0.75);
  pointer-events: none;
}

.cat-chip .cat {
  width: 50px;
  height: 34px;
  display: block;
  overflow: visible;
}

.cat-bob {
  transform-box: view-box;
  transform-origin: 50% 100%;
  animation: catBob 0.52s ease-in-out infinite;
}

.cat-leg {
  transform-box: fill-box;
  transform-origin: 50% 0%;
  animation: catLeg 0.52s ease-in-out infinite;
}

.leg2 {
  animation-delay: -0.13s;
}

.leg3 {
  animation-delay: -0.26s;
}

.leg4 {
  animation-delay: -0.39s;
}

.cat-tail {
  transform-box: fill-box;
  transform-origin: 100% 60%;
  animation: catTail 0.52s ease-in-out infinite;
}

.cat-dust {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: catDust 0.52s ease-out infinite;
}

@keyframes catBob {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  45% {
    transform: translateY(-1.8px) rotate(-1.6deg);
  }
}

@keyframes catLeg {
  0%,
  100% {
    transform: rotate(26deg);
  }
  50% {
    transform: rotate(-26deg);
  }
}

@keyframes catTail {
  0%,
  100% {
    transform: rotate(-14deg);
  }
  50% {
    transform: rotate(16deg);
  }
}

@keyframes catDust {
  0% {
    opacity: 0;
    transform: translateX(4px) scaleX(0.6);
  }
  35% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: translateX(-8px) scaleX(1.3);
  }
}

/* ==================== 控制栏 ==================== */
.toolbar {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 10px;
  max-width: calc(100% - 28px);
  border-radius: 999px;
  background: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.82) 0%,
    rgba(255, 255, 255, 0.4) 56%,
    rgba(255, 255, 255, 0.62) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(255, 255, 255, 0.4),
    0 16px 34px -18px rgba(35, 52, 92, 0.55);
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.stage.live .toolbar {
  /* 画面可能是强光场景，玻璃基底要压暗才看得清 */
  background-color: rgba(8, 12, 20, 0.42);
  background-image: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(255, 255, 255, 0.06) 56%,
    rgba(255, 255, 255, 0.14) 100%
  );
  border-color: rgba(255, 255, 255, 0.26);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.42),
    inset 0 -1px 0 rgba(255, 255, 255, 0.12),
    0 18px 36px -18px rgba(0, 0, 0, 0.72);
}

.divider {
  width: 1px;
  height: 16px;
  flex: none;
  background: rgba(29, 33, 41, 0.1);
}

.stage.live .divider {
  background: rgba(255, 255, 255, 0.16);
}

.grow {
  flex: 1;
}

.seg {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background: rgba(120, 136, 162, 0.16);
  box-shadow:
    inset 0 1px 2px rgba(35, 52, 92, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.stage.live .seg {
  background: rgba(0, 0, 0, 0.2);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.16);
}

.seg button {
  height: 26px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  font-size: 12px;
  color: #6b7789;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.seg button.on {
  color: #101a2b;
  background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.78) 100%);
  box-shadow:
    inset 0 1px 0 #ffffff,
    inset 0 -1px 0 rgba(255, 255, 255, 0.5),
    0 4px 12px -6px rgba(23, 36, 66, 0.6);
}

.stage.live .seg button {
  color: rgba(255, 255, 255, 0.78);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.stage.live .seg button.on {
  color: #0d141f;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.8) 100%);
  box-shadow:
    inset 0 1px 0 #ffffff,
    0 6px 14px -8px rgba(0, 0, 0, 0.8);
}

.icon {
  width: 32px;
  height: 32px;
  flex: none;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 9px;
  color: #5c6779;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.icon:hover {
  color: #101a2b;
  background: rgba(255, 255, 255, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 6px 14px -10px rgba(35, 52, 92, 0.7);
}

.icon svg {
  width: 17px;
  height: 17px;
}

.icon:focus-visible,
.seg button:focus-visible,
.ghost:focus-visible {
  outline: 2px solid #165dff;
  outline-offset: 2px;
}

.stage.live .icon {
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}

.stage.live .icon:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
}

.slider {
  width: 74px;
  margin: 0 -2px;
}

.slider :deep(.arco-slider-road) {
  background: rgba(120, 136, 162, 0.28);
}

.slider :deep(.arco-slider-bar) {
  background: linear-gradient(90deg, #86adff, #3d7bff);
}

.slider :deep(.arco-slider-button) {
  width: 11px;
  height: 11px;
  border: 2px solid #fff;
  background: #165dff;
  box-shadow: 0 2px 6px rgba(23, 36, 66, 0.28);
}

.stage.live .slider :deep(.arco-slider-road) {
  background: rgba(255, 255, 255, 0.24);
}

.stage.live .slider :deep(.arco-slider-bar) {
  background: #fff;
}

.stage.live .slider :deep(.arco-slider-button) {
  background: #fff;
  border-color: #165dff;
}

/* ==================== 横屏提示 ==================== */
.rotate-hint {
  position: absolute;
  z-index: 6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 15px;
  border-radius: 999px;
  font-size: 12.5px;
  color: #fff;
  background-color: rgba(8, 12, 20, 0.5);
  background-image: linear-gradient(160deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.36),
    0 16px 30px -18px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  animation: hintIn 0.28s ease both;
}

.rotate-hint svg {
  width: 16px;
  height: 16px;
}

@keyframes hintIn {
  from {
    opacity: 0;
    transform: translate(-50%, -46%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* ==================== 互动按钮 ==================== */
.action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 13px 0 10px;
  flex: none;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.66);
  color: #b3400a;
  background: linear-gradient(160deg, rgba(255, 240, 232, 0.94), rgba(255, 213, 191, 0.72));
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 8px 18px -12px rgba(194, 65, 12, 0.7);
}

.action svg {
  width: 17px;
  height: 17px;
  overflow: visible;
}

/* 逗猫棒：羽毛和小铃铛绕着杆头来回甩 */
.wand-tip {
  transform-box: view-box;
  transform-origin: 13px 10.6px;
  animation: wandSwing 1.7s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.action:hover .wand-tip {
  animation-duration: 0.85s;
}

.action.busy .wand-tip {
  animation-duration: 0.32s;
}

@keyframes wandSwing {
  0%,
  100% {
    transform: rotate(-22deg);
  }
  50% {
    transform: rotate(20deg);
  }
}

.action:hover {
  background: linear-gradient(160deg, rgba(255, 236, 226, 0.98), rgba(255, 202, 176, 0.86));
}

.action:active {
  transform: scale(0.97);
}

.action:disabled {
  cursor: default;
  opacity: 0.8;
}

.stage.live .action {
  color: #ffe0cd;
  border-color: rgba(255, 178, 132, 0.42);
  background: linear-gradient(160deg, rgba(255, 133, 76, 0.52), rgba(255, 96, 60, 0.34));
  backdrop-filter: blur(12px) saturate(170%);
  -webkit-backdrop-filter: blur(12px) saturate(170%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.34),
    0 12px 24px -16px rgba(0, 0, 0, 0.85);
}

.stage.live .action:hover {
  background: linear-gradient(160deg, rgba(255, 150, 92, 0.62), rgba(255, 108, 68, 0.44));
}

/* ==================== 设备信息 ==================== */
.info {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.18) 60%, rgba(255, 255, 255, 0.3));
  backdrop-filter: blur(24px) saturate(170%);
  -webkit-backdrop-filter: blur(24px) saturate(170%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 22px 44px -34px rgba(35, 52, 92, 0.45);
}

.info-head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.info-chevron {
  flex: none;
  width: 16px;
  height: 16px;
  margin-left: auto;
  color: #8d98a8;
  transition: transform 0.24s ease, color 0.2s ease;
}

.info-head:hover .info-chevron {
  color: #4e5969;
}

.info.open .info-chevron {
  transform: rotate(180deg);
}

.info-body {
  display: grid;
  grid-template-rows: 0fr;
  margin-top: 0;
  transition: grid-template-rows 0.26s ease, margin-top 0.26s ease;
}

.info.open .info-body {
  grid-template-rows: 1fr;
  margin-top: 12px;
}

.info-body > .info-list {
  min-height: 0;
  overflow: hidden;
}

.info-head:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 55%, #fff);
  outline-offset: 6px;
  border-radius: 8px;
}

.info-name {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #16202f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 20px;
  padding: 0 8px;
  flex: none;
  border-radius: 999px;
  font-size: 11px;
  color: #0b7a32;
  background: rgba(0, 180, 42, 0.1);
  border: 1px solid rgba(0, 180, 42, 0.18);
}

.info-state i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #00b42a;
}

.info-state.off {
  color: #a8071a;
  background: rgba(245, 63, 63, 0.1);
  border-color: rgba(245, 63, 63, 0.2);
}

.info-state.off i {
  background: #f53f3f;
}

.info-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px 20px;
  margin: 0;
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.info-cell dt {
  font-size: 11px;
  color: #8d98a8;
  letter-spacing: 0.02em;
}

.info-cell dd {
  margin: 0;
  font-size: 12.5px;
  color: #2b3444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==================== 页脚信息 ==================== */
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px;
  font-size: 12px;
  color: #9aa4b4;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c9d0dc;
}

.dot.ok {
  background: #00b42a;
  box-shadow: 0 0 0 3px rgba(0, 180, 42, 0.12);
  animation: pulse 2.4s ease-in-out infinite;
}

.dot.wait {
  background: #ff7d00;
  box-shadow: 0 0 0 3px rgba(255, 125, 0, 0.12);
}

.dot.bad {
  background: #f53f3f;
  box-shadow: 0 0 0 3px rgba(245, 63, 63, 0.12);
}

.state {
  color: #4e5969;
  font-weight: 500;
}

.sep {
  color: #d5dbe4;
}

.ghost {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 8px;
  color: #86909c;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.ghost:hover {
  color: #101a2b;
  background: rgba(255, 255, 255, 0.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.ghost svg {
  width: 15px;
  height: 15px;
}

/* ==================== 其他 ==================== */
.toast {
  position: fixed;
  left: 50%;
  bottom: 34px;
  transform: translateX(-50%);
  z-index: 1200;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 12.5px;
  color: #fff;
  background: linear-gradient(160deg, rgba(30, 39, 57, 0.88), rgba(18, 25, 38, 0.74));
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 18px 36px -18px rgba(0, 0, 0, 0.55);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.994);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* ==================== 响应式 ==================== */
@media (max-width: 720px) {
  .page {
    width: 100%;
    min-height: 100svh;
    padding: 0 0 max(14px, env(safe-area-inset-bottom));
    gap: 12px;
    justify-content: flex-start;
  }

  /* 手机端全幅播放器：去掉卡片留白、圆角与阴影，画面顶到屏幕两侧 */
  .player {
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    animation: none;
  }

  .stage {
    border-radius: 0;
  }

  /* 手机端固定播放面板高度：16:9 画面上下留黑，出流时不跳动 */
  .stage:not(.pseudo) {
    aspect-ratio: auto;
    height: clamp(260px, 38svh, 340px);
  }

  .toolbar {
    left: 8px;
    right: 8px;
    bottom: 8px;
    transform: none;
    max-width: none;
    height: 44px;
    gap: 6px;
    padding: 0 6px;
  }

  /* 分隔线在手机上退化成撑开左右两组的弹性空隙 */
  .divider,
  .stage.live .divider {
    width: auto;
    height: 1px;
    flex: 1;
    background: transparent;
  }

  .seg button {
    padding: 0 10px;
  }

  .slider {
    width: 54px;
  }

  .placeholder {
    gap: 7px;
    padding: 16px 18px 62px;
  }

  .glyph {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .glyph svg {
    width: 18px;
    height: 18px;
  }

  .placeholder h1 {
    margin-top: 2px;
    font-size: 13px;
  }

  .placeholder p {
    font-size: 11.5px;
    line-height: 1.5;
  }

  .placeholder .retry.arco-btn {
    height: 30px;
    margin-top: 2px;
    padding: 0 14px;
    font-size: 12.5px;
  }

  .meta {
    flex-wrap: wrap;
    gap: 6px;
    padding: 0 16px;
  }

  .info {
    margin: 0 12px;
    padding: 14px 16px;
    gap: 0;
    border-radius: 18px;
  }

  .info.open .info-body {
    margin-top: 10px;
  }

  .info-name {
    font-size: 13.5px;
  }

  .info-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 14px;
  }

  .info-cell:last-child {
    grid-column: 1 / -1;
  }

  .info-cell dd {
    font-size: 12px;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .action {
    height: 28px;
    padding: 0 11px 0 9px;
    font-size: 11.5px;
  }
}

/* 窄屏控制条太挤，音量改由图标控制 */
@media (max-width: 430px) {
  .slider {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner,
  .dot.ok {
    animation: none;
  }

  .player {
    animation: none;
  }
}
</style>
