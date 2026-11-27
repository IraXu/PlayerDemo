<template>
  <div ref="rootRef" class="companion" :class="[mode, `scene-${scene}`, `phase-${scenePhase}`, { leftward: facing < 0, invite: showInvite }]" :style="style">
    <button class="companion-btn" type="button" :aria-label="copy.companionAria" title="长按查看留言" @pointerenter="preloadCommonSounds" @pointerdown="onCatPointerDown" @pointermove="onCatPointerMove" @pointerup="onCatPointerUp" @pointerleave="cancelLongPress" @pointercancel="cancelLongPress" @contextmenu.prevent @click="onCatClick">
      <span
        v-if="bubbleHint"
        ref="bubbleRef"
        class="companion-bubble"
        :class="{ news: hasNews, scene: scene !== 'none' }"
        :style="bubbleStyle"
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

    <span v-if="grapesVisible" class="companion-grapes" aria-hidden="true">
      <svg v-for="i in 5" :key="i" class="grape-drop" viewBox="0 0 32 40"
        :style="{ '--i': i, '--drift': `${(i - 3) * 19}px`, '--spin': `${(i - 3) * 17}deg` }">
        <path d="M16 10Q14 3 21 2" fill="none" stroke="#82986D" stroke-width="2"/>
        <path d="M17 7Q25 1 27 8 22 12 17 7" fill="#A3B586"/>
        <g fill="#A68DBA" stroke="#816E98" stroke-width="1">
          <circle cx="11" cy="15" r="5"/><circle cx="21" cy="15" r="5"/>
          <circle cx="8" cy="23" r="5"/><circle cx="17" cy="23" r="5"/><circle cx="25" cy="23" r="5"/>
          <circle cx="12" cy="30" r="5"/><circle cx="21" cy="30" r="5"/><circle cx="16" cy="36" r="3.5"/>
        </g>
        <path d="M9 13l2-1M15 21l2-1" stroke="#E9DDF2" stroke-width="2" stroke-linecap="round"/>
      </svg>
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
      <div class="inbox-cover"><span>LETTERS FROM JIAOJIAO</span><p>有些话，猫猫替我带给你。</p></div>
      <div class="inbox-datebar">
        <button class="inbox-date-trigger" :class="{ open: calendarOpen }" type="button" :aria-expanded="calendarOpen" @click="toggleCalendar">
          <span class="inbox-date-text">{{ selectedDateLabel }}</span>
          <span class="inbox-date-count">{{ dayMessages.length }} 封</span>
          <ChevronDownIcon :size="12" class="inbox-date-caret"/>
        </button>
      </div>
      <div v-if="calendarOpen" class="inbox-calendar">
        <div class="inbox-calendar-head">
          <button class="inbox-calendar-nav" type="button" :disabled="!canOlderMonth" aria-label="上个月" @click="shiftMonth(1)"><ChevronLeftIcon :size="14"/></button>
          <strong>{{ monthLabel(selectedMonth) }}</strong>
          <button class="inbox-calendar-nav" type="button" :disabled="!canNewerMonth" aria-label="下个月" @click="shiftMonth(-1)"><ChevronRightIcon :size="14"/></button>
        </div>
        <div class="inbox-calendar-week" aria-hidden="true"><span v-for="w in weekdays" :key="w">{{ w }}</span></div>
        <div class="inbox-calendar-grid">
          <template v-for="cell in calendarCells" :key="cell.key">
            <span v-if="cell.blank" class="inbox-calendar-blank" aria-hidden="true"></span>
            <button
              v-else
              class="inbox-calendar-day"
              :class="{ has: cell.has, active: cell.date === selectedDate, today: cell.date === today }"
              type="button"
              :disabled="!cell.has"
              :aria-label="`${cell.date}${cell.has ? ' 有留言' : ''}`"
              :aria-pressed="cell.date === selectedDate"
              @click="selectDay(cell.date)"
            ><span>{{ cell.day }}</span><i v-if="cell.has" class="inbox-calendar-dot" aria-hidden="true"></i></button>
          </template>
        </div>
      </div>
      <div ref="chatListRef" class="inbox-letters">
        <article v-for="(item,i) in dayMessages" :key="item.id" class="inbox-letter" :class="{ latest: item.id === latestMessage?.id }">
          <div class="inbox-letter-head"><span class="letter-name">娇娇</span><span v-if="item.id === latestMessage?.id" class="letter-latest">最新</span><time v-if="item.time">{{ timeLabel(item) }}</time><span class="letter-index">{{ String(i + 1).padStart(2, '0') }}</span></div>
          <p>{{ item.text }}</p>
          <p v-if="item.wish" class="letter-wish">{{ item.wish }}</p>
        </article>
        <p v-if="!dayMessages.length" class="inbox-empty">这一天还没有留言，点上面的日期可以翻看以前写的信。</p>
      </div>
      <span class="inbox-end">写给你的每一句，都留在这里。</span>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Modal } from '../ui'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../ui/icons'
