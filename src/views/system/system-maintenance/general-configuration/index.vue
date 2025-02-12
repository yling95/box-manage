<template>
  <!-- <a-spin :spinning="loading"> -->
  <div class="system-maintenance-page">
    <ul class="main-list">
      <li class="item">
        <div class="item-card">
          <div>
            <h6>系统LOGO</h6>
            <p>支持PNG、JPG格式图片，大小不超过2M（建议图片尺寸为1:1）</p>
          </div>
          <g-upload-image
            :show-delete-icon="false"
            v-model:value="logo"
            @on-success="onSuccessLogo"
            :readonly="!checkKey('system-maintenance-edit-logo')"
            :count="1"
            :max-file-size="2"
            size="small"
          />
        </div>
        <hr />
        <div class="item-card">
          <div>
            <h6>系统名称</h6>
            <p>{{ systemInfo?.systemName || '' }}</p>
          </div>
          <a-button type="default" @click="updateName" v-auth="'system-maintenance-edit-name'">更改</a-button>
        </div>
      </li>
      <li class="item">
        <div class="item-card">
          <div>
            <h6>系统时间</h6>
            <p>{{ currentTime || '' }}</p>
          </div>
          <a-button type="default" @click="updateTime" v-auth="'system-maintenance-edit-time'">更改</a-button>
        </div>
      </li>
      <li class="item">
        <div class="item-card">
          <div>
            <div class="item-text">
              <img style="width: 102px; margin-right: 8px" src="@/assets/images/system/text.png" />
              <p>固件版本</p>
              <a-tooltip trigger="click" title="升级过程需要1-10分钟，请不要关闭电源，完成升级后将自动重启">
                <span>
                  <i class="iconfont icon-information-line"></i>
                </span>
              </a-tooltip>
            </div>
            <p>{{ systemInfo?.hardwareVersion || '' }}</p>
          </div>
          <a-button type="default" @click="firmwareUpgrade" v-auth="'system-maintenance-firmware-update'">
            升级
          </a-button>
        </div>
        <hr />
        <div class="item-card">
          <div>
            <h6>
              软件版本
              <a-tooltip trigger="click" title="升级过程需要1-10分钟，请不要关闭电源，完成升级后将自动重启">
                <span>
                  <i class="iconfont icon-information-line"></i>
                </span>
              </a-tooltip>
            </h6>
            <p>{{ systemInfo?.softwareVersion || '' }}</p>
          </div>
          <a-button type="default" @click="softwareUpgrade" v-auth="'system-maintenance-software-update'">
            升级
          </a-button>
        </div>
        <hr />
        <div class="item-card">
          <div>
            <h6>算法版本</h6>
            <p>{{ systemInfo?.sdkVersion || '' }}</p>
          </div>
          <a-button type="default" @click="handleAddService" v-auth="'ai-service-add'"> 升级 </a-button>
        </div>
      </li>

      <li class="item">
        <div class="item-card card-link" @click="gotoPage(1)">
          <div>
            <div class="item-text">
              <p>算法授权</p>
            </div>
            <p>AI算法需要在授权后才可正常使用</p>
          </div>
          <i class="iconfont icon-arrow-right-s-fill right-icon"></i>
        </div>
        <hr />
        <div class="item-card card-link" @click="gotoPage(2)">
          <div>
            <div class="item-text">
              <p>推送配置</p>
            </div>
            <p>与第三方平台进行数据推送</p>
          </div>
          <i class="iconfont icon-arrow-right-s-fill right-icon"></i>
        </div>
        <hr />
        <div class="item-card card-link" @click="gotoPage(3)">
          <div>
            <div class="item-text">
              <p>平台接入</p>
            </div>
            <p>接入镜鉴魔盒管理平台</p>
          </div>
          <i class="iconfont icon-arrow-right-s-fill right-icon"></i>
        </div>
        <hr />
        <div class="item-card card-link" @click="gotoPage(4)">
          <div>
            <div class="item-text">
              <p>网络配置</p>
            </div>
            <p>接入镜鉴魔盒管理平台</p>
          </div>
          <i class="iconfont icon-arrow-right-s-fill right-icon"></i>
        </div>
      </li>
    </ul>

    <div class="operation">
      <a-button type="default" @click="onShutdown" v-auth="'system-maintenance-shutdown'">关机..</a-button>
      <a-button type="default" @click="onReset" v-auth="'system-maintenance-shutdown'">重启..</a-button>
      <a-button type="text" @click="onFactoryDataReset" v-auth="'system-maintenance-factory-data-reset'">
        恢复出厂设置
      </a-button>
    </div>
  </div>
  <!-- </a-spin> -->
  <!-- 更换LOGO弹窗 -->
  <!-- <g-modal
    width="416px"
    title="系统LOGO"
    v-model:visible="visibleLogo"
    ok-text="更改"
    cancel-text="取消"
    @ok="onSubmitLogo"
    class="logo-modal"
    :bodyStyle="{ padding: 0 }"
  >
    <div class="preview-wrap">
      <img :src="logoForm.file[activeIndex]?.url" alt="" />
    </div>
    <a-form class="logoForm" ref="logoFormRef" :model="logoForm">
      <a-form-item class="form-item" name="logo">
        <div class="form-item-image">
          <a-button
            type="text"
            class="alone-icon-button"
            @click="onImageLast"
            :disabled="activeIndex === 0 || logoForm.file.length === 0"
          >
            <i class="iconfont icon-arrow-left-s-fill"></i>
          </a-button>
          <div class="g-upload-image-wrap">
            <g-upload-image :active-index="activeIndex" v-model:value="logoForm.file" @on-click-item="onClickItem" />
          </div>
          <a-button
            type="text"
            class="alone-icon-button"
            @click="onImageNext"
            :disabled="activeIndex === logoForm.file.length - 1 || logoForm.file.length === 0"
          >
            <i class="iconfont icon-arrow-right-s-fill"></i>
          </a-button>
        </div>
      </a-form-item>
      <p class="selete-file-info">支持PNG、JPG格式图片，大小不超过3M（建议图片尺寸为1:1）</p>
    </a-form>
  </g-modal> -->

  <!-- 更换系统名称弹窗 -->
  <g-modal
    width="416px"
    :closable="false"
    v-model:visible="visibleName"
    ok-text="更改"
    cancel-text="取消"
    :body-style="{ padding: '40px 40px 0' }"
    :ok-button-props="{
      loading: updateNameLoading,
    }"
    @ok="onSubmitName"
  >
    <a-form ref="nameFormRef" :model="nameForm" layout="vertical">
      <a-form-item
        label="系统名称"
        name="systemName"
        :rules="[{ required: true, message: '请输入系统名称' }]"
        style="margin-bottom: 5px"
      >
        <a-input v-model:value.trim="nameForm.systemName" placeholder="请输入系统名称" :maxlength="15" />
      </a-form-item>
    </a-form>
  </g-modal>

  <!-- 更改时间弹窗 -->
  <g-modal
    width="416px"
    title="系统时间"
    v-model:visible="visibleTime"
    ok-text="更改"
    cancel-text="取消"
    :ok-button-props="{ loading: updateTimeLoading }"
    @ok="onSubmitTime"
    :body-style="{ padding: '40px 32px 0' }"
  >
    <a-form ref="timeFormRef" :model="timeForm" layout="vertical">
      <a-form-item label="同步模式" name="timeValue" :rules="[{ required: true, message: '请输入系统名称' }]">
        <a-radio-group v-model:value="timeForm.timeValue">
          <a-radio :value="1">本机时间</a-radio>
          <a-radio :value="2">手动选择</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="timeForm.timeValue === 2" name="time" :rules="[{ required: true, message: '请选择时间' }]">
        <a-date-picker
          style="width: 100%"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择时间"
          v-model:value="timeForm.time"
        >
          <template #suffixIcon><i class="iconfont icon-time-line"></i></template>
        </a-date-picker>
      </a-form-item>
    </a-form>
  </g-modal>

  <!-- 固件升级弹窗 --><!-- 软件升级弹窗 -->
  <g-modal
    :title="title"
    width="416px"
    v-model:visible="visibleUpgrade"
    ok-text="升级"
    cancel-text="取消"
    @ok="onSubmitUpgrade"
    @cancel="onCancelUpgrade"
    :maskClosable="false"
    :ok-button-props="{ disabled: file === '' }"
    :body-style="{ padding: '40px 40px 0' }"
  >
    <a-form class="upgradeForm" ref="upgradeFormRef">
      <a-form-item class="form-item" name="firmwareVersion">
        <g-upload-file
          :accept="accept"
          :moduleType="moduleType"
          v-if="visibleUpgrade"
          v-model:file-name="fileName"
          v-model:file-url="file"
          :before-upload="beforeUploadFile"
          ref="uploadFileRef"
        />
      </a-form-item>
      <p class="selete-file-info">
        <span>
          <i class="iconfont icon-information-fill"></i>
        </span>
        升级过程需要1-10分钟，请不要关闭电源，完成升级后将自动重启
      </p>
    </a-form>
  </g-modal>

  <g-modal
    title="算法升级"
    width="416px"
    v-model:visible="visibleServiceModal"
    ok-text="升级"
    cancel-text="取消"
    @ok="onSubmitService"
    :ok-button-props="{ disabled: file === '', loading: updateLoading }"
  >
    <a-form class="aiServiceForm" ref="aiServiceFormRef">
      <a-form-item class="form-item" name="firmwareVersion">
        <g-upload-file
          :accept="accept"
          :moduleType="moduleType"
          v-if="visibleServiceModal"
          v-model:file-name="fileName"
          v-model:file-url="file"
        />
      </a-form-item>
      <!-- <p class="selete-file-info">
        <span><i class="iconfont icon-information-fill"></i></span
        >升级过程需要1-10分钟，请不要关闭电源，完成升级后将自动重启
      </p> -->
    </a-form>
  </g-modal>
