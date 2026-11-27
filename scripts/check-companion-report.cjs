const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { stripTypeScriptTypes } = require('node:module')
const source = fs.readFileSync(path.resolve(__dirname, '../src/catReport.ts'), 'utf8')
const client = { localTime: '2026-11-27 12:00:00', device: '桌面端', os: 'macOS', browser: 'Chrome', viewport: '390×844', network: '4g', page: 'https://iraxu.github.io/PlayerDemo/', referrer: '直接访问' }
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

function makeHarness({ replies = [], beacon = true, network = () => Promise.resolve(null) } = {}) {
  let now = 100000, id = 0, hidden = false, networkCalls = 0, clientCalls = 0
  const timers = new Map(), fetches = [], beacons = [], events = [], saved = new Map()
  const documentListeners = new Map(), windowListeners = new Map()
  const module = { exports: {} }
  const code = stripTypeScriptTypes(source
    .replace(/import \{[\s\S]*?\} from '\.\/clientInfo'/, '')
    .replace('export function reportCompanionScene', 'function reportCompanionScene')) + '\nmodule.exports = { reportCompanionScene }'
  const ctx = {
    module, exports: module.exports, Error, TypeError, Blob,
    getClientInfo: () => { clientCalls++; return { ...client } },
    getNetworkInfoWithTimeout: () => { networkCalls++; return network() },
    Date: class extends Date { static now() { return now } },
    setTimeout: (fn, ms) => { timers.set(++id, { fn, at: now + ms }); return id },
    clearTimeout: key => timers.delete(key),
    sessionStorage: { setItem: (key, value) => saved.set(key, value) },
    CustomEvent: class { constructor(type, opts) { this.type = type; this.detail = opts.detail } },
    window: {
      dispatchEvent: event => events.push(event.detail),
      addEventListener: (name, fn) => windowListeners.set(name, fn),
    },
    document: {
      get hidden() { return hidden },
      addEventListener: (name, fn) => documentListeners.set(name, fn),
    },
    navigator: beacon === undefined ? {} : { sendBeacon: (url, body) => {
      beacons.push({ url, body })
      if (beacon instanceof Error) throw beacon
      return beacon
    } },
    console: { warn: () => {} }, AbortController,
    fetch: async (url, opts) => {
      fetches.push({ url, opts })
      const reply = replies.shift()
      if (reply instanceof Error) throw reply
      if (reply === 'hang') return new Promise((resolve, reject) => opts.signal.addEventListener('abort', () => reject(new Error('Timed out')), { once: true }))
      return await (reply || { type: 'opaque', status: 0 })
    },
  }
  vm.runInNewContext(code, ctx)
  async function microtasks() { for (let i = 0; i < 30; i++) await Promise.resolve() }
  return {
    ...module.exports, fetches, beacons, events, saved, microtasks,
    get networkCalls() { return networkCalls },
    get clientCalls() { return clientCalls },
    setHidden(value) { hidden = value; documentListeners.get('visibilitychange')?.() },
    pagehide() { windowListeners.get('pagehide')?.() },
    async advance(ms) {
      const until = now + ms
      await microtasks()
      for (;;) {
        const next = [...timers].sort((a,b) => a[1].at - b[1].at)[0]
        if (!next || next[1].at > until) break
        timers.delete(next[0]); now = next[1].at; next[1].fn(); await microtasks()
      }
      now = until; await microtasks()
    },
  }
}

const message = request => JSON.parse(request.opts.body).markdown.content
const beaconMessage = async beacon => JSON.parse(await beacon.body.text()).markdown.content

