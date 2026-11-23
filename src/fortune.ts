import type { ThemeName } from './theme'

export interface Fortune {
  level: string
  line: string
  todo: string
}

const CAT_FORTUNES: Fortune[] = [
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

const BEAR_FORTUNES: Fortune[] = [
  { level: '大吉', line: '今天适合抱一个软软的东西，也适合什么都不做。', todo: '给自己倒一杯温水。' },
  { level: '中吉', line: '慢一点没关系，小熊也是睡醒了才伸懒腰的。', todo: '站起来伸一个长长的懒腰。' },
  { level: '小吉', line: '你不需要一直有用，靠着树发会儿呆也很好。', todo: '看窗外三分钟，什么都不想。' },
  { level: '吉', line: '今天的好运藏在很小的东西里，比如一勺蜂蜜。', todo: '认真尝一口喜欢的东西。' },
  { level: '平', line: '如果今天有点累，就把肩膀放下来。', todo: '深呼吸三次，慢慢吐气。' },
  { level: '大吉', line: '小熊已经把树荫留了一块给你。', todo: '去有风的地方站一会儿。' },
  { level: '中吉', line: '想不明白的事，可以先放在熊爪上。', todo: '把一件烦心事写在纸上，折起来。' },
  { level: '小吉', line: '今天会遇到一件刚刚好的小事。', todo: '对一个人说一句谢谢。' },
  { level: '吉', line: '不必把每一分钟都填满，空着也很好。', todo: '允许自己发五分钟的呆。' },
  { level: '平', line: '今天适合早一点放下手机。', todo: '睡前把屏幕调暗一点。' },
  { level: '大吉', line: '你被认真地惦记着，只是你还不知道。', todo: '快给小熊发个表情骚扰他！' },
  { level: '中吉', line: '小熊觉得，你今天已经很努力了。', todo: '奖励自己一口喜欢的东西。' },
  { level: '小吉', line: '有些答案会自己走过来，不用追。', todo: '把问题留到明天再想。' },
  { level: '吉', line: '今天的风很轻，适合慢慢走。', todo: '走一段不带目的的路。' },
  { level: '平', line: '什么都不发生，也是一种好运。', todo: '安静地坐一会儿。' },
  { level: '中吉', line: '你可以随时回来，小熊都在这儿。', todo: '累了就关掉页面，去好好休息。' },
]

function pad(value: number) {
  return String(value).padStart(2, '0')
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

export function fortuneFor(theme: ThemeName, date = new Date()): Fortune {
  const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${theme}`
  const list = theme === 'bear' ? BEAR_FORTUNES : CAT_FORTUNES
  return list[hash(key) % list.length]
}
