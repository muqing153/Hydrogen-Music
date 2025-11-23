import axios from 'axios'
import { ref, computed } from 'vue'
import { da } from 'vuetify/locale'
import { cookie, IP } from './api'

export interface Track {
  id: string
  url: string
  name?: string
  artist?: string
  alia?: string
  picUrl?: string
}

export class AudioPlayer {
  private static instance: AudioPlayer | null = null
  private audio: HTMLAudioElement
  public playlist = ref<Track[]>([])
  private index = ref(0)

  public isPlaying = ref(false)
  public currentTime = ref(0)
  public duration = ref(0)
  public volume = ref(1)

  private constructor() {
    this.audio = new Audio()
    this.audio.preload = 'auto'

    // 事件绑定
    this.audio.addEventListener('play', () => (this.isPlaying.value = true))
    this.audio.addEventListener('pause', () => (this.isPlaying.value = false))
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.value = this.audio.currentTime
    })
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration.value = this.audio.duration
    })
    this.audio.addEventListener('ended', () => {
      this.next()
    })
  }

  /** 获取单例实例 **/
  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer()
    }
    return AudioPlayer.instance
  }

  /** 添加歌曲 **/
  async addTrack(data: Track | string, playNow = false) {
    let track: Track
    if (typeof data === 'string') {
      //检测是否存在
      if (this.playlist.value.find((t) => t.id === data)) {
        this.playIndex(data)
        return
      }
      // 示例：请求歌曲 URL 和详情
      const urlRes = await axios.get(`${IP}/song/url/v1?id=${data}&level=exhigh&cookie=${cookie}`)
      const infoRes = await axios.get(`${IP}/song/detail?ids=${data}&cookie=${cookie}`)
      // console.log(`${IP}/song/url?id=${data}&cookie=${cookie}`)
      // console.log(urlRes.data)
      track = {
        id: data,
        url: urlRes.data.data[0].url,
        name: infoRes.data.songs[0].name,
        artist: infoRes.data.songs[0].ar.map((a: any) => a.name).join('/'),
        picUrl: infoRes.data.songs[0].al.picUrl,
      }
    } else {
      track = data
    }

    this.playlist.value.push(track)
    if (playNow) {
      // 等待3s
      // await new Promise((resolve) => setTimeout(resolve, 3000))
      this.playIndex(track.id)
    }
  }

  /** 跳到指定歌曲 **/
  playIndex(i: number | string) {
    console.log(typeof i)
    if (typeof i === 'string') {
      i = this.playlist.value.findIndex((t) => t.id === i)
    }
    if (i < 0 || i >= this.playlist.value.length) return
    this.index.value = i
    const track = this.playlist.value[i]
    console.log(track)
    // 加载并播放
    if (track) {
      this.audio.src = track.url
      this.audio.load()
      this.audio.play().catch((err) => console.log('播放失败:', err))
    }
  }

  /** 播放/暂停 **/
  play() {
    this.audio.play().catch((err) => console.log('播放失败:', err))
  }
  pause() {
    this.audio.pause()
  }
  toggle() {
    this.isPlaying.value ? this.pause() : this.play()
  }

  /** 上一首 / 下一首 **/
  prev() {
    if (this.index.value > 0) this.playIndex(this.index.value - 1)
  }
  next() {
    if (this.index.value + 1 >= this.playlist.value.length) {
      this.index.value = 0
    } else {
      this.index.value += 1
    }
    console.log(this.index.value)
    this.playIndex(this.index.value)
  }

  /** 拖动进度条 **/
  seek(time: number) {
    this.audio.currentTime = time
  }

  /** 设置音量 **/
  setVolume(v: number) {
    this.volume.value = v
    this.audio.volume = v
  }

  /** 当前播放的 Track **/
  public currentTrack = computed(() => this.playlist.value[this.index.value] || null)
}

export const player = AudioPlayer.getInstance()
export const rightDrawer = ref(false)
export function openRightDrawer() {
  rightDrawer.value = true
}

export function closeRightDrawer() {
  rightDrawer.value = false
}

export function toggleRightDrawer() {
  rightDrawer.value = !rightDrawer.value
}

export const ButtonPlayerShow = ref(true)
