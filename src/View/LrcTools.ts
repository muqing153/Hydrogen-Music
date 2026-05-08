// 网易云音乐歌词解析工具

export interface LyricLine {
  time: number
  text: string
  ttext?: string // 翻译歌词
  rtext?: string // 罗马音歌词
  yrcWords?: YrcWord[] // 逐字歌词数据
}

export interface LrcLine {
  time: number
  text: string
}

export interface YrcWord {
  word: string // 单个字/词
  startTime: number // 开始时间（秒）
  duration: number // 持续时间（秒）
}

export interface NeteaseLyricResponse {
  lrc?: { lyric: string }
  tlyric?: { lyric: string }
  romalrc?: { lyric: string }
  yrc?: { lyric: string; version?: number }
  ytlrc?: { lyric: string }
  yromalrc?: { lyric: string }
  code?: number
}
/**
 * 解析单条 LRC 文本
 * @param lrcText LRC 字符串
 * @returns 每行 {time, text} 数组
 */
export function parseLrcText(lrcText?: string | null): LrcLine[] {
  if (!lrcText || lrcText.trim() === '') return []

  const lines = lrcText.split(/\r?\n/)
  const result: LrcLine[] = []

  const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g

  lines.forEach((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    const tags = [...trimmedLine.matchAll(timeReg)]
    const content = trimmedLine.replace(timeReg, '').trim()

    if (!content) return

    if (tags.length === 0) {
      // 没有时间标签 → 默认时间 0
      result.push({ time: 0, text: content })
    } else {
      tags.forEach((t) => {
        const min = Number(t[1])
        const sec = Number(t[2])
        const ms = Number(String(t[3] ?? '0').padEnd(3, '0'))
        const time = min * 60 + sec + ms / 1000
        result.push({ time, text: content })
      })
    }
  })

  result.sort((a, b) => a.time - b.time)
  return result
}

/**
 * 解析逐字歌词 (YRC 格式)
 * @param yrcText 逐字歌词字符串
 * @returns 逐字歌词数组
 */
export function parseYrcText(yrcText?: string | null): YrcWord[][] {
  if (!yrcText || yrcText.trim() === '') return []

  const lines = yrcText.split(/\r?\n/)
  const result: YrcWord[][] = []

  // YRC 格式: [mm:ss.xxx](xxx,xxx,x)文字内容
  const lineTimeReg = /\[(\d{2}):(\d{2})\.?(\d{0,3})\]/
  const wordReg = /\((\d+),(\d+),\d+\)([^\(]+)/g

  lines.forEach((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    const timeMatch = trimmedLine.match(lineTimeReg)
    if (!timeMatch) return

    const min = Number(timeMatch[1])
    const sec = Number(timeMatch[2])
    const ms = Number((timeMatch[3] ?? '0').padEnd(3, '0'))
    const lineStartTime = min * 60 + sec + ms / 1000

    const words: YrcWord[] = []
    let wordMatch

    while ((wordMatch = wordReg.exec(trimmedLine)) !== null) {
      const offset = Number(wordMatch[1]) / 1000 // 转换为秒
      const duration = Number(wordMatch[2]) / 100 // 转换为秒
      const word = wordMatch[3]?.trim() || ''

      if (word) {
        words.push({
          word,
          startTime: lineStartTime + offset,
          duration,
        })
      }
    }

    if (words.length > 0) {
      result.push(words)
    }
  })

  return result
}

/**
 * 合并 LRC + 翻译 + 罗马音 + 逐字歌词
 * 支持网易云音乐所有歌词形式
 * @param lrc 原文歌词
 * @param tlyric 翻译歌词
 * @param romalrc 罗马音歌词
 * @param yrc 逐字歌词
 * @param ytlrc 逐字翻译歌词
 * @param yromalrc 逐字罗马音歌词
 * @returns 合并后的歌词数组
 */
export function parseNeteaseLyric(
  lrc: string | undefined | null,
  tlyric?: string | null,
  romalrc?: string | null,
  yrc?: string | null,
  ytlrc?: string | null,
  yromalrc?: string | null,
): LyricLine[] {
  const lrcLines = parseLrcText(lrc)
  const tLines = parseLrcText(tlyric)
  const rLines = parseLrcText(romalrc)
  const ytLines = parseLrcText(ytlrc)
  const yrLines = parseLrcText(yromalrc)
  const yrcWords = parseYrcText(yrc)

  // 创建映射表，使用更精确的时间匹配
  const tMap = new Map<number, string>()
  const rMap = new Map<number, string>()
  const ytMap = new Map<number, string>()
  const yrMap = new Map<number, string>()

  // 辅助函数：找到最接近的时间点
  const findClosestTime = (time: number, map: Map<number, string>): string | undefined => {
    // 直接匹配
    if (map.has(time)) return map.get(time)

    // 查找时间差在 0.1 秒内的近似匹配
    let closestTime: number | null = null
    let minDiff = 0.1

    for (const [key] of map) {
      const diff = Math.abs(key - time)
      if (diff < minDiff) {
        minDiff = diff
        closestTime = key
      }
    }

    return closestTime !== null ? map.get(closestTime) : undefined
  }

  tLines.forEach((line) => tMap.set(line.time, line.text))
  rLines.forEach((line) => rMap.set(line.time, line.text))
  ytLines.forEach((line) => ytMap.set(line.time, line.text))
  yrLines.forEach((line) => yrMap.set(line.time, line.text))

  // 合并成 LyricLine
  const result: LyricLine[] = lrcLines.map((line, index) => {
    const ttext = findClosestTime(line.time, tMap)
    const rtext = findClosestTime(line.time, rMap)

    // 如果没有直接匹配的翻译，尝试使用逐字翻译
    const finalTtext = ttext || findClosestTime(line.time, ytMap)
    const finalRtext = rtext || findClosestTime(line.time, yrMap)

    return {
      time: line.time,
      text: line.text,
      ttext: finalTtext,
      rtext: finalRtext,
      yrcWords: yrcWords[index] || undefined,
    }
  })

  return result
}

/**
 * 从网易云 API 响应中解析歌词
 * @param response API 响应数据
 * @returns 解析后的歌词数组
 */
export function parseNeteaseLyricFromResponse(response: any): LyricLine[] {
  if (!response) return []

  const lrc = response.lrc?.lyric
  const tlyric = response.tlyric?.lyric
  const romalrc = response.romalrc?.lyric
  const yrc = response.yrc?.lyric
  const ytlrc = response.ytlrc?.lyric
  const yromalrc = response.yromalrc?.lyric

  return parseNeteaseLyric(lrc, tlyric, romalrc, yrc, ytlrc, yromalrc)
}
