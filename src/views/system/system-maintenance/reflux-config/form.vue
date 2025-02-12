<template>
  <div class="local-detection-page">
    <div class="local-detection-form-wrap">
      <header>
        <div class="g-second-page-title">
          <i class="iconfont icon-arrow-go-back-line" @click="$router.go(-1)"></i>
          <div class="title">{{ taskId ? '编辑配置' : '新增配置' }}</div>
        </div>
      </header>
      <main>
        <a-spin :spinning="pageLoading">
          <div class="form-main">
            <div class="form-box">
              <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                <a-form-item style="margin-bottom: 32px" label-align="left" name="configName" label="配置名称">
                  <a-input
                    v-model:value.trim="formData.configName"
                    style="width: 320px"
                    :maxlength="10"
                    placeholder="请输入"
                    @keypress="handleKeyPress"
                  ></a-input>
                </a-form-item>

                <a-form-item style="margin-bottom: 32px" label-align="left" name="deviceIds" label="回流设备">
                  <a-cascader
                    :value="formData.deviceIds"
                    multiple
                    show-search
                    :get-popup-container="(e: any) => e.parentNode"
                    style="width: 320px"
                    :options="deviceOptions"
                    max-tag-count="responsive"
                    expand-trigger="hover"
                    :style="{ height: 'auto !important' }"
                    placeholder="请选择"
                    allow-clear
                    :showCheckedStrategy="'SHOW_CHILD'"
                    show-arrow
                    @change="changeDeviceList"
                  ></a-cascader>
                </a-form-item>

                <a-form-item style="margin-bottom: 32px" label-align="left" name="model" label="检测范围">
                  <a-radio-group v-model:value="formData.model" :options="refluxStrategyOptions" />
                </a-form-item>

                <a-form-item
                  style="margin-bottom: 32px"
                  label-align="left"
                  name="aiSrvTypes"
                  label="回流算法"
                  v-if="formData.model === 0"
                  :rules="[
                    {
                      required: formData.model === 0,
                      message: '请选择回流算法',
                      trigger: 'change',
                    },
                  ]"
                >
                  <a-select
                    :loading="aiListLoading"
                    v-model:value="formData.aiSrvTypes"
                    placeholder="AI服务"
                    :options="aiList"
                    :get-popup-container="(e: any) => e.parentNode"
                    allow-clear
                    style="width: 320px"
                    :showSearch="false"
                    showArrow
                    mode="multiple"
                  >
                  </a-select>
                </a-form-item>

                <a-form-item
                  style="margin-bottom: 32px"
                  label-align="left"
                  name="alarmTimer"
                  v-if="formData.model === 0"
                  :rules="[
                    {
                      required: formData.model === 0,
                      message: '请输入报警视频时段（秒）',
                      trigger: 'change',
                    },
                  ]"
                >
                  <template #label>
                    报警视频时段（秒）
                    <a-tooltip placement="top" title="按照配置时间录制报警前后时段内的视频数值范围:1~30">
                      <i class="iconfont icon-information-line"></i>
                    </a-tooltip>
                  </template>
                  <a-input-number
                    v-model:value="formData.alarmTimer"
                    :precision="0"
                    :min="1"
                    :max="30"
                    type="number"
                    :style="{
                      backgroundColor: 'transparent !important',
                      borderColor: 'rgba(240, 246, 252, 0.1) ',
                      width: '104px',
                    }"
                    :maxlength="10"
                    placeholder="请输入"
                  ></a-input-number>
                  <span class="unit">秒 </span>
                </a-form-item>

                <a-form-item
                  style="margin-bottom: 32px"
                  label-align="left"
                  name="maxShort"
                  v-if="formData.model === 1"
                  :rules="[{ required: formData.model === 1, message: '请输入最大分片时长', trigger: 'change' }]"
                >
                  <template #label>
                    最大分片时长
                    <a-tooltip placement="top" title="数值范围:1~60，默认值:30">
                      <i class="iconfont icon-information-line"></i>
                    </a-tooltip>
                  </template>
                  <a-input-number
                    v-model:value="formData.maxShort"
                    :precision="0"
                    :min="1"
                    :max="60"
                    type="number"
                    :style="{
                      backgroundColor: 'transparent !important',
                      borderColor: 'rgba(240, 246, 252, 0.1) ',
                      width: '104px',
                    }"
                    :maxlength="10"
                    placeholder="请输入"
                  ></a-input-number>
                  <span class="unit">分钟</span>
                </a-form-item>

                <a-form-item style="margin-bottom: 32px" label-align="left" name="validCycleTime" label="采集时间">
                  <g-select-time ref="selectTimeRef" v-model:axis-list="formData.validCycleTime"></g-select-time>
                </a-form-item>
              </a-form>
            </div>
            <div class="button-list">
              <a-button type="primary" class="submit-btn" :disabled="loading" :loading="loading" @click="saveForm">
                确定
              </a-button>
              <a-button class="submit-btn" @click="router.go(-1)"> 取消 </a-button>
            </div>
          </div>
        </a-spin>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Rule } from 'ant-design-vue/es/form'
