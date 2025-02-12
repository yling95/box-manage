/**
 * vue3监听键盘hook
 * @param callback 监听指定键盘的回调函数
 * @param keys 指定键盘组合
 */
export default function useKeyBoard(callback: Function, keys: string[]) {
  const keyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    if (keys.includes(key)) {
      callback(key)
    }
  }
  window.addEventListener('keydown', keyDown)
  return () => {
    window.removeEventListener('keydown', keyDown)
  }
}
