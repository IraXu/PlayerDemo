// ==================== HMWebPlayer SDK 全局声明 ====================
// SDK 由 index.html 以 <script defer src="/hmwebplayer.js"> 引入，暴露 window.HMWebPlayer。

interface HMPlayerOptions {
  container: HTMLElement | string
  width: number
  height: number
  x?: number
  y?: number
  renderMode?: 'canvas' | 'mse'
  decoderMode?: 'soft' | 'soft-simd' | 'wcs' | 'normal'
  useOffScreenCanvasRender?: boolean
  useWorkerForMSE?: boolean
  audioEngine?: 'worklet' | 'script'
  useMSEAudioWhenMSERenderMode?: boolean
  disableAudioForMSE?: boolean
  logEnable?: boolean
  logLevel?: string
  retryCnt?: number
  delay?: number
}

interface HMVideoInfo {
  vtype: number
  width: number
  height: number
}

interface HMAudioInfo {
  atype: number
  channels: number
  sample: number
}

interface HMStats {
  vFramerate: number
  aFramerate: number
  yuvFramerate: number
  pcmFramerate: number
  vRemuxFramerate: number
  aRemuxFramerate: number
}

interface HMPlayerInstance {
  startHMLiveStream(
    userToken: string,
    peerId: string,
    playUrl: string,
    resourceId: string,
    encType: number,
    encKey: string,
    encLoad: string,
    camId: number,
    streamId: number,
    audioFlag: number,
    channelNum: number,
  ): void
  on(event: 'state', handler: (data: { state: number }) => void): void
  on(event: 'videoInfo', handler: (data: HMVideoInfo) => void): void
  on(event: 'audioInfo', handler: (data: HMAudioInfo) => void): void
  on(event: 'stats', handler: (data: HMStats) => void): void
  on(event: 'error', handler: (error: unknown) => void): void
  on(event: string, handler: (...args: any[]) => void): void
  destroy(): void | Promise<void>
  resizeView(x: number, y: number, width: number, height: number): void
  mute(): void
  unMute(): void
  setVolume(volume: number): void
  pauseStream(): void
  resumeStream(): void
  screenshot(
    filename?: string,
    format?: 'png' | 'jpeg' | 'webp',
    quality?: number,
    type?: 'download' | 'base64' | 'blob',
  ): void | Promise<unknown>
}

interface Window {
  HMWebPlayer: new (options: HMPlayerOptions) => HMPlayerInstance
}
