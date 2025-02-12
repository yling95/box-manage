<template>
  <a-collapse v-model:activeKey="activeKey" ghost class="the-collapse">
    <template #expandIcon="{ isActive }">
      <caret-right-outlined :rotate="isActive ? 90 : 0" />
    </template>
    <a-collapse-panel
      v-for="(deviceItem, index) in props.deviceManagementList"
      :key="deviceItem.locationId"
      class="collapse-panel"
    >
      <template #header>
        <div class="collapse-panel-header">{{ deviceItem.locationName }}</div>
        <img src="@/assets/images/equipment/tab.png" class="img-tab" />
      </template>
      <div class="collapse-panel-content">
        <draggable
          :list="deviceItem.cameraDeviceList"
          :disabled="!enabled"
          item-key="id"
          class="drag-group"
          ghost-class="ghost"
          @start="initMove($event, index)"
          @end="checkMove($event, index)"
        >
          <template #item="{ element }">
            <div
              class="equipments-content"
              @mousedown="
                () => {
                  tooltipShow = false
                }
              "
              @mouseup="
                () => {
                  tooltipShow = true
                }
              "
            >
              <div class="panel-equipments">
                <div class="equipments-header">
                  <span
                    class="title-delete"
                    v-auth="'equipment-management-equipment-delete'"
                    @click="deleteDeviceFn(element)"
                  >
                    <i class="iconfont icon-delete-bin-line"></i>
                  </span>

                  <div style="display: flex; justify-content: space-between">
                    <div v-auth="'equipment-management-equipment-detail'">
                      <device-tooltip :deviceData="element" :ref="`tooltip${element.id}`">
                        <template #content>
                          <div class="header">
                            <!-- v-show="tooltipShow" -->
                            <div
                              class="header-image"
                              :class="[element.deviceStatus ? 'header-image-active' : 'header-image-inactive']"
                            >
                              <img class="header-image-pic" src="@/assets/images/equipment/equipment.png" />
                            </div>
                            <div class="status">{{ element.deviceStatus ? '在线' : '离线' }}</div>
                          </div>
                        </template>
                      </device-tooltip>
                      <!-- <div
                        class="header-image"
                        v-show="!tooltipShow"
                        :class="[element.deviceStatus ? 'header-image-active' : 'header-image-inactive']"
                      >
                        <img class="header-image-pic" src="@/assets/images/equipment/equipment.png" />
                      </div> -->
                    </div>

                    <div class="header-title">
                      <!-- :class="[element.deviceActiveSrvCount === 0 && 'operation-empty']" -->
                      <div class="title-type">
                        <span class="title-type-text">已配置算法</span>
                      </div>
                      <span class="title-type-number">{{ element.deviceActiveSrvCountV2 }}</span>
                    </div>
                  </div>

                  <div class="title-equip">
                    <p :title="element.deviceName">
                      {{ element.deviceName }}
                    </p>
                  </div>
                </div>
                <div class="equipments-bottom" v-auth="'equipment-management-equipment-edit'">
                  <div
                    class="equipments-bottom_edit"
                    v-auth="'equipment-management-equipment-edit'"
                    @click="
                      () => {
                        if (checkKey('equipment-management-equipment-edit')) {
                          router.push(`/system-layout/equipment-management/configuration?id=${element.id}`)
                        } else {
                          message.warning('暂无设备配置权限')
                        }
                      }
                    "
                  >
                    算法配置
                  </div>
                  <div
                    class="equipments-bottom_edit"
                    v-auth="'equipment-management-equipment-edit'"
                    @click="editDeviceFn(element)"
                  >
                    编辑设备
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div
              class="panel-add-equipments"
              v-auth="'equipment-management-equipment-add'"
              @click.stop="addDeviceFn(deviceItem.locationId)"
            >
              <!-- <i class="iconfont icon-add-line"></i> -->
              <a-tooltip>
                <template #title>添加设备</template>
                <div style="text-align: center">
                  <img style="width: 24px; margin: 0 auto" src="@/assets/images/equipment/adddevice.png" />
                  <div style="color: #8b949e">添加设备</div>
                </div>
              </a-tooltip>
            </div>
          </template>
        </draggable>
      </div>
      <template #extra>
        <div class="extra-action">
          <a-button
            type="text"
            class="alone-icon-button action-icon"
            v-auth="'equipment-management-scene-edit'"
            @click.stop="locationNameFn(deviceItem, 'edit')"
          >
            <i class="iconfont icon-edit-fill"></i>
          </a-button>
          <template v-if="deviceItem.locationId != 1">
            <a-button
              type="text"
              class="alone-icon-button action-icon"
              v-auth="'equipment-management-scene-delete'"
              @click.stop="deleteLocationFn(deviceItem)"
            >
              <i class="iconfont icon-delete-bin-line"></i>
            </a-button>
          </template>
          <a-button
            v-if="deviceItem.locationId === 1"
            type="text"
            class="alone-icon-button action-icon"
            @click.stop="locationNameFn(deviceItem, 'add')"
            v-auth="'equipment-management-scene-add'"
          >
            <i class="iconfont icon-add-line"></i>
          </a-button>
        </div>
      </template>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import draggable from 'vuedraggable'
