/**
 * 页面轻音效：呼噜声、喵一声。
 * 全部用 Web Audio 实时合成，不引入任何音频文件。
 */

type AudioContextCtor = typeof AudioContext

let ctx: AudioContext | null = null
let activePurr: GainNode | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function brownNoise(ctx: AudioContext, seconds: number): AudioBufferSourceNode {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.2
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  return source
}

/**
 * 呼噜声：
 * 低频基音 + 点缀噪声，再叠 24Hz 的振幅脉冲和 0.6Hz 的缓慢起伏，
 * 避免出现“电流噪声”或机械的电子音。
 */
export function playPurr() {
  const audio = getAudioContext()
  if (!audio) return
  const now = audio.currentTime
  const duration = 2.6

  // 上一段还没播完就再点，先把旧的一段收掉，避免叠音
  if (activePurr) {
    try {
      activePurr.gain.cancelScheduledValues(now)
      activePurr.gain.setTargetAtTime(0, now, 0.06)
    } catch {
      /* ignore */
    }
  }

  const master = audio.createGain()
  master.gain.setValueAtTime(0, now)
  master.gain.linearRampToValueAtTime(0.12, now + 0.22)
  master.gain.setValueAtTime(0.12, now + duration - 0.6)
  master.gain.linearRampToValueAtTime(0, now + duration)

  // 基音：55Hz 三角波 + 82.5Hz 正弦，经过低通后作为“胸腔共振”
  const toneFilter = audio.createBiquadFilter()
  toneFilter.type = 'lowpass'
  toneFilter.frequency.value = 240
  toneFilter.Q.value = 0.8

  const base = audio.createOscillator()
  base.type = 'triangle'
  base.frequency.value = 55

  const overtone = audio.createOscillator()
  overtone.type = 'sine'
  overtone.frequency.value = 82.5
  const overtoneGain = audio.createGain()
  overtoneGain.gain.value = 0.4

  base.connect(toneFilter)
  overtone.connect(overtoneGain)
  overtoneGain.connect(toneFilter)

  // 呼噜的脉冲感：用一个 25Hz 的 LFO 调制音量
  const pulse = audio.createGain()
  pulse.gain.value = 0.6
  const pulseLfo = audio.createOscillator()
  pulseLfo.type = 'sine'
  pulseLfo.frequency.value = 25
  const pulseDepth = audio.createGain()
  pulseDepth.gain.value = 0.35
  pulseLfo.connect(pulseDepth)
  pulseDepth.connect(pulse.gain)

  // 一点气息声，让声音不那么“电子”
  const breath = brownNoise(audio, duration)
  const breathFilter = audio.createBiquadFilter()
  breathFilter.type = 'lowpass'
  breathFilter.frequency.value = 520
  breathFilter.Q.value = 0.5
  const breathGain = audio.createGain()
  breathGain.gain.value = 0.09
  breath.connect(breathFilter)
  breathFilter.connect(breathGain)
  breathGain.connect(pulse)

  // 0.6Hz 的缓慢起伏，模拟猫呼吸时呼噜强弱的变化
  const wave = audio.createOscillator()
  wave.type = 'sine'
  wave.frequency.value = 0.6
  const waveDepth = audio.createGain()
  waveDepth.gain.value = 0.03
  wave.connect(waveDepth)
  waveDepth.connect(master.gain)

  const smooth = audio.createBiquadFilter()
  smooth.type = 'lowpass'
  smooth.frequency.value = 1200
  smooth.Q.value = 0.5

  toneFilter.connect(pulse)
  pulse.connect(smooth)
  smooth.connect(master)
  master.connect(audio.destination)

  base.start(now)
  overtone.start(now)
  pulseLfo.start(now)
  breath.start(now)
  wave.start(now)

  base.stop(now + duration)
  overtone.stop(now + duration)
  pulseLfo.stop(now + duration)
  breath.stop(now + duration)
  wave.stop(now + duration)

  activePurr = master
  window.setTimeout(() => {
    if (activePurr === master) activePurr = null
  }, duration * 1000)
}

