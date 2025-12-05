<template>
    <v-sheet>

        <!-- 纵向滚动列表 -->
        <v-list class="ma-5" ref="listRef">
            <v-col v-for="value in songs">
                <v-card variant="tonal" link @click="async () => {
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
    </v-sheet>
</template>
<script setup lang="ts">
import { PlaylistUID, player } from '@/staic';
import { onActivated, onDeactivated, onMounted, onUnmounted, ref } from 'vue';
import * as api from '../api'
import { useRoute } from 'vue-router';
const route = useRoute();
const songs: any = ref([])
let PlaylistOffset = 1
let id = route.query.id as string
if (id === undefined || id === '' || id === 'undefined' || id === 'null' || id === null) {
    if (PlaylistUID.value !== '') {
        id = PlaylistUID.value
    }
}
if (id) {
    PlaylistUID.value = id
    console.log('PlaylistUID.value')
    getPlaylist(id)
}


let lastScrollTop = 0;
const listRef = ref<HTMLElement | null>(null)
function attach() {
    const el = document.querySelector('.content') as HTMLElement | null;
    if (!el) return;
    el.addEventListener('scroll', onScrollHandler, { passive: true });
}
function detach() {
    const el = document.querySelector('.content') as HTMLElement | null;
    if (!el) return;
    el.removeEventListener('scroll', onScrollHandler);
}

onMounted(() => attach());
onUnmounted(() => detach());

// keep-alive 下的切换
onActivated(() => attach());
onDeactivated(() => detach());

function onScrollHandler(e: Event) {
    console.log('scroll')
    const el = e.target as HTMLElement;
    const { scrollTop, clientHeight, scrollHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight) {
        console.log('scroll to bottom')
        getPlaylist(PlaylistUID.value);
    }
}

function getPlaylist(id: string) {
    if (id !== PlaylistUID.value) {
        PlaylistUID.value = id
        PlaylistOffset = 1
    }
    api.getPlaylist(id, PlaylistOffset).then((res) => {
        // console.log(res)
        if (PlaylistOffset > 1) {
            songs.value.push(...res.songs)
        } else {
            songs.value = res.songs

        }
        PlaylistOffset += 10
    })
}
</script>
<style scoped></style>