<template>
  <div class="login-page">
    <video class="video-background" src="@/assets/video/login.mp4" autoplay muted loop></video>
    <div class="login-main">
      <!-- 登录 -->
      <div class="form-container">
        <header class="header">
          <div class="logo">
            <img :src="systemInfo?.logo" alt="" />
            <h2>{{ systemInfo?.systemName }}</h2>
          </div>
          <p>欢迎使用！请输入你的账户信息。</p>
        </header>
        <a-form
          :model="formState"
          ref="loginFormRef"
          class="form"
          layout="vertical"
          :rules="rules"
          @finish="onLoginFinish"
        >
          <a-form-item class="hide-required" name="account">
            <a-input
              size="large"
              :maxlength="32"
              placeholder="输入账号"
              v-model:value.trim="formState.account"
              class="login-input"
            >
              <template #prefix>
                <i class="iconfont icon-user-line"></i>
              </template>
            </a-input>
          </a-form-item>
          <div style="height: 8px"></div>
          <a-form-item class="hide-required" name="password">
            <a-input-password
              :maxlength="32"
              size="large"
              placeholder="输入密码"
              v-model:value.trim="formState.password"
              autocomplete="off"
              class="login-input password-input"
            >
              <template #prefix><i class="iconfont icon-lock-line"></i></template>
            </a-input-password>
          </a-form-item>
          <a-form-item name="remember">
            <a-checkbox v-model:checked="formState.remember">记住密码</a-checkbox>
          </a-form-item>
          <a-form-item class="form-item-submit">
            <a-button class="submit-button" type="primary" html-type="submit" block size="large" :loading="loading">
              立即登录
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>

  <!-- 重置密码弹窗 -->
  <g-modal
    title="重置密码"
    v-model:visible="secretKeyVisible"
    :ok-button-props="{
      loading: resetAdminPassword,
    }"
    ok-text="确认"
    @ok="onSubmit"
  >
    <div class="modal-hint-info">
      <i class="iconfont icon-error-warning-fill"></i>
      <div>
        <p>{{ resetMessage || '' }}</p>
        <p style="margin-top: 8px">
          <span>当前时间：{{ resetModalInfo?.nowTime || '' }}</span>
        </p>
      </div>
    </div>
    <a-form
      :model="secretKeyForm"
      ref="secretKeyFormRef"
      :rules="secretKeyFormRules"
      class="modal-form"
      layout="vertical"
    >
      <a-form-item label="密钥" name="secretKey">
        <a-input :maxlength="32" placeholder="请输入密钥" v-model:value.trim="secretKeyForm.secretKey" />
      </a-form-item>
    </a-form>
  </g-modal>

  <!-- 首次登录修改密码弹窗 -->
  <reset-pwd-form ref="resetPwdFormRef" @on-submit="onResetFinish" @on-cancel="onResetCancel"></reset-pwd-form>
</template>

<script setup lang="ts">
import { FormInstance } from 'ant-design-vue'
import { message } from '@/utils/antd.util'
import { Rule } from 'ant-design-vue/es/form'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { confirm } from '@/utils/antd.util'
import { accountReg, secretReg } from '@/utils/regular'
import { useUserStore } from '@/store/user'
import { userApi } from '@/services/api'
import { useRouter } from 'vue-router'
import { useRequest } from 'vue-request'
import { useSM4 } from '@/hooks/useSM'
import { secretKey } from '@/config'
import { useLogout } from '@/hooks/useUser'
import { useMenuStore } from '@/store/menu'
import { useGlobalStore } from '@/store/global'
import { storeToRefs } from 'pinia'
import { base64Decode, base64Encode } from '@/utils/utils'
import ResetPwdForm from './components/reset-pwd-form.vue'

const router = useRouter()
const userStore = useUserStore()
const { updateIsUpdateMenu } = useMenuStore()
const { encrypt } = useSM4(secretKey)
const { logout } = useLogout()

/**
 * 获取系统基本信息
 */
const globalStore = useGlobalStore()
const { systemInfo } = storeToRefs(globalStore)
const { getSystemInfo, updateLoading } = globalStore
getSystemInfo()

onMounted(() => {
  formState.account = localStorage.getItem('account') || ''
  formState.remember = localStorage.getItem('remember') === 'true'
  const orlPassword = localStorage.getItem('password') || ''
  formState.password = base64Decode(orlPassword)
})

/**
 * 登录完成后跳转
 */
