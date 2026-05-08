# LrcTools.ts 使用指南

## 概述

`LrcTools.ts` 是一个专为网易云音乐设计的歌词解析工具，支持所有形式的歌词数据：

- **lrc**: 普通歌词（原文）
- **tlyric**: 翻译歌词
- **romalrc**: 罗马音歌词
- **yrc**: 逐字歌词（新版，支持卡拉OK效果）
- **ytlrc**: 逐字翻译歌词
- **yromalrc**: 逐字罗马音歌词

## 类型定义

### LyricLine - 歌词行接口

```typescript
export interface LyricLine {
  time: number // 时间戳（秒）
  text: string // 原文歌词
  ttext?: string // 翻译歌词
  rtext?: string // 罗马音歌词
  yrcWords?: YrcWord[] // 逐字歌词数据
}
```

### YrcWord - 逐字歌词接口

```typescript
export interface YrcWord {
  word: string // 单个字/词
  startTime: number // 开始时间（秒）
  duration: number // 持续时间（秒）
}
```

### NeteaseLyricResponse - API 响应接口

```typescript
export interface NeteaseLyricResponse {
  lrc?: { lyric: string }
  tlyric?: { lyric: string }
  romalrc?: { lyric: string }
  yrc?: { lyric: string; version?: number }
  ytlrc?: { lyric: string }
  yromalrc?: { lyric: string }
  code?: number
}
```

## API 函数

### 1. parseLrcText - 解析普通 LRC 歌词

解析标准 LRC 格式的歌词文本。

**参数：**

- `lrcText`: LRC 字符串（可为 null 或 undefined）

**返回值：**

- `LrcLine[]` - 包含时间和文本的数组

**示例：**

```typescript
import { parseLrcText } from './LrcTools'

const lrc = `[00:05.50]第一句歌词
[00:10.30]第二句歌词`

const result = parseLrcText(lrc)
// [
//   { time: 5.5, text: "第一句歌词" },
//   { time: 10.3, text: "第二句歌词" }
// ]
```

### 2. parseYrcText - 解析逐字歌词 (YRC)

解析网易云音乐的逐字歌词格式，用于实现卡拉OK效果。

**参数：**

- `yrcText`: YRC 字符串（可为 null 或 undefined）

**返回值：**

- `YrcWord[][]` - 二维数组，外层是行，内层是每行的逐字数据

**示例：**

```typescript
import { parseYrcText } from './LrcTools'

const yrc = `[00:05.50](0,200,0)测(200,150,0)试(350,180,0)歌(530,200,0)曲`

const result = parseYrcText(yrc)
// [
//   [
//     { word: "测", startTime: 5.5, duration: 2.0 },
//     { word: "试", startTime: 5.7, duration: 1.5 },
//     { word: "歌", startTime: 6.03, duration: 1.8 },
//     { word: "曲", startTime: 6.33, duration: 2.0 }
//   ]
// ]
```

### 3. parseNeteaseLyric - 合并所有歌词类型

将多种歌词类型合并为一个统一的数组，支持智能时间匹配。

**参数：**

- `lrc`: 原文歌词
- `tlyric`: 翻译歌词（可选）
- `romalrc`: 罗马音歌词（可选）
- `yrc`: 逐字歌词（可选）
- `ytlrc`: 逐字翻译歌词（可选）
- `yromalrc`: 逐字罗马音歌词（可选）

**返回值：**

- `LyricLine[]` - 合并后的歌词数组

**特性：**

- 自动处理空值
- 智能时间匹配（误差在 0.1 秒内视为相同）
- 优先使用直接匹配的翻译，其次使用逐字翻译

**示例：**

