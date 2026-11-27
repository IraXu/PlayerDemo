<template>
  <button ref="dogRef" class="dog-intruder" :class="{ busy: active, dispatched: active && !['notice', 'run'].includes(phase) }" :style="dogPosition" :disabled="active" type="button" :data-dog-style="dogStyle" :aria-label="`${dogNames[dogStyle]}，点击看猫猫遛狗，再一脚把它送飞`" @click="start">
    <span :key="appearance" class="dog-hideout" aria-hidden="true">
      <span class="sneak-shadow"/>
      <span class="dog-window">
        <svg class="dog-art" viewBox="0 0 100 100" fill="none">
          <DogArtwork :variant="dogStyle"/>
        </svg>
      </span>
      <span class="dog-ledge"/>
      <svg class="peek-paws" viewBox="0 0 100 100" fill="none" :stroke="dogStyle === 'cream' ? '#938579' : dogStyle === 'stubborn' ? '#9B8069' : '#758697'" stroke-width="1.5" stroke-linecap="round"><g class="peek-paw left-paw"><path d="M23 90c0-9 15-9 15 0v4c-1 5-14 5-15 0Z" :fill="dogStyle === 'cream' ? '#FFFBF1' : '#F8F7F0'"/><path d="M28 91v4m5-4v4"/></g><g class="peek-paw right-paw"><path d="M62 90c0-9 15-9 15 0v4c-1 5-14 5-15 0Z" :fill="dogStyle === 'cream' ? '#FFFBF1' : '#F8F7F0'"/><path d="M67 91v4m5-4v4"/></g></svg>
    </span>
    <span class="dog-sweat" aria-hidden="true">΄</span>
    <span :key="`hint-${appearance}`" class="dog-hint" aria-hidden="true"><span>嘘…先看一眼</span><span>没发现我吧…</span><span>我只是路过！</span></span>
  </button>
  <Teleport to="body">
    <div v-if="active" class="dog-show" :class="[phase, { quiet: reduced }]" aria-hidden="true">
      <div v-show="phase !== 'walk'" class="chase-cat" :style="catStyle">
        <div class="cat-performance" :class="{ 'faces-left': dogOnLeft }"><svg viewBox="0 0 100 100" fill="none"><AnimalArtwork :speaking="phase === 'roar'"><template #face-details><path v-if="phase !== 'home'" d="m31 39 12 4m14 0 12-4" stroke="#785d5c" stroke-width="3"/><ellipse v-if="phase === 'roar'" cx="50" cy="61" rx="7" ry="6" fill="#845e64" stroke="none"/></template></AnimalArtwork></svg><svg class="kick-foot" viewBox="0 0 60 32" fill="none"><path d="M4 11Q18 5 34 9L47 6Q58 7 56 18 56 28 44 26L29 23 5 25" fill="#F3ECDD" stroke="#758697" stroke-width="2"/><path d="m45 12 3 3m-5 3 3 3" stroke="#758697" stroke-linecap="round"/></svg><span class="anger">╬</span></div>
        <span v-if="phase === 'notice'" class="notice">！发现破狗！</span>
      </div>
      <svg v-if="phase === 'walk'" class="walk-actors" width="100%" height="100%" fill="none">
        <g :transform="`translate(${walkFrame.cat.x} ${walkFrame.cat.y}) scale(${walkSize.cat / 100})`">
          <AnimalArtwork/>
          <ellipse :cx="catHandX" :cy="CAT_LEASH.y" rx="5" ry="3" fill="#F8F5EC" stroke="#758697" stroke-width="1.4"/>
          <ellipse :cx="catHandX" :cy="CAT_LEASH.y" rx="3" ry="4.5" fill="none" stroke="#718CA1" stroke-width="1.5"/>
        </g>
        <g :transform="`translate(${walkFrame.dog.x} ${walkFrame.dog.y}) scale(${walkSize.dog / 100})`"><DogArtwork :variant="dogStyle" leashed :leash-side="dogOnLeft ? 'right' : 'left'"/></g>
        <path :d="walkLeash" fill="none" stroke="#FAFBF8" stroke-width="4" stroke-linecap="round"/>
        <path :d="walkLeash" fill="none" stroke="#819EAF" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-if="['kick', 'roar', 'home'].includes(phase)" ref="flyingDogRef" class="walking-dog" :style="flyingDogStyle" viewBox="0 0 100 100" fill="none"><DogArtwork :variant="dogStyle"/></svg>
      <div v-if="phase === 'walk'" class="roar-caption walk-caption" :class="{ below: captionBelow }" :style="captionStyle"><strong>臭小狗，跟我走</strong></div>
      <div v-if="phase === 'run'" class="dust" :style="impactStyle">≋ ≋ ≋</div>
      <div v-if="['kick', 'roar'].includes(phase)" class="impact" :style="impactStyle"><span class="impact-ring"/><i v-for="i in 12" :key="i" :style="{ '--a': `${i * 30}deg`, '--d': `${65 + i % 3 * 24}px` }"/><b v-if="phase === 'kick'">走你！</b><span class="orbit">✦　✧　✦</span></div>
      <div v-if="phase === 'roar'" class="roar-caption" :class="{ below: captionBelow }" :style="captionStyle" role="presentation"><span>哈哈哈哈，遛完啦！</span><strong>给本喵飞<span class="caption-swash">～</span></strong></div>
    </div>
    <div class="dog-announcement" role="status" aria-live="polite">{{ announcement }}</div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalArtwork from './AnimalArtwork.vue'
