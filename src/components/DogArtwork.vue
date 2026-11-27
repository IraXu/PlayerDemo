<template>
  <g class="dog-peeker" :stroke="outline" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">
    <g class="dog-body">
      <path v-if="variant === 'cream'" d="M67 83C81 85 87 79 84 73" fill="none" stroke="#BA9C80" stroke-width="6"/>
      <g v-else-if="variant === 'stubborn'">
        <path d="M67 84C85 89 92 76 83 71 74 66 69 76 77 79" fill="none" stroke="#C59162" stroke-width="8"/>
        <path d="M83 71C77 68 73 71 74 75" fill="none" stroke="#F4E4C9" stroke-width="5"/>
      </g>
      <path v-else d="M67 83C83 88 89 75 81 72 75 70 75 77 80 78" fill="none" stroke="#95A6B5" stroke-width="6"/>
      <path d="M35 64C29 70 28 80 32 87 38 93 62 93 68 87 72 80 71 70 65 64Z" :fill="coat"/>
      <path d="M44 70Q50 74 56 70L60 87Q50 92 40 87Z" fill="#FAF7EF" stroke="none"/>
      <path v-if="variant !== 'stubborn'" d="M35 76 34 85m31-9 1 9" opacity=".45"/>
      <g v-else fill="none"><path d="M34 78Q45 87 63 79M66 78Q56 86 39 80" stroke="#FAF7EF" stroke-width="5"/><path d="M38 80 44 82m12 0 6-2" stroke-width=".9" opacity=".6"/></g>
      <ellipse cx="37" cy="89" rx="8" ry="4.2" fill="#FAF7EF"/><ellipse cx="63" cy="89" rx="8" ry="4.2" fill="#FAF7EF"/>
      <path d="M35 88v2m4-2v2m22-2v2m4-2v2" stroke-width=".7" opacity=".55"/>
      <path d="M33 68Q50 74 67 68L65 74Q50 80 35 74Z" :fill="accessory" stroke="none"/>
      <path v-if="variant === 'cream'" d="M46 74Q34 67 34 75T46 77M53 74Q66 67 66 75T53 77" :fill="accessory" stroke="#B38F91" stroke-width=".8"/>
      <path v-else d="m43 75 9 11 8-11" :fill="accessory" stroke="none"/>
      <circle cx="50" cy="75" r="2.8" :fill="variant === 'cream' ? '#E9CBC5' : '#DDCFAC'" stroke-width=".7"/>
    </g>
    <g class="dog-head">
      <template v-if="variant === 'cream'">
        <g class="dog-ear left-ear">
          <path d="M29 31C18 26 11 34 11 47 8 57 11 69 19 71 27 72 31 61 31 49Z" fill="#C4A084"/>
          <path d="M20 39Q14 49 18 61" fill="none" stroke="#E0C1A3" stroke-width="2.3"/>
        </g>
        <g class="dog-ear right-ear">
          <path d="M71 31C82 26 89 34 89 47 92 57 89 69 81 71 73 72 69 61 69 49Z" fill="#C4A084"/>
          <path d="M80 39Q86 49 82 61" fill="none" stroke="#E0C1A3" stroke-width="2.3"/>
        </g>
        <path d="M22 42C22 28 34 24 44 25Q47 21 51 25 58 22 61 27C74 27 79 35 78 47 83 61 72 71 50 72 28 71 17 62 22 48Z" :fill="coat"/>
        <path d="M44 29Q40 34 43 37M51 29Q48 34 51 36" fill="none" stroke="#E2CBB0" stroke-width="1.4"/>
        <path d="M27 43Q31 39 36 41m28 0q5-2 9 2" fill="none" stroke="#B79C82" stroke-width="1.25"/>
      </template>
      <template v-else-if="variant === 'stubborn'">
        <g class="dog-ear left-ear">
          <path d="M25 38 25 21Q26 17 29 20L40 31Z" :fill="coat"/>
          <path d="m29 31 0-7 7 7Z" fill="#DDB09B" stroke="none"/>
        </g>
        <g class="dog-ear right-ear">
          <path d="M60 31 71 20Q74 17 75 21L75 38Z" :fill="coat"/>
          <path d="m64 31 7-7 0 7Z" fill="#DDB09B" stroke="none"/>
        </g>
        <path d="M24 41C23 30 36 27 50 28S77 30 76 41Q79 46 80 50L84 54 80 57 82 60C76 68 64 73 50 73S24 68 18 60L20 57 16 54 20 50Q21 46 24 41Z" :fill="coat"/>
        <path d="M21 51Q29 47 35 53L43 56Q50 52 57 56L65 53Q71 47 79 51L77 60C71 68 60 71 50 71S29 68 23 60Z" fill="#FFF5E3" stroke="none"/>
        <g fill="#F8E8CB" stroke="none"><ellipse cx="34" cy="39" rx="4" ry="2.3" transform="rotate(14 34 39)"/><ellipse cx="66" cy="39" rx="4" ry="2.3" transform="rotate(-14 66 39)"/></g>
      </template>
      <template v-else>
        <g class="dog-ear left-ear">
          <path d="M24 38C20 31 20 16 24 13 28 12 38 23 40 30Z" :fill="coat"/>
          <path d="M26 21Q25 28 28 32L34 29Z" fill="#D8BAB7" stroke="none"/>
        </g>
        <g class="dog-ear right-ear">
          <path d="M60 30C62 23 72 12 76 13 80 16 80 31 76 38Z" :fill="coat"/>
          <path d="M74 21Q75 28 72 32L66 29Z" fill="#D8BAB7" stroke="none"/>
        </g>
        <path d="M23 40C23 29 36 25 50 26 64 25 77 29 77 40L80 49 77 52 80 55C77 66 64 73 50 73S23 66 20 55L23 52 20 49Z" :fill="coat"/>
        <path d="M24 46C29 42 35 43 40 48 45 50 45 36 48 32Q50 29 52 32C55 36 55 50 60 48 65 43 71 42 76 46L76 54C74 65 63 70 50 70S26 65 24 54Z" fill="#F8F7F0" stroke="none"/>
        <path v-if="variant !== 'stubborn'" d="M30 38Q34 36 38 38m24 0q4-2 8 0" fill="none" stroke="#E9EDE8" stroke-width="2.5"/>
      </template>
      <path v-if="variant === 'stubborn'" d="m30 39 10 4m20 0 10-4" fill="none" stroke="#806B58" stroke-width="2.5"/>
      <g v-if="variant !== 'stubborn'" class="dog-eyes" stroke="none">
        <ellipse cx="35" cy="48" rx="2.7" ry="3.7" :fill="variant === 'cream' ? '#665F59' : '#586E80'"/>
        <ellipse cx="65" cy="48" rx="2.7" ry="3.7" :fill="variant === 'cream' ? '#665F59' : '#586E80'"/>
        <path v-if="variant === 'husky'" d="M33.3 49.5Q35 52 36.7 49.5m26.6 0q1.7 2.5 3.4 0" fill="none" stroke="#A0C2D3" stroke-width="1.1"/>
        <circle cx="35.8" cy="46.7" r=".9" fill="#FFFDF7"/><circle cx="65.8" cy="46.7" r=".9" fill="#FFFDF7"/>
      </g>
      <g v-if="variant === 'stubborn'" class="dog-eyes">
        <path d="M30 46Q35 45 40 47L39 51Q35 54 31 51ZM60 47Q65 45 70 46L69 51Q65 54 61 51Z" fill="#F8F7F0" stroke="none"/>
        <ellipse cx="36" cy="49" rx="2.2" ry="2.8" fill="#705B48" stroke="none"/><ellipse cx="66" cy="49" rx="2.2" ry="2.8" fill="#705B48" stroke="none"/>
        <path d="M30 46 40 48m20 0 10-2" stroke="#806B58" stroke-width="1.5"/>
        <circle cx="36.5" cy="48.5" r=".65" fill="#FFF" stroke="none"/><circle cx="66.5" cy="48.5" r=".65" fill="#FFF" stroke="none"/>
      </g>
      <g fill="#D9A9A8" stroke="none" opacity=".5"><ellipse cx="28" cy="55" rx="4.7" ry="2.6"/><ellipse cx="72" cy="55" rx="4.7" ry="2.6"/></g>
      <path d="M50 55C43 50 35 54 36 60 36 66 44 68 50 65 56 68 64 66 64 60 65 54 57 50 50 55Z" fill="#FFFBF1" stroke="none"/>
      <path d="M46 54Q50 52 54 54C55 56 52 58 50 58S45 56 46 54Z" :fill="variant === 'cream' ? '#7D7169' : variant === 'stubborn' ? '#76604E' : '#657786'" stroke="none"/>
      <path d="M48 54.5 49.8 54.2" stroke="#FFF9EF" stroke-width=".8" opacity=".7"/>
      <path v-if="variant !== 'stubborn'" d="M50 58v2m-6 0q2 4 6 1 4 3 6-1" fill="none" stroke-width="1.15"/>
      <path v-if="variant !== 'stubborn'" d="M49 63Q52 64 55 63L54 67Q51 70 49 67Z" fill="#DEA9AF" stroke="#BA9295" stroke-width=".8"/>
      <path v-if="variant !== 'stubborn'" d="M52 64.5v2" stroke="#BF9097" stroke-width=".65"/>
      <g v-if="variant === 'stubborn'" fill="none"><path d="M50 58v2m-7 3q7-3 14-1" stroke-width="1.3"/><path d="m54 62 1 3 2-3" fill="#FFFEF8" stroke-width=".7"/></g>
      <g v-if="variant === 'cream'" fill="#C8AD91" stroke="none" opacity=".65"><circle cx="40" cy="58" r=".65"/><circle cx="42.5" cy="60" r=".65"/><circle cx="60" cy="58" r=".65"/><circle cx="57.5" cy="60" r=".65"/></g>
    </g>
    <g v-if="leashed" class="dog-collar" fill="none">
      <path d="M34 69Q50 76 66 69L65 73Q50 80 35 73Z" fill="#9BB9CD" stroke="#718CA1" stroke-width="1"/>
      <circle :cx="collarX" :cy="DOG_COLLAR.y" r="2.5" fill="#F4E6C4" stroke="#A9997A" stroke-width="1"/>
    </g>
  </g>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { DogStyle } from '../companion/selection'
import { DOG_COLLAR } from '../companion/dogWalk'
const props = defineProps<{ variant: DogStyle; leashed?: boolean; leashSide?: 'left' | 'right' }>()
const collarX = computed(() => props.leashSide === 'right' ? 100 - DOG_COLLAR.x : DOG_COLLAR.x)
const coat = computed(() => props.variant === 'cream' ? '#EEDCC2' : props.variant === 'stubborn' ? '#D6A374' : '#9FAFBD')
const outline = computed(() => props.variant === 'cream' ? '#938579' : props.variant === 'stubborn' ? '#9B8069' : '#758697')
const accessory = computed(() => props.variant === 'cream' ? '#D3A7A5' : props.variant === 'stubborn' ? '#BF8E83' : '#A2BFB7')
</script>
