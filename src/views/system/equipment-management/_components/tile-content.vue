<template>
  <div class="tile-content-page">
    <aside class="tile-content-page-aside">
      <header style="padding-right: 12px">
        <h6>场景位置</h6>
        <a-button
          type="text"
          class="alone-icon-button operation-icon"
          v-auth="'equipment-management-scene-add'"
          @click.stop="EquipName({}, 'add')"
        >
          <i class="iconfont icon-add-line"></i>
        </a-button>
      </header>
      <main>
        <ul class="aside-main-list">
          <li
            class="aside-main-list-item"
            :class="[activeListIndex === index ? 'aside-main-list-item-active' : '']"
            v-for="(deviceItem, index) in deviceManagementList"
            @click="activeListFn(index)"
            :key="index"
          >
            <p :title="deviceItem.locationName" class="deviceItem-locationName">{{ deviceItem.locationName }}</p>
            <p class="cameraDeviceList-number">{{ deviceItem.cameraDeviceList.length }}</p>
            <div class="operation">
              <a-button
                type="text"
                class="alone-icon-button operation-icon"
                v-auth="'equipment-management-scene-edit'"
                @click.stop="EquipName(deviceItem, 'edit')"
              >
                <i class="iconfont icon-edit-fill"></i>
              </a-button>
              <template v-if="deviceItem.locationId != 1">
                <a-button
                  type="text"
                  class="alone-icon-button operation-icon"
                  @click.stop="deleteLocationFn(deviceItem)"
                  v-auth="'equipment-management-scene-delete'"
                >
                  <i class="iconfont icon-delete-bin-fill"></i>
                </a-button>
              </template>
            </div>
          </li>
        </ul>
      </main>
    </aside>
    <main class="tile-content-page-main">
      <a-table
        sticky
        :columns="columns"
        :data-source="cameraDeviceList"
        :row-key="(record:any) => record.id"
        :pagination="false"
      >
        <!-- 暂无数据的效果 -->
        <template #emptyText>
          <div class="table-empty">
            <img src="@/assets/images/alarm/icon_list_empty.png" />
            <p>无数据</p>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == 'deviceName'">
            <div class="item-deviceName">
              {{ record.deviceName }}
            </div>
          </template>
          <template v-if="column.key == 'deviceStatus'">
            <div class="item-status" :class="[record.deviceStatus === 0 ? 'offLine' : '']">
              {{ record.deviceStatus ? '在线' : '离线' }}
            </div>
          </template>
          <template v-if="column.key == 'deviceActiveSrvCountV2'">
            <div class="ai-name">
              <div class="title-type" :class="[record.deviceActiveSrvCountV2 === 0 && 'operation-empty']">
                <img style="width: 14px; height: 12px" src="@/assets/images/public/icon_ai.png" />
                <span class="title-type-number">{{ record.deviceActiveSrvCountV2 }}</span>
              </div>
              {{ record.aiSrvConcatNameV2 ?? '暂无服务' }}
            </div>
          </template>
          <template v-if="column.key == 'action'">
            <div class="flex">
              <a-button
                type="link"
                class="action-button"
                @click="handleEdit(record)"
                v-auth="'equipment-management-ai-look'"
                >配置</a-button
              >
              <a-button
                type="link"
                class="action-button"
                v-auth="'equipment-management-equipment-edit'"
                @click="editDeviceFn(record)"
                >编辑</a-button
              >
              <a-button
                type="link"
                class="action-button"
                v-auth="'equipment-management-equipment-delete'"
                @click="deleteDeviceFn(record)"
                >删除</a-button
              >
            </div>
          </template>
        </template>
      </a-table>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted } from 'vue'
import { TableColumnsType } from 'ant-design-vue'
import { message } from '@/utils/antd.util'
import { useRouter } from 'vue-router'
import { equipmentApi } from '@/services/api'
import { confirm, info } from '@/utils/antd.util'

const router = useRouter()

