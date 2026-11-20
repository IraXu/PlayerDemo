<template>
  <div class="companion" :class="[mode, { leftward: facing < 0, invite: showInvite }]" :style="style">
    <button class="companion-btn" type="button" :aria-label="copy.companionAria" @click="onCatClick">
      <span v-if="bubbleHint" class="companion-bubble" :class="{ news: hasNews }" aria-hidden="true">
        {{ bubbleHint }}
      </span>
      <svg v-if="isBear" class="companion-cat" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <ellipse cx="50" cy="94" rx="24" ry="3.6" fill="rgba(121, 79, 39, 0.14)" />

        <path
          d="M50 50c14 0 24 10 24 23 0 9-8 15-24 15s-24-6-24-15c0-13 10-23 24-23Z"
          fill="#D9A468"
          stroke="#794F27"
          stroke-width="3"
        />
        <ellipse cx="50" cy="82" rx="12" ry="6.5" fill="#F6DFBC" />

        <circle cx="29" cy="27" r="10.5" fill="#C98F52" stroke="#794F27" stroke-width="3" />
        <circle cx="71" cy="27" r="10.5" fill="#C98F52" stroke="#794F27" stroke-width="3" />
        <circle cx="50" cy="45" r="27" fill="#D9A468" stroke="#794F27" stroke-width="3" />

        <ellipse cx="50" cy="55" rx="13" ry="9.5" fill="#F6DFBC" />

        <ellipse class="companion-eye" cx="40" cy="41" rx="3.4" ry="4.4" fill="#2A2A2A" />
        <ellipse class="companion-eye" cx="60" cy="41" rx="3.4" ry="4.4" fill="#2A2A2A" />
        <circle cx="41.2" cy="39.4" r="1.2" fill="#fff" />
        <circle cx="61.2" cy="39.4" r="1.2" fill="#fff" />

        <ellipse cx="30" cy="52" rx="3.6" ry="2.2" fill="#F4A6A4" opacity="0.5" />
        <ellipse cx="70" cy="52" rx="3.6" ry="2.2" fill="#F4A6A4" opacity="0.5" />

        <path
          d="M45.8 51c0-1.6 1.9-2.6 4.2-2.6s4.2 1 4.2 2.6c0 1.7-4.2 4.3-4.2 4.3s-4.2-2.6-4.2-4.3Z"
          fill="#5A3A22"
        />
        <path
          d="M50 55.6c0 1.9-2.4 2.1-3.4.8M50 55.6c0 1.9 2.4 2.1 3.4.8"
          stroke="#794F27"
          stroke-width="1.6"
          stroke-linecap="round"
        />

        <g v-if="mode === 'speak'" class="companion-waves" aria-hidden="true">
          <path d="M74 44c3.5 3 3.5 9 0 12" />
          <path d="M80.5 38c6.5 5.6 6.5 17 0 22.6" />
        </g>

        <path d="M37 62c8 4 18 4 26 0" stroke="#2A9D8F" stroke-width="6.5" stroke-linecap="round" />
        <g class="companion-scarf">
          <path
            d="M42 65c-4 3-6 8-4 12"
            stroke="#2A9D8F"
            stroke-width="5"
            stroke-linecap="round"
          />
          <path
            d="M47 66c-1 4 0 7 2 9"
            stroke="#2A9D8F"
            stroke-width="4"
            stroke-linecap="round"
            opacity="0.8"
          />
        </g>
        <circle cx="50" cy="64.5" r="2.8" fill="#F6C445" stroke="#B8871F" stroke-width="1.1" />
        <path d="M50 63.2v2.6" stroke="#B8871F" stroke-width="0.9" stroke-linecap="round" />

        <ellipse cx="40" cy="85" rx="8" ry="5" fill="#F6DFBC" stroke="#794F27" stroke-width="2.4" />
        <ellipse cx="60" cy="85" rx="8" ry="5" fill="#F6DFBC" stroke="#794F27" stroke-width="2.4" />
        <path
          d="M37.5 82.6v4M40 82.1v4.6M42.5 82.6v4M57.5 82.6v4M60 82.1v4.6M62.5 82.6v4"
          stroke="#C9A87C"
          stroke-width="1.1"
          stroke-linecap="round"
        />
      </svg>
      <svg v-else class="companion-cat" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <ellipse cx="50" cy="94" rx="24" ry="3.6" fill="rgba(121, 79, 39, 0.14)" />

        <g class="companion-tail">
          <path
            d="M70 82c13 3 21-4 19-12-1-6-6-9-11-8"
            stroke="#794F27"
            stroke-width="6.4"
            stroke-linecap="round"
          />
          <path
            d="M70 82c13 3 21-4 19-12-1-6-6-9-11-8"
            stroke="#F6E3C3"
            stroke-width="3.8"
            stroke-linecap="round"
          />
        </g>

        <path
          d="M50 47c14 0 24 11 24 24 0 10-8 16-24 16s-24-6-24-16c0-13 10-24 24-24Z"
          fill="#FAEDCD"
          stroke="#794F27"
          stroke-width="3"
        />

        <ellipse cx="50" cy="82" rx="12" ry="6.5" fill="#FFF8E7" />

        <path
          d="M26 40 22 17 43 27a34 34 0 0 1 14 0l21-10-4 23c4 4 6 9 6 15 0 14-12 24-32 24S26 68 26 54c0-6 2-10 6-14Z"
          fill="#FAEDCD"
          stroke="#794F27"
          stroke-width="3"
          stroke-linejoin="round"
        />

        <path d="M29 26 27 15 37 21Z" fill="#F4A6A4" />
        <path d="M71 26 73 15 63 21Z" fill="#F4A6A4" />
        <path
          d="M46 27c0-4 3-5 5-2M51 26c1-3 4-3 4 0"
          stroke="#794F27"
          stroke-width="2"
          stroke-linecap="round"
        />

        <ellipse class="companion-eye" cx="40" cy="46" rx="3.5" ry="4.6" fill="#2A2A2A" />
        <ellipse class="companion-eye" cx="60" cy="46" rx="3.5" ry="4.6" fill="#2A2A2A" />
        <circle cx="41.2" cy="44" r="1.3" fill="#fff" />
        <circle cx="61.2" cy="44" r="1.3" fill="#fff" />
        <circle cx="39" cy="48" r="0.65" fill="#fff" opacity="0.85" />
        <circle cx="59" cy="48" r="0.65" fill="#fff" opacity="0.85" />

        <ellipse cx="32.5" cy="55" rx="3.6" ry="2.2" fill="#F4A6A4" opacity="0.5" />
        <ellipse cx="67.5" cy="55" rx="3.6" ry="2.2" fill="#F4A6A4" opacity="0.5" />

        <path
          d="M47.8 54c0-1 1-1.6 2.2-1.6s2.2.6 2.2 1.6c0 1.1-2.2 2.8-2.2 2.8S47.8 55.1 47.8 54Z"
          fill="#EF8F8F"
        />
        <path
          d="M50 57.2c0 2-2.4 2.2-3.4.9M50 57.2c0 2 2.4 2.2 3.4.9"
          stroke="#794F27"
          stroke-width="1.6"
          stroke-linecap="round"
        />
        <g v-if="mode === 'speak'" class="companion-waves" aria-hidden="true">
          <path d="M72 46c3.5 3 3.5 9 0 12" />
          <path d="M78.5 40c6.5 5.6 6.5 17 0 22.6" />
        </g>
        <path
          d="M34 52c-4-1-7-1-9 0M34 56.5c-4 0-7 .6-9 1.2M66 52c4-1 7-1 9 0M66 56.5c4 0 7 .6 9 1.2"
          stroke="#794F27"
          stroke-width="1.15"
          stroke-linecap="round"
          opacity="0.45"
        />

        <path d="M37 65c8 4 18 4 26 0" stroke="#2A9D8F" stroke-width="6.5" stroke-linecap="round" />
        <g class="companion-scarf">
          <path
            d="M42 68c-4 3-6 8-4 12"
            stroke="#2A9D8F"
            stroke-width="5"
            stroke-linecap="round"
          />
          <path
            d="M47 69c-1 4 0 7 2 9"
            stroke="#2A9D8F"
            stroke-width="4"
            stroke-linecap="round"
            opacity="0.8"
          />
        </g>
        <circle cx="50" cy="67.5" r="2.8" fill="#F6C445" stroke="#B8871F" stroke-width="1.1" />
        <path d="M50 66.2v2.6" stroke="#B8871F" stroke-width="0.9" stroke-linecap="round" />

        <ellipse cx="40" cy="85" rx="8" ry="5" fill="#FFF8E7" stroke="#794F27" stroke-width="2.4" />
        <ellipse cx="60" cy="85" rx="8" ry="5" fill="#FFF8E7" stroke="#794F27" stroke-width="2.4" />
        <path
          d="M37.5 82.6v4M40 82.1v4.6M42.5 82.6v4M57.5 82.6v4M60 82.1v4.6M62.5 82.6v4"
          stroke="#C9A87C"
          stroke-width="1.1"
          stroke-linecap="round"
        />
      </svg>
    </button>

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
    <div class="mail-box">
      <div class="mail-dates">
        <button
          class="mail-date-nav"
          type="button"
          :disabled="!canOlder"
          aria-label="更早的留言"
          @click="shiftDate(1)"
        >
          <ChevronLeftIcon :size="15" color="currentColor" />
        </button>
        <div ref="dateChipsRef" class="mail-date-chips" role="tablist" aria-label="留言日期">
          <button
            v-for="day in messageDates"
            :key="day"
            class="mail-date-chip"
            :class="{ active: day === selectedDate }"
            type="button"
            role="tab"
            :aria-selected="day === selectedDate"
            @click="selectedDate = day"
          >
            {{ dateLabel(day) }}
          </button>
        </div>
        <button
          class="mail-date-nav"
          type="button"
          :disabled="!canNewer"
          aria-label="更新的留言"
          @click="shiftDate(-1)"
        >
          <ChevronRightIcon :size="15" color="currentColor" />
        </button>
      </div>

      <div ref="chatListRef" class="chat-list">
        <div v-for="item in dateMessages" :key="item.id" class="chat-row">
          <span class="chat-avatar" aria-hidden="true">
            <PawPrintIcon :size="16" color="#19a99b" />
          </span>
          <div class="chat-body">
            <span class="chat-name">徐娇娇</span>
            <p class="chat-bubble">{{ item.text }}</p>
            <span v-if="item.time" class="chat-time">{{ timeLabel(item) }}</span>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Modal } from 'animal-island-vue'
