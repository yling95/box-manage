<template>
  <div class="ai-service-page">
    <aside class="ai-service-page-aside">
      <div class="ai-service-page-aside-title">
        <h6>AI服务列表</h6>
      </div>
      <ul class="service-list">
        <template v-if="serviceAuth">
          <a-spin v-if="serviceListLoading" />
          <template v-else>
            <div style="margin: 100px auto" v-if="serviceList?.length === 0">
              <img style="width: 80px; height: 80px" src="@/assets/images/alarm/icon_list_empty.png" />
              <p style="color: rgba(255, 255, 255, 0.45); text-align: center">无数据</p>
            </div>
            <li
              class="service-list-item"
              :class="[activeIndex === index && 'active']"
              v-for="(item, index) in serviceList"
              :key="item.id"
              @click="onClickItem(item, index)"
              @mouseenter="hoverServiceId = item.id"
              @mouseleave="hoverServiceId = null"
            >
              <div>
                <div class="service-list-item-info">{{ item.aiSrvName }}</div>
              </div>
              <div @click.stop v-auth="'ai-service-switch'">
                <a-switch
                  v-if="hoverServiceId === item.id"
                  :checked="item.aiSrvStatus === 1"
                  @change="(checked: any) => onSwitchChange(checked, item)"
                  size="small"
                />
                <span v-else :class="['status-text', { active: item.aiSrvStatus === 1 }]">{{
                  item.aiSrvStatus === 1 ? '已启用' : '已停用'
                }}</span>
              </div>
            </li>
          </template>
        </template>
      </ul>
    </aside>
    <main class="ai-service-page-main" v-if="serviceList?.length && serviceAuth">
      <header>
        <h6>通用规则配置</h6>
      </header>
      <div class="form-wrap">
        <div class="general-bar">
          <div class="ai-name-title">
            <h6>{{ serviceItem.aiSrvName }}</h6>
            <!-- <div class="face-btn" v-if="serviceItem.id === ServiceEnum.FACE_RECOGNITION">人脸库</div> -->
            <div
              class="face-btn"
              @click="router.push('/system-layout/ai-service/face-database')"
              v-if="serviceItem.aiSrvId === ServiceEnum.FACE_RECOGNITION"
            >
              <i class="iconfont icon-a-facerecognition-scan-line"></i> 人脸库
            </div>
          </div>

          <div>
            <a-button
              type="text"
              class="reset-button"
              @click="onReset"
              :loading="resetLoading"
              v-auth="'ai-service-edit'"
            >
              <i class="iconfont icon-Icon-Wrapper"></i>默认设置
            </a-button>
            <a-button type="primary" @click="onSubmit" :loading="formLoading" v-auth="'ai-service-edit'">保存</a-button>
          </div>
        </div>
        <div class="service-form-container">
          <service-form ref="serviceFormRef" :loading="loading" :hasFaceAiSrv="hasFaceAiSrv" />
        </div>
      </div>
    </main>
    <no-algo-auth :text="'当前设备未进行算法授权，请授权后使用本功能'" v-if="!serviceAuth"></no-algo-auth>
    <g-no-save-confirm
      v-model:visible="noSaveConfirmObj.visible"
      :confirmFunObj="noSaveConfirmObj.funObj"
    ></g-no-save-confirm>
  </div>
</template>

<script setup lang="ts">
import { aiApi } from '@/services/api'
import { nextTick, onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useRequest } from 'vue-request'
import ServiceForm from './_components/service-form.vue'
import noAlgoAuth from '../_components/no-algo-auth.vue'
import { message } from '@/utils/antd.util'
import { onBeforeRouteLeave } from 'vue-router'
import { obj2str } from '@/utils/utils'
import { confirm } from '@/utils/antd.util'
import { cloneDeep } from 'g6-fn'
import { beforeRouteLeaveWhiteList } from '@/config'
import { ServiceEnum } from './config'

const hoverServiceId = ref()

const router = useRouter()

let cacheData: any = null

// 未保存，切换、离开提示
const noSaveConfirmObj = reactive({
  visible: false,
  funObj: {
    noSaveFun: () => {},
    saveFun: () => {},
    cancelFun: () => {},
  },
})

/**
 * 服务列表
 */
