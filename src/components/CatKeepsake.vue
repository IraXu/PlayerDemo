<template>
  <div ref="scene" class="surprise-scene" role="dialog" aria-modal="true" aria-label="给十七的彩蛋" tabindex="-1" @click.self="$emit('close')" @keydown.tab.prevent="closeButton?.focus()">
    <div class="surprise-halo" aria-hidden="true"></div>
    <div class="surprise-words" aria-hidden="true">
      <span v-for="item in words" :key="item.id" :style="item.style">{{ item.id % 4 === 0 ? '♡' : '娇娇' }}</span>
    </div>
    <figure v-for="(card, i) in cards" :key="i" class="surprise-photo" :class="{ 'surprise-photo-float': i < 3 }" :style="{ '--x': card[0] + '%', '--y': card[1] + '%', '--angle': card[2] + 'deg', '--delay': (i * .075) + 's', '--drift': (i % 2 ? -1 : 1) * 7 + 'px', '--depth': i % 3 === 0 ? .85 : 1 }">
      <div class="surprise-photo-card"><img :src="photo" alt="" draggable="false" decoding="async" /><figcaption>娇娇 ♡ 十七</figcaption></div>
    </figure>
    <div class="surprise-note">
      <span class="surprise-note-heart" aria-hidden="true">♡</span>
      <span class="surprise-eyebrow">你找到猫猫藏起来的秘密了</span>
      <p>给十七：{{ wish }}</p>
    </div>
    <button ref="closeButton" class="surprise-close" type="button" aria-label="关闭彩蛋" @click="$emit('close')">×</button>
    <span class="surprise-hint">点击空白处或按 Esc 收起</span>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
defineProps<{ photo: string; wish: string }>()
defineEmits<{ close: [] }>()
const scene = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const cards = [[14,16,-13],[39,13,8],[65,15,-8],[88,22,12],[9,45,7],[33,44,-9],[62,45,10],[89,53,-9],[16,77,-7],[44,80,12],[72,79,-11],[93,84,8]]
const words = Array.from({ length: 38 }, (_, id) => ({ id, style: {
  '--left': `${(id * 37.3) % 100}%`, '--size': `${14 + id % 5 * 4}px`,
  '--duration': `${7 + id % 5}s`, '--delay': `${-(id * .71 % 10)}s`,
  '--angle': `${id % 2 ? -10 : 12}deg`, '--alpha': `${.2 + id % 4 * .1}`,
} }))
let previousFocus: HTMLElement | null = null
onMounted(() => { previousFocus = document.activeElement as HTMLElement; closeButton.value?.focus({ preventScroll: true }) })
onBeforeUnmount(() => previousFocus?.focus({ preventScroll: true }))
</script>
<style scoped>
.surprise-scene{position:fixed;inset:0;z-index:80;overflow:hidden;isolation:isolate;background:radial-gradient(ellipse at 50% 35%,#573949df,#211e2cf5);outline:none}
.surprise-halo{position:absolute;inset:-30%;background:radial-gradient(ellipse at center,#efa8c12b,transparent 60%);animation:haloPulse 7s ease-in-out infinite;pointer-events:none}
.surprise-words{position:absolute;inset:0;z-index:2;pointer-events:none;mask-image:linear-gradient(transparent,#000 12%,#000 85%,transparent)}
.surprise-words span{position:absolute;left:var(--left);top:-10%;font:600 var(--size)/1.2 system-ui;letter-spacing:.12em;color:#ffd9e4;text-shadow:0 2px 18px #f9a3c24d;opacity:0;animation:nameFall var(--duration) var(--delay) linear infinite;white-space:nowrap}
.surprise-photo{position:absolute;left:var(--x);top:var(--y);width:clamp(100px,14vw,205px);margin:0;z-index:1;pointer-events:none;transform:translate(-50%,-50%) rotate(var(--angle)) scale(var(--depth));animation:photoBurst .95s var(--delay) cubic-bezier(.16,.8,.25,1) both}
.surprise-photo-card{padding:7px 7px 0;border:1px solid #fff7ed;background:#fff8ef;box-shadow:0 10px 25px #140e214d;border-radius:4px}.surprise-photo-float .surprise-photo-card{animation:photoFloat 5s ease-in-out infinite}
.surprise-photo img{display:block;width:100%;height:auto;aspect-ratio:825/1100;object-fit:cover;border-radius:2px}
figcaption{text-align:center;color:#b2888e;font:11px/2.5 system-ui;letter-spacing:1px}
.surprise-note{position:absolute;z-index:3;left:50%;bottom:7%;transform:translateX(-50%);width:max-content;max-width:88%;padding:18px 30px 22px;border:1px solid #fff7eb77;border-radius:22px;text-align:center;color:#fff0ed;background:linear-gradient(135deg,#492e40cc,#322b3bcc);box-shadow:0 12px 40px #160e2926;animation:noteBloom .8s .55s both}
.surprise-note-heart{display:block;font:36px/1 system-ui;color:#f1b1c8;margin-bottom:10px}
.surprise-eyebrow{font:10px/1.4 system-ui;letter-spacing:2px;color:#dfb5c1}
p{font-size:12px;line-height:1.8;margin:0;color:#e5cbd1}
.surprise-close{position:absolute;z-index:4;top:max(20px,env(safe-area-inset-top));right:22px;display:grid;place-items:center;width:40px;height:40px;border:1px solid #fff5ec66;border-radius:50%;background:#3f2d4199;color:#fff5ee;font:26px/1 system-ui;cursor:pointer;transition:background .2s,transform .2s}
.surprise-close:hover{background:#895c71;transform:rotate(90deg)}.surprise-close:focus-visible{outline:2px solid #f1b1c8;outline-offset:4px}
.surprise-hint{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);z-index:4;font-size:10px;letter-spacing:1px;color:#ead6dd99;white-space:nowrap;pointer-events:none}
@keyframes photoBurst{from{opacity:0;transform:translate(calc(-50% + (50vw - var(--x)) * .7),65vh) rotate(calc(var(--angle) - 65deg)) scale(.12)}to{opacity:1;transform:translate(-50%,-50%) rotate(var(--angle)) scale(var(--depth))}}
@keyframes photoFloat{50%{transform:translateY(var(--drift)) rotate(2deg)}}
@keyframes nameFall{12%,80%{opacity:var(--alpha)}to{opacity:0;transform:translate(25px,115vh) rotate(var(--angle))}}
@keyframes haloPulse{50%{transform:scale(1.2);opacity:.5}}
@keyframes noteBloom{from{opacity:0;transform:translate(-50%,20px) scale(.94)}to{opacity:1;transform:translateX(-50%)}}
@media(max-width:620px){.surprise-photo{width:clamp(90px,27vw,145px)}.surprise-photo:nth-of-type(3n){display:none}.surprise-photo-card{padding:5px 5px 0}figcaption{font-size:9px}.surprise-note{bottom:8%;padding:16px 18px 20px;width:88%;max-width:360px;box-sizing:border-box}.surprise-note-heart{font-size:30px}.surprise-words span{font-size:calc(var(--size)*.8)}.surprise-hint{bottom:20px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}.surprise-words span{top:calc(var(--left)*.85);opacity:.25}.surprise-photo{opacity:1}}
</style>
