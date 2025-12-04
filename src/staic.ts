import { ref } from 'vue'
import { AudioPlayer } from './player'

export const AudioViewShow = ref(false)
export const player = new AudioPlayer()
export function sliderStart(value: number) {
  player.seek(value)
  player.pause()
}
export function sliderEnd(value: number) {
  player.seek(value)
  player.play()
}