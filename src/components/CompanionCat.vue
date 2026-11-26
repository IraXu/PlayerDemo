<template>
  <div class="companion" :class="[mode, { leftward: facing < 0, invite: showInvite }]" :style="style">
    <button class="companion-btn" type="button" :aria-label="copy.companionAria" @pointerenter="preloadCommonSounds" @click="onCatClick">
      <span
        v-if="bubbleHint"
        class="companion-bubble"
        :class="{ news: hasNews, scene: scene !== 'none' }"
        aria-hidden="true"
      >
        {{ bubbleHint }}
      </span>
      <svg v-if="isBear" class="companion-cat" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <AnimalArtwork animal="bear" :speaking="mode === 'speak'" />
      </svg>
      <svg v-else class="companion-cat" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <AnimalArtwork animal="cat" :speaking="mode === 'speak'" />

        <g
          v-if="biteSpot"
          class="companion-bite-anchor"
          :transform="`translate(${biteSpot.x} ${biteSpot.y}) rotate(${biteSpot.rotate})`"
        >
          <g class="companion-bite-mark">
            <ellipse cx="0" cy="0" rx="10" ry="6.6" fill="rgba(232, 96, 96, 0.16)" />
            <path
              d="M-9.4 -4.2l2.7 3.1 2.8-3.1 2.7 3.1 2.8-3.1 2.7 3.1 2.7-3.1"
              stroke="#E06161"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
            <path
              d="M-9.4 4.2l2.7-3.1 2.8 3.1 2.7-3.1 2.8 3.1 2.7-3.1 2.7 3.1"
              stroke="#E06161"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </g>
        </g>
      </svg>
    </button>

    <Transition name="fox">
      <svg
        v-if="foxVisible"
        class="companion-fox"
        :class="{ lunge: foxLunge, mischief: foxMood === 'mischief' }"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <g class="companion-fox-body"><AnimalArtwork animal="fox" /></g>
      </svg>
    </Transition>

    <span v-if="biteBubble" class="companion-bubble scene fox-bubble" aria-hidden="true">
      {{ biteBubble }}
    </span>

    <span v-if="mode === 'sleep'" class="companion-zzz" aria-hidden="true">z</span>

    <span
      v-for="heart in hearts"
      :key="heart.id"
      class="companion-heart"
      aria-hidden="true"
      :style="{ left: heart.left + 'px', '--delay': heart.delay + 's', '--size': heart.size + 'px' }"
      >♥</span
    >
  </div>

  <Modal
    v-model:open="messageOpen"
    variant="default"
    title="娇娇的留言"
    :width="420"
    :typewriter="false"
    :show-footer="false"
  >
    <div class="inbox-layout">
      <div class="inbox-cover"><span>LETTERS FROM JIAOJIA</span><p>有些话，猫猫替我带给你。</p></div>
      <div class="inbox-navigation" v-if="messageDates.length">
        <button type="button" :disabled="!canOlder" aria-label="更早的留言" @click="shiftDate(1)"><ChevronLeftIcon :size="16"/></button>
        <label><span>按日期阅读</span><select v-model="selectedDate" aria-label="留言日期"><option v-for="day in messageDates" :key="day" :value="day">{{ dateLabel(day) }}</option></select></label>
        <button type="button" :disabled="!canNewer" aria-label="更新的留言" @click="shiftDate(-1)"><ChevronRightIcon :size="16"/></button>
      </div>
      <div ref="chatListRef" class="inbox-letters">
        <article v-for="(item,i) in dateMessages" :key="item.id" class="inbox-letter"><div><span>娇娇</span><time v-if="item.time">{{ timeLabel(item) }}</time><span class="letter-index">{{ String(i + 1).padStart(2, '0') }}</span></div><p>{{ item.text }}</p></article>
        <p v-if="!dateMessages.length" class="inbox-empty">今天的信还在路上，改天再来读读吧。</p>
      </div>
      <span class="inbox-end">写给你的每一句，都留在这里。</span>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Modal } from '../ui'
import { ChevronLeftIcon, ChevronRightIcon, PawPrintIcon } from '../ui/icons'
import { preloadSoundEffects, playBearCall, playChirp, playMeow, playPurr, playReveal, playYip, playYowl } from '../sfx'
import AnimalArtwork from './AnimalArtwork.vue'
import { copy, isBear } from '../theme'

