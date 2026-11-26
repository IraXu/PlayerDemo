<template>
  <div
    class="page"
    :class="{ immersive: pseudoFullscreen || isFullscreen, touch: touchMode, 'bear-day': isBear, teasing: teasing }"
  >
    <header class="site-header">
      <a class="wordmark" href="#office" aria-label="回到十七的逗猫室"><span class="wordmark-icon"><PawPrintIcon :size="19"/></span><span>十七的逗猫室<small>THE EVERYDAY OFFICE</small></span></a>
      <span class="header-date">{{ officeDate }} <span>宜 · 来逗猫</span></span>
      <button class="page-cat" :class="{ revealed: eggRevealed }" type="button" aria-label="打开隐藏彩蛋" @click="openEgg">
        <svg class="cat-mascot" viewBox="0 0 120 110" fill="none" aria-hidden="true"><AnimalArtwork :animal="isBear ? 'bear' : 'cat'" :pink="!isBear" transform="translate(10 3)" /></svg>
        <span class="mascot-hearts" aria-hidden="true"><span v-for="i in 2" :key="i" class="mascot-heart" :style="{ '--i': i }">♥</span></span>
      </button>
    </header>

    <main id="office" class="office-main">
      <div class="office-layout">
        <section class="desk-panel">
          <div class="player">
      <div
        ref="stageRef"
        :class="['stage', { live: isLive, pseudo: pseudoFullscreen, rotated }]"
        @click="onStageTap"
        @dblclick="onStageDoubleClick"
      >
        <div ref="containerRef" class="video"></div>

        <transition name="tease-fade">
          <TeaseEffects v-if="isLive && teasing" :label="copy.teasingText" :duration="TEASE_DURATION_MS" />
        </transition>

        <div v-if="rotateHint" class="rotate-hint">
          <SmartphoneIcon :size="16" color="currentColor" />
          <span>请将手机横过来观看</span>
        </div>

        <div v-if="!isLive" class="placeholder" :class="{ idle: status === 'idle' }">
          <span class="print-index">THE OFFICE / 017</span>
          <div class="waiting-art"><QuietWindow /></div>
          <div class="waiting-copy">
            <span class="waiting-eyebrow">今日工位，等你来逗。</span>
            <h2>{{ status === 'idle' ? '猫猫正在暴躁赶工' : placeholderTitle }}</h2>
            <p>{{ status === 'idle' ? '键盘快冒烟了，消息还没回完\n连接猫猫，围观猫猫在线发疯！' : placeholderText }}</p>
            <button v-if="status === 'idle'" class="play-btn" type="button" :aria-label="copy.playAria" @click.stop="openPlayback"><PlayIcon :size="13"/><span>开始逗猫</span></button>
            <Button v-else-if="status === 'error'" type="primary" class="retry" @click="connect"><RefreshIcon :size="14"/>重新连接</Button>
            <span v-else class="connecting"><SpinnerIcon class="spinner" :size="17"/> 正在连接…</span>
          </div>
          <span class="print-caption">A DESK. A CAT. A LITTLE COMPANY.</span>
        </div>

        <PlayerControls v-if="isLive" :dock-target="controlsDockRef" :muted="muted" :volume="volumePercent" :quality="stream" :fullscreen="fullActive" :busy="interacting || teasing" :cooldown="cooldownLeft" @stop="closePlayback" @mute="toggleMute" @volume="onVolumeChange" @quality="onQualityChange(String($event))" @capture="takeScreenshot" @fullscreen="toggleFullscreen" @tease="triggerInteract" />

      </div>
            <div ref="controlsDockRef" class="mobile-controls-dock"></div>
          </div>

          <div class="desk-status" role="status"><span>{{ statusLabel }}</span><span>速速逗猫，快乐一整天，哈哈！</span></div>
        </section>


      </div>
      <section class="office-note" aria-label="办公室小记"><span>OFFICE NOTE</span><p>不用每一分钟都有意义。<br class="mobile-break"/> 有时，只是一起待着就很好。</p><span class="note-symbol" aria-hidden="true">⌁</span></section>
    </main>
    <footer class="site-footer"><span>十七的逗猫室</span><span>GOOD COMPANY, EVERY DAY.</span><span>慢一点，也没关系。</span></footer>

    <Modal v-model:open="huntOpen" :title="huntFound ? '找到猫猫了' : '工间寻猫'" :width="400">
      <div class="hunt-guide"><span class="tool-kicker">A TINY HIDE & SEEK</span><BreakStamp kind="cat"/><h3>{{ huntFound ? '原来你躲在这里。' : huntSearching ? '它在某个角落，等你发现。' : '有位同事，偷偷离开了工位。' }}</h3><p>{{ huntFound ? '今天的小猫已找到。明天会换一个位置，记得再来看看。' : copy.huntHints[huntHintIndex % copy.huntHints.length] }}</p><div class="hunt-steps" v-if="!huntFound"><span>01 关闭提示</span><span>02 看看边缘</span><span>03 点一下小猫</span></div></div>
      <template #footer><Button v-if="!huntFound" @click="huntHintIndex++">换个提示</Button><Button type="primary" @click="huntSearching = !huntFound; huntOpen = false">{{ huntFound ? '收好这个发现' : '回页面找找' }}</Button></template>
    </Modal>
    <DailyFortune ref="fortuneRef" />
    <FindTheCat :searching="huntSearching" v-model:found="huntFound" @found="onCatFound" />

    <Modal v-model:open="treeOpen" :title="treeSent ? '树洞收到了' : '树洞'" :width="460">
      <div v-if="treeSent" class="letter-success"><BreakStamp kind="tree"/><span class="tool-kicker">A LITTLE HOLLOW FOR YOUR THOUGHTS</span><h3>心事放下了，人轻一点。</h3><p>这段话已经提交到树洞。谢谢你愿意把心事留在这里。</p></div>
      <div v-else class="tree-hole">
        <div class="letter-header"><BreakStamp kind="tree"/><div><span class="tool-kicker">A QUIET LITTLE HOLLOW</span><h3>有些话，说给树洞听。</h3><p>开心的、委屈的、还没想明白的，都可以。</p></div></div>
        <label class="letter-label" for="office-letter">想对树洞说的话 <span>关掉窗口，草稿还在</span></label>
        <textarea
          v-model="treeMessage"
          id="office-letter"
          :disabled="treeSending"
          class="tree-input"
          maxlength="500"
          rows="5"
          placeholder="树洞，我想说…"
          aria-label="树洞留言"
        ></textarea>

        <div class="tree-image">
          <input
            ref="treeFileRef"
            class="tree-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            @change="onTreeImageChange"
          />
          <div v-if="treeImageLoading" class="tree-image-state">图片处理中…</div>
          <div v-else-if="treeImage" class="tree-image-preview">
            <img :src="treeImage.preview" alt="待发送的图片预览" />
            <div class="tree-image-info">
              <strong>已添加 1 张图片</strong>
              <span>
                {{ treeImage.width }}×{{ treeImage.height }} ·
                {{ Math.round(treeImage.size / 1024) }} KB
              </span>
            </div>
            <button
              class="tree-image-remove"
              :disabled="treeSending"
              type="button"
              aria-label="移除图片"
              @click="removeTreeImage"
            >
              ×
            </button>
          </div>
          <button v-else class="tree-image-add" :disabled="treeSending" type="button" @click="treeFileRef?.click()">
            <ImageIcon :size="16" color="currentColor" />
            添加图片（可选）
          </button>
          <p v-if="treeImageError" class="tree-error tree-image-error">{{ treeImageError }}</p>
        </div>

        <div class="tree-meta">
          <span>{{ treeMessage.length }}/500</span>
          <span v-if="treeError" class="tree-error">{{ treeError }}</span>
        </div>
      </div>
      <template #footer><Button v-if="treeSent" type="primary" @click="treeOpen = false">把心事留在这里</Button><template v-else><Button :disabled="treeSending" @click="treeOpen = false">暂存草稿</Button><Button class="tree-submit" type="primary" :disabled="!treeMessage.trim() || treeSending || treeImageLoading" @click="submitTreeHole">{{ treeSending ? '正在投递…' : '悄悄放进树洞 ↗' }}</Button></template></template>
    </Modal>

    <Modal v-model:open="shareOpen" title="带走这一刻" :width="480">
      <div v-if="!isLive" class="share-before"><BreakStamp kind="photo"/><span class="tool-kicker">A POSTCARD FROM THE OFFICE</span><h3>先见到它，再留下这一刻。</h3><p>卡片会用正在播放的真实画面制作，附上日期和今日猫签。</p></div>
      <div v-else class="share-card">
        <div class="postcard-heading"><span class="tool-kicker">A POSTCARD FROM THE OFFICE</span><p aria-live="polite">{{ shareBusy ? '正在把此刻装进卡片…' : shareError ? '这次没留住，我们再试一次。' : shareSaved ? '已准备下载，可在浏览器下载记录中查看。' : '画面、日期和猫签，一起留给你。' }}</p></div>
        <div class="share-stage">
          <template v-if="shareBusy">
            <div class="share-skeleton" aria-hidden="true">
              <div class="share-skeleton__photo"></div>
              <div class="share-skeleton__line wide"></div>
              <div class="share-skeleton__line"></div>
              <div class="share-skeleton__fortune"></div>
            </div>
            <div class="share-busy" role="status" aria-live="polite">
              <SpinnerIcon class="spinner" :size="18" color="#8BA7BC" />
              <span>{{ copy.shareLoading }}</span>
            </div>
          </template>

          <div v-else-if="shareError" class="share-error">
            <span class="share-error__icon">
              <PawPrintIcon :size="30" color="#c9b79a" />
            </span>
            <strong>{{ copy.shareErrorTitle }}</strong>
            <p>{{ copy.shareFail }}</p>

          </div>

          <figure v-else-if="shareUrl" class="share-polaroid">
            <img :src="shareUrl" alt="分享卡片预览" />
          </figure>
        </div>

        <p v-if="shareUrl && !shareBusy && !shareError" class="share-tip">
          {{ copy.shareCardTip }}
        </p>
      </div>
      <template #footer><Button v-if="!isLive" type="primary" @click="startSharePlayback">打开工位并制作卡片 ↗</Button><template v-else><Button :disabled="shareBusy" @click="generateShareCard"><RefreshIcon :size="13"/>重新取一帧</Button><Button class="share-save" type="primary" :disabled="!shareUrl || shareBusy" @click="saveShareCard"><DownloadIcon :size="14"/>{{ shareSaved ? '再次保存卡片' : '保存卡片' }}</Button></template></template>
    </Modal>

    <transition name="fade">
      <div v-if="toast" class="toast" role="status" aria-live="polite">{{ toast }}</div>
    </transition>

    <transition name="egg-fade">
      <CatKeepsake v-if="eggOpen" :photo="eggPhoto" :wish="copy.eggWish" @close="closeEgg" />
    </transition>

    <BreakMenu :searching="huntSearching" :found="huntFound" :immersive="fullActive" @action="onBreakAction" />
    <CompanionCat />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button, Modal } from './ui'
