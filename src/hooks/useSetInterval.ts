export default function useSetInterval() {
  let timer: NodeJS.Timer | number
  const start = (fn: Function, delay?: number, immediately: boolean = false, ...args: any[]) => {
    clear()
    if (immediately) fn()
    timer = setInterval(fn, delay, ...args)
  }
  const clear = () => {
    clearInterval(timer)
  }
  return {
    start,
    clear,
  }
}

// 轮询
export const usePolling = (fn: Function, immediately: boolean = false) => {
  let timer: NodeJS.Timer | number
  const start = (delay?: number, ...args: any[]) => {
    clear()
    if (immediately) fn()
    timer = setInterval(fn, delay, ...args)
  }
  const clear = () => {
    clearInterval(timer)
  }

  return {
    start,
    clear,
  }
}
