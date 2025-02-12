<template>
  <div class="task-list-bar" :style="positionStyle" ref="boxRef" v-if="props.visible">
    <header class="queue-header">
      <h3>任务队列</h3>
      <div class="clear-operation" @click="handelClear">
        <i class="iconfont icon-brush-2-line"></i>
        <div>清空</div>
      </div>
    </header>
    <main class="queue-main">
      <div class="table-empty" v-if="taskStore.taskDataList.length === 0">
        <img src="@/assets/images/alarm/icon_list_empty.png" />
        <p>无数据</p>
      </div>
      <div class="queue-item" v-for="item in taskStore.taskDataList" :key="item.id">
        <div class="the-queue">
          <div class="item_left">
            <i class="iconfont icon-file-line"></i>
            <div class="the-queue-name" :title="item?.name">{{ item?.name }}</div>
          </div>
          <div class="item_right">
            <p v-if="item.jobStates === 1">资源准备中..</p>
            <p v-else-if="item.jobStates === 2">排队中..</p>
            <a-button v-else class="operation-buttons" @click="handleDownloadRetry(item)">{{
              item.jobStates === 1 ? '' : item.jobStates === -1 ? '重试' : '下载'
            }}</a-button>
          </div>
          <i class="iconfont icon-close-line" @click="handleDelete(item)"> </i>
        </div>
      </div>
    </main>
    <!-- <footer class="queue-footer">
      <div class="footer-prompt">最多暂存10条任务</div>
    </footer> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import { confirm } from '@/utils/antd.util'
import { downloadFile, commonTaskApi } from '@/services/api'
import { useGlobalStore } from '@/store/global'
import { getRealUrl } from '@/utils/utils'
import { useTaskStore } from '@/store/task'

interface TsProps {
  buttonId: string
  visible: boolean
  taskType: 0 | 1
}
const props = withDefaults(defineProps<TsProps>(), {
  buttonId: 'taskBtnID',
  taskType: 0,
})

const positionStyle = ref({ '--top-fixed': `10px`, '--left-fixed': `20px` })

const globalStore = useGlobalStore()
const taskStore = useTaskStore()
const { updateLoading } = globalStore

const emits = defineEmits(['update:visible'])

// 清空
const handelClear = () => {
  confirm({
    title: '确定清空当前任务队列？',
    onOk: async () => {
      try {
        let id = taskStore.taskDataList?.map((i: any) => i.id).toLocaleString()
        let params = {
          idList: id,
          pageType: 1,
        }
        let res: any = await commonTaskApi.deleteExport(params)
        if (res.code === 0) {
          message.success('删除成功')
          await taskStore.getTaskList(1)
        }
      } catch (error) {}
    },
  })
}

// 删除
const handleDelete = async (item: any) => {
  let index = taskStore.taskDataList.findIndex((i: any) => {
    if (i.id === item.id) {
      return true
    }
  })
  confirm({
    title: '删除后不可恢复，是否确认删除！',
    onOk: async () => {
      try {
        let params = {
          idList: item.id,
          pageType: 1,
        }
        let res: any = await commonTaskApi.deleteExport(params)
        if (res.code === 0) {
          taskStore.taskDataList.splice(index, 1)
          await taskStore.getTaskList()
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
      const { data } = await commonTaskApi.downloadExport({ id: item.id, pageType: 1 })
      downloadFile(getRealUrl(data), `${item.name}.zip`)
      updateLoading(false)
    } catch (error) {
      updateLoading(false)
    }
  } else if (item.jobStates === -1) {
    await commonTaskApi.exportPrepare({ id: item.id, retryMark: 1, pageType: 1 })
    taskStore.getTaskList()
  }
}

// 点击其他区域关闭盒子
const boxRef = ref<HTMLElement>()
function handleClickOutside(event: { target: any }) {
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
      taskStore.getTaskList(props.taskType)
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
  taskStore.getTaskList(props.taskType)
})
onBeforeUnmount(() => {
  taskStore.taskDataList = []
  stopWatching()
})
</script>

<style lang="less" scoped>
.task-list-bar {
  z-index: 199999;
  width: 320px;
  height: 560px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid @border3;
  position: fixed;
  left: var(--left-fixed);
  transform: translate(calc(-100% + 16px), 0);
  top: calc(9px + var(--top-fixed));
  background: @background3;
  .queue-header {
    padding: 12px 16px;
    line-height: 32px;
    height: 46px;
    display: flex;
    justify-content: space-between;
    background: #1e2736;
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
    overflow-y: auto;
    padding: 16px 16px;
    height: calc(560px - 46px - 32px);
    background: #202c40;
    .queue-item {
      padding: 8px;
      margin-bottom: 16px;
      position: relative;
      padding-right: 24px;
      &:hover {
        border-radius: 6px;
        background: @mask2;
        .icon-close-line {
          display: block;
          cursor: pointer;
          transition: 0.3s all;
        }
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
        .item_left {
          display: flex;
          align-items: center;
          overflow: hidden; //超出部分隐藏
          white-space: nowrap; //不换行
          text-overflow: ellipsis; //文本溢出显示省略号
          .icon-file-line {
            color: @text4;
            font-size: 22px;
            margin-right: 4px;
          }
          .the-queue-name {
            overflow: hidden;
            color: @text2;
            flex: 1;
            max-width: 120px;
            cursor: default;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: 'Noto Sans SC';
            font-size: 14px;
          }
        }
        .item_right {
          display: flex;
          // width: 33%;
          align-items: center;
          > p {
            color: @text3;
            font-size: 12px;
            line-height: 20px;
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
        position: absolute;
        right: 4px;
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
      cursor: default;
    }
  }
}
</style>
