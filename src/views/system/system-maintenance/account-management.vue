<template>
  <div class="account-container">
    <div class="account-management-page">
      <!-- 操作区域 -->
      <div class="operation">
        <!-- 筛选 -->

        <div class="filter">
          <a-input
            style="width: 239px"
            placeholder="账号名称"
            v-model:value="pageForm.account"
            allowClear
            @press-enter="handleSearch"
            @change="!pageForm.account && handleSearch()"
          >
            <template #prefix>
              <i class="iconfont icon-search-line"></i>
            </template>
          </a-input>
          <a-range-picker style="width: 239px" format="YYYY-MM-DD" v-model:value="searchTime" @change="handleSearch" />
        </div>

        <div>
          <a-button type="primary" v-auth="'system-maintenance-account-number-add'" @click="handleAdd">新增</a-button>
        </div>
      </div>
      <!-- 表格 -->
      <div class="table-wrap">
        <a-table
          :loading="loading"
          :columns="columns"
          :dataSource="dataList"
          :pagination="{
            total: pageForm.total,
            current: pageForm.offset,
            pageSize: pageForm.limit,
            showTotal: (total: number) => `共${total}条记录`,
            showSizeChanger: true,
            size: 'small',
          }"
          @change="tableChange"
        >
          <!-- 暂无数据的效果 -->
          <template #emptyText>
            <div class="table-empty">
              <img src="@/assets/images/alarm/icon_list_empty.png" />
              <p>无数据</p>
            </div>
          </template>
          <template #bodyCell="{ column, record }">
            <div v-if="column.key === 'operation'">
              <!-- 超级管理员和当前角色权限大于等于该账号角色权限时，才能编辑、删除 -->
              <div v-if="record?.roleId !== 1 && userInfo?.roleId < record?.roleId" class="table-operation">
                <a-button type="link" @click="handleReset(record)" v-auth="'system-maintenance-account-number-reset'"
                  >重置</a-button
                >
                <a-button type="link" @click="handleEdit(record)" v-auth="'system-maintenance-account-number-edit'"
                  >编辑</a-button
                >
                <a-button type="link" @click="handleDelete(record)" v-auth="'system-maintenance-account-number-delete'"
                  >删除</a-button
                >
              </div>
            </div>
          </template>
        </a-table>
      </div>
    </div>
    <!-- 新增账号弹窗 -->
    <g-modal
      :bodyStyle="{ padding: '40px ' }"
      :title="title"
      v-model:visible="addFormVisible"
      @ok="onSubmitAdd"
      :ok-button-props="{
        loading: addLoading || updateLoading,
      }"
      destroy-on-close
    >
      <a-form :model="form" ref="addFormRef" layout="vertical" :rules="addRules">
        <a-form-item label="账号名称" name="account">
          <a-input placeholder="请输入" v-model:value="form.account" :maxlength="32" />
        </a-form-item>
        <a-form-item label="账号密码" name="password" v-if="title === '新增账号'" validate-first>
          <a-input-password
            placeholder="8-20个字符；至少包含大写字母、小写字母、数字以及符号3种"
            v-model:value="form.password"
            :maxlength="32"
            autocomplete="off"
            @keyup="form.password = form.password.replace(/\s+/g, '')"
          />
        </a-form-item>
        <a-form-item label="确认账号密码" name="confirmPassWord" v-if="title === '新增账号'" validate-first>
          <a-input-password
            placeholder="再次输入密码"
            v-model:value="form.confirmPassWord"
            :maxlength="32"
            autocomplete="off"
            @keyup="form.confirmPassWord = form.confirmPassWord.replace(/\s+/g, '')"
          />
        </a-form-item>
        <a-form-item label="角色" name="role">
          <a-radio-group placeholder="请选择" v-model:value="form.role">
            <a-radio :value="role.key" v-for="role in roleOptions" :key="role.key">{{ role.value }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            class="textarea-show-count"
            placeholder="请输入"
            v-model:value="form.description"
            showCount
            :maxlength="50"
          />
        </a-form-item>
      </a-form>
    </g-modal>

    <!-- 重置密码弹窗 -->
    <g-modal
      title="重置密码"
      v-model:visible="resetFormVisible"
      :okButtonProps="{
        loading: resetLoading,
      }"
      @ok="onSubmitReset"
      @cancel="onCancelReset"
      destroy-on-close
    >
      <a-form :model="resetForm" ref="resetFormRef" layout="vertical" :rules="resetRules">
        <a-form-item label="新密码" name="password" validate-first>
          <a-input-password
            placeholder="8-20个字符；至少包含大写字母、小写字母、数字以及符号3种"
            v-model:value="resetForm.password"
            :maxlength="32"
            @keyup="resetForm.password = resetForm.password.replace(/\s+/g, '')"
          />
        </a-form-item>
        <a-form-item label="确认新密码" name="confirmPassWord" validate-first>
          <a-input-password
            placeholder="再次输入密码"
            v-model:value="resetForm.confirmPassWord"
            :maxlength="32"
            @keyup="resetForm.confirmPassWord = resetForm.confirmPassWord.replace(/\s+/g, '')"
          />
        </a-form-item>
      </a-form>
    </g-modal>
  </div>
