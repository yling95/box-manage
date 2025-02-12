type messageCb = (code: number, message: string, data: any) => any
interface SSEOptions {
  messageCb: messageCb
}

export class SSE {
  url: string
  messageCb: messageCb | null
  timer: NodeJS.Timeout | null
  event: EventSource | null
  constructor(options?: SSEOptions) {
    this.messageCb = options ? options.messageCb : null
    this.timer = null
    this.event = null
    this.url = ''
  }
  // 开启链接
  selectAndLink(url?: string) {
    this.timer && clearTimeout(this.timer)
    if (this.event) return
    url && (this.url = url)
    this.timer = setTimeout(() => {
      this.event = new EventSource(this.url)
      this.event.onerror = () => {
        this.event?.close()
        this.event = null
      }

      this.event.onmessage = (e) => {
        const { code, message, data } = JSON.parse(e.data) as { code: number; message: string; data: any }
        this.messageCb && this.messageCb(code, message, data)
      }
    }, 500)
  }
  // 断开链接并清空code
  closeLink() {
    if (this.event === null) return
    this.event.close()
    this.event = null
  }
}
