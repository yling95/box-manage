<template>
  <div class="layout">
    <header-bar></header-bar>
    <main class="main">
      <a-spin
        wrapper-class-name="app-spin"
        :spinning="globalStore.loadingOptions.type === 'stair' && globalStore.loading"
        :delay="globalStore.loadingOptions.delay"
        :tip="globalStore.loadingOptions.tip"
      >
        <router-view />
      </a-spin>
    </main>
  </div>
</template>

<script setup lang="ts">
import HeaderBar from './_components/header-bar.vue'
import { useGlobalStore } from '@/store/global'

const globalStore = useGlobalStore()
</script>

<style lang="less" scoped>
.layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: url(../assets/images/public/bgc_city.png) no-repeat bottom left,
    radial-gradient(50% 36.98% at 50% 100%, rgba(69, 83, 106, 0.5) 0%, rgba(56, 83, 128, 0) 100%), #161c2e;
  background-size: 342px 321px, auto, auto;

  .main {
    flex: 1;
    overflow: auto;
  }
}
</style>
