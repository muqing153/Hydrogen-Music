import axios from 'axios'
import { ref } from 'vue'
import { useFileDrop } from 'vuetify/lib/composables/fileDrop.mjs'
export const IP = 'http://localhost:3000'
export const cookie =
  'MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/api/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/neapi/clientlog;;MUSIC_SNS=; Max-Age=0; Expires=Fri, 21 Nov 2025 03:50:52 GMT; Path=/;NMTID=00ONauRVt6GCUJfN0c_uc85iUrOXrYAAAGapIlLlg; Max-Age=315360000; Expires=Mon, 19 Nov 2035 03:50:52 GMT; Path=/;;__csrf=1e4cdb9bd5322630dfc174dfab9b24c8; Max-Age=1296010; Expires=Sat, 06 Dec 2025 03:51:02 GMT; Path=/;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/openapi/clientlog;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/wapi/feedback;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/eapi/feedback;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/api/feedback;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/api/feedback;;MUSIC_U=00B67412AF0445774972CDA410E47C8EC74E5910DD4B606C2B229F33B9835B4A70ABA897732CD22A6451F362D8BADB2510E7081C1C0FF8751852F84509DCEF581B490C414AF7C8F5FA908D257CF7130D30255F14353CD7A25A6AB0ED419588A34EACE6F625E21A5C35E6AAF3465294CFFAC2327F577BC6C214944C8A61BEE3E5F213BCD27C5C5AEB7D76C1DAAC9A106547352EB7B6DEF8E634900CEC4DDD823C68F6ACE40C146C47A1DEE1CC76026AD62E00845A7AA9AEA7D93FB7D26A7AEE9BFB85F1B0A2872C10FD2EA188F3B1530B4A140300CF2FB39123AE7DC1D1A49270467AA07F53A036A62BE2139A1D515ADF39838C776F2AAE36E87C0811D302EF9AE1DF2334A45955BF178F4F236FFF782AEE93D9BBBD2CBF2619485F01C7C20557308ACB557983E3D5029129387A4C3B9C4B0BB8AC7DBCD47CBE0CE700B9B5D56AE71FE44C7AD973319E5DB2A129D417C399D6148A7835D7298632BEF352646FB3A34A344219804C124BD219C782D3E2B60544CEA57C4C26003EBE41E9321DAB182C688BC100178F20AE4EDCDEA8C0F342D2; Max-Age=15552000; Expires=Wed, 20 May 2026 03:50:52 GMT; Path=/;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/wapi/clientlog;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/weapi/feedback;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/api/clientlog;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/eapi/feedback;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/neapi/feedback;;MUSIC_R_U=00ED414EEC1356F805DDD4D267343C8D9A90DC402EAA063F2ADD9D6BAB439A91C95828A2FB61854FD232335716C32D87B4FD6B14EAC302B0D8172CFBA313CC57DD07A0DC3C8D3E1F2FB3218A39DF08AEB4; Max-Age=15552000; Expires=Wed, 20 May 2026 03:50:52 GMT; Path=/eapi/login/token/refresh;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/weapi/feedback;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/openapi/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/neapi/feedback;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/eapi/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/wapi/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/weapi/clientlog;;MUSIC_R_U=00ED414EEC1356F805DDD4D267343C8D9A90DC402EAA063F2ADD9D6BAB439A91C95828A2FB61854FD232335716C32D87B4FD6B14EAC302B0D8172CFBA313CC57DD07A0DC3C8D3E1F2FB3218A39DF08AEB4; Max-Age=15552000; Expires=Wed, 20 May 2026 03:50:52 GMT; Path=/api/login/token/refresh;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/eapi/clientlog;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/neapi/clientlog;;MUSIC_A_T=1645851617430; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/wapi/feedback;;MUSIC_R_T=1645851802679; Max-Age=2147483647; Expires=Wed, 09 Dec 2093 07:04:59 GMT; Path=/weapi/clientlog;'
async function 二维码登录() {
  try {
    let response = await axios({
      method: 'get',
      url: IP + '/login/qr/key',
      headers: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        Accept: '*/*',
        Host: 'api.muqingcandy.cn',
        Connection: 'keep-alive',
      },
    })
    // console.log(response.data)
    const key = response.data.data.unikey
    console.log(key)
    axios({
      method: 'get',
      url: IP + `/login/qr/create?key=${key}&qrimg=true&timestamp`,
      headers: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        Accept: '*/*',
        Host: 'api.muqingcandy.cn',
        Connection: 'keep-alive',
      },
    }).then(async (res) => {
      let base = res.data.data.qrimg
      //   const decoded = Buffer.from(res.data.data.qrimg, 'base64').toString('utf-8')
      console.log(base)
      while (true) {
        let e = await axios({
          method: 'get',
          url: `${IP}/login/qr/check?key=${key}`,
          headers: {
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            Accept: '*/*',
            Host: 'api.muqingcandy.cn',
            Connection: 'keep-alive',
          },
        })
        //获取e的url
        console.log(e.request?.res?.responseUrl)
        console.log(e.data)
        // 等待1s
        await delay(1000) // 等待 2 秒
      }
      // qrcode.generate(base, { small: true, level: 'L' })
    })
  } catch (error) {
    console.error(error)
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getLogin() {
  二维码登录()
}
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
      url: IP + '/recommend/resource' + '?cookie=' + cookie,
    })
  ).data
  localStorage.setItem('recommendResource', JSON.stringify(data))
  return Promise.resolve(data)
}

export async function getPlaylist(uid: string, offset: number = 1): Promise<any> {
  // console.log(`${IP}/playlist/track/all?id=${uid}&limit=10&offset=${offset}&cookie=${cookie}`)
  let data = (
    await axios({
      method: 'get',
      url: `${IP}/playlist/track/all?id=${uid}&limit=10&offset=${offset}&cookie=${cookie}`,
    })
  ).data
  return Promise.resolve(data)
}

export async function getLyric(id: string): Promise<any> {
  let data = (
    await axios({
      method: 'get',
      url: `${IP}/lyric?id=${id}`,
    })
  ).data
  return Promise.resolve(data)
}

// 喜欢音乐
export async function likeMusic(id: string, like?: boolean): Promise<any> {
  let likes
  if (like === undefined) {
    likes = ''
  } else {
    likes = like ? '&like=true' : '&like=false'
  }
  console.log(`${IP}/like?id=${id}${likes}&cookie=${cookie}`)
  let data = (
    await axios({
      method: 'get',
      url: `${IP}/like?id=${id}${likes}&cookie=${cookie}`,
    })
  ).data
  return Promise.resolve(data)
}
