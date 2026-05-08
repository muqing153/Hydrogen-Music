/**
 * LrcTools 测试文件
 * 用于测试网易云音乐歌词解析功能
 */

import {
  parseLrcText,
  parseYrcText,
  parseNeteaseLyric,
  parseNeteaseLyricFromResponse,
} from './LrcTools'

// 测试普通 LRC 歌词解析
console.log('=== 测试普通 LRC 歌词解析 ===')
const lrcExample = `[00:00.00]测试歌曲
[00:05.50]第一句歌词
[00:10.30]第二句歌词
[00:15.80]第三句歌词`

const parsedLrc = parseLrcText(lrcExample)
console.log('解析结果:', parsedLrc)
console.log('')

// 测试翻译歌词解析
console.log('=== 测试翻译歌词解析 ===')
const tlyricExample = `[00:05.50]First line lyrics
[00:10.30]Second line lyrics
[00:15.80]Third line lyrics`

const parsedTlyric = parseLrcText(tlyricExample)
console.log('翻译歌词解析结果:', parsedTlyric)
console.log('')

// 测试逐字歌词 (YRC) 解析
console.log('=== 测试逐字歌词 (YRC) 解析 ===')
const yrcExample = `[00:05.50](0,200,0)测(200,150,0)试(350,180,0)歌(530,200,0)曲
[00:10.30](0,180,0)第(180,200,0)一(380,150,0)句(530,200,0)歌(730,180,0)词
[00:15.80](0,200,0)第(200,180,0)二(380,150,0)句(530,200,0)歌(730,180,0)词`

const parsedYrc = parseYrcText(yrcExample)
console.log('逐字歌词解析结果:', JSON.stringify(parsedYrc, null, 2))
console.log('')

// 测试合并所有歌词类型
console.log('=== 测试合并所有歌词类型 ===')
const mergedLyrics = parseNeteaseLyric(
  lrcExample, // 原文
  tlyricExample, // 翻译
  undefined, // 罗马音（无）
  yrcExample, // 逐字歌词
  undefined, // 逐字翻译（无）
  undefined, // 逐字罗马音（无）
)

console.log('合并后的歌词:', JSON.stringify(mergedLyrics, null, 2))
console.log('')

// 测试从 API 响应解析
console.log('=== 测试从 API 响应解析 ===')
const apiResponse = {
  lrc: { lyric: lrcExample },
  tlyric: { lyric: tlyricExample },
  romalrc: { lyric: undefined },
  yrc: { lyric: yrcExample, version: 1 },
  ytlrc: { lyric: undefined },
  yromalrc: { lyric: undefined },
  code: 200,
}

const parsedFromResponse = parseNeteaseLyricFromResponse(apiResponse)
console.log('从 API 响应解析的结果:', JSON.stringify(parsedFromResponse, null, 2))
console.log('')

// 测试空值处理
console.log('=== 测试空值处理 ===')
const emptyResult = parseLrcText(null)
console.log('null 输入结果:', emptyResult)

const emptyStringResult = parseLrcText('')
console.log('空字符串输入结果:', emptyStringResult)

const undefinedResult = parseLrcText(undefined)
console.log('undefined 输入结果:', undefinedResult)
console.log('')

// 测试时间近似匹配
console.log('=== 测试时间近似匹配 ===')
const lrcWithDifferentTimes = `[00:05.50]原文歌词`
const tlyricWithDifferentTimes = `[00:05.52]翻译歌词` // 时间略有不同

const mergedWithApproximation = parseNeteaseLyric(lrcWithDifferentTimes, tlyricWithDifferentTimes)
console.log('时间近似匹配结果:', JSON.stringify(mergedWithApproximation, null, 2))
console.log('')

console.log('✅ 所有测试完成！')
