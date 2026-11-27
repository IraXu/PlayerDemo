<template>
  <svg class="companion-theater" :class="{ 'reduced-motion': reducedMotion }" viewBox="-12 -60 232 160" fill="none" aria-hidden="true" :data-scene="scene" :data-time="elapsed.toFixed(2)">
    <ellipse :cx="frame.cat.x + 50" cy="94" :rx="26 + Math.min(0, frame.cat.y) * .2" ry="3" fill="#A58B71" opacity=".12"/>
    <ellipse v-if="scene !== 'pet'" :cx="frame.fox.x + 50" cy="94" :rx="Math.max(12, 25 + Math.min(0, frame.fox.y) * .2)" ry="3" fill="#A58B71" :opacity="frame.fox.opacity * .12"/>
    <CompanionActor v-if="!frame.foxInFront && scene !== 'pet'" animal="fox" :pose="frame.fox" :holding="(frame.coffee?.held ?? 0) > .1"/>
    <CompanionActor animal="cat" :pose="frame.cat"/>
    <CompanionActor v-if="frame.foxInFront" animal="fox" :pose="frame.fox" :holding="(frame.coffee?.held ?? 0) > .1"/>
    <g v-if="frame.coffee" class="theater-coffee" :transform="`translate(${frame.coffee.x} ${frame.coffee.y}) rotate(${frame.coffee.angle})`" :opacity="frame.coffee.opacity">
      <image :href="coffeePhoto" x="-9.5" y="0" width="17.25" height="34" preserveAspectRatio="xMidYMid meet"/>
      <g v-if="frame.coffee.held > .1" :opacity="frame.coffee.held" fill="#F8F5EC" stroke="#758697" stroke-width="1.2">
        <ellipse cx="-7" cy="23" rx="4.8" ry="3.5" transform="rotate(-12 -7 23)"/>
        <ellipse cx="7" cy="24" rx="4.8" ry="3.5" transform="rotate(12 7 24)"/>
      </g>
      <g v-if="frame.coffee.sip > 0" :opacity="frame.coffee.sip" stroke="#9BB9CD" stroke-width="1" stroke-linecap="round"><path d="m-7-3-3-2m17 2 3-2"/></g>
    </g>
    <g v-if="frame.biteMark > 0" :transform="`translate(${frame.bitePoint.x} ${frame.bitePoint.y})`" :opacity="frame.biteMark * .65">
      <ellipse rx="7" ry="4" fill="#E8B2B9"/>
    </g>
    <g v-if="frame.impact > 0" :transform="`translate(${frame.bitePoint.x} ${frame.bitePoint.y}) scale(${.8 + frame.impact * .4})`" :opacity="frame.impact" stroke="#CCA87A" stroke-width="1.6" stroke-linecap="round">
      <path d="m-12-10-4-4m19-1 1-5m8 13 5-1"/>
    </g>
    <g v-if="frame.sniff > 0" :transform="`translate(${sniffAnchor.x - 14} ${sniffAnchor.y - 8})`" :opacity="frame.sniff" stroke="#AAA1B8" stroke-width="1.2" stroke-linecap="round">
      <path d="m-5-4-4-2m4 7-6 1"/>
    </g>
    <g v-if="frame.sparkle > 0" :opacity="frame.sparkle" transform="translate(135 14)" stroke="#C3A67D" stroke-width="1.4" stroke-linecap="round"><path d="M0-6V6M-6 0H6m11-9v5m-2.5-2.5h5"/></g>
    <g v-if="grapesVisible" class="theater-grapes">
      <g v-for="i in 5" :key="i" :transform="`translate(${48 + i * 13} 68)`">
        <g class="theater-grape" :style="{ '--delay': `${(i - 1) * .17}s`, '--drift': `${(i - 3) * 8}px`, '--spin': `${(i - 3) * 14}deg` }">
          <g transform="scale(.63)">
            <path d="M16 10Q14 3 21 2" stroke="#82986D" stroke-width="2"/>
            <path d="M17 7Q25 1 27 8 22 12 17 7" fill="#A3B586"/>
            <g fill="#A68DBA" stroke="#816E98" stroke-width="1"><circle cx="11" cy="15" r="5"/><circle cx="21" cy="15" r="5"/><circle cx="8" cy="23" r="5"/><circle cx="17" cy="23" r="5"/><circle cx="25" cy="23" r="5"/><circle cx="12" cy="30" r="5"/><circle cx="21" cy="30" r="5"/><circle cx="16" cy="36" r="3.5"/></g>
            <path d="m9 13 2-1m4 9 2-1" stroke="#E9DDF2" stroke-width="2" stroke-linecap="round"/>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CompanionActor from './CompanionActor.vue'
import coffeePhoto from '../assets/props/iced-coffee.webp'
import { actorSpeechAnchor, cues, durations, foxMouth, sampleScene, type BiteTarget, type TheaterScene } from '../companion/motion'
const props = defineProps<{ scene: TheaterScene; target: BiteTarget; reducedMotion: boolean; grapesVisible: boolean }>()
const emit = defineEmits<{ cue: [name: string]; finish: []; anchors: [points: { cat: { x: number; y: number }; fox: { x: number; y: number } }] }>()
const elapsed = ref(0)
const frame = computed(() => sampleScene(props.scene, elapsed.value, props.target, props.reducedMotion))
watch(frame, value => emit('anchors', { cat: actorSpeechAnchor(value.cat), fox: actorSpeechAnchor(value.fox) }), { immediate: true })
const sniffAnchor = computed(() => foxMouth(frame.value.fox))
let raf = 0, previous = 0, cueIndex = 0
function tick(now: number) {
  if (previous && !document.hidden) elapsed.value += Math.max(0, (now - previous) / 1000)
  previous = now
  const list = cues[props.scene]
  while (cueIndex < list.length && elapsed.value >= list[cueIndex]!.at) emit('cue', list[cueIndex++]!.name)
  if (elapsed.value >= durations[props.scene]) { emit('finish'); return }
  raf = requestAnimationFrame(tick)
}
onMounted(() => { raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>
<style scoped>
.companion-theater{position:absolute;left:-12%;bottom:0;width:232%;height:auto;overflow:visible;pointer-events:none}
.theater-grape{opacity:0;animation:theaterGrapeFall 2.7s var(--delay) linear both;transform-origin:10px 24px}
@keyframes theaterGrapeFall{
  0%{opacity:0;transform:translate(0,-150px) rotate(-15deg)}
  8%{opacity:1;transform:translate(0,-145px) rotate(-10deg)}
  24%{transform:translate(calc(var(--drift)*.35),-105px)}
  40%{transform:translate(calc(var(--drift)*.6),0) rotate(var(--spin)) scale(1.12,.82)}
  52%{transform:translate(calc(var(--drift)*.78),-23px) rotate(var(--spin))}
  64%{transform:translate(calc(var(--drift)*.9),0) rotate(var(--spin)) scale(1.05,.94)}
  72%{transform:translate(var(--drift),-7px) rotate(var(--spin))}
  80%,92%{opacity:1;transform:translate(var(--drift),0) rotate(var(--spin))}
  100%{opacity:0;transform:translate(var(--drift),0) rotate(var(--spin))}
}
.reduced-motion .theater-grape{animation:none;opacity:1;transform:translateX(var(--drift))}
</style>
