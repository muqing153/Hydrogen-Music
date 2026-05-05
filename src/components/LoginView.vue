<template>
    <v-dialog v-model="show" max-width="400" persistent>
        <v-card>
            <!-- 已登录状态 -->
            <div v-if="isLoggedIn()">
                <v-card-title class="text-center pt-6">
                    <v-avatar size="80" class="mb-3">
                        <v-img :src="userInfo?.profile?.avatarUrl || ''" v-if="userInfo?.profile?.avatarUrl"></v-img>
                        <v-icon v-else size="x-large" color="primary">mdi-account</v-icon>
                    </v-avatar>
                    <div class="text-h5">{{ userInfo?.profile?.nickname || '用户' }}</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">
                        {{ getVipTypeText(userInfo?.profile?.vipType || 0) }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis mt-1">
                        {{ userInfo?.profile?.signature || '这家伙很懒，什么也没有留下' }}
                    </div>
                </v-card-title>

                <v-card-text class="text-center">

                    <div class="text-body-2 text-medium-emphasis mb-4">
                        <v-icon size="small" class="mr-1">mdi-shield-check</v-icon>
                        请勿在危险设备登录，如果长时间未使用，请退出登录<br>避免Cookie泄露或者被他人使用
                    </div>
                </v-card-text>

                <v-card-actions class="justify-center pb-6">
                    <v-btn variant="text" @click="closeDialog">关闭</v-btn>
                    <v-btn color="error" variant="flat" prepend-icon="mdi-logout" @click="handleLogout"
                        :loading="isLoggingOut">
                        退出登录
                    </v-btn>
                </v-card-actions>
            </div>

            <!-- 未登录状态 - 二维码登录 -->
            <div v-else>
                <v-card-title class="text-center pt-6">
                    <v-icon size="x-large" color="primary" class="mb-2">mdi-qrcode-scan</v-icon>
                    <div class="text-h5">扫码登录</div>
                </v-card-title>

                <v-card-text class="text-center">
                    <!-- 二维码显示区域 -->
                    <div v-if="qrStatus === 'loading'" class="qr-loading pa-8">
                        <v-progress-circular indeterminate size="64" width="6" color="primary"></v-progress-circular>
                        <div class="mt-4 text-body-1">正在生成二维码...</div>
                    </div>

                    <div v-else-if="qrBase64" class="qr-container">
                        <v-img :src="qrBase64" width="250" height="250" class="mx-auto mb-4" contain></v-img>

                        <!-- 状态提示 -->
                        <v-alert v-if="statusMessage" :type="alertType" variant="tonal" density="compact" class="mb-4">
                            {{ statusMessage }}
                        </v-alert>

                        <!-- 操作提示 -->
                        <div class="text-body-2 text-medium-emphasis">
                            <v-icon size="small" class="mr-1">mdi-cellphone</v-icon>
                            请使用网易云音乐 APP 扫码登录
                        </div>
                    </div>

                    <!-- 错误提示 -->
                    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
                        {{ errorMessage }}
                    </v-alert>
                </v-card-text>

                <v-card-actions class="justify-center pb-6">
                    <v-btn variant="text" @click="closeDialog">取消</v-btn>
                    <v-btn v-if="qrStatus === 'expired' || errorMessage" color="primary" @click="refreshQRCode">
                        刷新二维码
                    </v-btn>
                </v-card-actions>
            </div>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { qrcodeLogin, checkQRCodeStatus, setCookie, getUserAccount, logout, isLoggedIn, getCookie } from '@/api'

const show = defineModel<boolean>({ default: false })
const emit = defineEmits<{
    (e: 'login-success'): void
    (e: 'logout-success'): void
}>()

// 状态管理
const qrStatus = ref<'loading' | 'waiting' | 'scanned' | 'authorized' | 'expired'>('loading')
const qrBase64 = ref('')
const qrKey = ref('')
const statusMessage = ref('')
const errorMessage = ref('')
const userInfo = ref<any>(null)
const isLoggingOut = ref(false)

let checkTimer: number | null = null

// 计算警告类型
const alertType = computed(() => {
    switch (qrStatus.value) {
        case 'scanned':
            return 'warning'
        case 'authorized':
            return 'success'
        case 'expired':
            return 'error'
        default:
            return 'info'
    }
})

// 生成二维码
async function generateQRCode() {
    qrStatus.value = 'loading'
    errorMessage.value = ''
    statusMessage.value = ''

    try {
        const result = await qrcodeLogin()

        if (result.success && result.data) {
            qrKey.value = result.data.key
            qrBase64.value = result.data.qrBase64
            qrStatus.value = 'waiting'
            statusMessage.value = '等待扫码...'

            // 开始轮询检查状态
            startPolling()
        } else {
            errorMessage.value = result.message || '生成二维码失败'
            qrStatus.value = 'expired'
        }
    } catch (error) {
        errorMessage.value = '网络错误，请重试'
        qrStatus.value = 'expired'
    }
}

// 开始轮询检查二维码状态
function startPolling() {
    // 清除之前的定时器
    if (checkTimer) {
        clearInterval(checkTimer)
    }

    // 每 2 秒检查一次状态
    checkTimer = window.setInterval(async () => {
        if (!qrKey.value) return

        const result = await checkQRCodeStatus(qrKey.value)

        qrStatus.value = result.status
        statusMessage.value = result.message || ''

        // 如果已授权或过期，停止轮询
        if (result.status === 'authorized' || result.status === 'expired') {
            stopPolling()

            if (result.status === 'authorized') {
                // cookie 已经在 checkQRCodeStatus 中保存
                console.log('[登录] 登录成功')
                console.log('[登录] 当前 cookie 长度:', getCookie().length)
                console.log('[登录] localStorage 中的 cookie:', localStorage.getItem('music_cookie') ? '存在' : '不存在')

                // 获取用户信息
                getUserAccount().then((userResult) => {
                    console.log('[登录] getUserAccount 结果:', userResult)
                    if (userResult.success && userResult.data) {
                        console.log('用户信息:', userResult.data)
                        // 存储到 localStorage
                        localStorage.setItem('user_info', JSON.stringify(userResult.data))
                    }
                }).catch((error) => {
                    console.error('[登录] 获取用户信息失败:', error)
                })

                // 登录成功，延迟关闭对话框并触发事件
                setTimeout(() => {
                    console.log('[登录] 触发 login-success 事件')
                    emit('login-success')
                    closeDialog()
                }, 1500)
            }
        }
    }, 2000)
}

// 停止轮询
function stopPolling() {
    if (checkTimer) {
        clearInterval(checkTimer)
        checkTimer = null
    }
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

// 刷新二维码
function refreshQRCode() {
    stopPolling()
    generateQRCode()
}

// 获取用户信息
async function fetchUserInfo() {
    if (isLoggedIn()) {
        const result = await getUserAccount()
        if (result.success && result.data) {
            userInfo.value = result.data
        }
    }
}

// 退出登录
async function handleLogout() {
    isLoggingOut.value = true
    try {
        const result = await logout()
        if (result.success) {
            userInfo.value = null
            emit('logout-success')
            closeDialog()
        } else {
            errorMessage.value = result.message || '退出失败'
        }
    } catch (error) {
        console.error('退出登录失败:', error)
        errorMessage.value = '退出失败，请重试'
    } finally {
        isLoggingOut.value = false
    }
}

// 关闭对话框
function closeDialog() {
    stopPolling()
    show.value = false
}

// 监听对话框显示状态
watch(
    show,
    (newValue) => {
        if (newValue) {
            // 对话框打开时，先检查是否已登录
            if (isLoggedIn()) {
                // 已登录，获取用户信息
                fetchUserInfo()
            } else {
                // 未登录，生成二维码
                generateQRCode()
            }
        } else {
            // 对话框关闭时停止轮询
            stopPolling()
            // 重置状态
            qrStatus.value = 'loading'
            qrBase64.value = ''
            qrKey.value = ''
            statusMessage.value = ''
            errorMessage.value = ''
            userInfo.value = null
        }
    },
    { immediate: true },
)
</script>

<style scoped>
.qr-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.qr-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>
