<template>
  <g class="theater-actor" :class="`actor-${animal}`" :opacity="pose.opacity" :transform="`translate(${pose.x} ${pose.y})`">
    <g :transform="`rotate(${pose.lean} 50 91) translate(0 ${91 * (1 - pose.squash)}) scale(1 ${pose.squash})`" stroke="#758697" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">
      <g class="actor-tail" :transform="`rotate(${pose.tail} 69 80)`">
        <template v-if="animal === 'fox'">
          <path d="M64 83C85 94 105 75 91 51 92 66 76 60 69 72Z" :fill="coat"/>
          <path d="M91 51C92 61 85 64 80 66L91 75C97 68 96 59 91 51Z" fill="#FFF7E8" stroke="none"/>
        </template>
        <template v-else><path d="M69 82C89 87 96 68 85 64" stroke-width="9"/><path d="M69 82C89 87 96 68 85 64" stroke="#C8BDAA" stroke-width="5.5"/></template>
      </g>
      <g class="actor-torso"><path d="M35 63C26 71 26 82 31 88 37 94 63 94 69 88 74 82 74 71 65 63Z" :fill="coat"/><ellipse cx="50" cy="79" rx="12" ry="11" fill="#F8F5EC" stroke="none"/></g>
      <path d="M33 68Q50 74 67 68L65 74Q50 80 35 74Z" fill="#9BB9CD" stroke="none"/>
      <path :transform="`rotate(${pose.tail * -.24} 43 75)`" d="M39 74 36 85 43 83 46 76" fill="#9BB9CD" stroke="none"/>
      <circle cx="51" cy="75" r="2.8" fill="#D6CBB4" stroke="#A99D87" stroke-width=".8"/>
      <g v-if="!holding" class="actor-paw paw-left" :transform="`rotate(${pose.pawLeft} 35 72)`"><path d="M34 74 33 86" :stroke="coat" stroke-width="8"/><ellipse cx="36" cy="89" rx="9" ry="4.5" fill="#F8F5EC"/><path d="M34 88v2m4-2v2" stroke-width=".8" opacity=".5"/></g>
      <g v-if="!holding" class="actor-paw paw-right" :transform="`rotate(${pose.pawRight} 65 72)`"><path d="M66 74 66 86" :stroke="coat" stroke-width="8"/><ellipse cx="64" cy="89" rx="9" ry="4.5" fill="#F8F5EC"/><path d="M62 88v2m4-2v2" stroke-width=".8" opacity=".5"/></g>
      <g class="actor-head" :transform="`translate(${pose.headX} ${pose.headY}) rotate(${pose.head} 50 65)`">
        <g class="actor-ear ear-left" :transform="`rotate(${pose.earLeft} 33 31)`"><path :d="animal === 'fox' ? 'M22 39 20 12Q20 9 24 12L43 29Z' : 'M23 40 24 17Q24 13 28 16L43 29Z'" :fill="coat"/><path d="M28 32 28 22 37 29" fill="#E6AF9E" stroke="none"/></g>
        <g class="actor-ear ear-right" :transform="`rotate(${pose.earRight} 68 31)`"><path :d="animal === 'fox' ? 'M58 29 77 12Q81 9 81 13L78 42Z' : 'M58 29 73 16Q77 13 77 17L79 41Z'" :fill="coat"/><path d="M63 29 72 22 73 33" fill="#E6AF9E" stroke="none"/></g>
        <path :d="animal === 'fox' ? 'M22 37Q27 25 50 25 73 25 78 38L83 48Q74 66 50 69 27 66 17 48Z' : 'M22 38Q27 25 50 25 73 25 78 38C87 57 76 69 50 69S13 57 22 38Z'" :fill="coat"/>
        <template v-if="animal === 'cat'">
          <g fill="#C8BDAA" stroke="none"><path d="M38 26Q40 40 44 36L46 25ZM49 25Q50 38 54 35L56 25Z"/><path d="M21 43 29 46 21 49ZM22 52 29 54 25 58Z"/></g>
          <g class="actor-eyes" :transform="`translate(0 ${46 * (1 - pose.blink)}) scale(1 ${pose.blink})`" fill="#596F80" stroke="none">
            <ellipse cx="37" cy="46" rx="2.5" :ry="pose.expression === 'surprised' ? 4.3 : 3.3"/><ellipse cx="63" cy="46" rx="2.5" :ry="pose.expression === 'surprised' ? 4.3 : 3.3"/>
            <circle cx="37.7" cy="44.8" r=".8" fill="#FFF"/><circle cx="63.7" cy="44.8" r=".8" fill="#FFF"/>
          </g>
          <path v-if="pose.expression === 'curious'" d="m32 39 7-2m21 0 7 2" stroke-width="1.1" opacity=".65"/>
          <g fill="#D3B3B7" stroke="none" opacity=".65"><ellipse cx="29" cy="54" rx="5" ry="2.6"/><ellipse cx="71" cy="54" rx="5" ry="2.6"/></g>
          <path d="M47 53Q50 51 53 53 53 55 50 56 47 55 47 53Z" fill="#B995A1" stroke="none"/>
          <ellipse v-if="pose.jaw > 1" class="actor-mouth" cx="50" cy="60" rx="3.4" :ry="Math.min(5, pose.jaw * .3)" fill="#986D7B" stroke="#A57F89" stroke-width="1"/>
          <path v-else d="M50 56V58M45.5 58Q48 61 50 58 52 61 54.5 58" stroke-width="1.2" fill="none"/>
          <path d="M26 53 17 51M26 57 18 58M74 53 83 51M74 57 82 58" stroke-width="1" opacity=".5"/>
        </template>
        <template v-else>
          <path d="M21 46Q31 43 48 51 65 43 80 46 74 63 50 67 29 64 21 46Z" fill="#FFF7E8" stroke="none"/>
          <g class="actor-eyes" :transform="`translate(0 ${45 * (1 - pose.blink)}) scale(1 ${pose.blink})`" fill="#596F80" stroke="none">
            <ellipse cx="37" cy="45" rx="2.4" ry="3.1"/><ellipse cx="62" cy="45" rx="2.4" ry="3.1"/>
            <circle cx="37.7" cy="43.9" r=".8" fill="#fff"/><circle cx="62.7" cy="43.9" r=".8" fill="#fff"/>
          </g>
          <g fill="#E3BAB6" opacity=".6" stroke="none"><ellipse cx="28" cy="53" rx="4" ry="2"/><ellipse cx="70" cy="53" rx="4" ry="2"/></g>
          <path d="M38.5 52Q42 50.5 45.5 52Q45 55 42 55.5 39 55 38.5 52Z" fill="#7E8190" stroke="none"/>
          <path d="M42 55.5V57" stroke="#A08C94" stroke-width=".9"/>
          <g class="actor-jaw" :data-angle="pose.jaw">
            <template v-if="pose.jaw > 1">
              <path class="actor-mouth-cavity" :d="cavity" fill="#BA8791" stroke="none"/>
              <ellipse v-if="pose.jaw > 12" cx="42" :cy="59 + opening * .65" rx="2.1" ry=".9" fill="#E9B4BA" stroke="none"/>
            </template>
            <path v-else d="M38 57Q40 59.5 42 57 44 59.5 46 57" stroke="#A08C94" stroke-width="1" fill="none"/>
          </g>
        </template>
      </g>
    </g>
  </g>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ActorPose } from '../companion/motion'
const props = defineProps<{ animal: 'cat' | 'fox'; pose: ActorPose; holding?: boolean }>()
const coat = computed(() => props.animal === 'fox' ? '#DFAD89' : '#F3ECDD')
// A small rounded mouth stays inside the cream muzzle, even at full opening.
const opening = computed(() => Math.min(5.5, props.pose.jaw * .18))
const cavity = computed(() => `M38 57Q42 59 46 57Q47 ${60 + opening.value} 42 ${60 + opening.value}Q37 ${60 + opening.value} 38 57Z`)
</script>
