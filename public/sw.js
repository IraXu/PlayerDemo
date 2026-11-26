/**
 * 十七的逗猫室 PWA 外壳缓存。
 * 接管导航请求、构建产物、图标，以及播放器 SDK 的运行时文件（hmwebplayer / worker / wasm）。
 * 播放器文件不带 hash 且 GitHub Pages 只给 max-age=600，这里用 cache-first 长期缓存，
 * 发版后把 VERSION 加一即可清掉旧缓存。
 */
const VERSION = 'v3'
const CACHE = `shiqi-cat-room-${VERSION}`
const scope = self.registration.scope
const BASE = new URL(scope).pathname

const SHELL = [
  scope,
  `${scope}index.html`,
  `${scope}manifest.webmanifest`,
  `${scope}icons/icon-192.png`,
  `${scope}icons/icon-512.png`,
  `${scope}icons/icon-maskable-512.png`,
  `${scope}icons/apple-touch-icon.png`,
]

// 海康播放器 SDK 的运行时文件：不进 install 预缓存（首次访问不该拉几 MB），命中后再长期缓存
const PLAYER_ASSETS = new Set(
  [
    'hmwebplayer.js',
    'worker.js',
    'videodec.wasm',
    'videodec_simd.wasm',
    'audiodec.wasm',
    'hmbusiness.wasm',
  ].map((name) => `${BASE}${name}`),
)

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // 页面导航：网络优先，断网时回退到缓存的壳
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches
            .open(CACHE)
            .then((cache) => cache.put(request, copy))
            .catch(() => undefined)
          return response
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match(`${scope}index.html`)),
        ),
    )
    return
  }

  // 播放器运行时：cache-first，避免过期后重复下载解码器
  if (PLAYER_ASSETS.has(url.pathname)) {
    event.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches
              .open(CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => undefined)
          }
          return response
        })
      }),
    )
    return
  }

  // 构建产物用 stale-while-revalidate，其余请求放行
  const isAsset =
    url.pathname.startsWith(`${BASE}assets/`) || url.pathname.startsWith(`${BASE}icons/`)
  if (!isAsset) return

  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches
              .open(CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => undefined)
          }
          return response
        })
        .catch(() => hit)
      return hit || network
    }),
  )
})
