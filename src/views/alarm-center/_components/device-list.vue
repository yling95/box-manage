<template>
  <div class="device-list">
    <header>
      <p>摄像头列表</p>
    </header>
    <div class="device-list-wrap">
      <ul class="device-content">
        <a-collapse :activeKey="activeKey" @change="updateActiveKey" ghost>
          <template #expandIcon="{ isActive }">
            <caret-right-outlined :rotate="isActive ? 90 : 0" />
          </template>
          <a-collapse-panel v-for="item in deviceMenuData" :key="item?.deviceLocationId">
            <template #header>
              <div :title="item?.deviceLocationName" class="collapse-header">{{ item?.deviceLocationName }}</div>
            </template>
            <g-empty :empty="item?.deviceAlarmCenterList === 0" height="680px">
              <template #empty>
                <div class="empty-box">
                  <img style="width: 24px; height: 24px" src="@/assets/images/alarm/icon_device_add.png" />
                  <p>请添加设备</p>
                </div>
              </template>
              <div class="collapse-item-wrap">
                <template v-for="subItem in item?.deviceAlarmCenterList" :key="subItem?.deviceId">
                  <a-tooltip>
                    <template #title v-if="subItem?.deviceStatus !== 1">
                      <span>设备已离线</span>
                    </template>
                    <div
                      class="collapse-item"
                      @click="
                        subItem?.deviceStatus !== 1 && !isActive(subItem)
                          ? ''
                          : onClickDevice(subItem, item.deviceLocationName)
                      "
                    >
                      <div
                        class="collapse-item-before"
                        :class="[isActive(subItem) ? 'active' : subItem.alarmStatus && 'warn']"
                      ></div>
                      <div
                        :class="[
                          'collapse-item-title-wrap',
                          { active: isActive(subItem) },
                          {
                            'collapse-item-title-wrap--not-allowed': subItem?.deviceStatus !== 1 && !isActive(subItem),
                          },
                        ]"
                      >
                        <img v-if="subItem?.deviceStatus === 1" src="@/assets/images/alarm/icon_device.png" alt="" />
                        <img v-else src="@/assets/images/alarm/icon_device_error.png" alt="" />
                        <p :title="subItem?.deviceName" :class="[subItem?.deviceStatus !== 1 && 'error']">
                          {{ subItem?.deviceName }}
                        </p>
                      </div>
                    </div>
                  </a-tooltip>
                </template>
              </div>
            </g-empty>
          </a-collapse-panel>
        </a-collapse>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import usePerfectScrollbar from '@/hooks/usePerfectScrollbar'
import { Key } from 'ant-design-vue/es/_util/type'
import { onMounted, onUnmounted } from 'vue'

interface DeviceListProps {
  currentConfig?: any
  deviceMenuData?: any[]
  activeKey?: Key[]
}

const props = withDefaults(defineProps<DeviceListProps>(), {
  currentConfig: {
    inspectionStatus: false,
  },
})

const emits = defineEmits(['update:activeKey', 'on-click-device'])

const { init, destroy } = usePerfectScrollbar('.device-content')

onMounted(() => {
  init()
})

const isActive = (item: any) => {
  return props?.currentConfig?.deviceIds.some((deviceIds: any) => deviceIds?.deviceId == item.deviceId)
}

// 折叠面板
const updateActiveKey = (key: Key | Key[]) => {
  emits('update:activeKey', key)
}

// 点击设备
const onClickDevice = (params: any, locationName = '') => {
  emits('on-click-device', params, locationName)
}

onUnmounted(() => {
  destroy()
})
</script>

<style lang="less" scoped>
.device-list {
  width: 313px;
  height: 100%;
  display: flex;
  flex-direction: column;
  > header {
    width: 100%;
    padding: 14px 10px;
    display: flex;
    align-items: center;
    position: relative;

    > p {
      font-size: 14px;
      font-weight: 700;
      line-height: 22px;
      color: @text3;
    }
    &::after {
      content: '';
      width: 221px;
      height: 10px;
      position: absolute;
      background: url(../../../assets/images/alarm/adorn.png) no-repeat center;
      background-size: cover;
      right: 10px;
      top: 40%;
    }
  }

  .device-list-wrap {
    width: 100%;
    flex: 1;
    border-radius: 8px;
    background: @mask6;
    backdrop-filter: blur(2px);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .device-content {
      flex: 1;
      overflow: auto;
      padding-bottom: 30px;

      .collapse-header {
        .ellipsis();
      }

      .collapse-item-wrap {
        display: flex;
        flex-direction: column;
        gap: 10px 0;
      }

      .collapse-item {
        width: 100%;
        height: 38px;
        display: flex;
        align-items: center;
        gap: 0 4px;

        > .collapse-item-before {
          width: 2px;
          height: 20px;
          border-radius: 2px;

          &.active {
            background: #477ac9;
          }
          &.warn {
            background: @secondary3 !important;
          }
        }

        .collapse-item-title-wrap {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          font-size: 14px;
          font-weight: 400;
          line-height: 22px;
          color: @text2;
          display: flex;
          align-items: center;
          gap: 0 10px;
          padding: 0 12px;
          cursor: pointer;
          &--not-allowed {
            cursor: not-allowed;
          }

          > img {
            width: 18px;
            height: 18px;
          }

          > p {
            .ellipsis();

            &.error {
              color: @text3;
            }
          }

          &:hover {
            background: @mask1;
          }

          &.active {
            // background: url(../../../assets/images/alarm/device_item_bgc.png) no-repeat;
            // background-size: 100% 100%;
            border-radius: 8px;
            background: @mask5;
          }
        }
      }
    }
  }
}
</style>
