import axios from 'axios'
import { computed, ref } from 'vue'
import { cookie, getLikedSongs, getLyric, getPlaylist, IP, likeMusic } from './api'

export interface Track {
  id: string
  url: string
  name?: string
  artist?: string
  alia?: string
  picUrl?: string
  lyric?: any
}

// 播放模式枚举
export enum PlayMode {
  Sequential = 0, // 顺序播放
  Loop = 1, // 单曲循环
  Shuffle = 2, // 随机播放
  ListLoop = 3, // 列表循环
}

// 全局单例实例（HMR 保护）
let globalInstance: AudioPlayer | null = null

export class AudioPlayer {
  private audio: HTMLAudioElement
  public playlist = ref<Track[]>([])
  private index = ref(0)

  // 全局当前播放的歌单
  public PlaylistUID = ref('')
  // 播放模式
  public playMode = ref(0)

  public isPlaying = ref(false)
  public currentTime = ref(0) // 当前播放时间
  public duration = ref(0) // 音频时长
  public volume = ref(1) // 音量
  // 喜欢的歌曲列表
  public likedSongs = ref<Set<string>>(new Set())
  private audioContext: AudioContext
  private analyser: AnalyserNode
  private source: MediaElementAudioSourceNode | null = null

  public constructor() {
    this.audio = new Audio()
    this.audio.preload = 'auto'

    // 创建 AudioContext（延迟初始化以避免 HMR 问题）
    this.audioContext = new AudioContext()
    this.analyser = this.audioContext.createAnalyser()

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

    this.source = this.audioContext.createMediaElementSource(this.audio)

    this.source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)
    this.audio.crossOrigin = 'anonymous'
    this.analyser.fftSize = 256