import {
  PlayIcon,
  DownloadIcon,
  ImageIcon,
  PawPrintIcon,
  RefreshIcon,
  SmartphoneIcon,
  SpinnerIcon,
} from './ui/icons'
import {
  interact,
  LIGHT_DURATION_MS,
  queryStream,
  type StreamInfo,
} from './api'
import eggPhoto from './assets/easter-egg.jpg'
import {
  buildTreeHoleMessage,
  getClientInfo,
  getNetworkInfoWithTimeout,
  loadNetworkInfo,
} from './clientInfo'
import { prepareTreeImage, type TreeImage } from './treeImage'
import { composeShareCard } from './shareCard'
import { loadPlayerSdk } from './playerSdk'
import { copy, isBear, theme } from './theme'
import CatKeepsake from './components/CatKeepsake.vue'
import PlayerControls from './components/PlayerControls.vue'
import BreakStamp from './components/BreakStamp.vue'
import BreakMenu from './components/BreakMenu.vue'
import QuietWindow from './components/QuietWindow.vue'
import TeaseEffects from './components/TeaseEffects.vue'
import AnimalArtwork from './components/AnimalArtwork.vue'
import CompanionCat from './components/CompanionCat.vue'
import DailyFortune from './components/DailyFortune.vue'
import FindTheCat from './components/FindTheCat.vue'

