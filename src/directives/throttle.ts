import { throttle } from 'g6-fn'

export default {
  mounted(el: Window, binding: any) {
    const { value: func, arg: delay = 2000 } = binding
    el.addEventListener('click', throttle(func, delay))
  },
  unmounted(el: Window, binding: any) {
    const { value: func } = binding
    el.removeEventListener('click', func)
  },
}
