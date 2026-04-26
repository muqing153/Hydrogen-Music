<template>
    <v-row class="justify-center align-center">
        <v-icon>mdi-volume-low</v-icon>
        <v-slider v-model="player.volume.value" :min="0" :max="1" hide-details track-size="6" thumb-size="0" step="0.01"
            v-on:start="sliderStart" v-on:end="sliderEnd" />
        <v-icon>{{ Icon() }}</v-icon>
    </v-row>

</template>
<script setup lang="ts">
import { player } from '@/staic';
import { onActivated, ref } from 'vue';
import type { VCol, VIcon } from 'vuetify/components';
function sliderStart(value: number) {
    player.setVolume(value)
}
function sliderEnd(value: number) {
    player.setVolume(value)
}
function onValueUpdate(val: number) {
    player.setVolume(val)

}
function Icon() {
    if (player.volume.value == 0) {
        return 'mdi-volume-off'
    } else if (player.volume.value < 0.5) {
        return 'mdi-volume-medium'
    } else {
        return 'mdi-volume-high'
    }
}

</script>
<style scoped></style>