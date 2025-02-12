import { Modal, ModalFuncProps, message as aMessage } from 'ant-design-vue'
import { createVNode } from 'vue'

/**
 * confirm
 * @param props
 * @returns
 */
export const confirm = (props: ModalFuncProps) => {
  return Modal.confirm({
    icon: createVNode('i', { class: 'iconfont confirm-info  icon-alert-fill' }),
    centered: true,
    ...props,
  })
}

/**
 * info
 * @param props
 * @returns
 */
export const info = (props: ModalFuncProps) => {
  return Modal.info({
    icon: createVNode('i', { class: 'iconfont confirm-info icon-alert-fill' }),
    okButtonProps: { type: 'default' },
    centered: true,
    ...props,
  })
}

/**
 * @description: message
 */
const defaultDuration = 3
export const message = {
  info: (content: string, duration: number = defaultDuration, onClose?: Function) => {
    return aMessage.success({
      content,
      duration,
      onClose: () => onClose && onClose(),
      icon: createVNode('i', { class: 'iconfont msg-info icon-information-fill' }),
    })
  },
  success: (content: string, duration: number = defaultDuration, onClose?: Function) => {
    return aMessage.success({
      content,
      duration,
      onClose: () => onClose && onClose(),
      icon: createVNode('i', { class: 'iconfont msg-success icon-checkbox-circle-fill' }),
    })
  },
  error: (content: string, duration: number = defaultDuration, onClose?: Function) => {
    return aMessage.error({
      content,
      duration,
      onClose: () => onClose && onClose(),
      icon: createVNode('i', { class: 'iconfont msg-error icon-close-circle-fill' }),
    })
  },
  warning: (content: string, duration: number = defaultDuration, onClose?: Function) => {
    return aMessage.warning({
      content,
      duration,
      onClose: () => onClose && onClose(),
      icon: createVNode('i', { class: 'iconfont msg-warning icon-alert-fill' }),
    })
  },
  loading: (content: string, duration: number = 0, onClose?: Function) => {
    return aMessage.loading({
      content,
      duration,
      onClose: () => onClose && onClose(),
    })
  },
}
