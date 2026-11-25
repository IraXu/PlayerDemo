/** Recorded animal foley; attribution and editing details live alongside the clips. */
import meow from './assets/sfx/meow.mp3'
import softMeow from './assets/sfx/meow-soft.mp3'
import shortMeow from './assets/sfx/cat-short.mp3'
import purr from './assets/sfx/purr.mp3'
import fox from './assets/sfx/fox.mp3'
import foxAlt from './assets/sfx/fox-alt.mp3'
import bear from './assets/sfx/bear.mp3'

type Sound = 'meow' | 'purr' | 'bear' | 'fox' | 'chirp' | 'yowl'
const clips: Record<Sound, string[]> = {
  meow: [meow, softMeow], purr: [purr], bear: [bear],
  fox: [fox, foxAlt], chirp: [softMeow], yowl: [shortMeow],
}
let ctx: AudioContext | null = null
let output: DynamicsCompressorNode | null = null
const downloads = new Map<string, Promise<ArrayBuffer>>()
const decoded = new Map<string, Promise<AudioBuffer>>()
const previous = new Map<Sound, number>()
const pending = new Map<Sound, number>()
interface Voice { source: AudioScheduledSourceNode; gain: GainNode; kind: string }
const voices = new Set<Voice>()

function download(url: string) {
  let task = downloads.get(url)
  if (!task) {
    task = fetch(url).then(response => {
      if (!response.ok) throw new Error(`Audio ${response.status}`)
      return response.arrayBuffer()
    }).catch(error => { downloads.delete(url); throw error })
    downloads.set(url, task)
  }
  return task
}

/** Fetch only the sounds needed for the hovered companion. Never block first paint. */
export function preloadSoundEffects(...sounds: Sound[]) {
  const urls = sounds.flatMap(sound => clips[sound] ?? [])
  for (const url of new Set(urls)) void download(url).catch(() => {})
}

function audioContext() {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    ctx = new Ctor()
    output = ctx.createDynamicsCompressor()
    output.threshold.value = -12
    output.knee.value = 12
    output.ratio.value = 4
    output.attack.value = 0.005
    output.release.value = 0.16
    output.connect(ctx.destination)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pending.clear()
        for (const voice of voices) fadeOut(voice)
      }
    })
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  return ctx
}

function fadeOut(voice: Voice) {
  if (!ctx) return
  const now = ctx.currentTime
  voice.gain.gain.cancelAndHoldAtTime(now)
  voice.gain.gain.linearRampToValueAtTime(0, now + 0.045)
  voice.source.stop(now + 0.05)
}

function track(source: AudioScheduledSourceNode, gain: GainNode, kind: string) {
  // Repeated petting fades the previous sound rather than stacking loud voices.
  for (const voice of voices) if (voice.kind === kind) fadeOut(voice)
  if (!kind.startsWith('reveal-') && [...voices].filter(voice => !voice.kind.startsWith('reveal-')).length >= 4) {
    const oldest = [...voices].find(voice => !voice.kind.startsWith('reveal-'))
    if (oldest) fadeOut(oldest)
  }
  const voice = { source, gain, kind }
  voices.add(voice)
  source.onended = () => { voices.delete(voice); source.disconnect(); gain.disconnect() }
}

async function play(kind: Sound, delay = 0) {
  const audio = audioContext()
  if (!audio || document.hidden) return
  const requestedAt = performance.now()
  pending.set(kind, requestedAt)
  const options = clips[kind]
  // Alternate recordings where available; keep natural recorded pitches intact.
  const index = ((previous.get(kind) ?? -1) + 1) % options.length
  previous.set(kind, index)
  const url = options[index]!
  const target = audio.currentTime + Math.max(0, delay)
  try {
    let bufferTask = decoded.get(url)
    if (!bufferTask) {
      bufferTask = download(url).then(bytes => audio.decodeAudioData(bytes.slice(0)))
        .catch(error => { decoded.delete(url); throw error })
      decoded.set(url, bufferTask)
    }
    const buffer = await bufferTask
    // Drop outdated requests after slow loads or a switch away from the page.
    if (pending.get(kind) !== requestedAt || document.hidden || performance.now() - requestedAt > 1200 + Math.max(0, delay) * 1000) return
    const start = Math.max(audio.currentTime, target)
    const source = audio.createBufferSource()
    source.buffer = buffer
    const gain = audio.createGain()
    const level = kind === 'purr' ? 0.8 : 0.9
    const end = start + buffer.duration
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(level, start + 0.02)
    gain.gain.setValueAtTime(level, Math.max(start + 0.02, end - 0.07))
    gain.gain.linearRampToValueAtTime(0, end)
    source.connect(gain)
    gain.connect(output!)
    track(source, gain, kind)
    source.start(start)
  } catch { /* Missing audio must never interrupt an interaction; allow a later retry. */ }
}

export function playMeow(delay = 0) { void play('meow', delay) }
export function playPurr() { void play('purr') }
export function playBearCall(delay = 0) { void play('bear', delay) }
export function playYip(delay = 0) { void play('fox', delay) }
/** A quiet recorded greeting replaces the old electronic three-note chirp. */
export function playChirp(delay = 0) { void play('chirp', delay) }
/** Short, emphatic recorded mew; avoid a harsh distress scream. */
export function playYowl(delay = 0) { void play('yowl', delay) }

/** Soft felt-bell cue with decaying, slightly inharmonic overtones. */
export function playReveal() {
  const audio = audioContext()
  if (!audio || document.hidden) return
  for (const voice of voices) if (voice.kind.startsWith('reveal-')) fadeOut(voice)
  const start = audio.currentTime
  ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
    const begin = start + index * 0.13
    ;[1, 2.006, 3.98].forEach((ratio, partial) => {
      const tone = audio.createOscillator()
      tone.type = 'sine'
      tone.frequency.value = frequency * ratio
      const gain = audio.createGain()
      const duration = partial === 0 ? 0.85 : 0.32
      gain.gain.setValueAtTime(0, begin)
      gain.gain.linearRampToValueAtTime([0.055, 0.012, 0.003][partial]!, begin + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, begin + duration)
      tone.connect(gain)
      gain.connect(output!)
      // Partials belong to one cue and should ring together.
      track(tone, gain, `reveal-${index}-${partial}`)
      tone.start(begin)
      tone.stop(begin + duration)
    })
  })
}