import { preloadSoundEffects, playBearCall, playChirp, playMeow, playPurr, playReveal, playSniff, playYip, playYowl } from '../sfx'
import { reportCompanionScene } from '../catReport'
import AnimalArtwork from './AnimalArtwork.vue'
import { copy, isBear } from '../theme'

type Mode = 'sniff' | 'sit' | 'walk' | 'sleep' | 'happy' | 'speak' | 'nuzzle' | 'bite'
type Scene = 'none' | 'nuzzle' | 'bite' | 'grape'

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
  wish?: string
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
// x 是离屏幕左边的距离，lift 是离屏幕底边的距离：
// 贴底定位后，iOS 地址栏/工具栏变化不会再把它挤到屏幕外
const pos = reactive({ x: 24, lift: 14 })
const rootRef = ref<HTMLElement>()
const bubbleRef = ref<HTMLElement | null>(null)
// 气泡默认以小猫为中心，靠近屏幕边缘时整体平移回来，尾巴再指回小猫
const bubbleShift = ref(0)
const bubbleTail = ref(50)
const bubbleStyle = computed<Record<string, string>>(() => ({
  '--bubble-shift': `${bubbleShift.value}px`,
  '--bubble-tail': `${bubbleTail.value}%`,
}))
const walkDuration = ref(3.6)
const hearts = ref<Heart[]>([])
const showInvite = ref(false)
const hasPetted = ref(false)
// 小狐狸来访：蹭蹭、扑咬、葡萄味三个小剧场
const scene = ref<Scene>('none')
const scenePhase = ref<'approach' | 'contact' | 'reveal'>('approach')
const grapesVisible = ref(false)
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
// 信箱按天浏览：日期用一张带留言标记的小日历选择
const selectedDate = ref('')
const selectedMonth = ref('')
const calendarOpen = ref(false)
const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const style = computed<Record<string, string>>(() => ({
  transform: `translate3d(${pos.x}px, ${-pos.lift}px, 0)`,
  '--walk': `${walkDuration.value}s`,
}))

const bubbleHint = computed(() => {
  if (hasNews.value) return '有话对你说'
  if (scene.value === 'nuzzle') return '蹭蹭～钻进狐狸怀里去～'
  return showInvite.value ? '摸摸我～娇娇能感知到了喔～' : ''
})

/** 气泡贴近屏幕左右边缘时，整体平移到安全区内，尾巴仍然指向小猫 */
async function updateBubbleClamp() {
  await nextTick()
  const bubble = bubbleRef.value
  const root = rootRef.value
  if (!bubble || !root) return
  const width = bubble.offsetWidth
  if (!width) return

  const cat = root.getBoundingClientRect()
  const center = cat.left + cat.width / 2
  // 留 10px 余量，避免取整后仍压到屏幕边缘
  const margin = 10
  const desired = Math.min(
    Math.max(center, margin + width / 2),
    window.innerWidth - margin - width / 2,
  )
  bubbleShift.value = desired - center
  const tail = ((center - (desired - width / 2)) / width) * 100
  bubbleTail.value = Math.round(Math.min(92, Math.max(8, tail)))
}

let bubbleClampTimer: ReturnType<typeof setTimeout> | null = null

/** 气泡刚出现时可能还在走动收尾，缓一下再量一次最终位置 */
function refreshBubbleClamp() {
  void updateBubbleClamp()
  if (bubbleClampTimer) clearTimeout(bubbleClampTimer)
  bubbleClampTimer = setTimeout(() => {
    bubbleClampTimer = null
    if (bubbleHint.value) void updateBubbleClamp()
  }, 350)
}

watch(bubbleHint, (text) => {
  if (text) {
    refreshBubbleClamp()
    return
  }
  bubbleShift.value = 0
  bubbleTail.value = 50
})

// 咬人的吐槽气泡挂在狐狸头顶，顺便报出这次咬到的部位
const biteBubble = computed(() => scene.value === 'grape' && scenePhase.value === 'reveal' ? '是葡萄味哎' : (biteSpot.value ? `嗷呜！咬到${biteSpot.value.label}了` : ''))

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

// 有留言的日期 / 月份
const messageDates = computed(() => {
  const days = new Set<string>()
  messages.value.forEach((item) => {
    if (item.time) days.add(item.time.slice(0, 10))
  })
  return [...days].sort((a, b) => b.localeCompare(a))
})

const messageDateSet = computed(() => new Set(messageDates.value))

