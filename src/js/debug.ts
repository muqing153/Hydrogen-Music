// 网易云音乐 API 调试脚本
// 使用 @neteasecloudmusicapienhanced/api 直接调用
import pkg from '@neteasecloudmusicapienhanced/api'
const {
  login_cellphone,
  user_cloud,
  recommend_resource,
  playlist_track_all,
  playlist_detail,
  lyric_new,
  like,
  likelist,
  toplist,
  recommend_songs,
  cloudsearch,
  search_suggest,
  search_hot_detail,
  logout,
  login_status,
  user_account,
} = pkg

// 配置
const PHONE = '手机号' // 替换为您的手机号
const PASSWORD = '密码' // 替换为您的密码
let cookie =
  'MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/neapi/clientlog;;__csrf=718781f4fc6a57b0d1a3cfd59fd99697; Max-Age=1296010; Expires=Tue, 19 May 2026 23:12:21 GMT; Path=/;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/eapi/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/openapi/clientlog;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/api/feedback;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/api/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/api/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/neapi/clientlog;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/eapi/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/wapi/feedback;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/neapi/feedback;;MUSIC_U=00C7179B8AD33AC8D9C4DA1655FC46322A6D85717E447F7BC7F19B6A220209A7C074B10A91C4C3339C5D3811D001B57BCA1A68ED17E55DBA99557E3B13964A15B165E232036B6D782364AA8595DB1F7A8E2919C977C35FEE51A4C06792E91ECAB347E1CD1061D3324776208D057103BE36E4E42116DD8998C51FDC17131DB7322329DB077FF4AA940C25BB0971467111C054309734C309E4791F1EE92CDBE26A71E0F9CF15FA6134FBE018BE61686AE0BF5E5A0C7834829F676D6435FE9E9298F263A848D29310CE306BE498F6D04E8164F7C14B6BBCF8E9FF7F3BD919AD5D8D1DC2697EBC53A25CA4DD93E8A529C244DB537F02F1A34D42D0D28C81D81010CBB3A3282C37A960151EBF46E475E03EDB75E7CD07078723B79BE6AA95A6357DAC60EC03488FCB9DD74B15EBE4BEE27B3E0A45D6EE413A8422281D63925FFDD9D52E873EDA4849C35F0E237129207459E7FDE74C2D49F22930B638618F23E99CC8A5427335DD535118ECD5A45A89D32E985805384D2F72A1E3842D710E49E3BBD5A3A8D44036ECC19F2736B9E3DE9E8C731F0B749181003F70E3BEF330BE16A901F2; Max-Age=15552000; Expires=Sat, 31 Oct 2026 23:12:11 GMT; Path=/;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/eapi/feedback;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/api/feedback;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/weapi/feedback;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/neapi/feedback;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/wapi/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/weapi/feedback;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/weapi/clientlog;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/weapi/clientlog;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/wapi/feedback;;NMTID=00OC6Kfv3sils6_cE_ru7szQcJse64AAAGd9UNzyg; Max-Age=315360000; Expires=Thu, 01 May 2036 23:12:11 GMT; Path=/;;MUSIC_R_U=005590FBAA514172E0E24906CD60108393E2592BBD467E3BC84B8BF8C4835043000D5028E9E1D504E5EB992AE5C96D94A5BE65E3C01599A047B7E714970FCFFE3AE259BD9F502383FE8B05B18EDCC7D7EB; Max-Age=15552000; Expires=Sat, 31 Oct 2026 23:12:11 GMT; Path=/eapi/login/token/refresh;;MUSIC_SNS=; Max-Age=0; Expires=Mon, 04 May 2026 23:12:11 GMT; Path=/;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/eapi/feedback;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/openapi/clientlog;;MUSIC_R_U=005590FBAA514172E0E24906CD60108393E2592BBD467E3BC84B8BF8C4835043000D5028E9E1D504E5EB992AE5C96D94A5BE65E3C01599A047B7E714970FCFFE3AE259BD9F502383FE8B05B18EDCC7D7EB; Max-Age=15552000; Expires=Sat, 31 Oct 2026 23:12:11 GMT; Path=/api/login/token/refresh;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Sun, 23 May 2094 02:26:18 GMT; Path=/wapi/clientlog;'

/**
 * 清理 Cookie 字符串，只保留 key=value 部分
 * @param rawCookie 原始 cookie 字符串
 * @returns 清理后的 cookie 字符串
 */