const did = '1200010180ee9bea'
const TREE_WEBHOOK = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ab1da84d-6f0f-4d9f-8f7b-73ea0dc9db3b'

const containerRef = ref<HTMLElement>()
const stageRef = ref<HTMLElement>()
const controlsDockRef = ref<HTMLElement>()
const status = ref<'idle' | 'loading' | 'switching' | 'playing' | 'error'>('idle')
const errorMsg = ref('')
const QUALITY_KEY = 'cat-stream-quality'

/** 记住上次清晰度；手机上默认高清，减少软解压力 */
function initialQuality(): 0 | 1 {
  try {
    const saved = localStorage.getItem(QUALITY_KEY)
    if (saved === '0' || saved === '1') return saved === '1' ? 1 : 0
  } catch {
    /* 隐私模式下忽略 */
  }
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return coarse || cores <= 4 || memory <= 4 ? 1 : 0
}

const stream = ref<0 | 1>(initialQuality())
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
const interacting = ref(false)
// 逗猫棒动画时长：和硬件侧的互动窗口保持一致
const teasing = ref(false)
const TEASE_DURATION_MS = LIGHT_DURATION_MS
// 逗完歇一会儿，避免对面被反复打扰
const cooldownLeft = ref(0)
const COOLDOWN_MS = 30_000