</template>

<script setup lang="ts">
import { confirm } from '@/utils/antd.util'
import { FormInstance } from 'ant-design-vue'
import { message } from '@/utils/antd.util'

import dayjs from 'dayjs'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FileList } from '@/components/g-upload-image.vue'
import { systemApi, ModuleType, aiApi } from '@/services/api'
import { useRequest } from 'vue-request'
import { useGlobalStore } from '@/store/global'
import { storeToRefs } from 'pinia'
import { checkKey } from '@/directives/auth'
import { versionReg } from '@/utils/regular'
import GUploadFile from '@/components/g-upload-file.vue'

const router = useRouter()
const globalStore = useGlobalStore()
const { getSystemInfo } = globalStore
const { systemInfo } = storeToRefs(globalStore)
const accept = ref('')
/**
 * 获取系统信息
 */
onMounted(async () => {
  await getSystemInfo()
  getSystemTime()
  logo.value = [{ url: systemInfo.value.logo }]
})

//
const gotoPage = (type: 1 | 2 | 3 | 4) => {
  switch (type) {
    case 1:
      router.push('/system-layout/system-maintenance/algo-auth')
      break
    case 2:
      router.push('/system-layout/system-maintenance/push-configuration')
      break
    case 3:
      router.push('/system-layout/system-maintenance/platform-access')
      break
    case 4:
      router.push('/system-layout/system-maintenance/network-configuration')
      break
    default:
      break
  }
}

