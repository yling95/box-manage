<template>
  <div class="task-export-queue" :style="positionStyle" ref="boxRef" v-if="visible">
    <header class="queue-header">
      <h3>任务队列</h3>
      <a-button class="clear-operation" @click="handelClear" type="text" :disabled="props.taskNum === 0">
        <i class="iconfont icon-brush-2-line"></i>
        <div>清空</div>
      </a-button>
    </header>
    <main class="queue-main">
      <div class="queue-item" v-for="item in taskQueueData" :key="item.id">
        <div class="the-queue">
          <div class="_left">
            <div class="item_left">
              <i class="iconfont icon-file-line"></i>
              <div class="the-queue-name">{{ item?.name }}</div>
            </div>
            <div class="item_right">
              <p v-if="item.jobStates === 1">资源准备中..</p>
              <p v-else-if="item.jobStates === 2">排队中..</p>
              <a-button v-else class="operation-buttons" @click="handleDownloadRetry(item)">{{
                item.jobStates === 1 ? '' : item.jobStates === -1 ? '重试' : '下载'
              }}</a-button>
              <i v-if="item.jobStates !== 1" class="iconfont icon-close-line" @click="handleDelete(item)"> </i>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import { confirm } from '@/utils/antd.util'
import { downloadFile, localConversionApi } from '@/services/api'
import { useGlobalStore } from '@/store/global'
import { getRealUrl } from '@/utils/utils'

const globalStore = useGlobalStore()
const { updateLoading } = globalStore
interface TsProps {
  buttonId: string
  taskNum: number
  visible: boolean
}

const props = withDefaults(defineProps<TsProps>(), {
  buttonId: 'taskBtnID',
  taskNum: 0,
  visible: true,
})
const emits = defineEmits<{
  (e: 'update:visible', value: any): void
  (e: 'update:taskNum', value: any): void
}>()
const positionStyle = ref({ '--top-fixed': `10px`, '--left-fixed': `20px` })

const taskQueueData = ref([])
// 清空
const handelClear = () => {
  confirm({
    title: '确定清空当前任务队列？',
    onOk: async () => {
      try {
        let id = taskQueueData.value.map((i: any) => i.id).toLocaleString()

        let res: any = await localConversionApi.deleteExport({ idList: id, pageType: 0 })
        if (res.code === 0) {
          message.success('删除成功')
          await getExportList()
          emits('update:taskNum', taskQueueData.value.length)
        }
      } catch (error) {}
    },
  })
}
// 删除    删除接口
const handleDelete = async (item: any) => {
  let index = taskQueueData.value.findIndex((i: any) => {
    if (i.id === item.id) {
      return true
    }
  })
  confirm({
    title: '删除后不可恢复，是否确认删除！',
    onOk: async () => {
      try {
        let res: any = await localConversionApi.deleteExport({ idList: item.id, pageType: 0 })
        if (res.code === 0) {
          taskQueueData.value.splice(index, 1)
          await getExportList()
          emits('update:taskNum', taskQueueData.value.length)
        }
      } catch (error) {}
    },
  })
}

//下载或重试操作
const handleDownloadRetry = async (item: any) => {
  if (item.jobStates === 0) {
    try {
      updateLoading(true, { tip: '正在导出，请稍后...' })
      const { data } = await localConversionApi.downloadExport({ id: item.id, pageType: 0 })

      downloadFile(getRealUrl(data), data.split('/').pop())
      updateLoading(false)
    } catch (error) {
      updateLoading(false)
    }
  } else if (item.jobStates === -1) {
    await localConversionApi.exportPrepare({ id: item.id, retryMark: 1 })
    getExportList()
  }
}

// 表格数据
const getExportList = async () => {
  let res = await localConversionApi.getExportList({ pageType: 0 })
  taskQueueData.value = res.data
  if (taskQueueData.value?.length == null) {
    taskQueueData.value = []
  } else {
    emits('update:taskNum', taskQueueData.value.length)
  }
}