// Office date stamp and break-time dialogs
const officeDate = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' }).format(new Date())
const huntOpen = ref(false)
const shareAfterPlayback = ref(false)
const huntSearching = ref(false)
const huntHintIndex = ref(0)
const treeSent = ref(false)
const huntFound = ref(false)
const fortuneRef = ref<{ openNote: () => void } | null>(null)
// 触屏设备不展示悬浮提示，避免提示浮层干扰点击
const touchMode = ref(false)
// 彩蛋
const eggOpen = ref(false)
const eggRevealed = ref(false)
let eggRevealTimer: ReturnType<typeof setTimeout> | null = null
// 树洞
const treeOpen = ref(false)
const treeMessage = ref('')
const treeSending = ref(false)
const treeImage = ref<TreeImage | null>(null)
const treeImageLoading = ref(false)
const treeImageError = ref('')
const treeFileRef = ref<HTMLInputElement | null>(null)
const treeError = ref('')
// 分享卡片
const shareOpen = ref(false)
const shareBusy = ref(false)
const shareError = ref(false)
const shareSaved = ref(false)
const shareUrl = ref('')

const isLive = computed(() => status.value === 'playing')
const fullActive = computed(() => isFullscreen.value || pseudoFullscreen.value)
const statusLabel = computed(() => {
  if (status.value === 'playing') return copy.value.liveStatus
  if (status.value === 'error') return '未连接'
  if (status.value === 'idle') return copy.value.idleStatus
  return status.value === 'switching' ? '切换中' : '连接中'
})
const placeholderTitle = computed(() => {
  if (status.value === 'error') return copy.value.errorTitle
  if (status.value === 'idle') return copy.value.playTitle
  return status.value === 'switching' ? copy.value.switchingTitle : copy.value.loadingTitle
})
const placeholderText = computed(() => {
  if (status.value === 'error') return errorMsg.value || copy.value.errorText
  if (status.value === 'idle') return copy.value.playText
  return status.value === 'switching' ? copy.value.switchingText : copy.value.loadingText
})
const interactDisabled = computed(
  () => interacting.value || teasing.value || cooldownLeft.value > 0,
)



const MAX_RECONNECT_ATTEMPTS = 4
const RECONNECT_MAX_DELAY = 12_000
const HIDDEN_SUSPEND_MS = 3 * 60_000

