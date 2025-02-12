<template>
  <g-conf-module :show-page-tools="false">
    <template #Slot-Conf-Module-Header>
      <div class="g-second-page-title">
        <i class="iconfont icon-arrow-go-back-line" @click="$router.go(-1)"></i>
        <div class="title" style="color: white">平台接入</div>
      </div>
    </template>
    <template #Slot-Conf-Module-Content>
      <div class="the-platform-content">
        <div class="the-server-information">
          <div class="the-common-title">
            <div class="title">
              <div>平台接入（MQTT）</div>
              <a-switch
                :checked="mqttSetting.mqttEnabled"
                :loading="formLoading"
                @change="handleMqttSwitch"
                v-auth="'system-maintenance-platform-edit'"
              />
            </div>
            <div class="status" v-if="mqttSetting.mqttEnabled">
              <i v-if="!status" class="iconfont icon-link-unlink-m"></i>
              <i v-else class="iconfont icon-link-m"></i>
              {{ status ? '连接正常' : '连接异常' }}
            </div>
          </div>
          <div class="the-platform-access">
            <a-form
              :model="mqttSetting"
              name="platform-configuration"
              ref="mqttFormRef"
              :rules="mqttFormRules"
              layout="vertical"
              @finish="mqttSettingSubmit"
            >
              <a-form-item name="mqttUrl" label="地址">
                <a-input v-model:value="mqttSetting.mqttUrl" placeholder="请输入" />
              </a-form-item>
              <a-form-item name="mqttPort" label="端口">
                <a-input v-model:value="mqttSetting.mqttPort" :maxlength="5" placeholder="请输入" />
              </a-form-item>
              <a-form-item name="mqttUsername" label="账号">
                <a-input v-model:value.trim="mqttSetting.mqttUsername" :maxlength="50" placeholder="请输入" />
              </a-form-item>
              <a-form-item name="mqttPassword" label="密码">
                <a-input-password
                  autocomplete="new-password"
                  placeholder="请输入"
                  v-model:value.trim="mqttSetting.mqttPassword"
                  :maxlength="50"
                  @keyup="mqttSetting.mqttPassword = mqttSetting.mqttPassword.replace(/\s+/g, '')"
                />
              </a-form-item>
              <a-form-item style="margin-top: 40px">
                <a-button
                  type="primary"
                  html-type="submit"
                  :loading="formLoading"
                  v-auth="'system-maintenance-platform-edit'"
                  >保存</a-button
                >
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
    </template>
  </g-conf-module>

  <g-no-save-confirm
    v-model:visible="noSaveConfirmObj.visible"
    :confirmFunObj="noSaveConfirmObj.funObj"
  ></g-no-save-confirm>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, onUnmounted } from 'vue'
import { systemApi } from '@/services/api'
import { Rule } from 'ant-design-vue/es/form'
import { ipReg, portReg, numberAndLetterAndSymbolReg } from '@/utils/regular'
import { FormInstance } from 'ant-design-vue'
import { message } from '@/utils/antd.util'
import { useRequest } from 'vue-request'
import { onBeforeRouteLeave } from 'vue-router'
import { obj2str } from '@/utils/utils'
import { confirm } from '@/utils/antd.util'
import useSetInterval from '@/hooks/useSetInterval'
import { cloneDeep } from 'g6-fn'
import { useGlobalStore } from '@/store/global'
import { beforeRouteLeaveWhiteList } from '@/config'

let cacheData: any = null
// 未保存，离开弹窗提示
const noSaveConfirmObj = reactive({
  visible: false,
  funObj: {
    noSaveFun: () => {},
    saveFun: () => {},
    cancelFun: () => {},
  },
})

const globalStore = useGlobalStore()

/**
 * 保存平台接入配置
 */