;(async () => {
  // Normal batching uses observable fetch failure, no beacon, and cannot claim business success.
  const direct = makeHarness()
  direct.reportCompanionScene('摸摸'); direct.reportCompanionScene('摸摸')
  await direct.advance(1200)
  assert.equal(direct.fetches.length, 1)
  assert.equal(direct.beacons.length, 0)
  assert.equal(direct.fetches[0].opts.mode, 'no-cors')
  assert.equal(direct.fetches[0].opts.credentials, 'omit')
  assert.equal(direct.fetches[0].opts.keepalive, true)
  assert.equal(direct.events.at(-1).state, 'unconfirmed')
  assert.match(message(direct.fetches[0]), /本次 2 次互动/)
  direct.setHidden(true); direct.pagehide()
  assert.equal(direct.beacons.length, 0, 'already submitted batch must not be repeated')

  // Each immutable batch gets at most 2 retries, with 4s/8s backoff, regardless of later clicks.
  const retry = makeHarness({ replies: [new TypeError('offline'), new TypeError('offline'), new TypeError('offline')] })
  retry.reportCompanionScene('狐狸扑咬小剧场')
  await retry.advance(1200)
  assert.equal(retry.events.at(-1).state, 'failed')
  await retry.advance(3999); assert.equal(retry.fetches.length, 1)
  await retry.advance(1); assert.equal(retry.fetches.length, 2)
  await retry.advance(7999); assert.equal(retry.fetches.length, 2)
  await retry.advance(1); assert.equal(retry.fetches.length, 3)
  assert.equal(retry.events.at(-1).attempts, 3)
  assert.match(retry.events.at(-1).detail, /已达到重试上限/)
  assert.equal(message(retry.fetches[0]), message(retry.fetches[1]))
  assert.equal(message(retry.fetches[1]), message(retry.fetches[2]))
  await retry.advance(60000); assert.equal(retry.fetches.length, 3)
  retry.reportCompanionScene('摸摸'); await retry.advance(1200)
  assert.equal(retry.fetches.length, 4)
  assert.match(message(retry.fetches[3]), /本页累计 2 次/)
  assert.equal(retry.events.at(-1).attempts, 1)

  // Leave inside the initial 1.2s coalescing window: synchronously capture client, no IP wait.
  const leave = makeHarness()
  leave.reportCompanionScene('摸摸'); leave.reportCompanionScene('摸摸')
  leave.setHidden(true)
  assert.equal(leave.beacons.length, 1)
  assert.equal(leave.networkCalls, 0)
  assert.equal(leave.clientCalls, 1)
  assert.match(await beaconMessage(leave.beacons[0]), /本次 2 次互动/)
  assert.equal(leave.events.at(-1).state, 'unconfirmed')
  leave.pagehide(); await leave.advance(20000)
  assert.equal(leave.beacons.length, 1)
  assert.equal(leave.fetches.length, 0)

  // Lifecycle must take over IP preparation, and an old continuation cannot submit it again.
  const ip = deferred()
  const preparing = makeHarness({ network: () => ip.promise })
  preparing.reportCompanionScene('狐狸蹭蹭小剧场'); await preparing.advance(1200)
  assert.equal(preparing.networkCalls, 1)
  preparing.reportCompanionScene('葡萄味小剧场')
  preparing.setHidden(true)
  assert.equal(preparing.beacons.length, 2, 'both unsent batches are flushed synchronously')
  assert.match(await beaconMessage(preparing.beacons[0]), /本页累计 1 次/)
  assert.match(await beaconMessage(preparing.beacons[1]), /本页累计 2 次/)
  preparing.pagehide()
  ip.resolve({ ip: '192.0.2.1', location: '示例位置', isp: '示例网络' }); await preparing.microtasks()
  assert.equal(preparing.beacons.length, 2)
  assert.equal(preparing.fetches.length, 0)
  preparing.setHidden(false); await preparing.advance(20000)
  assert.equal(preparing.fetches.length, 0)

  // New clicks while fetch is in flight flush separately; in-flight data is never duplicated.
  const delayed = deferred()
  const concurrent = makeHarness({ replies: [delayed.promise] })
  concurrent.reportCompanionScene('摸摸'); await concurrent.advance(1200)
  concurrent.reportCompanionScene('狐狸扑咬小剧场')
  concurrent.setHidden(true); concurrent.pagehide()
  assert.equal(concurrent.fetches.length, 1)
  assert.equal(concurrent.beacons.length, 1)
  assert.match(message(concurrent.fetches[0]), /本页累计 1 次/)
  assert.match(await beaconMessage(concurrent.beacons[0]), /本页累计 2 次/)
  assert.match(await beaconMessage(concurrent.beacons[0]), /本次 1 次互动/)
  delayed.resolve({ type: 'opaque' }); await concurrent.microtasks()
  concurrent.setHidden(false); await concurrent.advance(20000)
  assert.equal(concurrent.fetches.length, 1)

  // Beacon refused/throws: immediate keepalive fallback, still no repeated in-flight request.
  for (const beacon of [false, new Error('Beacon unavailable')]) {
    const fallbackRequest = deferred()
    const fallback = makeHarness({ beacon, replies: [fallbackRequest.promise] })
    fallback.reportCompanionScene('葡萄味小剧场'); fallback.pagehide()
    assert.equal(fallback.beacons.length, 1)
    assert.equal(fallback.fetches.length, 1, 'keepalive fetch starts within lifecycle callback')
    assert.equal(fallback.fetches[0].opts.keepalive, true)
    fallback.pagehide(); assert.equal(fallback.fetches.length, 1)
    fallbackRequest.resolve({ type: 'opaque' }); await fallback.microtasks()
    assert.equal(fallback.events.at(-1).state, 'unconfirmed')
  }

  // Requeued failed batch and newer pending events retain separate counts on lifecycle flush.
  const queuedRetry = makeHarness({ replies: [new TypeError('Network failed')] })
  queuedRetry.reportCompanionScene('狐狸扑咬小剧场'); await queuedRetry.advance(1200)
  queuedRetry.reportCompanionScene('摸摸'); queuedRetry.setHidden(true)
  assert.equal(queuedRetry.beacons.length, 2)
  assert.match(await beaconMessage(queuedRetry.beacons[0]), /本页累计 1 次/)
  assert.match(await beaconMessage(queuedRetry.beacons[1]), /本页累计 2 次/)
  queuedRetry.pagehide(); assert.equal(queuedRetry.beacons.length, 2)

  // Failure discovered while hidden does not rely on hidden timers; resume if the page returns.
  const rejectedWhileHidden = deferred()
  const resume = makeHarness({ replies: [rejectedWhileHidden.promise] })
  resume.reportCompanionScene('摸摸'); await resume.advance(1200)
  resume.setHidden(true)
  rejectedWhileHidden.reject(new TypeError('offline')); await resume.microtasks()
  await resume.advance(60000); assert.equal(resume.fetches.length, 1)
  resume.setHidden(false); await resume.advance(0)
  assert.equal(resume.fetches.length, 2)
  assert.equal(message(resume.fetches[0]), message(resume.fetches[1]))

  const timeout = makeHarness({ replies: ['hang'] })
  timeout.reportCompanionScene('摸摸'); await timeout.advance(1200)
  await timeout.advance(10000)
  assert.equal(timeout.events.at(-1).state, 'failed')
  assert.match(timeout.events.at(-1).detail, /Timed out/)

  assert.ok([...direct.events, ...leave.events, ...retry.events].every(event => event.state !== 'confirmed'))
  console.log('PASS: batching, fetch/omit/keepalive, no false delivery confirmation, 4s/8s bounded retries, timeout, lifecycle immediate flush, IP takeover, in-flight deduplication, stable concurrent counts, beacon fallback and foreground resume. No real messages sent.')
})().catch(error => { console.error(error); process.exit(1) })
