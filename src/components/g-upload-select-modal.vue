<template>
  <div class="g-upload-select-modal">
    <!-- 选择文件 -->
    <g-modal
      width="600px"
      :body-style="{ padding: '40px' }"
      :visible="visible"
      @cancel="emit('update:visible', false)"
      :footer="null"
    >
      <div class="g-upload-select-modal-info">
        <div>
          <i class="iconfont icon-information-fill"></i>
        </div>
        <div>
          <h6>
            <slot name="title">{{ title }}</slot>
          </h6>
          <p>
            <slot name="subTitle">{{ subTitle }}</slot>
          </p>
        </div>
      </div>
      <div class="g-upload-select-modal-content">
        <div class="g-upload-select-modal-title">选择上传方式</div>
        <div class="g-upload-select-modal-btns">
          <a-form-item-rest>
            <a-upload
              multiple
              :showUploadList="false"
              :fileList="fileList"
              @change="onFolderChange"
              :customRequest="customRequest"
            >
              <a-button type="default" class="icon-button" @click="onSelectFiles">
                <i class="iconfont icon-image-fill"></i>

                照片
              </a-button>
            </a-upload>
          </a-form-item-rest>
          <a-form-item-rest>
            <a-upload
              directory
              :showUploadList="false"
              :fileList="fileList"
              @change="onFolderChange"
              :customRequest="customRequest"
            >
              <a-button type="default" class="icon-button" @click="onSelectFolder">
                <i class="iconfont icon-folder-3-line"></i>
                文件夹
              </a-button>
            </a-upload>
          </a-form-item-rest>
        </div>
      </div>
    </g-modal>

    <!-- 上传中 --><!-- 上传完成 -->
    <g-modal
      width="600px"
      :visible="uploadingVisible"
      title="批量上传"
      :footer="null"
      :maskClosable="false"
      @cancel="onUploadingCancel"
    >
      <div class="g-upload-loading-content">
        <i v-if="isFinish" class="iconfont icon-checkbox-circle-fill"></i>
        <g-loading :spinning="true" v-else></g-loading>
        <div class="g-upload-loading-title">{{ isFinish ? '上传完成' : '上传中...' }}</div>
        <!-- 入库数量 -->
        <ul class="g-upload-loading-info">
          <li>
            <span>入库成功数量：</span>
            <span>{{ successNum || 0 }}</span>
          </li>
          <li>
            <span>入库失败数量：</span>
            <a style="text-decoration: underline" @click="handleOpenUploadRecord">{{ errorList.length || 0 }}</a>
          </li>
        </ul>
        <a-button type="primary" style="margin-top: 24px" @click="onUploadingCancel" v-if="isFinish">确定</a-button>
      </div>
    </g-modal>

    <!-- 上传记录 -->
    <g-modal width="600px" v-model:visible="uploadRecordVisible" title="上传结果" :footer="null">
      <div class="g-upload-record-content">
        <div class="g-upload-record-title">入库失败记录</div>
        <ul class="g-upload-record-list">
          <li v-for="(item, index) in errorList" :key="item.name">
            <span>{{ index + 1 }}</span>
            <span :title="item.name">{{ item.name }}</span>
            <span :title="item.error">{{ item.error }}</span>
          </li>
        </ul>
      </div>
    </g-modal>
  </div>
</template>

<script setup lang="ts">
import { ModuleType, commonApi } from '@/services/api'
import { isDpi } from '@/utils/utils'
import { UploadChangeParam, UploadFile, message } from 'ant-design-vue'
import { computed, ref } from 'vue'
import GLoading from './g-loading.vue'
import { confirm } from '@/utils/antd.util'

interface UploadSeleceModalProps {
  visible?: boolean
  title?: string
  subTitle?: string
  accept?: string
  dpi?: [number, number] | [[number, number], [number, number]]
  maxFileSize?: number
  moduleType?: ModuleType
  uploadUrl?: string // 上传地址
  beforeUpload?: (file: File) => Promise<boolean | string>
  onSuccess?: (res: any) => Promise<any>
}
const props = withDefaults(defineProps<UploadSeleceModalProps>(), {
  visible: false,
  title: '上传照片',
  subTitle: '图片格式JPG、PNG',
  maxFileSize: -1,
  accept: 'png,jpg',
  dpi: undefined,
  moduleType: ModuleType.AI_UNIFORM,
  uploadUrl: '/upload',
  beforeUpload: () => Promise.resolve(true),
  onSuccess: () => Promise.resolve(),
})
const emit = defineEmits(['update:visible', 'on-cancel'])

// 选择文件
const onSelectFiles = () => {
  isFlag = false
  emit('update:visible', false)
}
// 选择文件夹
const onSelectFolder = () => {
  isFlag = false
  emit('update:visible', false)
}

// 上传文件夹
const successNum = ref(0)
const errorList = ref<any[]>([])
const uploadingVisible = ref(false)
// 特殊标识
const special = ref(false)
// 是否完成
const isFinish = computed(() => {
  return special.value || successNum.value + errorList.value.length === fileList.value.length
})
const fileList = ref<UploadFile[]>([])
// 是否中断上传
let isCancel = false
const onFolderChange = (info: UploadChangeParam<UploadFile<any>>) => {
  fileList.value = info.fileList
}