import DogArtwork from './DogArtwork.vue'
import { createDogPicker, dogNames, type DogStyle } from '../companion/selection'
import { CAT_LEASH, DOG_COLLAR, createWalkRoute, sampleWalkPair, leashPath } from '../companion/dogWalk'
import { playYowl, unlockSoundEffects } from '../sfx'
const props = defineProps<{ companion: { dispatch: () => DOMRect | undefined; returnHome: () => void } | null }>()
const dogRef = ref<HTMLButtonElement>()
const dogPosition = ref<Record<string, string>>({ visibility: 'hidden' })
const appearance = ref(0)
const dogStyle = ref<DogStyle>('cream')
const pickDog = createDogPicker()
let lastSpot: { x: number; y: number } | null = null
function appear(chooseDog = true) {
  const size = window.innerWidth <= 600 ? 57 : 66
  const minX = Math.min(96, Math.max(12, window.innerWidth - size - 24))
  const maxX = Math.max(minX, window.innerWidth - size - 24)
  const minY = Math.min(120, Math.max(36, window.innerHeight - size - 24))
  const maxY = Math.max(minY, window.innerHeight - size - 100)
  // Pick from several candidates so consecutive visits don't land beside each other.
  let spot = { x: minX, y: minY }
  for (let attempt = 0; attempt < 12; attempt++) {
    spot = { x: minX + Math.random() * (maxX - minX), y: minY + Math.random() * (maxY - minY) }
    if (!lastSpot || Math.hypot(spot.x - lastSpot.x, spot.y - lastSpot.y) > Math.min(160, window.innerWidth * .3)) break
  }
  lastSpot = spot
  dogPosition.value = { left: `${spot.x}px`, top: `${spot.y}px`, right: 'auto', bottom: 'auto', '--peek-direction': spot.x < window.innerWidth / 2 ? '-1' : '1' }
  // Choose once per appearance so the same dog stays through the whole interaction.
  if (chooseDog) dogStyle.value = pickDog()
  appearance.value++
}
function onResize() { if (active.value) finish(); else appear(false) }

