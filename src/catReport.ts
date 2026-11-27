/**
 * 小猫互动通知：连续点击合并，正常发送至少间隔 4 秒。
 * 纯 GitHub Pages 使用 no-cors 直连，浏览器只能确认提交，无法读取企微业务结果。
 */
import {
  getClientInfo,
  getNetworkInfoWithTimeout,
  type ClientInfo,
  type NetworkInfo,
} from './clientInfo'

// 与树洞共用机器人；所有页面和功能的请求都会计入同一个机器人的限额。
const WEBHOOK =
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ab1da84d-6f0f-4d9f-8f7b-73ea0dc9db3b'
const BATCH_WINDOW_MS = 1200
const MIN_GAP_MS = 4000
const REQUEST_TIMEOUT_MS = 10000
const MAX_ATTEMPTS = 3 // 首次提交 + 最多 2 次明确网络失败重试

type DeliveryState = 'pending' | 'unconfirmed' | 'failed'
type BatchStage = 'waiting' | 'preparing' | 'submitted' | 'finished'
interface ReportBatch {
  id: number
  scenes: [string, number][]
  animal: string
  client: ClientInfo
  totalInteractions: number
  content?: string
  attempts: number
  retryAt: number
  stage: BatchStage
}

const pending = new Map<string, number>()
const retries: ReportBatch[] = []
let pendingAnimal = '小猫'
let flushTimer: ReturnType<typeof setTimeout> | null = null
let activeBatch: ReportBatch | null = null
let lastSentAt = 0
let interactions = 0
let nextBatchId = 0
let cachedNetwork: NetworkInfo | null = null
let lifecycleInstalled = false

/** 诊断不影响小剧场；unconfirmed 明确表示无法读取企微送达结果。 */
function recordDelivery(state: DeliveryState, detail: string, batch?: ReportBatch) {
  const diagnostic = {
    state, detail, at: new Date().toISOString(),
    batchId: batch?.id ?? null,
    attempts: batch?.attempts ?? 0,
    interactions: batch?.totalInteractions ?? interactions,
  }
  try { sessionStorage.setItem('companion-report:last-delivery', JSON.stringify(diagnostic)) } catch { /* 私密模式 */ }
  try { window.dispatchEvent(new CustomEvent('companion-report:delivery', { detail: diagnostic })) } catch { /* 诊断监听器不可影响通知 */ }
  if (state === 'failed') console.warn('[猫猫互动通知]', detail)
}

function clearFlushTimer() {
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = null
}

function schedule(delay: number) {
  clearFlushTimer()
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flushQueue()
  }, Math.max(0, delay))
}

function scheduleNext() {
  if (activeBatch || document.hidden || (!pending.size && !retries.length)) return
  const now = Date.now()
  const nextRetryAt = retries.length ? Math.min(...retries.map(batch => batch.retryAt)) : Infinity
  const nextAt = Math.min(pending.size ? now + BATCH_WINDOW_MS : Infinity, nextRetryAt)
  schedule(Math.max(nextAt, lastSentAt + MIN_GAP_MS) - now)
}

function installLifecycle() {
  if (lifecycleInstalled) return
  lifecycleInstalled = true
  // hidden 经常先于 pagehide；提交后移出队列，两次事件不会重复同一批。
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushForLifecycle()
    else scheduleNext()
  })
  window.addEventListener('pagehide', flushForLifecycle)
}

/** 连点合并为同一场景的次数；正在发送的批次保持独立，不被新点击修改。 */
export function reportCompanionScene(scene: string, animal = '小猫') {
  installLifecycle()
  interactions += 1
  pendingAnimal = animal
  pending.set(scene, (pending.get(scene) ?? 0) + 1)
  recordDelivery('pending', '互动已加入待发送队列')
  if (document.hidden) flushForLifecycle()
  else if (!flushTimer) schedule(BATCH_WINDOW_MS)
}

/** 冻结计数、时间和环境；重试/离页接管使用同一份内容。 */
function takePending(): ReportBatch | null {
  if (!pending.size) return null
  const client = getClientInfo()
  const batch: ReportBatch = {
    id: ++nextBatchId, scenes: [...pending.entries()], animal: pendingAnimal,
    client, totalInteractions: interactions, attempts: 0, retryAt: 0, stage: 'waiting',
  }
  pending.clear()
  return batch
}

function prepareContent(batch: ReportBatch, network: NetworkInfo | null) {
  batch.content ??= buildMessage(batch.scenes, batch.animal, batch.client, network, batch.totalInteractions)
  return batch.content
}

async function flushQueue() {
  if (activeBatch || (!pending.size && !retries.length)) return
  if (document.hidden) { flushForLifecycle(); return }
  const now = Date.now()
  if (now - lastSentAt < MIN_GAP_MS) { scheduleNext(); return }
  const retryIndex = retries.findIndex(batch => batch.retryAt <= now)
  const batch = retryIndex >= 0 ? retries.splice(retryIndex, 1)[0]! : takePending()
  if (!batch) { scheduleNext(); return }
  activeBatch = batch
  batch.stage = 'preparing'
  try {
    if (!batch.content) {
      const network = await getNetworkInfoWithTimeout(1200).catch(() => null)
      if (network) cachedNetwork = network
      // 查询 IP 期间离页可能已同步接管该批次；不能恢复后再发送一次。
      if (batch.stage !== 'preparing') return
      prepareContent(batch, network)
    }
    await submitFetch(batch)
  } finally {
    // 离页接管可能已释放旧批次，新一轮发送不能被旧 finally 清掉。
    if (activeBatch === batch) activeBatch = null
    scheduleNext()
  }
}

