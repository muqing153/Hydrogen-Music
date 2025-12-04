<template>
    <v-navigation-drawer v-model="navigationrightShow" location="right" temporary width="360" class="playlist-drawer">
        <v-card flat class="pa-2">
            <!-- 顶部标题 -->
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-playlist-music</v-icon>
                播放列表（{{ player.playlist.value.length }}）
            </v-card-title>

            <!-- 列表 -->
            <v-list>
                <v-card v-for="(item) in player.playlist.value" @click="player.playIndex(item.id)" class="ma-1">
                    <v-row class="ma-1" justify="center" align="center">
                        <v-card width="36" height="36">
                            <v-img :src="item.picUrl" width="48" height="48"></v-img>
                        </v-card>
                        <v-col>
                            <!-- 中：名称 + 艺术家 -->
                            <v-list-item-title class="text-body-2 text-truncate">{{ item.name }}</v-list-item-title>
                            <v-list-item-subtitle class="text-caption text-truncate">
                                {{ item.artist }}</v-list-item-subtitle>
                        </v-col>
                    </v-row>
                </v-card>
            </v-list>
        </v-card>
    </v-navigation-drawer>
</template>
<script setup lang="ts">
import { navigationrightShow } from './main';
import { player } from '@/staic';

</script>

<style scoped>
.song-item {
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    border-radius: 8px;
}

.song-item:hover {
    background-color: rgba(255, 255, 255, 0.08);
    cursor: pointer;
}

.song-item.active {
    background-color: rgba(255, 255, 255, 0.15);
}

.playlist-drawer {
    position: fixed !important;
    z-index: 99999 !important;
}
</style>