function cleanCookie(rawCookie: string): string {
  if (!rawCookie) return ''

  // 分割所有 cookie
  const cookies = rawCookie.split(';')
  const cleanedCookies: string[] = []

  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (!trimmed) continue

    // 只保留 key=value 格式的部分
    if (trimmed.includes('=')) {
      const parts = trimmed.split('=')
      const key = parts[0]
      const value = parts.slice(1).join('=') // 处理 value 中可能包含 = 的情况

      if (!key) continue

      // 过滤掉非 cookie 的属性（Max-Age, Expires, Path, Domain, Secure, HttpOnly, SameSite）
      const lowerKey = key.toLowerCase().trim()
      if (
        !['max-age', 'expires', 'path', 'domain', 'secure', 'httponly', 'samesite'].includes(
          lowerKey,
        )
      ) {
        cleanedCookies.push(`${key.trim()}=${value.trim()}`)
      }
    }
  }

  return cleanedCookies.join('; ')
}

// 清理 cookie
cookie = cleanCookie(cookie)
console.log('清理后的 Cookie 长度:', cookie.length)

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  try {
    console.log('=== 网易云音乐 API 测试 ===\n')

    // 1. 检查登录状态 (如果已有 cookie)
    if (cookie) {
      console.log('1. 检测到现有 Cookie，跳过登录，直接检查状态...')
      console.log('Cookie 前 100 字符:', cookie.substring(0, 100))
      const statusResult = await login_status({ cookie: cookie })
      console.log('登录状态 API 响应:', JSON.stringify(statusResult, null, 2))
      // 正确的路径是 body.data.profile
      const isLoggedIn = (statusResult as any).body?.data?.profile !== undefined
      if (isLoggedIn) {
        console.log('✅ 登录状态有效，用户:', (statusResult as any).body?.data?.profile?.nickname)
      } else {
        console.log('⚠️ Cookie 已失效或无效，请重新登录')
        console.log('响应码:', (statusResult as any).body?.code)
        console.log('响应消息:', (statusResult as any).body?.message)
        // 这里可以选择退出或者继续尝试后续操作看是否报错，通常建议退出
        return
      }
    } else {
      console.log('1. 未检测到 Cookie，正在登录...')
      const loginResult = await login_cellphone({ phone: PHONE, password: PASSWORD })
      console.log('登录结果:', JSON.stringify(loginResult, null, 2))

      if (loginResult.body.code !== 200) {
        console.error('❌ 登录失败，错误码:', loginResult.body.code)
        return
      }

      // 保存 cookie
      cookie = loginResult.body.cookie
      console.log('✅ 登录成功，cookie 长度:', cookie.length)
    }
    console.log()

    await delay(1000)
    // 3. 获取用户信息
    console.log('3. 获取用户信息...')
    const userResult = await user_account({ cookie })
    console.log('用户昵称:', (userResult as any).body?.profile?.nickname)
    console.log('VIP 类型:', (userResult as any).body?.profile?.vipType)
    console.log()

    await delay(1000)

    // 4. 获取推荐歌单
    console.log('4. 获取推荐歌单...')
    const recommendResult = await recommend_resource({ cookie })
    console.log('推荐歌单数量:', (recommendResult as any).body?.recommend?.length || 0)
    if (
      (recommendResult as any).body?.recommend &&
      (recommendResult as any).body.recommend.length > 0
    ) {
      console.log('第一个歌单:', (recommendResult as any).body.recommend[0].name)
    }
    console.log()

    await delay(1000)

    // 5. 获取每日推荐歌曲
    console.log('5. 获取每日推荐歌曲...')
    const songsResult = await recommend_songs({ cookie })
    console.log('推荐歌曲数量:', (songsResult as any).body?.data?.dailySongs?.length || 0)
    console.log()

    await delay(1000)

    // 6. 获取排行榜
    console.log('6. 获取排行榜...')
    const toplistResult = await toplist({})
    console.log('排行榜数量:', (toplistResult as any).list?.length || 0)
    if ((toplistResult as any).list && (toplistResult as any).list.length > 0) {
      console.log('第一个榜单:', (toplistResult as any).list[0].name)
    }
    console.log()

    await delay(1000)

    // 7. 获取喜欢歌曲列表
    console.log('7. 获取喜欢歌曲列表...')
    const likelistResult = await likelist({ uid: 0, cookie })
    console.log('喜欢歌曲数量:', (likelistResult as any).ids?.length || 0)
    console.log()

    await delay(1000)

    // 8. 搜索测试
    console.log('8. 搜索测试...')
    const searchResult = await cloudsearch({ keywords: '周杰伦', limit: 5 })
    console.log('搜索结果数量:', (searchResult as any).result?.songCount || 0)
    if ((searchResult as any).result?.songs && (searchResult as any).result.songs.length > 0) {
      console.log('第一首歌:', (searchResult as any).result.songs[0].name)
    }
    console.log()

    await delay(1000)

    // 9. 获取云盘
    console.log('9. 获取云盘...')
    const cloudResult = await user_cloud({ cookie })
    console.log('云盘歌曲数量:', (cloudResult as any).body?.data?.length || 0)
    console.log()

    console.log('=== 测试完成 ===')
  } catch (error) {
    console.error('❌ 发生错误:', error)
  }
}

main()
