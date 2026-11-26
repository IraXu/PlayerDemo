<template>
  <div class="playback-panel" :class="{ fullscreen }" @click.stop @dblclick.stop>
    <button class="window-action close-playback" type="button" aria-label="结束逗猫" title="关闭画面" @click="$emit('stop')"><CloseIcon/></button>
    <button class="window-action fullscreen-toggle" type="button" :aria-label="fullscreen ? '退出全屏' : '全屏'" :title="fullscreen ? '退出全屏' : '全屏'" @click="$emit('fullscreen')"><MinimizeIcon v-if="fullscreen"/><MaximizeIcon v-else/></button>

    <Teleport :to="dockTarget || 'body'" :disabled="!docked">
    <div class="control-deck" :class="{ docked }" @click.stop @dblclick.stop role="toolbar" aria-label="播放控制">
      <button class="quality-toggle" type="button" :aria-label="qualityLabel" :title="qualityLabel" @click="$emit('quality', quality === 0 ? 1 : 0)">{{ quality === 0 ? '超清' : '高清' }}</button>
      <span class="control-divider" aria-hidden="true"></span>
      <div class="audio-control">
        <button type="button" :aria-label="muted ? '开启声音' : '静音'" :title="muted ? '开启声音' : '静音'" :aria-pressed="!muted" @click="$emit('mute')"><VolumeXIcon v-if="muted"/><Volume2Icon v-else/></button>
        <input type="range" min="0" max="100" :value="volume" aria-label="音量" title="音量" :aria-valuetext="volume + '%'" @input="$emit('volume',Number(($event.target as HTMLInputElement).value))"/>
      </div>
      <button type="button" aria-label="保存截图" title="保存截图" @click="$emit('capture')"><CameraIcon/></button>
      <span class="control-divider toy-divider" aria-hidden="true"></span>
      <button class="playback-toy" :class="{ busy, cooling: cooldown > 0 && !busy }" type="button" :aria-label="toyLabel" :title="toyLabel" :disabled="busy || cooldown > 0" @click="$emit('tease')">
        <span class="toy-illustration"><TeaserWand/></span>
        <svg class="toy-sparkles" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path class="spark-one" d="M13 8v8M9 12h8" stroke="#C3A464" stroke-width="1.6" stroke-linecap="round"/><path class="spark-two" d="M51 42v6M48 45h6" stroke="#BC93A7" stroke-width="1.6" stroke-linecap="round"/></svg>
        <svg v-if="cooldown > 0 && !busy" class="cooldown-ring" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="29" stroke="#C9D9CA" stroke-width="1.6"/><circle cx="32" cy="32" r="29" stroke="#86AA8E" stroke-width="2" stroke-linecap="round" pathLength="100" :stroke-dasharray="`${cooldown / 30 * 100} 100`" transform="rotate(-90 32 32)"/></svg>
      </button>
    </div>
    </Teleport>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {CameraIcon,CloseIcon,VolumeXIcon,Volume2Icon,MaximizeIcon,MinimizeIcon} from '../ui/icons'
