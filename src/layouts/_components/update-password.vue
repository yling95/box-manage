<template>
  <reset-pwd-form ref="resetPwdFormRef" showOldPwd @on-submit="onResetFinish"></reset-pwd-form>
</template>

<script setup lang="ts">
import { secretKey } from '@/config'
import useSM4 from '@/hooks/useSM'
import { userApi } from '@/services/api'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useRequest } from 'vue-request'
import ResetPwdForm from '@/views/login/components/reset-pwd-form.vue'

const { encrypt } = useSM4(secretKey)

/**
 * 重置密码
 */
const resetPwdFormRef = ref<InstanceType<typeof ResetPwdForm>>()
const openResetPwdForm = () => {
  resetPwdFormRef.value?.open()
}
const hideResetPwdForm = () => {
  resetPwdFormRef.value?.hide()
}
interface FormResetState {
  password: string
  newPassword: string
  confirmPassWord: string
}
const { runAsync: runUpdatePassword } = useRequest(userApi.updatePassword)
const onResetFinish = async (value: FormResetState) => {
  try {
    resetPwdFormRef.value?.changeLoading(true)
    const params = {
      password: encrypt(value.password),
      newPassword: encrypt(value.newPassword),
      confirmPassWord: encrypt(value.confirmPassWord),
    }
    await runUpdatePassword(params)
    message.success('操作成功')
    hideResetPwdForm()
    resetPwdFormRef.value?.changeLoading(false)
  } catch (error) {
    resetPwdFormRef.value?.changeLoading(false)
  }
}

defineExpose({
  show: () => {
    openResetPwdForm()
  },
  hide: () => {
    hideResetPwdForm()
  },
})
</script>

<style lang="less" scoped>
.update-password {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .form-container {
    width: 360px;
    border-radius: 6px 0px 0px 6px;
    .center();
    flex-direction: column;

    .header {
      width: 360px;
      margin: 0 auto;
      font-size: 16px;
      color: @text3;
      margin-bottom: 56px;
      font-weight: 700;
      font-size: 20px;
      color: @text1;
    }

    .form {
      width: inherit;
      margin: 0 auto;
    }
  }

  .form-item-submit {
    margin-top: 56px;
  }
}
</style>
