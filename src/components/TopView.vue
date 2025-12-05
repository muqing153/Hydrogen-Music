    <template>
        <VCard>
            <v-card-title>排行榜</v-card-title>
        </VCard>

        <!-- 横向滚动列表 -->
        <v-list class="pa-4">
            <v-card v-for="value in source" class="ma-3  align-center" @click="router.push({
                path: '/MusicPlaylist',
                query: { id: value.id }
            })">
                <v-col class="pa-3" variant="tonal">
                    <v-row no-gutters>
                        <!-- 左侧图片 -->
                        <v-col cols="auto">
                            <v-img :src="value.coverImgUrl" height="100" width="100" cover class="rounded">
                                <template #placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular indeterminate></v-progress-circular>
                                    </div>
                                </template>
                            </v-img>
                        </v-col>

                        <!-- 右侧文字 -->
                        <v-col class="pl-4">
                            <v-card-title class="pa-0">{{ value.name }}</v-card-title>
                            <v-card-text class="pa-0 mt-2">{{ value.description }}</v-card-text>
                        </v-col>
                    </v-row>
                </v-col>

            </v-card>

        </v-list>
    </template>
<script setup lang="ts">
import { getTopList } from '@/api';
import { ref } from 'vue';
import router from "@/router";

const source: any = ref([])
getTopList().then((res) => {
    console.log(res)
    source.value = res.list
})
</script>