<template>
  <aside id="breaks" class="break-menu" :hidden="immersive" aria-label="工间休息">
    <button ref="trigger" class="break-trigger" type="button" title="茶水间 · 工间休息" aria-label="茶水间 · 工间休息" aria-haspopup="dialog" :aria-expanded="opened" aria-controls="break-sheet" @click="openMenu">
      <svg class="pantry-art" viewBox="0 0 52 44" fill="none" aria-hidden="true">
        <g class="pantry-items" stroke="#86A0B1" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <g stroke="#9DB8C9" stroke-width="1.4" fill="none">
            <path class="steam steam-a" d="M2.8 13.2q-2.2-2 0-4t0-3.6"/>
            <path class="steam steam-b" d="M6.6 12.2q-2-1.8 0-3.6t0-3.2"/>
            <path class="steam steam-c" d="M39.8 22.6q-2.2-2 0-4t0-3.4"/>
          </g>
          <!-- 茶壶 -->
          <path d="M6.5 24c0-1.6 4.3-2.8 9.5-2.8s9.5 1.2 9.5 2.8v4.6c0 4.8-4.3 8.3-9.5 8.3s-9.5-3.5-9.5-8.3Z" fill="#E7EFE7"/>
          <path d="M11 21.6c0-2.1 2.2-3.7 5-3.7s5 1.6 5 3.7" fill="#E7EFE7"/>
          <path d="M10 21.8h12" fill="none"/>
          <circle cx="16" cy="16.6" r="1.4" fill="#CBDCD8" stroke-width="1.2"/>
          <path d="M8.6 21.6C6 20.8 4 18.4 2.8 15.4L1.5 16.8C2.8 19.8 4.8 22.5 7.2 25Z" fill="#E7EFE7"/>
          <path d="M25.4 24.2c4.2.2 6.2 2.6 6.2 5.4s-2 5-6.2 5.2" fill="none" stroke-width="1.7"/>
          <!-- 茶杯 -->
          <path d="M35.6 25.4h9.4v4.6a4.7 4.7 0 0 1-9.4 0Z" fill="#FAFBF7"/>
          <path d="M45 26.6h1.2a2.1 2.1 0 0 1 0 4.2H45" fill="none" stroke-width="1.3"/>
          <ellipse cx="40.3" cy="36" rx="6.8" ry="1.6" fill="#FAFBF7" stroke="#A9C0CE"/>
        </g>
        <path d="M3 37.8h46" stroke="#C5D5DF" stroke-width="1.2" stroke-linecap="round"/>
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
.break-menu{position:fixed;right:20px;bottom:calc(52px + env(safe-area-inset-bottom));z-index:20;color:#809AAD}
.break-menu[hidden]{display:none}
.break-trigger{position:relative;display:grid;place-items:center;width:56px;height:48px;padding:2px 4px 0;border:0;border-radius:9px;background:none;font-family:inherit;cursor:pointer;transition:background .2s}
.pantry-art{display:block;width:100%;height:100%;overflow:visible}
.pantry-items{transform-origin:50% 100%;transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
@media(hover:hover){.break-trigger:hover{background:#F1F5F0}.break-trigger:hover .pantry-items{transform:translateY(-2px)}}
.break-trigger:active .pantry-items{transform:translateY(0)}
.steam{transform-box:fill-box;transform-origin:50% 100%}
.steam-a{animation:steamRise 3.4s ease-out infinite}
.steam-b{animation:steamRise 3.4s ease-out -1.1s infinite}
.steam-c{animation:steamRise 3.6s ease-out -.4s infinite}
.steam-d{animation:steamRise 3.6s ease-out -1.8s infinite}
/* 触屏没有悬停：小场景轻轻起伏一下，提示可以点开 */
@media(hover:none){.pantry-items{animation:pantryBob 6s ease-in-out infinite}.break-trigger:active .pantry-items{animation:none;transform:translateY(1px)}}
.trigger-dot{position:absolute;right:4px;top:2px;width:5px;height:5px;border-radius:50%;background:#86A791}
.break-sheet{position:fixed;inset:auto 24px 128px auto;transform-origin:100% 100%;margin:0;width:300px;max-width:calc(100vw - 32px);max-height:calc(100dvh - 32px);overflow:auto;padding:20px 14px 12px;border:1px solid #D8E3E7;border-radius:16px;background:#FAFBF7;color:#617E91;box-shadow:none;overscroll-behavior:contain}
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
@keyframes breakOpen{from{opacity:0;transform:translateY(7px) rotate(-1.2deg)}to{opacity:1;transform:translateY(0) rotate(0)}}
@keyframes steamRise{0%{opacity:0;transform:translateY(3px) scaleY(.5)}28%{opacity:.85}60%,100%{opacity:0;transform:translateY(-3.5px) scaleY(1.15)}}
@keyframes pantryBob{0%,86%,100%{transform:none}92%{transform:translateY(-1.5px)}96%{transform:translateY(0)}}
@media(max-width:720px){.break-menu{right:14px;bottom:calc(52px + env(safe-area-inset-bottom))}.break-trigger{width:60px;height:50px}.break-sheet{inset:auto auto calc(12px + env(safe-area-inset-bottom)) 50%;transform:translateX(-50%);width:calc(100% - 24px);max-width:420px;max-height:calc(100dvh - 24px - env(safe-area-inset-bottom));padding:21px 14px 14px;border-radius:19px}.break-sheet[open]{animation:sheetOpen .22s ease-out}.sheet-header{padding-bottom:16px}.break-tool{min-height:60px;padding-inline:13px;gap:16px}.tool-copy strong{font-size:13px}}
@keyframes sheetOpen{from{opacity:0;translate:0 8px}to{opacity:1;translate:0 0}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
</style>
