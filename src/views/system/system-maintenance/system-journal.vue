<template>
  <!-- <div>系统日志</div> -->
  <div class="page-system-journal">
    <div class="the-journal-content">
      <div class="the-content-search">
        <div class="search-left">
          <div class="the-search-detailSearch">
            <a-input v-model:value="systemLogSearch.account" placeholder="账号名称" @pressEnter="handleSearch()">
              <template #prefix>
                <i class="iconfont icon-search-line"></i>
              </template>
            </a-input>
          </div>
          <div class="the-search-datepicker">
            <div class="the-datepicker-content">
              <a-range-picker style="width: 240px" size="small" v-model:value="searchTime" @change="handleSearch" />
            </div>
          </div>
        </div>
        <div>
          <a-button @click="exportSelect" type="primary" v-show="!hasSelect" v-auth="'system-maintenance-log-export'">
            全部导出
          </a-button>
        </div>
      </div>
      <div class="the-content-table">
        <a-table
          sticky
          :columns="columns"
          :data-source="dataList"
          :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
          :on-change="tableChange"
          :pagination="{
            showTotal: () => `共${pageForm.total}条记录`,
            total: pageForm.total,
            current: pageForm.offset,
            showSizeChanger: true,
            size: 'small',
          }"
          :loading="loading"
          :row-key="(record) => record.id"
        >
          <!-- 暂无数据的效果 -->
          <template #emptyText>
            <div class="table-empty">
              <img src="@/assets/images/alarm/icon_list_empty.png" />
              <p>无数据</p>
            </div>
          </template>
        </a-table>
      </div>
    </div>
    <div class="the-journal-bottom" v-show="hasSelect">
      <div class="table-button" @click="resetSelect()">
        <span class="table-button_active">取消选中</span>
      </div>
      <div class="select-number">已选{{ state.selectedRowKeys.length }}条</div>
      <div class="select-export" v-auth="'system-maintenance-log-export'">
        <a-button @click="exportSelect">
          <i class="iconfont icon-upload-2-line" style="margin-right: 6px"></i>
          导出
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import { reactive, ref, onMounted, computed } from 'vue'
import { systemApi } from '@/services/api'
import useList from '@/hooks/useList'
import dayjs, { Dayjs } from 'dayjs'
dayjs.locale('zh-cn')
/**
 * 初始获取数据
 */
onMounted(() => {
  getDataList()
})

/**
 *  获取数据的方法
 */

// 系统日志查询数
const systemLogSearch = reactive<{
  account: string
  startTime: string
  endTime: string
  offset: number
  limit: number
  columns: string
  order: string
}>({
  account: '',
  startTime: '',
  endTime: '',
  offset: 1,
  limit: 20,
  columns: '',
  order: '',
})

const { dataList, getDataList, loading, pageForm } = useList(systemApi.systemLog, systemLogSearch)

type Key = string | number

const state = reactive<{
  selectedRowKeys: Key[]
  loading: boolean
}>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
})

const hasSelect = computed(() => !!state.selectedRowKeys.length)
/**
 *
 *  表格选择
 */
const onSelectChange = (selectedRowKeys: any) => {
  state.selectedRowKeys = selectedRowKeys
}

/**
 *   时间选择
 */
type RangeValue = [Dayjs, Dayjs]
const searchTime = ref<RangeValue | undefined>(undefined)
const handleSearch = () => {
  if (searchTime.value) {
    systemLogSearch.startTime = dayjs(searchTime.value?.[0]).format('YYYY-MM-DD')
    systemLogSearch.startTime += ' 00:00:00'
    systemLogSearch.endTime = dayjs(searchTime.value?.[1]).format('YYYY-MM-DD')
    systemLogSearch.endTime += ' 23:59:59'
  } else {
    systemLogSearch.startTime = ''
    systemLogSearch.endTime = ''
  }
  getDataList({ ...systemLogSearch, offset: 1 })
}

const resetSelect = () => {
  state.selectedRowKeys = []
}
const columns = ref<TableColumnsType>([
  {
    title: '用户',
    width: 180,
    dataIndex: 'account',
    key: 'account',
    fixed: 'left',
  },
  {
    title: 'IP',
    width: 240,
    dataIndex: 'ip',
    key: 'ip',
  },
  {
    title: '时间',
    width: 240,
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '功能模块',
    dataIndex: 'module',
    key: 'module',
    width: 240,
  },
  {
    title: '内容',
    dataIndex: 'operation',
    key: 'operation',
  },
])

/**
 * 导出功能能
 */
const exportSelect = async () => {
  try {
    await systemApi.getSystemExport({ selectIds: state.selectedRowKeys + '' })
  } catch (error) {
    console.log('error', error)
  }
}

const currentPage = ref<number>(1)

const tableChange = (pagination: TablePaginationConfig) => {
  if (!pagination.current) return
  if (currentPage.value !== pagination.current) {
    resetSelect()
  }
  currentPage.value = pagination.current
  getDataList({ limit: pagination.pageSize, offset: pagination.current })
}
</script>

<style lang="less" scoped>
:deep(.ant-pagination) {
  margin-bottom: 52px !important;
}
.page-system-journal {
  box-sizing: border-box;
  padding-top: 10px;
  // width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .the-journal-content {
    // padding: 0px 32px;
    flex: 1;

    .the-content-search {
      display: flex;
      height: 40px;
      width: 100%;
      justify-content: space-between;
      .search-left {
        display: flex;
      }
      .the-search-datepicker {
        display: flex;
        align-items: center;
        margin-right: 8px;
        line-height: 20px;

        .the-datepicker-content {
          // width: 216px;
          height: 40px;

          > span {
            color: @text2;
            font-size: 14px;
          }
          ::v-deep(.ant-picker-range) {
            width: 216px;
            height: 36px;
          }
        }
      }

      .the-search-detailSearch {
        width: 240px;
        margin-right: 8px;

        .ant-input-affix-wrapper {
          height: 36px;
        }
      }
    }

    .the-content-table {
      margin: 10px 0 0px;
      overflow-y: auto;
      height: calc(100vh - 245px) !important;
    }
  }

  .the-journal-bottom {
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 14px;
    left: 175px;
    height: 52px;
    z-index: 2;
    border-top: 1px solid @border3;
    background: linear-gradient(180deg, #203a63 0%, #0e203d 100%);
    box-shadow: 0px -3.4px 5.85px 0px rgba(2, 36, 59, 0.03), 0px -17px 36px 0px rgba(2, 36, 59, 0.06);
    display: flex;
    width: calc(100% - 160px - 32px - 0px);
    border-radius: 0px 0px 8px 8px;

    .table-button {
      width: 124px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      border-right: 1px solid @border2;
      .table-button_active {
        color: @text3;
        font-size: 14px;
        line-height: 22px;
        cursor: pointer;
      }
      .table-button_disable {
        color: #ccc;
      }
    }

    .select-number {
      width: 124px;
      height: 36px;
      font-weight: 400;
      font-size: 14px;
      line-height: 36px;
      text-align: center;
      color: @primary2;
    }

    .select-export {
      height: 36px;
      width: 60px;
    }
  }
}
</style>
