<template>
    <v-col>
        <v-card-title>推荐</v-card-title>
        <v-divider></v-divider>
        <!-- 横向滚动列表 -->
        <v-slide-group show-arrows class="py-4">
            <v-col v-for="(item, index) in items" :key="index" cols="auto">
                <v-card class="overflow-hidden" width="130" height="150" link @click='getPlaylist(item.id)'>
                    <v-img :src="`${item.picUrl}`" height="150" cover>
                        <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                            </div>
                        </template>
                    </v-img>
                    <template class="v-text-back ">
                        {{ item.name }}
                    </template>
                </v-card>
            </v-col>
        </v-slide-group>
        <v-divider></v-divider>
        <!-- 纵向滚动列表 -->
        <v-list class="ma-5" @scroll="onScroll" ref="listRef">
            <v-col v-for="value in songs">
                <v-card style="margin-right: 50%;" variant="tonal" link @click="async () => {
                    await player.addTrack(String(value.id), true)
                }" height="86">
                    <v-row class="pa-5 align-center" style="flex-wrap: nowrap; align-items: center;">
                        <v-col class="pa-0 ma-0" cols="auto">
                            <v-card class="pa-0 ma-0" width="56" height="56">
                                <v-img :src="`${value.al.picUrl}?param=56y56`" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-progress-circular color="grey-lighten-4"
                                                indeterminate></v-progress-circular>
                                        </div>
                                    </template>
                                </v-img>
                            </v-card>
                        </v-col>
                        <v-col class="pa-0 ma-0">
                            <v-card-title class="pa-0" style="margin-left: 15px;">{{ value.al.name }}</v-card-title>
                            <v-card-text> {{value.ar.map((a: any) => a.name).join('/')}}</v-card-text>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-list>
    </v-col>
</template>
<script setup lang="ts">
import type { AudioPlayer } from '@/player'
import { getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'
import * as api from '../api'
import { player } from '@/staic'



const items: any = ref(null)
const songs: any = ref(null)
let PlaylistUID = "2301697552"
let PlaylistOffset = 1
// 二维码登录()
api.recommendResource().then((res) => {
    //把res保存到本地
    items.value = res.recommend
    // console.log(res)
})
function getPlaylist(id: string) {
    if (id !== PlaylistUID) {
        PlaylistUID = id
        PlaylistOffset = 1
    }
    api.getPlaylist(id, PlaylistOffset).then((res) => {
        console.log(res)
        if (PlaylistOffset > 1) {
            songs.value.push(...res.songs)
        } else {
            songs.value = res.songs

        }
        PlaylistOffset += 10
    })
}
// getPlaylist(PlaylistUID)
let lastScrollTop = 0;

onMounted(() => {
    window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
})
function onScroll() {
    const el = document.documentElement;
    const scrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;
    const scrollHeight = el.scrollHeight;
    // 判断是否向下滚
    if (scrollTop > lastScrollTop && scrollTop + clientHeight >= scrollHeight) {
        console.log("已经滚动到底部");
        getPlaylist(PlaylistUID)

    }
    // 更新上一次位置
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

</script>
<style scoped>
.v-text-back {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 36%;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(16px);
    overflow: hidden;
    /* 🔥 防止溢出 */
    border-radius: inherit;
    /* 可选：继承 v-card 圆角 */
    display: flex;
    align-items: start;
    /* 设置文字的超出 */
    padding: 6px 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /* 控制显示行数 */
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>