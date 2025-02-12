<template>
  <div class="ai-serve-wrap">
    <div class="step-wrap">
      <div class="left">
        <div class="step">第一步</div>
        <p class="text">选择AI服务</p>
      </div>
    </div>
    <div class="horizontal-vertical-center" v-if="!aiServiceAuth">
      <no-algo-auth :text="'您需要在获得算法授权后才可以使用算法对画面进行分析。'" :modelWidth="'224px'"></no-algo-auth>
    </div>
    <g-empty :empty="aiServiceList?.length === 0" v-else>
      <template #empty> 请先添加识别区域 </template>
      <ul class="ai-serve-list">
        <li
          class="ai-serve-list-item"
          :class="[item.selected === 1 && 'active']"
          v-for="(item, index) in aiServiceList"
          :key="item.id"
          :disabled="item.selectable === 0"
        >
          <div class="ai-serve-list-item-left">
            <!-- chore:计数方式由后端实现，前端暂时不用做提示 -->
            <!-- <a-tooltip
              :title="isFull && item.selected !== 1 ? '无法添加更多' : undefined"
              :get-popup-container="(e) => (e.parentNode as HTMLElement)"
            > -->
            <a-checkbox
              v-auth="'equipment-management-ai-edit'"
              :checked="item.selected === 1"
              :id="item.id.toString()"
              :disabled="item.selectable === 0"
              @change="onServiceCheckedChange($event.target.checked, item)"
            ></a-checkbox>
            <!-- </a-tooltip> -->
            <div class="ai-srv-name">
              <p class="text">{{ item.aiSrvName }}</p>
              <a-tooltip>
                <template #title> 与【人脸识别】算法产生报警联动 </template>
                <i class="iconfont icon-links-line" v-if="item.isAlgoLinkAlarm"></i>
              </a-tooltip>
            </div>
          </div>
          <div class="ai-serve-list-item-right">
            <a-tooltip title="算法已停用，在AI服务中开启算法后自动生效">
              <span class="invalid" v-if="item.effective !== 1 && item.selected === 1"> 未生效 </span>
            </a-tooltip>
            <div
              v-auth="'equipment-management-ai-edit'"
              :class="[!item.useDefaultConfig && 'custom']"
              @click="handleOpenServiceForm(item, index)"
            >
              {{ item.useDefaultConfig ? '默认' : '自定义' }}
            </div>
            <i class="iconfont icon-arrow-right-s-line" @click="handleOpenServiceForm(item, index)"></i>
          </div>
        </li>
      </ul>
    </g-empty>
  </div>

  <g-modal
    width="1000px"
    :bodyStyle="{ height: '600px', overflow: 'auto', padding: '40px 64px 20px' }"
    v-model:visible="serviceFormVisible"
    title="AI服务配置"
    destroyOnClose
    class="ai-service-modal"
  >
    <div class="ai-service-name">
      <h4>{{ serviceItem?.aiSrvName }}</h4>
    </div>
    <service-form
      :loading="serviceFormLoading"
      :hasFaceAiSrv="aiServiceList.filter((item) => item.aiSrvType === ServiceEnum.FACE_RECOGNITION).length > 0"
      :show-coveralls-library="true"
      :show-face-library="false"
      ref="serviceFormRef"
    ></service-form>
    <!-- 底部按钮 -->
    <template #footer>
      <div class="service-form-footer">
        <a-button :loading="resetLoading" type="text" @click="onReset">恢复通用配置</a-button>
        <a-button type="default" @click="handleServiceFormCancel">取消</a-button>
        <a-button type="primary" @click="handleServiceFormSubmit">确定</a-button>
      </div>
    </template>
  </g-modal>
</template>