let isFlag = false
const customRequest = async () => {
  if (isFlag) return
  isFlag = true
  if (!uploadingVisible.value) {
    uploadingVisible.value = true
  }
  for (let index = 0; index < fileList.value.length; index++) {
    if (isCancel) break
    try {
      const file = fileList.value[index].originFileObj as any

      // 验证文件大小
      if (props.maxFileSize !== -1) {
        const maxSize = props.maxFileSize * 1024 * 1024
        if (file.size > maxSize) {
          throw {
            type: 'verify',
            error: '超出文件大小',
            name: file.name,
          }
        }
      }

      // 验证文件类型
      if (props.accept.trim() !== '') {
        const postfix: string = file?.name?.split('.')?.slice(-1)[0]
        if (!props?.accept?.split(',')?.includes(postfix)) {
          throw {
            type: 'verify',
            error: '文件类型错误',
            name: file.name,
          }
        }
      }

      // 验证分辨率
      if (props.dpi) {
        try {
          await isDpi(file, props?.dpi)
        } catch (error) {
          throw {
            type: 'verify',
            error: '分辨率错误',
            name: file.name,
          }
        }
      }

      if (props.beforeUpload) {
        try {
          await props.beforeUpload(file)
        } catch (error) {
          throw {
            type: 'verify',
            error: error,
            name: file.name,
          }
        }
      }

      const formData = new FormData()
      formData.append('file', file)
      try {
        console.log('上传地址', props.uploadUrl)
        const { data } = await commonApi.upload(props.moduleType, formData, undefined, props.uploadUrl)
        await props.onSuccess({ ...data, name: file.name })
        successNum.value++
      } catch (error: any) {
        throw {
          type: 'fail',
          error: error?.data?.message || '上传失败',
          code: error?.data?.code || 0,
          name: file.name,
        }
      }
    } catch (error: any) {
      if (error?.type === 'fail') {
        if (error?.code === -14 || error?.code === -15) {
          isCancel = true
          special.value = true
          message.error(error.error)
        } else {
          errorList.value.push({ name: error.name, error: error.error })
        }
      } else if (error?.type === 'verify') {
        errorList.value.push({ name: error.name, error: error.error })
      } else {
        errorList.value.push({ name: '未知文件名', error: '上传失败' })
      }
    }
  }
}

/**
 * 取消上传
 */
const onUploadingCancel = () => {
  uploadingVisible.value = true
  if (!isFinish.value) {
    confirm({
      title: '文件上传中，是否中断上传并退出',
      onOk: () => {
        isCancel = true
        run()
      },
    })
    return
  }
  run()
  function run() {
    special.value = false
    isCancel = false
    uploadingVisible.value = false
    successNum.value = 0
    errorList.value = []
    fileList.value = []
    emit('on-cancel')
  }
}

/**
 * 上传记录
 */
const uploadRecordVisible = ref<boolean>(false)
const handleOpenUploadRecord = () => {
  if (errorList.value.length === 0) return
  uploadRecordVisible.value = true
}
</script>

<style lang="less" scoped>
.g-upload-select-modal-info {
  display: flex;
  gap: 0 10px;
  i {
    color: @text3;
  }
  h6 {
    font-size: 12px;
    margin: 0;
    color: @text2;
    padding-top: 3px;
  }
  p {
    font-size: 12px;
    line-height: 20px;
    margin-top: 8px;
    color: @text1;
  }
}

.g-upload-select-modal-content {
  display: flex;
  align-items: center;
  margin-top: 40px;
  gap: 0 24px;
  font-size: 14px;
  color: @text2;
  .g-upload-select-modal-btns {
    display: flex;
    gap: 0 8px;
  }
}

.g-upload-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 0;
  .g-upload-loading-title {
    font-size: 14px;
    color: @text1;
    margin: 20px 0;
    font-weight: 700;
    font-size: 14px;
  }
  .g-upload-loading-info {
    color: @text1;
    font-size: 14px;
    > li {
      margin-top: 16px;
    }
    a {
      color: @primary2;
      margin-left: 2px;
    }
  }

  .icon-checkbox-circle-fill {
    transform: translateY(-30px);
    font-size: 64px;
    color: @success;
    height: 50px;
  }
}

.g-upload-record-content {
  .g-upload-record-title {
    font-weight: 700;
    font-size: 14px;
    color: @text1;
  }
  .g-upload-record-list {
    border: 1px solid @border3;
    border-radius: 2px;
    margin-top: 16px;
    max-height: 600px;
    overflow: auto;
    background: #202c40;
    li {
      height: 38px;
      border-bottom: 1px solid @border1;
      display: flex;
      align-items: center;
      font-size: 14px;
      color: @text1;

      &:last-child {
        border-bottom: none;
      }

      > span {
        display: block;
        &:nth-child(1) {
          width: 83px;
          padding-left: 24px;
        }
        &:nth-child(2),
        &:nth-child(3) {
          flex: 1;
          .ellipsis();
        }
      }
    }
  }
}
</style>