const currentTime = ref<any>()
let timer: any = null
const getSystemTime = () => {
  clearInterval(timer)
  currentTime.value = systemInfo.value?.currentTime
  let timestamp = dayjs(currentTime.value).valueOf()
  timer = setInterval(() => {
    // 获取指定日期的时间戳
    timestamp = timestamp + 1000
    currentTime.value = dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
  }, 1000)
}

/**
 * 更改系统LOGO
 */
const logo = ref<FileList[]>([])
// Logo上传成功
const onSuccessLogo = async (file: FileList) => {
  try {
    await systemApi.updateLogo(file.originalUrl!)
    getSystemInfo()
    message.success('操作成功')
  } catch (error) {
    console.error(error)
  }
}

// const visibleLogo = ref<boolean>(false)
// const logoFormRef = ref<FormInstance>()
// const activeIndex = ref<number>(0)
// const logoForm = reactive({
//   file: [] as FileList[],
// })
// const onImageLast = () => {
//   console.log('onImageLast')
//   activeIndex.value--
// }
// const onImageNext = () => {
//   console.log('onImageNext')
//   activeIndex.value++
// }
// const onClickItem = (index: number) => {
//   activeIndex.value = index
// }
// const onSubmitLogo = async () => {
//   await logoFormRef.value?.validate()
//   console.log('onSubmitLogo')
// }

