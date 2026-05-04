<template>
    <v-dialog v-model="show" max-width="400" persistent>
        <v-card>
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
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { qrcodeLogin, checkQRCodeStatus } from '@/api'

const show = defineModel<boolean>({ default: false })

// 状态管理
const qrStatus = ref<'loading' | 'waiting' | 'scanned' | 'authorized' | 'expired'>('loading')
const qrBase64 = ref('')
const qrKey = ref('')
const statusMessage = ref('')
const errorMessage = ref('')

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
                // 登录成功，延迟关闭对话框
                setTimeout(() => {
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

// 刷新二维码
function refreshQRCode() {
    stopPolling()
    generateQRCode()
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
            // 对话框打开时生成二维码
            generateQRCode()
        } else {
            // 对话框关闭时停止轮询
            stopPolling()
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