function retryFailedBatch(batch: ReportBatch, error: unknown) {
  const detail = error instanceof Error ? error.message : '通知请求失败'
  const willRetry = batch.attempts < MAX_ATTEMPTS
  if (willRetry) {
    batch.stage = 'waiting'
    batch.retryAt = Date.now() + MIN_GAP_MS * batch.attempts
    retries.push(batch)
  } else {
    batch.stage = 'finished'
  }
  recordDelivery('failed', `${detail}${willRetry ? '；页面继续运行时将有限重试' : '；已达到重试上限'}`, batch)
  scheduleNext()
}

async function submitFetch(batch: ReportBatch) {
  batch.stage = 'submitted'
  batch.attempts += 1
  lastSentAt = Date.now()
  recordDelivery('pending', '正在提交互动通知', batch)
  try {
    await post(prepareContent(batch, cachedNetwork))
    batch.stage = 'finished'
    recordDelivery('unconfirmed', '请求已提交；纯静态直连无法读取企微业务处理结果', batch)
  } catch (error) {
    retryFailedBatch(batch, error)
  }
}

/** 只接管尚未提交的批次，不重发已在 fetch 中的批次。 */
function flushForLifecycle() {
  clearFlushTimer()
  const unsent = retries.splice(0)
  if (activeBatch?.stage === 'preparing') {
    unsent.push(activeBatch)
    activeBatch = null
  }
  const newest = takePending()
  if (newest) unsent.push(newest)
  for (const batch of unsent) submitForLifecycle(batch)
}

function submitForLifecycle(batch: ReportBatch) {
  const payload = makePayload(prepareContent(batch, cachedNetwork))
  // 生命周期回调中同步排队，不再等待 IP 查询或下一轮异步任务。
  // true 只代表浏览器接受排队，不能标成“发送成功”。
  try {
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(
      WEBHOOK, new Blob([payload], { type: 'text/plain;charset=UTF-8' }),
    )) {
      batch.attempts += 1
      batch.stage = 'finished'
      lastSentAt = Date.now()
      recordDelivery('unconfirmed', '离页请求已排队；浏览器无法确认企微是否接收', batch)
      return
    }
  } catch { /* 未排入 beacon 队列，再尝试 keepalive fetch */ }
  // 此调用会同步发起 fetch；不能保证页面彻底销毁后还可执行回调或重试。
  void submitFetch(batch)
}

function buildMessage(
  scenes: [string, number][],
  animal: string,
  client: ClientInfo,
  network: NetworkInfo | null,
  totalInteractions: number,
) {
  // Keep the layout within the robot's basic Markdown subset: headings,
  // quotes, bold text and the three supported font colors (no tables / CSS).
  const text = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\r\n]+/g, ' ')
  const muted = (value: string) => `<font color="comment">${text(value)}</font>`
  const total = scenes.reduce((sum, [, count]) => sum + count, 0)
  const sceneNames: Record<string, string> = {
    '摸摸': '摸摸脑袋 · 收到一份温柔',
    '狐狸蹭蹭小剧场': '狐狸蹭蹭 · 贴贴进行中',
    '狐狸扑咬小剧场': '狐狸扑咬 · 调皮了一下',
    '狐狸喝咖啡小剧场': '冰咖啡时间 · 必须喝口冰的了！',
    '葡萄味小剧场': '葡萄味奇遇 · 是葡萄味哎',
    '打开未读留言': '拆开来信 · 有话对你说',
  }
  const sceneLines = scenes.map(([label, count]) => {
    const name = sceneNames[label] || label
    const badge = count > 1 ? `　<font color="warning">× ${count}</font>` : ''
    return `> <font color="info">${text(name)}</font>${badge}`
  })
  const location = network?.location && network.location !== '未知（仅获取到 IP）'
    && network.location !== '未知' ? network.location : ''
  const isp = network?.isp && network.isp !== '未知' ? network.isp : ''
  const place = [location, isp].filter(Boolean).join(' · ')

  const lines = [
    `### 🐾 ${text(animal)}的互动来报`,
    muted(`${client.localTime} · 十七的逗猫室`),
    '',
    ...sceneLines,
    '',
    `**本次 ${total} 次互动**　${muted(`本页累计 ${totalInteractions} 次`)}`,
    '',
    '**来访足迹**',
    `${muted('位置　')} ${text(place || '位置暂未获取')}`,
    `${muted('地址　')} ${text(network?.ip || 'IP 暂未获取')}`,
    `${muted('设备　')} ${text(client.device)} · ${text(client.os)}`,
    `${muted('浏览器')} ${text(client.browser)}`,
    `${muted('窗口　')} ${text(client.viewport)} · ${text(client.network)}`,
    '',
    `${muted('互动页面')} ${text(client.page)}`,
  ]

  if (client.referrer !== '直接访问') {
    let from = client.referrer
    try {
      from = new URL(client.referrer).host
    } catch {
      /* 保留原始来源 */
    }
    lines.push(muted(`访问来源 · ${from}`))
  }

  return lines.join('\n')
}

function makePayload(content: string) {
  return JSON.stringify({ msgtype: 'markdown', markdown: { content } })
}

async function post(content: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    // text/plain 是 CORS 简单请求；qyapi 能解析 JSON body。
    // 不带跨站 credentials；opaque 响应不等于企微 errcode:0。
    await fetch(WEBHOOK, {
      method: 'POST', mode: 'no-cors', credentials: 'omit',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: makePayload(content), keepalive: true, signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}
