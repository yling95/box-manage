<template>
  <a-result class="result" status="403" title="403" sub-title="您没有权限访问">
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
