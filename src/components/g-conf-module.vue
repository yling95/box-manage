<template>
  <div id="conf-module-container" class="conf-module-container" :style="styleValue">
    <div class="conf-module-main">
      <div ref="refConfModuleHeader" class="conf-module-header">
        <div class="conf-module-header-title">
          <slot name="Slot-Conf-Module-Header" extra="页面的标题等"></slot>
        </div>

        <div v-if="props.showPageTools" class="conf-module-tools">
          <slot name="Slot-Conf-Module-Tools-Left" extra="页面的筛序组件和按钮等"></slot>

          <slot name="Slot-Conf-Module-Tools-Right" extra="页面的筛序组件和按钮等"></slot>
        </div>
      </div>

      <div ref="refConfModuleContent" class="conf-module-content">
        <!-- <vue-scroll @handle-scroll="handleScroll"> -->
        <div class="_container">
          <slot name="Slot-Conf-Module-Content" extra="页面的具体内容等"></slot>
        </div>
        <slot name="Slot-Conf-custom-Module-Content" extra="页面的具体内容等"></slot>
        <!-- </vue-scroll> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="g-conf-module">
import { onMounted, reactive, ref, nextTick } from 'vue'

interface TsProps {
  showPageTools?: boolean
}

const props = withDefaults(defineProps<TsProps>(), {
  showPageTools: false,
})

const styleValue = reactive({
  '--header-height': '84px',
  '--main-height': '0px',
  '--border-bottom': '1px solid transparent',
})

const refConfModuleHeader = ref(null)
const refConfModuleContent = ref(null)

// const handleScroll = (vertical: Record<string, any>): void => {
//   styleValue['--border-bottom'] =
//     vertical.scrollTop > 5 ? '1px solid rgba(211, 211, 211, 0.2)' : '1px solid transparent'
// }

defineExpose({
  styleValue,
})

onMounted(() => {
  let observer = new ResizeObserver((entries) => {
    styleValue['--header-height'] = (entries[0].target as HTMLDivElement).offsetHeight + 'px'

    nextTick(() => {
      if (refConfModuleContent.value) {
        styleValue['--main-height'] = (refConfModuleContent.value as HTMLDivElement).offsetHeight + 'px'
      }
    })
  })

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  observer.observe(refConfModuleHeader.value!)
})
</script>

<style lang="less" scoped>
.conf-module-container {
  width: 100%;
  height: 100%;
  padding: 14px 16px;

  .conf-module-main {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: rgba(46, 75, 120, 0.15);

    .conf-module-header {
      border-bottom: var(--border-bottom);

      .conf-module-header-title {
        display: flex;
        align-items: center;
        height: 84px;
        padding: 24px 40px;
      }

      .conf-module-tools {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 44px;
        padding: 0 40px;
      }
    }

    .conf-module-content {
      // 减去的 1px 是顶部在页面处于滚动的情况下,出现的borderBottom宽度
      height: calc(100% - var(--header-height));
      // height: calc(100% - 20px);
      overflow-y: auto;
      ._container {
        margin: 0 40px;
      }
    }
  }
}
</style>
