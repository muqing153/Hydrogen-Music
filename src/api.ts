import axios from 'axios'
// 开发环境使用代理，生产环境使用完整 URL
const isDev = import.meta.env.DEV
export const IP = isDev ? '/api' : 'http://192.168.124.4:3000'

// Cookie 管理
let cookieValue = ''

export function getCookie(): string {
  return cookieValue
}

export function setCookie(cookie: string): void {
  cookieValue = cookie
  // 持久化到 localStorage
  if (cookie) {
    localStorage.setItem('music_cookie', cookie)
  } else {
    localStorage.removeItem('music_cookie')
  }
}

// 初始化时从 localStorage 恢复 cookie
const savedCookie = localStorage.getItem('music_cookie')
if (savedCookie) {
  cookieValue = savedCookie
}

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 二维码登录接口类型定义
interface QRCodeKeyResponse {
  code: number
  data: {
    unikey: string
  }
}

interface QRCodeCreateResponse {
  code: number
  data: {
    qrimg: string
    qrurl: string
  }
}

interface QRCodeCheckResponse {
  code: number
  message?: string
  cookie?: string
}

/**
 * 二维码登录流程
 * @returns Promise<{ success: boolean, data?: { key: string, qrBase64: string, qrUrl: string }, message?: string }>
 */
export async function qrcodeLogin(): Promise<{
  success: boolean
  data?: {
    key: string
    qrBase64: string
    qrUrl: string
  }
  message?: string
}> {
  try {
    // 步骤1: 获取二维码 key
    console.log('[登录] 步骤1: 获取二维码 key...')
    const keyResponse = await axios.get<QRCodeKeyResponse>(`${IP}/login/qr/key`, {
      params: {
        timestamp: Date.now(),
      },
    })

    if (keyResponse.data.code !== 200) {
      throw new Error('获取二维码 key 失败')
    }

    const key = keyResponse.data.data.unikey
    console.log('[登录] 获取到 key:', key)

    // 步骤2: 生成二维码
    console.log('[登录] 步骤2: 生成二维码...')
    const qrResponse = await axios.get<QRCodeCreateResponse>(`${IP}/login/qr/create`, {
      params: {
        key,
        qrimg: true,
        timestamp: Date.now(),
      },
    })

    if (qrResponse.data.code !== 200) {
      throw new Error('生成二维码失败')
    }

    const qrBase64 = qrResponse.data.data.qrimg
    const qrUrl = qrResponse.data.data.qrurl
    console.log('[登录] 二维码已生成')

    // 返回二维码数据供前端显示
    return {
      success: true,
      data: {
        key,
        qrBase64,
        qrUrl,
      },
    }
  } catch (error) {
    console.error('[登录] 错误:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '登录失败',
    }
  }
}

/**
 * 检查二维码扫描状态
 * @param key 二维码 key
 * @returns Promise<{ status: 'waiting' | 'scanned' | 'authorized' | 'expired', cookie?: string }>
 */
export async function checkQRCodeStatus(key: string): Promise<{
  status: 'waiting' | 'scanned' | 'authorized' | 'expired'
  cookie?: string
  message?: string
}> {
  try {
    const response = await axios.get<QRCodeCheckResponse>(`${IP}/login/qr/check`, {
      params: {
        key,
        timestamp: Date.now(),
      },
    })

    const { code, cookie } = response.data

    // 800: 二维码过期
    // 801: 等待扫码
    // 802: 待确认
    // 803: 授权登录成功
    switch (code) {
      case 800:
        return { status: 'expired', message: '二维码已过期' }
      case 801:
        return { status: 'waiting', message: '等待扫码' }
      case 802:
        return { status: 'scanned', message: '已扫码，请在手机上确认' }
      case 803:
        // 登录成功，保存 cookie
        if (cookie) {
          setCookie(cookie)
          console.log('[登录] 登录成功，cookie 已保存')
        }
        return { status: 'authorized', cookie, message: '登录成功' }
      default:
        return { status: 'waiting', message: '未知状态' }
    }
  } catch (error) {
    console.error('[登录] 检查状态失败:', error)
    return {
      status: 'waiting',
      message: error instanceof Error ? error.message : '检查状态失败',
    }
  }
}

/**
 * 退出登录
 */
export function logout(): void {
  setCookie('')
  console.log('[登录] 已退出登录')
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return cookieValue !== '' && cookieValue.length > 0
}

// 导出旧的常量（兼容性）
export const cookie = ''
export async function recommendResource(): Promise<any> {
  //如果本地 localStorage 存在 recommendResource 数据
  let data = localStorage.getItem('recommendResource')
  if (data && data !== undefined && data !== null && data !== 'undefined') {
    console.log('get recommendResource from localStorage  ')
    return Promise.resolve(JSON.parse(data))
  }
  console.log('get recommendResource from api  ')
  data = (
    await axios({
      method: 'get',
      url: IP + '/recommend/resource' + (cookieValue ? '?cookie=' + cookieValue : ''),
    })
  ).data
  localStorage.setItem('recommendResource', JSON.stringify(data))
  return Promise.resolve(data)
}

