import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import crypto from 'node:crypto'

/**
 * 播放参数已固定在前端，这里只保留两个最必要的接口：
 *   GET  /api/device    设备基础信息（名称 / License / 型号 / MAC / 在线状态）
 *   POST /api/interact  触发设备报警（蜂鸣器）+ 白光灯，6 秒后自动恢复
 * AccessKey / AccessSecret 从 .env.local 读取，不出现在仓库里。
 */

const BASE_URL = 'https://gm-cn.smartcloudcon.com'
const DID = '1200010180ee9bea'
const LICENSE = 'CM0423H1OUWAM'
const LIGHT_DURATION_MS = 6000

interface HemisphereResp {
  Code: string
  Message: string
  Data: any
}

function padKey(input: string, size: number): Buffer {
  const buf = Buffer.from(input)
  if (buf.length >= size) return buf.subarray(0, size)
  const out = Buffer.alloc(size)
  buf.copy(out)
  return out
}

const encrypt = (plain: string, accessKey: string, accessSecret: string) => {
  const cipher = crypto.createCipheriv('aes-128-cbc', padKey(accessKey, 16), padKey(accessSecret, 16))
  return Buffer.concat([cipher.update(Buffer.from(plain)), cipher.final()]).toString('base64')
}

const decrypt = (encoded: string, accessKey: string, accessSecret: string) => {
  const decipher = crypto.createDecipheriv('aes-128-cbc', padKey(accessKey, 16), padKey(accessSecret, 16))
  return Buffer.concat([decipher.update(Buffer.from(encoded, 'base64')), decipher.final()]).toString('utf8')
}

const sign = (
  data: string,
  path: string,
  nonce: string,
  timestamp: string,
  accessKey: string,
  accessSecret: string,
) => {
  const raw = `AccessKey${accessKey}Data${data}Nonce${nonce}Path${path}Timestamp${timestamp}`
  return crypto.createHmac('sha256', accessSecret).update(raw).digest('hex')
}

function createApiPlugin(accessKey: string, accessSecret: string): Plugin {
  let token = ''
  let tokenExpireAt = 0
  let infoCache: { data: any; expireAt: number } | null = null
  let lightTimer: ReturnType<typeof setTimeout> | null = null

  const call = async (path: string, body: unknown, auth?: string): Promise<HemisphereResp> => {
    const data = encrypt(JSON.stringify(body), accessKey, accessSecret)
    const timestamp = String(Math.floor(Date.now() / 1000))
    const nonce = crypto.randomBytes(12).toString('hex')
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Ver: '3.0' }
    if (auth) headers.Authorization = auth

    const res = await fetch(BASE_URL + path, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        AccessKey: accessKey,
        Timestamp: timestamp,
        Nonce: nonce,
        Data: data,
        Signature: sign(data, path, nonce, timestamp, accessKey, accessSecret),
      }),
    })
    const json = (await res.json()) as HemisphereResp
    if (json.Code === '0' && typeof json.Data === 'string' && json.Data.length > 2) {
      try {
        json.Data = JSON.parse(decrypt(json.Data, accessKey, accessSecret))
      } catch {
        /* 非 JSON 数据保持原样 */
      }
    }
    return json
  }

  const platformToken = async () => {
    if (token && Date.now() < tokenExpireAt) return token
    const resp = await call('/GMModule/GenPlatformAccessToken', {})
    if (resp.Code !== '0' || !resp.Data?.AccessToken) {
      throw new Error(resp.Code === '10043' ? '平台鉴权失败，请检查 AccessKey' : resp.Message || '平台鉴权失败')
    }
    token = resp.Data.AccessToken
    tokenExpireAt = Date.now() + Math.max(60, Number(resp.Data.AccessTokenExpires || 3600) - 300) * 1000
    return token
  }

  const queryDevice = async () => {
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

    const data = {
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

  const queryStream = async () => {
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

  const restoreLight = () => {
    if (lightTimer) clearTimeout(lightTimer)
    lightTimer = setTimeout(() => {
      lightTimer = null
      void platformToken()
        .then((auth) => call('/GMModule/V3/Device/SetIROpenFlag', { DID, IRRedMode: '0' }, auth))
        .catch(() => undefined)
    }, LIGHT_DURATION_MS)
  }

  const interact = async () => {
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
    return { lightMs: LIGHT_DURATION_MS }
  }

  const handler = async (req: any, res: any) => {
    const url = new URL(req.url || '/', 'http://localhost')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')

    try {
      if (url.pathname.endsWith('/stream')) {
        res.end(JSON.stringify({ code: 200, data: await queryStream() }))
        return
      }
      if (url.pathname.endsWith('/device')) {
        res.end(JSON.stringify({ code: 200, data: await queryDevice() }))
        return
      }
      if (url.pathname.endsWith('/interact')) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ code: 405, message: 'Method Not Allowed' }))
          return
        }
        const data = await interact()
        res.end(JSON.stringify({ code: 200, data }))
        return
      }
      res.statusCode = 404
      res.end(JSON.stringify({ code: 404, message: 'Not Found' }))
    } catch (error) {
      console.warn('[vision-player] 接口失败:', (error as Error).message)
      res.end(JSON.stringify({ code: 502, message: (error as Error).message }))
    }
  }

  return {
    name: 'vision-device-api',
    configureServer(server) {
      server.middlewares.use('/api', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api', handler)
    },
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // GitHub Pages 项目站点部署在 /PlayerDemo/ 子路径下，构建时需要带上 base
    base: command === 'build' ? '/PlayerDemo/' : '/',
    plugins: [vue(), createApiPlugin(env.HM_ACCESS_KEY || '', env.HM_ACCESS_SECRET || '')],
    server: {
      host: '127.0.0.1',
      port: 5273,
    },
  }
})
