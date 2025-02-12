<template>
  <a-tooltip
    overlayClassName="device-tooltip"
    color="rgba(0, 0, 0, 0.9)"
    :placement="placement"
    :trigger="trigger"
    :getPopupContainer="(e: any) => e.parentNode"
  >
    <template #title>
      <div class="device-content">
        <div class="device-title-content">
          <div class="title-name">
            {{ deviceData.deviceName }}
          </div>
          <div
            class="device-status"
            :class="[deviceData.deviceStatus ? 'device-status-active' : 'device-status-inactive']"
          >
            {{ deviceData.deviceStatus ? '在线' : '离线' }}
          </div>
        </div>
        <div class="device-message-content">
          <div class="message-item">
            <div class="item-title">ID</div>
            <div class="item-detail">{{ deviceData.id }}</div>
          </div>
          <div class="message-item">
            <div class="item-title">场景位置</div>
            <div class="item-detail">{{ deviceData.deviceLocationName }}</div>
          </div>
          <div class="message-item">
            <div class="item-title">协议</div>
            <div class="item-detail">{{ deviceStreamingProtocol }}</div>
          </div>
          <template v-if="deviceData.deviceStreamingProtocol == 0">
            <div class="message-item">
              <div class="item-title">链接地址</div>
              <div class="item-detail">{{ deviceData.deviceStreamingUrl }}</div>
            </div>
          </template>
          <template v-if="deviceData.deviceStreamingProtocol == 1">
            <div class="message-item">
              <div class="item-title">SIP用户名</div>
              <div class="item-detail">{{ deviceData.deviceSipId }}</div>
            </div>
            <div class="message-item">
              <div class="item-title">SIP用户密码</div>
              <div class="item-detail">{{ deviceData.deviceVideoChannelId }}</div>
            </div>
          </template>
          <div class="message-item">
            <div class="item-title">厂家</div>
            <div class="item-detail">{{ deviceData.deviceProvider }}</div>
          </div>
          <div class="message-item">
            <div class="item-title">备注</div>
            <div class="item-detail">{{ deviceData.deviceRemark ?? '/' }}</div>
          </div>
        </div>
        <div class="device-detail-content">
          <div class="message-item" v-for="(item, index) in deviceData.deviceAreaList" :key="item.deviceAreaId">
            <div class="item-title">区域【{{ index + 1 }}】</div>
            <div class="message-detail">
              <div class="item-detail">{{ item.deviceAreaSelectConcatAISrv ?? '暂无描述' }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <slot name="content"></slot>
  </a-tooltip>
</template>

<script setup lang="ts">
import { cameraDeviceListType } from '../interface'
import { computed } from 'vue'
import type { PropType } from 'vue'
const props = defineProps({
  deviceData: {
    type: Object as PropType<cameraDeviceListType>,
    default: () => {
      return null
    },
  },
  trigger: {
    type: String as PropType<'click' | 'hover' | 'focus' | 'contextmenu'>,
    default: 'hover',
  },
  placement: {
    type: String as PropType<
      | 'top'
      | 'left'
      | 'right'
      | 'bottom'
      | 'topLeft'
      | 'topRight'
      | 'bottomLeft'
      | 'bottomRight'
      | 'leftTop'
      | 'leftBottom'
      | 'rightTop'
      | 'rightBottom'
    >,
    default: 'leftTop',
  },
})

const deviceStreamingProtocol = computed(() => {
  let protoName = ''
  switch (props.deviceData.deviceStreamingProtocol) {
    case 0:
      protoName = 'RTSP'
      break
    case 1:
      protoName = 'GB/T 28181'
      break
    default:
      protoName = 'RTSP'
      break
  }
  return protoName
})
</script>

<style lang="less">
.device-tooltip {
  .ant-tooltip-inner {
    width: 326px !important;
    padding: 12px;
  }
}
</style>
<style lang="less" scoped>
.device-tooltip {
  @deviceText1: rgba(255, 255, 255, 0.75);
  .device-content {
    .device-title-content {
      display: flex;
      width: 100%;
      border-bottom: 1px solid @mask5;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 4px 12px 12px;
      .title-name {
        font-weight: 700;
        font-size: 14px;
        color: @deviceText1;
        line-height: 22px;
      }
      .device-status {
        font-size: 12px;
        line-height: 22px;
        position: relative;
      }
      .device-status-active {
        &::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 8px;
          width: 6px;
          height: 6px;
          background: #5cc969;
          border-radius: 50%;
        }
      }
      .device-status-inactive {
        &::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 8px;
          width: 6px;
          height: 6px;
          background: @text4;
          border-radius: 50%;
        }
      }
    }
    .message-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .item-title {
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        color: @deviceText1;
      }
      .item-detail {
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        max-width: 184px;
      }
    }
    .device-message-content {
      padding: 14px 12px 0;
      border-bottom: 1px solid @mask5;
    }
    .device-detail-content {
      margin-top: 8px;
      max-height: 150px;
      overflow-y: scroll;
      margin-bottom: 11px;
      padding: 0 12px;
      .message-detail {
        display: flex;
        justify-content: flex-start;
        .item-detail {
          width: 184px;
        }
      }
    }
    ::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
      z-index: 999;
    }
  }
}
</style>
