<template>
  <g-conf-module :show-page-tools="true">
    <template #Slot-Conf-Module-Header>
      <div class="flex equipment-management">
        <div class="equipment-title">摄像头管理</div>
        <div class="layout">
          <a-button
            type="text"
            class="alone-icon-button"
            :class="[!deviceStore.displayType && 'active']"
            @click="handleExhibition"
          >
            <i :class="['iconfont', 'icon-layout-masonry-line']"></i>
          </a-button>
          <a-button
            type="text"
            class="alone-icon-button"
            :class="[deviceStore.displayType && 'active']"
            @click="handleExhibition"
          >
            <i class="iconfont icon-list-check"></i>
          </a-button>
        </div>
      </div>
    </template>
    <template #Slot-Conf-Module-Tools-Left>
      <g-radio-group
        v-model:value="equipStatus"
        :options="[
          {
            label: '全部',
            value: '',
            number: equipData.totalDeviceCount,
          },
          {
            label: '在线',
            value: '1',
            number: equipData.onlineDeviceCount,
          },
          {
            label: '离线',
            value: '0',
            number: equipData.offlineDeviceCount,
          },
        ]"
        @change="equipStatusChange"
      >
      </g-radio-group>
    </template>
    <template #Slot-Conf-Module-Tools-Right>
      <a-button class="flex-button" type="primary" v-auth="'equipment-management-equipment-add'" @click="addDeviceFn()">
        添加设备</a-button
      >
      <!-- <a-popover
        v-model:visible="addEquipButton"
        placement="bottomLeft"
        trigger="click"
        overlayClassName="operation-button"
      >
        <template #content>
          <div style="width: 88px">
            <a-button
              class="flex-button"
              type="text"
              v-auth="'equipment-management-equipment-add'"
              @click="addDeviceFn()"
            >
              设备</a-button
            >
            <a-button class="flex-button" type="text" v-auth="'equipment-management-scene-add'" @click="addEquipFn()">
              场景位置
            </a-button>
          </div>
        </template>
        <a-button
          type="primary"
          class="icon-button"
          v-auth="['equipment-management-scene-add', 'equipment-management-equipment-add']"
        >
          添加
          <i class="iconfont icon-arrow-down-s-fill"></i>
        </a-button>
      </a-popover> -->
    </template>

    <template #Slot-Conf-Module-Content>
      <div class="exhibition-content">
        <a-skeleton :loading="subContentLoading" active>
          <collapse-content
            v-show="!deviceStore.displayType"
            :deviceManagementList="equipData.deviceManagementList"
            :equipData="equipData"
            :openLocationModal="locationModalFormRef?.openModal"
            :openDeviceModal="deviceModalFormRef?.openModal"
            @reload-fn="reloadFn"
          />
          <tile-content
            ref="titleContentRef"
            v-show="deviceStore.displayType"
            :deviceManagementList="equipData.deviceManagementList"
            :openLocationModal="locationModalFormRef?.openModal"
            :openDeviceModal="deviceModalFormRef?.openModal"
            @reload-fn="reloadFn"
            @use-are-statistics="useAreStatistics"
          />
        </a-skeleton>
      </div>
    </template>
  </g-conf-module>

  <location-modal ref="locationModalFormRef" @reload-fn="reloadFn" />
  <!-- 设备修改弹出框 -->
  <device-modal ref="deviceModalFormRef" @reload-fn="reloadFn" />
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import collapseContent from './_components/collapse-content.vue'
import tileContent from './_components/tile-content.vue'
import { equipmentApi } from '@/services/api'
import deviceModal from './_components/device-modal.vue'
import locationModal from './_components/location-modal.vue'
import { deviceManagementListType } from './interface'
import { message } from '@/utils/antd.util'
import { useRouter } from 'vue-router'
import { MAX_DEVICE_NUM } from './config'
import { useDeviceStore } from '@/store/device'

const router = useRouter()
const deviceStore = useDeviceStore()

// const addEquipButton = ref<boolean>(false)
const titleContentRef = ref()

const equipStatus = ref<string>('')

const locationModalFormRef = ref<any>()

const deviceModalFormRef = ref<any>()

const reloadFn = () => {
  getEquipInfo()
}
/***
 * 切换表格形式
 */
const handleExhibition = () => {
  deviceStore.toggleDisplayType()
  restDefaultState()
  getEquipInfo()
}