const loginToMainPage = () => {
  updateIsUpdateMenu(true)
  updateLoading(true, { tip: '页面加载中...' })
  router.push('/')
}

onUnmounted(() => {
  updateLoading(false)
})

/**
 * 登录
 */
interface FormState {
  account: string
  password: string
  remember: boolean
  jump: boolean
}
const loginFormRef = ref<FormInstance>()
const formState = reactive<FormState>({
  account: '',
  password: '',
  remember: false,
  jump: false,
})
const rules: Record<string, Rule[]> = {
  account: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
    {
      pattern: accountReg,
      message: '用户名不能输入特殊字符，长度为2-32位',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
    },
  ],
}

const resetModalInfo = ref<any>()
const resetMessage = ref<string>('')
const { loading, runAsync: runLogin } = useRequest(userApi.login)
let loginFormCopy: FormState
// 未修改密码时用户临时密钥
let securityCode = ''
const onLoginFinish = (value: FormState) => {
  login(value)
}
const login = async (value: FormState) => {
  loginFormCopy = value
  const params = {
    account: value.account,
    password: encrypt(value.password),
    remember: value.remember,
    jump: value.jump,
  }
  try {
    const { data } = await runLogin(params)

    // 更新用户信息
    userStore.updateRemember(formState.remember)
    userStore.updateToken(data.token)
    userStore.updateUserInfo(data)
    // 重置表单
    loginFormRef.value?.resetFields()
    // 登录完成-跳转
    if (value.remember) {
      localStorage.setItem('remember', 'true')
      localStorage.setItem('account', value.account)
      localStorage.setItem('password', base64Encode(value.password))
    } else {
      localStorage.removeItem('account')
      localStorage.removeItem('password')
      localStorage.removeItem('remember')
    }
    loginToMainPage()
  } catch (error: any) {
    const { data, headers } = error
    switch (data.code) {
      // 设备重复登录提示
      case -2:
        confirm({
          title: data.message,
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            login({ ...value, password: value.password, jump: true })
          },
        })
        break

      // 密钥弹窗
      case -4:
        resetModalInfo.value = data.data
        resetMessage.value = data.message
        secretKeyVisible.value = true
        break

      // 密码90天未更改
      case -11:
        securityCode = headers['security-code']
        confirm({
          title: '您的密码已超过90天未修改，请设置新密码以确保账户安全。',
          okText: '修改密码',
          cancelText: '取消',
          onOk: () => {
            openResetPwdForm()
          },
          onCancel: () => {
            // 退出登录
            message.error('登录失败')
            logout()
          },
        })
        break

      // 未修改密码
      case -12:
        securityCode = headers['security-code']
        openResetPwdForm()
        break

      default:
        break
    }
  }
}

/**
 * 重置密码
 */
const resetPwdFormRef = ref<InstanceType<typeof ResetPwdForm>>()
interface FormResetState {
  newPassword: string
  confirmPassWord: string
}
const openResetPwdForm = () => {
  resetPwdFormRef.value?.open()
}
const hideResetPwdForm = () => {
  resetPwdFormRef.value?.hide()
}
const onResetCancel = () => {
  hideResetPwdForm()
  loginFormRef.value?.resetFields()
}

const { runAsync: runResetPassword } = useRequest(userApi.loginResetPassword)
const onResetFinish = async (value: FormResetState) => {
  try {
    resetPwdFormRef.value?.changeLoading(true)
    await runResetPassword({
      securityCode: securityCode,
      newPassword: encrypt(value.newPassword),
      confirmPassWord: encrypt(value.confirmPassWord),
    })
    loginFormRef.value?.resetFields()
    resetPwdFormRef.value?.changeLoading(false)
    login({ ...loginFormCopy, password: value.newPassword })
  } catch (error) {
    console.error(error)
    resetPwdFormRef.value?.changeLoading(false)
  }
}

/**
 * 密钥弹窗
 */
const secretKeyFormRef = ref<FormInstance>()
const secretKeyVisible = ref<boolean>(false)
const secretKeyForm = reactive({
  secretKey: '',
})
const secretKeyFormRules: Record<string, Rule[]> = {
  secretKey: [
    {
      required: true,
      message: '请输入密钥',
      trigger: 'blur',
    },
    {
      pattern: secretReg,
      message: '最多输入32个字符（数字、字母、字符（!@#$%^&\_+-*/）',
      trigger: 'blur',
    },
  ],
}
const { loading: resetAdminPassword, runAsync: runResetAdminPassword } = useRequest(userApi.resetAdminPassword)
const onSubmit = async () => {
  try {
    await secretKeyFormRef.value?.validate()
    const params = { secret: secretKeyForm.secretKey, account: loginFormCopy.account }
    await runResetAdminPassword(params)
    hideResetPwdForm()
    secretKeyVisible.value = false
    message.success('操作成功')
  } catch (error) {
    console.error(error)
  }
}
</script>

