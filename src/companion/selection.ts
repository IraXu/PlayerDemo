import type { TheaterScene } from './motion'

export const interactionScenes: readonly TheaterScene[] = ['pet', 'nuzzle', 'bite', 'grape', 'coffee', 'cry']

/** Draw uniformly without replacement, then start a fresh round. */
function createRoundPicker<T>(items: readonly T[], random: () => number) {
  let remaining: T[] = []
  return (): T => {
    if (remaining.length === 0) remaining = [...items]
    return remaining.splice(Math.floor(random() * remaining.length), 1)[0]!
  }
}

export function createScenePicker(random: () => number = () => Math.random()) {
  return createRoundPicker(interactionScenes, random)
}

export const dogStyles = ['cream', 'husky', 'stubborn'] as const
export type DogStyle = typeof dogStyles[number]
export const dogNames: Record<DogStyle, string> = {
  cream: '奶油垂耳狗', husky: '灰白哈士奇', stubborn: '犟种柴犬',
}
export function createDogPicker(random: () => number = () => Math.random()) {
  return createRoundPicker(dogStyles, random)
}
