import { defineStore } from 'pinia'
import { ref } from 'vue'
import { commonTaskApi } from '@/services/api'
interface taskType {
  name: string
  id: string
  jobStates: number
}
export const useTaskStore = defineStore(
  'task',
  () => {
    const taskDataList = ref<taskType[]>([])

    // 表格数据
    const getTaskList = async (type: 0 | 1) => {
      try {
        let params = { pageType: type } //0 - 数据转换，1 - 数据回流结果
        let { data } = await commonTaskApi.getExportList(params)
        taskDataList.value = data || []
      } catch {
        taskDataList.value = []
      }
    }

    return {
      taskDataList,
      getTaskList,
    }
  },
  {
    persist: {
      key: 'task',
      storage: window.localStorage,
      paths: ['task'],
    },
  },
)