```typescript
import { parseNeteaseLyric } from './LrcTools'

const lrc = `[00:05.50]Hello World`
const tlyric = `[00:05.50]你好世界`
const yrc = `[00:05.50](0,200,0)Hel(200,150,0)lo(350,180,0)World`

const result = parseNeteaseLyric(lrc, tlyric, undefined, yrc)
// [
//   {
//     time: 5.5,
//     text: "Hello World",
//     ttext: "你好世界",
//     yrcWords: [
//       { word: "Hel", startTime: 5.5, duration: 2.0 },
//       { word: "lo", startTime: 5.7, duration: 1.5 },
//       { word: "World", startTime: 6.03, duration: 1.8 }
//     ]
//   }
// ]
```

### 4. parseNeteaseLyricFromResponse - 从 API 响应解析

直接从网易云 API 响应对象中解析歌词，是最简便的使用方式。

**参数：**

- `response`: API 返回的完整响应对象

**返回值：**

- `LyricLine[]` - 解析后的歌词数组

**示例：**

```typescript
import { getLyric } from '@/api'
import { parseNeteaseLyricFromResponse } from './LrcTools'

// 获取歌词
const response = await getLyric(songId)

// 解析歌词
const lyrics = parseNeteaseLyricFromResponse(response)

// 在组件中使用
console.log(lyrics[0].text) // 原文
console.log(lyrics[0].ttext) // 翻译
console.log(lyrics[0].yrcWords) // 逐字数据
```

## 实际应用场景

### 场景 1: 基础歌词显示

```typescript
import { parseNeteaseLyricFromResponse } from './LrcTools'

// 获取并解析歌词
const lyrics = parseNeteaseLyricFromResponse(apiResponse)

// 显示当前歌词
const currentLine = lyrics.find((line) => line.time <= currentTime)
console.log(currentLine?.text)
```

### 场景 2: 双语歌词显示

```typescript
// 显示原文和翻译
lyrics.forEach((line) => {
  console.log(line.text) // 原文
  if (line.ttext) {
    console.log(line.ttext) // 翻译
  }
})
```

### 场景 3: 卡拉OK逐字高亮

```typescript
// 使用逐字歌词实现卡拉OK效果
const currentLine = lyrics.find((line) => line.time <= currentTime)

if (currentLine?.yrcWords) {
  const elapsedInLine = currentTime - currentLine.time

  currentLine.yrcWords.forEach((word) => {
    if (elapsedInLine >= word.startTime && elapsedInLine < word.startTime + word.duration) {
      // 当前正在唱这个字，可以添加高亮效果
      highlightWord(word.word)
    }
  })
}
```

### 场景 4: 带罗马音的日语歌曲

```typescript
// 显示日语歌词、罗马音和翻译
lyrics.forEach((line) => {
  console.log(line.text) // 日语原文
  if (line.rtext) {
    console.log(line.rtext) // 罗马音
  }
  if (line.ttext) {
    console.log(line.ttext) // 中文翻译
  }
})
```

## 注意事项

1. **空值处理**: 所有函数都能安全处理 `null`、`undefined` 和空字符串
2. **时间精度**: 歌词时间匹配允许 0.1 秒的误差，以应对不同歌词版本的时间差异
3. **性能优化**: 解析后的结果建议缓存，避免重复解析
4. **YRC 格式**: 逐字歌词的时间单位：
   - 偏移量：毫秒（需要除以 1000 转换为秒）
   - 持续时间：厘秒（需要除以 100 转换为秒）

## 兼容性

- ✅ 支持旧版 `/lyric` 接口
- ✅ 支持新版 `/lyric/new` 接口
- ✅ 兼容所有歌词类型组合
- ✅ 向后兼容原有代码

## 更新日志

### v2.0 (当前版本)

- ✨ 新增逐字歌词 (YRC) 解析支持
- ✨ 新增罗马音歌词支持
- ✨ 新增逐字翻译和逐字罗马音支持
- 🎯 改进时间匹配算法，支持近似匹配
- 🔧 优化空值处理
- 📝 完善 TypeScript 类型定义

### v1.0

- 基础的 LRC 歌词解析
- 翻译歌词合并功能
