/**
 * 十七的逗猫室 PWA 外壳缓存。
 * 只接管导航请求、构建产物和图标；wasm / 播放器资源交给浏览器自己的缓存。
 * 发版后如需清掉旧产物缓存，把 VERSION 加一即可。
 */
const VERSION = 'v2'
const CACHE = `shiqi-cat-room-${VERSION}`
const scope = self.registration.scope

const SHELL = [
  scope,
  `${scope}index.html`,
  `${scope}manifest.webmanifest`,
  `${scope}icons/icon-192.png`,
  `${scope}icons/icon-512.png`,
  `${scope}icons/icon-maskable-512.png`,
  `${scope}icons/apple-touch-icon.png`,
]

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

  // 构建产物用 stale-while-revalidate，其余请求放行
  const isAsset =
    url.pathname.startsWith(`${scope}assets/`) || url.pathname.startsWith(`${scope}icons/`)
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