type Mode = 'sit' | 'walk' | 'sleep' | 'happy' | 'speak' | 'nuzzle' | 'bite'
type Scene = 'none' | 'nuzzle' | 'bite'

interface BiteSpot {
  x: number
  y: number
  rotate: number
  label: string
}

interface OwnerMessage {
  id: string
  text: string
  time?: string
}

interface Heart {
  id: number
  left: number
  delay: number
  size: number
}

// 每次点击随机挑一处下嘴，都选狐狸够得着的右侧和中间
const BITE_SPOTS: BiteSpot[] = [
  { x: 69, y: 20, rotate: 14, label: '耳朵' },
  { x: 50, y: 16, rotate: -6, label: '头顶' },
  { x: 66, y: 57, rotate: -12, label: '脸颊' },
  { x: 65, y: 80, rotate: -18, label: '屁股' },
  { x: 84, y: 68, rotate: 26, label: '尾巴' },
  { x: 62, y: 86, rotate: 6, label: '前爪' },
]

const mode = ref<Mode>('sit')
const facing = ref<1 | -1>(1)
const pos = reactive({ x: 24, y: 0 })
const walkDuration = ref(3.6)
const hearts = ref<Heart[]>([])
const showInvite = ref(false)
const hasPetted = ref(false)
// 小狐狸来访：蹭蹭和咬人两个随机小剧场
const scene = ref<Scene>('none')
const foxVisible = ref(false)
const foxLunge = ref(false)
const foxMood = ref<'happy' | 'mischief'>('happy')
const biteSpot = ref<BiteSpot | null>(null)
// 十七的留言：有未读时小猫进入说话模式，点击后打开信箱
const messages = ref<OwnerMessage[]>([])
const ownerMessage = ref<OwnerMessage | null>(null)
const hasNews = ref(false)
const messageOpen = ref(false)
const chatListRef = ref<HTMLElement | null>(null)
const dateChipsRef = ref<HTMLElement | null>(null)
// 信箱里按天切换，只列出有留言的日期
const selectedDate = ref('')

const style = computed<Record<string, string>>(() => ({
  transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
  '--walk': `${walkDuration.value}s`,
}))

const bubbleHint = computed(() => {
  if (hasNews.value) return '有话对你说'
  if (scene.value === 'nuzzle') return '蹭蹭蹭～钻进狐狸怀里去～'
  return showInvite.value ? '摸摸我～' : ''
})

// 咬人的吐槽气泡挂在狐狸头顶，顺便报出这次咬到的部位
const biteBubble = computed(() => (biteSpot.value ? `嗷呜！咬到${biteSpot.value.label}了` : ''))

// 聊天记录按时间倒序，最新的留言排在最上面
const chatMessages = computed(() => {
  const list = [...messages.value]
  if (list.every((item) => item.time)) {
    return list.sort((a, b) => b.time!.localeCompare(a.time!))
  }
  return list.reverse()
})

// 只看时间最新的一条来判断要不要提示“有话对你说”，和数组顺序无关
const latestMessage = computed(() => chatMessages.value[0] ?? null)

// 有留言的日期，新的在前；信箱里只在这些日期之间切换
const messageDates = computed(() => {
  const days = new Set<string>()
  messages.value.forEach((item) => {
    if (item.time) days.add(item.time.slice(0, 10))
  })
  return [...days].sort((a, b) => b.localeCompare(a))
})

const selectedIndex = computed(() => messageDates.value.indexOf(selectedDate.value))
const canOlder = computed(() => selectedIndex.value >= 0 && selectedIndex.value < messageDates.value.length - 1)
const canNewer = computed(() => selectedIndex.value > 0)

// 当前选中日期的留言，当天的按时间倒序
const dateMessages = computed(() => {
  if (!selectedDate.value) return []
  return messages.value
    .filter((item) => item.time?.startsWith(selectedDate.value))
    .sort((a, b) => b.time!.localeCompare(a.time!))
})

function shiftDate(step: number) {
  const next = messageDates.value[selectedIndex.value + step]
  if (next) selectedDate.value = next
}

