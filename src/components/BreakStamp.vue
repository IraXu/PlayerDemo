<template>
  <svg class="break-stamp" viewBox="0 0 100 76" fill="none" aria-hidden="true">
    <g stroke="#809AAD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="kind === 'note'"><path d="M29 13h43v48H29Z" fill="#FAF8EF"/><path d="M35 9h43v48H35Z" fill="#DFEAF1"/><path d="M45 25h23M45 32h18M45 39h21"/><circle cx="64" cy="49" r="5" fill="#C7D5CC" stroke="none"/></template>
      <template v-else-if="kind === 'cat'"><path d="M23 43h55v21H23Z" fill="#C4D6E2" stroke="none"/><path d="M31 43V24l13 8q7-3 14 0l13-8v19" fill="#FAF8EF"/><path d="M41 40h2M58 40h2M49 46h5M18 53h65"/><path d="M34 52q0-11 12-1v6H34ZM57 52q0-11 12-1v6H57Z" fill="#FAF8EF"/><path d="M81 27h5M83 19v4" stroke="#B8C8CE"/></template>
      <template v-else-if="kind === 'photo'"><path d="m26 16 48-5 6 49-48 5Z" fill="#F6F2E8"/><path d="M25 19h49v47H25Z" fill="#FAFAF5"/><path d="M30 24h39v30H30Z" fill="#CADDEA" stroke="none"/><circle cx="58" cy="33" r="5" fill="#F6F3E5" stroke="none"/><path d="m30 54 12-14 10 9 7-7 10 12" fill="#B6C7BC" stroke="none"/><path d="M42 60h15" stroke="#B4C8D5"/></template>
      <template v-else-if="kind === 'tree'"><path d="M36 64V36q0-17 15-20 17 3 17 20v28Z" fill="#C8D5C9"/><path d="M49 19q-5 15-4 25M58 23q6 11 4 25" stroke="#A9BCAD"/><path d="M43 64V49q0-10 9-10t9 10v15" fill="#7F9C8B" stroke="none"/><path d="M28 65h48M37 36l-8-7M67 32l8-6" stroke="#9AB09F"/><path d="M22 27q-4-11 7-14 6 12-7 14ZM73 26q0-12 12-11-1 12-12 11Z" fill="#BECFC0" stroke="none"/><path d="m49 48 3 2 3-2" stroke="#D9E4D9"/></template>
      <template v-else><rect x="22" y="23" width="58" height="39" rx="2" fill="#E4E9E5"/><path d="m23 24 28 23 28-23M23 61l20-20M79 61 59 41"/><path d="M37 13h28v29H37Z" fill="#FAF7EF"/><path d="M44 23h14M44 29h9" stroke="#C2AEB8"/><path d="m23 24 28 23 28-23" fill="#DFE8ED"/></template>
    </g>
  </svg>
</template>
<script setup lang="ts">
defineProps<{kind:'note'|'cat'|'photo'|'letter'|'tree'}>()
</script>