const activeIndex = ref<number>(0)
const { loading: serviceListLoading, runAsync: runGetAiList } = useRequest(aiApi.getAiList)
const serviceList = ref<any[]>([])
const serviceAuth = ref<boolean>(true)
const hasFaceAiSrv = ref<boolean>(false) // 是否有人脸检测
const getAiList = async () => {
  try {
    const { data } = await runGetAiList({})
    serviceAuth.value = true
    serviceList.value = data || []
    serviceList.value.length && onClickItem(data[activeIndex.value], activeIndex.value)
    hasFaceAiSrv.value =
      data.filter((item: { aiSrvId: ServiceEnum }) => item.aiSrvId === ServiceEnum.FACE_RECOGNITION).length > 0
  } catch (err: any) {
    hasFaceAiSrv.value = false
    if (err.data.code === -17) {
      serviceAuth.value = false
      return
    }
    serviceAuth.value = true
  }
}

onMounted(() => {
  getAiList()
})

/**
 * 服务状态
 */
const checked = ref(false)
const { runAsync: runUpdateAIStatus } = useRequest(aiApi.updateAIStatus)
const onSwitchChange = async (_checked: any, item: any) => {
  checked.value = _checked
  let title = checked.value ? '确认启用' : '是否确认停用AI服务?'
  let content = checked.value ? ' ' : '停用服务后将会停止该算法抓拍识别,请谨慎操作!'
  confirm({
    title: title,
    content: content,
    onOk: () => {
      update()
    },
  })
  const update = async () => {
    try {
      await runUpdateAIStatus(item.id, _checked ? 1 : 0)
      if (_checked) {
        message.success(`已开启【${item.aiSrvName}】算法服务`)
      } else {
        message.info(`已关闭【${item.aiSrvName}】算法服务`)
      }
      getAiList()
    } catch (error) {
      checked.value = !_checked
    }
  }
}

/**
 * 服务列表点击
 */
const serviceItem = ref<any>()
const { loading, runAsync: runGetByIdService } = useRequest<any, any>(aiApi.getByIdService)

const onClickItem = async (item: any, index: number) => {
  const formData = serviceFormRef.value?.getFormDataSync()
  if (obj2str(cacheData) !== obj2str(formData)) {
    // 保存并切换的方法
    const saveLeaveFun = async () => {
      await onSubmit()
      await run()
    }
    noSaveConfirmObj.funObj.noSaveFun = run
    noSaveConfirmObj.funObj.saveFun = saveLeaveFun
    noSaveConfirmObj.visible = true
  } else {
    run()
  }

  async function run() {
    checked.value = item.aiSrvStatus === 1
    serviceItem.value = item
    activeIndex.value = index
    const { data } = await runGetByIdService(item.id)
    cacheData = cloneDeep(data)
    nextTick(() => {
      serviceFormRef.value?.setFormData(data)
    })
  }
}

/**
 * 表单
 */
const serviceFormRef = ref<InstanceType<typeof ServiceForm>>()
const { loading: formLoading, runAsync: runUpdateAIRule } = useRequest(aiApi.updateAIRule)
const onSubmit = async () => {
  try {
    const res = await serviceFormRef.value?.getFormData()
    cacheData = cloneDeep(res)
    await runUpdateAIRule(res)
    serviceFormRef.value?.setFormData({ ...res } as any)
    message.success('操作成功')
  } catch (error) {
    console.error(error)
  }
}

/**
 * 恢复默认设置
 */
const { loading: resetLoading, runAsync: runResetAIRule } = useRequest(aiApi.resetAIRule)
const onReset = async () => {
  const { data } = await runResetAIRule(serviceItem.value.id)
  nextTick(() => {
    serviceFormRef.value?.setFormData(data)
  })
}

/**
 * ----------------------------------------------- 路由后置守卫 ---------------------------------------------
 */
onBeforeRouteLeave((to, _from, next) => {
  const formData = serviceFormRef.value?.getFormDataSync()
  if (obj2str(cacheData) !== obj2str(formData) && !beforeRouteLeaveWhiteList.includes(to.path)) {
    // 保存并离开页面
    const saveLeaveFun = async () => {
      await onSubmit()
      next()
    }
    noSaveConfirmObj.funObj.noSaveFun = next
    noSaveConfirmObj.funObj.saveFun = saveLeaveFun
    noSaveConfirmObj.visible = true
  } else {
    next()
  }
})
</script>