const dogOnLeft = ref(false)
const catHandX = computed(() => dogOnLeft.value ? 100 - CAT_LEASH.x : CAT_LEASH.x)
const dogCollarX = computed(() => dogOnLeft.value ? 100 - DOG_COLLAR.x : DOG_COLLAR.x)
const flyingDogRef = ref<SVGSVGElement>()
const walkSize = ref({ cat: 78, dog: 66 })
const walkTime = ref(0)
const walkFrame = ref({ cat: { x: 0, y: 0 }, dog: { x: 0, y: 0 } })
const flyingDogStyle = computed(() => ({ left: `${walkFrame.value.dog.x}px`, top: `${walkFrame.value.dog.y}px`, width: `${walkSize.value.dog}px`, height: `${walkSize.value.dog}px` }))
const walkLeash = computed(() => leashPath(
  { x: walkFrame.value.cat.x + catHandX.value * walkSize.value.cat / 100, y: walkFrame.value.cat.y + CAT_LEASH.y * walkSize.value.cat / 100 },
  { x: walkFrame.value.dog.x + dogCollarX.value * walkSize.value.dog / 100, y: walkFrame.value.dog.y + DOG_COLLAR.y * walkSize.value.dog / 100 }, walkTime.value,
))
let walkRaf = 0
const active = ref(false), phase = ref('notice'), reduced = ref(false), announcement = ref('')
const catStyle = ref<Record<string, string>>({})
const hit = ref({ x: 0, y: 0 })
const captionStyle = ref<Record<string, string>>({})
const captionBelow = ref(false)
const impactStyle = computed(() => ({ left: `${hit.value.x}px`, top: `${hit.value.y}px` }))
let timers: ReturnType<typeof setTimeout>[] = []
let animations: Animation[] = []
let actor: typeof props.companion = null
function later(fn: () => void, ms: number) { timers.push(setTimeout(fn, ms)) }
function finish(respawn = true) {
  cancelAnimationFrame(walkRaf)
  timers.forEach(clearTimeout); timers = []
  animations.forEach(a => a.cancel()); animations = []
  actor?.returnHome(); actor = null
  active.value = false
  if (respawn) appear()
}
function shout() {
  announcement.value = '哈哈哈哈，遛完啦！给本喵飞～'
  playYowl()
}

