<template>
  <div class="g-upload-image">
    <a-checkbox-group :value="checkedList" @change="onCheckedChange">
      <ul class="g-upload-image-list">
        <!-- 图片列表 -->
        <li
          class="g-upload-image-list-item"
          :class="[activeIndex === index && 'active']"
          :style="{ width: style.width, cursor: closePreview ? 'default' : 'pointer' }"
          v-for="(item, index) in value"
          :key="item?.uid || index"
          @click.stop="onClickItem(item, index)"
        >
          <!-- 图片盒子 -->
          <label :for="showCheckbox ? item.uid + '' : ''" :style="{ cursor: showCheckbox ? 'pointer' : 'default' }">
            <div class="g-upload-image-item-wrap" :style="style">
              <template v-if="item.status === 'loading'">
                <div class="icon-loader">
                  <i class="iconfont icon-loader-line"></i>
                </div>
              </template>
              <template v-else>
                <div class="g-upload-image-operation" v-if="value.length && !readonly && !showCheckbox">
                  <!-- 修改 -->

                  <label v-if="showUpdateIcon" @click.stop>
                    <a-tooltip>
                      <template #title> 编辑 </template>
                      <i class="iconfont icon-edit-line" @click.stop="onUpdateImage(item, index)"></i>
                    </a-tooltip>

                    <input
                      v-if="!disabledUpdateUpload"
                      id="g-upload-image-input"
                      class="g-upload-image-input"
                      type="file"
                      @change.stop="onFileChange($event, index)"
                    />
                  </label>

                  <i
                    v-if="showDeleteIcon"
                    class="iconfont icon-delete-bin-line"
                    @click.stop="onRemoveImage(item, index)"
                  ></i>

                  <a-tooltip>
                    <template #title v-if="readRecordIcon"> 识别记录</template>
                    <i
                      class="iconfont icon-a-Identifyrecords-line"
                      v-if="readRecordIcon"
                      @click.stop="onReadRecord(item, index)"
                    ></i>
                  </a-tooltip>
                </div>
              </template>
              <!-- 图片 -->
              <img
                class="g-upload-image-img"
                :src="item?.url"
                alt=""
                :onerror="
                    (e:any) => {
                      console.log(e);
                      e.target.src = defaultImage
                      e.target.style.objectFit='cover'
                      e.target.onerror = null 
                    }
                  "
              />
              <!-- 复选框 -->
              <div
                v-show="showCheckbox"
                :show-checkbox-hover="showCheckboxHover && !readonly"
                @click.stop
                class="g-upload-image-checkbox"
              >
                <a-checkbox :id="'' + item.uid" :value="item.uid" />
              </div>
            </div>

            <!-- 名称 -->
            <div class="g-upload-image-name" v-if="showName">{{ item.name }}</div>
          </label>
        </li>
        <!-- 新增 -->
        <label class="g-upload-image-wrap" :style="style" v-if="showAdd && (count === -1 || value.length < count)">
          <div class="g-upload-image-add">
            <div class="icon-loader" v-if="loading">
              <i class="iconfont icon-loader-line"></i>
            </div>
            <div v-else class="icon-add">
              <i class="iconfont icon-add-line"></i>
              <p v-if="placeholder">{{ placeholder }}</p>
            </div>
          </div>
          <input class="g-upload-image-input" type="file" @change="onFileChange" />
        </label>
      </ul>
    </a-checkbox-group>
  </div>
  <alarm-modal ref="alarmModalRef" :hide-info="true"></alarm-modal>
</template>

<script setup lang="ts">
import { ModuleType, commonApi } from '@/services/api'
import { getRealUrl, isDpi } from '@/utils/utils'
import { Form, message } from 'ant-design-vue'
import { CheckboxValueType } from 'ant-design-vue/es/checkbox/interface'
import { computed, ref } from 'vue'
import AlarmModal from './g-preview-record-modal.vue'
import defaultImage from '@/assets/images/alarm/no-img.png'

export interface FileList {
  uid?: number
  name?: string
  status?: 'done' | 'loading' | 'error' | 'removed'
  url?: string
  originalUrl?: string
  disabled?: boolean
}

