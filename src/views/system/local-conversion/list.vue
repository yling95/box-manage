<template>
  <g-conf-module :show-page-tools="false">
    <template #Slot-Conf-Module-Header>
      <header class="local-detection-header">
        <div class="go-back-btn" @click="router.go(-1)">
          <i class="iconfont icon-arrow-go-back-line"></i>
        </div>
        <p>本地数据转换</p>
      </header>
    </template>
    <template #Slot-Conf-Module-Content>
      <div class="local-detection">
        <!-- 操作区域 -->
        <div class="operation">
          <!-- 筛选 -->
          <div class="filter">
            <div class="filter-item">
              <a-input
                style="width: 239px"
                placeholder="任务名称"
                v-model:value="pageForm.jobNameSearch"
                allowClear
                @press-enter="handleSearch"
                @change="!pageForm.jobNameSearch && handleSearch()"
              >
                <template #prefix>
                  <i class="iconfont icon-search-line"></i>
                </template>
              </a-input>
            </div>
            <div class="filter-item">
              <a-select
                v-model:value="pageForm.jobStates"
                class="select-item"
                :class="[pageForm.jobStates !== undefined && 'ant-select-focused']"
                placeholder="任务进度"
                :options="taskProgressOptions"
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
          <div class="the-top-right">
            <div @click="handleTaskQueue" ref="taskListBtnRef" id="taskBtnID">
              <div class="tasklist-num" v-if="taskNum">{{ taskNum }}</div>
              <div class="icon-tasklist">
                <i class="iconfont icon-tasklist-line"></i>
              </div>
            </div>

            <a-button type="primary" @click="handleToForm('add')"> 创建任务 </a-button>
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
              <div v-if="column.key === 'dataType'">
                {{ record.dataType === 0 ? '图片' : '视频' }}
              </div>

              <div v-else-if="column.key === 'schedule'">
                <div class="progress-wrap">
                  <p>{{ getScheduleInfo(record.jobStates)?.name }}</p>
                  <div
                    class="progress-container"
                    :class="([getScheduleInfo(record.jobStates)?.progressStatus] as any) || 'normal'"
                  >
                    <div
                      class="progress-bar"
                      :style="{ width: record.jobStates == 4 ? `100%` : `${Number(record.progress) || 0}%` }"
                    ></div>
                    <div class="progress-bar" :style="`width: ${Number(record.progress) || 0}%`"></div>
                  </div>
                  <a-tooltip :title="[getScheduleInfo(record.jobStates)?.tip]">
                    <a-button
                      type="text"
                      style="width: 29px"
                      class="alone-icon-button"
                      v-if="getScheduleInfo(record.jobStates)?.icon"
                    >
                      <i
                        class="iconfont"
                        :class="[getScheduleInfo(record.jobStates)?.icon]"
                        @click.stop="handleControlTask(record)"
                      ></i>
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
              <div v-else-if="column.key === 'operation'">
                <div class="table-operation">
                  <a-button type="link" @click.stop="handleToDetail(record)">详情</a-button>
                  <a-button type="link" :disabled="record.deletable === 0" @click.stop="handleDelete(record)"
                    >删除</a-button
                  >
                  <a-button type="link" :disabled="record.i === 0" @click.stop="handleExport(record)">导出</a-button>
                </div>
              </div>
            </template>
          </a-table>
        </div>
      </div>
      <typeaskExportQueue
        v-model:visible="taskListBarVisible"
        ref="exportFormRef"
        :buttonId="'taskBtnID'"
        v-model:taskNum="taskNum"
      ></typeaskExportQueue>
    </template>
  </g-conf-module>
</template>

<script setup lang="ts">
import { onActivated } from 'vue'
import useList from '@/hooks/useList'
import { localConversionApi } from '@/services/api'
import { TableProps, message } from 'ant-design-vue'
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { taskProgressOptions } from './config'
import { confirm } from '@/utils/antd.util'
import typeaskExportQueue from './components/task-export-queue.vue'

const router = useRouter()

// 查询
const handleSearch = () => {
  getDataList({ ...pageForm, offset: 1 })
}

// 新增
const handleToForm = (type: 'add' | 'edit' = 'add', id?: number) => {
  if (type === 'add') {
    router.push({ path: '/system-layout/local-conversion/form' })
  } else {
    router.push({ path: '/system-layout/local-conversion/form', query: { id } })
  }
}