/**
 * 喵一声：三角波 + 少量锯齿波作为声源，
 * 用会滑动的共振峰模拟“喵——”的元音变化，并加一点起音气息，减少电子感。
 * @param delay 相对当前时间的延迟（秒）
 */
export function playMeow(delay = 0) {
  const audio = getAudioContext()
  if (!audio) return
  const start = audio.currentTime + Math.max(0, delay)
  const duration = 0.48

  const master = audio.createGain()
  master.gain.setValueAtTime(0, start)
  master.gain.linearRampToValueAtTime(0.2, start + 0.04)
  master.gain.linearRampToValueAtTime(0.15, start + 0.26)
  master.gain.linearRampToValueAtTime(0, start + 0.46)

  const tone = audio.createOscillator()
  tone.type = 'triangle'
  const rasp = audio.createOscillator()
  rasp.type = 'sawtooth'
  const raspLevel = audio.createGain()
  raspLevel.gain.value = 0.24

  // 每次叫声音高略有不同，避免反复点击时听起来一模一样
  const offset = Math.random() * 50 - 25
  tone.detune.setValueAtTime(offset, start)
  rasp.detune.setValueAtTime(offset, start)

  const setPitch = (param: AudioParam) => {
    param.setValueAtTime(560, start)
    param.linearRampToValueAtTime(880, start + 0.07)
    param.linearRampToValueAtTime(760, start + 0.19)
    param.linearRampToValueAtTime(470, start + 0.4)
  }
  setPitch(tone.frequency)
  setPitch(rasp.frequency)

  // 轻微颤音，让音高不是完全笔直
  const vibrato = audio.createOscillator()
  vibrato.type = 'sine'
  vibrato.frequency.value = 5.5
  const vibratoDepth = audio.createGain()
  vibratoDepth.gain.value = 9
  vibrato.connect(vibratoDepth)
  vibratoDepth.connect(tone.detune)
  vibratoDepth.connect(rasp.detune)

  const lowpass = audio.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 2100
  lowpass.Q.value = 0.6

  tone.connect(lowpass)
  rasp.connect(raspLevel)
  raspLevel.connect(lowpass)

  // 两个会滑动的共振峰，形成“喵——”的元音变化
  const formant1 = audio.createBiquadFilter()
  formant1.type = 'bandpass'
  formant1.Q.value = 2.4
  formant1.frequency.setValueAtTime(680, start)
  formant1.frequency.linearRampToValueAtTime(1120, start + 0.13)
  formant1.frequency.linearRampToValueAtTime(800, start + 0.42)

  const formant2 = audio.createBiquadFilter()
  formant2.type = 'bandpass'
  formant2.Q.value = 3.2
  formant2.frequency.setValueAtTime(1750, start)
  formant2.frequency.linearRampToValueAtTime(1250, start + 0.2)
  formant2.frequency.linearRampToValueAtTime(1050, start + 0.42)

  const body = audio.createGain()
  body.gain.value = 0.28

  lowpass.connect(formant1)
  lowpass.connect(formant2)
  lowpass.connect(body)
  formant1.connect(master)
  formant2.connect(master)
  body.connect(master)

  // 起音的一点气息，减少“电子音头”
  const breath = brownNoise(audio, 0.2)
  const breathFilter = audio.createBiquadFilter()
  breathFilter.type = 'bandpass'
  breathFilter.frequency.value = 1200
  breathFilter.Q.value = 0.8
  const breathGain = audio.createGain()
  breathGain.gain.setValueAtTime(0.05, start)
  breathGain.gain.linearRampToValueAtTime(0, start + 0.12)
  breath.connect(breathFilter)
  breathFilter.connect(breathGain)
  breathGain.connect(master)

  master.connect(audio.destination)

  tone.start(start)
  rasp.start(start)
  vibrato.start(start)
  breath.start(start)
  tone.stop(start + duration)
  rasp.stop(start + duration)
  vibrato.stop(start + duration)
  breath.stop(start + duration)
}

/**
 * 小熊的招呼声：比喵声低一个八度左右的一声“呜”，
 * 三角波下滑 + 锯齿波胸腔共鸣 + 一点气息，听起来闷闷的、软软的。
 * @param delay 相对当前时间的延迟（秒）
 */
