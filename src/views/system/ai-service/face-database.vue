<template>
  <g-conf-module :show-page-tools="false">
    <template #Slot-Conf-Module-Header>
      <div class="header-title">
        <div class="g-second-page-title">
          <i class="iconfont icon-arrow-go-back-line" @click="$router.go(-1)"></i>
          <div class="title" style="color: white">人脸库</div>
        </div>
        <div class="tab-box">
          <span :class="['tab', { 'tab--active': activeListType === 1 }]" @click="changListType(1)">白名单</span>
          <span :class="['tab', { 'tab--active': activeListType === 0 }]" @click="changListType(0)">黑名单</span>
        </div>
      </div>
    </template>
    <template #Slot-Conf-Module-Content>
      <div class="face-library">
        <div class="search">
          <a-input
            style="width: 239px; height: 36px"
            placeholder="人员姓名/ID"
            v-model:value="pageForm.person"
            allowClear
            @press-enter="handleSearch"
            @change="!pageForm.person && handleSearch()"
          >
            <template #prefix>
              <i class="iconfont icon-search-line"></i>
            </template>
          </a-input>

          <a-dropdown placement="bottomLeft">
            <a-button type="primary" class="alone-icon-button" v-auth="'ai-service-edit'"> 新增 </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleAddFace">添加</a-menu-item>
                <a-menu-item @click="handleAddImage">批量上传</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <g-layout :show-aside-header="false" :show-aside="false" :height="'calc(100vh - 84px - 78px - 32px - 80px)'">
          <template #main>
            <a-spin :spinning="dataListLoading">
              <main class="main">
                <g-upload-image
                  :dpi="[
                    [96, 96],
                    [2048, 1080],
                  ]"
                  :show-name="true"
                  :show-add="false"
                  :max-file-size="10"
                  :show-checkbox="showCheckbox"
                  :read-record-icon="true"
                  :module-type="ModuleType.AI_FACE"
                  v-model:value="imageList"
                  v-model:checked-list="checkedList"
                  :disabled-update-upload="true"
                  :disabled-delete="true"
                  :show-delete-icon="false"
                  :uploadUrl="'/ai/face/recognition/upload'"
                  :readonly="!checkKey('ai-service-edit')"
                  :show-checkbox-hover="true"
                  @on-remove="onRemoveImage"
                  @on-update="onUpdateFace"
                  @on-checked-change="onCheckedChange"
                  @on-read-record="onReadRecord"
                />
              </main>
              <a-empty
                v-if="!imageList.length"
                style="padding-top: 216px; color: rgba(255, 255, 255, 0.45)"
                :image="simpleImage"
              >
                <template #description>
                  <span style="color: rgba(255, 255, 255, 0.45)"> 无数据 </span>
                </template>
              </a-empty>
            </a-spin>
          </template>
          <template #main-footer>
            <footer class="main-footer">
              <div class="selecting-data">
                <div class="selecting-data-operate" v-if="showCheckbox">
                  <div class="selecting-data-operate-select">
                    <a-checkbox :checked="checkAll" @change="handleCheckAll">全选本页</a-checkbox>
                    <span></span>
                    <p>已选中{{ checkedList.length }}条</p>
                  </div>
                  <div class="selecting-data-operate-operate">
                    <a-button
                      type="default"
                      class="icon-button"
                      :disabled="checkedList.length === 0"
                      @click="deleteFace(checkedList)"
                      :loading="deleteFaceLoading"
                    >
                      <i class="iconfont icon-delete-bin-6-line"></i>
                      删除
                    </a-button>
                  </div>
                </div>
                <div class="selecting-data-groove">
                  <a-button type="default" class="icon-button" @click="onSelectImage" v-auth="'ai-service-edit'">
                    <i class="iconfont icon-arrow-up-s-line" v-if="!showCheckbox"></i>
                    <i class="iconfont icon-close-line" v-else></i>
                    {{ !showCheckbox ? '选择' : '取消' }}
                  </a-button>
                  <div class="groove">
                    <a-pagination
                      size="small"
                      :current="pageForm.offset"
                      :page-size="pageForm.limit"
                      :total="pageForm.total"
                      :show-total="(total: number) => `共${total}条记录`"
                      :showSizeChanger="true"
                      @change="onPaginationChange"
                    />
                  </div>
                </div>
              </div>
            </footer>
          </template>
        </g-layout>
      </div>
    </template>
  </g-conf-module>

  <g-modal
    width="660px"
    destroyOnClose
    :title="faceFormTitle"
    v-model:visible="faceFormVisible"
    :maskClosable="false"
    @ok="onFaceSubmit"
    :ok-button-props="{
      loading: faceAddFormLoading || faceUpdateFormLoading,
    }"
    :bodyStyle="{ padding: '40px' }"
  >
    <a-form
      :model="faceForm"
      ref="faceFormRef"
      layout="vertical"
      :rules="faceRules"
      style="width: 476px; margin: 0 auto"
    >
      <a-form-item name="relativeFilePath">
        <div class="upload-image-wrap">
          <g-upload-image
            :dpi="[
              [96, 96],
              [2048, 1080],
            ]"
            accept="bmp,jpeg,png,jpg"
            :count="1"
            placeholder="上传照片"
            :module-type="ModuleType.AI_FACE"
            :uploadUrl="'/ai/face/recognition/upload'"
            :max-file-size="10"
            v-model:value="faceForm.relativeFilePath"
            size="large"
          ></g-upload-image>
          <div>
            <p><span>1.</span>人脸照片应该清晰、无遮挡、无模糊、无变形，确保能够准确识别出人脸特征；</p>
            <p><span>2.</span>至少96*96像素，最大2048*1080像素，最大不超过10MB；</p>
            <p><span>3.</span>图片格式JPG、PNG、BMP、JPEG</p>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="人员姓名" name="name">
        <a-input v-model:value="faceForm.name" :maxlength="20" style="width: 328px" placeholder="请输入"></a-input>
      </a-form-item>
      <a-form-item label="人员ID" name="thirdpartyId">
        <a-input
          :disabled="faceFormTitle === '修改'"
          v-model:value="faceForm.thirdpartyId"
          :maxlength="100"
          style="width: 328px"
          placeholder="请输入"
        ></a-input>
      </a-form-item>
    </a-form>
  </g-modal>
  <g-upload-select-modal
    :dpi="[
      [96, 96],
      [2048, 1080],
    ]"
    accept="bmp,jpeg,png,jpg"
    :max-file-size="10"
    v-model:visible="visible"
    title="上传人脸照片要求："
    :on-success="onSuccess"
    :module-type="ModuleType.AI_FACE"
    @on-cancel="onSelectModalCancel"
    :uploadUrl="'/ai/face/recognition/upload'"
    :before-upload="beforeUpload"
  >
    <template #subTitle>
      <div class="sub-title">
        <p><span>1.</span>人脸照片应该清晰、无遮挡、无模糊、无变形，确保能够准确识别出人脸特征；</p>
        <p><span>2.</span>至少96*96像素，最大2048*1080像素，最大不超过10MB；</p>
        <p><span>3.</span>图片格式JPG、PNG、BMP、JPEG</p>
        <p>
          <span>4.</span>
          <b style="font-weight: 700">
            文件名为【人员姓名】，例如【张三.jpg】。请勿在文件名前位、后位或者全部使用空格作为文件名
          </b>
        </p>
      </div>
    </template>
  </g-upload-select-modal>