import { equipmentApi } from '@/services/api'
import { message } from '@/utils/antd.util'
import { useRouter } from 'vue-router'
import { confirm, info } from '@/utils/antd.util'
import deviceTooltip from './device-tooltip.vue'
import { deviceManagementListType } from '../interface'
import { checkKey } from '@/directives/auth'
import { MAX_DEVICE_NUM } from '../config'

const router = useRouter()

const props = defineProps({
  deviceManagementList: {
    type: Array<deviceManagementListType>,
    default: [],
  },
  equipData: {
    type: Object,
    default: () => {
      return {}
    },
  },
  openLocationModal: {
    type: Function,
    default: () => {
      return null
    },
  },
  openDeviceModal: {
    type: Function,
    default: () => {
      return null
    },
  },
})

const activeKey = ref()

onMounted(() => {
  activeKey.value = props.deviceManagementList.map((item: any) => item.locationId)
  popoverVisibleFn()
})

const popoverVisible = ref<any>({})

const popoverVisibleFn = () => {
  props.deviceManagementList.forEach((item) =>
    item.cameraDeviceList.forEach((device) => {
      let deviceId = device.id
      popoverVisible.value[deviceId] = false
    }),
  )
}

const enabled = ref(true)

const emit = defineEmits(['reloadFn'])
/**
 * 弹出框操作
 */
const locationNameFn = (deviceItem: any, type: string) => {
  const locationModalType: any = {}
  switch (type) {
    case 'edit':
      locationModalType.title = '编辑场景'
      locationModalType.type = 'edit'
      nextTick(() => {
        props.openLocationModal({ deviceItem, locationModalType })
      })
      break
    case 'add':
      if (props.deviceManagementList.length < 50) {
        locationModalType.title = '添加场景'
        locationModalType.type = 'add'
        nextTick(() => {
          props.openLocationModal({ deviceItem, locationModalType })
        })
      } else {
        info({
          title: `场景数量已达50，请删除多余场景后添加~`,
          okText: '确定',
        })
      }
      break
    default:
      break
  }
}

/**
 * 删除场景
 */
const defaultLocation = computed(() => {
  return props.deviceManagementList[0].locationName
})
const deleteLocationFn = (params: any) => {
  confirm({
    title: `确定删除场景${params.locationName},并将关联设备移${defaultLocation.value}中?`,
    onOk: async () => {
      await equipmentApi.deleteLocationName(params.locationId)
      message.success('删除场景成功')
      emit('reloadFn')
    },
  })
}

/**
 * 删除设备
 */
const deleteDeviceFn = async (params: any) => {
  popoverVisible.value[params.id] = false
  confirm({
    title: `确定删除设备${params.deviceName}?`,
    onOk: async () => {
      try {
        await equipmentApi.deleteCamera(params.id)
        message.success('删除成功')
        emit('reloadFn')
      } catch (error) {
        console.log('error', error)
      }
    },
  })
}