function dateKeyOf(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function todayKey() {
  return dateKeyOf(new Date())
}

function dateLabel(key: string) {
  if (key === todayKey()) return '今天'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (key === dateKeyOf(yesterday)) return '昨天'
  const [, month, day] = key.split('-')
  return `${Number(month)}月${Number(day)}日`
}

/** 已经按日期分组了，时间只显示时分 */
function timeLabel(message: OwnerMessage) {
  return message.time?.match(/[T ](\d{2}:\d{2})/)?.[1] ?? ''
}

/** 只有今天的留言才提醒，往日留言留在信箱里慢慢看 */
function isToday(message: OwnerMessage) {
  return typeof message.time === 'string' && message.time.startsWith(todayKey())
}

let timer: ReturnType<typeof setTimeout> | null = null
let inviteTimer: ReturnType<typeof setTimeout> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let sceneTimers: ReturnType<typeof setTimeout>[] = []
let heartId = 0

// 十七的留言存在仓库的 public/messages.json 里，页面定时拉取
const MESSAGE_URL = `${import.meta.env.BASE_URL}messages.json`
const READ_KEY = 'cat-owner-message-read'
const POLL_INTERVAL = 60_000
let readId = ''

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function bounds() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const mobile = vw <= 720
  // 待在页面左下角附近，不走到中间和右下角按钮后面
  const roamWidth = mobile ? 100 : Math.min(520, vw * 0.42)
  return {
    minX: 14,
    maxX: Math.max(14, Math.min(roamWidth, vw - (mobile ? 305 : 335))),
    minY: vh - (mobile ? 118 : 156),
    maxY: vh - (mobile ? 74 : 96),
  }
}

