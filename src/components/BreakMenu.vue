<template>
  <aside id="breaks" class="break-menu" :hidden="immersive" aria-label="工间休息">
    <button ref="trigger" class="break-trigger" type="button" aria-label="工间休息" aria-haspopup="dialog" :aria-expanded="opened" aria-controls="break-sheet" @click="openMenu">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <g class="cup"><path d="M5 10h12v5a6 6 0 0 1-12 0Z" fill="#DDEAD9"/><path d="M5 10h12v5a6 6 0 0 1-12 0ZM17 11h2a2.5 2.5 0 0 1 0 5h-2M4 22h15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></g>
        <g class="steam" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path class="steam-a" d="M9 3v3"/><path class="steam-b" d="M14 2v4"/></g>
      </svg>
      <i v-if="searching && !found" class="trigger-dot" aria-label="找猫中"></i>
    </button>
    <dialog id="break-sheet" ref="sheet" class="break-sheet" aria-labelledby="break-title" @cancel.prevent="closeMenu" @close="onClosed" @click="onBackdropClick">
      <header class="sheet-header"><div><span class="sheet-kicker">TAKE A LITTLE BREAK</span><h2 id="break-title">工间休息</h2></div><button class="sheet-close" type="button" aria-label="关闭工间休息" @click="closeMenu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button></header>
      <div class="break-tools" role="group" aria-label="工间休息功能">
      <button class="break-tool fortune-tool" type="button" title="收一份今天的小小鼓励" @click="choose('fortune')">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h12v18H6Z" fill="#E1ECF3"/><path d="M6 3h12v18H6ZM9 16h6M9 18h4"/><path d="m12 6 1.1 2.2 2.4.4-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.4Z" fill="#FBFBF5"/></svg>
        <span class="tool-copy"><strong>今日猫签</strong><small>收一份今天的小小鼓励</small></span><span class="tool-arrow" aria-hidden="true">↗</span>
      </button>
      <button class="break-tool hunt-tool" :class="{ searching: searching && !found, found }" type="button" :title="found ? '明天再来，换个地方见' : searching ? '查看找猫提示' : '在页面角落，找一位同事'" @click="choose('hunt')">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 10V4l5 3q2-1 4 0l5-3v6q2 2 2 5c0 4-4 6-9 6s-9-2-9-6q0-3 2-5Z" fill="#F2F0E5"/><path d="M5 10V4l5 3q2-1 4 0l5-3v6q2 2 2 5c0 4-4 6-9 6s-9-2-9-6q0-3 2-5ZM8 13v1m8-1v1m-5 3h2"/><path v-if="found" d="m15 20 2 2 5-5" class="found-tick"/></svg>
        <span class="tool-copy"><strong>{{ found ? '已找到猫' : searching ? '找猫中' : '找找小猫' }}</strong><small>{{ found ? '明天换个地方见' : searching ? '看看它留下的线索' : '发现躲在角落的小同事' }}</small></span><span class="tool-arrow" aria-hidden="true">↗</span>
        <i v-if="searching && !found" class="search-dot" aria-hidden="true"></i>
      </button>
      <button class="break-tool share-tool" type="button" title="把猫猫工位存成一张卡片" @click="choose('share')">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 4h18v17H3Z" fill="#F9F8EE"/><path d="M6 7h12v9H6Z" fill="#DDEAF2" stroke="none"/><path d="m6 16 4-5 3 3 2-2 3 4" fill="#BECEBF" stroke="none"/><circle cx="15" cy="9" r="1.5" fill="#FBFBF6" stroke="none"/><path d="M3 4h18v17H3ZM9 18h6"/></svg>
        <span class="tool-copy"><strong>工位卡片</strong><small>把此刻的画面带走</small></span><span class="tool-arrow" aria-hidden="true">↗</span>
      </button>
      <button class="break-tool tree-tool" type="button" title="把心事悄悄留在树洞" @click="choose('tree')">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 21V10a6 6 0 0 1 12 0v11Z" fill="#D5E0D2"/><path d="M6 21V10a6 6 0 0 1 12 0v11M4 21h16M12 5v3"/><path d="M9 21v-6a3 3 0 0 1 6 0v6" fill="#8FAA94" stroke="none"/><path d="M6 12Q1 11 2 6q5 0 4 6ZM18 10q0-5 5-5 0 5-5 5Z" fill="#B3C9B4" stroke="none"/></svg>
        <span class="tool-copy"><strong>树洞</strong><small>有些心事，悄悄说给它听</small></span><span class="tool-arrow" aria-hidden="true">↗</span>
      </button>
      </div>
    </dialog>
  </aside>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
