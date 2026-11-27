import type { TheaterScene } from './motion'

export const interactionScenes: readonly TheaterScene[] = ['pet', 'nuzzle', 'bite', 'grape', 'coffee']

/** Equal chance among eligible scenes. After a pair, omit that scene for one draw. */
export function createScenePicker(random: () => number = () => Math.random()) {
  let previous: TheaterScene | null = null
  let streak = 0
  return (): TheaterScene => {
    const eligible = streak >= 2 ? interactionScenes.filter(scene => scene !== previous) : interactionScenes
    const selected = eligible[Math.floor(random() * eligible.length)]!
    streak = selected === previous ? streak + 1 : 1
    previous = selected
    return selected
  }
}
