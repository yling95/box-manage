<template>
  <div class="nvr-configuration-page">
    <div class="nvr-configuration-content">
      <div class="nvr-configuration-title">NVR设备配置</div>
      <div class="nvr-configuration-wrap">
        <div class="nvr-form-wrap">
          <a-form
            :model="nvrForm"
            name="nvr-form"
            ref="nvrFormRef"
            :rules="nvrFormRules"
            layout="vertical"
            @finish="nvrFormSubmit"
          >
            <a-form-item name="nvrIp" label="设备IP地址">
              <a-input v-model:value="nvrForm.nvrIp" placeholder="请输入" :maxlength="50" />
            </a-form-item>
            <a-form-item name="nvrPort" label="端口">
              <a-input v-model:value="nvrForm.nvrPort" :maxlength="5" placeholder="请输入" />
            </a-form-item>
            <a-form-item name="nvrUsername" label="设备登录账号">
              <a-input v-model:value.trim="nvrForm.nvrUsername" :maxlength="50" placeholder="请输入" />
            </a-form-item>
            <a-form-item name="nvrPassword" label="设备登录密码">
              <a-input-password
                autocomplete="new-password"
                placeholder="请输入"
                v-model:value.trim="nvrForm.nvrPassword"
                :maxlength="50"
                @keyup="nvrForm.nvrPassword = nvrForm.nvrPassword.replace(/\s+/g, '')"
              />
            </a-form-item>
            <a-form-item style="margin-top: 40px">
              <a-button type="primary" html-type="submit" :loading="formLoading" v-auth="'nvr-configuration-edit'"
                >保存</a-button
              >
            </a-form-item>
          </a-form>
        </div>
        <div class="nvr-status-wrap">
          <div class="nvr-status default" v-if="nvrForm.nvrConnStatus === 0">
            <img src="@/assets/images/public/icon-status-default.png" alt="" />
            <p>暂无状态</p>
          </div>
          <div class="nvr-status" v-else-if="nvrForm.nvrConnStatus === 1">
            <img class="loading" src="@/assets/images/alarm/loading.png" alt="" />
            <p>设备连接中..</p>
          </div>
          <div class="nvr-status success" v-else-if="nvrForm.nvrConnStatus === 2">
            <img src="@/assets/images/public/icon-status-success.png" alt="" />
            <p>设备连接成功</p>
          </div>
          <div class="nvr-status error" v-else-if="nvrForm.nvrConnStatus === 3">
            <img src="@/assets/images/public/icon-status-error.png" alt="" />
            <p>设备连接失败！</p>
            <div class="error-help">
              <p>处理方案：</p>
              <p>1、请检查设备IP地址以及账号密码是否正确</p>
              <p>2、请检查nvr设备是否离线</p>
              <p>3、请检查设备是否在同一局域网内</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <g-no-save-confirm
    v-model:visible="noSaveConfirmObj.visible"
    :confirmFunObj="noSaveConfirmObj.funObj"
  ></g-no-save-confirm>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { systemApi } from '@/services/api'
import { Rule } from 'ant-design-vue/es/form'
import { ipReg, numberAndLetterAndSymbolReg, portReg } from '@/utils/regular'
import { FormInstance } from 'ant-design-vue'
import { message } from '@/utils/antd.util'
import { useRequest } from 'vue-request'
import { onBeforeRouteLeave } from 'vue-router'
import { obj2str } from '@/utils/utils'
import { cloneDeep } from 'g6-fn'
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

/**
 * 保存平台接入配置
 */