<style lang="less" scoped>
.ai-service-page {
  width: 100%;
  height: 100%;
  display: flex;
  user-select: none;
  border-radius: 8px;
  // background: rgba(46, 75, 120, 0.15);
  padding: 14px 16px;

  .ant-switch {
    width: 33px;
    min-width: 33px !important;
    line-height: 18px !important;
    height: 18px !important;

    .ant-switch-handle {
      height: 14px;
      width: 14px;
    }

    ::before {
      width: 16px;
      height: 16px;
      top: -1px;
      left: 0px;
    }
  }

  .ant-switch-checked {
    ::before {
      width: 16px;
      height: 16px;
      top: -1px;
      left: -3px;
    }

    .ant-switch-handle {
      // left: calc(100% - 16px) !important;
    }
  }

  .ai-service-page-aside {
    // width: 272px;
    height: 100%;
    background: rgba(46, 75, 120, 0.15);
    border-radius: 8px;
    box-shadow: @shadow-ss;
    padding: 10px 0;
    display: flex;
    flex-direction: column;

    .ai-service-page-aside-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 22px 12px 24px;

      h6 {
        font-size: 14px;
        font-weight: 700;
        line-height: 22px;
        display: flex;
        color: @text2;
      }

      .add-img {
        display: flex;
        height: 30px;
        padding: 4px 10px;
        justify-content: center;
        align-items: center;
        gap: 6px;
        border-radius: 8px;
        border: 1px solid @border3;
        background: #ffd587;
        box-shadow: @shadow-ss;
        color: #704f11;
        text-align: center;
        font-family: Noto Sans SC;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 22px;
        cursor: pointer;

        img {
          width: 16px;
          height: 16px;
        }
      }
    }

    .service-list {
      width: 252px;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px 0;
      padding: 0 16px;

      .service-list-item {
        flex-shrink: 0;
        height: 64px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 16px;
        cursor: pointer;
        border-radius: 10px;
        background: rgba(23, 104, 225, 0.05);
        &:hover {
          background: rgba(23, 104, 225, 0.15);
        }

        .status-text {
          color: rgba(255, 255, 255, 0.65);
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          border-radius: 14px;
          background: @mask2;
          line-height: 20px;
          padding: 4px 6px;

          &.active {
            color: @success;
            background: rgba(103, 205, 115, 0.2);
          }
        }

        .service-list-item-info {
          // display: flex;
          flex-direction: column;
          width: 120px;
          overflow: hidden; //超出部分隐藏
          white-space: nowrap; //不换行
          text-overflow: ellipsis !important; //文本溢出显示省略号
          font-size: 16px;
          color: @text1;
        }

        .service-list-item-status {
          font-size: 16px;
          transform: translateY(16px);

          .icon-a-AIservice-line {
            color: @text4;
          }

          .icon-prohibited-line {
            color: @text2;
          }
        }

        &:hover {
          border: none;
        }

        &.active {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 266, 0.25);
          background-image: linear-gradient(0deg, rgba(225, 237, 255, 0.1) 0%, rgba(225, 237, 255, 0.1) 100%),
            linear-gradient(180deg, #203a63 0%, #0e203d 100%), url('@/assets/images/AI/item-png.png');
          background-blend-mode: hard-light, lighten, luminosity;
          background-repeat: no-repeat;
          background-position: right;
          background-size: contain;

          .icon-a-AIservice-line {
            color: #ffffff;
          }
        }
      }
    }
  }

  .ai-service-page-main {
    flex: 1;
    height: 100%;
    background: rgba(46, 75, 120, 0.15);
    display: flex;
    flex-direction: column;
    padding: 10px 16px 14px 16px;

    header {
      height: 48px;
      padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      h6 {
        margin: 0;
        color: @text2;
        font-size: 14px;
        font-weight: 700;
        line-height: 22px;
      }

      > div {
        display: flex;
        align-items: center;
        gap: 0 8px;
        font-size: 14px;
        color: @text2;
      }
    }

    .form-wrap {
      flex: 1;
      overflow: hidden;
      border-radius: 8px;
      border: 1px solid @border3;
      background: @mask1;
      box-shadow: @shadow-ss;
      display: flex;
      flex-direction: column;

      .general-bar {
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: @background2;
        padding: 16px 20px;
        align-items: center;
        align-self: stretch;
        background-image: url('@/assets/images/AI/header.png');
        background-repeat: no-repeat;
        background-size: contain;

        .ai-name-title {
          > h6 {
            margin: 0;
            font-size: 14px;
            color: @text1;
          }
          .face-btn {
            font-size: 14px;
            height: 30px;
            color: @text1;
            padding: 4px 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 6px;
            border-radius: 8px;
            border: 1px solid #5f6f8e;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 100%);
            cursor: pointer;
            /* 淡阴影/淡SS */
            box-shadow: 0px 1px 2px 0px rgba(2, 36, 59, 0.03);
          }
        }

        > div {
          display: flex;
          align-items: center;
          gap: 0 8px;
        }

        .reset-button {
          color: @text2;
          margin-right: 8px;
        }

        .icon-Icon-Wrapper {
          color: @text2;
          margin-right: 6px;
        }
      }
    }

    .service-form-container {
      flex: 1;
      padding: 40px 100px;
      overflow: auto;
    }
  }
}
</style>