</template>

<script lang="ts" setup>
import useList from '@/hooks/useList'
import { aiApi } from '@/services/api'
import { useRouter } from 'vue-router'
import { ModuleType } from '@/services/api'
import { getFileName, getRealUrl } from '@/utils/utils'
import { FormInstance } from 'ant-design-vue'
import { message } from '@/utils/antd.util'
import { Rule } from 'ant-design-vue/es/form'
import { onMounted, ref, watchEffect } from 'vue'
import { useRequest } from 'vue-request'
import { FileList } from '@/components/g-upload-image.vue'
import { allStartEndSpaceReg } from '@/utils/regular'
import { checkKey } from '@/directives/auth'
import simpleImage from '@/assets/images/alarm/icon_list_empty.png'
import { confirm } from '@/utils/antd.util'

const router = useRouter()

type ActiveListType = 0 | 1 // 0黑名单 1白名单
const activeListType = ref<ActiveListType>(1)

// 切换 白名单/黑名单
const changListType = (type: ActiveListType) => {
  console.log('当前选中的名单类型')
  activeListType.value = type
  pageForm.offset = 1
  pageForm.limit = 50
  pageForm.type = activeListType.value
  handleSearch()
}

/**
 * 获取图片数据
 */
const {
  dataList,
  pageForm,
  getDataList,
  loading: dataListLoading,
} = useList(aiApi.getFaceList, {
  offset: 1,
  limit: 50,
  person: '',
  type: activeListType.value,
})

