<template>
  <a-modal
    v-model:visible="deviceModalVisible"
    fwidth="100%"
    :footer="null"
    :closable="false"
    @cancel="cancelModal"
    wrap-class-name="device-modal"
  >
    <div class="equipModal-content">
      <div class="content-add">
        <div class="the-equipment-config">
          <div class="the-common-title">{{ DeviceModalType.title }}</div>
          <div class="the-equipment-form">
            <a-form
              :model="deviceConfig"
              name="equipment-configuration"
              layout="vertical"
              :rules="addRules"
              ref="deviceModalFormRef"
            >
              <a-form-item name="deviceName" label="设备名称">
                <a-input v-model:value.trim="deviceConfig.deviceName" :maxlength="15" placeholder="请输入设备名称" />
              </a-form-item>
              <a-form-item name="deviceLocationId" label="场景位置">
                <div class="form-item-location">
                  <a-select v-model:value="deviceConfig.deviceLocationId" placeholder="请输入场景位置">
                    <a-select-option
                      v-for="(item, index) in deviceManagementList"
                      :key="index"
                      :value="item.locationId"
                      >{{ item.locationName }}</a-select-option
                    >
                  </a-select>
                  <a-button
                    type="link"
                    class="item-add-location"
                    @click="locationNameFn"
                    v-auth="'equipment-management-scene-edit'"
                  >
                    新增
                  </a-button>
                </div>
              </a-form-item>
              <a-form-item name="deviceProvider" label="厂家">
                <a-input v-model:value.trim="deviceConfig.deviceProvider" :maxlength="10" placeholder="请输入厂家" />
              </a-form-item>
              <a-form-item name="deviceStreamingProtocol" label="协议">
                <a-select
                  ref="select"
                  v-model:value.trim="deviceConfig.deviceStreamingProtocol"
                  :options="deviceStreamingProtocolOption"
                  placeholder="请输入协议"
                ></a-select>
              </a-form-item>
              <template v-if="deviceConfig.deviceStreamingProtocol == 0">
                <a-form-item name="deviceStreamingUrl" label="链接地址">
                  <a-input
                    v-model:value.trim="deviceConfig.deviceStreamingUrl"
                    :maxlength="100"
                    placeholder="请输入链接地址（rtsp://账号:密码@IP:端口）"
                  />
                </a-form-item>
              </template>
              <template v-if="deviceConfig.deviceStreamingProtocol == 1">
                <a-form-item name="deviceSipId" label="SIP用户名">
                  <a-input
                    v-model:value.trim="deviceConfig.deviceSipId"
                    :maxlength="50"
                    placeholder="请输入SIP用户名"
                  />
                </a-form-item>
                <a-form-item name="deviceVideoChannelId" label="SIP用户密码">
                  <a-input
                    v-model:value.trim="deviceConfig.deviceVideoChannelId"
                    :maxlength="50"
                    placeholder="请输入SIP用户密码"
                  />
                </a-form-item>
              </template>
              <a-form-item name="deviceRemark" label="备注">
                <a-textarea
                  class="item-deviceRemark"
                  v-model:value.trim="deviceConfig.deviceRemark"
                  placeholder="请输入备注"
                  :maxlength="50"
                  showCount
                />
              </a-form-item>
              <a-form-item>
                <template v-if="DeviceModalType.type === 'add'">
                  <a-button type="primary" html-type="submit" class="form-button" v-throttle="addDeviceSubmit"
                    >添加</a-button
                  >
                  <a-button html-type="submit" class="form-button" v-throttle="continueDeviceSubmit"
                    >添加并继续</a-button
                  >
                  <a-button @click="cancelModal">取消</a-button>
                </template>
                <template v-else>
                  <a-button type="primary" html-type="submit" class="form-button" @click="editDeviceSubmit"
                    >确定</a-button
                  >
                  <a-button @click="cancelModal">取消</a-button>
                </template>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
      <div class="content-link" v-show="deviceConfig?.deviceStreamingProtocol === 0">
        <div class="init-screen" v-if="!isTest">
          <i class="iconfont icon-Monitoring-full"></i>
        </div>
        <div class="link-screen" v-if="isTest">
          <g-video-spin v-if="isTest" :spinning="loading" ref="videoSpin">
            <div class="link-screen-content">
              <video class="link-video" id="testLink" muted autoplay controls></video>
            </div>
          </g-video-spin>
        </div>
        <a-button type="text" class="link-button" @click="handleClickTest" v-if="openVideo === 0"> 测试连接 </a-button>
        <a-button type="text" class="link-button" @click="handleClickTest" v-else-if="openVideo === 1">
          重新连接
        </a-button>
        <a-button type="text" class="link-button" @click="handleCloseTest" v-else> 取消连接 </a-button>
      </div>
    </div>
    <a-button type="text" class="device-close-icon alone-icon-button" v-throttle="cancelModal">
      <i class="iconfont icon-close-line"></i>
    </a-button>
  </a-modal>
  <location-modal ref="locationModalFormRef" @reloalocationModald-fn="reloadFn" />
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { FormInstance, message, SelectProps } from 'ant-design-vue'
import { equipmentApi } from '@/services/api'
import { Rule } from 'ant-design-vue/es/form'
import { info } from '@/utils/antd.util'
// import { obj2str } from '@/utils/utils'
import locationModal from './location-modal.vue'
import { JSWebrtc } from '@/utils/webtc'
import { rtspRegex } from '@/utils/regular'
interface DeviceType {
  title?: string
  type?: string
}