import { cloneDeep } from 'g6-fn'
import { message } from 'ant-design-vue'
import { useRequest } from 'vue-request'
import { aiApi, reflowApi } from '@/services/api'
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const pageLoading = ref(false)
const selectTimeRef = ref<any>() // 时间段ref
const formRef = ref()

const taskId = route.query.id

const formData = reactive({
  status: 1,
  configName: '',
  maxShort: 30,
  alarmTimer: 5,
  deviceIds: [],
  model: 0,
  validCycleTime: [],
  aiSrvTypes: [],
  states: 1, // 创建初始状态
})
const formRules: Record<string, Rule[]> = {
  configName: [{ required: true, message: '请输入配置名称', trigger: 'change' }],
  deviceIds: [{ required: true, message: '请选择回流设备', trigger: 'change' }],
  model: [{ required: true, message: '请选择回流策略', trigger: 'change' }],
  validCycleTime: [{ required: true, message: '请选择采集时间', trigger: 'change' }],
}

const refluxStrategyOptions = reactive([
  {
    value: 0,
    label: '算法报警回流',
  },
  {
    value: 1,
    label: '录像回流',
  },
])
const deviceOptions = ref([])

const deviceInfoList = ref<any[]>([])
// 递归筛选
const findObjectById = (data: any, id: string): any => {
  for (let i = 0; i < data.length; i++) {
    const obj = data[i]
    if (obj.value === id) {
      return obj
    }

    if (obj.children && obj.children.length > 0) {
      const result = findObjectById(obj.children, id)
      if (result) {
        return result
      }
    }
  }
  return null
}

const handleKeyPress = (event: { key: string; preventDefault: () => void }) => {
  if (event.key === ' ') {
    event.preventDefault() // 阻止默认行为
  }
}
// 摄像头
const changeDeviceList = (value: any): void => {
  deviceInfoList.value = []
  value.forEach((item: any) => {
    const re = findObjectById(deviceOptions.value, item[item.length - 1])

    // 选中盒子时将所有子项的deviceId获取到
    if (re?.children) {
      re.children.forEach((itemChild: any) => {
        if (itemChild.disable === 0) {
          deviceInfoList.value.push(itemChild)
        }
      })
    } else {
      // 选中子项时直接把deviceId获取到
      deviceInfoList.value.push(re)
    }
  })
  if (deviceInfoList.value.length > 5) {
    message.error('回流设备不能超过5个')
    changeDeviceList(formData.deviceIds)
    throw new Error('回流设备不能超过5个')
  }
  formData.deviceIds = value
}

// 删除无效id
const delInvalidId = (treeData: any, deviceId: any): any => {
  const newList = [...new Set(deviceId.flat())]
  let deviceIds = deviceId
  const getTreeById = (treeData: any, key: any): any => {
    for (let i = 0; i < treeData.length; i++) {
      if (treeData[i].value === key) {
        return false // 找到了目标节点，返回节点信息
      }
      if (treeData[i].children && treeData[i].children.length > 0) {
        const result = getTreeById(treeData[i].children, key) // 递归查找
        if (!result) {
          return false // 如果在子节点中找到了目标节点，返回结果
        }
      }
    }

    return key // 遍历完当前节点和子节点都没有找到目标节点，返回null
  }

  // 删除不存在的id数组
  const delNotIdArry = (): any => {
    newList.forEach((key) => {
      console.log('最终结果', getTreeById(treeData, key))

      if (getTreeById(treeData, key)) {
        let delKey = getTreeById(treeData, key)
        let del = deviceIds.findIndex((item: any) => item[0] === delKey || item[1] === delKey)
        deviceIds.splice(del, 1)
      }
    })
    return deviceIds
  }

  return delNotIdArry()
}

const findParentIds = (id: string, data: any[]) => {
  const parentIds: any = []

  const findParentRecursive = (node: any) => {
    if (node.value === id) {
      parentIds.unshift(node.value) // 将当前节点id添加到数组的开头
      return true
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (findParentRecursive(child)) {
          parentIds.unshift(node.value) // 将当前节点id添加到数组的开头
          return true
        }
      }
    }

    return false
  }

  for (const tree of data) {
    findParentRecursive(tree)
  }

  return parentIds
}

const noDisableDevice = (idList: any[], nodes: any[]) => {
  const flattenedIds = Array.from(new Set(idList.flat()))
  nodes.forEach((node) => {
    if (flattenedIds.includes(node.value)) {
      node.disable = 0
      if (node.children && node.children.length > 0) {
        noDisableDevice(flattenedIds, node.children)
      }
    }
  })
}

const updateParentDisable = (node: { children: any[]; disabled: boolean; type: number; disable: number }) => {
  if (node.disable === 1 && !node.children) {
    node.disabled = true
    return true
  }

  if (!node.children || node.children.length === 0) {
    let isTrue = node.disable === 1 ? true : false
    node.disabled = isTrue
    return isTrue
  }

  const childDisabledStates = node.children.map((child) => {
    return updateParentDisable(child)
  })

  const allChildrenDisabled = childDisabledStates.every((disabled) => {
    return disabled
  })

  if (allChildrenDisabled) {
    node.disabled = true
  }

  return node.disabled
}

