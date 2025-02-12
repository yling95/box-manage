<template>
  <g-conf-module :show-page-tools="false">
    <template #Slot-Conf-Module-Header>
      <div class="g-second-page-title">
        <i class="iconfont icon-arrow-go-back-line" @click="$router.go(-1)"></i>
        <div class="title" style="color: white">算法授权</div>
      </div>
    </template>
    <template #Slot-Conf-Module-Content>
      <ul class="main-list">
        <li class="item">
          <div class="item-card">
            <div>
              <h6>SN码</h6>
              <p>{{ algoInfo.boxSN }}</p>
            </div>
            <a-button type="default" v-if="algoInfo.boxSN" @click="copyText">复制</a-button>
          </div>
        </li>
        <li class="item">
          <div class="item-card">
            <div>
              <h6>授权算法</h6>
              <p>{{ algoInfo.usableAlgo || '无' }}</p>
            </div>
          </div>
        </li>
        <li class="item">
          <div class="item-card">
            <div>
              <h6>在线授权</h6>
              <p>请确保授权已通过审核并保证网络通畅</p>
            </div>
            <a-button type="default" @click="onOnLineAuth">在线获取</a-button>
          </div>
          <div class="item-card">
            <div>
              <h6>离线授权</h6>
              <p>请联系官方客服人员获取算法授权文件</p>
            </div>
            <a-button type="default" @click="offlineAuthVisible = true">上传文件</a-button>
          </div>
        </li>
        <li class="item">
          <div class="item-card">
            <div>
              <h6>授权平台地址</h6>
              <p>{{ algoInfo.platformAlgoAuthUrl }}</p>
            </div>
            <a-button type="default" @click="updateAuthUrl">编辑</a-button>
          </div>
        </li>
      </ul>
    </template>
  </g-conf-module>

  <!-- 授权平台地址 -->
  <g-modal
    width="416px"
    :closable="false"
    v-model:visible="visibleAuthUrl"
    :body-style="{ padding: '40px 40px 0' }"
    @ok="onSubmitAuthUrl"
    :ok-button-props="{
      loading: updateAuthUrlLoading,
    }"
  >
    <a-form ref="authUrlFormRef" :model="authUrlForm" layout="vertical">
      <a-form-item
        label="授权平台地址"
        name="platformAlgoAuthUrl"
        :rules="[{ required: true, message: '请输入授权平台地址' }]"
        style="margin-bottom: 5px"
      >
        <a-input
          v-model:value.trim="authUrlForm.platformAlgoAuthUrl"
          placeholder="请输入授权平台地址"
          :maxlength="200"
        />
      </a-form-item>
    </a-form>
  </g-modal>

  <g-modal
    :title="'离线授权'"
    :bodyStyle="{ padding: '40px 32px' }"
    v-model:visible="offlineAuthVisible"
    :ok-button-props="{
      loading: offlineAuthLoading,
      disabled: !fileList.length || !fileList.filter((item) => item.status === 'done').length,
    }"
    :footer="offlineAuthStatus ? null : undefined"
    :maskClosable="false"
    @ok="onSubmitOfflineAuth"
  >
    <div class="offline-auth" v-if="!offlineAuthStatus">
      <a-upload
        v-if="offlineAuthVisible"
        class="upload-component"
        :multiple="false"
        :file-list="fileList"
        :accept="'.lic'"
        :maxCount="1"
        :customRequest="customRequest"
        @change="handleChange"
      >
        <a-button>
          <upload-outlined></upload-outlined>
          上传授权文件
        </a-button>
        <template #removeIcon="{ file }">
          <span>
            <CloseOutlined v-if="file.status === 'uploading'" style="color: #fff" />
            <DeleteOutlined v-else style="color: #fff" />
          </span>
        </template>
        <template #iconRender="{ file }">
          <LinkOutlined v-if="file.status === 'done'" style="color: rgba(61, 127, 233, 1)" />
          <FileOutlined v-else-if="file.status === 'error'" style="color: rgba(250, 114, 96, 1)" />
          <ReloadOutlined v-else style="color: rgba(26, 111, 243, 1)" />
        </template>
      </a-upload>
      <div class="remarks">
        请联系官方客服人员获取算法授权文件<br />
        客服电话：400-991-0655（周一至周五9:00-18:00）
      </div>
    </div>
    <div class="offline-auth offline-auth--success" v-else>
      <img src="@/assets/images/public/icon-success-fill.png" />
      <p class="status-text">授权成功</p>
      <a-button type="primary" @click="authSuccessFn">确定</a-button>
    </div>
  </g-modal>

  <g-modal
    :width="600"
    :title="'在线授权'"
    :bodyStyle="{ padding: '40px 32px 60px 32px' }"
    :footer="null"
    v-model:visible="onlineAuthVisible"
    :closable="false"
    :maskClosable="false"
  >
    <div class="online-auth" v-if="!onlineAuthStatus">
      <three-loading />
      <p class="loading-text">正在获取授权文件，请稍等..</p>
    </div>
    <div class="online-auth online-auth--success" v-else>
      <img src="@/assets/images/public/icon-success-fill.png" />
      <p class="status-text">授权成功</p>
      <a-button type="primary" @click="authSuccessFn">确定</a-button>
    </div>
  </g-modal>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, createVNode, watch } from 'vue'