<script setup lang="ts">
import { equipmentApi } from '@/services/api'
import ServiceForm from '@/views/system/ai-service/_components/service-form.vue'
import { cloneDeep } from 'g6-fn'
import noAlgoAuth from '../../../_components/no-algo-auth.vue'
import { nextTick, ref } from 'vue'
import { ServiceEnum } from '../../../ai-service/config'
import { useRequest } from 'vue-request'
const props = defineProps({
  aiServiceList: {
    type: Array<any>,
    default: 0,
  },
  aiServiceAuth: {
    type: Boolean,
    default: true,
  },
  areaInfo: {
    type: Object,
    default: () => ({
      activeAreaAISrvCount: 0,
    }),
  },
  optionalCount: {
    type: Number,
    default: 0,
  },
})

const emits = defineEmits<{
  (e: 'on-change-checked', item: any, index: number): void
}>()

// ai服务选择是否已达上限
// const isFull = computed(() => {
//   const activatedServeCount = props.aiServiceList.filter((item: any) => item.selected === 1).length
//   return props.optionalCount <= activatedServeCount
// })

/**
 * 自定义AI配置-表单
 */
const serviceFormRef = ref<InstanceType<typeof ServiceForm>>()
const serviceFormVisible = ref<boolean>(false)
const serviceActiveIndex = ref<number>(0)
const serviceItem = ref<any>()
const { loading: serviceFormLoading, runAsync: runGetAiConfig } = useRequest(equipmentApi.getAiConfig)
const handleOpenServiceForm = async (item: any, index: number) => {
  serviceFormVisible.value = true
  let params: any = {}
  serviceItem.value = item
  serviceActiveIndex.value = index
  if (item?.deviceAISrvCustomizeConfig) {
    params = cloneDeep(item.deviceAISrvCustomizeConfig)
  } else {
    const { data } = await runGetAiConfig(item.id)
    params = data
    params.id = item.id
  }
  nextTick(() => {
    serviceFormRef.value?.setFormData(params)
  })
}

/**
 * 提交AI服务表单
 */