const messageMonths = computed(() => {
  const months = new Set<string>()
  messages.value.forEach((item) => {
    if (item.time) months.add(item.time.slice(0, 7))
  })
  return [...months].sort((a, b) => b.localeCompare(a))
})

const monthIndex = computed(() => messageMonths.value.indexOf(selectedMonth.value))
// 当前月份可能还没有留言（比如月初），这时也要能翻到最近的有留言月份
const canOlderMonth = computed(() =>
  monthIndex.value >= 0
    ? monthIndex.value < messageMonths.value.length - 1
    : messageMonths.value.some((month) => month < selectedMonth.value),
)
const canNewerMonth = computed(() =>
  monthIndex.value >= 0
    ? monthIndex.value > 0
    : messageMonths.value.some((month) => month > selectedMonth.value),
)

// 选中日期的留言，按时间倒序
const dayMessages = computed(() => {
  if (!selectedDate.value) return []
  return messages.value
    .filter((item) => item.time?.startsWith(selectedDate.value))
    .sort((a, b) => b.time!.localeCompare(a.time!))
})

const today = computed(() => todayKey())

// 日期按钮上显示的文字
const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return ''
  const [year, month, day] = selectedDate.value.split('-').map(Number)
  if (selectedDate.value === today.value) return `今天 · ${month}月${day}日`
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(year, month - 1, day).getDay()]
  const yearPrefix = year === new Date().getFullYear() ? '' : `${year}年`
  return `${yearPrefix}${month}月${day}日 ${weekday}`
})

// 日历格子：有留言的日子亮起并带一个圆点
const calendarCells = computed(() => {
  if (!selectedMonth.value) return []
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const total = new Date(year, month, 0).getDate()
  const cells: { key: string; day: number; date: string; has: boolean; blank: boolean }[] = []
  for (let i = 0; i < offset; i++) cells.push({ key: `blank-${i}`, day: 0, date: '', has: false, blank: true })
  for (let d = 1; d <= total; d++) {
    const date = `${selectedMonth.value}-${String(d).padStart(2, '0')}`
    cells.push({ key: date, day: d, date, has: messageDateSet.value.has(date), blank: false })
  }
  return cells
})

function shiftMonth(step: number) {
  if (!messageMonths.value.length) return
  const index = monthIndex.value
  if (index >= 0) {
    const next = messageMonths.value[index + step]
    if (next) selectedMonth.value = next
    return
  }
  // 当前月还没有留言：往前翻就直接跳到最近一个有留言的月份
  if (step > 0) {
    const older = messageMonths.value.find((month) => month < selectedMonth.value)
    if (older) selectedMonth.value = older
  }
}

function toggleCalendar() {
  calendarOpen.value = !calendarOpen.value
  if (calendarOpen.value) {
    selectedMonth.value = selectedDate.value.slice(0, 7) || messageMonths.value[0] || ''
  }
}

function selectDay(date: string) {
  if (!date) return
  selectedDate.value = date
  calendarOpen.value = false
}

function dateKeyOf(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function todayKey() {
  return dateKeyOf(new Date())
}

function monthLabel(month: string) {
  const [year, m] = month.split('-')
  return `${year}年${Number(m)}月`
}

/** 已经按天筛选了，时间只显示时分 */
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
let stopSniff: (() => void) | null = null
let sceneTimers: ReturnType<typeof setTimeout>[] = []
let heartId = 0

// 十七的留言存在仓库的 public/messages.json 里，页面定时拉取
const MESSAGE_URL = `${import.meta.env.BASE_URL}messages.json`
const READ_KEY = 'cat-owner-message-read'
const POLL_INTERVAL = 60_000
let readId = ''

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function catSize() {
  const el = rootRef.value
  if (el?.offsetWidth && el?.offsetHeight) return { w: el.offsetWidth, h: el.offsetHeight }
  return window.innerWidth <= 720 ? { w: 56, h: 60 } : { w: 78, h: 82 }
}

function bounds() {
  const vw = window.innerWidth
  const { w } = catSize()
  const mobile = vw <= 720
  // 待在页面左下角附近，不走到中间和右下角按钮后面
  const roamWidth = mobile ? 100 : Math.min(520, vw * 0.42)
  return {
    minX: 14,
    // 用真实宽度兜底，窄屏上也不会只露出一半
    maxX: Math.max(14, Math.min(roamWidth, vw - w - 14)),
    // 离底边的高度：最低贴着页面底部，最高也不超过原来那一段范围
    minLift: 14,
    maxLift: mobile ? 58 : 74,
  }
}

function clampPosition() {
  const b = bounds()
  pos.x = Math.min(Math.max(pos.x, b.minX), b.maxX)
  pos.lift = Math.min(Math.max(pos.lift, b.minLift), b.maxLift)
}

let clampFrame = 0
let clampLaterTimer: ReturnType<typeof setTimeout> | null = null
let healTimer: ReturnType<typeof setInterval> | null = null

/** 视口变化集中到一帧里处理，避免 resize 期间反复改位置 */
function scheduleClamp() {
  if (clampFrame) return
  clampFrame = requestAnimationFrame(() => {
    clampFrame = 0
    clampPosition()
    rescueIfOffscreen()
    if (bubbleHint.value) void updateBubbleClamp()
  })
}

/** iOS 旋转后尺寸会晚一点才更新，等变化停下来再校正一次 */
function scheduleClampLater() {
  scheduleClamp()
  if (clampLaterTimer) clearTimeout(clampLaterTimer)
  clampLaterTimer = setTimeout(() => {
    clampLaterTimer = null
    scheduleClamp()
  }, 300)
}

/**
 * iOS 偶尔会把 fixed 元素留在旧视口的位置上（地址栏收起、旋转、从后台回来时），
 * 渲染出来的位置和记下的坐标对不上。发现大半只猫在屏幕外就把它叫回左下角。
 */
function rescueIfOffscreen() {
  const el = rootRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const visibleW = Math.max(0, Math.min(rect.right, vw) - Math.max(rect.left, 0))
  const visibleH = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0))
  if (visibleW * visibleH >= rect.width * rect.height * 0.5) return

  const b = bounds()
  walkDuration.value = 0.3
  pos.x = b.minX + 10
  pos.lift = b.minLift
  if (mode.value === 'walk') mode.value = 'sit'
}

