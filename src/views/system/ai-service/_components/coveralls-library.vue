<template>
  <div class="coveralls-library">
    <g-layout>
      <template #aside-header>
        <header class="aside-header">
          <h6>工服类型</h6>
          <div v-auth="'ai-service-edit'">
            <a-button
              type="primary"
              size="small"
              class="alone-icon-button"
              style="width: 30px; height: 30px"
              @click="handleOpenAsideForm('add')"
            >
              <i class="iconfont icon-add-line"></i>
            </a-button>
          </div>
        </header>
      </template>
      <template #aside-main>
        <ul class="aside-main-list">
          <a-spin v-if="asideLoading" />
          <template v-else>
            <li
              class="aside-main-list-item"
              :class="[index === activeIndex && 'active']"
              v-for="(item, index) in asideList"
              @click="onClickItem(item, index)"
              :key="item.id"
            >
              <p>{{ item.uniformCategoryName }}</p>
              <div class="aside-main-list-item-operation">
                <a-button
                  type="text"
                  size="small"
                  class="alone-icon-button"
                  v-auth="'ai-service-edit'"
                  @click.stop="handleOpenAsideForm('edit', item)"
                >
                  <i class="iconfont icon-edit-fill"></i>
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  class="alone-icon-button"
                  v-auth="'ai-service-edit'"
                  @click.stop="handleDeleteAside(item)"
                >
                  <i class="iconfont icon-delete-bin-fill"></i>
                </a-button>
              </div>
              <div class="aside-main-list-item-status">
                <span></span>
              </div>
            </li>
          </template>
        </ul>
      </template>
      <template #main-header>
        <header class="main-header" v-if="asideList.length">
          <h6>{{ uniformItem?.uniformCategoryName }}</h6>
          <a-button
            type="primary"
            class="alone-icon-button"
            style="width: 46px; height: 36px"
            @click="handleAddImage"
            v-auth="'ai-service-edit'"
          >
            <i class="iconfont icon-add-line"></i>
          </a-button>
        </header>
      </template>
      <template #main>
        <main class="main">
          <g-upload-image
            :dpi="[
              [640, 640],
              [2048, 1080],
            ]"
            accept="bmp,jpeg,png,jpg"
            :show-name="true"
            :show-add="false"
            :show-update-icon="false"
            :close-preview="false"
            :show-checkbox="showCheckbox"
            :module-type="ModuleType.AI_UNIFORM"
            v-model:value="uniformList"
            v-model:checked-list="checkedList"
            :show-checkbox-hover="true"
            :readonly="!checkKey('ai-service-edit')"
            :disabled-delete="true"
            @on-remove="onRemoveImage"
            @on-checked-change="onCheckedChange"
          />
        </main>
      </template>
      <template #main-footer>
        <footer class="main-footer" v-if="asideList.length">
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
                  @click="deleteImage(checkedList)"
                  :loading="deleteImageLoading"
                >
                  <i class="iconfont icon-delete-bin-6-line"></i>
                  删除
                </a-button>
              </div>
            </div>
            <div class="selecting-data-groove" v-auth="'ai-service-edit'">
              <a-button
                type="default"
                class="icon-button"
                :class="[showCheckbox && 'icon-select-button']"
                @click="onSelectImage"
                v-auth="'ai-service-edit'"
              >
                <i class="iconfont icon-arrow-up-s-line"></i>
                选择
              </a-button>
            </div>
          </div>
        </footer>
      </template>
    </g-layout>
  </div>
  <g-modal
    width="416px"
    destroyOnClose
    :title="asideFormTitle"
    v-model:visible="asideFormVisible"
    @ok="onSubmit"
    :ok-button-props="{
      loading: asideAddFormLoading || asideUpdateFormLoading,
    }"
  >
    <a-form ref="asideFormRef" :model="asideForm" layout="vertical">
      <a-form-item
        label="工服类型"
        name="uniformCategoryName"
        :rules="[{ required: true, message: '请输入工服类型', trigger: 'blur' }]"
      >
        <a-input v-model:value="asideForm.uniformCategoryName" placeholder="请输入" :maxlength="10"></a-input>
      </a-form-item>
    </a-form>
  </g-modal>
  <g-upload-select-modal
    :dpi="[
      [640, 640],
      [2048, 1080],
    ]"
    accept="bmp,jpeg,png,jpg"
    :max-file-size="10"
    v-model:visible="visible"
    title="上传工服照片要求："
    :on-success="onSuccess"
    @on-cancel="onSelectModalCancel"
  >
    <template #subTitle>
      <div class="sub-title">
        <p><span>1.</span>不同角度，不同光照下的工服照片；</p>
        <p><span>2.</span>至少640*640像素，最大2048*1080像素，最大不超过10MB；</p>
        <p><span>3.</span>图片格式JPG、PNG、BMP、JPEG</p>
      </div>
    </template>
  </g-upload-select-modal>