interface MqttSetting {
  mqttEnabled: boolean
  mqttUrl: string
  mqttPort: string
  mqttUsername: string
  mqttPassword: string
}
const mqttSetting = reactive<MqttSetting>({
  mqttEnabled: false,
  mqttUrl: '',
  mqttPort: '',
  mqttUsername: '',
  mqttPassword: '',
})
const mqttFormRef = ref<FormInstance>()
const { loading: formLoading, runAsync: runPutMqttSetting } = useRequest(systemApi.putMqttSetting)
const mqttSettingSubmit = async () => {
  try {
    await mqttFormRef.value?.validate()
    let config = {
      mqttPassword: mqttSetting.mqttPassword,
      mqttPort: mqttSetting.mqttPort,
      mqttUrl: mqttSetting.mqttUrl,
      mqttUsername: mqttSetting.mqttUsername,
    }

    if (mqttSetting.mqttEnabled) {
      return confirm({
        title: '操作后系统将会重启，确认是否继续',
        onOk: async () => {
          await runPutMqttSetting(config)
          message.success('操作成功')
          globalStore.updateLoading(true, { tip: '系统重启中...请在10分钟左右后重新登陆' })
        },
      })
    }
    await runPutMqttSetting(config)
    cacheData = cloneDeep(mqttSetting)
    message.success('操作成功')
  } catch (error) {
    console.error(error)
  }
}
const mqttFormRules: Record<string, Rule[]> = {
  mqttUrl: [
    { required: true, message: '请输入ip地址', trigger: 'blur' },
    {
      pattern: ipReg,
      message: 'IPv4',
      trigger: 'blur',
    },
  ],
  mqttPort: [
    { required: true, message: '请输入端口', trigger: 'blur' },
    {
      pattern: portReg,
      message: '最多支持输入5个数字',
      trigger: 'blur',
    },
  ],
  mqttUsername: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    {
      pattern: numberAndLetterAndSymbolReg,
      message: '最多支持输入50位字符（数字、字母、字符(!@#$%^&\_+-*/)）',
      trigger: 'blur',
    },
  ],
  mqttPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: numberAndLetterAndSymbolReg,
      message: '最多支持输入50位字符（数字、字母、字符(!@#$%^&\_+-*/)）',
      trigger: 'blur',
    },
  ],
}

/**
 * 获取box网络配置
 */
const { runAsync: runGetDomainSetting } = useRequest(systemApi.getMqttSetting)
const { start, clear } = useSetInterval()
const getBoxForm = async () => {
  try {
    const { data } = await runGetDomainSetting()
    Object.assign(mqttSetting, {
      mqttEnabled: data.mqttEnabled ? true : false,
      mqttPassword: data.mqttPassword,
      mqttPort: data.mqttPort,
      mqttUrl: data.mqttUrl,
      mqttUsername: data.mqttUsername,
    })
    cacheData = cloneDeep(mqttSetting)
    if (data.mqttEnabled) {
      start(getMqttStatus, 1000 * 10, true)
    }
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * 开关Mqtt
 */
const { runAsync: runPutMqttStatus } = useRequest(systemApi.putMqttStatus)
const handleMqttSwitch = async (checked: any) => {
  // if (checked) {
  confirm({
    title: '操作后系统将会重启，确认是否继续',
    onOk: async () => {
      try {
        mqttSetting.mqttEnabled = checked
        await runPutMqttStatus(checked ? 1 : 0)
        message.success('操作成功')
        globalStore.updateLoading(true, { tip: '系统重启中...请在10分钟左右后重新登陆' })
        clear()
      } catch (error) {
        mqttSetting.mqttEnabled = !checked
        console.log('error', error)
      }
    },
  })
  // } else {
  //   try {
  //     mqttSetting.mqttEnabled = checked
  //     await runPutMqttStatus(checked ? 1 : 0)
  //     message.success('操作成功')
  //     clear()
  //   } catch (error) {
  //     mqttSetting.mqttEnabled = !checked
  //     console.log('error', error)
  //   }
  // }
}

/**
 * 获取Mqtt状态
 */
const status = ref(false)
const getMqttStatus = async () => {
  try {
    const { data } = await systemApi.getMqttStatus()
    status.value = data
  } catch (error) {
    console.log('error', error)
  }
}

onMounted(() => {
  getBoxForm()
})

onUnmounted(() => {
  clear()
})

/**
 * ----------------------------------------------- 路由后置守卫 ---------------------------------------------
 */
onBeforeRouteLeave((to, _from, next) => {
  if (obj2str(cacheData) !== obj2str(mqttSetting) && !beforeRouteLeaveWhiteList.includes(to.path)) {
    // 保存并离开页面
    const saveLeaveFun = async () => {
      await mqttSettingSubmit()
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
.the-platform-content {
  padding-top: 40px;
  display: flex;
  justify-content: center;
  height: 100%;

  .the-common-title {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    color: @text1;
    position: relative;
    padding-left: 11px;
    display: flex;

    .title {
      display: flex;
      align-items: center;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      font-size: 14px;
      font-weight: 400;
      .icon-link-unlink-m {
        color: @danger;
      }
      .icon-link-m {
        color: @success;
      }
    }

    &::before {
      content: '';
      position: absolute;
      top: 3px;
      left: 0;
      width: 3px;
      height: 18px;
      border-radius: 2px;
      background: @primary2;
    }
  }

  .the-server-information {
    width: 360px;
    height: 100%;

    .the-platform-access {
      margin-top: 16px;
      width: 360px;
      border-radius: 4px;
      padding: 20px 20px 0px 20px;
      border-radius: 4px;
      border: 1px solid @border3;
      background: @background3;
      .ant-row {
        margin-bottom: 40px !important;
      }
    }
  }
}
</style>