// 点击其他区域关闭盒子
const boxRef = ref<HTMLElement>()
const handleClickOutside = (event: { target: any }) => {
  // 不是 点击任务确认弹窗、点击打开弹窗的按钮
  if (
    boxRef.value &&
    !boxRef.value.contains(event.target) &&
    !document.getElementById(props.buttonId)?.contains(event.target) &&
    !document.getElementsByClassName('ant-modal-wrap').length
  ) {
    return emits('update:visible', false)
  }
}

// 页面尺寸改变更新盒子位置
const handleResize = () => {
  let btnDom = document.getElementById(props.buttonId)
  const rect = btnDom?.getBoundingClientRect()
  positionStyle.value = {
    '--top-fixed': `${rect?.bottom}px`,
    '--left-fixed': `${rect?.right}px`,
  }
}

// 监听弹窗打开时候点击事件
const stopWatching = watch(
  () => props.visible,
  () => {
    if (props.visible) {
      handleResize()
      window.addEventListener('resize', handleResize)
      document.addEventListener('click', handleClickOutside)
      return
    }
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('click', handleClickOutside)
  },
  { deep: true },
)
onMounted(() => {
  getExportList()
})
const getExportListSync = async () => {
  getExportList()
}
onBeforeUnmount(() => {
  stopWatching()
})
defineExpose({
  getExportListSync,
})
</script>

<style lang="less" scoped>
.task-export-queue {
  width: 320px;
  height: 560px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid @border3;
  position: absolute;
  right: 200px;
  top: 130px;
  background: @background3;
  .queue-header {
    padding: 12px 16px;
    line-height: 32px;
    display: flex;
    justify-content: space-between;
    background: @background1;
    > h3 {
      color: @text2;
      font-size: 14px;
      font-weight: 700;
    }
    .clear-operation {
      cursor: pointer;
      color: @text3;
      text-align: center;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      display: flex;
      align-items: center;
      > i {
        margin-right: 4px;
      }
    }
  }
  .queue-main {
    overflow-y: scroll;
    padding: 16px 16px;
    height: calc(560px - 46px);
    .queue-item {
      padding: 8px;
      margin-bottom: 16px;
      position: relative;
      &:hover {
        border-radius: 6px;
        background: @mask2;
      }
      &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        right: 0;
        width: 288px;
        height: 1px;
        background-color: @border3;
      }

      .the-queue {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        ._left {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          .item_left {
            display: flex;
            align-items: center;
            width: 60%;
            overflow: hidden; //超出部分隐藏
            white-space: nowrap; //不换行
            text-overflow: ellipsis; //文本溢出显示省略号
            .icon-file-line {
              color: @text4;
              font-size: 24px;
              margin-right: 4px;
            }
          }
          .item_right {
            display: flex;
            width: 29%;
            align-items: center;
            > p {
              color: @text3;
              font-size: 12px;
              line-height: 20px;
            }
            .icon-close-line {
              // margin-left: 10px;
            }
          }
          .the-queue-name {
            overflow: hidden;
            color: @text2;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: 'Noto Sans SC';
            font-size: 14px;
          }
          .operation-buttons {
            width: 56px !important;
            height: 30px;
            padding: 4px 12px;
            text-align: center;
            border-radius: 8px;
            border: 1px solid @border3;
            background: @mask2;
            box-shadow: @shadow-ss;
            font-size: 14px;
            color: @text2;
            font-weight: 400;
          }
        }
      }
      .icon-close-line {
        color: @text3;
        display: none;
        margin-left: 4px;
      }
      &:hover {
        .icon-close-line {
          display: block;
          cursor: pointer;
        }
      }
    }
    .operation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      > div {
        display: flex;
        align-items: center;
        > .iconfont {
          margin-right: 4px;
          font-size: 14px;
          margin-top: 2px;
        }
      }
    }
  }
  .queue-footer {
    background: @background1;
    height: 32px;
    .footer-prompt {
      color: @text3;
      font-family: 'Noto Sans SC';
      font-size: 12px;
      line-height: 32px;
      padding: 0 16px;
    }
  }
}
</style>