const handleServiceFormSubmit = async () => {
  try {
    const isChange = await serviceFormRef.value?.getIsChange()
    const aiServiceListObj = props.aiServiceList[serviceActiveIndex.value]

    if (isChange) {
      const formData = await serviceFormRef.value?.getFormData()
      aiServiceListObj.deviceAISrvCustomizeConfig = formData
      aiServiceListObj.useDefaultConfig = 0
      // 处理算法联动
      if (
        formData.aiSrvExtraArgs.algoLinkageAlarm !== -1 &&
        formData.aiSrvExtraArgs.hasOwnProperty('algoLinkageAlarm')
      ) {
        aiServiceListObj.isAlgoLinkAlarm = 1
      } else {
        aiServiceListObj.isAlgoLinkAlarm = null
      }
    } else {
      aiServiceListObj.deviceAISrvCustomizeConfig = null
      aiServiceListObj.useDefaultConfig = 1
      const formData = await serviceFormRef.value?.getFormData()
      if (
        formData.aiSrvExtraArgs.algoLinkageAlarm !== -1 &&
        formData.aiSrvExtraArgs.hasOwnProperty('algoLinkageAlarm')
      ) {
        aiServiceListObj.isAlgoLinkAlarm = 1
      } else {
        aiServiceListObj.isAlgoLinkAlarm = null
      }
      onReset()
    }

    serviceFormVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

/**
 * 恢复默认设置
 */

const { loading: resetLoading, runAsync: runResetAIRule } = useRequest(equipmentApi.resetDefaultAiConfig)
const onReset = async () => {
  let id = serviceItem.value.id
  const { data } = await runResetAIRule(serviceItem.value.id)
  data.id = id
  props.aiServiceList[serviceActiveIndex.value].deviceAISrvCustomizeConfig = data
  serviceFormRef.value?.setFormData(data)
}

/**
 * 关闭AI服务表单
 */
const handleServiceFormCancel = () => {
  serviceFormVisible.value = false
}

/**
 * 选择AI服务
 * @param checked
 * @param item
 */
const onServiceCheckedChange = (checked: boolean, item: any) => {
  emits('on-change-checked', checked, item)
}
</script>

<style lang="less" scoped>
@import '../../styles/index.less';

.horizontal-vertical-center {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.ai-serve-wrap {
  width: 300px;
  height: 100%;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px 0;

  // background: rgba(40, 65, 103, 0.5);
  .step-wrap {
    display: flex;
    justify-content: space-between;
    padding: 4px 16px 0 16px;

    > div {
      border: none;
    }

    .left {
      .text {
        color: @text2;
        font-size: 14px;
        font-weight: 700;
        line-height: 22px;
      }

      .step {
        margin-right: 8px;
      }
    }

    .statistics {
      color: @text3;
      text-align: center;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      /* 166.667% */
      display: flex;
      // width: 40%;
      text-align: right;
      justify-content: flex-end;
    }
  }

  .ai-serve-list {
    width: 100%;
    flex: 1;
    overflow: auto;
    padding: 0 20px;

    .ai-serve-list-item {
      width: 100%;
      height: 72px;
      padding: 0 12px 0 16px;
      border-radius: 10px;
      background: rgba(23, 104, 225, 0.05);
      cursor: pointer;
      color: @text1;
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;

      &.active {
        border-radius: 10px;
        position: relative;
        border: 1px solid @border3;
        background: linear-gradient(0deg, rgba(225, 237, 255, 0.2) 0%, rgba(225, 237, 255, 0.2) 100%),
          linear-gradient(180deg, #203a63 0%, #0e203d 100%),
          url(@/assets/images/equipment/bgc_ai_serve_active.png) no-repeat;
        background-size: 137px 72px;
        background-position: right center;
        background-blend-mode: hard-light, lighten, luminosity;

        :deep(.ant-checkbox-checked) {
          .ant-checkbox-inner {
            background: linear-gradient(180deg, #1986f3 0%, #006dda 100%) !important;
          }
        }
      }

      &:hover:not(&.active):not(&[disabled='true']) {
        background: rgba(23, 104, 225, 0.15);
      }

      &[disabled='true'] {
        cursor: not-allowed;
        background: rgba(0, 0, 0, 0.03);

        .ai-serve-list-item-left {
          p,
          :deep(.ant-checkbox) {
            opacity: 0.3;
          }
        }

        .ai-serve-list-item-right {
          opacity: 0.3;
        }
      }

      .ai-serve-list-item-left {
        display: flex;
        align-items: center;
        gap: 0 12px;

        .ai-srv-name {
          display: flex;

          .text {
            overflow: hidden; //超出部分隐藏
            max-width: 106px;
            white-space: nowrap; //不换行
            text-overflow: ellipsis; //文本溢出显示省略号
          }

          .iconfont {
            font-size: 14px;
            margin-left: 4px;
            color: @primary2;
          }
        }
      }

      .ai-serve-list-item-right {
        display: flex;
        align-items: center;
        gap: 0 2px;
        min-width: 68px;
        position: relative;

        .invalid {
          position: absolute;
          top: -22px;
          right: -6px;
          display: inline-block;
          line-height: 20px;
          color: rgba(255, 190, 70, 1);
          font-size: 10px;
          font-style: normal;
          font-weight: 500;
        }

        > div {
          color: @primary2;
          font-size: 12px;
          font-weight: 400;
          display: flex;
          align-items: center;
          padding: 0 6px;
          border-radius: 100px;
          height: 24px;
          border: 1px solid rgba(225, 237, 255, 0);
          box-sizing: border-box;
          background: rgba(225, 237, 255, 0.1);

          &.custom {
            color: @text1;
            background: linear-gradient(180deg, #67cd73 0%, rgba(103, 205, 115, 0.49) 100%);
            border: 1px solid rgb(103, 205, 115);
          }
        }

        > i {
          color: @text3;
        }
      }
    }
  }
}

.service-form-footer {
  padding: 0 24px;

  .ant-btn-text {
    color: @text3;
  }
}

.ai-service-name {
  display: flex;
  align-items: center;
  gap: 0 6px;
  margin-bottom: 40px;

  > h4 {
    font-size: 18px;
    font-weight: 700;
    line-height: 26px;
    color: @text1;
  }
}
</style>
<style>
.ai-service-modal .ant-modal-footer {
  padding: 20px 0px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