// 控制任务
const handleControlTask = async (record: any) => {
  if (record.jobStates === 2 || record.jobStates === 3) {
    await localConversionApi.startTask(record.id)
    getDataList()
  } else if (record.jobStates === 0 || record.jobStates === 1) {
    confirm({
      title: '是否确认终止任务？任务终止后，将会清空现有检测内容，并重新开始。',
      onOk: async () => {
        try {
          await localConversionApi.stopTask(record.id)
          getDataList()
        } catch (error) {
          getDataList()
        }
      },
    })
  }
}

// 删除
const handleDelete = (record: any) => {
  confirm({
    title: '是否确认删除任务？删除任务后所有检测数据都将清空。',
    onOk: async () => {
      try {
        await localConversionApi.deleteTask(record.id)
        getDataList()
      } catch (error) {
        getDataList()
      }
    },
  })
}
const exportFormRef = ref<InstanceType<typeof typeaskExportQueue>>()
// 打开/关闭任务队列
const taskNum = ref<number>(0)
const taskListBarVisible = ref<boolean>(false)
const taskListBtnRef = ref<HTMLElement>()

const handleTaskQueue = async () => {
  taskListBarVisible.value = !taskListBarVisible.value
  if (taskListBarVisible.value) {
    await exportFormRef.value?.getExportListSync()
  }
}

// 导出
const handleExport = async (record: any) => {
  // 添加加入队列接口
  let params = {
    jobId: record.id,
    retryMark: 0,
    choseAllMark: 1,
  }
  let res: any = await localConversionApi.exportPrepare(params)
  if (res.code === 0) {
    message.info('已添加至任务队列')
    taskNum.value++
  }
}
// 跳转详情
const handleToDetail = (item: any) => {
  router.push({
    path: `/system-layout/local-conversion/detail/${item.id}`,
    query: {
      taskName: item.jobName,
      dataType: item.dataType,
    },
  })
}

// 获取任务进度信息
const getScheduleInfo = (id: number) => {
  const info = taskProgressOptions.find((item) => item.value === id)
  return info
}

// 表格结构
const columns = ref([
  {
    title: '任务名称',
    dataIndex: 'jobName',
    key: 'jobName',
    ellipsis: true,
    width: 200,
  },

  {
    title: '数据类型',
    dataIndex: 'dataType',
    key: 'dataType',
    width: 100,
  },
  {
    title: '检测数量（条）',
    dataIndex: 'convertNum',
    key: 'convertNum',
    width: 150,
  },
  {
    title: '操作人',
    dataIndex: 'createBy',
    key: 'createBy',
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 200,
  },
  {
    title: '任务进度',
    dataIndex: 'schedule',
    key: 'schedule',
    width: 240,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 180,
  },
])

// 表格数据
const { dataList, getDataList, loading, pageForm } = useList(
  localConversionApi.getList,
  {
    jobNameSearch: '',
    startTime: '',
    endTime: '',
    aiSrvId: undefined,
    jobStates: undefined,
  },
  () => {
    nextTick(() => {
      dataList.value = dataList.value.map((item) => {
        return {
          ...item,
        }
      })
    })
  },
)

const tableChange: TableProps<any>['onChange'] = (pagination) => {
  pageForm.limit = pagination.pageSize || 10
  getDataList({
    offset: pagination.current,
  })
}

// 初始化
onActivated(() => {
  getDataList()
  exportFormRef.value?.getExportListSync()
})
</script>

<style lang="less">
:deep(.conf-module-content) {
  ._container {
    height: 100% !important;
  }
}
.local-detection {
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
  display: flex;
  align-items: center;
  > p {
    margin-left: 10px;
  }
}

.local-detection {
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
    .the-top-right {
      display: flex;
      position: relative;
      align-items: center;

      .icon-tasklist {
        color: @text2;
        margin-right: 12px;
        display: flex;
        height: 36px;
        padding: 8px 10px;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        border: 1px solid @border3;
        background: @mask2;
        box-shadow: @shadow-ss;
        cursor: pointer;
      }
      .tasklist-num {
        position: absolute;
        top: 0;
        left: 20px;
        color: @text1;
        font-size: 12px;
        line-height: 20px;
        height: 16px;
        line-height: 14px;
        padding: 0px 6px;
        border-radius: 100px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: @danger;
      }
    }
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