/**
 * 更改系统名称
 */
const visibleName = ref<boolean>(false)
const nameFormRef = ref<FormInstance>()
const nameForm = reactive({
  systemName: '',
})
const updateName = () => {
  visibleName.value = true
  nameForm.systemName = systemInfo.value?.systemName || ''
}
const updateNameLoading = ref(false)
const onSubmitName = async () => {
  try {
    updateNameLoading.value = true
    await nameFormRef.value?.validate()
    await systemApi.updateName(nameForm.systemName)
    getSystemInfo()
    nameFormRef.value?.resetFields()
    message.success('操作成功')
    visibleName.value = false
  } catch (error) {
    console.error(error)
  } finally {
    updateNameLoading.value = false
  }
}

/**
 * 更改系统时间
 */
const visibleTime = ref<boolean>(false)
const timeFormRef = ref<FormInstance>()
const timeForm = reactive({
  timeValue: 1,
  // 设置默认当前时间
  time: dayjs(),
})
const updateTime = () => {
  visibleTime.value = true
}
const { loading: updateTimeLoading, runAsync: runUpdateTime } = useRequest(systemApi.updateTime)
const onSubmitTime = async () => {
  try {
    await timeFormRef.value?.validate()
    if (timeForm.timeValue === 1) {
      timeForm.time = dayjs()
    }
    await runUpdateTime(dayjs(timeForm.time).format('YYYY-MM-DD HH:mm:ss'))
    timeFormRef.value?.resetFields()
    message.success('操作成功')
    visibleTime.value = false
    await getSystemInfo()
    getSystemTime()
  } catch (error) {
    console.error(error)
  }
}

/**
 * 固件升级、软件升级
 */
const title = ref<string>('固件升级')
const fileName = ref('')
const file = ref('')
const visibleUpgrade = ref<boolean>(false)
const upgradeFormRef = ref<FormInstance>()
const aiServiceFormRef = ref<FormInstance>()
const moduleType = ref<ModuleType>(ModuleType.SYSTEM_HARDWARE_UPGRADE)
const uploadFileRef = ref<InstanceType<typeof GUploadFile>>()

// 固件升级
const firmwareUpgrade = () => {
  title.value = '固件升级'
  accept.value = ''
  fileName.value = ''
  file.value = ''
  visibleUpgrade.value = true
  moduleType.value = ModuleType.SYSTEM_HARDWARE_UPGRADE
}
// 软件升级
const softwareUpgrade = () => {
  title.value = '软件升级'
  accept.value = 'jar'
  fileName.value = ''
  file.value = ''
  visibleUpgrade.value = true
  moduleType.value = ModuleType.SYSTEM_SOFTWARE_UPGRADE
}
const onSubmitUpgrade = async () => {
  await timeFormRef.value?.validate()
  try {
    if (title.value === '固件升级') {
      visibleUpgrade.value = false
      globalStore.updateLoading(true, { tip: '系统升级中...' })
      await systemApi.firmwareUpgrade({ firmwareLocation: file.value })
      globalStore.updateLoading(true, { tip: '系统正在重启...请在10分钟左右后重新登陆' })
    } else {
      await systemApi.softwareUpgrade({ softwareLocation: file.value })
      visibleUpgrade.value = false
      globalStore.updateLoading(true, { tip: '系统正在升级...请在10分钟左右后重新登陆' })
    }
  } catch (error) {
    visibleUpgrade.value = true
    globalStore.updateLoading(false)
  }
}

