import { ref, reactive } from 'vue'
import { cloneDeep } from 'g6-fn'
import { useRequest } from 'vue-request'

export interface ResponseData {
  code: string
  message: string
  data: {
    records: any[]
    total: number
    pages: number
  }
}

interface PageInfo {
  offset: number
  limit: number
  total: number
  pages?: number
}

export default function <Params, D = any>(api: any, otherParams: Params, callback?: Function) {
  // 获取数据
  const { data, runAsync: runGetDateList, loading } = useRequest<ResponseData>(api, { throttleInterval: 0 })

  // 初始化查询数据
  type PageForm = PageInfo & Params
  const pageForm = reactive<PageForm>({ offset: 1, limit: 10, total: 0, ...otherParams })
  const initPageForm = cloneDeep(pageForm) //复制一份

  const dataList = ref<D[]>([])
  // 获取数据
  const getDataList = async (otherParams?: Partial<PageForm>) => {
    try {
      await runGetDateList(Object.assign(pageForm, otherParams))
      dataList.value = data.value?.data.records || []
      pageForm.total = data.value?.data.total || 0
      pageForm.pages = data.value?.data.pages || 0
      callback && callback(data.value)

      // 当前页码数大于最大页码数时，重置页码数
      const maxOffset = Math.ceil(pageForm.total / pageForm.limit)
      if (maxOffset && pageForm.offset > maxOffset) {
        getDataList({ offset: maxOffset } as Partial<PageForm>)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const resetPageForm = () => {
    Object.assign(pageForm, initPageForm)
    getDataList()
  }

  return {
    loading,
    pageForm,
    dataList,
    getDataList,
    resetPageForm,
  }
}