/**
 * 修改设备
 */
const editDeviceFn = (deviceItem: any) => {
  router.push(`/system-layout/equipment-management/equipment-add-edit?id=${deviceItem.id}`)
}

/**
 * 新增设备
 */
const addDeviceFn = (locationId: any) => {
  if (props.equipData.totalDeviceCount >= MAX_DEVICE_NUM) {
    return message.error('设备数量已达上限')
  }
  console.log(locationId, '1')

  router.push(`/system-layout/equipment-management/equipment-add-edit?deviceLocationId=${locationId}`)
}
/**
 * 拖动排序
 */
const initOrder = ref()

const tooltipShow = ref<boolean>(true)

const initMove = (event: any, key: number) => {
  event.item.style['opacity'] = '0'
  const initIds = props.deviceManagementList[key].cameraDeviceList.map((item: any) => {
    return item.id
  })
  initOrder.value = initIds
}
const checkMove = async (event: any, key: number) => {
  event.item.style['border-right'] = 'none'
  event.item.style['margin-right'] = '0px'
  event.item.style['opacity'] = '1'
  tooltipShow.value = true
  const ids = props.deviceManagementList[key].cameraDeviceList.map((item: any) => {
    return item.id
  })
  if (JSON.stringify(initOrder.value) == JSON.stringify(ids)) return
  try {
    await equipmentApi.putOrder({ ids })
    message.success('拖动成功')
  } catch (error) {
    console.log('error', error)
  }
}
</script>

<style lang="less" scoped>
.not-draggable {
  cursor: no-drop;
}

