import PerfectScrollbar from 'perfect-scrollbar'
import { onUnmounted } from 'vue'

export default function usePerfectScrollbar(selectors: string) {
  let ps: PerfectScrollbar | null
  let dom: Element | null

  /**
   * 初始化滚动条
   * @returns {PerfectScrollbar} ps
   */
  const init = () => {
    try {
      dom = document.querySelector(selectors) as Element
      ps = new PerfectScrollbar(dom, {
        wheelSpeed: 0.5,
        wheelPropagation: true,
      })
      return ps
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * 滚动到顶部
   */
  const scrollToTop = () => {
    dom && dom.scrollTop && (dom.scrollTop = 0)
  }

  /**
   * 容器大小变化时，更新滚动条
   */
  const update = () => {
    ps && ps.update()
  }

  /**
   * 销毁滚动条
   */
  const destroy = () => {
    ps && ps.destroy()
    ps = null
    dom = null
  }

  onUnmounted(() => {
    destroy()
  })

  return {
    init,
    update,
    destroy,
    scrollToTop,
  }
}
