import axios from 'axios'
// 开发环境使用代理，生产环境使用完整 URL
const isDev = import.meta.env.DEV
export const IP = isDev ? ' http://localhost:3000' : 'https://api.muqingcandy.cn'

// Cookie 管理
let cookieValue = ''

// 缓存时间键名
const CACHE_TIME_KEY = 'cache_timestamp'

// 初始化时从 localStorage 恢复 cookie
function initCookie() {
  const savedCookie = localStorage.getItem('music_cookie')
  if (savedCookie) {
    cookieValue = savedCookie
    console.log('[Cookie] 已从 localStorage 恢复 cookie')
  }
}

// 立即执行初始化
initCookie()

export function getCookie(): string {
  return cookieValue
}

export function setCookie(cookie: string): void {
  cookieValue = cookie
  // 持久化到 localStorage
  if (cookie) {
    localStorage.setItem('music_cookie', cookie)
    console.log('[Cookie] cookie 已保存，长度:', cookie.length)
  } else {
    localStorage.removeItem('music_cookie')
    console.log('[Cookie] cookie 已清除')
  }
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
 * @returns Promise<{ success: boolean, message?: string }>
 */
export async function logout(): Promise<{ success: boolean; message?: string }> {
  try {
    // 如果已登录，先调用后端退出接口
    if (isLoggedIn()) {
      console.log('[登录] 正在调用后端退出接口...')
      const response = await axios.get(`${IP}/logout?cookie=${cookieValue}`)

      if (response.data.code === 200) {
        console.log('[登录] 后端退出成功')
      } else {
        console.warn('[登录] 后端退出返回异常:', response.data)
      }
    }

    // 清除本地 cookie 和用户信息
    setCookie('')
    localStorage.removeItem('user_info')

    console.log('[登录] 已退出登录')
    return {
      success: true,
      message: '退出成功',
    }
  } catch (error) {
    console.error('[登录] 退出登录失败:', error)

    // 即使接口失败，也要清除本地数据
    setCookie('')
    localStorage.removeItem('user_info')

    return {
      success: false,
      message: '退出失败，但已清除本地数据',
    }
  }
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return cookieValue !== '' && cookieValue.length > 0
}

/**
 * 获取用户信息
 * @returns Promise<{ success: boolean, data?: any, message?: string }>
 */
export async function getUserAccount(): Promise<{
  success: boolean
  data?: any
  message?: string
}> {
  if (!isLoggedIn()) {
    console.log('[API] getUserAccount: 未登录')
    return {
      success: false,
      message: '未登录',
    }
  }

  try {
    console.log('[API] getUserAccount: 获取用户信息, cookie 长度:', cookieValue.length)
    const response = await axios.get(`${IP}/user/account?cookie=${cookieValue}`)
    console.log('[API] getUserAccount: 完整响应:', response.data)

    // 网易云 API 返回格式：{ code: 200, data: { ... } } 或直接 { code: 200, account: {...}, profile: {...} }
    const responseData = response.data
    const resultCode = responseData.code || responseData.data?.code

    console.log('[API] getUserAccount: 响应码:', resultCode)

    if (resultCode === 200) {
      console.log('[API] getUserAccount: 用户信息获取成功')
      return {
        success: true,
        data: responseData,
      }
    } else {
      console.warn('[API] getUserAccount: 获取用户信息失败:', responseData)
      return {
        success: false,
        message: responseData.message || responseData.data?.message || '获取用户信息失败',
      }
    }
  } catch (error) {
    console.error('[API] getUserAccount: 网络请求失败:', error)
    // 网络错误时不要清除 cookie
    return {
      success: false,
      message: '网络请求失败，请检查网络连接',
    }
  }
}

/**
 * 获取登录状态
 * @returns Promise<{ success: boolean, data?: any, message?: string }>
 */
export async function getLoginStatus(): Promise<{
  success: boolean
  data?: any
  message?: string
}> {
  if (!isLoggedIn()) {
    console.log('[API] getLoginStatus: 未登录')
    return {
      success: false,
      message: '未登录',
    }
  }

  try {
    console.log('[API] getLoginStatus: 检查登录状态, cookie 长度:', cookieValue.length)
    const response = await axios.get(`${IP}/login/status?cookie=${cookieValue}`)
    console.log('[API] getLoginStatus: 完整响应:', response.data)

    // 网易云 API 返回格式：{ code: 200, data: { ... } } 或直接 { code: 200, account: {...}, profile: {...} }
    const responseData = response.data
    const resultCode = responseData.code || responseData.data?.code

    console.log('[API] getLoginStatus: 响应码:', resultCode)

    if (resultCode === 200) {
      console.log('[API] getLoginStatus: 登录状态正常')
      return {
        success: true,
        data: responseData,
      }
    } else {
      console.warn('[API] getLoginStatus: 登录状态异常:', responseData)
      return {
        success: false,
        message: responseData.message || responseData.data?.message || '获取登录状态失败',
      }
    }
  } catch (error) {
    console.error('[API] getLoginStatus: 网络请求失败:', error)
    // 网络错误时不要清除 cookie，可能是临时网络问题
    return {
      success: false,
      message: '网络请求失败，请检查网络连接',
    }
  }
}

export async function recommendResource(forceRefresh: boolean = false): Promise<any> {
  // 如果强制刷新或没有缓存，则从 API 获取
  if (!forceRefresh) {
    let data = localStorage.getItem('recommendResource')
    if (data && data !== undefined && data !== null && data !== 'undefined') {
      console.log('[API] 从 localStorage 获取推荐歌单')
      return Promise.resolve(JSON.parse(data))
    }
  }

  console.log('[API] 从 API 获取推荐歌单, cookie:', cookieValue ? '已设置' : '未设置')
  const data = (
    await axios({
      method: 'get',
      url: IP + '/recommend/resource' + (cookieValue ? '?cookie=' + cookieValue : ''),
    })
  ).data

  // 只有登录时才缓存，未登录时不缓存
  if (cookieValue) {
    localStorage.setItem('recommendResource', JSON.stringify(data))
    console.log('[API] 推荐歌单已缓存（登录状态）')
  } else {
    console.log('[API] 未登录，不缓存推荐歌单')
  }

  return Promise.resolve(data)
}

// 获取歌单
// 获取歌单歌曲列表（带缓存）
export async function getPlaylist(uid: string, offset: number = 0): Promise<any> {
  const cacheKey = `playlist_${uid}_offset_${offset}`

  // 首次加载 30 首，后续每次加载 10 首
  const limit = offset === 1 ? 30 : 10

  // 尝试从缓存读取
  const cachedData = localStorage.getItem(cacheKey)
  const cacheTime = localStorage.getItem(cacheKey + '_time')

  if (cachedData && cacheTime) {
    const now = Date.now()
    const cacheAge = now - parseInt(cacheTime, 10)
    const oneHour = 60 * 60 * 1000 // 1小时的毫秒数

    if (cacheAge < oneHour) {
      console.log(`[API] 从缓存获取歌单 ${uid} (offset: ${offset})`)
      return Promise.resolve(JSON.parse(cachedData))
    } else {
      console.log(`[API] 歌单 ${uid} 缓存已过期`)
      localStorage.removeItem(cacheKey)
    }
  }

  let data = (
    await axios({
      method: 'get',
      url: `${IP}/playlist/track/all?id=${uid}&limit=${limit}&offset=${offset}${cookieValue ? '&cookie=' + cookieValue : ''}`,
    })
  ).data

  // 缓存数据
  if (cookieValue) {
    localStorage.setItem(cacheKey, JSON.stringify(data))
    localStorage.setItem(cacheKey + '_time', Date.now().toString())
    console.log(`[API] 歌单 ${uid} 已缓存`)
  }

  return Promise.resolve(data)
}
// 获取歌单所有歌曲（带缓存）
export async function getPlaylistAllTracks(id: string): Promise<any[]> {
  const cacheKey = `playlist_all_${id}`

  try {
    // 尝试从缓存读取
    const cachedData = localStorage.getItem(cacheKey)
    const cacheTime = localStorage.getItem(cacheKey + '_time')

    if (cachedData && cacheTime) {
      const now = Date.now()
      const cacheAge = now - parseInt(cacheTime, 10)
      const oneHour = 60 * 60 * 1000 // 1小时的毫秒数

      if (cacheAge < oneHour) {
        console.log(`[API] 从缓存获取歌单 ${id} 全部歌曲`)
        return Promise.resolve(JSON.parse(cachedData))
      } else {
        console.log(`[API] 歌单 ${id} 全部歌曲缓存已过期`)
        localStorage.removeItem(cacheKey)
      }
    }

    const data = (
      await axios({
        method: 'get',
        url: `${IP}/playlist/track/all?id=${id}${cookieValue ? '&cookie=' + cookieValue : ''}`,
      })
    ).data

    // 缓存数据
    if (cookieValue) {
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(cacheKey + '_time', Date.now().toString())
      console.log(`[API] 歌单 ${id} 全部歌曲已缓存`)
    }

    return Promise.resolve(data)
  } catch (error) {
    console.error(`[API] 获取歌单 ${id} 全部歌曲失败:`, error)
    throw error
  }
}

// 获取歌单详情（带缓存）
export async function getPlaylistDetail(id: string): Promise<any> {
  const cacheKey = `playlist_detail_${id}`

  try {
    // 尝试从缓存读取
    const cachedData = localStorage.getItem(cacheKey)
    const cacheTime = localStorage.getItem(cacheKey + '_time')

    if (cachedData && cacheTime) {
      const now = Date.now()
      const cacheAge = now - parseInt(cacheTime, 10)
      const oneHour = 60 * 60 * 1000 // 1小时的毫秒数

      if (cacheAge < oneHour) {
        console.log(`[API] 从缓存获取歌单详情 ${id}`)
        return Promise.resolve(JSON.parse(cachedData))
      } else {
        console.log(`[API] 歌单详情 ${id} 缓存已过期`)
        localStorage.removeItem(cacheKey)
      }
    }

    const response = await axios({
      method: 'get',
      url: `${IP}/playlist/detail?id=${id}${cookieValue ? '&cookie=' + cookieValue : ''}`,
    })

    // 缓存数据
    if (cookieValue) {
      localStorage.setItem(cacheKey, JSON.stringify(response.data))
      localStorage.setItem(cacheKey + '_time', Date.now().toString())
      console.log(`[API] 歌单详情 ${id} 已缓存`)
    }

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

// 喜欢音乐（新版 API）
export async function likeMusic(id: string, like?: boolean): Promise<any> {
  // 获取当前用户 ID
  let uid = 0
  try {
    const accountRes = await getUserAccount()
    if (accountRes.success && accountRes.data) {
      uid = accountRes.data.account?.id || accountRes.data.profile?.userId || 0
    }
  } catch (error) {
    console.warn('获取用户 ID 失败，使用默认值 0:', error)
  }

  // 如果未指定 like 参数，则默认为 true（喜欢）
  const likeStatus = like === undefined ? true : like

  console.log(
    `${IP}/song/like?id=${id}&uid=${uid}&like=${likeStatus}${cookieValue ? '&cookie=' + cookieValue : ''}`,
  )

  let data = (
    await axios({
      method: 'get',
      url: `${IP}/song/like?id=${id}&uid=${uid}&like=${likeStatus}${cookieValue ? '&cookie=' + cookieValue : ''}`,
    })
  ).data
  return Promise.resolve(data)
}

// 获取用户喜欢的歌曲列表
export async function getLikedSongs(): Promise<any> {
  if (!isLoggedIn()) {
    console.warn('未登录，无法获取喜欢歌曲列表')
    return { ids: [] }
  }

  try {
    const response = await axios({
      method: 'get',
      url: `${IP}/likelist`,
      params: {
        uid: 0, // uid=0 表示当前登录用户
        cookie: cookieValue,
      },
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
export async function getRecommendMusic(forceRefresh: boolean = false): Promise<any> {
  const cacheKey = 'getRecommendMusic'
  // 如果强制刷新，清除缓存
  if (forceRefresh) {
    console.log('[API] 强制刷新推荐歌曲，清除缓存')
    localStorage.removeItem(cacheKey)
    localStorage.removeItem(cacheKey + '_time')
  }

  const data = localStorage.getItem(cacheKey)
  const cacheTime = localStorage.getItem(cacheKey + '_time')

  // 检查缓存是否存在且未过期（1小时 = 3600000毫秒）
  if (!forceRefresh && data && cacheTime) {
    const now = Date.now()
    const cacheAge = now - parseInt(cacheTime, 10)
    const oneHour = 60 * 60 * 1000 // 1小时的毫秒数

    if (cacheAge < oneHour) {
      console.log('[API] 从 localStorage 获取推荐歌曲')
      return Promise.resolve(JSON.parse(data))
    } else {
      console.log('[API] 推荐歌曲缓存已过期')
      // 清除过期缓存
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(cacheKey + '_time')
    }
  }

  console.log('[API] 从 API 获取推荐歌曲, cookie:', cookieValue ? '已设置' : '未设置')
  const newData = (
    await axios({
      method: 'get',
      url: IP + '/recommend/songs' + (cookieValue ? '?cookie=' + cookieValue : ''),
    })
  ).data

  // 只有登录时才缓存
  if (cookieValue) {
    localStorage.setItem(cacheKey, JSON.stringify(newData))
    localStorage.setItem(cacheKey + '_time', Date.now().toString())
    console.log('[API] 推荐歌曲已缓存（登录状态）')
  } else {
    console.log('[API] 未登录，不缓存推荐歌曲')
  }

  return Promise.resolve(newData)
}

// 搜索功能
export async function searchCloud(
  keywords: string,
  limit: number = 20,
  offset: number = 0,
  type: number = 1, // 搜索类型：1-单曲, 10-专辑, 100-歌手, 1000-歌单, 1002-用户, 1004-MV, 1006-歌词, 1009-电台, 1014-视频, 1018-综合
): Promise<any> {
  try {
    const response = await axios({
      method: 'get',
      url: `${IP}/cloudsearch?keywords=${encodeURIComponent(keywords)}&limit=${limit}&offset=${offset}&type=${type}`,
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

// 获取用户歌单（带缓存）
export async function getUserPlaylist(
  uid: number,
  limit: number = 30,
  offset: number = 0,
): Promise<any> {
  if (!isLoggedIn()) {
    console.log('[API] getUserPlaylist: 未登录')
    return { playlist: [] }
  }

  const cacheKey = `user_playlist_${uid}_limit_${limit}_offset_${offset}`

  try {
    // 尝试从缓存读取
    const cachedData = localStorage.getItem(cacheKey)
    const cacheTime = localStorage.getItem(cacheKey + '_time')

    if (cachedData && cacheTime) {
      const now = Date.now()
      const cacheAge = now - parseInt(cacheTime, 10)
      const oneHour = 60 * 60 * 1000 // 1小时的毫秒数

      if (cacheAge < oneHour) {
        console.log(`[API] 从缓存获取用户 ${uid} 歌单`)
        return Promise.resolve(JSON.parse(cachedData))
      } else {
        console.log(`[API] 用户 ${uid} 歌单缓存已过期`)
        localStorage.removeItem(cacheKey)
      }
    }

    const response = await axios({
      method: 'get',
      url: `${IP}/user/playlist`,
      params: {
        uid,
        limit,
        offset,
        cookie: cookieValue,
      },
    })

    // 缓存数据
    localStorage.setItem(cacheKey, JSON.stringify(response.data))
    localStorage.setItem(cacheKey + '_time', Date.now().toString())
    console.log(`[API] 用户 ${uid} 歌单已缓存`)

    return response.data
  } catch (error) {
    console.error('获取用户歌单失败:', error)
    throw error
  }
}

// 获取用户收藏歌单（带缓存）
export async function getUserPlaylistCollect(
  uid: number,
  limit: number = 100,
  offset: number = 0,
): Promise<any> {
  const cacheKey = `user_playlist_collect_${uid}_limit_${limit}_offset_${offset}`

  try {
    // 尝试从缓存读取
    const cachedData = localStorage.getItem(cacheKey)
    const cacheTime = localStorage.getItem(cacheKey + '_time')

    if (cachedData && cacheTime) {
      const now = Date.now()
      const cacheAge = now - parseInt(cacheTime, 10)
      const oneHour = 60 * 60 * 1000 // 1小时的毫秒数

      if (cacheAge < oneHour) {
        console.log(`[API] 从缓存获取用户 ${uid} 收藏歌单`)
        return Promise.resolve(JSON.parse(cachedData))
      } else {
        console.log(`[API] 用户 ${uid} 收藏歌单缓存已过期`)
        localStorage.removeItem(cacheKey)
      }
    }

    const response = await axios({
      method: 'get',
      url: `${IP}/user/playlist/collect`,
      params: {
        uid,
        limit,
        offset,
        cookie: cookieValue,
      },
    })

    // 缓存数据
    if (cookieValue) {
      localStorage.setItem(cacheKey, JSON.stringify(response.data))
      localStorage.setItem(cacheKey + '_time', Date.now().toString())
      console.log(`[API] 用户 ${uid} 收藏歌单已缓存`)
    }

    return response.data
  } catch (error) {
    console.error('获取用户收藏歌单失败:', error)
    throw error
  }
}

// 获取用户创建歌单（带缓存）
export async function getUserPlaylistCreate(
  uid: number,
  limit: number = 100,
  offset: number = 0,
): Promise<any> {
  const cacheKey = `user_playlist_create_${uid}_limit_${limit}_offset_${offset}`

  try {
    // 尝试从缓存读取
    const cachedData = localStorage.getItem(cacheKey)
    const cacheTime = localStorage.getItem(cacheKey + '_time')

    if (cachedData && cacheTime) {
      const now = Date.now()
      const cacheAge = now - parseInt(cacheTime, 10)
      const oneHour = 60 * 60 * 1000 // 1小时的毫秒数

      if (cacheAge < oneHour) {
        console.log(`[API] 从缓存获取用户 ${uid} 创建歌单`)
        return Promise.resolve(JSON.parse(cachedData))
      } else {
        console.log(`[API] 用户 ${uid} 创建歌单缓存已过期`)
        localStorage.removeItem(cacheKey)
      }
    }

    const response = await axios({
      method: 'get',
      url: `${IP}/user/playlist/create`,
      params: {
        uid,
        limit,
        offset,
        cookie: cookieValue,
      },
    })

    // 缓存数据
    if (cookieValue) {
      localStorage.setItem(cacheKey, JSON.stringify(response.data))
      localStorage.setItem(cacheKey + '_time', Date.now().toString())
      console.log(`[API] 用户 ${uid} 创建歌单已缓存`)
    }

    return response.data
  } catch (error) {
    console.error('获取用户创建歌单失败:', error)
    throw error
  }
}
