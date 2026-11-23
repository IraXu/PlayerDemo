<template>
  <Modal v-model:open="open" variant="default" :typewriter="false" :width="400">
    <div class="fortune">
      <div class="fortune-head">
        <SparklesIcon :size="26" color="#19c8b9" />
        <h2>{{ copy.fortuneTitle }}</h2>
        <span class="fortune-date">{{ dateLabel }}</span>
      </div>

      <div :key="revealKey" class="fortune-card">
        <span class="fortune-level">{{ fortune.level }}</span>
        <p class="fortune-line">{{ fortune.line }}</p>
        <div class="fortune-todo">
          <PawPrintIcon :size="14" color="#19c8b9" />
          <span>今天可以：{{ fortune.todo }}</span>
        </div>
        <span class="fortune-seal" aria-hidden="true">{{ copy.fortuneSeal }}</span>
      </div>

      <p class="fortune-note">{{ copy.fortuneNote }}</p>
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
import { fortuneFor } from '../fortune'
import { copy, theme } from '../theme'

const open = ref(false)
const today = ref(new Date())
const revealKey = ref(0)

const fortune = computed(() => fortuneFor(theme.value, today.value))

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

/* 小熊日：熊签换成蜂蜜色 */
html[data-theme='bear'] .fortune-level {
  background: #fbeed6;
  color: #a9761d;
}

html[data-theme='bear'] .fortune-submit {
  background: #d99a3a;
  border-color: #b97c22;
  box-shadow: 0 4px 0 #96631a;
}

html[data-theme='bear'] .fortune-submit:hover:not(:disabled) {
  background: #e8ac4e;
  border-color: #b97c22;
  box-shadow: 0 5px 0 #96631a;
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
