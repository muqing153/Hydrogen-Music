import axios from 'axios'
import { computed, ref } from 'vue'
import { cookie, getLyric, IP, likeMusic } from './api'

export interface Track {
  id: string
  url: string
  name?: string
  artist?: string
  alia?: string
  picUrl?: string
  lyric?: any
}
export class AudioPlayer {
  private audio: HTMLAudioElement
  public playlist = ref<Track[]>([])
  private index = ref(0)

  // 播放模式
  public playMode = ref(0)

  public isPlaying = ref(false)
  public currentTime = ref(0) // 当前播放时间
  public duration = ref(0) // 音频时长
  public volume = ref(1) // 音量

  public constructor() {
    this.audio = new Audio()
    this.audio.preload = 'auto'

    // 事件绑定
    this.audio.addEventListener('play', () => (this.isPlaying.value = true))
    this.audio.addEventListener('pause', () => (this.isPlaying.value = false))
    this.audio.addEventListener('timeupdate', () => {
      // console.log('timeupdate', this.audio.currentTime)
      this.currentTime.value = this.audio.currentTime
    })
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration.value = this.audio.duration
    })
    this.audio.addEventListener('ended', () => {
      this.next()
    })
  }

  public SetPlayMode(mode?: number) {
    if (mode === undefined) {
      mode = this.playMode.value + 1
      if (mode > 3) mode = 0
    }
    this.playMode.value = mode
    switch (mode) {
      case 0: // 顺序播放
        break
      case 1: // 单曲循环
        break
      case 2: // 随机播放
        //打乱playlist
        this.playlist.value = this.playlist.value.sort(() => Math.random() - 0.5)
        break
    }
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
    track.lyric = await getLyric(track.id)
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
    switch (this.playMode.value) {
      case 0: // 顺序播放
      case 1:
        if (this.index.value + 1 >= this.playlist.value.length) {
          this.index.value = 0
        } else {
          this.index.value += 1
        }
        break
      case 2: // 单曲循环
        // this.index.value = this.index.value
        break
    }
    this.playIndex(this.index.value)
  }
  like(id?: string) {
    if (!id) return
    likeMusic(id)
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
