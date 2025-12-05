//
export interface LyricLine {
  time: number
  text: string
  ttext?: string
  rtext?: string
}
export interface LrcLine {
  time: number
  text: string
}
/**
 * 解析单条 LRC 文本
 * @param lrcText LRC 字符串
 * @returns 每行 {time, text} 数组
 */

export function parseLrcText(lrcText?: string | null): LrcLine[] {
  if (!lrcText) return []

  const lines = lrcText.split(/\r?\n/)
  const result: LrcLine[] = []

  const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g

  lines.forEach((line) => {
    const tags = [...line.matchAll(timeReg)]
    const content = line.replace(timeReg, '').trim()
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

// 合并 LRC + 翻译 + 罗马音
export function parseNeteaseLyric(lrc: string, tlyric?: string, rlyric?: string): LyricLine[] {
  const lrcLines = parseLrcText(lrc)
  // console.log(lrcLines)
  const tLines = parseLrcText(tlyric ?? '')
  const rLines = parseLrcText(rlyric ?? '')

  // 合并成 LyricLine
  const tMap = new Map(tLines.map((i) => [i.time, i.text]))
  const rMap = new Map(rLines.map((i) => [i.time, i.text]))

  const result: LyricLine[] = lrcLines.map((line) => ({
    time: line.time,
    text: line.text,
    ttext: tMap.get(line.time),
    rtext: rMap.get(line.time),
  }))

  return result
}
