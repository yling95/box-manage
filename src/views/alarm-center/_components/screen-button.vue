<template>
  <div class="screen-button" id="screen-button">
    <a-tooltip placement="top" title="视频和报警记录" :getPopupContainer="() => getPopupContainerEl">
      <div class="button-item" @click="changeVideoFullView(false)" :class="[!screenFull && 'active']">
        <i class="iconfont icon-fengpinHalf-line"></i>
      </div>
    </a-tooltip>
    <a-tooltip placement="top" title="仅视频" :getPopupContainer="() => getPopupContainerEl">
      <div class="button-item" @click="changeVideoFullView(true)" :class="[screenFull && 'active']">
        <i class="iconfont icon-Fengpin1-1-line"></i>
      </div>
    </a-tooltip>
    <a-tooltip placement="top" title="退出全屏" :getPopupContainer="() => getPopupContainerEl">
      <div class="button-item button-item-exit" @click="exitFullscreen">
        <i class="iconfont icon-fullscreen-exit-line"></i>
      </div>
    </a-tooltip>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

defineProps({
  screenFull: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['change-video-full-view', 'exit-fullscreen'])

//气泡框挂载
const getPopupContainerEl = ref<any>(document.body)
onMounted(() => {
  nextTick(() => {
    getPopupContainerEl.value = document.getElementById('screen-button')
  })
})

// 切换显示
const changeVideoFullView = (bool: boolean) => {
  emits('change-video-full-view', bool)
}

// 退出全屏
const exitFullscreen = () => {
  emits('exit-fullscreen')
}
</script>

<style lang="less" scoped>
.screen-button {
  position: absolute;
  bottom: 80px;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  gap: 0 8px;
  transform: translateX(-50%);
  border-radius: 12px;
  border: 1px solid @mask4;
  background: rgba(30, 39, 54, 0.65);
  box-shadow: 0px 0.24905px 0.47043px 0px rgba(37, 37, 45, 0.03), 0px 0.59851px 1.13052px 0px rgba(37, 37, 45, 0.04),
    0px 1.12694px 2.12866px 0px rgba(37, 37, 45, 0.04), 0px 2.01027px 3.79717px 0px rgba(37, 37, 45, 0.05),
    0px 3.75998px 7.10219px 0px rgba(37, 37, 45, 0.07), 0px 9px 17px 0px rgba(37, 37, 45, 0.12);

  .button-item {
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    border-radius: 4px;
    cursor: pointer;
    i {
      color: @text1;
      font-size: 18px;
    }
    &:hover {
      background: @mask3;
    }
    &.active {
      background-color: @primary1;
      box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.04);
    }
  }
  .button-item-exit {
    position: relative;
    margin-left: 8px;

    &::before {
      content: '';
      display: inline-block;
      width: 1px;
      height: 40px;
      background-color: @mask5;
      position: absolute;
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
