<template>
  <div class="local-detection-page">
    <div class="local-detection-detail-wrap">
      <header>
        <div class="go-back-btn" @click="router.replace('/system-layout/local-detection/list')">
          <i class="iconfont icon-arrow-go-back-line"></i>
        </div>
        <p>{{ taskName }}-{{ Date.now() }}</p>
      </header>
      <main class="local-detection-detail-main">
        <div class="operation">
          <!-- 筛选 -->
          <div class="filter">
            <a-select
              :loading="aiListLoading"
              v-model:value="pageForm.aiSrvTypeId"
              class="select-item"
              placeholder="AI服务"
              :options="aiList"
              @change="handleSearch"
              allow-clear
              :showSearch="false"
              showArrow
              mode="multiple"
              max-tag-count="responsive"
            >
            </a-select>
            <a-input
              style="width: 321px"
              placeholder="文件名称"
              v-model:value="pageForm.filenameSearch"
              allowClear
              size="small"
              @press-enter="handleSearch"
              @change="!pageForm.filenameSearch && handleSearch()"
            >
              <template #prefix>
                <i class="iconfont icon-search-line"></i>
              </template>
            </a-input>
          </div>
          <!-- <a-button type="primary" v-auth="'system-maintenance-account-number-add'" @click="handleAllExport">
            导出全部
          </a-button> -->
        </div>
        <a-checkbox-group v-model:value="checkedList" class="card-wrap" @change="onCheckboxGroupChange">
          <a-spin :spinning="cardLoading" class="loading">
            <div style="display: flex; justify-content: center">
              <a-empty style="padding-top: 216px" v-if="!cardLoading && dataList?.length === 0" :image="simpleImage">
                <template #description>
                  <span style="color: rgba(255, 255, 255, 0.45)"> 无数据 </span>
                </template>
              </a-empty>
            </div>
            <div class="card-list" :style="{ paddingBottom: isOpenSelect ? '110px' : '60px' }">
              <label
                :for="isOpenSelect ? item.id : ''"
                :id="`card-list-item-${index}`"
                :class="['card-list-item', isOpenSelect && 'checked', alarmModalActiveIndex === index && 'active']"
                v-for="(item, index) in dataList"
                :key="item.id"
                :tabindex="alarmModalActiveIndex === index ? 0 : -1"
                @click="handleClickItem(item, index)"
              >
                <div class="mask"></div>
                <p class="senceName" :title="item.originalName" v-if="item.originalName">
                  {{ item?.originalName }}
                </p>
                <div class="img-wrap">
                  <img
                    :data-src="getRealUrl(item.filepath)"
                    class="lazyload"
                    :key="getRealUrl(item.filepath)"
                    :onerror="
                    (e:any) => {
                      e.target.src = defaultImage
                      e.target.onerror = null
                    }
                  "
                  />
                </div>
                <ul>
                  <li>
                    <p :title="item.aiSrvName">{{ item.aiSrvName || '' }}</p>
                  </li>
                  <li>
                    <p>{{ item.createTime }}</p>
                  </li>
                </ul>
                <div class="right-top" v-auth="'record-select'" v-show="isOpenSelect" @click.stop>
                  <a-checkbox :id="item.filepath" :value="item.filepath"></a-checkbox>
                </div>
              </label>
            </div>
          </a-spin>
        </a-checkbox-group>
      </main>
      <div class="suspend">
        <g-operate-select
          v-model:show="isOpenSelect"
          v-model:check-all="checkAll"
          :checked-list="checkedList"
          @on-check-all="handleCheckAll"
          @on-export="handleExport"
        ></g-operate-select>
        <div class="suspend-pagination">
          <a-button
            type="default"
            class="icon-button"
            :class="[isOpenSelect && 'icon-select-button']"
            @click="handleOpenSelect"
            v-auth="'record-select'"
          >
            <i class="iconfont icon-arrow-up-s-fill" v-if="!isOpenSelect"></i>
            <i class="iconfont icon-close-line" v-else></i>
            {{ isOpenSelect ? '取消' : '选择' }}
          </a-button>
          <div class="pagination">
            <a-pagination
              size="small"
              :current="pageForm.offset"
              :page-size="pageForm.limit"
              :total="pageForm.total"
              :show-total="(total: number) => `共${total}条记录`"
              :showSizeChanger="true"
              @change="onPaginationChange"
              :pageSizeOptions="['50', '100', '200']"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <g-preview-record-modal
    ref="alarmModalRef"
    :active-index="alarmModalActiveIndex"
    :hide-prev="hidePrev"
    :hide-next="hideNext"
    @next="nextImage"
    @prev="prevImage"
    @close="onAlarmModalClose"
  />
</template>