function start() {
  if (active.value || !props.companion || !dogRef.value) return
  unlockSoundEffects()
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  actor = props.companion
  const home = actor.dispatch()
  if (!home) { actor.returnHome(); actor = null; return }
  const dog = dogRef.value.getBoundingClientRect()
  const dogSize = dogRef.value.offsetWidth
  const dogLeft = parseFloat(dogPosition.value.left!), dogTop = parseFloat(dogPosition.value.top!)
  dogOnLeft.value = dogLeft + dogSize / 2 < window.innerWidth / 2
  let endX = dogOnLeft.value ? dogLeft + dogSize + 14 : Math.max(8, dogLeft - home.width - 14)
  let endY = dogTop + dogSize - home.height
  walkSize.value = { cat: home.width, dog: dogSize }
  const catInset = (home.height - home.width) / 2
  const dogOffset = { x: dogLeft - endX, y: dogTop - endY - catInset }
  const margin = 16
  const route = createWalkRoute({ x: endX, y: endY + catInset }, {
    minX: margin + Math.max(0, -dogOffset.x),
    maxX: Math.max(margin + Math.max(0, -dogOffset.x), window.innerWidth - Math.max(home.width, dogOffset.x + dogSize) - margin),
    minY: Math.min(110, Math.max(margin, window.innerHeight - home.height - 40)),
    maxY: Math.max(110, window.innerHeight - Math.max(home.width, dogSize + dogOffset.y) - 24),
  }, Math.random, dogOnLeft.value ? 'right' : 'left')
  let walkStarted = 0
  function updateWalk(now: number) {
    if (!walkStarted) walkStarted = now
    const progress = Math.min(1, (now - walkStarted) / 4200)
    const pair = sampleWalkPair(route, reduced.value ? 0 : progress, dogOffset)
    const cat = pair.cat
    const t = (now - walkStarted) / 1000
    const catBob = reduced.value ? 0 : -Math.abs(Math.sin(t * 10)) * 2
    const dogBob = reduced.value ? 0 : -Math.abs(Math.sin(t * 12 + .8)) * 2
    walkTime.value = reduced.value ? 0 : t
    walkFrame.value = { cat: { x: cat.x, y: cat.y + catBob }, dog: { x: pair.dog.x, y: pair.dog.y + dogBob } }
    endX = cat.x; endY = cat.y - catInset
    hit.value = { x: walkFrame.value.dog.x + dogSize / 2, y: walkFrame.value.dog.y + dogSize / 2 }
    placeCaption(endX, endY)
    if (phase.value === 'walk' && progress < 1) walkRaf = requestAnimationFrame(updateWalk)
  }
  hit.value = { x: dog.left + dog.width / 2, y: dog.top + dog.height / 2 }
  function placeCaption(x: number, y: number) {
    const captionWidth = Math.min(244, window.innerWidth - 32)
    const anchorX = x + home.width * .55
    const captionX = Math.max(16, Math.min(anchorX - captionWidth * .5, window.innerWidth - captionWidth - 16))
    captionBelow.value = y < 150
    captionStyle.value = {
      left: `${captionX}px`, top: `${captionBelow.value ? y + home.height + 12 : y - 120}px`,
      width: `${captionWidth}px`, '--tail-x': `${Math.max(22, Math.min(captionWidth - 22, anchorX - captionX))}px`,
    }
  }
  placeCaption(endX, endY)
  active.value = true; phase.value = 'notice'; announcement.value = '小猫发现了闯入猫屋的小狗！'
  const put = (x: number, y: number) => { catStyle.value = { left: `${x}px`, top: `${y}px`, width: `${home.width}px`, height: `${home.height}px` } }
  put(home.left, home.top)
  later(() => {
    phase.value = 'run'
    const el = document.querySelector('.dog-show .chase-cat')
    if (el && !reduced.value) animations.push(el.animate([
      { transform: 'translate(0, 0) scale(1.15,.8)', offset: 0 },
      { transform: `translate(${(endX-home.left)*.18}px, ${(endY-home.top)*.18-24}px) scale(1.12,.9)`, offset: .2 },
      { transform: `translate(${endX-home.left-20}px, ${endY-home.top-32}px) rotate(-16deg)`, offset: .83 },
      { transform: `translate(${endX-home.left}px, ${endY-home.top}px) rotate(8deg)`, offset: 1 },
    ], { duration: 850, easing: 'cubic-bezier(.45,0,.7,1)', fill: 'forwards' }))
  }, 450)
  later(() => {
    animations.forEach(a => a.cancel()); animations = []
    put(endX, endY); phase.value = 'walk'
    announcement.value = '臭小狗，跟我走'
    updateWalk(performance.now())
  }, 1300)
  later(() => {
    animations.forEach(a => a.cancel()); animations = []
    cancelAnimationFrame(walkRaf)
    put(endX, endY); phase.value = 'kick'
    // The overlay is mounted on the next Vue update.
    void nextTick(() => { if (active.value && phase.value === 'kick' && flyingDogRef.value) animations.push(flyingDogRef.value.animate(reduced.value ? [{ opacity: 1 }, { opacity: 0 }] : [
      { transform: 'translate(0,0) rotate(0) scale(1)' },
      { transform: 'translate(-8px,4px) rotate(-18deg) scale(1.2,.75)', offset: .08 },
      { transform: `translate(${window.innerWidth-walkFrame.value.dog.x+160}px,-320px) rotate(780deg) scale(.12)`, opacity: 0 },
    ], { duration: reduced.value ? 180 : 1100, easing: 'cubic-bezier(.16,.65,.3,1)', fill: 'forwards' })) })
  }, 5500)
  later(() => { phase.value = 'roar'; shout() }, 5800)
  later(() => {
    phase.value = 'home'
    const el = document.querySelector('.dog-show .chase-cat')
    if (el && !reduced.value) animations.push(el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${home.left-endX}px,${home.top-endY}px)` }], { duration: 850, easing: 'ease-in-out', fill: 'forwards' }))
  }, 8600)
  later(finish, 9500)
}
onMounted(() => { appear(); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', onResize); finish(false) })
</script>

<style scoped>
.dog-intruder{position:fixed;right:clamp(20px,5vw,90px);bottom:clamp(115px,22vh,220px);z-index:9;width:66px;height:66px;padding:0;background:none;border:0;color:#9b8e80;cursor:pointer;transform:rotate(-9deg);transition:filter .2s;isolation:isolate}.dog-hideout{position:absolute;inset:0;pointer-events:none}.dog-window{position:absolute;inset:0 0 10%;overflow:hidden;border-radius:0 0 9px 9px}.dog-art{display:block;width:100%;height:111.111%;overflow:visible}:deep(.dog-peeker){animation:dogEmerge 1.3s both,dogDuck 8.4s 1.3s infinite;animation-timing-function:cubic-bezier(.3,0,.3,1)}:deep(.dog-head){transform-origin:50px 69px;animation:headTip 8.4s 1.3s ease-in-out infinite}:deep(.dog-body){animation:hideBody 1.3s both,bodyDuck 8.4s 1.3s infinite}:deep(.dog-ear){transform-origin:25px 35px;animation:earFlop 8.4s 1.3s infinite}:deep(.right-ear){transform-origin:75px 35px;animation-delay:1.38s}.dog-ledge{position:absolute;left:9%;right:9%;bottom:9%;height:1px;background:linear-gradient(90deg,transparent,#b4a18b99 25%,#b4a18b99 75%,transparent)}.peek-paws{position:absolute;inset:0;width:100%;height:100%;overflow:visible;animation:pawsEmerge 1.3s both,pawsGrip 8.4s 1.3s infinite}.peek-paw{transform-origin:30px 90px}.right-paw{transform-origin:70px 90px;animation:pawFidget 8.4s 1.3s infinite}.busy :deep(.dog-peeker),.busy :deep(.dog-head),.busy :deep(.dog-body),.busy :deep(.dog-ear){animation:none;transform:none;opacity:1}.busy .peek-paws,.busy .dog-ledge{visibility:hidden}.dog-intruder:hover{filter:drop-shadow(0 4px 7px #cbb59466)}.dog-intruder:focus-visible{outline:2px dashed #b99171;outline-offset:7px;border-radius:50%}:deep(.dog-eyes){animation:dogLook 8.4s 1.3s ease-in-out infinite}.dog-intruder.busy svg,.dog-intruder.busy :deep(.dog-eyes){animation-play-state:paused}.dog-hint{position:absolute;bottom:102%;left:50%;width:130px;height:20px;transform:translateX(-50%);white-space:nowrap;font:10px/1.8 sans-serif;color:#a28e7c;letter-spacing:1px;text-align:center;pointer-events:none}.dog-hint>span{position:absolute;inset:0;opacity:0;animation:sneakWhisper 8.4s 1.3s infinite}.dog-hint>span:nth-child(2){animation-name:sneakWhisperSecond}.dog-hint>span:nth-child(3){animation-name:sneakWhisperThird}.sneak-shadow{position:absolute;bottom:4px;left:20%;width:60%;height:5px;border-radius:50%;background:#b5a28a25;filter:blur(1px)}.dog-sweat{position:absolute;right:9px;top:16px;font:bold 32px serif;color:#8eafbf;opacity:0;animation:sneakSweat 8.4s 1.3s infinite}.busy .dog-hint,.busy .dog-sweat{visibility:hidden}.dog-intruder.busy{pointer-events:none}.dog-show{position:fixed;inset:0;pointer-events:none;z-index:1500;overflow:hidden}.chase-cat{position:absolute;will-change:transform}.cat-performance{position:relative;width:100%;height:100%;transform-origin:50% 85%}.cat-performance svg{width:100%;height:100%;overflow:visible}.notice{position:absolute;bottom:100%;left:0;width:max-content;color:#a76250;font:bold 15px sans-serif;animation:pop .3s both}.anger{position:absolute;right:5%;top:-4%;font:bold 27px sans-serif;color:#de795f;animation:angry .25s alternate infinite}.notice .cat-performance{animation:coil .45s both}.run .cat-performance{animation:gallop .13s alternate infinite}.kick .cat-performance{animation:sideKick .4s both}.roar .cat-performance{animation:angry .13s alternate infinite}.home .cat-performance{animation:gallop .18s alternate infinite}.kick-foot{display:none;position:absolute;right:-18px;bottom:5px;font-size:35px;transform:rotate(-65deg)}.cat-performance .kick-foot{width:48px;height:30px;overflow:visible}.kick .kick-foot{display:block;animation:pop .25s both}.run :deep(.animal-paws){transform-box:fill-box;transform-origin:center;animation:pawSprint .13s alternate infinite}.run :deep(.cat-tail){transform-box:fill-box;transform-origin:left bottom;animation:tailSprint .16s alternate infinite}.kick :deep(.animal-paws){transform:rotate(-12deg);transform-origin:50px 80px}.roar :deep(.animal-head){transform-origin:50px 65px;animation:angry .15s alternate infinite}.dust{position:absolute;transform:translate(-110px,20px) rotate(-15deg);color:#cfb78c;font:bold 48px sans-serif;animation:dust .3s infinite}.impact{position:absolute}.impact-ring{position:absolute;width:100px;height:100px;left:-50px;top:-50px;border:5px solid #f7c86c;border-radius:50%;animation:ring .65s both}.impact i{position:absolute;width:24px;height:5px;background:#efb36e;transform:rotate(var(--a));animation:spark .7s both}.impact b{position:absolute;left:-62px;top:-90px;width:130px;font:900 33px sans-serif;color:#b56b50;text-shadow:3px 3px #fff6dd;transform:rotate(-13deg);animation:pop .3s both}.orbit{position:absolute;left:-45px;top:-70px;font-size:24px;color:#dfaf5f;animation:orbit 1s linear infinite}.roar-caption{position:absolute;box-sizing:border-box;padding:16px 22px 17px;background:#fffdf5;border:2px solid #8395a1;border-radius:20px 20px 20px 7px;box-shadow:3px 5px 0 #a5b5bf26;color:#6a7680;text-align:left;transform-origin:var(--tail-x) bottom;animation:caption .38s cubic-bezier(.2,1.35,.4,1) both}.roar-caption::after{content:"";position:absolute;bottom:-8px;left:calc(var(--tail-x) - 6px);width:12px;height:12px;background:#fffdf5;border-right:2px solid #8395a1;border-bottom:2px solid #8395a1;transform:rotate(45deg)}.roar-caption.below{transform-origin:var(--tail-x) top}.roar-caption.below::after{top:-8px;bottom:auto;transform:rotate(225deg)}.roar-caption>span{display:block;font:500 15px/1.6 sans-serif;letter-spacing:1px}.roar-caption strong{display:block;margin-top:3px;color:#ad6955;font:900 27px/1.25 sans-serif;letter-spacing:2px}.caption-swash{display:inline-block;transform:rotate(-10deg);color:#c68c66}.dog-announcement{position:fixed;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@keyframes pawSprint{to{transform:rotate(-18deg) scaleX(.7)}}@keyframes tailSprint{to{transform:rotate(22deg)}}/* The mask stays still; the dog moves behind it so the face never gets sliced. */
@keyframes dogEmerge{0%,12%{transform:translateY(72px)}30%,45%{transform:translateY(43px)}64%,82%{transform:translateY(14px)}100%{transform:translateY(0)}}
@keyframes dogDuck{0%,10%,42%,100%{transform:translateY(0)}15%,24%{transform:translate(-3px,7px)}28%,34%{transform:translate(3px,0)}47%{transform:translateY(5px)}50%,55%{transform:translateY(46px)}60%,66%{transform:translateY(30px)}72%,85%{transform:translateY(14px)}91%{transform:translateY(0)}}
@keyframes headTip{0%,10%,46%,55%,100%{transform:rotate(0)}16%,24%{transform:rotate(-12deg)}29%,40%{transform:rotate(10deg)}63%,69%{transform:rotate(-5deg)}74%,79%{transform:rotate(7deg)}83%,87%{transform:rotate(-4deg)}}
@keyframes hideBody{0%,85%{opacity:0}100%{opacity:1}}
@keyframes bodyDuck{0%,42%,93%,100%{opacity:1}47%,87%{opacity:0}}
@keyframes pawsEmerge{0%,58%{opacity:0;transform:translateY(6px)}70%,100%{opacity:1;transform:translateY(0)}}
@keyframes pawsGrip{0%,42%,93%,100%{opacity:0;transform:translateY(4px)}47%,87%{opacity:1;transform:translateY(0)}}
@keyframes pawFidget{0%,69%,86%,100%{transform:translateY(0)}73%,77%{transform:translateY(3px) rotate(8deg)}80%{transform:translateY(-1px)}}
@keyframes earFlop{0%,44%,56%,100%{transform:rotate(0)}48%{transform:rotate(14deg)}52%{transform:rotate(-7deg)}}
@keyframes dogLook{0%,10%,45%,65%,100%{transform:translateX(0)}15%,24%{transform:translateX(-4px)}28%,42%{transform:translateX(4px)}78%,88%{transform:translateX(0)}90%,93%{transform:translateX(-3px)}}
@keyframes sneakWhisper{0%,3%,27%,100%{opacity:0;translate:0 3px}8%,22%{opacity:1;translate:0 0}}
@keyframes sneakWhisperSecond{0%,27%,47%,100%{opacity:0;translate:0 3px}32%,42%{opacity:1;translate:0 0}}
@keyframes sneakWhisperThird{0%,74%,96%,100%{opacity:0;translate:0 3px}80%,91%{opacity:1;translate:0 0}}
@keyframes sneakSweat{0%,43%,64%,100%{opacity:0;translate:0 0}47%{opacity:.9}58%{opacity:0;translate:3px 13px}}
@keyframes coil{70%{transform:scale(1.2,.7) rotate(-10deg)}100%{transform:scale(.9,1.1)}}@keyframes gallop{from{transform:translateY(3px) rotate(9deg) scale(1.12,.88)}to{transform:translateY(-7px) rotate(-7deg) scale(.94,1.08)}}@keyframes sideKick{0%{transform:rotate(-25deg) scale(.85,1.15)}45%{transform:rotate(28deg) scale(1.3,.85)}100%{transform:rotate(-6deg)}}@keyframes angry{to{transform:translateY(-2px) rotate(4deg)}}@keyframes pop{from{opacity:0;scale:.3}to{opacity:1;scale:1}}@keyframes ring{from{scale:.1;opacity:1}to{scale:2.2;opacity:0}}@keyframes spark{from{transform:rotate(var(--a)) translateX(5px);opacity:1}to{transform:rotate(var(--a)) translateX(var(--d));opacity:0}}@keyframes orbit{to{transform:rotate(360deg)}}@keyframes caption{from{opacity:0;transform:translateY(9px) scale(.82) rotate(-5deg)}to{opacity:1;transform:translateY(0) scale(1) rotate(-2deg)}}@keyframes dust{to{opacity:0;translate:-25px 10px}}
@media(max-width:600px){.dog-intruder{right:22px;width:57px;height:57px;bottom:155px}}
.cat-performance.faces-left{scale:-1 1}.dog-intruder.dispatched{visibility:hidden}.busy .dog-window{overflow:visible}.walk-actors{position:absolute;inset:0;overflow:visible}.walking-dog{position:absolute;overflow:visible}.walk-actors :deep(.dog-peeker),.walk-actors :deep(.dog-head),.walk-actors :deep(.dog-body),.walk-actors :deep(.dog-ear),.walk-actors :deep(.dog-eyes),.walking-dog :deep(.dog-peeker),.walking-dog :deep(.dog-head),.walking-dog :deep(.dog-body),.walking-dog :deep(.dog-ear),.walking-dog :deep(.dog-eyes){animation:none;transform:none;opacity:1}.walk-caption{animation:none;transform:rotate(-2deg)}.walk-caption strong{font-size:20px}

.quiet *{animation:none!important}.quiet .impact i,.quiet .impact-ring,.quiet .dust{display:none}@media(prefers-reduced-motion:reduce){:deep(.dog-peeker),:deep(.dog-head),:deep(.dog-body),:deep(.dog-ear),.peek-paws,.peek-paw,:deep(.dog-eyes),.dog-hint>span,.dog-sweat{animation:none}.peek-paws{opacity:0}.dog-hint>span:first-child{opacity:1}}
</style>