/** 打断走动时把猫停在当前看到的位置，避免气泡跟着它滑出屏幕 */
function settleWalk() {
  if (mode.value !== 'walk') return
  const el = rootRef.value
  if (el) {
    const rect = el.getBoundingClientRect()
    const b = bounds()
    const anchorBottom = parseFloat(getComputedStyle(el).bottom) || 0
    walkDuration.value = 0.2
    pos.x = Math.min(Math.max(rect.left, b.minX), b.maxX)
    pos.lift = Math.min(
      Math.max(window.innerHeight - rect.bottom - anchorBottom, b.minLift),
      b.maxLift,
    )
  }
  mode.value = 'sit'
  clearTimer()
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
  stopSniff?.()
  stopSniff = null
  sceneTimers.forEach((id) => clearTimeout(id))
  sceneTimers = []
}

function resetScene() {
  clearSceneTimers()
  scene.value = 'none'
  scenePhase.value = 'approach'
  grapesVisible.value = false
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
  settleWalk()
  clearTimer()
  clearSceneTimers()
}

function schedule(delay = rand(7000, 15000)) {
  clearTimer()
  timer = setTimeout(next, delay)
}

function next() {
  // 有未读留言、正在看信箱或正冒着气泡时，老老实实待在原地
  if (document.hidden || hasNews.value || messageOpen.value || showInvite.value) {
    schedule()
    return
  }
  if (Math.random() < 0.66) walk()
  else rest()
}

