<template>
  <g stroke="#758697" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="50" cy="93" rx="26" ry="3" fill="#A58B71" opacity=".12" stroke="none" />
    <g v-if="animal !== 'bear'" :class="animal === 'fox' ? 'companion-fox-tail' : 'companion-tail cat-tail'">
      <path v-if="animal === 'fox'" d="M65 84C88 90 99 72 89 53 88 66 72 62 68 73Z" fill="#DF9567" />
      <path v-if="animal === 'fox'" d="M89 53C88 61 81 63 77 66L88 74C93 68 93 60 89 53Z" fill="#FFF7E8" stroke="none" />
      <path v-else d="M70 83C91 87 94 65 84 65" fill="none" stroke="#758697" stroke-width="9" />
      <path v-if="animal === 'cat'" d="M70 83C91 87 94 65 84 65" fill="none" :stroke="pink ? '#C2A6B2' : '#C8BDAA'" stroke-width="5.5" />
    </g>
    <path d="M35 63C26 71 26 82 31 88 37 94 63 94 69 88 74 82 74 71 65 63Z" :fill="coat" />
    <ellipse cx="50" cy="79" rx="12" ry="11" fill="#F8F5EC" stroke="none" />
    <path d="M34 74 33 83M66 74 67 83" opacity=".5" />
    <g v-if="animal === 'bear'">
      <circle cx="26" cy="28" r="11" :fill="coat" /><circle cx="74" cy="28" r="11" :fill="coat" />
      <circle cx="26" cy="28" r="5.6" fill="#E9BA9B" stroke="none" /><circle cx="74" cy="28" r="5.6" fill="#E9BA9B" stroke="none" />
      <path d="M20 46C20 25 34 22 50 22S80 25 80 46C83 64 69 71 50 71S17 64 20 46Z" :fill="coat" />
      <ellipse cx="50" cy="54" rx="15" ry="11" fill="#F9E7CB" stroke="none" />
    </g>
    <g v-else>
      <path :d="animal === 'fox' ? 'M21 40 19 12Q20 9 24 12L42 25Q50 23 58 25L76 12Q80 9 81 13L79 40 85 49Q76 68 50 72 24 68 15 49Z' : 'M21 39 23 16Q24 12 28 15L42 25Q50 23 58 25L72 15Q76 12 77 16L79 39C88 58 75 70 50 70S12 58 21 39Z'" :fill="coat" />
      <path d="M27 33 28 21 37 28M63 28 72 21 73 33" fill="#E6AF9E" stroke="none" />
      <path v-if="animal === 'fox'" d="M18 46Q30 41 50 53 70 41 82 46 75 65 50 69 25 65 18 46Z" fill="#F8F5EC" stroke="none" />
      <g v-else :fill="pink ? '#C2A6B2' : '#C8BDAA'" stroke="none">
        <path d="M38 26Q40 40 44 36L46 25ZM49 24Q50 38 54 35L56 25Z" />
        <path d="M20 43 29 46 20 49ZM21 52 29 54 24 58Z" />
      </g>
    </g>
    <g class="companion-eye cat-eye" fill="#596F80" stroke="none">
      <ellipse cx="37" cy="46" rx="2.5" ry="3.3" /><ellipse cx="63" cy="46" rx="2.5" ry="3.3" />
      <circle cx="37.7" cy="44.8" r=".8" fill="#FFF" /><circle cx="63.7" cy="44.8" r=".8" fill="#FFF" />
    </g>
    <g fill="#D3B3B7" stroke="none" opacity=".65"><ellipse cx="29" cy="54" rx="5" ry="2.6" /><ellipse cx="71" cy="54" rx="5" ry="2.6" /></g>
    <path d="M47 53Q50 51 53 53 53 55 50 56 47 55 47 53Z" :fill="animal === 'cat' ? '#B995A1' : '#667E8F'" stroke="none" />
    <path d="M50 56V58M45.5 58Q48 61 50 58 52 61 54.5 58" stroke-width="1.3" fill="none" />
    <path v-if="animal === 'cat'" d="M26 53 17 51M26 57 18 58M74 53 83 51M74 57 82 58" stroke-width="1.1" opacity=".55" />
    <path d="M33 68Q50 74 67 68L65 74Q50 80 35 74Z" :fill="animal === 'fox' ? '#9DB5C6' : '#9BB9CD'" stroke="none" />
    <path class="companion-scarf cat-scarf" d="M38 74 36 85 43 83 46 76" :fill="animal === 'fox' ? '#9DB5C6' : '#9BB9CD'" stroke="none" />
    <circle cx="51" cy="75" r="2.8" fill="#D6CBB4" stroke="#A99D87" stroke-width=".8" />
    <ellipse cx="37" cy="89" rx="9" ry="4.5" :fill="animal === 'bear' ? '#F9E7CB' : '#F8F5EC'" /><ellipse cx="63" cy="89" rx="9" ry="4.5" :fill="animal === 'bear' ? '#F9E7CB' : '#F8F5EC'" />
    <path d="M35 88V90M39 88V90M61 88V90M65 88V90" stroke-width=".8" opacity=".5" />
    <g v-if="speaking" class="companion-waves" fill="none"><path d="M83 39Q90 45 83 51" /><path d="M89 34Q100 45 89 56" /></g>
  </g>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ animal?: 'cat' | 'bear' | 'fox'; speaking?: boolean; pink?: boolean }>(), { animal: 'cat', speaking: false, pink: false })
const coat = computed(() => ({ cat: props.pink ? '#E2CCD3' : '#F3ECDD', bear: '#CCC1AF', fox: '#CDB9A3' })[props.animal])
</script>