import TeaserWand from './TeaserWand.vue'
const props = defineProps<{dockTarget?:HTMLElement;muted:boolean;volume:number;quality:number;fullscreen:boolean;busy:boolean;cooldown:number}>()
const narrowScreen = ref(false)
let mobileQuery: MediaQueryList | undefined
function updateLayout() { narrowScreen.value = mobileQuery?.matches ?? false }
onMounted(() => {
  mobileQuery = window.matchMedia('(max-width:720px)')
  updateLayout()
  mobileQuery.addEventListener('change', updateLayout)
})
onUnmounted(() => mobileQuery?.removeEventListener('change', updateLayout))
const docked = computed(() => narrowScreen.value && !props.fullscreen && Boolean(props.dockTarget))
const qualityLabel = computed(() => props.quality === 0 ? '当前超清，点击切换高清' : '当前高清，点击切换超清')
const toyLabel = computed(() => props.busy ? '正在逗猫' : props.cooldown > 0 ? `${props.cooldown} 秒后可以再次逗猫` : '逗逗猫')
defineEmits<{stop:[];mute:[];volume:[value:number];quality:[value:number];capture:[];fullscreen:[];tease:[]}>()
</script>
<style scoped>
.playback-panel{position:absolute;inset:0;z-index:7;pointer-events:none;color:#607F93;--control-inset:14px}
.playback-panel button,.control-deck button{display:grid;place-items:center;flex:none;padding:0;border:0;background:transparent;color:inherit;cursor:pointer;transition:background .18s,color .18s,transform .18s}
.playback-panel button:focus-visible,.control-deck button:focus-visible{outline:2px solid #719BB6;outline-offset:3px}
.playback-panel button>svg,.control-deck button>svg{width:18px;height:18px}
.playback-panel .window-action{position:absolute;right:var(--control-inset);width:30px;height:30px;pointer-events:auto;color:#F4F8FA;background:none;border:0;border-radius:4px}
.playback-panel .window-action>svg{width:16px;height:16px;filter:drop-shadow(0 1px 2px #12232B)}
.window-action:hover{color:#C8E4F5;transform:scale(1.08)}
.close-playback{top:var(--control-inset)}
.fullscreen-toggle{bottom:calc(var(--control-inset) + 7px)}
.control-deck{position:absolute;left:var(--control-inset);bottom:var(--control-inset);display:flex;align-items:center;gap:5px;padding:4px 7px;border:1px solid #DAE5E9;border-radius:30px;background:#FCFCF8;pointer-events:auto}
.control-deck button{width:36px;height:34px;border-radius:50%}
.control-deck button:hover:not(:disabled){background:#EAF1F5;color:#446B85}
.audio-control{display:flex;align-items:center;gap:4px;margin-right:4px}
.audio-control input{appearance:none;width:62px;height:34px;background:transparent;cursor:pointer;margin:0}
.audio-control input::-webkit-slider-runnable-track{height:3px;border-radius:3px;background:#CFDEE7}
.audio-control input::-webkit-slider-thumb{appearance:none;width:10px;height:10px;margin-top:-3.5px;border-radius:50%;background:#82A6BD}
.audio-control input::-moz-range-track{height:3px;border-radius:3px;background:#CFDEE7}
.audio-control input::-moz-range-thumb{width:10px;height:10px;border:0;border-radius:50%;background:#82A6BD}
.audio-control input:focus-visible{outline:2px solid #719BB6;outline-offset:1px;border-radius:4px}
.control-deck .quality-toggle{width:44px;height:30px;border-radius:18px;font-family:inherit;font-size:11px;letter-spacing:.02em;background:#E2EDF4;color:#537C97}
.control-divider{height:14px;width:1px;background:#DFE8EC;flex:none}
.control-deck .playback-toy{position:relative;width:36px;height:34px;border-radius:50%;background:transparent;isolation:isolate}
.control-deck .playback-toy:hover:not(:disabled){background:#EDF3E8;transform:translateY(-1px)}
.playback-toy:active:not(:disabled){transform:scale(.94)}
.toy-illustration{display:block;width:36px;height:36px;transform-origin:25% 80%;animation:toyInvitation 2.8s ease-in-out infinite}
.toy-illustration>svg{display:block;width:100%;height:100%;overflow:visible}
.playback-toy .toy-sparkles,.playback-toy .cooldown-ring{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.spark-one,.spark-two{transform-box:fill-box;transform-origin:center;animation:sparkle 2.8s ease-in-out infinite}
.spark-two{animation-delay:-1.4s}
.busy .toy-illustration{animation:toyPlaying .6s ease-in-out infinite}
.control-deck .playback-toy:disabled{cursor:default}
.cooling .toy-illustration{animation-play-state:paused;opacity:.65}
.cooling .toy-illustration :deep(.feather-tip){animation-play-state:paused}
.cooling .toy-sparkles{display:none}
@keyframes toyInvitation{0%,60%,100%{transform:rotate(-5deg)}20%{transform:translateY(-1px) rotate(6deg)}40%{transform:rotate(-6deg)}}
@keyframes toyPlaying{50%{transform:translateY(-4px) rotate(13deg)}}
@keyframes sparkle{0%,60%,100%{opacity:.2;transform:scale(.65)}25%{opacity:1;transform:scale(1)}}
@media(max-width:720px){.playback-panel{--control-inset:8px}.control-deck{gap:4px;padding:3px 5px}.control-deck button{width:30px;height:32px}.control-deck button>svg{width:17px;height:17px}.audio-control{gap:2px;margin-right:0}.audio-control input{width:36px;height:32px}.control-deck .quality-toggle{width:38px;height:28px;font-size:10px}.control-deck .playback-toy{width:32px;height:32px}.toy-illustration{width:34px;height:34px}.fullscreen-toggle{bottom:calc(var(--control-inset) + 6px)}}
@media(max-width:360px){.control-deck{gap:3px}.audio-control input{width:26px}.control-deck .quality-toggle{width:36px}}
.control-deck.docked{position:relative;inset:auto;width:max-content;max-width:100%;box-sizing:border-box;margin:9px auto 0;padding:3px 7px;gap:5px;border:1px solid #DAE5E9;border-radius:24px;background:#FCFCF8;color:#607F93}
.docked button{height:36px;width:36px;flex:none}
.docked .quality-toggle{height:28px;width:38px}
.docked .audio-control{flex:none;gap:3px;margin:0 1px}
.docked .audio-control button{width:32px}
.docked .audio-control input{width:44px;min-width:0;max-width:none;flex:none;height:36px}
.docked .playback-toy{height:36px;width:36px}
.docked .toy-illustration{height:34px;width:34px}
.docked .toy-divider{margin-inline:1px}
.docked .cooldown-ring{inset:1px;width:34px;height:34px}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
</style>
