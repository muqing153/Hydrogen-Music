<template>
    <!-- 底部固定栏 -->
    <v-card class="footer pa-4" elevation="16">
        <v-card width="56" height="56">
            <v-img :src="`${player.currentTrack?.value?.picUrl}`" width="56" height="56"></v-img>
        </v-card>
        <v-col>
            <v-card-title>{{ player.currentTrack?.value?.name }} </v-card-title>
            <!-- <div>{{ currentTrack?.alia }} </div> -->
            <v-slider :max="player.duration.value" :model-value="player.currentTime.value" v-on:end="sliderEnd"
                v-on:start="sliderStart" :append-icon="'as'"></v-slider>
        </v-col>

        <v-btn icon @click='player.toggle()'>
            <v-icon>{{ player.isPlaying.value ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>
        <v-btn icon @click='player.next()'>
            <v-icon>mdi-skip-next</v-icon>
        </v-btn>
        <v-btn icon @click='player.prev()'>
            <v-icon>mdi-list</v-icon>
        </v-btn>
    </v-card>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { player } from './player'

function sliderStart(value: number) {
    player.seek(value)
    player.pause()
}
function sliderEnd(value: number) {
    player.seek(value)
    player.play()
}
</script>
<style scoped>
.footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 10%;
    color: white;
    display: flex;
    align-items: center;
    z-index: 1000;
}
</style>