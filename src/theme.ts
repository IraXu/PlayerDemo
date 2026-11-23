import { computed, ref, watch } from 'vue'

/**
 * 小熊日：每年 11 月 20 日限定一天。
 * 当天自动切到小熊主题，过了这天自动回到猫咪主题，不做本地记忆。
 */
export type ThemeName = 'bear' | 'cat'

const BEAR_DAY_MONTH = 11
const BEAR_DAY_DATE = 20

function isBearDay(date = new Date()) {
  return date.getMonth() + 1 === BEAR_DAY_MONTH && date.getDate() === BEAR_DAY_DATE
}

export const theme = ref<ThemeName>(isBearDay() ? 'bear' : 'cat')
export const isBear = computed(() => theme.value === 'bear')

function syncDocument(name: ThemeName) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = name
  document.title = name === 'bear' ? '十七的逗熊室' : '十七的逗猫室'
}

syncDocument(theme.value)

watch(theme, (name) => syncDocument(name))

// 页面常被长时间挂着：跨过零点时也自动上下主题
if (typeof window !== 'undefined') {
  window.setInterval(() => {
    const next: ThemeName = isBearDay() ? 'bear' : 'cat'
    if (next !== theme.value) theme.value = next
  }, 60_000)
}

const CAT_HINTS = [
  '猫猫今天躲在页面的某个角落，仔细看看那些装饰～',
  '提示：它会在画面的边缘，不太起眼的地方。',
  '它比背景里的小猫稍微清楚一点点。',
  '试试看页面的上方和下方，猫猫喜欢待在那儿。',
]

const BEAR_HINTS = [
  '小熊今天躲在页面的某个角落，仔细看看那些装饰～',
  '提示：它会在画面的边缘，不太起眼的地方。',
  '它比背景里的小熊稍微清楚一点点。',
  '试试看页面的上方和下方，小熊喜欢待在那儿。',
]

export interface ThemeCopy {
  title: string
  subtitle: string
  mascotTip: string
  liveStatus: string
  idleStatus: string
  playTitle: string
  playText: string
  playAria: string
  stopTitle: string
  loadingTitle: string
  loadingText: string
  switchingTitle: string
  switchingText: string
  errorTitle: string
  errorText: string
  interactTip: string
  interactLabel: string
  interactingLabel: string
  teasingText: string
  teasingTip: string
  cooldownLabel: string
  cooldownTip: string
  teaseEndToast: string
  footer: string
  cornerAria: string
  cornerTitle: string
  fortuneTitle: string
  fortuneNote: string
  fortuneSeal: string
  huntLabel: string
  huntFoundLabel: string
  huntDesc: string
  huntFoundDesc: string
  huntHints: string[]
  huntAria: string
  huntFoundToast: string
  huntDoneToast: string
  treeDesc: string
  treeSentToast: string
  treeSentBothToast: string
  shareLabel: string
  shareDesc: string
  shareHint: string
  shareFail: string
  shareCardTip: string
  shareSaved: string
  companionAria: string
  eggWish: string
}

