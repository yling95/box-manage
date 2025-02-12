<template>
  <div class="standard">
    <div class="modal">
      <h1>消息提示</h1>
      <div class="list">
        <a-button type="primary" @click="() => message.info('This is a normal message')">
          Display normal message
        </a-button>
        <a-button @click="() => message.success('This is a normal message')">Success</a-button>
        <a-button @click="() => message.error('This is a normal message')">Error</a-button>
        <a-button @click="() => message.warning('This is a normal message')">Warning</a-button>
        <a-button @click="() => message.loading('加载中...', 30)">Display a loading indicator</a-button>
      </div>
    </div>

    <div class="modal">
      <h1>Modal 对话框</h1>
      <div class="list">
        <a-button type="primary" @click="() => (visible1 = true)">普通弹窗</a-button>
        <a-button type="primary" @click="() => (visible2 = true)">全屏弹窗</a-button>
        <a-button
          type="primary"
          @click="
            () =>
              info({
                title: '测试标题',
              })
          "
          >info</a-button
        >
        <a-button
          type="primary"
          @click="
            () =>
              confirm({
                title: '测试标题',
              })
          "
          >confirm</a-button
        >
      </div>
    </div>

    <div class="modal">
      <h1>按钮</h1>
      <div class="list">
        <a-button>默认按钮</a-button>
        <a-button type="default">default按钮</a-button>
        <a-button type="primary">primary按钮</a-button>
        <a-button type="text">text按钮</a-button>
        <a-button type="text" background>text有背景按钮</a-button>
        <a-button type="ghost">ghost按钮</a-button>
        <a-button type="dashed">dashed按钮</a-button>
        <a-button type="link">link按钮</a-button>
      </div>
      <hr />
      <div class="list">
        <a-button size="small">默认按钮</a-button>
        <a-button type="default" size="small">default按钮</a-button>
        <a-button type="primary" size="small">primary按钮</a-button>
        <a-button type="text" size="small">text按钮</a-button>
        <a-button type="text" size="small" background>text有背景按钮</a-button>
        <a-button type="ghost" size="small">ghost按钮</a-button>
        <a-button type="dashed" size="small">dashed按钮</a-button>
        <a-button type="link" size="small">link按钮</a-button>
      </div>
      <hr />
      <div class="list">
        <a-button size="large">默认按钮</a-button>
        <a-button type="default" size="large">default按钮</a-button>
        <a-button type="primary" size="large">primary按钮</a-button>
        <a-button type="text" size="large">text按钮</a-button>
        <a-button type="text" size="large" background>text有背景按钮</a-button>
        <a-button type="ghost" size="large">ghost按钮</a-button>
        <a-button type="dashed" size="large">dashed按钮</a-button>
        <a-button type="link" size="large">link按钮</a-button>
      </div>
      <hr />
      <div class="list">
        <a-button disabled>默认按钮</a-button>
        <a-button type="default" disabled>default按钮</a-button>
        <a-button type="primary" disabled>primary按钮</a-button>
        <a-button type="text" disabled>text按钮</a-button>
        <a-button type="text" disabled background>text有背景按钮</a-button>
        <a-button type="ghost" disabled>ghost按钮</a-button>
        <a-button type="dashed" disabled>dashed按钮</a-button>
        <a-button type="link" disabled>link按钮</a-button>
      </div>
    </div>

    <div class="modal">
      <h1>表单元素</h1>
      <a-space direction="vertical" :size="12">
        <a-input placeholder="请输入" type="text" v-model:value="inputValue" />
        <a-input placeholder="请输入" type="text" v-model:value="inputValue" allow-clear />
        <a-input type="text" v-model:value="inputValue" disabled />
        <a-input type="text" v-model:value="inputValue" :maxlength="50" show-count />

        <a-input-password type="text" v-model:value="inputValue" />
        <a-input-password type="text" disabled v-model:value="inputValue" />

        <a-input-number v-model:value="inputValue" />

        <a-select value="a" style="width: 200px">
          <a-select-option value="a">a</a-select-option>
          <a-select-option value="b">b</a-select-option>
          <a-select-option value="c">c</a-select-option>
          <a-select-option value="d">d</a-select-option>
        </a-select>

        <a-select
          mode="multiple"
          :showSearch="false"
          show-arrow
          placeholder="Please select"
          allow-clear
          style="width: 200px"
        >
          <a-select-option value="a">a</a-select-option>
          <a-select-option value="b">b</a-select-option>
          <a-select-option value="c">c</a-select-option>
          <a-select-option value="d">d</a-select-option>
        </a-select>

        <a-switch :checked="true" checked-children="开" un-checked-children="关" />
        <a-switch :checked="false" checked-children="开" un-checked-children="关" />

        <a-time-range-picker />
        <a-range-picker />
        <a-range-picker show-time />
        <a-range-picker picker="week" />
        <a-range-picker picker="month" />
        <a-range-picker picker="year" />

        <a-radio-group value="a">
          <a-radio value="a">a</a-radio>
          <a-radio value="a" disabled>a</a-radio>
          <a-radio value="b">b</a-radio>
          <a-radio value="c">c</a-radio>
          <a-radio value="d" disabled>d</a-radio>
        </a-radio-group>

        <a-radio-group class="background" value="a">
          <a-radio value="a">a</a-radio>
          <a-radio value="a" disabled>a</a-radio>
          <a-radio value="b">b</a-radio>
          <a-radio value="c">c</a-radio>
          <a-radio value="d" disabled>d</a-radio>
        </a-radio-group>

        <a-checkbox :indeterminate="true">全选</a-checkbox>
        <a-checkbox-group :value="['a', 'c']">
          <a-checkbox value="a">a</a-checkbox>
          <a-checkbox value="b">b</a-checkbox>
          <a-checkbox value="c" disabled>c</a-checkbox>
          <a-checkbox value="d" disabled>d</a-checkbox>
        </a-checkbox-group>

        <a-cascader placeholder="Please select" :options="options">
          <a href="#">Change city</a>
        </a-cascader>

        <a-cascader multiple max-tag-count="responsive" :options="options" placeholder="Please select"></a-cascader>
        <a-cascader
          multiple
          max-tag-count="responsive"
          :options="options"
          placeholder="Please select"
          showArrow
        ></a-cascader>

        <a-form
          :model="formState"
          layout="vertical"
          name="basic"
          autocomplete="off"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
        >
          <a-form-item label="无校验" name="nickname">
            <a-input v-model:value="formState.nickname" />
          </a-form-item>
          <a-form-item label="只显示必填样式" name="nickname" class="required">
            <a-input v-model:value="formState.nickname" />
          </a-form-item>
          <a-form-item
            label="必填但不显示必填样式"
            name="username"
            class="hide-required"
            :rules="[{ required: true, message: 'Please input your username!' }]"
          >
            <a-input v-model:value="formState.username" />
          </a-form-item>
          <a-form-item
            label="Username"
            name="username"
            :rules="[{ required: true, message: 'Please input your username!' }]"
          >
            <a-input v-model:value="formState.username" />
          </a-form-item>

          <a-form-item
            label="Password"
            name="password"
            :rules="[{ required: true, message: 'Please input your password!' }]"
          >
            <a-input-password v-model:value="formState.password" />
          </a-form-item>

          <a-form-item name="remember" :wrapper-col="{ offset: 8, span: 16 }">
            <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
          </a-form-item>

          <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
            <a-button type="primary" html-type="submit">Submit</a-button>
          </a-form-item>
        </a-form>
      </a-space>
    </div>

    <div class="modal">
      <h1>下拉菜单</h1>
      <a-dropdown>
        <a class="ant-dropdown-link" @click.prevent>
          Hover me
          <DownOutlined />
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a href="javascript:;">1st menu item</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">2nd menu item</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">3rd menu item</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <div class="modal">
      <h1>表格</h1>
      <a-table
        :dataSource="dataSource"
        :columns="columns"
        :pagination="{
          total: 100,
          current: 1,
          pageSize: 10,
          showTotal: (total: number) => `共${total}条记录`,
          showSizeChanger: true,
          size: 'small',
        }"
      />
      <a-table
        :dataSource="[]"
        :columns="columns"
        :pagination="{
          total: 100,
          current: 1,
          pageSize: 10,
          showTotal: (total: number) => `共${total}条记录`,
          showSizeChanger: true,
          size: 'small',
        }"
      >
        <template #emptyText>
          <div class="table-empty">
            <img src="@/assets/images/alarm/icon_list_empty.png" />
            <p>无数据</p>
          </div>
        </template>
      </a-table>
    </div>

    <div class="modal">
      <h1>分页器</h1>
      <a-pagination
        size="small"
        :current="1"
        :page-size="10"
        :total="1000"
        :show-total="(total: number) => `共${total}条记录`"
        :showSizeChanger="true"
        :pageSizeOptions="['50', '100', '200']"
      />
    </div>

    <div class="modal">
      <h1>进度条</h1>
      <a-space direction="vertical" :size="12">
        <a-progress style="width: 188px" :percent="50" size="small" />
        <a-progress style="width: 188px" :percent="0" size="small" />
        <a-progress style="width: 188px" :percent="100" size="small" />
        <a-progress style="width: 188px" :percent="100" size="small" :show-info="false" />

        <a-progress :percent="30" />
        <a-progress :percent="50" status="active" />
        <a-progress :percent="70" status="exception" />
        <a-progress :percent="100" />
        <a-progress :percent="50" :show-info="false" />
      </a-space>
    </div>
  </div>

  <g-modal v-model:visible="visible1" title="Basic Modal">
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </g-modal>
  <g-modal fullscreen v-model:visible="visible2" title="Basic Modal">
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </g-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { CascaderProps } from 'ant-design-vue'
import { message, info, confirm } from '@/utils/antd.util'

const inputValue = ref('')

const options: CascaderProps['options'] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
        ],
      },
    ],
  },
]

interface FormState {
  username: string
  password: string
  nickname: string
  remember: boolean
}

const formState = reactive<FormState>({
  username: '',
  password: '',
  nickname: '',
  remember: true,
})
const onFinish = (values: any) => {
  console.log('Success:', values)
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}

const visible1 = ref(false)
const visible2 = ref(false)

const dataSource = [
  {
    key: '1',
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号',
  },
  {
    key: '2',
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号',
  },
]

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
  },
]
</script>

<style lang="less" scoped>
.standard {
  padding: 32px;
  background: @background2;
}
h1 {
  font-size: 34px;
  text-align: center;
  padding: 40px 0;
  color: @text1;
}
.list {
  display: flex;
  gap: 24px;
}

p {
  color: @text1;
}
</style>