import { ChevronLeftIcon, ChevronRightIcon, PawPrintIcon } from 'naive-icons-vue'
import { playBearCall, playMeow, playPurr, playReveal } from '../sfx'
import { copy, isBear } from '../theme'

type Mode = 'sit' | 'walk' | 'sleep' | 'happy' | 'speak'

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

const mode = ref<Mode>('sit')
const facing = ref<1 | -1>(1)
const pos = reactive({ x: 24, y: 0 })
const walkDuration = ref(3.6)
const hearts = ref<Heart[]>([])
const showInvite = ref(false)
const hasPetted = ref(false)
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
  return showInvite.value ? '摸摸我～' : ''
})

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
  return message.time ? message.time.slice(11) || message.time : ''
}

/** 只有今天的留言才提醒，往日留言留在信箱里慢慢看 */
function isToday(message: OwnerMessage) {
  return typeof message.time === 'string' && message.time.startsWith(todayKey())
}

let timer: ReturnType<typeof setTimeout> | null = null
let inviteTimer: ReturnType<typeof setTimeout> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
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

  hasPetted.value = true
  showInvite.value = false
  if (inviteTimer) {
    clearTimeout(inviteTimer)
    inviteTimer = null
  }

  clearTimer()
  timer = setTimeout(() => {
    mode.value = 'sit'
    schedule()
  }, 1800)
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
  pet()
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

