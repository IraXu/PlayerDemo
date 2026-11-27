/**
 * 小猫互动上报：把点击者的环境信息和这次触发的场景发到企微机器人。
 *
 * 企业微信机器人限 20 条/分钟，小猫又很容易被连点，所以这里做了两层合并：
 * 1.2 秒内的连续点击合成一条消息（同一场景记次数）；
 * 2. 相邻两条消息至少间隔 4 秒，超出时排队等一会儿再发。
 */

import {
  getClientInfo,
  getNetworkInfoWithTimeout,
  type ClientInfo,
  type NetworkInfo,
} from './clientInfo'

// 目前和树洞来信共用同一个机器人；想分开收消息时，换成独立机器人的 key 即可
const WEBHOOK =
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ab1da84d-6f0f-4d9f-8f7b-73ea0dc9db3b'
const BATCH_WINDOW_MS = 1200
const MIN_GAP_MS = 4000

const pending = new Map<string, number>()
let pendingAnimal = '小猫'
let flushTimer: ReturnType<typeof setTimeout> | null = null
let sending = false
let lastSentAt = 0
let interactions = 0

function schedule(delay: number) {
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flushQueue()
  }, delay)
}

/** 记录一次互动：同一个场景的连点会合并成 “场景 ×3” */
export function reportCompanionScene(scene: string, animal = '小猫') {
  interactions += 1
  pendingAnimal = animal
  pending.set(scene, (pending.get(scene) ?? 0) + 1)
  if (!flushTimer) schedule(BATCH_WINDOW_MS)
}

async function flushQueue() {
  if (sending || !pending.size) return

  const gap = Date.now() - lastSentAt
  if (gap < MIN_GAP_MS) {
    schedule(MIN_GAP_MS - gap)
    return
  }

  const scenes = [...pending.entries()]
  const animal = pendingAnimal
  pending.clear()
  sending = true

  try {
    const [client, network] = await Promise.all([
      Promise.resolve(getClientInfo()),
      getNetworkInfoWithTimeout(1200),
    ])
    await post(buildMessage(scenes, animal, client, network))
  } finally {
    sending = false
    lastSentAt = Date.now()
    if (pending.size) schedule(BATCH_WINDOW_MS)
  }
}

function buildMessage(
  scenes: [string, number][],
  animal: string,
  client: ClientInfo,
  network: NetworkInfo | null,
) {
  const sceneText = scenes
    .map(([label, count]) => (count > 1 ? `${label}×${count}` : label))
    .join(' + ')
  const location =
    network?.location && network.location !== '未知（仅获取到 IP）'
      ? network.location.split(' · ').pop() || ''
      : ''
  const isp = network?.isp && network.isp !== '未知' ? network.isp : ''
  const place = [location, isp].filter(Boolean).join(' · ')
  const device = client.device.split(' · ').pop() || client.device
  const time = client.localTime.slice(5, 16)

  const lines = [
    `**🐾 ${animal}被戳了** · ${sceneText}`,
    `IP ${network?.ip || '未获取到'}${place ? `（${place}）` : ''} ｜ ${device} · ${client.browser} · ${client.os}`,
    `${client.viewport} ｜ ${client.network} ｜ ${time} ｜ 第 ${interactions} 次`,
    `<font color="comment">${client.page}</font>`,
  ]

  if (client.referrer !== '直接访问') {
    let from = client.referrer
    try {
      from = new URL(client.referrer).host
    } catch {
      /* 保留原始来源 */
    }
    lines.push(`<font color="comment">来自 ${from}</font>`)
  }

  return lines.join('\n')
}

async function post(content: string) {
  const payload = JSON.stringify({
    msgtype: 'markdown',
    markdown: { content },
  })

  // 企微机器人不支持浏览器 CORS，用 text/plain 的简单请求直发；
  // sendBeacon 能保证页面正在关闭时也发得出去，失败再退回 fetch。
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const queued = navigator.sendBeacon(
        WEBHOOK,
        new Blob([payload], { type: 'text/plain;charset=UTF-8' }),
      )
      if (queued) return
    }
  } catch {
    /* 落到 fetch */
  }

  await fetch(WEBHOOK, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined)
}
