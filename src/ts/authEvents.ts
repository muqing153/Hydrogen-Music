import { player } from '@/staic'

export type AuthChangeReason = 'login' | 'logout'

type AuthListener = (reason: AuthChangeReason) => void

const listeners = new Set<AuthListener>()

// 登录态变化时必须失效的用户级缓存
const USER_CACHE_KEYS = ['recommendResource', 'getRecommendMusic', 'getRecommendMusic_time']

function clearUserCaches() {
  USER_CACHE_KEYS.forEach((key) => localStorage.removeItem(key))
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('user_playlist_')) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * 订阅登录态变化，返回取消订阅函数。
 * keep-alive 缓存中的组件仍会收到通知（仅真正卸载时才应退订）。
 */
export function onAuthChange(listener: AuthListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * 触发登录态变化：先失效缓存、重载喜欢的歌曲，再同步通知所有订阅者，
 * 保证订阅者发起的新请求不会命中旧（匿名/前用户）缓存。
 */
export function emitAuthChange(reason: AuthChangeReason) {
  console.log('[Auth] 登录态变化:', reason)
  clearUserCaches()
  player.loadLikedSongs()
  listeners.forEach((listener) => {
    try {
      listener(reason)
    } catch (error) {
      console.error('[Auth] 登录态监听器执行失败:', error)
    }
  })
}
