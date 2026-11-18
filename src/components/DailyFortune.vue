<template>
  <Modal v-model:open="open" variant="default" :typewriter="false" :width="400">
    <div class="fortune">
      <div class="fortune-head">
        <SparklesIcon :size="26" color="#19c8b9" />
        <h2>今日猫签</h2>
        <span class="fortune-date">{{ dateLabel }}</span>
      </div>

      <div :key="revealKey" class="fortune-card">
        <span class="fortune-level">{{ fortune.level }}</span>
        <p class="fortune-line">{{ fortune.line }}</p>
        <div class="fortune-todo">
          <PawPrintIcon :size="14" color="#19c8b9" />
          <span>今天可以：{{ fortune.todo }}</span>
        </div>
        <span class="fortune-seal" aria-hidden="true">猫</span>
      </div>

      <p class="fortune-note">一天只有一支签，明天再来看猫猫想说什么。</p>
    </div>

    <template #footer>
      <Button class="fortune-submit" type="primary" @click="open = false">收好这支签</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Modal } from 'animal-island-vue'
import { PawPrintIcon, SparklesIcon } from 'naive-icons-vue'

interface Fortune {
  level: string
  line: string
  todo: string
}

const FORTUNES: Fortune[] = [
  { level: '大吉', line: '今天适合被猫踩一脚，也适合什么都不做。', todo: '给自己倒一杯温水。' },
  { level: '中吉', line: '慢一点没关系，猫猫也是睡醒了才伸懒腰的。', todo: '站起来伸一个长长的懒腰。' },
  { level: '小吉', line: '你不需要一直有用，发会儿呆也很好。', todo: '看窗外三分钟，什么都不想。' },
  { level: '吉', line: '今天的好运藏在很小的东西里，比如一声猫叫。', todo: '认真听一次身边的声音。' },
  { level: '平', line: '如果今天有点累，就把肩膀放下来。', todo: '深呼吸三次，慢慢吐气。' },
  { level: '大吉', line: '猫猫已经把阳光留了一块给你。', todo: '去有光的地方站一会儿。' },
  { level: '中吉', line: '想不明白的事，可以先放在猫爪上。', todo: '把一件烦心事写在纸上，折起来。' },
  { level: '小吉', line: '今天会遇到一件刚刚好的小事。', todo: '对一个人说一句谢谢。' },
  { level: '吉', line: '不必把每一分钟都填满，空着也很好。', todo: '允许自己发五分钟的呆。' },
  { level: '平', line: '今天适合早一点放下手机。', todo: '睡前把屏幕调暗一点。' },
  { level: '大吉', line: '你被认真地惦记着，只是你还不知道。', todo: '快给猫猫发个表情骚扰他！' },
  { level: '中吉', line: '猫猫觉得，你今天已经很努力了。', todo: '奖励自己一口喜欢的东西。' },
  { level: '小吉', line: '有些答案会自己走过来，不用追。', todo: '把问题留到明天再想。' },
  { level: '吉', line: '今天的风很轻，适合慢慢走。', todo: '走一段不带目的的路。' },
  { level: '平', line: '什么都不发生，也是一种好运。', todo: '安静地坐一会儿。' },
  { level: '中吉', line: '你可以随时回来，猫猫都在这儿。', todo: '累了就关掉页面，去好好休息。' },
]

const open = ref(false)
const today = ref(new Date())
const revealKey = ref(0)

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 用日期做种子，保证同一天看到的是同一支签 */
function hash(value: string) {
  let result = 2166136261
  for (let i = 0; i < value.length; i++) {
    result ^= value.charCodeAt(i)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

const fortune = computed(() => FORTUNES[hash(dateKey(today.value)) % FORTUNES.length])

const dateLabel = computed(() => {
  const date = today.value
  const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 · 周${week}`
})

function openNote() {
  today.value = new Date()
  revealKey.value += 1
  open.value = true
}

defineExpose({ openNote })
</script>

<style scoped>
.fortune {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.fortune-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.fortune-head h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #794f27;
}

.fortune-date {
  font-size: 11.5px;
  color: #9f927d;
  letter-spacing: 0.04em;
}

.fortune-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  padding: 26px 24px 24px;
  border-radius: 18px;
  border: 2px dashed #e3d3b6;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 250, 240, 0) 60%),
    #fffaf0;
  box-shadow: inset 0 2px 6px rgba(121, 79, 39, 0.05);
  transform-origin: 50% 0;
  animation: fortuneOpen 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) both;
}

.fortune-level {
  padding: 2px 16px;
  border-radius: 999px;
  background: #e6f9f6;
  color: #0e7f75;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.14em;
  line-height: 1.5;
}

.fortune-line {
  margin: 0;
  max-width: 280px;
  text-align: center;
  font-size: 14.5px;
  line-height: 1.9;
  color: #5a4227;
}

.fortune-todo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border-radius: 999px;
  background: #fff;
  border: 1.5px solid #e8dcc8;
  font-size: 12px;
  line-height: 1.6;
  color: #8f734f;
}

.fortune-todo svg {
  flex: none;
}

.fortune-seal {
  position: absolute;
  right: 14px;
  bottom: 12px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 2px solid rgba(208, 91, 91, 0.55);
  border-radius: 10px;
  color: #d05b5b;
  font-size: 15px;
  font-weight: 800;
  transform: rotate(-8deg);
}

.fortune-note {
  margin: 0;
  text-align: center;
  font-size: 11px;
  color: #9f927d;
}

.fortune-submit {
  color: #fff9e3;
  background: #19c8b9;
  border-color: #0ea99d;
  box-shadow: 0 4px 0 #0b8f86;
}

.fortune-submit:hover:not(:disabled) {
  color: #fff9e3;
  background: #3dd4c6;
  border-color: #0ea99d;
  box-shadow: 0 5px 0 #0b8f86;
}

@keyframes fortuneOpen {
  from {
    opacity: 0;
    transform: perspective(900px) rotateX(-70deg);
  }
  to {
    opacity: 1;
    transform: perspective(900px) rotateX(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fortune-card {
    animation: none;
  }
}
</style>
