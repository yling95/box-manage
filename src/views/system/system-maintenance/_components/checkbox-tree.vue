<template>
  <div class="g-checkbox-tree">
    <div class="g-checkbox-tree-parent">
      <header>
        <h6>{{ parentTitle }}</h6>
        <p>已选 {{ props.value.length || 0 }}/{{ list.length || 0 }}</p>
      </header>
      <ul class="g-checkbox-tree-parent-list">
        <a-checkbox-group :value="props.value" @change="onChange">
          <li
            :class="[activeIndex === index && 'g-checkbox-tree-parent-list-item-active']"
            v-for="(item, index) in list"
            :key="item.id"
            @click="onClickItem(item, index)"
          >
            <a-checkbox :value="item?.id" :disabled="props.isdisable">{{ item.name }}</a-checkbox>
            <div>
              <p>{{ item?.childData?.length }}</p>
              <a-button type="text" class="alone-icon-button">
                <i class="iconfont icon-arrow-right-s-line"></i>
              </a-button>
            </div>
          </li>
        </a-checkbox-group>
      </ul>
    </div>
    <div class="g-checkbox-tree-child">
      <header>
        <h6>{{ childTitle }}</h6>
      </header>
      <ul class="g-checkbox-tree-child-list">
        <li v-for="item in list[activeIndex]?.childData" :key="item?.childId">
          {{ item?.childName }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckboxValueType } from 'ant-design-vue/es/checkbox/interface'
import { computed, ref } from 'vue'
interface GCheckboxTreeOption {
  id: string | number
  name?: any
  childData?: any[]
}

interface GCheckboxTreeProps {
  value?: any[]
  parentTitle?: string
  childTitle?: string
  options?: GCheckboxTreeOption[]
  isdisable?: boolean
}

const props = withDefaults(defineProps<GCheckboxTreeProps>(), {
  value: () => [],
  parentTitle: '',
  childTitle: '',
  options: () => [],
  isdisable: false,
})
const emit = defineEmits(['on-click-item', 'update:value'])

const activeIndex = ref(-1)
const onClickItem = (item: GCheckboxTreeOption, index: number) => {
  activeIndex.value = index
  emit('on-click-item', item, index)
}

// 数据列表
const list = computed(() => props.options)
const onChange = (checkedValue: CheckboxValueType[]) => {
  emit('update:value', checkedValue)
}
</script>

<style lang="less" scoped>
.g-checkbox-tree {
  width: 100%;
  height: 349px;
  display: flex;
  border: 1px solid @border3;
  border-radius: 6px;
  overflow: hidden;

  .g-checkbox-tree-parent {
    width: 416px;
    height: 100%;
    background: @background3;
    display: flex;
    flex-direction: column;
    > header {
      height: 48px;
      display: flex;
      gap: 0 12px;
      padding: 12px 16px;

      > h6 {
        font-weight: 700;
        font-size: 14px;
        line-height: 22px;
        text-align: center;
        color: @text1;
        margin: 0;
      }
      > p {
        font-size: 14px;
        line-height: 22px;
        color: @text2;
      }
    }

    .g-checkbox-tree-parent-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px 0;
      overflow: auto;
      li {
        padding: 4px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;

        > div {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: @text3;

          .icon-arrow-right-s-line {
            width: 24px;
            color: @text3;
            transform: translateY(1px);
          }
        }

        &:hover {
          background: @mask4;
        }
      }
      .g-checkbox-tree-parent-list-item-active {
        background: @mask3;
      }
    }
  }
  .g-checkbox-tree-child {
    border-left: 1px solid @border3;
    flex: 1;
    background: rgba(0, 0, 0, 0.1);
    border-left: 1px solid @border1;
    overflow: hidden;
    > header {
      height: 48px;
      display: flex;
      gap: 0 12px;
      padding: 12px 16px;

      > h6 {
        font-weight: 700;
        font-size: 14px;
        line-height: 22px;
        text-align: center;
        color: @text1;
        margin: 0;
      }
      > p {
        font-size: 14px;
        line-height: 22px;
        color: @text2;
      }
    }

    .g-checkbox-tree-child-list {
      height: 100%;
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 8px 0;
      overflow: auto;
      color: @text1;
    }
  }
}
</style>