// 详情处理回显已选设备
const detailDeviceIds = ref([])
const detailDeviceOperation = () => {
  let deviceIds = detailDeviceIds.value
  // 1、 去掉设备列表没有的id
  deviceIds = !deviceIds ? undefined : delInvalidId(deviceOptions.value, deviceIds)
  // 2、组装回显设备的数据格式 例如：[[1,1-1,1-1-2], [2,2-1,2-1-2]]
  deviceIds.forEach((item: any, index: number, arr: any[]) => {
    arr[index] = findParentIds(item, deviceOptions.value)
  })
  formData['deviceIds'] = deviceIds
  // 3、回显选择后的设备
  changeDeviceList(formData['deviceIds'])
  // 4、 选择的设备从数据列表里面  将禁用变成可选
  noDisableDevice(formData['deviceIds'], deviceOptions.value)
}

// 获取详情
const getConfigDetail = async () => {
  let { data } = await reflowApi.getReflowDetail(route.query.id as string)

  Object.keys(formData).forEach((key: number | string) => {
    if (key in data) {
      ;(formData as any)[key] = data[key]
    }
    if (key === 'deviceIds') {
      detailDeviceIds.value = data.deviceIds
    }
  })

  selectTimeRef.value?.setAxisList(formData.validCycleTime)
}

const getVideoDeviceTree = async () => {
  const { data } = await reflowApi.getDeviceOptions()
  console.log('设备数据', data)

  deviceOptions.value = data
  if (route.query.id) {
    detailDeviceOperation()
  }

  // 找到所有子节点都是disable = true的节点，然后将它们的父节点也设置为disable = true
  data.forEach((tree: any) => {
    updateParentDisable(tree)
  })
  deviceOptions.value = data
}

// AI服务列表
const { loading: aiListLoading, data: aiList } = useRequest<any, any>(aiApi.getAiList, {
  manual: false,
  onSuccess: ({ data }) => {
    aiList.value = data?.map((item: any) => ({
      label: item.aiSrvName,
      value: item.aiSrvId,
    }))
  },
})

const saveForm = () => {
  formRef.value
    .validate()
    .then(async () => {
      let params = cloneDeep(formData)
      params.deviceNameStr = deviceInfoList.value.map((item: any) => item.label).toString()
      params.deviceIds = deviceInfoList.value.map((item: any) => item.value)
      params.deviceSize = params.deviceIds.length

      if (loading.value) {
        return
      }
      loading.value = true
      let res: any
      try {
        if (route.query.id) {
          let modifyIdObj = {
            id: route.query.id,
          }
          const mergeParams = Object.assign({}, modifyIdObj, params)
          res = await reflowApi.updateReflow(mergeParams)
        } else {
          res = await reflowApi.savReflow(params)
        }
        loading.value = false
        if (res.code === 0) {
          message.success('保存成功')
          router.go(-1)
        }
      } catch (err: any) {
        loading.value = false
        if (err?.data.code === -27) {
          selectTimeRef.value?.setAxisList(formData.validCycleTime, err.data.data)
        }
      }
    })
    .catch((err: any) => {
      console.log('err', err)
    })
}

onMounted(async () => {
  pageLoading.value = true
  if (route.query.id) {
    await getConfigDetail()
  }
  await getVideoDeviceTree()
  pageLoading.value = false
})
</script>

<style lang="less" scoped>
.local-detection-page {
  width: 100%;
  height: 100%;
  padding: 14px 16px;
  .local-detection-form-wrap {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: rgba(46, 75, 120, 0.15);
    display: flex;
    flex-direction: column;
    position: relative;

    header {
      width: 100%;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      gap: 0 12px;
      padding: 22px 40px 16px;
      border-bottom: 1px solid @border2;
      height: 75px;
      box-shadow: 0px 1px 2px 0px rgba(2, 36, 59, 0.03);

      > p {
        font-size: 22px;
        font-weight: 700;
        line-height: 32px;
        color: @text2;
      }
    }
    main {
      overflow: auto;
      height: calc(100% - 75px);

      .form-main {
        margin: 0 auto;
        padding: 56px 0 120px 0;
        display: flex;
        width: 784px;
        flex-direction: column;

        .form-box {
          .unit {
            display: inline-block;
            margin-left: 4px;
            color: @text2;
          }
          .iconfont {
            color: @text4;
          }
          // 禁用项背景色
          .ant-input-disabled {
            background: @mask2 !important;

            &:focus-visible {
              border: transparent !important;
            }
          }

          .ant-form-item-control-input {
            input {
              height: 36px !important;
            }
          }
        }

        .button-list {
          display: flex;
          gap: 0 8px;
          padding-top: 32px;
        }
      }
    }
  }
}
</style>
