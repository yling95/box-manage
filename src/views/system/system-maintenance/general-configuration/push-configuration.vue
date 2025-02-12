<template>
  <g-conf-module :show-page-tools="false">
    <template #Slot-Conf-Module-Header>
      <div class="g-second-page-title">
        <i class="iconfont icon-arrow-go-back-line" @click="$router.go(-1)"></i>
        <div class="title" style="color: white">推送配置</div>
      </div>
    </template>
    <template #Slot-Conf-Module-Content>
      <div class="push-configuration-page">
        <aside class="push-configuration-page-aside">
          <ul class="aside-main-list">
            <a-spin v-if="pushListLoading" />
            <template v-else>
              <!-- <a-empty v-if="taskList?.length === 0" :image="Empty.PRESENTED_IMAGE_SIMPLE" /> -->
              <li
                class="aside-main-list-item"
                v-for="(item, index) in taskList"
                @click="onClickItem(item, index)"
                :class="[index === activeIndex && 'active']"
                :key="item.id"
              >
                <p>{{ item.taskName }}</p>
                <div class="aside-main-list-item-operation"></div>
                <div v-auth="'system-maintenance-push-edit'">
                  <a-switch :checked="item.status" @change="onSwitchChange($event, item.id)" />
                </div>
              </li>
              <a-button
                class="alone-icon-button add-button"
                v-auth="'system-maintenance-push-add'"
                @click.stop="handleAddTask"
              >
                <i class="iconfont icon-add-line">&nbsp;新增</i>
              </a-button>
            </template>
          </ul>
        </aside>
        <main class="push-configuration-page-main">
          <g-empty :empty="taskList?.length === 0">
            <template #empty>
              <div class="empty">
                <img :src="simpleImage" alt="" />
                <span>无数据</span>
              </div>
            </template>
            <div class="form-wrap" v-if="taskList?.length || formType === 'add'">
              <a-form ref="pushFormRef" layout="vertical" :model="pushForm" :rules="pushFormRules">
                <div class="form-container">
                  <a-form-item label="任务名称" name="taskName">
                    <a-input
                      placeholder="请输入"
                      v-model:value="pushForm.taskName"
                      :maxlength="15"
                      :disabled="inputdisabled"
                    />
                  </a-form-item>
                  <a-form-item label="推送方式" name="pushMethod">
                    <a-radio-group
                      v-model:value="pushForm.pushMethod"
                      @change="onPushMethodChange"
                      :disabled="inputdisabled"
                    >
                      <a-radio :value="1">http/https</a-radio>
                      <!-- <a-radio :value="2">websocket</a-radio> -->
                    </a-radio-group>
                  </a-form-item>
                  <a-form-item
                    label="推送地址"
                    name="pushUrl"
                    :rules="[
                      {
                        required: true,
                        message: '请输入推送地址',
                        trigger: 'blur',
                      },
                      {
                        pattern: pattern,
                        message: '请输入正确的推送地址',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <a-input placeholder="请输入" v-model:value="pushForm.pushUrl" :disabled="inputdisabled" />
                  </a-form-item>
                  <a-form-item label="数据维度" name="dataType">
                    <a-radio-group
                      v-model:value="pushForm.dataType"
                      @change="onDataDimensionChange"
                      :disabled="inputdisabled"
                    >
                      <a-radio :value="1">全部</a-radio>
                      <a-radio :value="2">设备</a-radio>
                      <a-radio :value="3">AI服务</a-radio>
                    </a-radio-group>
                  </a-form-item>

                  <a-form-item v-if="pushForm.dataType !== 1">
                    <div style="width: 636px">
                      <checkbox-tree
                        v-model:value="pushForm.selectIds"
                        :parent-title="parentTitle"
                        :child-title="childTitle"
                        :options="options"
                        :isdisable="inputdisabled"
                      />
                    </div>
                  </a-form-item>
                </div>
                <a-form-item>
                  <a-button
                    type="primary"
                    html-type="submit"
                    v-auth="'system-maintenance-push-edit'"
                    :loading="addPushLoading || updatePushLoading"
                    @click="onSubmit"
                    >{{ inputdisabled ? '编辑' : '保存' }}</a-button
                  >
                  <a-button
                    html-type="submit"
                    style="margin-left: 10px"
                    v-auth="'system-maintenance-push-edit'"
                    :loading="delLoading"
                    @click="handleDeleteTask"
                  >
                    {{ inputdisabled ? '删除' : '取消' }}
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
          </g-empty>
        </main>
      </div>
    </template>
  </g-conf-module>
  <push-modal ref="pushModalRef" @on-submit="onAddSubmit"></push-modal>
  <g-no-save-confirm
    v-model:visible="noSaveConfirmObj.visible"
    :confirmFunObj="noSaveConfirmObj.funObj"
  ></g-no-save-confirm>
</template>

<script setup lang="ts">
import { urlReg, websocketReg } from '@/utils/regular'
import { FormInstance, RadioChangeEvent } from 'ant-design-vue'
import { message } from '@/utils/antd.util'
import { Rule } from 'ant-design-vue/es/form'
import { onMounted, reactive, ref, nextTick } from 'vue'
import CheckboxTree from '../_components/checkbox-tree.vue'
import { confirm } from '@/utils/antd.util'
import { useRequest } from 'vue-request'
import { systemApi } from '@/services/api'
import { obj2str } from '@/utils/utils'
import { onBeforeRouteLeave } from 'vue-router'
import { beforeRouteLeaveWhiteList } from '@/config'
import PushModal from '../_components/push-modal.vue'
import simpleImage from '@/assets/images/alarm/icon_list_empty.png'

const inputdisabled = ref(true)
const activeIndex = ref(0)
type FormType = 'add' | 'edit'
// 未保存，离开、切换弹窗提示
const noSaveConfirmObj = reactive({
  visible: false,
  funObj: {
    noSaveFun: () => {},
    saveFun: () => {},
    cancelFun: () => {},
  },
})
const formType = ref<FormType>('edit')
const {
  loading: pushListLoading,
  data: taskList,
  runAsync: runGetPushList,
} = useRequest<any, any>(systemApi.getPushList, {
  onSuccess: (res) => {
    taskList.value = res.data
  },
})
onMounted(async () => {
  await runGetPushList()
  onClickItem(taskList.value[activeIndex.value], activeIndex.value)
})

const delData = ref<any>()
const status = ref(false)
let cacheData: any = null
// 点击任务列表
const onClickItem = (item: any, index: number) => {
  inputdisabled.value = true
  delData.value = item
  if (cacheData && obj2str(cacheData) !== obj2str(pushForm)) {
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

  function run() {
    if (!item) {
      return (cacheData = { ...pushForm })
    }
    pushFormRef.value?.clearValidate()
    document.querySelector('.form-wrap')?.scrollTo(0, 0)
    formType.value = 'edit'
    activeIndex.value = index
    Object.assign(pushForm, { ...item, selectIds: item.selectIds || [] })
    status.value = item.status
    options.value = item.dataVOS || []
    if (item.pushMethod === 1) {
      pattern.value = urlReg
    } else {
      pattern.value = websocketReg
    }
    cacheData = { ...pushForm }
  }
}

// 删除任务
const { loading: delLoading, runAsync: runDeletePush } = useRequest(systemApi.deletePush)
const handleDeleteTask = () => {
  if (!inputdisabled.value) {
    inputdisabled.value = true
    Object.assign(pushForm, { ...cacheData })
    changeDimension(pushForm.dataType)
    return
  }
  confirm({
    title: `确认是否删除推送任务：${delData.value.taskName}`,
    onOk: async () => {
      let res: any = await runDeletePush(delData.value.id)
      if (res.code === 0) {
        message.success('删除成功')
        await runGetPushList()
        onClickItem(taskList.value[0], 0)
      }
    },
  })
}

// 添加任务
const pushModalRef = ref<InstanceType<typeof PushModal>>()
const handleAddTask = () => {
  nextTick(() => {
    pushModalRef.value?.openModal(`推送任务${taskList.value.length + 1}`)
  })
}
const onAddSubmit = async () => {
  await runGetPushList()
  onClickItem(taskList.value[activeIndex.value], activeIndex.value)
}
/**
 * 服务启停
 */
const onSwitchChange = async (checked: any, id: number) => {
  status.value = checked
  try {
    let res: any = await systemApi.updatePushStatus(id, checked)
    if (res.code === 0) {
      await runGetPushList()
      message.success('操作成功')
    }
  } catch (error) {
    status.value = !checked
  }
}

/**
 * 推送配置
 */
interface PushForm {
  id?: number
  status?: boolean
  taskName: string
  pushMethod: number
  pushUrl: string
  dataType: number
  selectIds?: any[]
}
const pushFormRef = ref<FormInstance>()
const pushForm = reactive<PushForm>({
  taskName: '',
  pushMethod: 1, // 1：http ,https 2.ws
  pushUrl: 'https://',
  dataType: 1, // 1:全部 2：设备 3：ai服务
  selectIds: [],
})
const pattern = ref<RegExp>(urlReg)
const pushFormRules: Record<string, Rule[]> = {
  taskName: [
    {
      required: true,
      message: '请输入任务名称',
      trigger: 'blur',
    },
  ],
  pushMethod: [
    {
      required: true,
      message: '请选择推送方式',
      trigger: 'blur',
    },
  ],
  dataType: [
    {
      required: true,
      message: '请选择数据维度',
      trigger: 'blur',
    },
  ],
}
const { loading: addPushLoading, runAsync: runAddPush } = useRequest(systemApi.addPush)
const { loading: updatePushLoading, runAsync: runUpdatePush } = useRequest(systemApi.updatePush)
const onSubmit = async () => {
  await pushFormRef.value?.validate()
  if (inputdisabled.value) {
    inputdisabled.value = false
  } else {
    try {
      if (formType.value === 'add') {
        await runAddPush(pushForm)
      } else {
        await runUpdatePush(pushForm)
      }
      inputdisabled.value = true
      await runGetPushList()
      message.success('操作成功')
      const index = taskList.value.length - 1
      cacheData = { ...pushForm }
      formType.value === 'add' && onClickItem(taskList.value[index], index)
    } catch (error) {
      console.error(error)
    }
  }
}

/**
 * 数据维度变化
 */
const options = ref<any[]>([])
const parentTitle = ref<string>('设备')
const childTitle = ref<string>('AI服务')
const onDataDimensionChange = (e: RadioChangeEvent) => {
  const value = e.target.value
  pushForm.selectIds = []
  changeDimension(value)
}

const changeDimension = (value: number) => {
  if (value === 2) {
    parentTitle.value = '设备'
    childTitle.value = 'AI服务'
    runGetEquipmentList()
  } else if (value === 3) {
    parentTitle.value = 'AI服务'
    childTitle.value = '设备'
    runGetAiList()
  }
}

/**
 * 推送地址变化
 */
const onPushMethodChange = (e: RadioChangeEvent) => {
  if (e.target.value === 1) {
    pattern.value = urlReg
    pushForm.pushUrl = 'https://'
  } else {
    pattern.value = websocketReg
    pushForm.pushUrl = 'ws://'
  }
}

/**
 * 设备列表
 */
const { runAsync: runGetEquipmentList } = useRequest(systemApi.getEquipmentList, {
  onSuccess: (res) => {
    options.value = res.data
  },
})

/**
 * 服务列表
 */
const { runAsync: runGetAiList } = useRequest(systemApi.getAiList, {
  onSuccess: (res) => {
    options.value = res.data
  },
})

/**
 * ----------------------------------------------- 路由后置守卫 ---------------------------------------------
 */
onBeforeRouteLeave((to, _from, next) => {
  if (obj2str(cacheData) !== obj2str(pushForm) && !beforeRouteLeaveWhiteList.includes(to.path)) {
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
<style lang="less">
.ant-modal-body {
  .ant-modal-confirm-body-wrapper {
    .ant-modal-confirm-body {
      .ant-modal-confirm-content {
        color: @text1 !important;
        font-size: 14px;
        line-height: 22px;
      }
    }
  }
}
</style>
<style lang="less" scoped>
.push-configuration-page {
  height: 100%;
  display: flex;
  padding: 40px 0 0;
  justify-content: center;
  .push-configuration-page-aside {
    height: 100%;
    width: 316px;
    // background: @background2;
    // border: 1px solid @border1;
    border-left: none;
    // padding: 10px 0;
    display: flex;
    flex-direction: column;
    header {
      height: 36px;
      margin-bottom: 18px;
      padding: 0 16px;
      > h6 {
        font-weight: 700;
        font-size: 14px;
        color: @text2;
      }

      display: flex;
      align-items: center;
      justify-content: space-between;
      .icon-add-line {
        width: 25px;
      }
    }
    .aside-main-list {
      // padding: 0 16px;
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 8px 0;
      .add-button {
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.08);
        display: flex;
        height: 64px;
        padding: 20px 12px 20px 20px;
        justify-content: center;
        align-items: center;
        gap: 6px;
        align-self: stretch;
        border: 0;
        color: @primary2;
        text-align: center;
        font-size: 14px;
      }
      .aside-main-list-item {
        flex-shrink: 0;
        height: 64px;
        width: 316px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: @text2;
        padding: 20px 12px 20px 20px;
        cursor: pointer;
        border-radius: 10px;
        background: rgba(23, 104, 225, 0.05);
        > p {
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        > div {
          white-space: nowrap;
        }

        .aside-main-list-item-operation {
          display: none;
          gap: 0 6px;

          i {
            width: 26px;
            color: @text3;
          }
          .icon-add-line {
            color: #000000;
          }
        }

        span {
          color: @text3;
        }

        &:hover {
          background: @mask1;
          background: rgba(23, 104, 225, 0.05);
        }
        &.active {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 266, 0.25);
          background-image: linear-gradient(0deg, rgba(225, 237, 255, 0.1) 0%, rgba(225, 237, 255, 0.1) 100%),
            linear-gradient(180deg, #203a63 0%, #0e203d 100%), url('@/assets/images/AI/item-png.png');
          background-blend-mode: exclusion;
          background-repeat: no-repeat;
          background-position: right;
          background-size: contain;
        }
      }
    }
  }
  .push-configuration-page-main {
    border-radius: 4px;
    // border: 1px solid @mask2;
    // background: @background3;
    display: flex;
    flex-direction: column;
    margin-left: 32px;
    width: 678px;
    header {
      height: 56px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid @border1;
      flex-shrink: 0;
      h6 {
        margin: 0;
        color: @text1;
        font-size: 16px;
        font-weight: 700;
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
      height: 100%;
      // padding: 12px 20px 24px;
      overflow: auto;

      input {
        width: 216px;
      }
      .form-container {
        width: 100%;
        padding: 12px 20px 24px;
        border-radius: 4px;
        border: 1px solid @mask2;
        background: @background3;
        margin-bottom: 24px;
      }
      .ant-form-vertical {
        :deep(.ant-form-item-label) {
          label {
            color: @text3 !important;
          }
        }
      }
    }

    .empty {
      width: 673px;
      height: 613px;
      border-radius: 4px;
      border: 1px solid @mask2;
      background: #202c40;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: rgba(255, 255, 255, 0.45);
      text-align: center;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      > img {
        width: 80px;
        height: 80px;
      }
    }
  }
}
</style>