</template>

<script setup lang="ts">
import { secretKey } from '@/config'
import useList from '@/hooks/useList'
import useSM4 from '@/hooks/useSM'
import { systemApi } from '@/services/api'
import { accountReg, passwordValidator } from '@/utils/regular'
import { FormInstance, TableProps } from 'ant-design-vue'
import { message } from '@/utils/antd.util'

import { Rule } from 'ant-design-vue/es/form'
import { onMounted, ref, watchEffect } from 'vue'
import { useRequest } from 'vue-request'
import { confirm } from '@/utils/antd.util'
import dayjs, { Dayjs } from 'dayjs'
import { useUserStore } from '@/store/user'

type RangeValue = [Dayjs, Dayjs]
const { encrypt } = useSM4(secretKey)
const { userInfo } = useUserStore()

/**
 * 新增/修改
 */
const title = ref<string>('新增账号')
const addFormVisible = ref<boolean>(false)
const addFormRef = ref<FormInstance>()
const form = ref({
  id: undefined,
  account: '',
  password: '',
  confirmPassWord: '',
  role: 3,
  description: '',
})
// 校验确认密码
const validateAckPWS = (form: any) => {
  return () => {
    if (form.value.confirmPassWord === '') {
      return Promise.reject('请确认密码')
    }
    if (form.value.password !== form.value.confirmPassWord) {
      return Promise.reject('两次输入内容不一致')
    }
    return Promise.resolve()
  }
}
const addRules: Record<string, Rule[]> = {
  account: [
    { required: true, message: '请输入账号名称', trigger: 'blur' },
    {
      pattern: accountReg,
      message: '账号长度必须是2到32个字符 (汉字、数字、大小写英文字母)',
      trigger: 'blur',
    },
  ],
  password: [
    {
      validator: (_rule: Rule, value: string) => {
        return passwordValidator(_rule, value)
      },
      required: true,
      trigger: 'blur',
    },
  ],
  confirmPassWord: [
    {
      required: true,
      validator: validateAckPWS(form),
      trigger: 'blur',
    },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'blur' }],
}
const { loading: addLoading, runAsync: runSubmit } = useRequest(systemApi.addUser)
const { loading: updateLoading, runAsync: runUpdateUser } = useRequest(systemApi.updateUser)
const handleAdd = () => {
  getRoleList()
  form.value = {
    id: undefined,
    account: '',
    password: '',
    confirmPassWord: '',
    role: 3,
    description: '',
  }
  addFormRef.value?.resetFields()
  title.value = '新增账号'
  addFormVisible.value = true
}
const handleEdit = (record: any) => {
  getRoleList()
  title.value = '编辑账号'
  Object.assign(form.value, {
    id: record.id,
    account: record.account,
    role: record.roleId,
    description: record.description,
  })
  addFormVisible.value = true
}
const onSubmitAdd = async () => {
  try {
    await addFormRef.value?.validate()
    const params = {
      id: form.value.id,
      account: form.value.account,
      password: encrypt(form.value.password),
      confirmPassWord: encrypt(form.value.confirmPassWord),
      role: form.value.role,
      description: form.value.description,
    }
    if (title.value === '编辑账号') {
      await runUpdateUser(params)
    } else {
      await runSubmit(params)
    }
    addFormRef.value?.resetFields()
    addFormVisible.value = false
    getDataList()
    message.success('操作成功')
  } catch (error) {
    console.error(error)
  }
}

/**
 * 角色列表
 */
const roleOptions = ref<any[]>([])
const getRoleList = async () => {
  try {
    const res = await systemApi.getRoleList()
    roleOptions.value = res.data
  } catch (error) {
    console.error(error)
  }
}

/**
 * 重置
 */
