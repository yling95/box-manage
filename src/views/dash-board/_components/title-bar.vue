<template>
  <div class="title-bar">
    <div class="icon">
      <slot name="icon">
        <img :src="icon" alt="" />
      </slot>
    </div>
    <h4>
      <slot name="title">
        {{ title }}
      </slot>
    </h4>
    <h6>
      <slot name="subTitle">
        {{ subTitle }}
      </slot>
    </h6>
    <div class="line"></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  subTitle: {
    type: String,
    default: '',
  },
})
</script>

<style lang="less" scoped>
.title-bar {
  width: 100%;
  display: flex;
  padding-left: 16px;
  height: 40px;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  background-color: transparent;
  display: flex;
  flex-shrink: 0;
  .icon {
    width: 22px;
    height: 22px;
    > img {
      width: 100%;
      height: 100%;
    }
  }

  > h4,
  > h6 {
    color: #f0f6fc;
    font-family: Noto Sans SC;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 24px; /* 150% */
  }
  > h6 {
    font-weight: 400;
    color: #8b949e;
  }
  .line {
    flex: 1;
    height: 1px;
    background: #35435e;
    margin-left: 40px;
  }
}
</style>
