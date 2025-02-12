<template>
  <a-result class="result" status="404" title="404" sub-title="找不到页面">
    <template #extra>
      <a-button type="primary" @click="router.replace(defaultMenuLink)">首页</a-button>
    </template>
  </a-result>
</template>

<script setup lang="ts">
import { useMenuStore } from '@/store/menu'
import { useRouter } from 'vue-router'

const router = useRouter()
const { defaultMenuLink } = useMenuStore()
</script>

<style lang="less" scoped></style>
