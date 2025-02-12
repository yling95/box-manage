import { UnwrapNestedRefs, ref } from 'vue'

export default function useTabs<T>(tabs: T[] = [], callback?: Function) {
  const tabList = ref<T[]>(tabs)
  const tabActiveIndex = ref(0)
  const tabActive = ref<T>()
  tabActive.value = tabList.value[tabActiveIndex.value] as T

  const changeTab = (index: number) => {
    tabActiveIndex.value = index
    tabActive.value = tabList.value[tabActiveIndex.value] as T
    callback && callback(index, tabList.value[index])
  }

  const changeTabs = (tabs: T[]) => {
    tabList.value = tabs as UnwrapNestedRefs<T[]>
  }
  return {
    tabs,
    tabActiveIndex,
    tabActive,
    changeTab,
    changeTabs,
  }
}
