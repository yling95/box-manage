<template>
  <div class="reflux-config">
    <!-- 操作区域 -->
    <div class="operation">
      <!-- 筛选 -->
      <div class="filter">
        <a-input
          style="width: 239px"
          placeholder="配置名称"
          v-model:value="pageForm.configName"
          allowClear
          @press-enter="handleSearch"
          @change="!pageForm.configName && handleSearch()"
        >
          <template #prefix>
            <i class="iconfont icon-search-line"></i>
          </template>
        </a-input>

        <div class="filter-item">
          <a-select
            v-model:value="pageForm.statesList"
            class="select-item"
            :class="[pageForm.statesList !== undefined && 'ant-select-focused']"
            placeholder="状态"
            :options="statusOptions"
            @change="handleSearch"
            allow-clear
            :showSearch="false"
            showArrow
          >
            <template #suffixIcon>
              <i class="iconfont icon-arrow-down-s-fill"></i>
            </template>
          </a-select>
        </div>
        <div class="filter-item">
          <a-select
            v-model:value="pageForm.modelList"
            class="select-item"
            :class="[pageForm.modelList && 'ant-select-focused']"
            placeholder="回流策略"
            :options="refluxStrategyList"
            @change="handleSearch"
            allow-clear
            :showSearch="false"
            showArrow
          >
            <template #suffixIcon>
              <i class="iconfont icon-arrow-down-s-fill"></i>
            </template>
          </a-select>
        </div>
      </div>
      <a-button type="primary" @click="PageButtonClick('add')"> 新增 </a-button>
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
          <div v-if="column.key === 'states'">
            {{ record.states === 0 ? '禁用' : '启用' }}
          </div>
          <div v-if="column.key === 'model'">
            {{ record.model === 0 ? '算法报警回流' : '录像回流' }}
          </div>
          <div v-else-if="column.key === 'operation'">
            <div class="table-operation">
              <a-button type="link" @click="PageButtonClick('forbidden', record)">
                <span v-if="record.states === 1">禁用</span>
                <span v-else>启用</span>
              </a-button>
              <a-button type="link" @click="PageButtonClick('edit', record)">编辑</a-button>
              <a-button type="link" @click="PageButtonClick('delete', record)">删除</a-button>
            </div>
          </div>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, createVNode } from 'vue'
import { confirm, message, info } from '@/utils/antd.util'
import useList from '@/hooks/useList'
import { TableProps, Modal } from 'ant-design-vue'
import { reflowApi } from '@/services/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const refluxStrategyList = reactive([
  {
    value: 0,
    label: '算法报警回流',
  },
  {
    value: 1,
    label: '录像回流',
  },
])

const statusOptions = reactive([
  {
    value: 1,
    label: '启用',
  },
  {
    value: 0,
    label: '禁用',
  },
])