</template>

<script setup lang="ts">
import { aiApi } from '@/services/api'
import { FormInstance } from 'ant-design-vue'
import { message } from '@/utils/antd.util'
import { onMounted, ref } from 'vue'
import { useRequest } from 'vue-request'
import { ModuleType } from '@/services/api'
import { getRealUrl } from '@/utils/utils'
import { FileList } from '@/components/g-upload-image.vue'
import { checkKey } from '@/directives/auth'

/**
 * 获取aside区域数据
 */
const activeIndex = ref<number>(0)
const asideList = ref<any[]>([])
const { loading: asideLoading, runAsync: runGetUniformCategoryList } = useRequest(aiApi.getUniformCategoryList, {
  onSuccess: (res) => {
    asideList.value = res.data
    uniformItem.value = asideList.value[activeIndex.value]
  },
})
onMounted(async () => {
  await runGetUniformCategoryList()
  getUniform()
})

// aside区域点击
const onClickItem = (item: any, index: number) => {
  activeIndex.value = index
  uniformItem.value = item
  showCheckbox.value = false
  getUniform()
}

/**
 * aside区域数据新增/修改
 */
type FormType = 'add' | 'edit'
const asideForm = ref({
  id: undefined,
  uniformCategoryName: '',
})
const asideFormRef = ref<FormInstance>()
const asideFormVisible = ref<boolean>(false)
const asideFormTitle = ref<string>('新增工服类型')
let asideFormType: FormType = 'add'
const handleOpenAsideForm = (type: FormType, item?: any) => {
  if (asideList.value.length >= 10 && type === 'add') {
    message.error('最多添加10种类型的工服库')
    return
  }
  asideFormVisible.value = true
  asideFormType = type
  if (type === 'add') {
    asideForm.value.id = undefined
    asideForm.value.uniformCategoryName = ''
    asideFormTitle.value = '新增工服类型'
  } else {
    asideFormTitle.value = '修改工服类型'
    asideForm.value.id = item.id
    asideForm.value.uniformCategoryName = item.uniformCategoryName
  }
}
const { loading: asideAddFormLoading, runAsync: runAddUniformCategory } = useRequest(aiApi.addUniformCategory)
const { loading: asideUpdateFormLoading, runAsync: runUpdateUniformCategory } = useRequest(aiApi.updateUniformCategory)
const onSubmit = async () => {
  await asideFormRef.value?.validate()
  if (asideFormType === 'add') {
    await runAddUniformCategory(asideForm.value.uniformCategoryName)
  } else {
    await runUpdateUniformCategory(asideForm.value)
  }
  message.success('操作成功')
  asideForm.value.uniformCategoryName = ''
  asideFormVisible.value = false
  runGetUniformCategoryList()
}

// 删除工服分类
const { runAsync: runDeleteUniformCategory } = useRequest(aiApi.deleteUniformCategory)
const handleDeleteAside = async (item: any) => {
  await runDeleteUniformCategory(item.id)
  await runGetUniformCategoryList()
  message.success('操作成功')
  activeIndex.value = 0
  uniformItem.value = asideList.value[activeIndex.value]
  showCheckbox.value = false
  await getUniform()
}