const openVideo = ref<number>(0)

onUnmounted(() => {
  handleCloseTest()
})

const loading = ref<boolean>(false)

const deviceModalFormRef = ref<FormInstance>()

const videoSpin = ref()

const isTest = ref<boolean>(false)
let play: any
const handleClickTest = async () => {
  let params
  switch (deviceConfig.value.deviceStreamingProtocol) {
    case 0:
      await deviceModalFormRef.value?.validate('deviceStreamingUrl')
      params = {
        tmpDeviceId: testId.value,
        deviceStreamingProtocol: 0,
        rtspStreamingUrl: deviceConfig.value.deviceStreamingUrl,
      }

      break
    case 1:
      await deviceModalFormRef.value?.validate(['deviceSipId', 'deviceVideoChannelId'])
      params = {
        tmpDeviceId: testId.value,
        deviceStreamingProtocol: 1,
        sipId: deviceConfig.value.deviceSipId,
        videoChannelId: deviceConfig.value.deviceVideoChannelId,
      }
      break
    default:
      break
  }
  isTest.value = true
  openVideo.value = 2
  loading.value = true
  nextTick(() => {
    videoSpin.value.resetSpin()
  })

  setTimeout(() => {
    if (loading.value) {
      openVideo.value = 1
      loading.value = true
    }
  }, 10000)
  try {
    const { data } = await equipmentApi.postCameraConnection(params)
    if (!data) return
    nextTick(() => {
      const theVideo = document.getElementById(`testLink`)
      if (play) {
        play.destroy()
        play = null
      }
      //@ts-ignore
      play = new JSWebrtc.Player(data, {
        video: theVideo,
        autoplay: true,
        onPlay: () => {
          loading.value = false
        },
      })
      setTimeout(() => {
        if (loading.value) {
          play.destroy()
        }
      }, 10000)
    })
  } catch (error) {
    console.log(error)
  }
}

const handleCloseTest = () => {
  isTest.value = false
  if (openVideo.value !== 2) return
  openVideo.value = 0
  play?.destroy && play.destroy()
  equipmentApi.postCloseCameraConnection({ tmpDeviceId: testId.value })
}

const addRules: Record<string, Rule[]> = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceLocationId: [{ required: true, message: '请输入场景位置', trigger: 'change' }],
  deviceProvider: [{ required: true, message: '请输入厂家', trigger: 'blur' }],
  deviceStreamingProtocol: [{ required: true, message: '请输入协议', trigger: 'blur' }],
  deviceStreamingUrl: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    {
      pattern: rtspRegex,
      message: '请输入正确的RTSP链接地址',
      trigger: 'blur',
    },
  ],
  deviceSipId: [{ required: true, message: '请输入SIP用户名', trigger: 'blur' }],
  deviceVideoChannelId: [{ required: true, message: '请输入SIP用户密码', trigger: 'blur' }],
}

let deviceManagementList = ref()

const getEquipInfo = async () => {
  try {
    let { data } = await equipmentApi.getManagement({ deviceStatus: 0 })
    deviceManagementList.value = data.deviceManagementList
    if (!deviceConfig.value.deviceLocationId) {
      deviceConfig.value.deviceLocationId = deviceManagementList.value[0].locationId
    }
  } catch (error) {
    console.log('error111', error)
  }
}
const deviceConfig = ref<any>([])
const deviceModalVisible = ref(false)
const DeviceModalType = ref<DeviceType>({})
const emit = defineEmits(['reloadFn'])

const deviceStreamingProtocolOption = ref<SelectProps['options']>([
  {
    value: 0,
    label: 'RTSP',
  },
  {
    value: 1,
    label: 'GB/T 28181',
  },
])

const locationModalFormRef = ref<any>()

const reloadFn = () => {
  getEquipInfo()
}
const locationNameFn = (deviceItem: any) => {
  const locationModalType: any = {}
  if (deviceManagementList.value.length < 50) {
    locationModalType.title = '场景位置'
    locationModalType.type = 'add'
    nextTick(() => {
      locationModalFormRef.value?.openModal({ deviceItem, locationModalType })
    })
  } else {
    info({
      title: `场景数量已达50，请删除多余场景后添加~`,
      okText: '确定',
    })
  }
}

const addDeviceSubmit = async () => {
  try {
    await deviceModalFormRef.value?.validate()
    await equipmentApi.postCamera(deviceConfig.value)
    handleCloseTest()
    deviceModalVisible.value = false
    deviceModalFormRef.value?.resetFields()
    message.success('成功添加')
    emit('reloadFn')
  } catch (error) {
    console.log('error', error)
  }
}