const handleSearch = () => {
  getDataList({ ...pageForm, offset: 1 })
}
const onPaginationChange = (page: number, pageSize: number) => {
  console.log(page, pageSize)
  checkAll.value = false
  checkedList.value = []
  getDataList({ offset: page, limit: pageSize })
}
const imageList = ref<FileList[]>([])

watchEffect(() => {
  imageList.value = dataList.value.map((item: any) => {
    return {
      uid: item.id,
      name: item.name,
      url: getRealUrl(item.imageLocation),
      status: 'done',
    }
  }) as FileList[]
})

onMounted(() => {
  getDataList()
})

/**
 * 新增/修改人脸
 */
const faceFormVisible = ref<boolean>(false)
const faceFormTitle = ref<string>('添加')
const faceFormRef = ref<FormInstance>()
const faceForm = ref<any>({
  name: '',
  thirdpartyId: '',
  relativeFilePath: [],
  faceRecognitionStorageType: activeListType.value,
})
const faceRules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: '请输入名称',
      trigger: 'blur',
    },
    {
      pattern: allStartEndSpaceReg,
      message: '请勿在文件名前位、后位或者全部使用空格作为文件名',
      trigger: 'blur',
    },
  ],
  relativeFilePath: [
    {
      required: true,
      message: '请上传图片',
    },
  ],
}
const handleAddFace = () => {
  faceForm.value = {
    gender: 0,
    faceRecognitionStorageType: activeListType.value,
    relativeFilePath: [],
  }
  faceFormRef.value?.resetFields()
  faceFormTitle.value = '添加'
  faceFormVisible.value = true
}
// 修改人脸
const onUpdateFace = (item: any, index: number) => {
  faceFormTitle.value = '修改'
  faceFormVisible.value = true
  const data: any = dataList.value[index]
  faceForm.value = data
  faceForm.value.relativeFilePath = [
    {
      uid: item.uid,
      name: item.name,
      url: item.url,
      originalUrl: data.imageLocation,
    },
  ]
}
const { loading: faceAddFormLoading, runAsync: runAddFace } = useRequest(aiApi.addFace)
const { loading: faceUpdateFormLoading, runAsync: runUpdateFace } = useRequest(aiApi.updateFace)
const onFaceSubmit = async () => {
  try {
    await faceFormRef.value?.validate()
    const params = {
      ...faceForm.value,
      relativeFilePath: faceForm.value.relativeFilePath[0].originalUrl,
    }
    if (faceFormTitle.value === '添加') {
      await runAddFace(params)
    } else {
      await runUpdateFace(params)
    }
    getDataList({ offset: 1 })
    faceForm.value = {}
    faceForm.value.relativeFilePath = []
    message.success('操作成功')
    faceFormVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

/**
 * 删除人脸
 */
const checkAll = ref<boolean>(false)
const openSelect = ref<boolean>(false)
const handleCheckAll = (e: any) => {
  checkAll.value = e.target.checked
  if (checkAll.value) {
    checkedList.value = dataList.value.map((item: any) => item.id)
  } else {
    checkedList.value = []
  }
}
const onRemoveImage = (item: FileList) => {
  item.status = 'loading'
  deleteFace([item.uid!])
}
const { loading: deleteFaceLoading, runAsync: runDeleteFace } = useRequest(aiApi.deleteFace)
const deleteFace = async (ids: number[]) => {
  confirm({
    title: '确认删除当前选中的选人脸信息？',
    onOk: async () => {
      await runDeleteFace(ids.toString())
      getDataList()
      checkedList.value = []
      showCheckbox.value = false
      openSelect.value = false
      message.success('操作成功')
    },
    onCancel: () => {},
  })
}

// 多选图片
const showCheckbox = ref<boolean>(false)
const checkedList = ref<number[]>([])
const onSelectImage = () => {
  showCheckbox.value = !showCheckbox.value
  checkedList.value = []
  checkAll.value = false
}
const onCheckedChange = () => {
  showCheckbox.value = true
  checkAll.value = checkedList.value.length === dataList.value.length
}

const onReadRecord = (item: { name: any }, index: any) => {
  console.log('需要查看识别记录', item, index)
  router.push({
    path: '/record',
    query: {
      personName: item.name,
    },
  })
}

const visible = ref<boolean>(false)
// 打开上传弹窗
const handleAddImage = () => {
  visible.value = true
}
// 关闭上传弹窗
const onSelectModalCancel = () => {
  showCheckbox.value = false
  getDataList({ offset: 1 })
}

const beforeUpload = (file: File) => {
  if (allStartEndSpaceReg.test(getFileName(file.name))) {
    return Promise.resolve(true)
  }
  return Promise.reject('请勿在文件名前位、后位或者全部使用空格作为文件名')
}

// 上传成功后的回调,用于发起业务请求
const onSuccess = (res: any) => {
  return aiApi.addFace({
    faceRecognitionStorageType: activeListType.value,
    relativeFilePath: res.relativeFilePath,
    name: getFileName(res.name),
  })
}
</script>

<style lang="less" scoped>
@import './_components/common.less';
.header-title {
  display: flex;
  .tab-box {
    display: flex;
    align-items: center;
    margin-left: 32px;
    gap: 0 10px;
    .tab {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 22px; /* 157.143% */
      box-sizing: border-box;
      height: 30px;
      color: @text3;
      cursor: pointer;
      transition: all 0.3s;
      &--active {
        color: @text2;
        background: @mask4;
      }
    }
  }
}

.ant-dropdown-menu {
  padding: 4px !important;
  border-radius: 6px;
  background: @background2;
  box-shadow: @shadow-m;
  width: 119px;

  .menu-icon-item {
    display: flex;
    justify-content: center;
    align-items: center;
    color: @text1;
    gap: 0 8px;
    padding: 5px 12px;
  }
  .ant-dropdown-menu-item {
    color: @text2;
  }
  .ant-dropdown-menu-item:hover,
  .ant-dropdown-menu-submenu-title:hover {
    border-radius: 4px;
    padding: 5px 12px;
    background: @mask1;
  }
}

.face-library {
  height: 100%;
  .search {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: @text1;
    margin-bottom: 16px;
    .alone-icon-button {
      width: 56px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid @border3;
      background: @primary1;
    }
  }
  .main {
    padding: 16px;
    background: #202c40;
  }

  .main-footer {
    height: 100%;
    display: flex;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0 0 4px 4px;

    .selecting-data {
      border-radius: 4px;
      border-top: none;
      background: linear-gradient(180deg, #203a63 0%, #0e203d 100%), #132238;
      box-shadow: 0px -17px 36px 0px rgba(2, 36, 59, 0.06), 0px -3.4px 5.85px 0px rgba(2, 36, 59, 0.03);
      .selecting-data-operate {
        border-bottom: 1px solid @border3;
      }
    }
  }
}

.upload-image-wrap {
  display: flex;
  gap: 0 20px;
  p {
    font-size: 12px;
    color: @text4;
    line-height: 18px;
    margin: 0;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    display: flex;
    span {
      margin-right: 4px;
    }
  }
}
</style>
