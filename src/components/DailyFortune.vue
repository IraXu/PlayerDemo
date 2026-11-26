<template>
  <Modal v-model:open="open" title="今日猫签" :width="410">
    <div class="daily-note">
      <span class="tool-kicker">A NOTE FOR TODAY</span>
      <span class="note-date">{{ dateLabel }}</span>
      <div v-if="!revealed" class="sealed-note"><BreakStamp kind="note"/><h3>今天，会收到怎样的鼓励？</h3><p>每天一支，留给正在认真生活的你。</p><span class="note-seal" aria-hidden="true">17</span></div>
      <div v-else class="opened-note" aria-live="polite"><span class="slip-number">TODAY'S LITTLE LUCK</span><strong>{{ fortune.level }}</strong><p>{{ fortune.line }}</p><div class="note-task"><span>今天可以做的小事</span>{{ fortune.todo }}</div></div>
      <p class="note-caption">{{ revealed ? '今天这支已为你留好，随时可以回来读。' : '不用赶路，先给自己一点好运气。' }}</p>
    </div>
    <template #footer><Button v-if="!revealed" type="primary" @click="reveal">抽取今日猫签 ↗</Button><Button v-else type="primary" @click="open = false">收好这份鼓励</Button></template>
  </Modal>
</template>
<script setup lang="ts">
import {computed,ref} from 'vue'
import {Button,Modal} from '../ui'
import BreakStamp from './BreakStamp.vue'
import {fortuneFor} from '../fortune'
import {theme} from '../theme'
const open=ref(false),today=ref(new Date()),revealed=ref(false)
const fortune=computed(()=>fortuneFor(theme.value,today.value))
const dateLabel=computed(()=>new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(today.value))
function key(){const d=today.value;return `office-fortune:${theme.value}:${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`}
function openNote(){today.value=new Date();try{revealed.value=localStorage.getItem(key())==='read'}catch{revealed.value=false}open.value=true}
function reveal(){revealed.value=true;try{localStorage.setItem(key(),'read')}catch{/* Keep the note available in memory. */}}
defineExpose({openNote})
</script>
<style scoped>
.daily-note{text-align:center}.tool-kicker{display:block;font-size:8px;color:#96aebb;letter-spacing:.16em}.note-date{display:block;font-size:10px;color:#9cabb3;margin-top:10px}.sealed-note{position:relative;border:1px solid #d9e5ed;background:#edf3f7;border-radius:6px;padding:20px 16px 35px;margin:25px 0}.sealed-note>svg{width:125px;height:96px;display:block;margin:auto}.sealed-note h3{font-weight:400;font-size:16px;color:#66879e;margin:8px 0 12px}.sealed-note p{font-size:10px;color:#99aebb;margin:0}.note-seal{position:absolute;left:calc(50% - 15px);bottom:-15px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#d1dde3;color:#879bab;border:3px solid #fafbf8;font-size:9px}.opened-note{margin:25px 0 12px;padding:28px 20px 22px;border:1px solid #d9e5ed;border-radius:6px;background:#edf3f7;animation:noteOpen .35s ease-out}.slip-number{display:block;font-size:7px;letter-spacing:.12em;color:#9fb3bf}.opened-note>strong{display:block;font-size:34px;font-weight:400;letter-spacing:.16em;color:#7a9eb7;margin:20px 0}.opened-note>p{font-size:15px;line-height:1.9;color:#638197;margin:0 0 25px}.note-task{padding:15px 5px 0;border-top:1px solid #d2e1eb;font-size:11px;line-height:1.8;color:#839cab}.note-task>span{display:block;font-size:8px;color:#a3b4be;margin-bottom:7px}.note-caption{font-size:10px!important;color:#9cabb3!important;line-height:1.8;padding-top:8px}@keyframes noteOpen{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.opened-note{animation:none}}
</style>