//继续编辑
const continueDeviceSubmit = async () => {
  try {
    await deviceModalFormRef.value?.validate()
    await equipmentApi.postCamera(deviceConfig.value)
    message.success('成功添加')
    deviceModalFormRef.value?.resetFields()
  } catch (error) {
    console.log('error', error)
  }
}

//提交修改
const editDeviceSubmit = async () => {
  try {
    await deviceModalFormRef.value?.validate()
    await equipmentApi.putCamera(deviceConfig.value)
    handleCloseTest()
    deviceModalVisible.value = false
    deviceModalFormRef.value?.resetFields()
    message.success('成功修改')
    emit('reloadFn')
  } catch (error) {
    console.log('error', error)
  }
}

// 推出弹窗
const cacheData = ref<boolean>()

const cancelModal = () => {
  handleCloseTest()
  deviceModalVisible.value = false
  deviceModalFormRef.value?.resetFields()
  emit('reloadFn')
}
const deviceDefault = {
  deviceItem: {},
  deviceConfig: {
    title: '新增设备',
    type: 'add',
  },
}

const testId = ref<string>()
const openModal = (data: any = deviceDefault, cb: Function) => {
  openVideo.value = 0
  DeviceModalType.value = data.DeviceModalType
  deviceConfig.value = data.deviceItem
  testId.value = `tmp-${Date.now()}`
  if (isNaN(deviceConfig.value.deviceStreamingProtocol)) {
    deviceConfig.value.deviceStreamingProtocol = 0
  }
  getEquipInfo()
  cacheData.value = { ...deviceConfig.value }
  if (cb) {
    cb()
  }
  deviceModalVisible.value = true
}

const closeModal = (_data: any, cb: Function) => {
  if (cb) {
    cb()
  }
  handleCloseTest()
  deviceModalVisible.value = false
}
defineExpose({
  openModal,
  closeModal,
})
</script>

<style lang="less">
.device-close-icon {
  position: fixed;
  top: 10px;
  right: 15px;
  &:hover {
    background-color: #fff;
  }
}
.device-modal {
  .icon-close-line {
    width: 28px;
    font-size: 18px;
  }
  .ant-modal {
    width: 100vh !important;
    max-width: 100vh;
    padding-bottom: 0;
    top: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    height: calc(100vh);
    width: 100vw;
    padding: 0;
    border-radius: 0px;
  }
  .ant-modal-body {
    flex: 1;
    height: calc(100vh);
    overflow: auto;
    padding: 0;
    padding-top: 46px;
  }
}
</style>
<style lang="less" scoped>
.equipModal-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  height: 100%;
  border-top: 1px solid #f5f5f5;
  .content-add {
    width: 1120px;
    display: flex;
    margin-left: 240px;

    .the-common-title {
      font-weight: 700;
      font-size: 16px;
      line-height: 24px;
      color: @text1;
      position: relative;
      padding-left: 11px;

      &::before {
        content: '';
        position: absolute;
        top: 3px;
        left: 0;
        width: 3px;
        height: 18px;
        background: #1868e9;
        border-radius: 0px 2px 2px 0px;
      }
    }
    .form-item-location {
      position: relative;
      .item-add-location {
        position: absolute;
        top: 6px;
        right: -38px;
        color: #009cf8;
      }
    }
    .the-equipment-config {
      width: 320px;
      height: 798px;
      margin-top: 40px;
      .the-equipment-form {
        margin-top: 56px;
        width: 320px;
        height: 760px;
        border-radius: 4px;
        .form-button {
          margin-right: 8px;
        }
        .item-deviceRemark {
          height: 106px;
          position: relative;
          height: 106px;
        }
        .item-deviceRemark::after {
          position: absolute;
          bottom: 8px;
          right: 12px;
        }
      }
    }
  }

  .content-link {
    width: 560px;
    background: #e8e8eb;
    padding: 40px 80px;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    .link-screen {
      background-color: #111e33;
      width: 400px;
      height: 240px;
      object-fit: fill;
      border-radius: 4px;
      overflow: hidden;
      .link-screen-content {
        width: 100%;
        height: 100%;
        object-fit: fill;
        border-radius: 4px;
        overflow: hidden;
      }
      .link-video {
        width: 100%;
        height: 100%;
        object-fit: fill;
        border-radius: 4px;
        overflow: hidden;
        video {
          border-radius: 4px;
        }
      }
    }
    .init-screen {
      background-color: #111e33;
      border-radius: 4px;
      width: 400px;
      height: 240px;
      box-sizing: border-box;
      padding-top: 94px;
      display: flex;
      justify-content: center;
      i {
        font-size: 24px;
        color: #00a9c3;
      }
    }

    .link-button {
      width: 88px;
      height: 36px;
      background-color: #fff;
      margin: 12px auto;
      border-radius: 6px;
      border: 1px solid #d9d9db;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