function walk() {
  const b = bounds()
  const targetX = rand(b.minX, b.maxX)
  const targetLift = rand(b.minLift, b.maxLift)
  const dx = targetX - pos.x
  const distance = Math.hypot(dx, targetLift - pos.lift)

  if (Math.abs(dx) > 8) facing.value = dx > 0 ? 1 : -1
  walkDuration.value = Math.min(5.5, Math.max(2.6, distance / 42))
  mode.value = 'walk'
  pos.x = targetX
  pos.lift = targetLift

  clearTimer()
  timer = setTimeout(() => {
    mode.value = 'sit'
    // 走动结束后气泡可能已经贴边，重新摆一次
    if (bubbleHint.value) void updateBubbleClamp()
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

  prepareInteraction()
  mode.value = 'happy'
  burstHearts()

  timer = setTimeout(() => {
    mode.value = 'sit'
    schedule()
  }, 1800)
}

/** 小剧场一：狐狸来做客，小猫凑上去疯狂蹭蹭 */
function startNuzzle() {
  prepareInteraction()
  facing.value = 1
  scenePhase.value = 'approach'
  scene.value = 'nuzzle'
  mode.value = 'nuzzle'
  foxMood.value = 'happy'
  foxLunge.value = false
  biteSpot.value = null
  foxVisible.value = true

  playChirp()

  sceneLater(() => { scenePhase.value = 'contact'; burstHearts(26) }, 650)
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
  scenePhase.value = 'approach'
  scene.value = 'bite'
  foxMood.value = 'mischief'
  foxLunge.value = false
  biteSpot.value = null
  foxVisible.value = true

  // 先盯一会儿，再猛扑上去
  sceneLater(() => {
    scenePhase.value = 'contact'
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

/** 靠近、嗅闻、发现香味，再让葡萄落地。所有阶段可统一取消。 */
function startGrape() {
  prepareInteraction()
  facing.value = 1
  stopSniff = playSniff(0.7)
  scene.value = 'grape'
  scenePhase.value = 'approach'
  mode.value = 'sniff'
  foxMood.value = 'happy'
  foxVisible.value = true
  sceneLater(() => { scenePhase.value = 'contact' }, 700)
  sceneLater(() => {
    scenePhase.value = 'reveal'
    playChirp()
  }, 2400)
  sceneLater(() => { grapesVisible.value = true }, 2900)
  sceneLater(() => {
    resetScene()
    mode.value = 'sit'
    schedule(rand(5000, 9000))
  }, 6500)
}

function scheduleInvite(delay = 4000) {
  if (hasPetted.value || hasNews.value) return
  if (inviteTimer) clearTimeout(inviteTimer)
  inviteTimer = setTimeout(() => {
    if (hasPetted.value || hasNews.value) return
    // 走动途中先不冒气泡，等站定了再提示，免得气泡跟着猫滑出屏幕
    if (mode.value === 'walk') {
      scheduleInvite(1200)
      return
    }
    showInvite.value = true
    inviteTimer = setTimeout(() => {
      showInvite.value = false
      if (!hasPetted.value && !hasNews.value) scheduleInvite(30000)
    }, 12000)
  }, delay)
}

// 长按小猫查看留言：没有新留言时也能回看信箱
const LONG_PRESS_MS = 500
let pressTimer: ReturnType<typeof setTimeout> | null = null
let pressStart = { x: 0, y: 0 }
let longPressReady = false
let suppressClick = false

function cancelLongPress() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
  longPressReady = false
}

function onCatPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  cancelLongPress()
  suppressClick = false
  pressStart = { x: event.clientX, y: event.clientY }
  pressTimer = setTimeout(() => {
    pressTimer = null
    if (!messages.value.length) return
    longPressReady = true
  }, LONG_PRESS_MS)
}

function onCatPointerMove(event: PointerEvent) {
  if (!pressTimer) return
  if (Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > 12) cancelLongPress()
}

function onCatPointerUp() {
  const shouldOpen = longPressReady
  cancelLongPress()
  if (!shouldOpen) return
  // 等这一轮 pointerup/click 结束再开弹窗，避免点击穿透到遮罩把信箱关掉
  suppressClick = true
  setTimeout(() => {
    suppressClick = false
    reportInteraction('长按打开信箱')
    openMessageDialog()
  }, 0)
}

/** 把这次互动记到企微：谁、什么设备、触发了哪个小场景 */
function reportInteraction(label: string) {
  reportCompanionScene(label, isBear.value ? '小熊' : '小猫')
}

function onCatClick() {
  // 长按触发时不执行摸摸/小剧场
  if (suppressClick || longPressReady) return
  // 有未读留言时，打开信箱
  if (hasNews.value && ownerMessage.value) {
    reportInteraction('打开未读留言')
    openMessageDialog()
    return
  }
  // 小剧场播放中不打断
  if (scene.value !== 'none') return
  // 小熊日还是原来的摸摸
  if (isBear.value) {
    reportInteraction('摸摸')
    pet()
    return
  }
  // 四种互动等概率：摸摸、蹭蹭、扑咬、嗅出葡萄味
  const roll = Math.floor(Math.random() * 4)
  if (roll === 0) {
    reportInteraction('摸摸')
    pet()
  } else if (roll === 1) {
    reportInteraction('狐狸蹭蹭小剧场')
    startNuzzle()
  } else if (roll === 2) {
    reportInteraction('狐狸扑咬小剧场')
    startBite()
  } else {
    reportInteraction('葡萄味小剧场')
    startGrape()
  }
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

  settleWalk()
  resetScene()
  ownerMessage.value = message
  // 打开就先停在今天，往日的留言再用日历回看
  selectedDate.value = todayKey()
  selectedMonth.value = selectedDate.value.slice(0, 7)
  calendarOpen.value = false
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

watch(selectedDate, () => {
  void scrollChatToTop()
})

watch(messageOpen, (open) => {
  if (open) {
    void scrollChatToTop()
    return
  }
  calendarOpen.value = false
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
        selectedMonth.value = selectedDate.value.slice(0, 7) || selectedMonth.value
        markMessageRead(latest)
        void scrollChatToTop()
        return
      }

      hasNews.value = true
      showInvite.value = false
      if (inviteTimer) {
        clearTimeout(inviteTimer)
        inviteTimer = null
      }
      settleWalk()
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
  if (document.hidden) return
  void loadOwnerMessage()
  // 从后台回来时视口可能已经变了，顺手把位置校正一次
  scheduleClampLater()
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

function preloadCommonSounds() {
  if (!isBear.value) preloadSoundEffects('meow', 'purr')
  else preloadSoundEffects('bear')
}

onMounted(() => {
  const b = bounds()
  pos.x = b.minX + 12
  pos.lift = b.minLift

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

  window.addEventListener('resize', scheduleClampLater)
  window.addEventListener('orientationchange', scheduleClampLater)
  window.addEventListener('scroll', scheduleClamp, { passive: true })
  window.addEventListener('pageshow', scheduleClampLater)
  window.visualViewport?.addEventListener('resize', scheduleClampLater)
  window.visualViewport?.addEventListener('scroll', scheduleClamp)

  // iOS 的地址栏变化不一定会触发 resize，隔几秒自检一次兜底
  healTimer = setInterval(() => {
    if (document.hidden) return
    clampPosition()
    rescueIfOffscreen()
  }, 4000)
})

onBeforeUnmount(() => {
  clearTimer()
  clearSceneTimers()
  cancelLongPress()
  if (inviteTimer) clearTimeout(inviteTimer)
  if (pollTimer) clearInterval(pollTimer)
  if (healTimer) clearInterval(healTimer)
  if (clampFrame) cancelAnimationFrame(clampFrame)
  if (clampLaterTimer) clearTimeout(clampLaterTimer)
  if (bubbleClampTimer) clearTimeout(bubbleClampTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', scheduleClampLater)
  window.removeEventListener('orientationchange', scheduleClampLater)
  window.removeEventListener('scroll', scheduleClamp)
  window.removeEventListener('pageshow', scheduleClampLater)
  window.visualViewport?.removeEventListener('resize', scheduleClampLater)
  window.visualViewport?.removeEventListener('scroll', scheduleClamp)
})
</script>

<style scoped>
.inbox-cover{text-align:center;padding:2px 0 18px}.inbox-cover>span{font-size:8px;letter-spacing:.14em;color:#a2b4c0}.inbox-cover p{font-size:14px!important;color:#7894a8!important;margin:12px 0 0}
/* 日期切换：一个日期按钮，点开是带留言圆点的小日历 */
.inbox-datebar{display:flex;justify-content:center;padding:0 1px 12px;margin:0 0 4px;border-bottom:1px solid #e6edf1}
.inbox-date-trigger{display:inline-flex;align-items:center;gap:8px;min-height:32px;padding:0 13px;border:1px solid #d9e5ec;border-radius:999px;background:#f7fafb;color:#6f8ea3;font:11px/1 inherit;letter-spacing:.02em;cursor:pointer;transition:background .16s,border-color .16s}
@media(hover:hover){.inbox-date-trigger:hover{background:#eef5f8;border-color:#bcd2df}}
.inbox-date-trigger.open{background:#eef5f8;border-color:#bcd2df}
.inbox-date-trigger:focus-visible{outline:2px solid #9fbfd5;outline-offset:2px}
.inbox-date-text{pointer-events:none}
.inbox-date-count{padding-left:9px;border-left:1px solid #dde8ee;color:#9cb0be;font-size:9px;pointer-events:none}
.inbox-date-caret{color:#93aebf;pointer-events:none;transition:transform .18s}
.inbox-date-trigger.open .inbox-date-caret{transform:rotate(180deg)}
.inbox-calendar{padding:10px 4px 6px;margin:0 0 4px;border-bottom:1px solid #e6edf1}
.inbox-calendar-head{display:flex;align-items:center;justify-content:space-between;padding:0 6px 6px}
.inbox-calendar-head strong{font-size:11px;font-weight:400;color:#6f8ea3;letter-spacing:.04em}
.inbox-calendar-nav{display:grid;place-items:center;width:26px;height:26px;padding:0;border:1px solid #e0e9ee;border-radius:50%;background:#fbfcf8;color:#8ba6b7;cursor:pointer;transition:background .16s,color .16s,border-color .16s}
@media(hover:hover){.inbox-calendar-nav:hover:not(:disabled){background:#eef5f8;border-color:#c3d7e2;color:#5f8299}}
.inbox-calendar-nav:disabled{opacity:.3;cursor:default}
.inbox-calendar-week{display:grid;grid-template-columns:repeat(7,1fr);padding:4px 0 3px}
.inbox-calendar-week span{text-align:center;font-size:8px;color:#a8b8c2}
.inbox-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.inbox-calendar-blank{height:32px}
.inbox-calendar-day{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;height:32px;padding:0;border:0;border-radius:6px;background:none;color:#b3c0c8;font:10.5px/1 inherit;cursor:default}
.inbox-calendar-day.has{color:#64859c;cursor:pointer}
@media(hover:hover){.inbox-calendar-day.has:hover{background:#eef5f8}}
.inbox-calendar-day.today{color:#4f7590;box-shadow:inset 0 0 0 1px #cddfe9}
.inbox-calendar-day.active{background:#88abc3;color:#fff;box-shadow:none}
.inbox-calendar-day.today.active{box-shadow:inset 0 0 0 1px #fff}
.inbox-calendar-day:focus-visible{outline:2px solid #9fbfd5;outline-offset:1px}
.inbox-calendar-dot{width:3px;height:3px;border-radius:50%;background:#9ab4c5}
.inbox-calendar-day.active .inbox-calendar-dot{background:#fff}
.inbox-letters{max-height:44svh;overflow:auto;overscroll-behavior:contain;padding:14px 2px 2px}
.inbox-letter{padding:17px 18px 15px;border:1px solid #e3eaef;border-radius:6px;background:#fcfcf8}
.inbox-letter+.inbox-letter{margin-top:12px}
.inbox-letter.latest{background:#f8fbfc;border-color:#d3e2ec}
.inbox-letter-head{display:flex;align-items:center;gap:9px;font-size:10px;color:#8fa6b6}
.letter-name{font-size:11px;color:#6f8ea3;letter-spacing:.04em}
.letter-latest{padding:2px 7px;border:1px solid #d6e5ee;border-radius:999px;background:#eef5f9;color:#7e9fb4;font-size:7px;line-height:1.4;letter-spacing:.14em}
.inbox-letter time{font-size:9px;color:#adbcc6}
.letter-index{margin-left:auto;color:#b9c7d0;font-size:8px}
.inbox-letter p{font-size:13px!important;line-height:2!important;color:#6d899d!important;white-space:pre-wrap;overflow-wrap:anywhere;margin:11px 0 0}
.inbox-letter .letter-wish{margin-top:13px;font-size:11px!important;line-height:1.6!important;color:#94acbb!important;text-align:right;letter-spacing:.06em}
.inbox-empty{text-align:center;padding:30px 10px;font-size:12px}
.inbox-end{display:block;text-align:center;padding:18px 0 2px;color:#adbcc5;font-size:9px}

.companion {
  position: fixed;
  /* 贴底定位：iOS 地址栏收起/展开、旋转时不会因为 innerHeight 过期被推出屏幕 */
  top: auto;
  bottom: env(safe-area-inset-bottom, 0px);
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
  -webkit-touch-callout: none;
  user-select: none;
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
  /* 靠近屏幕边缘时靠 --bubble-shift 平移回安全区 */
  transform: translateX(calc(-50% + var(--bubble-shift, 0px)));
  animation: companionBubbleIn 0.32s cubic-bezier(0.2, 0.8, 0.3, 1) both;
}

.companion-bubble::after {
  content: '';
  position: absolute;
  left: var(--bubble-tail, 50%);
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
    transform: translate(calc(-50% + var(--bubble-shift, 0px)), 4px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(calc(-50% + var(--bubble-shift, 0px)), 0) scale(1);
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

/* 头、爪、尾巴各自运动，身体以脚底为支点保持重量感。 */
:deep(.animal-head) { transform-box: view-box; transform-origin: 50px 68px; }
:deep(.animal-paws) { transform-box: view-box; transform-origin: 50px 89px; }
.sit :deep(.animal-head) { animation: animalLook 7s ease-in-out infinite; }
.walk :deep(.animal-paws) { animation: animalStep .42s ease-in-out infinite; }
.walk :deep(.animal-head) { animation: animalLook 2.5s ease-in-out infinite; }
.companion-fox-body { animation: companionBreathe 3.8s ease-in-out infinite; }
.companion-fox :deep(.companion-eye) { animation: companionBlink 5.3s ease-in-out infinite; }
.fox-enter-active { animation: foxArrive .65s ease-out both; }
.fox-enter-active :deep(.animal-paws) { animation: animalStep .18s ease-in-out 4; }
.fox-leave-active { animation: foxDepart .45s ease-in both; }
.nuzzle .companion-cat { animation: catApproach .65s ease-out both; }
.nuzzle.phase-contact .companion-cat { animation: catLean 1.4s ease-in-out infinite; }
.nuzzle :deep(.animal-head) { animation: catCheek 1.4s ease-in-out infinite; animation-delay: .65s; }
.nuzzle .companion-fox-body { animation: none; }
.nuzzle.phase-contact .companion-fox :deep(.animal-head) { animation: foxReceive 1.4s ease-in-out infinite; }
.scene-bite.phase-approach .companion-fox-body { animation: foxCrouch .62s ease-in both; }
.lunge :deep(.animal-head) { animation: foxReceive .3s ease-in-out 3; }
.sniff.phase-contact .companion-fox-body { transform: translateX(-16px); animation: none; transition: transform .55s ease; }
.sniff.phase-contact .companion-fox :deep(.animal-head) { animation: foxSniff .56s ease-in-out 3; }
.sniff .companion-cat :deep(.animal-head) { transform: rotate(8deg); transition: transform .6s ease; }
.sniff.phase-reveal .companion-cat :deep(.animal-head) { animation: grapeDelight 1s ease-in-out 2; }
.sniff.phase-reveal .companion-fox :deep(.animal-head) { transform: rotate(-6deg); }
.companion-grapes { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.grape-drop { position: absolute; left: 62px; bottom: 3px; width: 23px; height: 29px; overflow: visible;
  opacity: 0; animation: grapeFall 2.7s linear both; animation-delay: calc(var(--i) * .14s); }
@keyframes animalLook { 0%, 30%, 100% { transform: rotate(0); } 42%, 58% { transform: rotate(-4deg) translateY(1px); } 75% { transform: rotate(3deg); } }
@keyframes animalStep { 0%, 100% { transform: rotate(-5deg) translateY(-1px); } 50% { transform: rotate(5deg) translateY(1px); } }
@keyframes foxArrive { 0% { opacity: 0; transform: translateX(36px); } 25% { opacity: 1; transform: translate(25px,-2px) rotate(-3deg); } 50% { transform: translate(14px,0) rotate(2deg); } 75% { transform: translate(5px,-2px); } 100% { transform: translate(0,0); } }
@keyframes foxDepart { to { opacity: 0; transform: translate(32px,-2px); } }
@keyframes catApproach { 0% { transform: translateX(0); } 45% { transform: translate(7px,-2px) rotate(2deg); } 100% { transform: translate(15px,0) rotate(4deg); } }
@keyframes catLean { 0%, 100% { transform: translate(15px,0) rotate(4deg); } 45% { transform: translate(18px,1px) rotate(6deg) scaleY(.98); } 70% { transform: translate(16px,0) rotate(3deg); } }
@keyframes catCheek { 0%, 100% { transform: rotate(0); } 40% { transform: translate(4px,-1px) rotate(10deg); } 75% { transform: translate(1px,1px) rotate(-3deg); } }
@keyframes foxReceive { 0%, 100% { transform: rotate(0); } 45% { transform: translate(-2px,1px) rotate(-8deg); } 75% { transform: rotate(-3deg); } }
@keyframes foxCrouch { 0%, 25% { transform: none; } 100% { transform: translate(3px,3px) scale(1.04,.93); } }
@keyframes foxSniff { 0%, 100% { transform: translate(-3px,2px) rotate(-12deg); } 35%, 65% { transform: translate(-7px,3px) rotate(-16deg); } 50% { transform: translate(-5px,2px) rotate(-13deg); } }
@keyframes grapeDelight { 0%, 100% { transform: rotate(8deg); } 40% { transform: translateY(-3px) rotate(-5deg); } }
@keyframes grapeFall {
  0% { opacity: 0; transform: translate(0,-145px) rotate(-15deg); }
  8% { opacity: 1; transform: translate(0,-140px) rotate(-10deg); }
  24% { transform: translate(calc(var(--drift) * .35),-100px); }
  40% { transform: translate(calc(var(--drift) * .6),0) rotate(var(--spin)) scale(1.12,.82); }
  52% { transform: translate(calc(var(--drift) * .78),-23px) rotate(var(--spin)); }
  64% { transform: translate(calc(var(--drift) * .9),0) rotate(var(--spin)) scale(1.05,.94); }
  72% { transform: translate(var(--drift),-7px) rotate(var(--spin)); }
  80%, 92% { opacity: 1; transform: translate(var(--drift),0) rotate(var(--spin)); }
  100% { opacity: 0; transform: translate(var(--drift),0) rotate(var(--spin)); }
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
  .companion-bite-mark,
  :deep(.animal-head),
  :deep(.animal-paws),
  .companion-fox :deep(.animal-head),
  .companion-cat :deep(.animal-head),
  .scene-bite.phase-approach .companion-fox-body,
  .sniff.phase-contact .companion-fox :deep(.animal-head),
  .nuzzle.phase-contact .companion-fox :deep(.animal-head),
  .nuzzle.phase-contact .companion-cat,
  .grape-drop {
    animation: none !important;
  }

  .grape-drop { opacity: 1; transform: translateX(var(--drift)); }
  .speak :deep(.companion-waves) path {
    opacity: 0.7;
  }
}
</style>