function burstHearts() {
  const batch: Heart[] = Array.from({ length: 3 }, () => ({
    id: ++heartId,
    left: rand(-16, 28),
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
  if (inviteTimer) clearTimeout(inviteTimer)
  if (pollTimer) clearInterval(pollTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
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
  filter: drop-shadow(0 8px 12px rgba(121, 79, 39, 0.16));
}

.companion-bubble {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 4px);
  padding: 4px 9px;
  border-radius: 11px;
  border: 2px solid #d4c4a8;
  background: #fffaf0;
  color: #794f27;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  box-shadow: 0 3px 0 #d4c9b4;
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
  background: #fffaf0;
  border-right: 2px solid #d4c4a8;
  border-bottom: 2px solid #d4c4a8;
  border-bottom-right-radius: 2px;
  transform: rotate(45deg);
}

.companion-bubble.news {
  color: #1d7f75;
  border-color: #b7e3dd;
  box-shadow: 0 3px 0 #cbe7e3;
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
  background: #fffaf0;
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
  box-shadow: 0 2px 0 #0b8f86;
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
  background: #fffaf0;
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
  box-shadow: 0 2px 0 #96631a;
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
  border: 2px solid #b7e3dd;
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
  border: 2px solid #d4c4a8;
  background: #fffaf0;
  color: #794f27;
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.6;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 3px 0 #e9e0cd;
}

.chat-time {
  margin-top: 5px;
  padding-left: 2px;
  font-size: 10.5px;
  line-height: 1;
  color: #a99c86;
}

.companion-waves path {
  fill: none;
  stroke: #2a9d8f;
  stroke-width: 2.4;
  stroke-linecap: round;
  opacity: 0;
}

.speak .companion-waves path {
  animation: companionWave 1.6s ease-in-out infinite;
}

.speak .companion-waves path:nth-of-type(2) {
  animation-delay: 0.24s;
}

.leftward .companion-cat {
  transform: scaleX(-1);
}

.companion-eye {
  transform-box: fill-box;
  transform-origin: center;
}

.sit .companion-cat {
  animation: companionBob 3.6s ease-in-out infinite;
}

.sit .companion-eye {
  animation: companionBlink 6.2s ease-in-out infinite;
}

.walk .companion-cat {
  animation: companionWalk 0.42s ease-in-out infinite;
}

.sleep .companion-cat {
  animation: companionBreathe 4.4s ease-in-out infinite;
}

.sleep .companion-eye {
  transform: scaleY(0.12);
}

.happy .companion-cat {
  animation: companionHop 0.5s ease-in-out 2;
}

.speak .companion-cat {
  animation: companionSpeak 2s ease-in-out infinite;
}

.speak .companion-tail {
  animation: companionTail 1.5s ease-in-out infinite;
}

.companion.invite .companion-cat {
  animation: companionInvite 2.2s ease-in-out infinite;
}

.companion-tail,
.companion-scarf {
  transform-box: fill-box;
  transform-origin: 0% 50%;
}

.sit .companion-tail,
.happy .companion-tail {
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

@media (max-width: 720px) {
  .companion {
    width: 56px;
    height: 60px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .companion {
    transition: none;
  }

  .companion-cat,
  .companion.invite .companion-cat,
  .speak .companion-cat,
  .companion-tail,
  .companion-eye,
  .companion-zzz,
  .companion-heart,
  .companion-bubble,
  .companion-waves path {
    animation: none;
  }

  .speak .companion-waves path {
    opacity: 0.7;
  }
}
</style>