const beforeUploadFile = (file: File) => {
  if (title.value === '软件升级') {
    return true
  }
  // 截取文件名（存在有多个小数点）
  const name = file.name.substring(0, file.name.lastIndexOf('.'))
  // 截取文件名后缀
  let suffix = file?.name?.split('.')?.slice(-1)[0]
  if (suffix !== 'img' && suffix !== 'gz') {
    message.error('仅支持tar.gz,img格式')
    return false
  }

  if (suffix === 'gz') {
    suffix = file?.name?.split('.')?.slice(-2)[0]
    if (suffix !== 'tar') {
      message.error('仅支持tar.gz,img格式')
      return false
    }
  }

  if (!versionReg.test(name)) {
    message.error('文件名格式错误')
    return false
  }
  return true
}

const onCancelUpgrade = () => {
  uploadFileRef.value?.cancelRequest()
  visibleUpgrade.value = false
}

// 算法升级
const visibleServiceModal = ref(false)

const handleAddService = () => {
  accept.value = 'gz'
  moduleType.value = ModuleType.AI_SDK
  fileName.value = ''
  file.value = ''

  visibleServiceModal.value = true
}
const { loading: updateLoading, runAsync: runAddAISdk } = useRequest(aiApi.addAISdk)
const onSubmitService = async () => {
  await runAddAISdk({ aiSdkPath: file.value })
  message.success('操作成功')
  await getSystemInfo()
  visibleServiceModal.value = false
}

/**
 * 关机
 */
const onShutdown = () => {
  confirm({
    title: '确认关机',
    okText: '关机',
    async onOk() {
      await systemApi.shutdown()
      message.success('操作成功')
    },
  })
}

/**
 * 重启
 */
const onReset = () => {
  const cm = confirm({
    title: '确认重启',
    okText: '重启',
    async onOk() {
      try {
        cm.destroy()
        globalStore.updateLoading(true, { tip: '系统正在重启...请在10分钟左右后重新登陆' })
        await systemApi.restart()
      } catch (error) {
        globalStore.updateLoading(false)
        onReset()
      }
    },
  })
}

/**
 * 恢复出厂设置
 */
const onFactoryDataReset = () => {
  const cm = confirm({
    title: '恢复出厂设置将删除系统全部数据信息，确认是否恢复出厂设置',
    okText: '确认',
    async onOk() {
      try {
        cm.destroy()
        globalStore.updateLoading(true, { tip: '系统正在恢复出厂设置...请在10分钟左右后重新登陆' })
        await systemApi.resetFactory()
      } catch (error) {
        globalStore.updateLoading(false)
        onFactoryDataReset()
      }
    },
  })
}

onUnmounted(() => {
  globalStore.updateLoading(false)
  clearInterval(timer)
})
</script>

<style lang="less" scoped>
.ant-spin-nested-loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.system-maintenance-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px 0;
  padding-top: 40px;

  .main-list {
    width: 760px;
    display: flex;
    flex-direction: column;
    gap: 20px 0;

    .item {
      width: 100%;
      // border: 1px solid @border2;
      border-radius: 4px;
      background: @background3;

      .item-card {
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.3s;

        &:hover {
          background: @mask3;
          transition: all 0.8s;
        }

        &.card-link {
          cursor: pointer;
        }

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

        .right-icon {
          color: @text3;
          font-size: 20px;
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
      background-color: rgba(255, 255, 255, 0.05);
      border: none;
      height: 1px;
    }
  }

  .operation {
    display: flex;
    gap: 0 8px;
  }
}

.logo-modal {
  .preview-wrap {
    width: 100%;
    height: 200px;
    background: @background3;
    margin-bottom: 16px;

    > img {
      // 填充父容器不变形
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .logoForm {
    padding: 0 16px;

    .form-item {
      margin-bottom: 8px;
    }

    .form-item-image {
      display: flex;
      align-items: center;
      gap: 0 10px;

      .g-upload-image-wrap {
        width: 336px;
        background: @background4;
        border: 1px solid @border1;
        border-radius: 8px;
        padding: 6px;
      }
    }

    .icon-arrow-wrap {
      .center();
      cursor: pointer;
      font-size: 18px;
    }
  }

  p {
    color: @text3;
    padding-left: 24px;
    font-size: 10px;
  }
}

.upgradeForm {
  .selete-file-info {
    font-size: 12px;
    line-height: 20px;
    color: @text3;
    display: flex;

    > span {
      display: block;

      i {
        color: @text3;
        margin-right: 8px;
      }
    }
  }
}
</style>
