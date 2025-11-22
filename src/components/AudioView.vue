<template>
    <div>
        <h1>播放器</h1>
        <p>这里是内容。</p>
        <p>倒计时：{{ count }}</p>
    </div>
</template>
<script setup lang="ts">

import { ref, onMounted, onUnmounted } from "vue";

// 响应式变量
const count = ref(10);
let timer: number;

onMounted(() => {
    timer = window.setInterval(() => {
        if (count.value > 0) {
            count.value--;
        }
    }, 1000);
});

// 离开组件时清除 interval
onUnmounted(() => {
    clearInterval(timer);
});
</script>