import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDeviceStore = defineStore(
  'device',
  () => {
    const displayType = ref(false)

    const toggleDisplayType = () => {
      displayType.value = !displayType.value
    }

    return {
      displayType,
      toggleDisplayType,
    }
  },
  {
    persist: {
      key: 'device-displayType',
      storage: window.localStorage,
      paths: ['displayType'],
    },
  },
)