interface UploadImageProps {
  value?: FileList[]
  showAdd?: boolean
  showName?: boolean
  placeholder?: string
  showUpdateIcon?: boolean
  showDeleteIcon?: boolean
  readRecordIcon?: boolean
  disabledUpdateUpload?: boolean
  disabledDelete?: boolean
  size?: 'small' | 'middle' | 'large'
  activeIndex?: number
  count?: number
  maxFileSize?: number
  accept?: string
  dpi?: [number, number] | [[number, number], [number, number]]
  moduleType?: ModuleType
  showCheckbox?: boolean
  checkedList?: number[]
  readonly?: boolean
  closePreview?: boolean
  uploadUrl?: string // 上传地址
  // 鼠标移入显示checkbox
  showCheckboxHover?: boolean
  // 文件上传前的钩子，参数为上传的文件
  beforeUpload?: (file: File) => boolean
  beforeAddFileList?: (file: FileList) => FileList
}
const props = withDefaults(defineProps<UploadImageProps>(), {
  value: () => [],
  showAdd: true,
  showName: false,
  placeholder: '',
  showUpdateIcon: true,
  showDeleteIcon: true,
  readRecordIcon: false,
  disabledUpdateUpload: false,
  disabledDelete: false,
  size: 'middle',
  activeIndex: -1,
  count: -1,
  maxFileSize: -1,
  accept: 'png,jpg',
  dpi: undefined,
  maxDpi: undefined,
  moduleType: ModuleType.SYSTEM,
  showCheckbox: false,
  readonly: false,
  closePreview: true,
  showCheckboxHover: false,
  checkedList: () => [],
  beforeUpload: () => true,
  beforeAddFileList: (file: FileList) => file,
})
const emit = defineEmits([
  'update:value',
  'update:checkedList',
  'on-click-item',
  'on-success',
  'on-error',
  'on-remove',
  'on-update',
  'on-checked-change',
  'on-read-record',
])
const formItemContext = Form.useInjectFormItemContext()

const style = computed(() => {
  return {
    width: props.size === 'small' ? '60px' : props.size === 'middle' ? '110px' : '120px',
    height: props.size === 'small' ? '60px' : props.size === 'middle' ? '110px' : '120px',
  }
})

// 选中的复选框
const onCheckedChange = (checkedValue: CheckboxValueType[]) => {
  emit('update:checkedList', checkedValue)
  emit('on-checked-change', checkedValue)
}

// 点击图片
const alarmModalRef = ref<InstanceType<typeof AlarmModal>>()
const onClickItem = (item: FileList, index: number) => {
  if (item.disabled) return
  emit('on-click-item', item, index)
  !props.closePreview && onPreview(item)
}

/**
 * 预览图片
 * @param item
 * @param index
 */
const onPreview = (item: FileList) => {
  const data = [
    {
      id: item.uid,
      type: 'image',
      image: item.url,
    },
  ] as any[]
  alarmModalRef.value?.openModal(data)
}

// 删除图片
const onRemoveImage = (item: FileList, index: number) => {
  if (!props.disabledDelete) {
    const file = props.value.filter((_item, i) => i !== index)
    emit('update:value', file)
  }
  emit('on-remove', item, index)
  formItemContext.onFieldChange()
}

// 查看识别记录
const onReadRecord = (item: FileList, index: number) => {
  emit('on-read-record', item, index)
}

const onUpdateImage = (item: FileList, index: number) => {
  emit('on-update', item, index)
}