function clampPosition() {
  const b = bounds()
  pos.x = Math.min(Math.max(pos.x, b.minX), b.maxX)
  pos.y = Math.min(Math.max(pos.y, b.minY), b.maxY)
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

/** 小剧场的定时器统一收在一起，方便中途被留言等事件打断时全部清掉 */
function sceneLater(fn: () => void, delay: number) {
  sceneTimers.push(
    setTimeout(() => {
      fn()
    }, delay),
  )
}

function clearSceneTimers() {
  sceneTimers.forEach((id) => clearTimeout(id))
  sceneTimers = []
}

function resetScene() {
  clearSceneTimers()
  scene.value = 'none'
  foxVisible.value = false
  foxLunge.value = false
  biteSpot.value = null
}

/** 任何一次互动都算摸过它了：收起邀请、停下随机溜达 */
function prepareInteraction() {
  hasPetted.value = true
  showInvite.value = false
  if (inviteTimer) {
    clearTimeout(inviteTimer)
    inviteTimer = null
  }
  clearTimer()
  clearSceneTimers()
}

function schedule(delay = rand(7000, 15000)) {
  clearTimer()
  timer = setTimeout(next, delay)
}

function next() {
  // 有未读留言或正在看信箱时，老老实实待在原地
  if (document.hidden || hasNews.value || messageOpen.value) {
    schedule()
    return
  }
  if (Math.random() < 0.66) walk()
  else rest()
}

function walk() {
  const b = bounds()
  const targetX = rand(b.minX, b.maxX)
  const targetY = rand(b.minY, b.maxY)
  const dx = targetX - pos.x
  const distance = Math.hypot(dx, targetY - pos.y)

  if (Math.abs(dx) > 8) facing.value = dx > 0 ? 1 : -1
  walkDuration.value = Math.min(5.5, Math.max(2.6, distance / 42))
  mode.value = 'walk'
  pos.x = targetX
  pos.y = targetY

  clearTimer()
  timer = setTimeout(() => {
    mode.value = 'sit'
    schedule()
  }, walkDuration.value * 1000 + 200)
}

function rest() {
  mode.value = 'sleep'
  clearTimer()
  timer = setTimeout(() => {
    mode.value = 'sit'
    schedule()
  }, rand(12000, 26000))
}

function pet() {
  if (isBear.value) {
    playBearCall()
  } else {
    playPurr()
    playMeow(0.24)
  }
  mode.value = 'happy'
  burstHearts()

  prepareInteraction()

  timer = setTimeout(() => {
    mode.value = 'sit'
    schedule()
  }, 1800)
}

/** 小剧场一：狐狸来做客，小猫凑上去疯狂蹭蹭 */
function startNuzzle() {
  prepareInteraction()
  facing.value = 1
  scene.value = 'nuzzle'
  mode.value = 'nuzzle'
  foxMood.value = 'happy'
  foxLunge.value = false
  biteSpot.value = null
  foxVisible.value = true

  playChirp()

  sceneLater(() => burstHearts(26), 650)
  sceneLater(() => burstHearts(30), 1200)
  sceneLater(() => burstHearts(24), 1750)
  sceneLater(() => {
    playChirp()
    burstHearts(28)
  }, 2300)

  sceneLater(() => {
    foxVisible.value = false
    mode.value = 'sit'
    scene.value = 'none'
    schedule(rand(5000, 9000))
  }, 3500)
}

/** 小剧场二：狐狸突然翻脸咬一口，下嘴的位置每次都不一样 */
function startBite() {
  prepareInteraction()
  facing.value = 1
  scene.value = 'bite'
  foxMood.value = 'mischief'
  foxLunge.value = false
  biteSpot.value = null
  foxVisible.value = true

  // 先盯一会儿，再猛扑上去
  sceneLater(() => {
    foxLunge.value = true
    playYip()
  }, 620)

  sceneLater(() => {
    biteSpot.value = BITE_SPOTS[Math.floor(Math.random() * BITE_SPOTS.length)]
    mode.value = 'bite'
    playYowl()
  }, 880)

  sceneLater(() => {
    foxLunge.value = false
  }, 1500)

  sceneLater(() => {
    foxVisible.value = false
    biteSpot.value = null
    mode.value = 'sit'
    scene.value = 'none'
    schedule(rand(5000, 9000))
  }, 2400)
}

function scheduleInvite(delay = 4000) {
  if (hasPetted.value || hasNews.value) return
  if (inviteTimer) clearTimeout(inviteTimer)
  inviteTimer = setTimeout(() => {
    if (hasPetted.value || hasNews.value) return
    showInvite.value = true
    inviteTimer = setTimeout(() => {
      showInvite.value = false
      if (!hasPetted.value && !hasNews.value) scheduleInvite(30000)
    }, 12000)
  }, delay)
}

function onCatClick() {
  // 有未读留言时，打开信箱
  if (hasNews.value && ownerMessage.value) {
    openMessageDialog()
    return
  }
  // 小剧场播放中不打断
  if (scene.value !== 'none') return
  // 小熊日还是原来的摸摸
  if (isBear.value) {
    pet()
    return
  }
  // 三种互动等概率：摸一摸 / 蹭蹭狐狸 / 被狐狸咬
  const roll = Math.floor(Math.random() * 3)
  if (roll === 0) pet()
  else if (roll === 1) startNuzzle()
  else startBite()
}

function markMessageRead(message: OwnerMessage) {
  readId = message.id
  try {
    localStorage.setItem(READ_KEY, message.id)
  } catch {
    /* 隐私模式下忽略 */
  }
}

async function scrollChatToTop() {
  await nextTick()
  const el = chatListRef.value
  if (el) el.scrollTop = 0
}

function openMessageDialog() {
  const message = latestMessage.value
  if (!message) return

  resetScene()
  ownerMessage.value = message
  // 默认停在最新留言那天，再左右切换去看往日的
  selectedDate.value = message.time?.slice(0, 10) || messageDates.value[0] || ''
  hasNews.value = false
  messageOpen.value = true
  showInvite.value = false
  mode.value = 'speak'
  clearTimer()
  if (inviteTimer) {
    clearTimeout(inviteTimer)
    inviteTimer = null
  }
  markMessageRead(message)
  playReveal()
}

async function scrollActiveDateIntoView() {
  await nextTick()
  const el = dateChipsRef.value
  const chip = el?.querySelector<HTMLElement>('.mail-date-chip.active')
  if (!el || !chip) return
  const box = el.getBoundingClientRect()
  const rect = chip.getBoundingClientRect()
  el.scrollLeft += rect.left - box.left - box.width / 2 + rect.width / 2
}

watch(messageOpen, (open) => {
  if (open) {
    void scrollChatToTop()
    void scrollActiveDateIntoView()
    return
  }
  // 关掉信箱后小猫恢复走动
  if (mode.value === 'speak') {
    mode.value = 'sit'
    schedule()
  }
})

async function loadOwnerMessage() {
  try {
    const res = await fetch(`${MESSAGE_URL}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as { messages?: OwnerMessage[] }
    const list = Array.isArray(data?.messages) ? data.messages : []
    const valid = list.filter(
      (item) => item?.id && typeof item.text === 'string' && item.text.trim(),
    )
    messages.value = valid
    const latest = latestMessage.value
    if (!latest) {
      ownerMessage.value = null
      hasNews.value = false
      if (mode.value === 'speak' && !messageOpen.value) {
        mode.value = 'sit'
        schedule()
      }
      return
    }

    ownerMessage.value = latest

    // 只有“今天的 + 还没看过的”留言才提醒；往日留言收在信箱里回看
    if (latest.id !== readId && isToday(latest)) {
      // 正在看信箱时来了新留言，直接续在聊天记录里
      if (messageOpen.value) {
        selectedDate.value = latest.time?.slice(0, 10) || selectedDate.value
        markMessageRead(latest)
        void scrollChatToTop()
        void scrollActiveDateIntoView()
        return
      }

      hasNews.value = true
      showInvite.value = false
      if (inviteTimer) {
        clearTimeout(inviteTimer)
        inviteTimer = null
      }
      resetScene()
      mode.value = 'speak'
      clearTimer()
      return
    }

    hasNews.value = false
    if (mode.value === 'speak' && !messageOpen.value) {
      mode.value = 'sit'
      schedule()
    }
  } catch {
    /* 网络抖动时静默失败，等下一次轮询 */
  }
}

function onVisibilityChange() {
  if (!document.hidden) void loadOwnerMessage()
}

function burstHearts(offset = 0) {
  const batch: Heart[] = Array.from({ length: 3 }, () => ({
    id: ++heartId,
    left: rand(-16, 28) + offset,
    delay: rand(0, 0.25),
    size: rand(12, 18),
  }))
  hearts.value.push(...batch)
  const ids = new Set(batch.map((heart) => heart.id))
  setTimeout(() => {
    hearts.value = hearts.value.filter((heart) => !ids.has(heart.id))
  }, 1400)
}

function onResize() {
  clampPosition()
}

function preloadCommonSounds() {
  if (!isBear.value) preloadSoundEffects('meow', 'purr')
  else preloadSoundEffects('bear')
}

onMounted(() => {
  const b = bounds()
  pos.x = b.minX + 12
  pos.y = b.maxY

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) schedule(6000)

  // 主动招呼人来摸摸它；没被摸的话每隔一段时间再提醒一次
  scheduleInvite(4000)

  try {
    readId = localStorage.getItem(READ_KEY) || ''
  } catch {
    /* 隐私模式下忽略 */
  }
  void loadOwnerMessage()
  pollTimer = setInterval(() => {
    if (!document.hidden) void loadOwnerMessage()
  }, POLL_INTERVAL)
  document.addEventListener('visibilitychange', onVisibilityChange)

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  clearTimer()
  clearSceneTimers()
  if (inviteTimer) clearTimeout(inviteTimer)
  if (pollTimer) clearInterval(pollTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.inbox-cover{text-align:center;padding:4px 0 20px}.inbox-cover>span{font-size:8px;letter-spacing:.14em;color:#a2b4c0}.inbox-cover p{font-size:14px!important;color:#7894a8!important;margin:12px 0 0}.inbox-navigation{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-top:1px solid #e0e8ed;border-bottom:1px solid #e0e8ed}.inbox-navigation>button{width:32px;height:36px;background:#eef4f7;border:0;border-radius:5px;color:#87a4b7;display:grid;place-items:center}.inbox-navigation>button:disabled{opacity:.35}.inbox-navigation label{display:flex;flex-direction:column;align-items:center;gap:5px}.inbox-navigation label>span{font-size:8px;color:#a5b5c0}.inbox-navigation select{border:0;background:none;color:#7898af;font:11px inherit;max-width:200px;min-height:24px}.inbox-letters{max-height:48svh;overflow:auto;overscroll-behavior:contain}.inbox-letter{padding:20px 0;border-bottom:1px solid #e6edf1}.inbox-letter>div{display:flex;align-items:center;gap:10px;font-size:10px;color:#8fa6b6}.inbox-letter time{font-size:9px;color:#adbcc6}.letter-index{margin-left:auto;color:#b9c7d0;font-size:8px}.inbox-letter p{font-size:13px!important;line-height:2!important;color:#6d899d!important;white-space:pre-wrap;overflow-wrap:anywhere;margin:11px 0 0}.inbox-empty{text-align:center;padding:30px 10px;font-size:12px}.inbox-end{display:block;text-align:center;padding:20px 0 2px;color:#adbcc5;font-size:9px}

.companion {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 24;
  width: 78px;
  height: 82px;
  pointer-events: none;
  transition: transform var(--walk, 3.6s) linear;
  will-change: transform;
}

.companion-btn {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
}

.companion-btn:focus-visible {
  outline: 2px solid #19c8b9;
  outline-offset: 4px;
  border-radius: 50%;
}

.companion-cat {
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: none;
}

/* 来做客的小狐狸：平时待在猫咪右后方，扑咬时压到最上层 */
.companion-fox {
  position: absolute;
  left: 56px;
  bottom: 0;
  z-index: -1;
  width: 64px;
  height: 78px;
  overflow: visible;
  pointer-events: none;
  transform-origin: 50% 92%;
  filter: none;
}

.companion-fox.lunge {
  z-index: 2;
  animation: companionFoxLunge 0.95s ease-in-out both;
}

:deep(.companion-fox-tail) {
  transform-box: fill-box;
  transform-origin: 0% 55%;
  animation: companionFoxTail 2.4s ease-in-out infinite;
}

.companion-fox.mischief :deep(.companion-fox-tail) {
  animation-duration: 0.9s;
}

.companion-fox-body {
  transform-box: fill-box;
  transform-origin: 50% 92%;
}

.companion-fox-jaw {
  transform-box: fill-box;
  transform-origin: 100% 8%;
}

.lunge .companion-fox-jaw {
  animation: companionFoxChomp 0.24s ease-in-out 3;
}

.fox-enter-active {
  animation: companionFoxIn 0.34s cubic-bezier(0.2, 0.9, 0.3, 1.35) both;
}

.fox-leave-active {
  animation: companionFoxOut 0.28s ease-in both;
}

.companion-bubble {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 4px);
  padding: 4px 9px;
  border-radius: 11px;
  border: 1px solid #D8E3EB;
  background: #FAFBF8;
  color: #829AAC;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  white-space: nowrap;
  box-shadow: none;
  cursor: pointer;
  animation: companionBubbleIn 0.32s cubic-bezier(0.2, 0.8, 0.3, 1) both;
}

.companion-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  margin-top: -5px;
  background: #FAFBF8;
  border-right: 1px solid #D8E3EB;
  border-bottom: 1px solid #D8E3EB;
  border-bottom-right-radius: 2px;
  transform: rotate(45deg);
}

.companion-bubble.news {
  color: #7293AA;
  border-color: #C6DCEB;
  box-shadow: none;
}

.companion-bubble.scene {
  color: #A48D98;
  border-color: #E2D6DC;
  box-shadow: none;
}

/* 咬人的吐槽气泡挂在狐狸头顶（狐狸中心在容器右侧约 88px 处） */
.companion-bubble.fox-bubble {
  left: 88px;
}

.mail-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.mail-dates {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mail-date-chips {
  display: flex;
  flex: 1;
  gap: 6px;
  min-width: 0;
  padding: 2px;
  overflow-x: auto;
  scrollbar-width: none;
}

.mail-date-chips::-webkit-scrollbar {
  display: none;
}

.mail-date-chip {
  flex: none;
  height: 26px;
  padding: 0 11px;
  border: 1.5px solid #e8dcc8;
  border-radius: 999px;
  background: #FAFBF8;
  color: #8f734f;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    color 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.mail-date-chip:hover {
  color: #0e7f75;
  border-color: #19c8b9;
}

.mail-date-chip.active,
.mail-date-chip.active:hover {
  color: #fff9e3;
  background: #19c8b9;
  border-color: #0ea99d;
  box-shadow: none;
}

.mail-date-nav {
  display: grid;
  flex: none;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1.5px solid #e8dcc8;
  border-radius: 50%;
  background: #FAFBF8;
  color: #8f734f;
  cursor: pointer;
  transition:
    color 0.16s ease,
    border-color 0.16s ease;
}

.mail-date-nav:hover:not(:disabled) {
  color: #0e7f75;
  border-color: #19c8b9;
}

.mail-date-nav:disabled {
  opacity: 0.35;
  cursor: default;
}

/* 小熊日：日期选中态跟着换成蜂蜜色 */
html[data-theme='bear'] .mail-date-chip:hover:not(.active) {
  color: #a9761d;
  border-color: #d99a3a;
}

html[data-theme='bear'] .mail-date-chip.active,
html[data-theme='bear'] .mail-date-chip.active:hover {
  background: #d99a3a;
  border-color: #b97c22;
  box-shadow: none;
}

html[data-theme='bear'] .mail-date-nav:hover:not(:disabled) {
  color: #a9761d;
  border-color: #d99a3a;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-height: min(320px, 46vh);
  overflow-y: auto;
  padding: 2px 2px 4px;
}

.chat-row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
}

.chat-avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-top: 17px;
  border-radius: 50%;
  border: 2px solid #C6DCEB;
  background: #e5f8f5;
}

.chat-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 82%;
}

.chat-name {
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: #2a9d8f;
}

.chat-bubble {
  margin: 0;
  padding: 9px 12px;
  border-radius: 4px 14px 14px 14px;
  border: 1px solid #D8E3EB;
  background: #FAFBF8;
  color: #829AAC;
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.6;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: none;
}

.chat-time {
  margin-top: 5px;
  padding-left: 2px;
  font-size: 10.5px;
  line-height: 1;
  color: #a99c86;
}

:deep(.companion-waves) path {
  fill: none;
  stroke: #2a9d8f;
  stroke-width: 2.4;
  stroke-linecap: round;
  opacity: 0;
}

.speak :deep(.companion-waves) path {
  animation: companionWave 1.6s ease-in-out infinite;
}

.speak :deep(.companion-waves) path:nth-of-type(2) {
  animation-delay: 0.24s;
}

.leftward .companion-cat {
  transform: scaleX(-1);
}

:deep(.companion-eye) {
  transform-box: fill-box;
  transform-origin: center;
}

.sit .companion-cat {
  animation: companionBob 3.6s ease-in-out infinite;
}

.sit :deep(.companion-eye) {
  animation: companionBlink 6.2s ease-in-out infinite;
}

.walk .companion-cat {
  animation: companionWalk 0.42s ease-in-out infinite;
}

.sleep .companion-cat {
  animation: companionBreathe 4.4s ease-in-out infinite;
}

.sleep :deep(.companion-eye) {
  transform: scaleY(0.12);
}

.happy .companion-cat {
  animation: companionHop 0.5s ease-in-out 2;
}

.speak .companion-cat {
  animation: companionSpeak 2s ease-in-out infinite;
}

.speak :deep(.companion-tail) {
  animation: companionTail 1.5s ease-in-out infinite;
}

.nuzzle .companion-cat {
  animation: companionCatNuzzle 1.6s ease-in-out infinite;
}

.nuzzle :deep(.companion-tail) {
  animation: companionTail 0.9s ease-in-out infinite;
}

.nuzzle :deep(.companion-eye) {
  transform: scaleY(0.16);
}

.nuzzle .companion-fox-body {
  animation: companionFoxRub 1.6s ease-in-out infinite;
}

.bite .companion-cat {
  animation: companionCatBite 0.85s ease-out both;
}

.bite :deep(.companion-eye) {
  animation: companionStartle 0.85s ease-out both;
}

.companion-bite-mark {
  transform-box: fill-box;
  transform-origin: center;
  animation: companionBiteMark 1.3s ease-out both;
}

.companion.invite .companion-cat {
  animation: companionInvite 2.2s ease-in-out infinite;
}

:deep(.companion-tail),
:deep(.companion-scarf) {
  transform-box: fill-box;
  transform-origin: 0% 50%;
}

.sit :deep(.companion-tail),
.happy :deep(.companion-tail) {
  animation: companionTail 3.2s ease-in-out infinite;
}

.companion-zzz {
  position: absolute;
  top: -2px;
  right: 4px;
  font-size: 13px;
  font-weight: 800;
  color: #a97c4f;
  animation: companionZzz 3.2s ease-in-out infinite;
}

.companion-heart {
  position: absolute;
  top: 8px;
  font-size: var(--size, 14px);
  line-height: 1;
  color: #ff8fb1;
  pointer-events: none;
  animation: companionHeart 1.15s var(--delay, 0s) ease-out forwards;
}

@keyframes companionBob {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-3px) rotate(1deg);
  }
}

@keyframes companionWalk {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-5px) rotate(2deg);
  }
}

@keyframes companionBreathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03, 0.98);
  }
}

@keyframes companionHop {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  70% {
    transform: translateY(0);
  }
}

@keyframes companionInvite {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  25% {
    transform: translateY(-3px) rotate(-3deg);
  }
  65% {
    transform: translateY(-3px) rotate(3deg);
  }
}

@keyframes companionSpeak {
  0%,
  100% {
    transform: translateY(0) rotate(-1.5deg);
  }
  50% {
    transform: translateY(-3px) rotate(1.5deg);
  }
}

@keyframes companionWave {
  0%,
  100% {
    opacity: 0;
  }
  20% {
    opacity: 0.9;
  }
  60% {
    opacity: 0;
  }
}

@keyframes companionBubbleIn {
  from {
    opacity: 0;
    transform: translate(-50%, 4px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

@keyframes companionBlink {
  0%,
  91%,
  100% {
    transform: scaleY(1);
  }
  94% {
    transform: scaleY(0.12);
  }
}

@keyframes companionTail {
  0%,
  100% {
    transform: rotate(-8deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

@keyframes companionZzz {
  0% {
    opacity: 0;
    transform: translate(0, 2px);
  }
  30% {
    opacity: 0.85;
  }
  100% {
    opacity: 0;
    transform: translate(6px, -12px);
  }
}

@keyframes companionHeart {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.6);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-38px) scale(1.1);
  }
}

@keyframes companionCatNuzzle {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  15% {
    transform: translate(11px, -2px) rotate(9deg);
  }
  30% {
    transform: translate(4px, 0) rotate(-4deg);
  }
  45% {
    transform: translate(13px, -2px) rotate(11deg);
  }
  60% {
    transform: translate(5px, 0) rotate(-3deg);
  }
  75% {
    transform: translate(11px, -1px) rotate(8deg);
  }
}

@keyframes companionFoxRub {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  20% {
    transform: translate(-3px, 0) rotate(-3deg);
  }
  50% {
    transform: translate(2px, -1px) rotate(2deg);
  }
  80% {
    transform: translate(-2px, 0) rotate(-2deg);
  }
}

@keyframes companionFoxIn {
  0% {
    opacity: 0;
    transform: translateX(22px) scale(0.55);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes companionFoxOut {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(20px) scale(0.7);
  }
}

@keyframes companionFoxLunge {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  24% {
    transform: translate(-26px, -10px) rotate(-10deg);
  }
  36% {
    transform: translate(-21px, -4px) rotate(-3deg);
  }
  48% {
    transform: translate(-25px, -8px) rotate(-8deg);
  }
  60% {
    transform: translate(-20px, -3px) rotate(-2deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

@keyframes companionFoxChomp {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-12deg) scaleY(1.08);
  }
}

@keyframes companionFoxTail {
  0%,
  100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

@keyframes companionCatBite {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  12% {
    transform: translate(-4px, -12px) rotate(-12deg);
  }
  28% {
    transform: translate(3px, -5px) rotate(9deg);
  }
  44% {
    transform: translate(-3px, -9px) rotate(-7deg);
  }
  62% {
    transform: translate(2px, -2px) rotate(4deg);
  }
  80% {
    transform: translate(-1px, 0) rotate(-2deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

@keyframes companionStartle {
  0%,
  100% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.55, 1.45);
  }
  65% {
    transform: scale(1.2, 1.15);
  }
}

@keyframes companionBiteMark {
  0% {
    opacity: 0;
    transform: scale(0.2) rotate(-12deg);
  }
  18% {
    opacity: 1;
    transform: scale(1.12) rotate(0deg);
  }
  30% {
    transform: scale(1);
  }
  72% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(0.94);
  }
}

@media (max-width: 720px) {
  .companion {
    width: 56px;
    height: 60px;
  }

  .companion-fox {
    left: 40px;
    width: 47px;
    height: 58px;
  }

  .companion-bubble.fox-bubble {
    left: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .companion {
    transition: none;
  }

  .companion-cat,
  .companion.invite .companion-cat,
  .speak .companion-cat,
  .nuzzle .companion-cat,
  .bite .companion-cat,
  .bite :deep(.companion-eye),
  .nuzzle :deep(.companion-tail),
  :deep(.companion-tail),
  :deep(.companion-eye),
  .companion-zzz,
  .companion-heart,
  .companion-bubble,
  :deep(.companion-waves) path,
  .companion-fox,
  .companion-fox.lunge,
  :deep(.companion-fox-tail),
  .companion-fox-body,
  .nuzzle .companion-fox-body,
  .companion-fox-jaw,
  .lunge .companion-fox-jaw,
  .companion-bite-mark {
    animation: none;
  }

  .speak :deep(.companion-waves) path {
    opacity: 0.7;
  }
}
</style>