import { systemApi, ModuleType, commonApi } from '@/services/api'
import { useRequest } from 'vue-request'
import { FormInstance, Modal } from 'ant-design-vue'
import { InfoCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue'
import { message } from '@/utils/antd.util'
import type { UploadChangeParam } from 'ant-design-vue'
import axios from 'axios'
import { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface'
import ThreeLoading from '../_components/three-loading.vue'

interface Algo {
  boxSN: string
  usableAlgo: string | null
  platformAlgoAuthUrl: string | null
}
const algoInfo = reactive<Algo>({
  boxSN: '',
  usableAlgo: null,
  platformAlgoAuthUrl: '',
})

/**
 * 修改平台地址
 */
const visibleAuthUrl = ref<boolean>(false)
const authUrlFormRef = ref<FormInstance>()
const authUrlForm = reactive<{ platformAlgoAuthUrl: any }>({
  platformAlgoAuthUrl: '',
})
const updateAuthUrl = () => {
  visibleAuthUrl.value = true
  authUrlForm.platformAlgoAuthUrl = algoInfo.platformAlgoAuthUrl
}
const { loading: updateAuthUrlLoading, runAsync: runUpdateAuthUrl } = useRequest(systemApi.updateAlgoAuthUrl)
const onSubmitAuthUrl = async () => {
  try {
    await authUrlFormRef.value?.validate()
    await runUpdateAuthUrl(authUrlForm)
    getAlgoInfo()
    authUrlFormRef.value?.resetFields()
    message.success('操作成功')
    visibleAuthUrl.value = false
  } catch (error) {
    console.error(error)
  } finally {
    updateAuthUrlLoading.value = false
  }
}

/**
 * 复制
 */
const copyText = async () => {
  // try {
  //   await navigator.clipboard.writeText(algoInfo.boxSN)
  //   message.success('复制成功')
  // } catch (err) {
  //   message.error('复制失败')
  // }
  const textArea = document.createElement('textarea')
  textArea.value = algoInfo.boxSN
  textArea.style.position = 'fixed'
  document.body.appendChild(textArea)
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    const messageText = successful ? '复制成功' : '复制失败'
    message.success(messageText)
  } catch (err) {
    message.error('复制失败')
  }

  document.body.removeChild(textArea)
}

/**
 * 离线授权
 */
const offlineAuthVisible = ref<boolean>(false)
const fileList = ref<any[]>([])
const offlineAuthStatus = ref(false)
const handleChange = (info: UploadChangeParam) => {
  const fileName = info.file.name
  const fileType = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2)
  if (fileType !== 'lic') {
    message.error(info.file.name + '文件类型错误')
    throw {
      type: 'verify',
      error: '文件类型错误',
      name: info.file.name,
    }
  }
  let resFileList = [...info.fileList]
  resFileList = resFileList.slice(-2)
  resFileList = resFileList.map((file) => {
    if (file.response) {
      file.url = file.response
    }
    return file
  })

  fileList.value = resFileList
}

const customRequest = async (options: UploadRequestOption) => {
  const { file, onProgress, onError, onSuccess } = options
  const formData = new FormData()
  formData.append('file', file)
  const source = axios.CancelToken.source()
  commonApi
    .upload(ModuleType.ALGO_AUTH, formData, {
      cancelToken: source.token,
      onUploadProgress: (progressEvent) => {
        let percents = (progressEvent.progress || 0) * 100
        if (typeof onProgress === 'function') {
          // 更新进度条
          onProgress({ percent: percents })
        }
      },
    })
    .then((res: any) => {
      console.log('上传', res)
      if (res.code === 0) {
        if (typeof onSuccess === 'function') {
          onSuccess(res.data.relativeFilePath)
        }
      } else {
        if (typeof onError === 'function') {
          onError(res.message, res.message)
        }
      }
    })
    .catch((err) => {
      if (typeof onError === 'function') {
        onError(err.message)
      }
    })
}
const { loading: offlineAuthLoading, runAsync: runOfflineAuth } = useRequest(systemApi.algoAuthOffline)
const onSubmitOfflineAuth = async () => {
  try {
    let params = {
      algoAuthFile: fileList.value[0].url,
    }
    await runOfflineAuth(params)
    offlineAuthStatus.value = true
  } catch (error) {
    console.error(error)
    // offlineAuthStatus.value = true
  } finally {
    offlineAuthLoading.value = false
  }
}
const authSuccessFn = () => {
  offlineAuthVisible.value = false
  offlineAuthStatus.value = false
  onlineAuthVisible.value = false
  onlineAuthStatus.value = false
}
watch(
  () => offlineAuthVisible.value,
  (value) => {
    value ? '' : (fileList.value = [])
  },
  { deep: true },
)