const props = defineProps({
  deviceManagementList: {
    type: Array<any>,
    default: [],
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

const emit = defineEmits(['reloadFn', 'use-are-statistics'])
const activeListIndex = ref<number | null>(null)

onMounted(() => {
  activeListFn(null)
})

/**
 * 弹出框操作
 */
const EquipName = (deviceItem: any, type: string) => {
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

const cameraDeviceList = ref<any[]>([])

const activeListFn = async (index: number | null) => {
  if (activeListIndex.value === index) {
    index = null
  }
  activeListIndex.value = index
  // 切换组件，刷新列表数据
  emit('reloadFn')
}

const filterAreDeviceState = (state: string | number, data?: any) => {
  let nowData = data || props.deviceManagementList
  state = state.toString()
  // 选中有场景
  if (activeListIndex.value !== null) {
    cameraDeviceList.value = nowData[activeListIndex.value].cameraDeviceList.filter(
      (item: { deviceStatus: string | number }) => {
        if (state) {
          return item.deviceStatus.toString() === state
        }
        return true
      },
    )
    // 通知父组件使用当前场景的设备统计
    emit('use-are-statistics', nowData[activeListIndex.value].cameraDeviceList)
    return
  }
  // 未选中场景
  let totalList = nowData.flatMap((item: { cameraDeviceList: any }) => item.cameraDeviceList)
  cameraDeviceList.value = totalList.filter((item: { deviceStatus: string | number }) => {
    if (state) {
      return item.deviceStatus.toString() === state
    }
    return true
  })
  // 通知父组件使用当前场景的设备统计
  emit('use-are-statistics', totalList)
}

defineExpose({
  filterAreDeviceState,
})

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
  // popoverVisible.value[params.id] = false
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

const columns = ref<TableColumnsType>([
  {
    title: '设备名称',
    width: 200,
    dataIndex: 'deviceName',
    key: 'deviceName',
    fixed: 'left',
  },
  {
    title: '已配置算法',
    dataIndex: 'deviceActiveSrvCountV2',
    key: 'deviceActiveSrvCountV2',
  },
  {
    title: '状态',
    width: 120,
    dataIndex: 'deviceStatus',
    key: 'deviceStatus',
  },
  {
    title: '操作',
    width: 180,
    dataIndex: 'action',
    key: 'action',
  },
])
const handleEdit = (params: any) => {
  router.push(`/system-layout/equipment-management/configuration?id=${params.id}`)
}
</script>
<style lang="less"></style>
<style lang="less" scoped>
.tile-content-page {
  width: 100%;
  height: 100%;
  display: flex;
  .tile-content-page-aside {
    height: 100%;
    padding: 0 32px 0 0;
    overflow-y: scroll;
    header {
      margin-bottom: 18px;

      > h6 {
        font-weight: 700;
        font-size: 14px;
        color: @text3;
        margin-left: 8px;
        line-height: 22px;
      }

      display: flex;
      align-items: center;
      justify-content: space-between;

      .icon-add-line {
        width: 25px;
      }
    }

    .aside-main-list {
      display: flex;
      flex-direction: column;
      gap: 8px 0;
      width: 256px;

      .aside-main-list-item {
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: @text2;
        padding: 4px 12px;

        &:hover {
          cursor: pointer;
        }
        & > p {
          font-weight: 400;
          font-size: 14px;
          line-height: 22px;
          color: @text2;
        }
        .cameraDeviceList-number {
          min-width: 30px;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
        }
        .operation {
          display: none;
          .operation-icon {
            width: 30px;
            height: 30px;
          }

          i {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5);
          }
        }

        span {
          color: @text3;
        }

        &:hover {
          background: @mask1;
          border-radius: 6px;

          .operation {
            display: flex;
          }
          .cameraDeviceList-number {
            display: none;
          }
        }
      }
      .deviceItem-locationName {
        .ellipsis();
      }

      .aside-main-list-item-active {
        background: @mask5;
        border-radius: 6px;
        .deviceItem-locationName {
          color: @text1;
          .ellipsis();
        }
      }
    }
  }

  .tile-content-page-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    // background: @background1;
    // border: 1px solid @border1;
    border-left: none;
    overflow-y: scroll;
    overflow-x: hidden;
    .item-status {
      color: @text1;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        left: -10px;
        top: 8px;
        width: 6px;
        height: 6px;
        background: linear-gradient(180deg, #5cc969 0%, #2fa03c 100%);
        border-radius: 50%;
        filter: drop-shadow(0px 0.5px 1px rgba(41, 46, 53, 0.25));
      }
    }
    .offLine {
      position: relative;
      &::before {
        content: '';
        position: absolute;
        left: -10px;
        top: 8px;
        width: 6px;
        height: 6px;
        background: #f17764;
        border-radius: 50%;
      }
    }
    .item-deviceName {
      color: @text1;
      .ellipsis();
    }
    .ai-name {
      display: flex;
      align-items: center;
      color: #ddeaf9;

      .title-type {
        background: rgba(0, 0, 0, 0.3);
        margin-right: 4px;
        display: flex;
        width: 34px;
        height: 17px;
        border-radius: 3px;
        color: @text2;
        justify-content: center;
        align-items: center;
        gap: 0 4px;
        font-size: 14px;
        cursor: pointer;

        .title-type-number {
          color: @secondary1;
          font-size: 16px;
          font-family: D-DIN;
          font-weight: 700;
          line-height: 17px;
        }
      }
    }
  }

  .action-button {
    margin-right: 16px;
    color: @link;
  }

  ::v-deep(.ant-table-tbody > tr > td) {
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    color: @text1;
    &:first-child {
      padding-left: 24px;
    }
  }
  ::v-deep(.ant-table-thead > tr > th) {
    &:first-child {
      padding-left: 24px;
    }
  }
}
.flex-content {
  .flex-button {
    // display: block;
    // width: 80px;
    // height: 32px;
  }
}
</style>
