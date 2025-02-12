<template>
  <div class="face-library">
    <g-layout :show-aside-header="false" :show-aside="false">
      <template #main-header>
        <header class="main-header" v-auth="'ai-service-edit'">
          <a-dropdown placement="bottomLeft">
            <a-button type="primary" class="alone-icon-button" v-auth="'ai-service-edit'"> 新增 </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleAddFace">添加</a-menu-item>
                <a-menu-item @click="handleAddImage">批量上传</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </header>
      </template>
      <template #main>
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
            :module-type="ModuleType.AI_FACE"
            v-model:value="imageList"
            v-model:checked-list="checkedList"
            :disabled-update-upload="true"
            :disabled-delete="true"
            :readonly="!checkKey('ai-service-edit')"
            :show-checkbox-hover="true"
            @on-remove="onRemoveImage"
            @on-update="onUpdateFace"
            @on-checked-change="onCheckedChange"
          />
        </main>
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
  <g-modal
    width="600px"
    destroyOnClose
    :title="faceFormTitle"
    v-model:visible="faceFormVisible"
    :maskClosable="false"
    @ok="onFaceSubmit"
    :ok-button-props="{
      loading: faceAddFormLoading || faceUpdateFormLoading,
    }"
    :bodyStyle="{ padding: '40px 62px 20px' }"
  >
    <a-form :model="faceForm" ref="faceFormRef" layout="vertical" :rules="faceRules">
      <a-form-item label="人员类型" name="faceRecognitionStorageType">
        <a-radio-group v-model:value="faceForm.faceRecognitionStorageType">
          <a-radio :value="1">白名单</a-radio>
          <a-radio :value="0">黑名单</a-radio>
        </a-radio-group>
      </a-form-item>
      <span class="face-form-line" />
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
      <a-form-item label="名称" name="name">
        <a-input v-model:value="faceForm.name" :maxlength="20" placeholder="请输入"></a-input>
      </a-form-item>
      <div class="flex" style="gap: 0 80px">
        <a-form-item label="年龄" name="age">
          <a-input-number v-model:value="faceForm.age" :min="0" :max="999"></a-input-number>
        </a-form-item>
        <a-form-item label="性别" name="gender">
          <a-radio-group v-model:value="faceForm.gender">
            <a-radio :value="0">男</a-radio>
            <a-radio :value="1">女</a-radio>
          </a-radio-group>
        </a-form-item>
      </div>
      <a-form-item label="证件号" name="cardNumber">
        <a-input v-model:value="faceForm.cardNumber" :maxlength="18" placeholder="请输入"></a-input>
      </a-form-item>
      <a-form-item label="地址" name="address">
        <a-input v-model:value="faceForm.address" :maxlength="30" placeholder="请输入"></a-input>
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
            文件名为【人员姓名】，例如【张三.jpg】。如果姓名中包含空格或特殊字符，请使用下划线代替
          </b>
        </p>
      </div>
    </template>
  </g-upload-select-modal>
</template>

<script setup lang="ts">
import useList from '@/hooks/useList'
import { aiApi } from '@/services/api'
import { ModuleType } from '@/services/api'
import { getFileName, getRealUrl } from '@/utils/utils'
import { FormInstance } from 'ant-design-vue'
import { message } from '@/utils/antd.util'
import { Rule } from 'ant-design-vue/es/form'
import { onMounted, ref, watchEffect } from 'vue'
import { useRequest } from 'vue-request'
import { FileList } from '@/components/g-upload-image.vue'
import { chineseAndNumberAndLetterReg, numberAndLetterReg } from '@/utils/regular'
import { checkKey } from '@/directives/auth'

/**
 * 获取图片数据
 */
const { dataList, pageForm, getDataList } = useList(aiApi.getFaceList, {
  offset: 1,
  limit: 50,
})
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
  gender: 0,
  cardNumber: '',
  address: '',
  age: 0,
  relativeFilePath: [],
  faceRecognitionStorageType: 1,
})
const faceRules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: '请输入名称',
      trigger: 'blur',
    },
    {
      pattern: chineseAndNumberAndLetterReg,
      message: '请输入汉字、数字或字母',
      trigger: 'blur',
    },
  ],
  relativeFilePath: [
    {
      required: true,
      message: '请上传图片',
    },
  ],
  // 证件号
  cardNumber: [
    {
      required: false,
      message: '请输入证件号',
      trigger: 'blur',
    },
    {
      pattern: numberAndLetterReg,
      message: '请输入数字或字母',
      trigger: 'blur',
    },
  ],
  // 地址
  address: [
    {
      required: false,
      message: '请输入地址',
      trigger: 'blur',
    },
    {
      pattern: chineseAndNumberAndLetterReg,
      message: '请输入汉字、数字或字母',
      trigger: 'blur',
    },
  ],
}
const handleAddFace = () => {
  faceForm.value = {
    gender: 0,
    faceRecognitionStorageType: 1,
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
  await runDeleteFace(ids.toString())
  getDataList()
  checkedList.value = []
  showCheckbox.value = false
  openSelect.value = false
  message.success('操作成功')
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
  if (chineseAndNumberAndLetterReg.test(getFileName(file.name))) {
    return Promise.resolve(true)
  }
  return Promise.reject('名称格式错误')
}

// 上传成功后的回调,用于发起业务请求
const onSuccess = (res: any) => {
  return aiApi.addFace({
    faceRecognitionStorageType: 1,
    relativeFilePath: res.relativeFilePath,
    name: getFileName(res.name),
  })
}
</script>
<style lang="less">
.face-library {
  .g-upload-image-list-item {
    .ant-checkbox-inner {
      background: #fff;
    }
    .ant-checkbox-checked {
      .ant-checkbox-inner {
        background-color: #1a6ff3;
      }
    }
  }
}
</style>
<style lang="less" scoped>
@import './common.less';
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
  .main-header {
    width: 100%;
    height: 68px;
    padding: 0 16px;

    border: 1px solid @border3;
    background: rgba(0, 0, 0, 0.1);
    line-height: 68px;
    border-radius: 10px 10px 0 0;

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
    border: 1px solid @border3;

    .selecting-data {
      background: @mask8;
      box-shadow: 0px -3.4px 5.85px 0px rgba(2, 36, 59, 0.03), 0px -17px 36px 0px rgba(2, 36, 59, 0.06);
      .selecting-data-operate {
        border-bottom: 1px solid @border3;
      }
    }
  }
}

.upload-image-wrap {
  display: flex;
  gap: 0 18px;
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
input {
  width: 328px;
}

.face-form-line {
  display: block;
  width: 100%;
  height: 1px;
  background-color: @border1;
  margin-bottom: 28px;
}
</style>