// 上传图片
const loading = ref<boolean>(false)
const onFileChange = async (e: any, index?: number) => {
  try {
    if (e.target.files.length === 0) {
      return message.error('未选择文件')
    }
    const file = e.target.files[0]
    // 验证文件大小
    const isLt2M = file.size! / 1024 / 1024 < props.maxFileSize
    if (props.maxFileSize !== -1 && !isLt2M) {
      return message.error(`文件大小不能超过${props.maxFileSize}M`)
    }
    // 验证格式
    const postfix: string = file?.name?.split('.')?.slice(-1)[0]
    if (!props?.accept?.split(',')?.includes(postfix)) {
      return message.error(`仅支持${props?.accept}格式`)
    }

    // 验证分辨率
    if (props?.dpi) {
      try {
        await isDpi(file, props?.dpi)
      } catch (error) {
        if (typeof props?.dpi[0] === 'number') {
          const dpi = props?.dpi as [number, number]
          return message.error(`仅支持${dpi[0]}*${dpi[1]}分辨率以上的图片`)
        } else {
          const dpi = props?.dpi as [[number, number], [number, number]]
          if (error === -3) {
            return message.error(`仅支持${dpi[1][0]}*${dpi[1][1]}分辨率以下的图片`)
          } else {
            return message.error(`仅支持${props?.dpi[0][0]}*${props?.dpi[0][1]}分辨率以上的图片`)
          }
        }
      }
    }

    if (props.beforeUpload && !props.beforeUpload(file)) {
      e.target.value = ''
      return
    }
    loading.value = true
    const fileObj: FileList = {
      name: file.name,
      status: 'loading',
    }
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await commonApi.upload(props.moduleType, formData, undefined, props.uploadUrl)
    fileObj.url = getRealUrl(data.relativeFilePath)
    fileObj.originalUrl = data.relativeFilePath
    let fileList = props.value
    if (index !== undefined) {
      // 替换
      fileObj.uid = fileList[index].uid
      fileList[index] = props.beforeAddFileList ? props.beforeAddFileList(fileObj) : fileObj
    } else {
      // 添加
      fileObj.uid = Date.now()
      fileList.push(props.beforeAddFileList ? props.beforeAddFileList(fileObj) : fileObj)
    }
    fileObj.status = 'done'
    loading.value = false
    emit('update:value', fileList)
    emit('on-success', fileObj, fileList)
    formItemContext.onFieldChange()
  } catch (error) {
    loading.value = false
    emit('on-error', error)
    formItemContext.onFieldChange()
  }
}
</script>

<style lang="less" scoped>
.g-upload-image {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  .g-upload-image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    position: relative;
    .g-upload-image-list-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .g-upload-image-item-wrap {
        flex-shrink: 0;
        background: @background1;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        width: 100%;
        height: 100%;
        .center();

        .icon-loader {
          position: absolute;
          left: 50%;
          top: 50%;
          margin-top: -12px;
          margin-left: -12px;
        }

        .g-upload-image-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .g-upload-image-checkbox {
          position: absolute;
          right: 6px;
          top: 2px;
          :deep(.ant-checkbox-inner) {
            background-color: #fff !important;
          }
          :deep(.ant-checkbox-checked) {
            .ant-checkbox-inner {
              background: #1a6ff3 !important;
            }
          }
        }

        &:hover {
          .g-upload-image-operation {
            .center();
          }
          .g-upload-image-checkbox[show-checkbox-hover='true'] {
            display: block !important;
          }
        }
      }

      .g-upload-image-name {
        height: 20px;
        line-height: 20px;
        font-weight: 400;
        padding: 0 8px;
        font-size: 12px;
        color: @text1;
        text-align: center;
        .ellipsis();
      }

      .g-upload-image-operation {
        display: none;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 0 12px;
        position: absolute;
        border-radius: 6px;
        background: @mask8;
        i {
          font-size: 16px;
          color: #ffffff;
          cursor: pointer;
        }
      }
      &.active {
        border: 2px solid @primary1;
      }
    }
  }

  .g-upload-image-wrap {
    width: 48px;
    height: 48px;
    .g-upload-image-add {
      width: 100%;
      height: 100%;
      background: @background1;
      border: 1px dashed @text4;
      border-radius: 6px;
      cursor: pointer;
      .center();
    }
    .icon-loader {
      width: 21px;
      height: 21px;
      animation: rotate 1s linear infinite;
      .center();
      i {
        font-size: 20px;
        color: @primary1;
      }
    }

    .icon-add {
      text-align: center;
      color: @text2;
      font-size: 14px;
      i {
        font-size: 18px;
      }
    }
  }
  .g-upload-image-input {
    display: none;
  }
}
</style>