.the-collapse {
  .anticon {
    color: @text3;
  }
  :deep(.ant-collapse-item:last-child) {
    .ant-collapse-header {
      border-radius: 8px;
    }
  }
  :deep(.ant-collapse-header) {
    display: flex;
    height: 36px;
    padding: 6px 4px 6px 12px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    border-radius: 8px 8px 0px 0px;
    background: linear-gradient(180deg, #203a63 0%, #0e203d 100%), rgba(0, 0, 0, 0.3);
    .extra-action {
      display: flex;
    }
    .device-number {
      display: none;
    }
  }
  :deep(.ant-collapse-content-box) {
    border-radius: 0 0 8px 8px;
    background: rgba(255, 255, 255, 0.02);
    margin-bottom: 32px;
    padding-top: 20px !important;
    padding-bottom: 8px !important;
  }

  .collapse-panel {
    .extra-action {
      // display: none;
      .action-icon {
        max-width: 30px;
        min-width: 30px;
        min-height: 30px;
        display: flex;
        justify-content: center;
      }
    }
    .device-number {
      display: block;
      margin-right: 12px;
      font-weight: 700;
      font-size: 14px;
      line-height: 22px;
      color: @text2;
    }
    .collapse-panel-header {
      font-weight: 400;
      font-size: 14px;
      line-height: 23px;
      color: @text2;
    }
    .img-tab {
      position: absolute;
      right: 0;
      height: 36px;
      border-radius: 0 8px 8px 0;
    }
    .collapse-panel-content {
      display: flex;
      flex-wrap: nowrap;

      .drag-group {
        display: flex;
        flex-wrap: wrap;
      }

      .equipments-content {
        box-sizing: border-box;
        margin-bottom: 16px;
      }
      .panel-equipments {
        margin: 0 7px;
        width: 255px;
        height: 148px;
        box-sizing: border-box;
        border-radius: 8px;
        background: linear-gradient(90deg, rgba(225, 237, 255, 0.06) 12.27%, rgba(225, 237, 255, 0.12) 100%);
        border-radius: 12px;
        border: 1px solid transparent;
        border-image: inear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 100%);
        .equipments-header {
          position: relative;
          width: 100%;
          height: 106px;
          border-bottom: 1px solid rgba(242, 244, 247, 0.4);
          background: linear-gradient(0deg, rgba(80, 153, 255, 0.3) 0%, rgba(8, 14, 21, 0) 100%), #051630;
          box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.14), 0px 1px 3px 0px rgba(37, 37, 45, 0.14);
          border-radius: 8px 8px 0 0;
          padding: 15px 0 13px 12px;
          &:hover {
            .title-delete {
              display: block;
              cursor: pointer;
            }
          }
          .title-delete {
            cursor: pointer;
            position: absolute;
            width: 24px;
            height: 20px;
            border-radius: 8px 0px 10px 0px;
            background: @background3;
            top: 0px;
            left: 0px;
            text-align: center;
            line-height: 20px;
            display: none;
            .icon-delete-bin-line {
              font-size: 12px;
              // transform: scale(0.8);
              color: #8599bf !important;
            }
          }
          .header {
            display: flex;
            padding-left: 8px;
          }

          .status {
            color: @text3;
            margin-left: 8px;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 24px;
          }
          .header-title {
            text-align: right;
            width: 61px;
            .title-type {
              border-radius: 4px 0px 0px 4px;
              background: rgba(255, 255, 255, 0.1);
              width: 61px;
              height: 15px;
              font-family: Alimama FangYuanTi VF;
              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              text-align: center;
              line-height: 15px;
              margin-bottom: 6px;
              .title-type-text {
                color: rgba(255, 255, 255, 0.65);
              }
            }
            .title-type-number {
              background: linear-gradient(180deg, #1986f3 0%, #006dda 100%);
              font-family: D-DIN;
              font-size: 24px;
              font-style: normal;
              font-weight: 700;
              line-height: 20px;
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-right: 20px;
            }
            .operation-empty {
              background: rgba(176, 176, 176, 0.8);
              box-shadow: @shadow-s;
              & > span {
                color: @text3;
              }
              &:hover {
                background: #b0b0b0;
                box-shadow: @shadow-m;
              }
            }
          }
          .title-equip {
            margin-top: 15px;
            padding-right: 6px;
            display: flex;

            > P {
              line-height: 24px;
              font-weight: 400;
              font-size: 14px;
              margin-left: 8px;
              color: @text1;
              .ellipsis();
            }
          }

          .header-image-active {
            &::before {
              content: '';
              position: absolute;
              right: -4px;
              top: 5px;
              width: 8px;
              height: 8px;
              background: linear-gradient(180deg, #5cc969 0%, #2fa03c 100%);
              border-radius: 50%;
              filter: drop-shadow(0px 0.5px 1px rgba(41, 46, 53, 0.25));
            }
          }
          .header-image-inactive {
            &::before {
              content: '';
              position: absolute;
              right: -4px;
              top: 5px;
              width: 8px;
              height: 8px;
              background: #f17764;
              border-radius: 50%;
            }
          }

          .header-image {
            height: 44px;
            width: 44px;
            position: relative;

            .header-image-pic {
              width: 100%;
            }
          }
        }

        .equipments-bottom {
          display: flex;
          height: 42px;
          border-radius: 0 0 8px 8px;
          &:hover {
            cursor: pointer;
          }
          .equipments-bottom_edit {
            width: 100%;
            height: 40px;
            text-align: center;
            line-height: 38px;
            border-right: 1px solid @border2;
            color: @primary2;
            &:hover {
              // background-color: @background5;
            }
          }

          .equipments-bottom_more {
            width: 100%;
            height: 38px;
            text-align: center;
            line-height: 38px;
            color: @primary2;
            &:hover {
              // background-color: @background5;
            }
          }
        }
      }

      .panel-add-equipments {
        width: 255px;
        height: 148px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed @border1;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.08);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.03);
        .icon-add-line {
          font-size: 20px;
        }
        &:hover {
          cursor: pointer;
          // background: #f5f5f5;
        }
      }
    }

    .icon-edit-fill {
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }
    .icon-add-line {
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }
    .icon-delete-bin-line {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5) !important;
    }
  }
}

.flex-content {
  .flex-button {
    display: block;
    width: 80px;
    height: 32px;
  }
}
.ant-collapse-item,
.collapse-panel {
  margin-bottom: 32px;
}
</style>