export function playBearCall(delay = 0) {
  const audio = getAudioContext()
  if (!audio) return
  const start = audio.currentTime + Math.max(0, delay)
  const duration = 0.5

  const master = audio.createGain()
  master.gain.setValueAtTime(0, start)
  master.gain.linearRampToValueAtTime(0.22, start + 0.05)
  master.gain.linearRampToValueAtTime(0.14, start + 0.3)
  master.gain.linearRampToValueAtTime(0, start + 0.48)

  const tone = audio.createOscillator()
  tone.type = 'triangle'
  // 每次叫声略有不同，避免反复点击听起来一模一样
  tone.detune.setValueAtTime(Math.random() * 24 - 12, start)
  tone.frequency.setValueAtTime(210, start)
  tone.frequency.linearRampToValueAtTime(150, start + 0.16)
  tone.frequency.linearRampToValueAtTime(120, start + 0.42)

  const rumble = audio.createOscillator()
  rumble.type = 'sawtooth'
  rumble.frequency.setValueAtTime(105, start)
  rumble.frequency.linearRampToValueAtTime(78, start + 0.4)
  const rumbleGain = audio.createGain()
  rumbleGain.gain.value = 0.22

  const vibrato = audio.createOscillator()
  vibrato.type = 'sine'
  vibrato.frequency.value = 6
  const vibratoDepth = audio.createGain()
  vibratoDepth.gain.value = 6
  vibrato.connect(vibratoDepth)
  vibratoDepth.connect(tone.detune)

  const lowpass = audio.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.setValueAtTime(900, start)
  lowpass.frequency.linearRampToValueAtTime(520, start + 0.4)
  lowpass.Q.value = 1.2

  const breath = brownNoise(audio, 0.3)
  const breathFilter = audio.createBiquadFilter()
  breathFilter.type = 'bandpass'
  breathFilter.frequency.value = 420
  breathFilter.Q.value = 0.7
  const breathGain = audio.createGain()
  breathGain.gain.setValueAtTime(0.06, start)
  breathGain.gain.linearRampToValueAtTime(0, start + 0.18)

  tone.connect(lowpass)
  rumble.connect(rumbleGain)
  rumbleGain.connect(lowpass)
  lowpass.connect(master)
  breath.connect(breathFilter)
  breathFilter.connect(breathGain)
  breathGain.connect(master)
  master.connect(audio.destination)

  tone.start(start)
  rumble.start(start)
  vibrato.start(start)
  breath.start(start)
  tone.stop(start + duration)
  rumble.stop(start + duration)
  vibrato.stop(start + duration)
  breath.stop(start + duration)
}

/**
 * “酱酱酱～”的揭晓音效：
 * 三个上行音 + 尾音，三角波叠一层高八度正弦，听起来像小铃铛报幕。
 */
export function playReveal() {
  const audio = getAudioContext()
  if (!audio) return
  const start = audio.currentTime
  const notes = [
    { freq: 523.25, at: 0, duration: 0.18, gain: 0.13 },
    { freq: 659.25, at: 0.15, duration: 0.18, gain: 0.14 },
    { freq: 783.99, at: 0.3, duration: 0.7, gain: 0.17 },
  ]

  notes.forEach(({ freq, at, duration, gain }, index) => {
    const begin = start + at
    const master = audio.createGain()
    master.gain.setValueAtTime(0, begin)
    master.gain.linearRampToValueAtTime(gain, begin + 0.012)
    master.gain.exponentialRampToValueAtTime(0.0001, begin + duration)
    master.connect(audio.destination)

    const tone = audio.createOscillator()
    tone.type = 'triangle'
    tone.frequency.setValueAtTime(freq, begin)
    if (index === notes.length - 1) {
      tone.frequency.linearRampToValueAtTime(freq * 1.02, begin + duration)
    }

    const shimmer = audio.createOscillator()
    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(freq * 2, begin)
    const shimmerGain = audio.createGain()
    shimmerGain.gain.value = 0.16

    tone.connect(master)
    shimmer.connect(shimmerGain)
    shimmerGain.connect(master)

    tone.start(begin)
    shimmer.start(begin)
    tone.stop(begin + duration)
    shimmer.stop(begin + duration)
  })
}