interface MqttSetting {
  nvrIp: string
  nvrPort: string
  nvrUsername: string
  nvrPassword: string
  nvrConnStatus: number
}
const nvrForm = reactive<MqttSetting>({
  nvrIp: '',
  nvrPort: '',
  nvrUsername: '',
  nvrPassword: '',
  nvrConnStatus: 0,
})
const nvrFormRef = ref<FormInstance>()
const { loading: formLoading, runAsync: runPutMqttSetting } = useRequest(systemApi.updateNvr)
const nvrFormSubmit = async () => {
  try {
    await nvrFormRef.value?.validate()
    let config = {
      nvrIp: nvrForm.nvrIp,
      nvrPort: nvrForm.nvrPort,
      nvrUsername: nvrForm.nvrUsername,
      nvrPassword: nvrForm.nvrPassword,
    }
    nvrForm.nvrConnStatus = 1
    await runPutMqttSetting(config)
    cacheData = cloneDeep(nvrForm)
    getBoxForm()
    message.success('操作成功')
  } catch (error) {
    console.error(error)
    nvrForm.nvrConnStatus = 4
  }
}
const nvrFormRules: Record<string, Rule[]> = {
  nvrIp: [
    { required: true, message: '请输入ip地址', trigger: 'blur' },
    {
      pattern: ipReg,
      message: 'IPv4',
      trigger: 'blur',
    },
  ],
  nvrPort: [
    { required: true, message: '请输入端口', trigger: 'blur' },
    {
      pattern: portReg,
      message: '最多支持输入5个数字',
      trigger: 'blur',
    },
  ],
  nvrUsername: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    {
      pattern: numberAndLetterAndSymbolReg,
      message: '最多支持输入50位字符（数字、字母、字符(!@#$%^&\_+-*/)）',
      trigger: 'blur',
    },
  ],
  nvrPassword: [
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
const getBoxForm = async () => {
  try {
    const { data } = await runGetDomainSetting()
    Object.assign(nvrForm, {
      nvrPassword: data.nvrPassword,
      nvrPort: data.nvrPort,
      nvrIp: data.nvrIp,
      nvrUsername: data.nvrUsername,
      nvrConnStatus: data.nvrConnStatus,
    })
    cacheData = cloneDeep(nvrForm)
  } catch (error) {
    console.log('error', error)
  }
}

onMounted(() => {
  getBoxForm()
})

/**
 * ----------------------------------------------- 路由后置守卫 ---------------------------------------------
 */
onBeforeRouteLeave((to, _from, next) => {
  if (obj2str(cacheData) !== obj2str(nvrForm) && !beforeRouteLeaveWhiteList.includes(to.path)) {
    // 保存并离开页面
    const saveLeaveFun = async () => {
      await nvrFormSubmit()
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
.nvr-configuration-page {
  height: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding-top: 40px;

  .nvr-configuration-content {
    height: 100%;

    .nvr-configuration-title {
      font-weight: 700;
      font-size: 16px;
      line-height: 24px;
      color: @text1;
      position: relative;
      padding-left: 11px;
      display: flex;
      margin-bottom: 16px;

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

    .nvr-configuration-wrap {
      width: 100%;
      display: flex;
      gap: 0 32px;

      .nvr-form-wrap {
        width: 360px;
        border-radius: 4px;
        padding: 20px 20px 0px 20px;
        border-radius: 4px;
        border: 1px solid @border3;
        background: @background3;
        .ant-form-item {
          margin-bottom: 32px !important;
        }
      }

      .nvr-status-wrap {
        width: 404px;
        border-radius: 4px;
        border: 1px solid @mask2;
        background: @background3;
        display: flex;
        align-items: center;
        justify-content: center;

        .nvr-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          > img {
            width: 48px;
            height: 48px;
          }
          > p {
            color: @text2;
            font-size: 14px;
            font-weight: 400;
            line-height: 22px;
            margin-top: 4px;
          }

          &.default {
            > img {
              width: 80px;
              height: 80px;
            }
            > p {
              color: rgba(255, 255, 255, 0.45);
            }
          }

          &.error {
            > p {
              color: @danger;
            }
            .error-help {
              width: 266px;
              height: 104px;
              border-radius: 4px;
              background: @mask1;
              margin-top: 24px;
              color: @text3;
              font-size: 12px;
              font-weight: 400;
              line-height: 20px;
              padding: 8px 16px 16px;
            }
          }
        }
      }
    }
  }
}
</style>