let player: HMPlayerInstance | null = null
let resizeObserver: ResizeObserver | null = null
let videoGuard: MutationObserver | null = null
let watchdogTimer: ReturnType<typeof setTimeout> | null = null
let toastTimer: ReturnType<typeof setTimeout> | null = null
let teaseEndTimer: ReturnType<typeof setTimeout> | null = null
let cooldownTimer: ReturnType<typeof setInterval> | null = null
let rotateHintTimer: ReturnType<typeof setTimeout> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let hiddenSuspendTimer: ReturnType<typeof setTimeout> | null = null
const redrawTimers: Array<ReturnType<typeof setTimeout>> = []
// 用户是否还想继续看直播：手动关闭后不再自动重连
let wantLive = false
let reconnectAttempt = 0
let reconnecting = false
// 后台挂久了主动停流，回来时再恢复
let suspendedByHidden = false

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
  try {
    player.resizeView(0, 0, Math.max(1, clientWidth), Math.max(1, clientHeight))
  } catch {
    /* 播放器 worker 尚未初始化完成时忽略这次尺寸同步 */
  }
}

/** 首帧出来后再监听尺寸变化，避免向还没初始化的 worker 发送 resize */
function attachResizeObserver(el: HTMLElement) {
  if (resizeObserver) return
  resizeObserver = new ResizeObserver(() => resizePlayer())
  resizeObserver.observe(el)
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
      player.setVolume(volumePercent.value)
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

  await loadPlayerSdk()

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
      reconnectAttempt = 0
      stopWatchdog()
      attachResizeObserver(el)
      forceRedraw()
      applyAudioState()
    } else if (state === 5) {
      handleStreamInterruption('播放通道已中断，正在重连…')
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
      reconnectAttempt = 0
      stopWatchdog()
      attachResizeObserver(el)
    }
  })

  instance.on('error', () => {
    if (player !== instance) return
    handleStreamInterruption('拉流异常，正在重连…')
  })

  resizeObserver?.disconnect()
  resizeObserver = null

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
    handleStreamInterruption('连接超时，正在重试…')
  }, 10_000)
}

function stopWatchdog() {
  if (watchdogTimer) {
    clearTimeout(watchdogTimer)
    watchdogTimer = null
  }
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function clearHiddenSuspendTimer() {
  if (hiddenSuspendTimer) {
    clearTimeout(hiddenSuspendTimer)
    hiddenSuspendTimer = null
  }
}

/** 直播中途断开：保持“还想看”的意图，按指数退避自动重连 */
function handleStreamInterruption(message: string) {
  if (!wantLive || reconnecting) return
  stopWatchdog()
  status.value = 'loading'
  errorMsg.value = ''
  showToast(message)
  void destroyPlayer()
  scheduleReconnect()
}

function scheduleReconnect() {
  if (!wantLive || reconnectTimer) return
  if (reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
    status.value = 'error'
    errorMsg.value = '画面没有连上，稍后再试试吧'
    showToast(errorMsg.value)
    return
  }
  const delay = Math.min(RECONNECT_MAX_DELAY, 1500 * 2 ** reconnectAttempt)
  reconnectAttempt += 1
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    void reconnectStream()
  }, delay)
}

async function reconnectStream() {
  if (!wantLive || reconnecting) return
  reconnecting = true
  clearReconnectTimer()

  try {
    await destroyPlayer()
    stopWatchdog()
    resetMeta()
    status.value = 'loading'
    errorMsg.value = ''

    const [info] = await Promise.all([fetchStream(), loadPlayerSdk()])
    if (!wantLive) return
    await startPlayer(info, stream.value)
    // 等待期间用户可能已经手动关掉了
    if (!wantLive) {
      await destroyPlayer()
      return
    }
    startWatchdog()
  } catch {
    scheduleReconnect()
  } finally {
    reconnecting = false
  }
}

// ==================== 取流 ====================
function fetchStream(): Promise<StreamInfo> {
  return queryStream()
}

