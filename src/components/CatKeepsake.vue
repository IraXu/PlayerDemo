<template>
  <div ref="scene" class="surprise-scene" role="dialog" aria-modal="true" aria-label="娇娇藏给十七的照片" tabindex="-1" @click.self="$emit('close')" @keydown.tab.prevent="scene?.focus()">
    <div class="surprise-glow" aria-hidden="true"></div>
    <div class="surprise-words" aria-hidden="true">
      <span v-for="item in words" :key="item.id" :style="item.style">{{ item.id % 5 === 0 ? '♡' : '娇娇' }}</span>
    </div>
    <section class="keepsake" aria-label="藏起来的小美好">
      <header class="keepsake-heading"><span>A LITTLE SECRET, JUST FOR YOU</span><h2>原来，你在这里呀。</h2></header>
      <div class="photo-arrival">
        <figure class="surprise-photo">
          <span class="photo-tape" aria-hidden="true"></span>
          <div class="photo-window"><img :src="photo" alt="娇娇藏给十七的珍藏照片" draggable="false" decoding="async" /></div>
          <figcaption><span>娇娇 <i>♡</i> 十七</span><small>把喜欢，藏在这一刻。</small></figcaption>
          <span class="photo-star" aria-hidden="true">✧</span>
        </figure>
      </div>
      <div class="surprise-note"><span class="note-rule" aria-hidden="true"></span><p>给十七：{{ wish }}</p><span class="note-signature">WITH LOVE, 娇娇</span></div>
    </section>
    <span class="surprise-hint">点击空白处 · 或按 Esc 收好这份小秘密</span>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
defineProps<{ photo: string; wish: string }>()
defineEmits<{ close: [] }>()
const scene = ref<HTMLElement | null>(null)
const words = Array.from({ length: 26 }, (_, id) => ({ id, style: {
  '--left': `${(id * 37.3 + 3) % 100}%`, '--size': `${13 + id % 4 * 3}px`,
  '--duration': `${9 + id % 5}s`, '--delay': `${-(id * .83 % 12)}s`,
  '--angle': `${id % 2 ? -14 : 12}deg`, '--alpha': `${.22 + id % 3 * .1}`,
} }))
let previousFocus: HTMLElement | null = null
onMounted(() => { previousFocus = document.activeElement as HTMLElement; scene.value?.focus({ preventScroll: true }) })
onBeforeUnmount(() => previousFocus?.focus({ preventScroll: true }))
</script>
<style scoped>
.surprise-scene{position:fixed;inset:0;z-index:80;display:grid;place-items:center;overflow:hidden;isolation:isolate;background:#f4efea;outline:none;color:#725c63}
.surprise-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 24% 25%,#e5eaf0 0,transparent 50%),radial-gradient(ellipse at 80% 75%,#efdae0 0,transparent 50%),radial-gradient(ellipse at center,#fffcf4 0,transparent 65%)}
.surprise-words{position:absolute;inset:0;z-index:1;pointer-events:none;mask-image:linear-gradient(transparent,#000 10%,#000 85%,transparent)}
.surprise-words span{position:absolute;left:var(--left);top:-10%;font:400 var(--size)/1.2 'Kaiti SC',KaiTi,serif;letter-spacing:.18em;color:#b68194;opacity:0;animation:nameFall var(--duration) var(--delay) linear infinite;white-space:nowrap}
.keepsake{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:24px;max-width:calc(100% - 64px);pointer-events:none}
.keepsake-heading{text-align:center;animation:noteBloom .9s ease both}.keepsake-heading>span{font-size:8px;letter-spacing:.28em;color:#aa9097}.keepsake-heading h2{margin:11px 0 0;font:400 23px/1.5 'Kaiti SC',KaiTi,'Songti SC',serif;letter-spacing:.12em;color:#79666d}
.photo-arrival{animation:photoArrive 1.15s .12s cubic-bezier(.2,.75,.25,1) both}
.surprise-photo{position:relative;box-sizing:border-box;width:clamp(210px,27vw,310px);margin:0;padding:12px 12px 0;background:#fffdf7;border:1px solid #fff;box-shadow:0 20px 55px #795b6b1a,0 3px 8px #795b6b0d;transform:rotate(-3deg);animation:photoFloat 8s 1.3s ease-in-out infinite}
.photo-window{overflow:hidden;background:#e8e3dd;aspect-ratio:3/4}.surprise-photo img{display:block;width:100%;height:100%;object-fit:cover}
.photo-tape{position:absolute;z-index:1;left:50%;top:-12px;width:78px;height:25px;background:#d9e0d0a6;border-left:1px dashed #b7c1ad55;border-right:1px dashed #b7c1ad55;transform:translateX(-50%) rotate(6deg);backdrop-filter:blur(2px)}
figcaption{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 0 15px}figcaption>span{font:400 21px/1.2 'Kaiti SC',KaiTi,'Songti SC',serif;letter-spacing:.12em;color:#8d707a}figcaption i{font-style:normal;font-size:19px;color:#bf8d9e;margin:0 8px}figcaption small{font-size:8px;letter-spacing:.2em;color:#b6a3a7}.photo-star{position:absolute;right:-22px;bottom:32px;font-size:43px;font-weight:200;color:#b49c79;transform:rotate(12deg)}
.surprise-note{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;animation:noteBloom 1s .65s both}.note-rule{width:26px;height:1px;background:#ceb7bf}.surprise-note p{max-width:340px;margin:0;font-size:12px;line-height:1.9;color:#947d86}.note-signature{font-size:8px;letter-spacing:.22em;color:#b29ca4}
.surprise-hint{position:absolute;bottom:max(18px,env(safe-area-inset-bottom));left:0;right:0;text-align:center;z-index:4;font-size:9px;letter-spacing:.1em;color:#b39da5;pointer-events:none}
@keyframes photoArrive{from{opacity:0;transform:translateY(36px) rotate(6deg) scale(.94)}to{opacity:1;transform:translateY(0) rotate(0) scale(1)}}
@keyframes photoFloat{0%,100%{transform:rotate(-3deg) translateY(0)}50%{transform:rotate(-1.5deg) translateY(-5px)}}
@keyframes nameFall{8%,80%{opacity:var(--alpha)}to{opacity:0;transform:translate(24px,115dvh) rotate(var(--angle))}}
@keyframes noteBloom{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:620px){.keepsake{gap:24px}.surprise-photo{width:min(65vw,270px)}.keepsake-heading h2{font-size:21px}.surprise-note p{max-width:280px;font-size:11px}.surprise-words span{font-size:calc(var(--size)*.85)}}
@media(max-height:740px){.keepsake{gap:17px}.surprise-photo{width:min(57vw,240px)}.keepsake-heading h2{font-size:20px;margin-top:6px}figcaption{padding:12px 0}.surprise-note{gap:8px}}
@media(max-height:540px){.keepsake{display:grid;grid-template-columns:210px 240px;gap:16px 40px}.photo-arrival{grid-column:1;grid-row:1/3}.surprise-photo{width:185px}.keepsake-heading{grid-column:2;align-self:end}.surprise-note{grid-column:2;align-self:start}.surprise-note p{max-width:230px}.surprise-hint{font-size:8px;bottom:10px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}.surprise-words span{top:calc(var(--left)*.85);opacity:.25}}
</style>
