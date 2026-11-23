/**
 * 播放器 SDK 按需加载：首屏不下载 172KB 的 hmwebplayer.js，
 * 第一次点播放时再加载，并和取流请求并行，避免增加首帧等待。
 */

let loading: Promise<void> | null = null

export function loadPlayerSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('播放器加载失败，请刷新重试'))
  }
  if (typeof window.HMWebPlayer === 'function') return Promise.resolve()

  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${import.meta.env.BASE_URL}hmwebplayer.js`
    script.async = true
    script.onload = () => {
      if (typeof window.HMWebPlayer === 'function') {
        resolve()
        return
      }
      loading = null
      reject(new Error('播放器加载失败，请刷新重试'))
    }
    script.onerror = () => {
      loading = null
      script.remove()
      reject(new Error('播放器加载失败，请刷新重试'))
    }
    document.head.appendChild(script)
  })

  return loading
}
