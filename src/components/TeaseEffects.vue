<template>
  <div class="playtime-effects" aria-hidden="true">
    <div class="playtime-glow"></div>
    <svg class="playtime-orbit" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
      <path class="orbit-line" d="M370 32C541 3 592 111 496 155S283 68 380 32" />
      <g v-for="(spot, i) in pawTrail" :key="i" :transform="`translate(${spot[0]} ${spot[1]}) rotate(${i * 23 - 60})`">
        <g class="orbit-paw" :style="{ animationDelay: `${i * .12}s` }" fill="#F5D5BF">
          <ellipse cy="5" rx="6" ry="4.5" /><ellipse cx="-7" cy="-2" rx="2.3" ry="3" /><ellipse cx="-2.5" cy="-6" rx="2.3" ry="3" /><ellipse cx="3" cy="-6" rx="2.3" ry="3" /><ellipse cx="7.5" cy="-2" rx="2.3" ry="3" />
        </g>
      </g>
    </svg>
    <div class="playtime-toy"><TeaserWand /></div>
    <span v-for="i in 7" :key="i" class="playtime-spark" :style="{ '--i': i }">✦</span>
    <div class="playtime-caption"><span class="playtime-dot"></span>{{ label }}<span class="playtime-progress" :style="{ animationDuration: `${duration}ms` }"></span></div>
  </div>
</template>
<script setup lang="ts">
import TeaserWand from './TeaserWand.vue'
defineProps<{ label: string; duration: number }>()
const pawTrail = Array.from({ length: 26 }, (_, i) => {
  const t = -Math.PI * .25 + i / 25 * Math.PI * 1.65
  return [458 + Math.cos(t) * 125, 98 + Math.sin(t) * 77]
})
</script>
<style scoped>
.playtime-effects{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none;container-type:inline-size}
.playtime-glow{position:absolute;right:-12%;top:-35%;width:65%;aspect-ratio:1;background:radial-gradient(circle,#f6d9b72e,transparent 68%);animation:glowBreathe 3s ease-in-out infinite}
.playtime-orbit{position:absolute;inset:0;width:100%;height:100%;opacity:.75}
.orbit-line{fill:none;stroke:#FFF1D5;stroke-width:1.8;stroke-dasharray:2 9;stroke-linecap:round;opacity:.48}
.orbit-paw{opacity:0;animation:pawAppear 3.2s ease-in-out infinite}
.playtime-toy{position:absolute;right:5%;top:3%;width:clamp(125px,29%,250px);transform-origin:20% 90%;animation:toyDance 2.35s cubic-bezier(.42,0,.24,1) infinite;filter:drop-shadow(0 4px 8px #24180e30)}
.playtime-toy :deep(svg){width:100%;height:auto;overflow:visible;transform:rotate(170deg);animation:toyFlick 1.1s ease-in-out infinite}
.playtime-spark{position:absolute;right:calc(5% + var(--i)*4%);top:calc(10% + var(--i)*3%);font-size:clamp(10px,2.2cqw,19px);color:#FFF0CE;opacity:0;animation:littleSpark 3.2s ease-in-out infinite;animation-delay:calc(var(--i)*.24s)}
.playtime-caption{position:absolute;left:50%;bottom:74px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;max-width:85%;padding:10px 16px 12px;border:1px solid #fff7e34d;border-radius:22px;background:#302b267a;backdrop-filter:blur(12px);color:#FFF5E5;font:500 12px/1.4 system-ui;white-space:nowrap;overflow:hidden}
.playtime-dot{width:5px;height:5px;border-radius:50%;background:#B4DBC5;box-shadow:0 0 9px #B4DBC588}
.playtime-progress{position:absolute;bottom:0;left:0;height:2px;width:100%;background:linear-gradient(90deg,#94c7b4,#efbac8,#efdaa1);transform-origin:left;animation:progressDrain linear forwards}
@keyframes toyDance{0%,100%{transform:translate(2px,-3px) rotate(-10deg)}18%{transform:translate(-26px,15px) rotate(13deg)}38%{transform:translate(-9px,-10px) rotate(-5deg)}57%{transform:translate(-40px,25px) rotate(19deg)}75%{transform:translate(-19px,3px) rotate(-12deg)}88%{transform:translate(5px,7px) rotate(3deg)}}
@keyframes toyFlick{0%,100%{transform:rotate(170deg)}35%{transform:rotate(177deg)}70%{transform:rotate(165deg)}}
@keyframes littleSpark{0%,100%{opacity:0;transform:translateY(6px) scale(.5)}40%{opacity:.85;transform:translateY(-8px) scale(1)}75%{opacity:0;transform:translateY(-18px) scale(.6)}}
@keyframes pawAppear{0%,12%,92%,100%{opacity:0;transform:scale(.55)}28%,60%{opacity:.82;transform:scale(1)}78%{opacity:.35;transform:scale(.82)}}
@keyframes glowBreathe{50%{opacity:.45;transform:scale(1.1)}}
@keyframes progressDrain{to{transform:scaleX(0)}}
@media(max-width:520px){.playtime-caption{bottom:62px;font-size:10px;padding:7px 12px 9px}.playtime-toy{right:4%;width:29%}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important}.playtime-spark,.orbit-paw{opacity:.4}.playtime-progress{display:none}}
</style>