const props = defineProps<{ searching: boolean; found: boolean; immersive: boolean }>()
type BreakAction = 'fortune' | 'hunt' | 'share' | 'tree'
const emit = defineEmits<{ action: [value: BreakAction] }>()
const sheet = ref<HTMLDialogElement>()
const trigger = ref<HTMLButtonElement>()
const opened = ref(false)
let previousOverflow: string | undefined
function openMenu() {
  if (props.immersive || !sheet.value || sheet.value.open) return
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  sheet.value.showModal()
  opened.value = true
}
function releaseScroll() {
  if (previousOverflow === undefined) return
  document.body.style.overflow = previousOverflow
  previousOverflow = undefined
}
function closeMenu() {
  sheet.value?.close()
  opened.value = false
  releaseScroll()
}
function onClosed() {
  opened.value = Boolean(sheet.value?.open)
  if (!opened.value) releaseScroll()
}
function choose(action: BreakAction) {
  closeMenu()
  emit('action', action)
}
function onBackdropClick(event: MouseEvent) {
  if (event.target !== sheet.value) return
  const bounds = sheet.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu()
}
watch(() => props.immersive, immersive => { if (immersive) closeMenu() })
onBeforeUnmount(closeMenu)
</script>
<style scoped>
.break-menu{position:fixed;right:24px;bottom:max(24px,env(safe-area-inset-bottom));z-index:20;color:#668773}
.break-menu[hidden]{display:none}
.break-trigger{position:relative;display:grid;place-items:center;width:44px;height:44px;padding:0;border:1px solid #CCDCD0;border-radius:50%;background:#F7FAF3;color:inherit;font-family:inherit;font-size:11px;font-weight:400;line-height:1;cursor:pointer;transition:background .18s,border-color .18s}
.break-trigger>svg{width:22px;height:22px;flex:none;overflow:visible}
.cup{transform-box:fill-box;transform-origin:50% 85%;animation:cupSip 5s ease-in-out infinite}
.steam{transform-box:fill-box;transform-origin:50% 100%}
.steam-a{animation:steamRise 3.2s ease-out infinite}
.steam-b{animation:steamRise 3.2s ease-out -1.6s infinite}
@media(hover:hover){.break-trigger:hover{background:#EAF2E4;border-color:#ADC8B3}}
@media(hover:hover){.break-trigger:hover .cup{animation:cupSip 2.4s ease-in-out infinite}}
.trigger-dot{position:absolute;right:4px;top:4px;width:5px;height:5px;border-radius:50%;background:#86A791}
.break-sheet{position:fixed;inset:auto 24px 82px auto;margin:0;width:300px;max-width:calc(100vw - 32px);max-height:calc(100dvh - 32px);overflow:auto;padding:20px 14px 12px;border:1px solid #D8E3E7;border-radius:16px;background:#FAFBF7;color:#617E91;box-shadow:none;overscroll-behavior:contain}
.break-sheet::backdrop{background:rgb(41 63 76 / .17)}
.break-sheet[open]{animation:breakOpen .2s ease-out}
.sheet-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 9px 15px;border-bottom:1px solid #E2E9EB;margin-bottom:5px}
.sheet-kicker{display:block;font-size:7px;letter-spacing:.14em;color:#A0B1B9}
.sheet-header h2{font-size:16px;font-weight:400;line-height:1.4;margin:7px 0 0;color:#59798A}
.sheet-close{display:grid;place-items:center;align-self:flex-start;width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:#8BA1AE;cursor:pointer}
.sheet-close>svg{width:18px;height:18px}
@media(hover:hover){.sheet-close:hover{background:#EAF0F3}}
.break-tools{display:grid;gap:2px}
.break-tool{position:relative;display:flex;align-items:center;gap:14px;min-height:60px;padding:9px 10px;border:0;border-radius:9px;background:transparent;color:inherit;text-align:left;font-family:inherit;cursor:pointer;transition:background .16s,color .16s}
.break-tool>svg{display:block;flex:none;width:25px;height:25px;stroke:#809AAD;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}
.tool-copy{display:flex;flex-direction:column;gap:6px}
.tool-copy strong{font-size:12px;font-weight:400;line-height:1.3}
.tool-copy small{font-size:10px;line-height:1.4;color:#9AAEB8}
.tool-arrow{margin-left:auto;font-size:12px;color:#ADBDC6}
@media(hover:hover){.break-tool:hover{background:#EDF3F6;color:#426C88}}
.break-tool:active{background:#E2EDF3}
.break-tool:focus-visible,.sheet-close:focus-visible,.break-trigger:focus-visible{outline:2px solid #9DBBD0;outline-offset:2px}
.tree-tool{color:#78947C}
.tree-tool>svg{stroke:#88A18C}
@media(hover:hover){.tree-tool:hover{background:#EDF3E9;color:#5D7E62}}
.found-tick{stroke:#6F9277;stroke-width:2;paint-order:stroke;stroke-linecap:round}
.search-dot{position:absolute;left:32px;top:10px;width:4px;height:4px;border-radius:50%;background:#88A995}
@keyframes breakOpen{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@keyframes cupSip{0%,68%,100%{transform:translateY(0) rotate(0)}74%{transform:translateY(-.6px) rotate(-4deg)}80%{transform:translateY(.4px) rotate(4deg)}86%{transform:translateY(-.3px) rotate(-2deg)}}
@keyframes steamRise{0%{opacity:0;transform:translateY(3px) scaleY(.5)}28%{opacity:.85}60%,100%{opacity:0;transform:translateY(-3.5px) scaleY(1.15)}}
@media(max-width:720px){.break-menu{right:16px;bottom:calc(16px + env(safe-area-inset-bottom))}.break-sheet{inset:auto auto calc(12px + env(safe-area-inset-bottom)) 50%;transform:translateX(-50%);width:calc(100% - 24px);max-width:420px;max-height:calc(100dvh - 24px - env(safe-area-inset-bottom));padding:21px 14px 14px;border-radius:19px}.break-sheet[open]{animation:sheetOpen .22s ease-out}.sheet-header{padding-bottom:16px}.break-tool{min-height:60px;padding-inline:13px;gap:16px}.tool-copy strong{font-size:13px}}
@keyframes sheetOpen{from{opacity:0;translate:0 8px}to{opacity:1;translate:0 0}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
</style>
