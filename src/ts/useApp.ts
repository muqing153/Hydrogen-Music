import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { isLoggedIn, logout, getUserAccount, getLoginStatus, getCookie } from '../api'

/**
 * 主题管理组合式函数
 */
export function useThemeManager() {
  const theme = useTheme()

  function isDark() {
    return !theme.global.current.value.dark
  }

  function toggleTheme() {
    theme.toggle()
    // 切换完成后保存当前的主题
    localStorage.setItem('theme', isDark() ? 'light' : 'dark')
  }

  // 初始化当前主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.change(savedTheme)
  }

  return {
    isDark,
    toggleTheme,
  }
}

/**
 * 登录状态管理组合式函数
 */
export function useAuth(onLoginSuccess?: () => void) {
  const showLoginDialog = ref(false)
  const loginStatus = computed(() => isLoggedIn())
  const userInfo = ref<any>(null)

  // 获取用户信息
  async function fetchUserInfo() {
    console.log('[Auth] 开始获取用户信息, isLoggedIn:', isLoggedIn())
    console.log('[Auth] 当前 cookie 长度:', getCookie().length)

    if (isLoggedIn()) {
      // 先检查登录状态
      const statusResult = await getLoginStatus()
      console.log('[Auth] 登录状态检查结果:', statusResult)

      if (statusResult.success) {
        console.log('[Auth] 登录状态正常')

        // 登录状态正常，获取用户信息
        const userResult = await getUserAccount()
        console.log('[Auth] 用户信息获取结果:', userResult)

        if (userResult.success && userResult.data) {
          userInfo.value = userResult.data
          localStorage.setItem('user_info', JSON.stringify(userResult.data))
          console.log('[Auth] 用户信息已更新:', userResult.data.profile?.nickname)

          // 调用登录成功回调
          if (onLoginSuccess) {
            onLoginSuccess()
          }
        } else {
          console.warn('[Auth] 获取用户信息失败:', userResult.message)
        }
      } else {
        // 登录状态异常，但不要立即清除 cookie，可能是网络问题
        console.warn('[Auth] 登录状态异常:', statusResult.message)
        console.warn('[Auth] 保留 cookie，等待下次重试')
      }
    } else {
      // 未登录时从 localStorage 清除用户信息
      console.log('[Auth] 未登录，清除用户信息')
      userInfo.value = null
      localStorage.removeItem('user_info')
    }
  }

  function handleLogin() {
    showLoginDialog.value = true
  }

  async function handleLogout() {
    const result = await logout()
    if (result.success) {
      userInfo.value = null
      console.log('[Auth] 退出登录成功')
    } else {
      console.warn('[Auth] 退出登录:', result.message)
    }
  }

  function handleLogoutSuccess() {
    userInfo.value = null
    console.log('[Auth] 退出登录成功（从 LoginView）')
  }

  // 获取 VIP 类型文本
  function getVipTypeText(vipType: number): string {
    switch (vipType) {
      case 0:
        return '普通用户'
      case 11:
        return '黑胶 VIP'
      case 110:
        return '黑胶 VIP'
      default:
        return '普通用户'
    }
  }

  onMounted(() => {
    // 初始化时获取用户信息
    fetchUserInfo()
  })

  return {
    showLoginDialog,
    loginStatus,
    userInfo,
    fetchUserInfo,
    handleLogin,
    handleLogout,
    handleLogoutSuccess,
    getVipTypeText,
  }
}