async function connect() {
  clearReconnectTimer()
  clearHiddenSuspendTimer()
  wantLive = true
  reconnectAttempt = 0
  suspendedByHidden = false

  await destroyPlayer()
  stopWatchdog()
  resetMeta()
  status.value = 'loading'
  errorMsg.value = ''

  try {
    // SDK 加载和取流并行，首次点击播放时少等一个网络往返
    const [info] = await Promise.all([fetchStream(), loadPlayerSdk()])
    await startPlayer(info, stream.value)
    startWatchdog()
  } catch (error) {
    status.value = 'error'
    errorMsg.value = (error as Error).message || '连接失败'
    // 断网时保留观看意图，等网络恢复后自动重连
    if (navigator.onLine) {
      wantLive = false
    } else {
      errorMsg.value = '网络好像断开了，恢复后会自动重连'
    }
  }
}

// 点击播放按钮才建立视频通道，避免进入页面自动拉流
async function openPlayback() {
  if (status.value !== 'idle' && status.value !== 'error') return
  await connect()
}

// 播放中关闭：销毁播放器回到未播放状态
async function closePlayback() {
  wantLive = false
  reconnectAttempt = 0
  suspendedByHidden = false
  clearReconnectTimer()
  clearHiddenSuspendTimer()
  await destroyPlayer()
  stopWatchdog()
  resetMeta()
  errorMsg.value = ''
  status.value = 'idle'
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined)
  if (pseudoFullscreen.value) exitPseudoFullscreen()
}

async function switchStream(target: 0 | 1) {
  if (target === stream.value || status.value !== 'playing') return
  stream.value = target
  wantLive = true
  reconnectAttempt = 0
  clearReconnectTimer()

  await destroyPlayer()
  resetMeta()
  status.value = 'switching'
  errorMsg.value = ''

  try {
    // 取流地址可能已过期，切换清晰度时重新取一次
    const [info] = await Promise.all([fetchStream(), loadPlayerSdk()])
    await startPlayer(info, target)
    startWatchdog()
  } catch (error) {
    status.value = 'error'
    errorMsg.value = (error as Error).message || '切换码流失败'
  }
}

function onQualityChange(key: string) {
  const target: 0 | 1 = Number(key) === 1 ? 1 : 0
  try {
    localStorage.setItem(QUALITY_KEY, String(target))
  } catch {
    /* 隐私模式下忽略 */
  }
  void switchStream(target)
}

// ==================== 设备信息 / 互动 ====================
function clearTeaseTimers() {
  if (teaseEndTimer) clearTimeout(teaseEndTimer)
  if (cooldownTimer) clearInterval(cooldownTimer)
  teaseEndTimer = null
  cooldownTimer = null
}

/** 逗猫棒在画面上挥 6 秒，和硬件侧的反应时间对齐 */
function startTeaseWindow() {
  if (teaseEndTimer) clearTimeout(teaseEndTimer)
  teasing.value = true
  teaseEndTimer = setTimeout(() => {
    teaseEndTimer = null
    teasing.value = false
    showToast(copy.value.teaseEndToast)
  }, TEASE_DURATION_MS)
}