const resetFormVisible = ref<boolean>(false)
const resetFormRef = ref<FormInstance>()
const resetForm = ref({
  account: '',
  password: '',
  confirmPassWord: '',
})
const resetRules: Record<string, Rule[]> = {
  account: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
  password: [
    {
      validator: (_rule: Rule, value: string) => {
        return passwordValidator(_rule, value)
      },
      required: true,
      trigger: 'blur',
    },
  ],
  confirmPassWord: [
    {
      validator: validateAckPWS(resetForm),
      trigger: 'blur',
      required: true,
    },
  ],
}
const { loading: resetLoading, runAsync: runReset } = useRequest(systemApi.resetUser)
const info = ref<any>({})
const onSubmitReset = async () => {
  try {
    await resetFormRef.value?.validate()
    const params = {
      id: info.value.id,
      password: encrypt(resetForm.value.password),
      confirmPassWord: encrypt(resetForm.value.confirmPassWord),
    }
    await runReset(params)
    resetFormRef.value?.resetFields()
    resetFormVisible.value = false
    getDataList()
    message.success('操作成功')
  } catch (error) {
    console.error(error)
  }
}
const handleReset = (record: any) => {
  info.value = record
  resetFormVisible.value = true
}
const onCancelReset = () => {
  resetFormRef.value?.resetFields()
  resetFormVisible.value = false
}

/**
 * 删除
 */
const { loading: delLoading, runAsync: runDeleteUser } = useRequest(systemApi.deleteUser)
const handleDelete = (record: any) => {
  confirm({
    title: `请确认是否删账号：${record.account}？`,
    okText: '确定',
    cancelText: '取消',
    okButtonProps: {
      loading: delLoading.value,
    },
    async onOk() {
      await runDeleteUser(record.id)
      getDataList()
      console.log('OK')
    },
  })
}

// 表格结构
const columns = ref([
  {
    title: '账号名称',
    dataIndex: 'account',
    key: 'account',
    width: 186,
    ellipsis: true,
  },
  {
    title: '角色',
    dataIndex: 'roleName',
    key: 'roleName',
    width: 186,
  },
  {
    title: '备注',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 200,
  },

  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 180,
  },
])

// 表格数据
const { dataList, getDataList, loading, pageForm } = useList(systemApi.getUserList, {
  account: '',
  startTime: '',
  endTime: '',
})
const searchTime = ref<RangeValue | undefined>(undefined)
const handleSearch = () => {
  if (searchTime.value) {
    pageForm.startTime = dayjs(searchTime.value?.[0]).startOf('date').format('YYYY-MM-DD HH:mm:ss')
    pageForm.endTime = dayjs(searchTime.value?.[1]).endOf('date').format('YYYY-MM-DD HH:mm:ss')
  } else {
    pageForm.startTime = ''
    pageForm.endTime = ''
  }
  getDataList({ ...pageForm, offset: 1 })
}
const tableChange: TableProps<any>['onChange'] = (pagination) => {
  pageForm.limit = pagination.pageSize || 10
  getDataList({
    offset: pagination.current,
  })
}

// 获取表格数据
onMounted(() => {
  getDataList()
})

watchEffect(() => {
  if (form.value.account) {
    form.value.account = form.value.account.replace(/\s+/, '')
  }
  if (form.value.password) {
    form.value.password = form.value.password.replace(/\s+/, '')
  }
  if (form.value.confirmPassWord) {
    form.value.confirmPassWord = form.value.confirmPassWord.replace(/\s+/, '')
  }
})
</script>
<style lang="less">
.ant-radio-checked .ant-radio-inner {
  border-color: @border1 !important;
  background-color: #1868e9 !important;
  &::after {
    background-color: #fff !important;
  }
}
</style>
<style lang="less" scoped>
.table-wrap {
  margin: 10px 0 0px;
  overflow-y: auto;
  height: calc(100vh - 231px) !important;
}
.ant-form .ant-form-item .ant-input-textarea-show-count::after {
  color: @text4;
}
.account-management-page {
  // padding: 40px 32px;
  .ant-input-affix-wrapper {
    height: 36px;
  }
  .operation {
    display: flex;
    height: 40px;
    width: 100%;
    justify-content: space-between;

    .filter {
      height: 40px;
      display: flex;
      align-items: center;
      gap: 0 8px;
      // margin-right: auto;
      p {
        // 不压缩
        white-space: nowrap;
        font-weight: 400;
        font-size: 14px;
        color: @text2;
      }
      :deep(.ant-picker-range) {
        width: 216px;
        height: 36px;
      }
    }
  }
}
</style>