<script setup lang="ts">
import useList from '@/hooks/useList'
import { aiApi, downloadFile, localDetectionApi } from '@/services/api'
import { nextTick, ref } from 'vue'
import { useRequest } from 'vue-request'
import { useRoute, useRouter } from 'vue-router'
import simpleImage from '@/assets/images/alarm/icon_list_empty.png'
import { getRealUrl } from '@/utils/utils'
import AlarmModal, { CarouselDataProps } from '@/components/g-preview-record-modal.vue'
import defaultImage from '@/assets/images/alarm/default.jpg'
import { useGlobalStore } from '@/store/global'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
const { updateLoading } = globalStore

const detailId = route.params.id
const taskName = route.query.taskName

// AI服务列表
const {
  loading: aiListLoading,
  data: aiList,
  runAsync: runGetAiList,
} = useRequest<any, any>(aiApi.getLocalDetectAiList, {
  onSuccess: ({ data }) => {
    aiList.value = data?.map((item: any) => ({
      label: item.aiSrvName,
      value: item.aiSrvId,
    }))
  },
})

// 全部导出
// const handleAllExport = () => {
//   exportData({ jobId: detailId })
// }

// 选择导出
const handleExport = () => {
  exportData({ filePaths: checkedList.value, jobName: taskName })
}

// 导出
const exportData = async (params: any) => {
  exportDisabled.value = true
  try {
    updateLoading(true, { tip: '正在导出，请稍后...' })
    const { data } = await localDetectionApi.recordExport(params)
    downloadFile(getRealUrl(data.downloadUrl), data.downloadUrl.split('/').pop())
    exportDisabled.value = false
    isOpenSelect.value = false
    checkedList.value = []
    checkAll.value = false
    updateLoading(false)
  } catch (error) {
    exportDisabled.value = false
    updateLoading(false)
  }
}

const alarmModalRef = ref<InstanceType<typeof AlarmModal>>()
const handleClickItem = (_item: any, index: number) => {
  if (isOpenSelect.value) return
  hidePrevAndNext(index)
  const data = dataListToModalList(dataList.value)
  alarmModalActiveIndex.value = index
  alarmModalRef.value?.openModal(data, index)
}

const hidePrev = ref(false)
const hideNext = ref(false)
const alarmModalActiveIndex = ref(-1)

// 下一张
const nextImage = async () => {
  alarmModalActiveIndex.value++
  if (hidePrevAndNext(alarmModalActiveIndex.value) === 1) {
    alarmModalActiveIndex.value = dataList.value.length - 1
    return
  }
  if (pageForm.offset === pageForm.pages) return
  if (alarmModalActiveIndex.value <= dataList.value.length - 1) {
    return
  }
  await getDataList({ offset: pageForm.offset + 1 })
  alarmModalActiveIndex.value = 0
  nextTick(() => {
    const data = dataListToModalList(dataList.value)
    alarmModalRef.value?.changeData(data)
  })
}

// 上一张
const prevImage = async () => {
  alarmModalActiveIndex.value--
  if (hidePrevAndNext(alarmModalActiveIndex.value) === -1) {
    alarmModalActiveIndex.value = 0
    return
  }
  if (pageForm.offset === 1) return
  if (alarmModalActiveIndex.value >= 0) {
    return
  }
  await getDataList({ offset: pageForm.offset - 1 })
  alarmModalActiveIndex.value = dataList.value.length - 1
  nextTick(() => {
    const data = dataListToModalList(dataList.value)
    alarmModalRef.value?.changeData(data)
  })
}

// 改变上一张下一张按钮的显示
const hidePrevAndNext = (index: number) => {
  hidePrev.value = false
  hideNext.value = false
  if (pageForm.offset === 1 && index <= 0) {
    hidePrev.value = true
    return -1
  }
  if (pageForm.offset === pageForm.pages && index >= dataList.value.length - 1) {
    hideNext.value = true
    return 1
  }

  return 0
}

// 数据转换
const dataListToModalList = (dataList: any[]) => {
  return dataList.map((item) => {
    return {
      id: item.id,
      tag: item.aiSrvName,
      time: item.createTime,
      image: getRealUrl(item.filepath),
      video: getRealUrl(item.filepath),
      title: item.originalName,
      downLoadLink: getRealUrl(item.filepath),
      type: 'image',
    }
  }) as CarouselDataProps[]
}

const onAlarmModalClose = () => {
  const domId = `card-list-item-${alarmModalActiveIndex.value}`
  const dom = document.getElementById(domId)
  dom?.focus()
  dom?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  })
}

const onPaginationChange = (page: number, pageSize: number) => {
  checkAll.value = false
  checkedList.value = []
  document.querySelector('.card-wrap')?.scrollTo(0, 0)
  getDataList({ offset: page, limit: pageSize })
}

/**
 * 选中的列表
 */
