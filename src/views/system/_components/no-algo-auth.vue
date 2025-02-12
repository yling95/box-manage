<template>
  <div class="no-ai-service-auth">
    <div>
      <img class="auth-img" src="@/assets/images/algo-auth/no-algo-auth.png" />
      <p class="auth-text">{{ text }}</p>
      <a-button type="primary" class="auth-btn" @click="toAlgoAuth">去授权</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
const router = useRouter()
defineProps({
  text: {
    type: String,
    default: '当前未进行算法授权，请授权后使用本功能',
  },
  modelWidth: {
    type: String,
    default: '100%',
  },
})
/**
 * 跳转算法授权
 */
const toAlgoAuth = () => {
  router.push({
    path: '/system-layout/system-maintenance/algo-auth',
  })
}
</script>

<style lang="less" scoped>
.no-ai-service-auth {
  text-align: center;
  width: v-bind(modelWidth);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .auth-img {
    width: 70px;
  }
  .auth-text {
    color: @text3;
    text-align: center;
    margin-top: 14px;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    margin-bottom: 24px;
  }
  .auth-btn {
    border-radius: 8px;
    border: none;
    background: linear-gradient(180deg, rgba(1, 161, 255, 1) 0%, rgba(7, 94, 233, 1) 100%);
    &:hover {
      background: linear-gradient(180deg, rgba(1, 161, 255, 0.9) 0%, rgba(7, 94, 233, 0.9) 100%);
    }
  }
}
</style>
import { useRouter } from 'vue-router'; useRouter,
