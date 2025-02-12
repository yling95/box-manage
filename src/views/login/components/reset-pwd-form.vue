<template>
  <!-- 首次登录修改密码弹窗 -->
  <g-modal
    title="修改密码"
    width="800px"
    v-model:visible="visible"
    :ok-button-props="{
      loading: loading,
    }"
    ok-text="确认"
    @ok="onResetFinish"
    @cancel="handleToLogin"
  >
    <a-form :model="formResetState" ref="resetFormRef" class="reset-form" layout="vertical" :rules="resetRules">
      <a-form-item label="旧密码" v-if="showOldPwd" name="password" class="hide-required" validate-first>
        <a-input-password
          :maxlength="20"
          size="large"
          placeholder="请输入旧密码"
          v-model:value.trim="formResetState.password"
          autocomplete="off"
          @keyup="formResetState.password = formResetState.password.replace(/\s+/g, '')"
        />
      </a-form-item>
      <a-form-item label="新密码" name="newPassword" validate-first>
        <a-input-password
          :maxlength="20"
          size="large"
          placeholder="请输入新密码"
          v-model:value.trim="formResetState.newPassword"
          autocomplete="off"
          @keyup="formResetState.newPassword = formResetState.newPassword.replace(/\s+/g, '')"
        />
      </a-form-item>
      <a-form-item label="确认新密码" name="confirmPassWord" validate-first>
        <a-input-password
          :maxlength="20"
          size="large"
          placeholder="再次输入新密码"
          v-model:value.trim="formResetState.confirmPassWord"
          autocomplete="off"
          @keyup="formResetState.confirmPassWord = formResetState.confirmPassWord.replace(/\s+/g, '')"
        />
      </a-form-item>
      <div class="psd-rule-info-wrap">
        <h4>密码需满足</h4>
        <ul>
          <li>
            <i class="iconfont icon-error-warning-line"></i>
            <p>8-20个字符</p>
          </li>
          <li>
            <i class="iconfont icon-error-warning-line"></i>
            <p>至少包含大写字母、小写字母、数字以及符号3种</p>
          </li>
        </ul>
      </div>
    </a-form>
  </g-modal>
</template>

<script setup lang="ts">
import { FormInstance } from 'ant-design-vue/es/form/Form'
import { Rule } from 'ant-design-vue/es/form/interface'
import { reactive, ref } from 'vue'
import { passwordValidator, passwordReg, createLengthReg } from '@/utils/regular'

defineProps({
  showOldPwd: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['on-submit', 'on-cancel'])

const visible = ref<boolean>(false)
const loading = ref<boolean>(false)
interface FormResetState {
  password: string
  newPassword: string
  confirmPassWord: string
}
const handleToLogin = () => {
  visible.value = false
  resetFormRef.value?.resetFields()
  emits('on-cancel')
}
const resetFormRef = ref<FormInstance>()
const formResetState = reactive<FormResetState>({
  password: '',
  newPassword: '',
  confirmPassWord: '',
})
const validateAckPWS = async () => {
  if (formResetState.confirmPassWord === '') {
    return Promise.reject('请确认密码')
  }
  if (formResetState.newPassword !== formResetState.confirmPassWord) {
    return Promise.reject('两次输入内容不一致')
  }
  return Promise.resolve()
}
const resetRules: Record<string, Rule[]> = {
  password: [
    {
      required: true,
      message: '请输入旧密码',
      trigger: 'blur',
    },
    {
      pattern: createLengthReg(8, 20),
      message: '密码长度必须是8-20位字符',
      trigger: 'blur',
    },
    {
      pattern: passwordReg,
      message: '密码应该包含大写字母、小写字母、数字和特殊字符中的至少三种',
      trigger: 'blur',
    },
  ],
  newPassword: [
    {
      validator: (_rule: Rule, value: string) => {
        return passwordValidator(_rule, value)
      },
      trigger: 'blur',
    },
  ],
  confirmPassWord: [
    {
      validator: validateAckPWS,
      trigger: 'blur',
    },
  ],
}
const onResetFinish = async () => {
  try {
    const value = (await resetFormRef.value?.validate()) as FormResetState
    emits('on-submit', value)
  } catch (error) {
    console.error(error)
  }
}

defineExpose({
  open: () => {
    visible.value = true
  },
  hide: () => {
    visible.value = false
  },
  changeLoading: (bool: boolean) => {
    loading.value = bool
  },
})
</script>

<style lang="less" scoped>
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
        font-size: 12px;
        font-weight: 400;
        line-height: 22px;
        display: flex;
        gap: 0 8px;
        color: @primary2;
      }
    }
  }
}
</style>
