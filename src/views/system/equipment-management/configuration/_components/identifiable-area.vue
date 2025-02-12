<template>
  <div class="identifiable-area">
    <ul class="identifiable-area-list">
      <li
        class="identifiable-area-list-item"
        :class="[areaActiveIndex === index && 'active']"
        v-for="(item, index) in areaList"
        @click="handleChangeAreaItem(item, index)"
        :key="index"
      >
        <p>{{ index + 1 }}</p>
        <div
          class="icon-close"
          v-if="areaList.length > 1"
          v-auth="'equipment-management-ai-edit'"
          @click.stop="handleDeleteAreaItem(item, index)"
        >
          <i class="iconfont icon-close-line"></i>
        </div>
      </li>

      <a-tooltip placement="top" :title="areaList.length >= MAX_AREA_NUM ? '无法添加更多' : undefined">
        <li class="identifiable-area-list-item-add" v-auth="'equipment-management-ai-edit'" @click="handleAddArea">
          <i class="iconfont icon-add-line"></i>
        </li>
      </a-tooltip>
      <p class="statistics">已配置算法（{{ optionalCount }}/7）</p>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { equipmentApi } from '@/services/api'
import { message } from '@/utils/antd.util'
import { MAX_AREA_NUM } from '../../config'

const props = defineProps({
  areaActiveIndex: {
    type: Number,
    default: 0,
  },
  areaList: {
    type: Array<number>,
    default: () => [],
  },
  equipmentId: {
    type: [String, Number],
    required: true,
  },

  optionalCount: {
    type: Number,
    default: 0,
  },
})

const emits = defineEmits<{
  (e: 'on-change-area', id: number, index: number): void
  (e: 'on-delete-area', id: number, index: number): void
  (e: 'on-add-area'): void
}>()

/**
 * 切换区域
 * @param id
 * @param index
 */
const handleChangeAreaItem = (id: number, index: number) => {
  emits('on-change-area', id, index)
}

/**
 * 删除区域
 * @param id
 * @param index
 */
const handleDeleteAreaItem = (id: number, index: number) => {
  emits('on-delete-area', id, index)
}

/**
 * 添加区域
 */
const handleAddArea = async () => {
  await equipmentApi.addDeviceArea(props.equipmentId as number)
  message.success('操作成功')
  emits('on-add-area')
}
</script>

<style lang="less" scoped>
.identifiable-area {
  width: 100%;
  height: 36px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 0 40px;

  > p {
    color: @text3;
    font-size: 14px;
    font-weight: 700;
    line-height: 22px;
  }

  .identifiable-area-list {
    display: flex;
    align-items: center;
    gap: 0 4px;
    height: 100%;

    .identifiable-area-list-item {
      width: 76px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: @text2;
      font-size: 16px;
      font-weight: 700;
      line-height: 24px;
      cursor: pointer;
      position: relative;

      > p {
        position: absolute;
        z-index: 1;
      }

      .icon-close {
        display: none;
        position: absolute;
        right: 0;
        top: -8px;
        z-index: 1;
        width: 16px;
        height: 16px;
        padding: 1px;
        justify-content: center;
        align-items: center;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        > i {
          font-size: 12px;
        }
      }

      &.active,
      &:hover {
        &::after {
          content: '';
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
        }
      }

      &:hover {
        .icon-close {
          display: flex;
        }
        &::after {
          background: url('../../../../../assets/images/equipment/bgc_area_item.png') no-repeat;
          background-size: contain;
        }
      }
      &.active {
        &::after {
          background: url('../../../../../assets/images/equipment/bgc_area_item_active.png') no-repeat;
          background-size: contain;
        }
      }
    }

    .identifiable-area-list-item-add {
      width: 56px;
      height: 32px;
      border-radius: 10px;
      background: @background2;
      box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      color: @primary2;
      cursor: pointer;
    }
  }
}

.statistics {
  margin-left: 14px;
  color: @text3;
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 166.667% */
}
</style>
