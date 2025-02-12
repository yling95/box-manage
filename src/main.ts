import { createApp } from 'vue'
import App from './App.vue'
import store from '@/store/index'
import router from '@/routes/index'
import '@/styles/index.less'
import { setGlobalOptions } from 'vue-request'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'lazysizes'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

// 全局配置vue-request
setGlobalOptions({
  manual: true,
  debounceInterval: 200,
  debounceOptions: {
    leading: true,
  },
})

// 自定义指令
import directives from './directives'

const app = createApp(App)
app.use(VueVirtualScroller)
app.use(store).use(router).use(directives).mount('#app')