/** 从点亮那一刻开始计冷却，灯灭之后还剩 24 秒的休息 */
function startCooldown() {
  if (cooldownTimer) clearInterval(cooldownTimer)
  const startedAt = Date.now()
  cooldownLeft.value = Math.ceil(COOLDOWN_MS / 1000)
  cooldownTimer = setInterval(() => {
    const remain = startedAt + COOLDOWN_MS - Date.now()
    cooldownLeft.value = Math.max(0, Math.ceil(remain / 1000))
    if (remain <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 250)
}

async function triggerInteract() {
  if (interactDisabled.value) return
  interacting.value = true
  try {
    await interact()
    startTeaseWindow()
    startCooldown()
  } catch (error) {
    showToast((error as Error).message || `${copy.value.interactLabel}指令下发失败`)
  } finally {
    interacting.value = false
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
      player.setVolume(volumePercent.value)
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
      player.setVolume(next)
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
  return Boolean(target?.closest?.('.toolbar, button, a, input, .ui-tooltip'))
}

function onStageTap(event: MouseEvent) {
  // 手机端：点画面直接进横屏全屏，和原生播放器一致
  if (!isLive.value || !isTouchDevice() || isToolbarEvent(event)) return
  void toggleFullscreen()
}

function onStageDoubleClick(event: MouseEvent) {
  // 桌面端：双击画面切换全屏
  if (!isLive.value || isTouchDevice() || isToolbarEvent(event)) return
  void toggleFullscreen()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (eggOpen.value || eggRevealed.value) {
    closeEgg()
    return
  }
  if (pseudoFullscreen.value) exitPseudoFullscreen()
}

// ==================== 彩蛋 ====================
function openEgg() {
  if (eggRevealTimer || eggOpen.value) return
  eggRevealed.value = true
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  eggRevealTimer = setTimeout(() => {
    eggRevealTimer = null
    eggOpen.value = true
    lockScroll(true)
  }, reduced ? 0 : 520)
}

function closeEgg() {
  if (eggRevealTimer) clearTimeout(eggRevealTimer)
  eggRevealTimer = null
  eggRevealed.value = false
  eggOpen.value = false
  if (!pseudoFullscreen.value) lockScroll(false)
}

// ==================== 树洞 ====================
function openTreeHole() {
  treeError.value = ''
  treeSent.value = false
  treeOpen.value = true
  // 提前拿 IP，等用户写完时基本已经就绪
  void loadNetworkInfo()
}

async function onTreeImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  treeImageError.value = ''
  treeImageLoading.value = true
  try {
    treeImage.value = await prepareTreeImage(file)
  } catch (error) {
    treeImage.value = null
    treeImageError.value = error instanceof Error ? error.message : '图片处理失败，换一张试试'
  } finally {
    treeImageLoading.value = false
  }
}

function removeTreeImage() {
  treeImage.value = null
  treeImageError.value = ''
  if (treeFileRef.value) treeFileRef.value.value = ''
}

async function postToTreeHole(payload: string) {
  await fetch(TREE_WEBHOOK, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: payload,
  })
}

async function submitTreeHole() {
  const content = treeMessage.value.trim()
  if (!content || treeSending.value || treeImageLoading.value) return
  treeSending.value = true
  treeError.value = ''
  const image = treeImage.value
  let textSent = false

  try {
    const network = await getNetworkInfoWithTimeout()
    const message = buildTreeHoleMessage(content, getClientInfo(), network, image)
    const payload = JSON.stringify({
      msgtype: 'markdown',
      markdown: { content: message },
    })

    if (image) {
      // 图片消息要单独发一次，体积大，不能用 sendBeacon
      await postToTreeHole(payload)
      textSent = true
      await postToTreeHole(
        JSON.stringify({
          msgtype: 'image',
          image: { base64: image.base64, md5: image.md5 },
        }),
      )
    } else {
      // 企业微信机器人不支持浏览器 CORS；用 text/plain 的简单请求直发，
      // sendBeacon 失败时再退回 no-cors fetch，避免预检被拦截。
      let queued = false
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        queued = navigator.sendBeacon(
          TREE_WEBHOOK,
          new Blob([payload], { type: 'text/plain;charset=UTF-8' }),
        )
      }
      if (!queued) await postToTreeHole(payload)
    }

    treeSent.value = true
    treeMessage.value = ''
    removeTreeImage()
    // Keep the confirmation inside the letter dialog.
  } catch {
    if (textSent) {
      treeOpen.value = false
      treeMessage.value = ''
      removeTreeImage()
      showToast('留言已经送达，但图片没发出去，可以再单独发一次')
    } else {
      treeError.value = '树洞暂时堵住了，稍后再试试吧'
    }
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

function scheduleHiddenSuspend() {
  clearHiddenSuspendTimer()
  if (!wantLive || status.value !== 'playing') return
  hiddenSuspendTimer = setTimeout(() => {
    hiddenSuspendTimer = null
    if (!document.hidden || !wantLive || status.value !== 'playing') return
    // 页面挂后台超过 3 分钟：主动停流，省设备和流量，回前台再拉
    suspendedByHidden = true
    status.value = 'idle'
    clearReconnectTimer()
    stopWatchdog()
    void destroyPlayer()
  }, HIDDEN_SUSPEND_MS)
}

function onVisibilityChange() {
  if (document.hidden) {
    scheduleHiddenSuspend()
    return
  }

  clearHiddenSuspendTimer()
  if (suspendedByHidden) {
    suspendedByHidden = false
    reconnectAttempt = 0
    showToast('猫猫重新连接中…')
    void reconnectStream()
    return
  }
  if (wantLive && status.value === 'error') {
    reconnectAttempt = 0
    void reconnectStream()
    return
  }
  if (player && status.value === 'playing') {
    forceRedraw()
    applyAudioState()
  }
}

function onOnline() {
  if (!wantLive || status.value === 'playing' || document.hidden) return
  reconnectAttempt = 0
  clearReconnectTimer()
  showToast('网络恢复了，正在重新连接…')
  void reconnectStream()
}

// ==================== 找猫 / 找熊 ====================
function onCatFound() {
  huntSearching.value = false
  huntOpen.value = true
}

// ==================== 分享卡片 ====================
function releaseShareCard() {
  if (shareUrl.value) URL.revokeObjectURL(shareUrl.value)
  shareUrl.value = ''
}

async function openShareFromMenu() {
  shareOpen.value = true
  if (isLive.value && player) await generateShareCard()
}
function startSharePlayback() {
  shareAfterPlayback.value = true
  shareOpen.value = false
  void openPlayback()
}
watch(isLive, async live => {
  if (live && shareAfterPlayback.value) {
    shareAfterPlayback.value = false
    shareOpen.value = true
    await generateShareCard()
  }
})
watch(status, value => { if (value === 'error' || value === 'idle') shareAfterPlayback.value = false })

async function generateShareCard() {
  if (!player) return

  releaseShareCard()
  shareError.value = false
  shareSaved.value = false
  shareBusy.value = true

  try {
    const shot = await player.screenshot(undefined, 'jpeg', 0.92, 'base64')
    if (typeof shot !== 'string' || !shot.startsWith('data:image')) {
      throw new Error('截图失败')
    }
    const blob = await composeShareCard({ screenshot: shot, theme: theme.value })
    if (!shareOpen.value) return
    shareUrl.value = URL.createObjectURL(blob)
  } catch {
    if (!shareOpen.value) return
    shareError.value = true
  } finally {
    shareBusy.value = false
  }
}

function shareFileName() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const prefix = theme.value === 'bear' ? 'bear' : 'cat'
  return `${prefix}-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.jpg`
}

function saveShareCard() {
  if (!shareUrl.value) return
  const link = document.createElement('a')
  link.href = shareUrl.value
  link.download = shareFileName()
  document.body.appendChild(link)
  link.click()
  link.remove()
  shareSaved.value = true
  showToast(copy.value.shareSaved)
}

watch(shareOpen, (open) => {
  if (!open) {
    releaseShareCard()
    shareError.value = false
    shareSaved.value = false
  }
})

// ==================== 小角落菜单 ====================
function onBreakAction(action: 'fortune' | 'hunt' | 'share' | 'tree') {
  if (action === 'fortune') openFortuneFromMenu()
  else if (action === 'hunt') openHuntFromMenu()
  else if (action === 'share') void openShareFromMenu()
  else openTreeFromMenu()
}
function openFortuneFromMenu() {
  fortuneRef.value?.openNote()
}

function openHuntFromMenu() {
  huntOpen.value = true
}

function openTreeFromMenu() {
  openTreeHole()
}

onMounted(() => {
  touchMode.value = isTouchDevice()
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('resize', onViewportResize)
  window.addEventListener('orientationchange', onViewportResize)
  window.visualViewport?.addEventListener('resize', onViewportResize)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('online', onOnline)
})

onBeforeUnmount(() => {
  if (eggRevealTimer) clearTimeout(eggRevealTimer)
  if (toastTimer) clearTimeout(toastTimer)
  clearTeaseTimers()
  if (rotateHintTimer) clearTimeout(rotateHintTimer)
  clearReconnectTimer()
  clearHiddenSuspendTimer()
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', onViewportResize)
  window.removeEventListener('orientationchange', onViewportResize)
  window.visualViewport?.removeEventListener('resize', onViewportResize)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('online', onOnline)
  releaseShareCard()
  lockScroll(false)
  void destroyPlayer()
})
</script>

<style scoped src="./player.css"></style>
