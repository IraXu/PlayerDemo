<template>
  <g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <template v-if="pose === 'sleep'">
      <path d="M30 88C10 87 10 60 33 58 44 35 91 43 99 68 109 91 84 99 61 94" />
      <path d="M35 65 32 49 48 58Q57 55 64 59L78 51 77 70C84 91 29 96 29 77Q29 70 35 65Z" fill="currentColor" fill-opacity=".06" />
      <path d="M38 73q4 5 8 0M59 73q4 5 8 0M49 79l3 2 3-2M52 81v3M88 70c-16-9-21 13-7 14 11 1 15-14 7-14" />
      <path d="M88 36h9l-9 10h9M102 21h7l-7 8h7" stroke-width="1.8" />
    </template>
    <template v-else-if="pose === 'peek'">
      <path d="M22 86V64L20 35Q20 30 25 33L43 46Q60 40 77 46L95 33Q100 30 100 35L98 64V86" fill="currentColor" fill-opacity=".06" />
      <path d="M36 64q5-6 10 0M74 64q5-6 10 0M56 70l4 3 4-3M60 73v4M54 77q3 4 6 0 3 4 6 0M28 72l-13-2M92 72l13-2M12 93h96" />
      <path d="M32 93v-7c0-10 17-10 17 0v7M71 93v-7c0-10 17-10 17 0v7M38 88v5M43 88v5M77 88v5M82 88v5" fill="var(--island-bg, #faf5e8)" />
    </template>
    <template v-else>
      <path d="M27 60 24 37 44 48Q55 43 66 48L85 36 83 60Q93 79 72 85L74 99M39 85 37 99M38 85C17 96 10 79 19 75M49 88v12M62 88v12" />
      <path d="M36 67q4 5 8 0M66 67q4 5 8 0M51 74h8l-4 4M55 78v4M26 72l-9-2M83 72l9-2" />
      <ellipse cx="96" cy="98" rx="12" ry="10" /><path d="M90 90q12 7 10 16M86 98q12-5 21 3M97 88q-7 10 4 19M84 103c-10 0-7-9-14-7" stroke-width="1.5" />
    </template>
    <g v-if="bear" fill="var(--island-bg, #faf5e8)"><circle cx="25" cy="38" r="10" /><circle cx="96" cy="38" r="10" /></g>
  </g>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ pose?: 'sleep' | 'peek' | 'yarn'; bear?: boolean }>(), { pose: 'peek', bear: false })
</script>
