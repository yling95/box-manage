<template>
  <div class="local-detection-page">
    <div class="local-detection-form-wrap">
      <header>
        <div class="go-back-btn" @click="router.replace('/system-layout/local-detection/list')">
          <i class="iconfont icon-arrow-go-back-line"></i>
        </div>
        <p>{{ taskId ? '编辑任务' : '创建任务' }}</p>
      </header>
      <main>
        <div>
          <task-form ref="taskFormRef" :uid="uid" @on-upload-status="onUploadStatus"></task-form>
          <div class="button-list">
            <a-button
              type="primary"
              class="submit-btn"
              :disabled="uploadStatus === 'uploading'"
              :loading="loading"
              @click="handleSubmit"
            >
              确定
            </a-button>
            <a-button class="submit-btn" @click="handleCancel"> 取消 </a-button>
          </div>
          <p class="submit-info">数据上传成功后，才可以点击确定完成任务创建</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import TaskForm from './components/task-form.vue'
import { ref } from 'vue'
import { localDetectionApi } from '@/services/api'
import { confirm, message } from '@/utils/antd.util'
import { useRequest } from 'vue-request'
import { UploadStatus } from '@/components/g-upload-dragger.vue'
import { beforeRouteLeaveWhiteList } from '@/config'
// import { useGlobalStore } from '@/store/global'

const uid = `${Date.now()}`

const route = useRoute()
const router = useRouter()
// const globalStore = useGlobalStore()

const taskId = route.query.id
let isSave = false

const taskFormRef = ref<InstanceType<typeof TaskForm>>()
const { loading, runAsync: runCreateTask } = useRequest(localDetectionApi.createTask)
const handleSubmit = async () => {
  try {
    const data = await taskFormRef.value?.getFormData()
    await runCreateTask(data)
    await taskFormRef.value?.reset()
    await taskFormRef.value?.resetFileList(false)
    isSave = true
    router.replace('/system-layout/local-detection/list')
    message.success('操作成功')
  } catch (error) {
    console.log(error)
  }
}

const handleCancel = () => {
  confirm({
    title: '是否取消创建任务？',
    onOk: async () => {
      isSave = true
      await cancel()
      router.replace('/system-layout/local-detection/list')
    },
  })
}

// 取消任务
const cancel = async () => {
  await taskFormRef.value?.reset()
  await taskFormRef.value?.resetFileList()
}

const uploadStatus = ref<UploadStatus>('done')
const onUploadStatus = (status: UploadStatus) => {
  uploadStatus.value = status
}

const getDetailInfo = () => {
  // globalStore.updateLoading(true, { tip: '加载中...'})
  console.log('详细信息')
}

;(() => {
  console.log(taskId, 'taskId')
  taskId && getDetailInfo()
})()

// 路由后置守卫
onBeforeRouteLeave((to, _from, next) => {
  if (!isSave && !beforeRouteLeaveWhiteList.includes(to.path)) {
    confirm({
      title: '是否取消创建任务？',
      onOk: async () => {
        await cancel()
        next && next()
      },
    })
  } else {
    next && next()
  }
})
</script>

<style lang="less" scoped>
@import './styles/index.less';
main {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 水平居中 */
}
.local-detection-form-wrap {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: rgba(46, 75, 120, 0.15);
  display: flex;
  flex-direction: column;
  position: relative;
  > header {
    width: 100%;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 0 12px;
    padding: 22px 40px 16px;
    border-bottom: 1px solid @border2;
    box-shadow: 0px 1px 2px 0px rgba(2, 36, 59, 0.03);

    > p {
      font-size: 22px;
      font-weight: 700;
      line-height: 32px;
      color: @text2;
    }
  }

  > main {
    padding: 56px 120px;
    overflow: auto;

    .button-list {
      display: flex;
      gap: 0 8px;
      padding-top: 32px;
    }

    .submit-info {
      color: @text4;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
      margin-top: 4px;
    }
  }
}
</style>
