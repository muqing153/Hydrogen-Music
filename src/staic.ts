import { ref } from 'vue'
import { getPlayer } from './player'
export const AudioViewShow = ref(false)
// 使用单例模式获取播放器实例（HMR 安全）
export const player = getPlayer()
export const PlaylistUID = ref('')
export function sliderStart(value: number) {
  player.currentTime.value = value
  player.seek(value)
  player.pause()
}
export function sliderEnd(value: number) {
  player.seek(value)
  player.play()
}
// "NeteaseCloudMusicApi": "^4.28.0",