const restDefaultState = () => {
  equipStatus.value = ''
  equipStatusChange()
}
const useAreStatistics = (dataList: {
  length: any
  filter: (arg0: (item: any) => boolean) => { (): any; new (): any; length: any }
}) => {
  // getEquipInfo()
  equipData.totalDeviceCount = dataList.length
  equipData.onlineDeviceCount = dataList.filter((item: { deviceStatus: number }) => item.deviceStatus === 1).length
  equipData.offlineDeviceCount = dataList.filter((item: { deviceStatus: number }) => item.deviceStatus === 0).length
}

/**
 * 设备全部数据
 */
const equipData = reactive<{
  deviceManagementList: deviceManagementListType[]
  offlineDeviceCount: any
  onlineDeviceCount: any
  totalDeviceCount: any
}>({
  deviceManagementList: [],
  offlineDeviceCount: null,
  onlineDeviceCount: null,
  totalDeviceCount: null,
})
onMounted(() => {
  getEquipInfo()
})

/**
 * 新增设备
 */
const addDeviceFn = () => {
  if (equipData.totalDeviceCount >= MAX_DEVICE_NUM) {
    return message.error('设备数量已达上限')
  }
  router.push('/system-layout/equipment-management/equipment-add-edit')
}

/**
 * 新增场景
 */
// const addEquipFn = () => {
//   const locationModalType: any = {}
//   locationModalType.title = '添加场景'
//   locationModalType.type = 'add'
//   addEquipButton.value = false
//   nextTick(() => {
//     locationModalFormRef.value.openModal({ deviceItem: {}, locationModalType })
//   })
// }

/**
 * 顶部设备状态
 */
const equipStatusChange = () => {
  if (deviceStore.displayType) {
    getEquipInfo('changeState')
    return
  }
  getEquipInfo()
}

const subContentLoading = ref<boolean>(true)

const getEquipInfo = async (type?: 'changeState') => {
  if (type === 'changeState') {
    titleContentRef.value?.filterAreDeviceState(equipStatus.value)
    return
  }
  let { data } = await equipmentApi.getManagement({ deviceStatus: deviceStore.displayType ? '' : equipStatus.value })
  equipData.deviceManagementList = data.deviceManagementList
  if (deviceStore.displayType) {
    titleContentRef.value?.filterAreDeviceState(equipStatus.value, data.deviceManagementList)
  } else {
    equipData.offlineDeviceCount = data.offlineDeviceCount
    equipData.onlineDeviceCount = data.onlineDeviceCount
    equipData.totalDeviceCount = data.totalDeviceCount
  }

  subContentLoading.value = false
}
</script>

<style lang="less">
.operation-button {
  .ant-popover-inner {
    .ant-btn-text {
      width: 100%;
      text-align: left;
    }
    border-radius: 6px;
    background: rgba(21, 23, 27, 0.95);
    box-shadow: @shadow-l;
  }
  .ant-popover-inner-content {
    position: absolute;
    top: -10px;
    // left: 10px;
    padding: 4px;
    background: @background2 !important;
    border-radius: 6px;
    box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.14), 0px 1px 3px 0px rgba(37, 37, 45, 0.14);
    &:hover {
      background: @mask2;
      border-radius: 4px;
    }
    &:active {
      border-radius: 2px;
      background: @mask5;
    }
  }

  .ant-popover-arrow {
    display: none;
  }
}
</style>

<style lang="less" scoped>
.equipment-management {
  width: 100%;
  justify-content: space-between;
}
.equipment-title {
  color: @text2;
  font-size: 22px;
  font-style: normal;
  font-weight: 700;
  line-height: 32px; /* 145.455% */
}
.layout {
  border-radius: 100px;
  border: 1px solid @border3;
  background: @mask8;
  display: flex;
  width: 68px;
  height: 36px;
  padding: 3px;
  justify-content: space-around;
  align-items: center;
  // gap: 3px;
  .alone-icon-button {
    width: 30px;
    height: 30px;
    border-radius: 100px;
    &.active {
      width: 30px;
      height: 30px;
      border-radius: 100px;
      background: rgba(225, 237, 255, 0.2);
      box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.14), 0px 1px 3px 0px rgba(37, 37, 45, 0.14);
    }
  }
}
.exhibition-content {
  margin-top: 32px;
}
</style>