const checkedList = ref<any[]>([])
const checkAll = ref<boolean>(false)
const isOpenSelect = ref<boolean>(false)
const exportDisabled = ref<boolean>(false)
// 全选、反选
const handleCheckAll = (checked: boolean) => {
  checkAll.value = checked
  if (checkAll.value) {
    checkedList.value = dataList.value.map((item: any) => item.filepath)
  } else {
    checkedList.value = []
  }
}
const onCheckboxGroupChange = (checkedList: any[]) => {
  isOpenSelect.value = true
  checkAll.value = checkedList.length === dataList.value.length
}
const handleOpenSelect = () => {
  isOpenSelect.value = !isOpenSelect.value
  checkedList.value = []
  checkAll.value = false
}

const {
  dataList,
  getDataList,
  loading: cardLoading,
  pageForm,
} = useList(localDetectionApi.getDetail, {
  aiSrvTypeId: undefined,
  jobId: detailId,
  filenameSearch: '',
  limit: 50,
})

const handleSearch = () => {
  getDataList({ offset: 1 })
}

const init = () => {
  runGetAiList()
  getDataList()
}
init()
</script>

<style lang="less" scoped>
@import './styles/index.less';
:deep(.ant-checkbox-inner) {
  background-color: #fff !important;
}
:deep(.ant-checkbox-checked) {
  .ant-checkbox-inner {
    background-color: #1a6ff3 !important;
  }
}
.local-detection-detail-wrap {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: rgba(46, 75, 120, 0.15);
  display: flex;
  flex-direction: column;
  position: relative;

  > header {
    width: 100%;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 0 12px;
    padding: 22px 40px 16px;
    border-bottom: 1px solid @border2;
    box-shadow: 0px 1px 2px 0px rgba(2, 36, 59, 0.03);

    > p {
      font-size: 22px;
      font-weight: 700;
      line-height: 32px;
      color: @text2;
    }
  }

  .local-detection-detail-main {
    width: 100%;
    flex: 1;
    padding: 24px 0;
    overflow: auto;
    display: flex;
    flex-direction: column;

    .operation {
      display: flex;
      padding: 0 40px 16px;
      justify-content: space-between;

      .filter {
        display: flex;
        gap: 0 12px;

        .select-item {
          width: 321px;
        }
      }
    }
  }

  .senceName {
    width: 100%;
    position: absolute;
    color: @text1;
    text-shadow: 0px 0px 2px rgba(2, 36, 59, 0.8);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 22px;
    bottom: 26px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
    display: flex;
    width: calc(100% - 8px);
    padding: 2px 4px;
    flex-direction: column;
    align-items: flex-start;
    gap: -2px;
    display: block;
    .ellipsis();
  }
  .mask {
    position: absolute;
    top: 0;
    width: calc(100% - 8px);
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
    display: flex;
    height: 30px;
    padding: 2px 10px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    gap: -2px;
    display: none;
  }
  .card-wrap {
    flex: 1;
    overflow: auto;
    width: 100%;
    padding: 0 40px;
    .card-list {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(274px, 1fr));
      padding: 0 0 63px;

      .card-list-item {
        height: 210px;
        padding: 4px;
        border-radius: 6px;
        position: relative;
        cursor: pointer;
        border: 1px solid @border3;
        background: rgba(72, 145, 255, 0.06);
        box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.14), 0px 1px 3px 0px rgba(37, 37, 45, 0.14);

        .img-wrap {
          width: 100%;
          height: 178px;
          > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
          }
        }

        > ul {
          margin-top: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          > li {
            gap: 0 4px;
            font-size: 12px;
            color: @text1;
            line-height: 20px;
            padding: 0 4px;
            &:first-child p {
              max-width: 160px;
            }
            &:last-child p {
              font-weight: 400;
              color: rgba(117, 148, 194, 1);
            }
            > p {
              .ellipsis();
              color: @text1;
              font-weight: 700;
              font-size: 14px;
            }
          }
        }

        .right-top {
          position: absolute;
          top: 6px;
          right: 8px;
        }

        &:hover,
        &.checked {
          background: rgba(72, 145, 255, 0.2);
          border-radius: 6px;
          border: 1px solid @mask3;
          box-shadow: 0px 2px 8px 0px rgba(37, 37, 45, 0.14), 0px 1px 3px 0px rgba(37, 37, 45, 0.14);
          .mask {
            display: block;
          }
          .senceName {
            display: block;
          }
          .right-top {
            display: block !important;
          }
          &::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
          }
        }

        &:focus {
          outline: none;
        }
        &.active {
          &:focus {
            border: 2px solid @primary1;
          }
        }
      }
    }
  }

  .suspend {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid @border3;
    background: linear-gradient(180deg, #203a63 0%, #0e203d 100%), #132238;
    box-shadow: 0px -3.4px 5.85px 0px rgba(2, 36, 59, 0.03), 0px -17px 36px 0px rgba(2, 36, 59, 0.06);

    .suspend-pagination {
      height: 48px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      position: relative;

      .pagination {
        margin: 0 auto;
      }

      .icon-button {
        position: absolute;
      }
      .icon-select-button {
        // background-color: rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        border: 1px solid @border2;
        background: @mask2;
      }
    }
  }
}
</style>
