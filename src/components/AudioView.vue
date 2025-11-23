<template>
    <div>
        <h1>播放器</h1>
    </div>
</template>
<script setup lang="ts">
import { ButtonPlayerShow } from '@/player';
import { onBeforeUnmount, onMounted } from 'vue';
// 进入界面
onMounted(() => {
    ButtonPlayerShow.value = false
})


// 离开界面
onBeforeUnmount(() => {
    ButtonPlayerShow.value = true
})
</script>