// 获取歌单
export async function getPlaylist(uid: string, offset: number = 1): Promise<any> {
  let data = (
    await axios({
      method: 'get',
      url: `${IP}/playlist/track/all?id=${uid}&limit=10&offset=${offset}${cookieValue ? '&cookie=' + cookieValue : ''}`,
    })
  ).data
  return Promise.resolve(data)
}

// 获取歌单详情
export async function getPlaylistDetail(id: string): Promise<any> {
  try {
    const response = await axios({
      method: 'get',
      url: `${IP}/playlist/detail?id=${id}${cookieValue ? '&cookie=' + cookieValue : ''}`,
    })
    return response.data
  } catch (error) {
    console.error('获取歌单详情失败:', error)
    throw error
  }
}

export async function getLyric(id: string): Promise<any> {
  try {
    const response = await axios({
      method: 'get',
      url: `${IP}/lyric?id=${id}`,
    })

    const data = response.data

    // 🔍 调试日志
    if (!data || !data.lrc) {
      console.warn(`歌曲 ${id} 歌词 API 返回异常:`, data)
    }

    return data
  } catch (error) {
    console.error(`获取歌曲 ${id} 歌词时发生错误:`, error)
    throw error
  }
}

// 喜欢音乐
export async function likeMusic(id: string, like?: boolean): Promise<any> {
  let likes
  if (like === undefined) {
    // 如果未指定 like 参数，则切换喜欢状态
    likes = ''
  } else {
    likes = like ? '&like=true' : '&like=false'
  }
  console.log(`${IP}/like?id=${id}${likes}${cookieValue ? '&cookie=' + cookieValue : ''}`)
  let data = (
    await axios({
      method: 'get',
      url: `${IP}/like?id=${id}${likes}${cookieValue ? '&cookie=' + cookieValue : ''}`,
    })
  ).data
  return Promise.resolve(data)
}

// 获取用户喜欢的歌曲列表
export async function getLikedSongs(): Promise<any> {
  try {
    const response = await axios({
      method: 'get',
      url: `${IP}/likelist?uid=0${cookieValue ? '&cookie=' + cookieValue : ''}`, // uid=0 表示当前登录用户
    })
    return response.data
  } catch (error) {
    console.error('获取喜欢歌曲列表失败:', error)
    throw error
  }
}

// 获取排行榜歌单
export async function getTopList(): Promise<any> {
  //如果本地 localStorage 存在 getTopList 数据
  let data = localStorage.getItem('getTopList')
  if (data && data !== undefined && data !== null && data !== 'undefined') {
    console.log('get getTopList from localStorage  ')
    return Promise.resolve(JSON.parse(data))
  }
  data = (
    await axios({
      method: 'get',
      url: IP + '/toplist',
    })
  ).data
  localStorage.setItem('getTopList', JSON.stringify(data))
  return Promise.resolve(data)
}

// 获取每日推荐音乐
export async function getRecommendMusic(): Promise<any> {
  //如果本地 localStorage 存在 getRecommendMusic 数据
  const cacheKey = 'getRecommendMusic'
  const cacheTimeKey = 'getRecommendMusic_time'

  const data = localStorage.getItem(cacheKey)
  const cacheTime = localStorage.getItem(cacheTimeKey)

  // 检查缓存是否存在且未过期（1小时 = 3600000毫秒）
  if (data && cacheTime) {
    const now = Date.now()
    const cacheAge = now - parseInt(cacheTime, 10)
    const oneHour = 60 * 60 * 1000 // 1小时的毫秒数

    if (cacheAge < oneHour) {
      console.log('get getRecommendMusic from localStorage')
      return Promise.resolve(JSON.parse(data))
    } else {
      console.log('getRecommendMusic cache expired')
      // 清除过期缓存
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(cacheTimeKey)
    }
  }

  const newData = (
    await axios({
      method: 'get',
      url: IP + '/recommend/songs' + (cookieValue ? '?cookie=' + cookieValue : ''),
    })
  ).data

  // 保存数据和当前时间戳
  localStorage.setItem(cacheKey, JSON.stringify(newData))
  localStorage.setItem(cacheTimeKey, Date.now().toString())

  return Promise.resolve(newData)
}

// 搜索功能
export async function searchCloud(
  keywords: string,
  limit: number = 20,
  offset: number = 0,
): Promise<any> {
  try {
    const response = await axios({
      method: 'get',
      url: `${IP}/cloudsearch?keywords=${encodeURIComponent(keywords)}&limit=${limit}&offset=${offset}`,
    })
    return response.data
  } catch (error) {
    console.error('搜索失败:', error)
    throw error
  }
}

// 搜索建议
export async function searchSuggest(keywords: string): Promise<any> {
  try {
    const response = await axios({
      method: 'get',
      url: `${IP}/search/suggest?keywords=${encodeURIComponent(keywords)}&type=mobile`,
    })
    return response.data
  } catch (error) {
    console.error('获取搜索建议失败:', error)
    return { result: { allMatch: [] } }
  }
}

// 热门搜索
export async function searchHot(): Promise<any> {
  try {
    const response = await axios({
      method: 'get',
      url: `${IP}/search/hot/detail`,
    })
    return response.data
  } catch (error) {
    console.error('获取热门搜索失败:', error)
    return { data: [] }
  }
}