const COPY: Record<ThemeName, ThemeCopy> = {
  cat: {
    title: '十七的逗猫室',
    subtitle: '一只猫，一台摄像头，和想来看他的人',
    mascotTip: '摸摸小猫',
    liveStatus: '猫猫丧丧の，尝试逗逗吧～',
    idleStatus: '猫猫还没出镜',
    playTitle: '猫猫在屏幕里等你哦',
    playText: '轻点播放，看看猫猫此刻在做什么～',
    playAria: '播放猫猫画面',
    stopTitle: '先不看了',
    loadingTitle: '正在连上猫猫的镜头…',
    loadingText: '悄悄搭一条小路过去，马上就好～',
    switchingTitle: '正在换个更清楚的视角…',
    switchingText: '猫猫正在配合调整，稍等一下下～',
    errorTitle: '暂时没连上猫猫',
    errorText: '猫猫可能打了个盹，过一会儿再试试吧～',
    interactTip: '快和猫猫互动咯～',
    interactLabel: '逗猫棒',
    interactingLabel: '逗猫中',
    teasingText: '逗猫棒挥起来啦～',
    teasingTip: '逗猫棒正挥着，快看猫猫～',
    cooldownLabel: '歇一会',
    cooldownTip: '猫猫在喘口气，等一会儿再接着逗～',
    teaseEndToast: '逗猫棒收起来啦，猫猫还盯着看～',
    footer: '十七的逗猫室 · 猫猫万岁',
    cornerAria: '打开猫猫的小角落',
    cornerTitle: '猫猫的小角落',
    fortuneTitle: '今日猫签',
    fortuneNote: '一天只有一支签，明天再来看猫猫想说什么。',
    fortuneSeal: '猫',
    huntLabel: '找猫',
    huntFoundLabel: '已找到猫猫',
    huntDesc: '猫猫今天躲起来了',
    huntFoundDesc: '明天它还会换个地方',
    huntHints: CAT_HINTS,
    huntAria: '躲起来的小猫',
    huntFoundToast: '找到猫猫啦！它今天躲在这儿，被你发现了～',
    huntDoneToast: '今天已经找到猫猫啦，明天它还会换个地方躲起来～',
    treeDesc: '把想说的话悄悄放进树洞吧，只有树和猫会听到。',
    treeSentToast: '已经悄悄投进树洞啦，猫猫会替你保密的～',
    treeSentBothToast: '留言和图片都悄悄投进树洞啦，猫猫会替你保密的～',
    shareLabel: '猫猫卡片',
    shareDesc: '把这一刻装进口袋',
    shareHint: '等猫猫出镜了，再把它装进口袋吧～',
    shareFail: '卡片没做出来，再试一次吧',
    shareCardTip: '长按图片也可以保存，或者直接分享给朋友～',
    shareSaved: '卡片已经保存到本地啦',
    companionAria: '摸摸陪你待着的小猫',
    eggWish: '愿你每天都被小猫治愈。每天保持好心情～',
  },
  bear: {
    title: '十七的逗熊室',
    subtitle: '一只小熊，一台摄像头，和想来看他的人',
    mascotTip: '摸摸小熊',
    liveStatus: '熊熊丧丧の，尝试逗逗吧～',
    idleStatus: '小熊还没出镜',
    playTitle: '小熊在屏幕里等你哦',
    playText: '轻点播放，看看小熊此刻在做什么～',
    playAria: '播放小熊画面',
    stopTitle: '先不看了',
    loadingTitle: '正在连上小熊的镜头…',
    loadingText: '悄悄搭一条小路过去，马上就好～',
    switchingTitle: '正在换个更清楚的视角…',
    switchingText: '小熊正在配合调整，稍等一下下～',
    errorTitle: '暂时没连上小熊',
    errorText: '小熊可能打了个盹，过一会儿再试试吧～',
    interactTip: '小熊要和你互动咯～',
    interactLabel: '逗熊棒',
    interactingLabel: '逗熊中',
    teasingText: '逗熊棒挥起来啦～',
    teasingTip: '逗熊棒正挥着，快看小熊～',
    cooldownLabel: '歇一会',
    cooldownTip: '小熊在喘口气，等一会儿再接着逗～',
    teaseEndToast: '逗熊棒收起来啦，小熊还盯着看～',
    footer: '十七的逗熊室 · 小熊万岁',
    cornerAria: '打开小熊的小角落',
    cornerTitle: '小熊的小角落',
    fortuneTitle: '今日熊签',
    fortuneNote: '一天只有一支签，明天再来看小熊想说什么。',
    fortuneSeal: '熊',
    huntLabel: '找熊',
    huntFoundLabel: '已找到小熊',
    huntDesc: '小熊今天躲起来了',
    huntFoundDesc: '明天它还会换个地方',
    huntHints: BEAR_HINTS,
    huntAria: '躲起来的小熊',
    huntFoundToast: '找到小熊啦！它今天躲在这儿，被你发现了～',
    huntDoneToast: '今天已经找到小熊啦，明天它还会换个地方躲起来～',
    treeDesc: '把想说的话悄悄放进树洞吧，只有树和熊会听到。',
    treeSentToast: '已经悄悄投进树洞啦，小熊会替你保密的～',
    treeSentBothToast: '留言和图片都悄悄投进树洞啦，小熊会替你保密的～',
    shareLabel: '小熊卡片',
    shareDesc: '把这一刻装进口袋',
    shareHint: '等小熊出镜了，再把它装进口袋吧～',
    shareFail: '卡片没做出来，再试一次吧',
    shareCardTip: '长按图片也可以保存，或者直接分享给朋友～',
    shareSaved: '卡片已经保存到本地啦',
    companionAria: '摸摸陪你待着的小熊',
    eggWish: '愿你每天都被小熊治愈。每天保持好心情～',
  },
}

export function copyFor(name: ThemeName): ThemeCopy {
  return COPY[name]
}

export const copy = computed(() => copyFor(theme.value))
