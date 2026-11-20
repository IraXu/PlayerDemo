/**
 * 树洞来信附带的环境信息。
 * 公网 IP / 归属地来自公开的 IP 查询接口，其余信息都在浏览器本地读取。
 */

import { copy } from './theme'

export interface ClientInfo {
  browser: string
  os: string
  device: string
  screen: string
  viewport: string
  language: string
  timezone: string
  network: string
  online: string
  localTime: string
  page: string
  referrer: string
}

export interface NetworkInfo {
  ip: string
  location: string
  isp: string
  timezone: string
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function formatTime(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function shortVersion(version: string) {
  return version.split('.').slice(0, 2).join('.').replace(/\.0$/, '')
}

function detectBrowser(ua: string) {
  const wechat = ua.match(/MicroMessenger\/([\d.]+)/i)
  if (wechat) return `微信内置浏览器 ${shortVersion(wechat[1])}`
  const edge = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/i)
  if (edge) return `Edge ${shortVersion(edge[1])}`
  const opera = ua.match(/OPR\/([\d.]+)/i)
  if (opera) return `Opera ${shortVersion(opera[1])}`
  const chrome = ua.match(/Chrome\/([\d.]+)/i)
  if (chrome) return `Chrome ${shortVersion(chrome[1])}`
  const firefox = ua.match(/Firefox\/([\d.]+)/i)
  if (firefox) return `Firefox ${shortVersion(firefox[1])}`
  const safari = ua.match(/Version\/([\d.]+).*Safari/i)
  if (safari) return `Safari ${shortVersion(safari[1])}`
  return '未知浏览器'
}

function detectOS(ua: string) {
  if (/Windows NT 10\.0/i.test(ua)) return 'Windows 10/11'
  const win = ua.match(/Windows NT ([\d.]+)/i)
  if (win) return `Windows ${win[1]}`
  const ios = ua.match(/OS ([\d_]+) like Mac OS X/i)
  if (ios) return `iOS ${ios[1].replace(/_/g, '.')}`
  const mac = ua.match(/Mac OS X ([\d_]+)/i)
  if (mac) return `macOS ${mac[1].replace(/_/g, '.')}`
  const android = ua.match(/Android ([\d.]+)/i)
  if (android) return `Android ${android[1]}`
  if (/CrOS/i.test(ua)) return 'ChromeOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return '未知系统'
}

function detectDevice(ua: string) {
  const touch = navigator.maxTouchPoints > 0
  if (/iPhone/i.test(ua)) return '手机 · iPhone'
  if (/iPad/i.test(ua)) return '平板 · iPad'
  if (/Android/i.test(ua)) return /Mobile/i.test(ua) ? '手机 · Android' : '平板 · Android'
  if (/Macintosh/i.test(ua) && touch) return '平板 · iPad'
  if (touch) return '触屏设备'
  return '桌面端'
}

export function getClientInfo(): ClientInfo {
  const ua = navigator.userAgent
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean }
    }
  ).connection

  return {
    browser: detectBrowser(ua),
    os: detectOS(ua),
    device: detectDevice(ua),
    screen: `${window.screen.width}×${window.screen.height} @${window.devicePixelRatio}x`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    language: navigator.language || '未知',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '未知',
    network: connection?.effectiveType
      ? `${connection.effectiveType}${connection.saveData ? ' · 省流模式' : ''}`
      : '未知',
    online: navigator.onLine ? '在线' : '离线',
    localTime: formatTime(),
    page: window.location.href,
    referrer: document.referrer || '直接访问',
  }
}

async function fetchJson(url: string, timeout: number): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
    if (!response.ok) throw new Error(`请求失败：${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

async function fetchNetworkInfo(): Promise<NetworkInfo | null> {
  try {
    const data = await fetchJson(
      'https://ipwho.is/?fields=ip,success,country,region,city,connection,timezone',
      3500,
    )
    if (data?.success && data.ip) {
      return {
        ip: data.ip,
        location: [data.country, data.region, data.city].filter(Boolean).join(' · ') || '未知',
        isp: data.connection?.isp || '未知',
        timezone: data.timezone?.id || '',
      }
    }
  } catch {
    /* 换一个接口再试 */
  }

  try {
    const data = await fetchJson('https://api.ipify.org?format=json', 2500)
    if (data?.ip) {
      return { ip: data.ip, location: '未知（仅获取到 IP）', isp: '未知', timezone: '' }
    }
  } catch {
    /* ignore */
  }

  return null
}

let networkPromise: Promise<NetworkInfo | null> | null = null

/** 打开树洞时预加载，避免提交时等待太久 */
export function loadNetworkInfo() {
  networkPromise ??= fetchNetworkInfo()
  return networkPromise
}

export async function getNetworkInfoWithTimeout(ms = 1500) {
  return Promise.race([
    loadNetworkInfo(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}

export function buildTreeHoleMessage(
  content: string,
  client: ClientInfo,
  network: NetworkInfo | null,
  image?: { width: number; height: number; size: number } | null,
) {
  const quoted = [
    '<font color="info">▎</font>',
    ...content
      .split(/\r?\n/)
      .map((line) => `<font color="info">▎ ${line}</font>`),
    '<font color="info">▎</font>',
  ].join('\n')

  const location =
    network?.location && network.location !== '未知（仅获取到 IP）'
      ? network.location
      : ''
  const isp = network?.isp && network.isp !== '未知' ? network.isp : ''
  const place = [location, isp].filter(Boolean).join(' · ')
  const meta = [
    `🌐 IP：${network?.ip || '未获取到'}${place ? `（${place}）` : ''}`,
    `💻 设备：${client.browser} · ${client.os} · ${client.device}`,
    `🖥 屏幕：${client.screen} · 窗口 ${client.viewport}`,
    `🕒 环境：${client.language} · ${client.timezone} · ${client.network} · ${client.online}`,
    `🔗 页面：${client.page}`,
  ]

  if (image) {
    meta.push(`🖼 图片：${image.width}×${image.height} · ${Math.round(image.size / 1024)} KB`)
  }

  if (client.referrer !== '直接访问') meta.push(`↩ 来源：${client.referrer}`)

  return [
    '**🐾 树洞来信**',
    `<font color="comment">${client.localTime} · ${copy.value.title}</font>`,
    '',
    quoted,
    '',
    ...meta,
  ].join('\n')
}