/**
 * 在线授权
 */
const onlineAuthVisible = ref<boolean>(false)
const onlineAuthStatus = ref<boolean>(false)

const { loading: onlineAuthLoading, runAsync: runOnlineAuth } = useRequest(systemApi.algoAuthOnline)
const onOnLineAuth = async () => {
  try {
    onlineAuthVisible.value = true
    let res: any = await runOnlineAuth()
    console.log('在线授权', res)
    if (res.code === 0) {
      onlineAuthStatus.value = true // 授权成功
    }
  } catch (error: any) {
    console.error(error)
    onlineAuthVisible.value = false
    if (error.data.code === -18) {
      Modal.error({
        content: error.data.message,
        centered: true,
        cancelText: null,
        icon: () => createVNode(CloseCircleFilled, { style: 'color:rgba(186, 59, 41, 1);' }),
        okType: 'default',
      })
      return
    }
    Modal.info({
      content: error.data.message,
      centered: true,
      cancelText: null,
      icon: () => createVNode(InfoCircleFilled, { style: 'color:rgba(61, 127, 233, 1);' }),
      okType: 'default',
    })
  } finally {
    onlineAuthLoading.value = false
  }
}

/**
 * 算法授权信息
 */
const { runAsync: runGetAlgoInfo } = useRequest(systemApi.getAlgoAuth)
const getAlgoInfo = async () => {
  try {
    const { data } = await runGetAlgoInfo()
    Object.assign(algoInfo, data)
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * 获取系统信息
 */
onMounted(async () => {
  await getAlgoInfo()
})
</script>

<style lang="less" scoped>
.main-list {
  width: 800px;
  display: flex;
  flex-direction: column;
  gap: 20px 0;
  margin: 0 auto;
  padding-top: 40px;
  .item {
    width: 100%;
    border: 1px solid @border2;
    border-radius: 4px;
    background: @background3;

    .item-card {
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.3s;
      .item-text {
        display: flex;
        align-items: center;
        color: @text1;
        font-weight: 400;
        font-size: 16px;
        margin: 0;
        line-height: 24px;
        > span {
          display: inline-block;
          height: 14px;
          color: @text4;
          cursor: pointer;
          margin: 0 0 10px 8px;
          i {
            font-size: 14px;
          }
        }
      }
      > div {
        display: flex;
        flex-direction: column;
        gap: 8px 0;

        > h6 {
          color: @text1;
          font-weight: 400;
          font-size: 16px;
          margin: 0;
          line-height: 24px;
          > span {
            display: inline-block;
            height: 14px;
            color: @text4;
            cursor: pointer;
            i {
              font-size: 14px;
            }
          }
        }

        > img {
          width: 40px;
          height: 40px;
        }

        > p {
          font-size: 14px;
          color: @text3;
          line-height: 22px;
        }
      }
      position: relative;
    }
  }

  hr {
    margin: 0 20px;
    background-color: @border2;
    border: none;
    height: 1px;
  }
}

.offline-auth {
  .remarks {
    color: @text3;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    margin-top: 12px;
  }
  .upload-component {
    :deep(.ant-upload-list) {
      background: none;
    }
    :deep(.anticon-paper-clip) {
      color: rgba(61, 127, 233, 1);
    }
    :deep(.ant-upload-list-item-card-actions) {
      .ant-btn-text {
        width: auto !important;
        padding: 0 !important;
      }
    }
  }
  &--success {
    // 授权成功样式
    text-align: center;
    .status-text {
      margin-top: 16px;
      margin-bottom: 24px;
      color: @text1;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 22px; /* 157.143% */
    }
  }
}

.online-auth {
  text-align: center;
  .loading-text {
    color: @text1;
    margin-top: 16px;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 22px;
  }
  &--success {
    // 授权成功样式
    text-align: center;
    .status-text {
      margin-top: 16px;
      margin-bottom: 24px;
      color: @text1;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 22px; /* 157.143% */
    }
  }
}
</style>
