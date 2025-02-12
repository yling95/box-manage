<template>
  <div class="g-radio-group">
    <label class="g-radio-button-wrapper" v-for="(item, index) in options" :key="index">
      <span class="g-radio-button">
        <input
          :name="name"
          type="radio"
          class="g-radio-button-input"
          :checked="item.value === value"
          :value="item.value"
          @change="onChange"
        />
      </span>
      <div class="g-radio-text" :class="[item.value === value && 'g-radio-button-active']">
        <p>{{ item.label }}</p>
        <p>{{ item.number }}</p>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
export type Options = {
  label: string
  value: string
  number: number
}

defineProps({
  value: {
    type: String,
    default: 'online',
  },
  name: {
    type: String,
    default: 'g-radio-group',
  },
  options: {
    type: Array<Options>,
    default: () => [],
  },
})

const emit = defineEmits(['update:value'])

const onChange = (e: any) => {
  const value = e.target.value as string
  emit('update:value', value)
}
</script>

<style lang="less" scoped>
.g-radio-group {
  display: flex;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;

  .g-radio-button-wrapper {
    width: 86px;
    height: 100%;
    white-space: nowrap;
    .center();
    position: relative;
    font-weight: 400;
    font-size: 14px;
    color: @text2;
    cursor: pointer;
    padding: 3px;

    .g-radio-text {
      height: 100%;
      color: @text3;

      .center();
      gap: 0 10px;
      .number {
        color: @text3;
      }
      > p {
        margin: 0;

        span {
          color: @text3;
        }
      }
    }

    .g-radio-button {
      display: none;
    }
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 0;
      width: 1px;
      height: 14px;
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-50%);
    }

    &:last-child::after {
      display: none;
    }

    .g-radio-button-active {
      border-radius: 8px;
      background: #225199;
      display: flex;
      padding: 5px 14px;
      width: 74px;
      height: 36px;
      justify-content: center;
      align-items: center;
      color: @text1;
      text-align: center;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 22px;
      span {
        font-weight: 400;
      }
    }
  }
}
</style>
