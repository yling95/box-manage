/**
 * 监听鼠标移动，指定时间后未移动执行回调
 * @param callback 回调函数
 * @param immediately 是否立即执行
 * @param interval 间隔时间
 * @returns {() => void} 取消监听
 */
export const useMouseMovement = (callback: Function, immediately: boolean = true, interval: number = 3000) => {
  // 立即执行
  if (immediately) {
    callback(null)
  }
  // 定时器
  let timer: any = null
  // 鼠标移动事件
  const mouseMove = () => {
    // 清除定时器
    clearTimeout(timer)
    callback(true)
    // 重新设置定时器
    timer = setTimeout(() => {
      callback(false)
    }, interval)
  }
  // 监听鼠标移动事件
  document.addEventListener('mousemove', mouseMove)
  // 返回取消监听函数
  return () => {
    // 清除定时器
    clearTimeout(timer)
    // 移除监听
    document.removeEventListener('mousemove', mouseMove)
  }
}
