/**
 * 设备平台接口（纯前端直连）
 * 取流、设备信息、逗猫指令都在浏览器里完成签名与加解密。
 * 注意：AccessKey / AccessSecret 会随前端代码公开，仅适合演示环境。
 */

export interface StreamInfo {
  ws_url: string
  resource_id: string
  enc_type: string
  enc_key: string
  enc_load: string
}

export interface DeviceInfo {
  name: string
  did: string
  license: string
  model: string
  version: string
  mac: string
  ssid: string
  ip: string
  online: boolean
}

interface HemisphereResp {
  Code: string
  Message: string
  Data: any
}

const BASE_URL = 'https://gm-cn.smartcloudcon.com'
const ACCESS_KEY = 'G0015djd8jvz7205'
const ACCESS_SECRET = 'ug8ebwuuaets805t'
const DID = '1200010180ee9bea'
const LICENSE = 'CM0423H1OUWAM'
/** 白光灯点亮后自动恢复的时长，页面光效需要与它严格对齐 */
export const LIGHT_DURATION_MS = 6000

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function padBytes(input: string, size: number): Uint8Array<ArrayBuffer> {
  const src = encoder.encode(input)
  const out = new Uint8Array(size)
  out.set(src.subarray(0, size))
  return out
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)))
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

function randomHex(size: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(size)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

let aesKeyPromise: Promise<CryptoKey> | null = null
let hmacKeyPromise: Promise<CryptoKey> | null = null

function aesKey(): Promise<CryptoKey> {
  aesKeyPromise ??= crypto.subtle.importKey('raw', padBytes(ACCESS_KEY, 16), { name: 'AES-CBC' }, false, [
    'encrypt',
    'decrypt',
  ])
  return aesKeyPromise
}

function hmacKey(): Promise<CryptoKey> {
  hmacKeyPromise ??= crypto.subtle.importKey(
    'raw',
    encoder.encode(ACCESS_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return hmacKeyPromise
}

async function encrypt(plain: string): Promise<string> {
  const buffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: padBytes(ACCESS_SECRET, 16) },
    await aesKey(),
    encoder.encode(plain),
  )
  return toBase64(new Uint8Array(buffer))
}

async function decrypt(encoded: string): Promise<string> {
  const buffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: padBytes(ACCESS_SECRET, 16) },
    await aesKey(),
    fromBase64(encoded),
  )
  return decoder.decode(buffer)
}

async function sign(data: string, path: string, nonce: string, timestamp: string): Promise<string> {
  const raw = `AccessKey${ACCESS_KEY}Data${data}Nonce${nonce}Path${path}Timestamp${timestamp}`
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(), encoder.encode(raw))
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function call(path: string, body: unknown, auth?: string): Promise<HemisphereResp> {
  const data = await encrypt(JSON.stringify(body))
  const timestamp = String(Math.floor(Date.now() / 1000))
  const nonce = randomHex(12)
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Ver: '3.0' }
  if (auth) headers.Authorization = auth

  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      AccessKey: ACCESS_KEY,
      Timestamp: timestamp,
      Nonce: nonce,
      Data: data,
      Signature: await sign(data, path, nonce, timestamp),
    }),
  })
  const json = (await res.json()) as HemisphereResp
  if (json.Code === '0' && typeof json.Data === 'string' && json.Data.length > 2) {
    try {
      json.Data = JSON.parse(await decrypt(json.Data))
    } catch {
      /* 非 JSON 数据保持原样 */
    }
  }
  return json
}

let token = ''
let tokenExpireAt = 0

async function platformToken(): Promise<string> {
  if (token && Date.now() < tokenExpireAt) return token
  const resp = await call('/GMModule/GenPlatformAccessToken', {})
  if (resp.Code !== '0' || !resp.Data?.AccessToken) {
    throw new Error(resp.Code === '10043' ? '平台鉴权失败，请检查 AccessKey' : resp.Message || '平台鉴权失败')
  }
  token = resp.Data.AccessToken
  tokenExpireAt = Date.now() + Math.max(60, Number(resp.Data.AccessTokenExpires || 3600) - 300) * 1000
  return token
}

let infoCache: { data: DeviceInfo; expireAt: number } | null = null

export async function queryDevice(): Promise<DeviceInfo> {
  if (infoCache && Date.now() < infoCache.expireAt) return infoCache.data
  const auth = await platformToken()

  const [modelResp, statusResp] = await Promise.all([
    call(
      '/GMModule/V3/Device/GetDeviceModel',
      {
        DID,
        Language: '1',
        Modules: [
          { AIIoTType: '1050', AIIoTID: '0' },
          { AIIoTType: '1041', AIIoTID: '0' },
        ],
      },
      auth,
    ),
    call('/GMModule/V3/Device/QueryDeviceStatus', { DevList: [{ License: LICENSE }] }, auth),
  ])

  if (modelResp.Code !== '0') throw new Error(modelResp.Message || '查询设备信息失败')
  const list = modelResp.Data?.ModelsSetting || []
  const base = list.find((m: any) => m.AIIoTType === '1050')?.Buss || {}
  const net = list.find((m: any) => m.AIIoTType === '1041')?.Buss || {}
  const presence = statusResp.Data?.DevList?.[0]?.Presence

  const data: DeviceInfo = {
    name: base.DevName || '未命名设备',
    did: DID,
    license: base.License || LICENSE,
    model: base.DevModel || '—',
    version: base.DevVersion || '—',
    mac: net.MacAddr || '—',
    ssid: net.SSID || '—',
    ip: '',
    online: presence === '1',
  }
  infoCache = { data, expireAt: Date.now() + 60_000 }
  return data
}

export async function queryStream(): Promise<StreamInfo> {
  const auth = await platformToken()
  const resp = await call(
    '/GMModule/V3/Media/GetMultiMediaAddr',
    { DID, Proto: '9', CamID: '0', StreamID: '0', ChannelNum: '0' },
    auth,
  )
  if (resp.Code !== '0') throw new Error(resp.Message || `取流失败(${resp.Code})`)
  const info = resp.Data || {}
  if (!info.WSUrl) throw new Error('设备离线或未返回播放地址')
  return {
    ws_url: info.WSUrl,
    resource_id: info.ResourceID || '',
    enc_type: String(info.EncType || '49'),
    enc_key: info.EncKey || '',
    enc_load: info.EncLoad || '',
  }
}

let lightTimer: ReturnType<typeof setTimeout> | null = null

function restoreLight() {
  if (lightTimer) clearTimeout(lightTimer)
  lightTimer = setTimeout(() => {
    lightTimer = null
    void platformToken()
      .then((auth) => call('/GMModule/V3/Device/SetIROpenFlag', { DID, IRRedMode: '0' }, auth))
      .catch(() => undefined)
  }, LIGHT_DURATION_MS)
}

export async function interact(): Promise<void> {
  const auth = await platformToken()
  // 1. 蜂鸣报警
  const buzzer = await call(
    '/GMModule/V3/Device/CtrlDevice',
    { DID, AIIoTType: '1009', Param: { CtrlType: '1' } },
    auth,
  )
  if (buzzer.Code !== '0') throw new Error(buzzer.Message || '报警指令下发失败')

  // 2. 白光灯点亮，定时恢复智能模式
  const light = await call('/GMModule/V3/Device/SetIROpenFlag', { DID, IRRedMode: '2' }, auth)
  if (light.Code !== '0') throw new Error(light.Message || '灯光指令下发失败')
  restoreLight()
}