/**
 * 根据分类获取工服图片
 */
const uniformItem = ref<any>()
const uniformList = ref<any[]>([])
const { runAsync: runGetUniform } = useRequest(aiApi.getUniform)
const getUniform = async (id?: string) => {
  if (!id && !uniformItem.value) {
    uniformList.value = []
    return
  }
  const { data } = await runGetUniform(id || uniformItem.value?.id)
  uniformList.value = data.map((item: any, index: number) => {
    return {
      uid: item.id,
      name: `工服${index + 1}`,
      status: 'done',
      url: getRealUrl(item.uniformImagePath),
      originalUrl: item.uniformImagePath,
    }
  })
}

// 多选图片
const checkAll = ref<boolean>(false)
const showCheckbox = ref<boolean>(false)
const checkedList = ref<number[]>([])
const onSelectImage = () => {
  showCheckbox.value = !showCheckbox.value
  checkedList.value = []
  checkAll.value = false
}
const onCheckedChange = () => {
  showCheckbox.value = true
  checkAll.value = checkedList.value.length === uniformList.value.length
}
const handleCheckAll = (e: any) => {
  checkAll.value = e.target.checked
  if (checkAll.value) {
    checkedList.value = uniformList.value.map((item: any) => item.uid)
  } else {
    checkedList.value = []
  }
}

/**
 * 删除工服
 */
const onRemoveImage = (item: FileList) => {
  item.status = 'loading'
  deleteImage([item.uid!])
}
const { loading: deleteImageLoading, runAsync: runDeleteUniformIds } = useRequest(aiApi.deleteUniformIds)
const deleteImage = async (ids: number[]) => {
  await runDeleteUniformIds(ids.toString())
  getUniform()
  checkedList.value = []
  checkAll.value = false
  showCheckbox.value = false
  message.success('操作成功')
}

/**
 * 上传工服
 */
const visible = ref<boolean>(false)
const handleAddImage = () => {
  visible.value = true
}
// 上传成功后的回调,用于发起业务请求
const onSuccess = (res: any) => {
  return aiApi.addUniform({ categoryId: uniformItem.value.id, relativeFilePath: res.relativeFilePath })
}
// 关闭上传弹窗
const onSelectModalCancel = () => {
  showCheckbox.value = false
  getUniform()
}
</script>

<style lang="less" scoped>
@import './common.less';
.coveralls-library {
  :deep(.g-layout) {
    border-radius: 4px;
    overflow: hidden;
  }
  header {
    width: 100%;
    height: 50px;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    > h6 {
      font-weight: 700;
      font-size: 14px;
      line-height: 22px;
      text-align: center;
      color: @text2;
      margin: 0;
    }
    i {
      width: 25px;
    }
  }
  .main-header {
    > h6 {
      font-weight: 700;
      font-size: 16px;
      color: @text1;
    }
    i {
      width: 35px;
    }
  }
  .aside-main-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px 0;
    padding: 0 16px;
    .aside-main-list-item {
      flex-shrink: 0;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      color: @text2;
      padding: 0 10px;
      cursor: pointer;

      > p {
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      > div {
        white-space: nowrap;
      }

      .aside-main-list-item-operation {
        display: none;

        .alone-icon-button {
          padding: 2px 4px;
        }

        i {
          width: 24px;
          color: @text3;
        }
      }

      span {
        color: @text3;
      }

      &:hover {
        background: @mask1;
        border-radius: 4px;
        .aside-main-list-item-operation {
          display: flex;
        }
        .aside-main-list-item-status {
          display: none;
        }
      }
      &.active {
        background: @mask2;
        border-radius: 4px;
        color: @text1;
      }
    }
  }

  .main {
    padding: 16px;
  }

  .main-footer {
    box-shadow: 0px -1px 3px rgba(37, 37, 45, 0.14), 0px -2px 8px rgba(37, 37, 45, 0.14);
  }
}
</style>
