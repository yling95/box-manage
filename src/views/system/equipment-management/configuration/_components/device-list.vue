<template>
  <div class="device-list">
    <header>
      <div class="go-back-btn" @click="router.replace('/system-layout/equipment-management/equipment-list')">
        <i class="iconfont icon-arrow-go-back-line"></i>
      </div>
      <p>算法配置</p>
    </header>
    <div class="device-list-wrap">
      <h6>摄像头列表 <span class="tips">每个摄像头最多配置7个算法</span></h6>
      <a-spin tip="加载中..." :spinning="asideLoading" />
      <ul class="device-content">
        <a-collapse v-model:active-key="activeKey" ghost>
          <template #expandIcon="{ isActive }">
            <caret-right-outlined :rotate="isActive ? 90 : 0" />
          </template>
          <a-collapse-panel v-for="item in managementInfo?.deviceManagementList" :key="item.locationId">
            <template #header>
              <div :title="item.locationName" class="collapse-header">{{ item.locationName }}</div>
            </template>
            <ul class="collapse-item-wrap">
              <li
                class="collapse-item"
                :class="[equipmentId == item2.id && 'active']"
                v-for="item2 in item.cameraDeviceList"
                :key="item2.id"
                data-id="item2.id"
                @click="handleClickDevice(item2)"
              >
                <div :class="['collapse-item-title']">
                  <img v-if="item2?.deviceStatus === 1" src="@/assets/images/alarm/icon_device.png" alt="" />
                  <img v-else src="@/assets/images/alarm/icon_device_error.png" alt="" />
                  <h6 :title="item2.deviceName">{{ item2.deviceName }}</h6>
                </div>
                <a-tooltip placement="bottomLeft">
                  <template #title v-if="item2?.aiSrvConcatNameV2">
                    <span>【已配置算法】</span>
                    <ul>
                      <li v-for="names in item2?.aiSrvConcatNameV2.split('、')">{{ names }}</li>
                    </ul>
                  </template>
                  <div class="srv-num">{{ item2.deviceActiveSrvCountV2 }}</div>
                </a-tooltip>
                <!-- <div class="collapse-item-hover">
                  <device-tooltip :device-data="item2" trigger="focus" placement="rightTop" @click.stop>
                    <template #content>
                      <a-button type="text" size="small">详情</a-button>
                    </template>
                  </device-tooltip>
                </div> -->
              </li>
            </ul>
          </a-collapse-panel>
        </a-collapse>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, defineExpose } from 'vue'
import { useRouter } from 'vue-router'
// import DeviceTooltip from '../../_components/device-tooltip.vue'
import { useRequest } from 'vue-request'
import { equipmentApi } from '@/services/api'

interface DeviceListProps {
  equipmentId?: number | string
  managementInfo?: any
}

const props = withDefaults(defineProps<DeviceListProps>(), {})

const emits = defineEmits<{
  (e: 'on-device-loaded', managementInfo: any, deviceInfo: any, type?: 'refresh'): void
  (e: 'on-click-device', item: any): void
}>()

const router = useRouter()

/**
 * 获取设备列表
 */
const managementInfo = ref<any>()
const deviceInfo = ref<any>()
const activeKey = ref<string[]>([])
const { loading: asideLoading, runAsync: runGetCamera } = useRequest(equipmentApi.getManagement)
const getManagementInfo = async (type?: 'refresh') => {
  try {
    const { data } = await runGetCamera()

    managementInfo.value = data
    activeKey.value = data.deviceManagementList.map((item: any) => item.locationId)
    data.deviceManagementList.forEach((item: any) => {
      item.cameraDeviceList.forEach((device: any) => {
        if (device.id == props.equipmentId) {
          deviceInfo.value = device
        }
      })
    })

    // if (type === 'refresh') {
    //   return
    // }

    emits('on-device-loaded', managementInfo.value, deviceInfo.value, type)
    nextTick(() => {
      const dom = document.querySelector('.collapse-item.active')
      // 元素距离滚动条顶部的距离
      dom && dom.scrollIntoView({ block: 'center' })
    })
  } catch (error) {
    console.error(error)
  }
}
getManagementInfo()

/**
 * 切换设备
 * @param item
 */
const handleClickDevice = (item: any) => {
  emits('on-click-device', item)
}

defineExpose({
  getManagementInfo,
})
</script>

<style lang="less" scoped>
.device-list {
  width: 295px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 16px 0 16px;
  box-shadow: 0px 1px 2px 0px rgba(2, 36, 59, 0.03);
  > header {
    margin-bottom: 16px;
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    font-size: 14px;
    gap: 0 12px;

    > p {
      font-size: 22px;
      font-weight: 700;
      line-height: 32px;
      color: @text2;
    }
  }

  .device-list-wrap {
    width: 100%;
    flex: 1;
    height: 0;
    display: flex;
    flex-direction: column;

    > h6 {
      width: 100%;
      height: 42px;
      padding: 4px 8px;
      color: @text3;
      font-size: 14px;
      font-weight: 700;
      line-height: 22px;
      position: relative;
      .tips {
        font-size: 12px;
        color: @text4;
        margin-left: 8px;
      }

      &::after {
        width: 247px;
        height: 1px;
        position: absolute;
        content: '';
        background: rgba(255, 255, 255, 0.05);
        bottom: 4px;
        left: 8px;
      }
    }

    .device-content {
      width: 100%;
      flex: 1;
      overflow: auto;

      :deep(.ant-collapse) {
        .ant-collapse-arrow {
          color: @text2;
        }
        .ant-collapse-item {
          & > .ant-collapse-header {
            padding: 4px 0;
          }
        }
        .ant-collapse-content {
          & > .ant-collapse-content-box {
            padding: 0;
          }
        }
      }

      .collapse-header {
        .ellipsis();
        color: @text2;
        font-size: 12px;
        font-weight: 700;
      }

      .collapse-item-wrap {
        display: flex;
        flex-direction: column;
        gap: 10px 0;
      }

      .collapse-item {
        width: 100%;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0 4px;
        padding: 4px 14px 4px 12px;
        cursor: pointer;

        .collapse-item-title {
          display: flex;
          align-items: center;
          gap: 0 10px;
          min-width: 0;
          > img {
            width: 18px;
            height: 18px;
            object-fit: contain;
          }
          > h6 {
            color: @text1;
            font-size: 14px;
            font-weight: 400;
            line-height: 22px;
            .ellipsis();
          }
          &--Invalid {
            > h6 {
              color: @text3 !important;
            }
          }
        }

        .srv-num {
          height: 17px;
          border-radius: 3px;
          color: rgba(255, 190, 70, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          min-width: 40px;
          padding-left: 12px;
          text-align: center;
          color: rgba(255, 190, 70, 1);
          font-weight: 700;
          background: rgba(0, 0, 0, 0.3);
          position: relative;
          &::after {
            position: absolute;
            left: 4px;
            top: 0.8px;
            font-weight: 700;
            font-family: Verdana, Geneva, Tahoma, sans-serif;
            content: 'AI';
            color: #aab3c1;
          }
        }

        &:hover {
          .collapse-item-hover {
            display: block;
          }
        }
        &.active {
          border-radius: 8px;
          background: #225199;
          & h6 {
            color: @text1;
          }
        }

        .collapse-item-hover {
          display: none;
        }
      }
    }
  }
  :deep(.ant-tooltip) {
    max-width: 190px;
  }
}
</style>