<style lang="less" scoped>
.login-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000000;
  .center();
  padding-bottom: 100px;
  position: fixed;
  left: 0;
  top: 0;

  .login-main {
    .form-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      transform: translateY(-24px);

      .header {
        width: 100%;
        margin: 0 0 48px;
        font-size: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;

        > p {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(255, 255, 255, 0.8) 46.33%,
            rgba(255, 255, 255, 0.5) 95.66%
          );
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo {
          height: 100px;
          display: flex;
          align-items: center;
          gap: 0 8px;

          > img {
            width: 100px;
            height: 100px;
            object-fit: contain;
          }

          h2 {
            font-weight: 400;
            font-size: 36px;
            background: linear-gradient(90deg, #fff 1.78%, #8dbaf8 96.98%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0px 0px 10px rgba(231, 240, 255, 0.2), 0px 0px 20px rgba(231, 240, 255, 0.3);
          }
        }
      }

      .form {
        width: 390px;
        height: 354px;
        margin: 0 auto;
        border-radius: 12px;
        padding: 48px 32px 24px;
        background: url(../../assets/images/login/login_form_bgc.png) no-repeat;
        background-size: cover;

        .ant-form-item:not(.ant-form-item-has-error):not(.ant-form-item-has-feedback):not(
            .ant-form-item-is-validating
          ) {
          .ant-input-affix-wrapper:not(.ant-input-affix-wrapper:focus):not(.ant-input-affix-wrapper-focused) {
            border-color: transparent;
            background: url(../../assets/svg/login-input.svg) no-repeat;
            background-size: cover;
          }
        }

        .login-input {
          border-radius: 54px;
          height: 46px;

          i {
            transform: translateY(1.5px);
          }
        }
      }
    }

    .reset-password {
      .header {
        margin-bottom: 80px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        color: @text3;

        > div {
          width: 30px;
          height: 30px;
          border: 1px solid #d9d9db;
          box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.043);
          border-radius: 6px;
          .center();
          cursor: pointer;
        }

        p {
          margin-bottom: 0;
          font-weight: 700;
          font-size: 20px;
          color: @text1;
        }

        i {
          font-size: 20px;
          color: @text3;
        }
      }
    }
  }

  .submit-button {
    width: 100%;
    height: 50px;
    border-radius: 52px;
    background: url(../../assets/images/login/bgc_login_button.png) no-repeat;
    background-size: 100% 100%;
    color: @text1;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;

    &.ant-btn:empty {
      visibility: visible;
    }
  }
}

.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  object-fit: cover;
}

.modal-form {
  margin-top: 30px;
}

.reset-form {
  width: 360px;
  margin: 56px auto;

  .psd-rule-info-wrap {
    margin-top: 40px;
    padding: 16px 20px;
    border-radius: 6px;
    background: var(--Background02, #284167);
    box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.14), 0px 1px 3px 0px rgba(37, 37, 45, 0.14);

    > h4 {
      font-size: 16px;
      font-weight: 700;
      line-height: 24px;
      color: @text2;
    }

    ul {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px 0;

      > li {
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        display: flex;
        gap: 0 8px;
        color: @primary2;
      }
    }
  }
}

.icon-error-warning-fill {
  color: @warning;
}

:deep(.ant-checkbox-wrapper) span {
  color: @text3;
}

:deep(.password-input) {
  .ant-input-password-icon:hover {
    color: @text3;
  }
}

:deep(.ant-form) {
  // .ant-form-item:not(.ant-form-item-has-error) .ant-form-item-control .ant-input-affix-wrapper:hover {
  //   border-right-width: 2px !important;
  // }
  // .ant-form-item:not(.ant-form-item-has-error)
  //   .ant-form-item-control
  //   .ant-input-affix-wrapper:not(.ant-form-item-has-error):not(.ant-input-affix-wrapper-disabled):hover {
  //   border-right-width: 2px !important;
  // }

  .ant-form-item-explain-error {
    padding-left: 12px;
  }

  .ant-input-prefix {
    color: @text1;
  }
}
</style>
