import auth from './auth'
import throttle from './throttle'
import { App } from 'vue'

const obj: Record<string, Object> = {
  auth,
  throttle,
}

export default {
  install: (app: App<Element>) => {
    for (const key in obj) {
      app.directive(key, obj[key])
    }
  },
}