    // 初始化时加载用户喜欢的歌曲列表
    this.loadLikedSongs()
  }

  /** 加载用户喜欢的歌曲列表 **/
  async loadLikedSongs() {
    try {
      const data = await getLikedSongs()
      if (data && data.ids) {
        this.likedSongs.value = new Set(data.ids.map((id: number) => id.toString()))
        console.log(`已加载 ${this.likedSongs.value.size} 首喜欢的歌曲`)
      }
    } catch (error) {
      console.error('加载喜欢歌曲列表失败:', error)
    }
  }

  public SetPlayMode(mode?: number) {
    if (mode === undefined) {
      mode = this.playMode.value + 1
      if (mode > 3) mode = 0
    }
    this.playMode.value = mode

    // 只在切换到随机模式时打乱播放列表
    if (mode === PlayMode.Shuffle) {
      this.shufflePlaylist()
    }
  }

  /** 打乱播放列表（创建副本，避免修改原数组） */
  private shufflePlaylist() {
    const shuffled = [...this.playlist.value]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
    }
    this.playlist.value = shuffled
  }

  /** 添加歌曲 **/
  async addTrack(data: Track | string, playNow = false) {
    try {
      let track: Track

      if (typeof data === 'string') {
        // 检测是否已存在
        const existingIndex = this.playlist.value.findIndex((t) => t.id === data)
        if (existingIndex !== -1) {
          if (playNow) {
            this.playIndex(existingIndex)
          }
          return
        }

        // 并行请求歌曲 URL 和详情，提升性能
        const [urlRes, infoRes] = await Promise.all([
          axios.get(`${IP}/song/url/v1?id=${data}&level=exhigh&cookie=${cookie}`),
          axios.get(`${IP}/song/detail?ids=${data}&cookie=${cookie}`),
        ])

        const songData = infoRes.data.songs[0]
        track = {
          id: data,
          url: urlRes.data.data[0].url,
          name: songData.name,
          artist: songData.ar.map((a: any) => a.name).join('/'),
          picUrl: songData.al.picUrl + '?param=512y512',
        }
      } else {
        track = data
      }

      // 异步获取歌词，不阻塞添加操作
      track.lyric = await getLyric(track.id)
      this.playlist.value.push(track)

      if (playNow) {
        this.playIndex(this.playlist.value.length - 1)
      }
    } catch (error) {
      console.error('添加歌曲失败:', error)
      throw error
    }
  }

  /** 跳到指定歌曲 **/
  playIndex(i: number | string) {
    if (typeof i === 'string') {
      i = this.playlist.value.findIndex((t) => t.id === i)
    }

    if (i < 0 || i >= this.playlist.value.length) {
      console.warn('无效的播放索引:', i)
      return
    }

    this.index.value = i
    const track = this.playlist.value[i]

    if (track) {
      this.audio.src = track.url
      this.audio.load()
      this.play().catch((err) => {
        console.error('播放失败:', err)
      })
    }
  }

  // 加载歌单
  async loadPlaylist(ids: string) {
    try {
      // 清空歌单列表
      this.playlist.value = []
      // 清空播放
      this.pause()
      // 写入全局当前播放歌单
      this.PlaylistUID.value = ids
      const res = await getPlaylist(ids)

      // 并行获取所有歌曲的 URL 和歌词，提升加载速度
      const songs = await Promise.all(
        res.songs.map(async (data: any) => {
          try {
            // 并行请求：URL + 歌词
            const [urlRes, lyricData] = await Promise.all([
              axios.get(`${IP}/song/url/v1?id=${data.id}&level=exhigh&cookie=${cookie}`),
              getLyric(data.id).catch((err) => {
                console.warn(`获取歌曲 ${data.id} 歌词失败:`, err)
                return null
              }),
            ])

            // 🔍 调试日志：检查歌词数据结构
            if (lyricData) {
              console.log(`歌曲 ${data.id} 歌词数据:`, {
                hasLrc: !!lyricData.lrc?.lyric,
                hasTlyric: !!lyricData.tlyric?.lyric,
                lrcLength: lyricData.lrc?.lyric?.length || 0,
              })
            } else {
              console.warn(`歌曲 ${data.id} 没有歌词数据`)
            }

            return {
              id: data.id,
              name: data.name,
              artist: data.ar.map((a: any) => a.name).join('/'),
              picUrl: data.al.picUrl + '?param=512y512',
              url: urlRes.data.data[0]?.url || '',
              lyric: lyricData, // ✅ 添加歌词数据
            } as Track
          } catch (error) {
            console.error(`获取歌曲 ${data.id} 信息失败:`, error)
            return null
          }
        }),
      )

      // 过滤掉失败的歌曲
      const validSongs = songs.filter((song): song is Track => song !== null && song.url !== '')
      this.playlist.value = validSongs

      if (validSongs.length > 0) {
        const firstSong = validSongs[0]!
        console.log('歌单加载完成，第一首歌:', {
          id: firstSong.id,
          name: firstSong.name,
          hasLyric: !!firstSong.lyric,
          lyricStructure: firstSong.lyric ? Object.keys(firstSong.lyric) : null,
        })
        this.playIndex(0)
      } else {
        console.warn('歌单中没有可用的歌曲')
      }
    } catch (error) {
      console.error('加载歌单失败:', error)
      throw error
    }
  }

  /** 播放/暂停 **/
  async play() {
    try {
      // 恢复 AudioContext（浏览器自动播放策略要求）
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      await this.audio.play()
    } catch (err) {
      console.warn('播放失败，尝试重新获取音频 URL:', err)

      const id = this.currentTrack.value?.id
      if (!id) {
        console.error('没有当前播放的歌曲')
        return
      }

      try {
        // 重新获取歌曲信息
        const [urlRes, infoRes] = await Promise.all([
          axios.get(`${IP}/song/url/v1?id=${id}&level=exhigh&cookie=${cookie}`),
          axios.get(`${IP}/song/detail?ids=${id}&cookie=${cookie}`),
        ])

        const newData: Track = {
          id: id,
          url: urlRes.data.data[0].url,
          name: infoRes.data.songs[0].name,
          artist: infoRes.data.songs[0].ar.map((a: any) => a.name).join('/'),
          picUrl: infoRes.data.songs[0].al.picUrl + '?param=512y512',
          lyric: await getLyric(id),
        }

        // 更新 playlist 中的歌曲信息
        const idx = this.playlist.value.findIndex((t) => t.id === id)
        if (idx !== -1) {
          this.playlist.value[idx] = newData
          console.log('已更新歌曲信息')
        }

        // 重新设置音频源并播放
        this.audio.src = newData.url
        this.audio.load()
        await this.audio.play()

        console.log('重新播放成功')
      } catch (retryError) {
        console.error('重新获取音频 URL 失败:', retryError)
        throw retryError
      }
    }
  }
  pause() {
    this.audio.pause()
  }
  toggle() {
    this.isPlaying.value ? this.pause() : this.play()
  }

  /** 上一首 / 下一首 **/
  prev() {
    if (this.playlist.value.length === 0) return

    let newIndex: number
    switch (this.playMode.value) {
      case PlayMode.Sequential:
      case PlayMode.ListLoop:
        newIndex = this.index.value > 0 ? this.index.value - 1 : this.playlist.value.length - 1
        break
      case PlayMode.Shuffle:
        newIndex = Math.floor(Math.random() * this.playlist.value.length)
        break
      case PlayMode.Loop:
        newIndex = this.index.value // 单曲循环，不变
        break
      default:
        newIndex = this.index.value > 0 ? this.index.value - 1 : this.playlist.value.length - 1
    }

    this.playIndex(newIndex)
  }

  next() {
    if (this.playlist.value.length === 0) return

    let newIndex: number
    switch (this.playMode.value) {
      case PlayMode.Sequential:
        // 顺序播放：到最后一首后停止或循环
        newIndex = (this.index.value + 1) % this.playlist.value.length
        break
      case PlayMode.ListLoop:
        // 列表循环：到最后一首后回到第一首
        newIndex = (this.index.value + 1) % this.playlist.value.length
        break
      case PlayMode.Shuffle:
        // 随机播放
        newIndex = Math.floor(Math.random() * this.playlist.value.length)
        break
      case PlayMode.Loop:
        // 单曲循环：不变
        newIndex = this.index.value
        break
      default:
        newIndex = (this.index.value + 1) % this.playlist.value.length
    }

    this.playIndex(newIndex)
  }
  like(id?: string) {
    if (!id) return

    // 切换喜欢状态
    const isLiked = this.isSongLiked(id)
    const newLikeStatus = !isLiked

    // 更新本地状态
    if (newLikeStatus) {
      this.likedSongs.value.add(id)
    } else {
      this.likedSongs.value.delete(id)
    }

    // 调用 API 更新服务器状态
    likeMusic(id, newLikeStatus)
      .then(() => {
        console.log(`歌曲 ${id} 喜欢状态已更新为: ${newLikeStatus}`)
      })
      .catch((err) => {
        console.error('更新喜欢状态失败:', err)
        // 如果 API 调用失败，回滚本地状态
        if (newLikeStatus) {
          this.likedSongs.value.delete(id)
        } else {
          this.likedSongs.value.add(id)
        }
      })
  }

  /** 检查歌曲是否已喜欢 **/
  isSongLiked(id: string): boolean {
    return this.likedSongs.value.has(id)
  }

  /** 设置音量 **/
  setVolume(v: number) {
    this.volume.value = v
    this.audio.volume = v
  }

  getFrequencyData() {
    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    this.analyser.getByteFrequencyData(dataArray)

    return dataArray
  }

  getVolume() {
    const data = this.getFrequencyData()
    let sum = 0

    for (let i = 0; i < data.length; i++) {
      sum += data[i]!
    }

    return sum / data.length
  }

  /** 当前播放的 Track **/
  public currentTrack = computed(() => this.playlist.value[this.index.value] || null)

  /** 获取播放模式名称 **/
  public getPlayModeName(): string {
    const modeNames: Record<number, string> = {
      [PlayMode.Sequential]: '顺序播放',
      [PlayMode.Loop]: '单曲循环',
      [PlayMode.Shuffle]: '随机播放',
      [PlayMode.ListLoop]: '列表循环',
    }
    return modeNames[this.playMode.value] || '顺序播放'
  }

  /** 清空播放列表 **/
  clearPlaylist() {
    this.pause()
    this.playlist.value = []
    this.index.value = 0
    this.currentTime.value = 0
    this.duration.value = 0
  }

  /** 从播放列表中移除歌曲 **/
  removeTrack(index: number) {
    if (index < 0 || index >= this.playlist.value.length) return

    this.playlist.value.splice(index, 1)

    // 如果删除的是当前播放的歌曲，跳到下一首
    if (index === this.index.value) {
      if (this.playlist.value.length > 0) {
        this.playIndex(Math.min(index, this.playlist.value.length - 1))
      } else {
        this.clearPlaylist()
      }
    } else if (index < this.index.value) {
      // 如果删除的是当前播放之前的歌曲，调整索引
      this.index.value--
    }
  }

  /** 跳转到指定时间（支持相对和绝对时间） **/
  seek(time: number, relative = false) {
    if (relative) {
      this.audio.currentTime += time
    } else {
      this.audio.currentTime = Math.max(0, Math.min(time, this.duration.value))
    }
  }

  /** 快进/快退 **/
  skip(seconds: number) {
    this.seek(seconds, true)
  }

  /** 格式化时间为 mm:ss **/
  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

// 导出单例获取函数（HMR 安全）
export function getPlayer(): AudioPlayer {
  if (!globalInstance) {
    globalInstance = new AudioPlayer()

    // HMR 清理：模块热替换时保留实例
    if (import.meta.hot) {
      import.meta.hot.accept()
      import.meta.hot.dispose(() => {
        // 可选：在 HMR 时暂停播放，避免音频混乱
        if (globalInstance) {
          globalInstance.pause()
        }
      })
    }
  }
  return globalInstance
}