// 表格结构
const columns = ref([
  {
    title: '配置名称',
    dataIndex: 'configName',
    key: 'configName',
    ellipsis: true,
    width: 200,
  },
  {
    title: '回流设备',
    dataIndex: 'deviceNameStr',
    ellipsis: true,
    key: 'deviceNameStr',
  },
  {
    title: '回流策略 ',
    dataIndex: 'model',
    key: 'model',
    width: 180,
  },
  {
    title: '时间 ',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 240,
  },
  {
    title: '状态',
    dataIndex: 'states',
    key: 'states',
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
const { dataList, getDataList, loading, pageForm } = useList(reflowApi.getList, {
  configName: '',
  statesList: undefined,
  modelList: undefined,
})

const tableChange: TableProps<any>['onChange'] = (pagination) => {
  pageForm.limit = pagination.pageSize || 10
  getDataList({
    offset: pagination.current,
  })
}

// 查询
const handleSearch = () => {
  getDataList({ ...pageForm, offset: 1 })
}

// 启用/禁用
const PageButtonClick = async (type: string, item?: any) => {
  console.log(type, item)
  if (type === 'add') {
    router.push('/system-layout/system-maintenance/reflux-config/form')
    return
  }
  if (type === 'edit' && item.states !== 0) {
    message.error('请先禁用任务后再编辑')
    return
  }
  if (type === 'edit') {
    router.push(`/system-layout/system-maintenance/reflux-config/form?id=${item.id}`)
    return
  }
  if (type === 'delete') {
    const deleteFun = async (): Promise<void> => {
      try {
        let res: any = await reflowApi.deleteReflow(item.id)
        if (res.code === 0) {
          message.success('删除成功')
          getDataList()
        }
      } catch (err: any) {
        if (err.data.code === -29) {
          info({
            title: '当前配置正在进行录像任务，请任务禁用后操作',
            icon: createVNode('i', { class: 'iconfont confirm-info info-modal-icon icon-information-fill' }),
          })
        }
      }
    }
    confirm({
      title: '确认删除该配置？',
      onOk: async () => {
        await deleteFun()
      },
    })
    return
  }

  if (type === 'forbidden') {
    loading.value = true
    try {
      let params = {
        id: item.id,
        status: item.states === 0 ? 1 : 0,
      }
      const res: any = await reflowApi.updateStates(params)
      loading.value = false
      if (res.code === 0) {
        message.success(`${params.status === 0 ? '禁用' : '启用'}成功`)
        getDataList()
      }
    } catch (error) {
      loading.value = false
    }
  }
}

// 初始化
onMounted(() => {
  getDataList()
})
</script>
<style lang="less">
.info-modal-icon {
  color: rgba(121, 164, 231, 1);
}
.reflux-config {
  padding-top: 10px;
  .ant-select-selection-item-content {
    padding: 2px 6px;
  }

  .ant-select {
    width: 100%;

    .ant-select-selection-placeholder {
      color: @text2;
    }
  }

  .ant-select-selector {
    border: none !important;
    background: transparent !important;
  }

  .ant-select-arrow {
    margin-top: -9px !important;
  }

  .icon-arrow-down-s-fill {
    color: @text2;
  }

  .ant-select-clear {
    color: @text1;
  }
}
</style>
<style lang="less" scoped>
.local-detection-header {
  color: @text2;
  font-size: 22px;
  font-weight: 700;
  line-height: 32px;
}

.reflux-config {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;

  .local-detection-wrap {
    flex: 1;
    overflow: auto;
  }

  .operation {
    display: flex;
    margin-bottom: 16px;
    justify-content: space-between;

    .filter {
      display: flex;
      align-items: center;

      .filter-item {
        position: relative;
        margin: 0 12px;

        &::after {
          width: 1px;
          height: 14px;
          content: '';
          background-color: @border2;
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
        }

        &:last-child {
          margin-right: 0;

          &::after {
            display: none;
          }
        }
      }

      .select-item {
        min-width: 94px;
      }
    }
  }

  .table-wrap {
    height: 100%;

    .progress-wrap {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: 0 8px;

      > p {
        width: 56px;
      }

      i {
        transform: translateY(2px);
        color: @primary2;
        cursor: pointer;
      }

      .progress-container {
        width: 88px;
        height: 6px;
        background-color: @background4;
        border-radius: 6px;
        position: relative;

        .progress-bar {
          width: 0%;
          height: 100%;
          background-color: @primary2;
          border-radius: 6px;
          position: absolute;
          left: 0;
          top: 0;
        }

        &.exception {
          .progress-bar {
            background-color: @text3;
          }
        }

        &.success {
          .progress-bar {
            background-color: @success;
          }
        }
      }
    }
  }
}

.ai-name-concat-wrap {
  width: 100%;
  display: flex;

  .ai-name-concat {
    width: 100%;
    .ellipsis();
  }

  .hidden-text-num {
    display: block;
    width: 30px;
    color: @primary2;
    cursor: pointer;
  }

  &:has(.hidden-text-num:hover) {
    .hidden-text-num {
      opacity: 0;
    }

    .ai-name-concat {
      overflow: visible;
      white-space: unset;
    }
  }
}
</style>
