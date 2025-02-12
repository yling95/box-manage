import { Rule } from 'ant-design-vue/es/form'

// 密码正则：长度8-20个字符，包含数字、大写字母、小写字母、字符（!@#$%^&\_+-*/）的至少三种
export const passwordReg =
  /^(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])|(?=.*[a-z])(?=.*\d)(?=.*[\W_])|(?=.*[A-Z])(?=.*\d)(?=.*[\W_]))[^\u4e00-\u9fa5\u3040-\u30FF\uAC00-\uD7AF]+$/
// export const passwordReg = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&\_+\-*/])(?!.*[\u4E00-\u9FFF]).{8,20}$/

// 账号正则：长度2-32个字符
export const accountReg = /^[\u4E00-\u9FFF0-9a-zA-Z]{2,32}$/

// 密钥正则：长度最多32个字符，数字、字母、特殊字符（!@#$%^&\_+-*/）至少一种组合
export const secretReg = /^[a-z]|[A-Z]|[0-9]|[!@#$%^&\_+\-*/]{0,32}$/

// IP地址正则 如0.0.0.0，其中，每个数字的范围为0-255。
export const ipReg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

// IP默认网关正则 如0.0.0.0，其中，每个数字的范围为0-255。
export const gatewayReg = /^(\d{1,3}\.){3}\d{1,3}$/

// dns正则 如0.0.0.0，其中，每个数字的范围为0-255。
export const dnsNameRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/

// IP子网掩码正则 如0.0.0.0，其中，每个数字的范围为0-255。
export const cidrReg =
  /^((128|192|224|240|248|252|254)\.0\.0\.0)|(^255\.(0|128|192|224|240|248|252|254)\.0\.0)|(^255\.255\.(0|128|192|224|240|248|252|254)\.0)|(^255\.255\.255\.(0|128|192|224|240|248|252|254))$/

// url正则 http/https
export const urlReg =
  /^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\&%\+\$#_=]*)?$/

// websocket正则 ws/wss
export const websocketReg = /^ws(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/

// 支持字母和数字
export const numberAndLetterReg = /^[A-Za-z0-9]+$/

// 支持汉字和数字和字母
export const chineseAndNumberAndLetterReg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/

// 包含全部空格 或  前、后空格
export const allStartEndSpaceReg = /^\S(?!.*\s$).*$/

// 验证符合以mirgicbox_v1.0.0开头的版本号正则
export const versionReg = /^mirgicbox_v\d+\.\d+\.\d+/

// 端口号正则
export const portReg = /^([1-9]\d*|0)$/

// 只能包含数字、字母、字符字符(!@#$%^&\_+-*/)
export const numberAndLetterAndSymbolReg = /^[a-zA-Z0-9!@#$%^&\_+\-*/]+$/

// 域名正则
export const domainReg = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/

// RTSP正则
export const rtspRegex = /rtsp:\/\/([^:@]+):([^:@]+)@([^:\/]+)/g

/**
 * 接受两个参数 生成满足两个参数范围内的字符长度正则
 */
export const createLengthReg = (min: number, max: number) => {
  return new RegExp(`^[\\s\\S]{${min},${max}}$`)
}

/**
 * 密码校验
 */
export const passwordValidator = (_rule: Rule, value: string, userName?: string) => {
  if (!value.trim()) {
    return Promise.reject('请输入密码')
  }
  if (!createLengthReg(8, 20).test(value)) {
    return Promise.reject('密码长度必须是8-20位字符')
  }
  if (!passwordReg.test(value)) {
    return Promise.reject('密码应该包含大写字母、小写字母、数字和特殊字符中的至少三种')
  }
  if (value === userName) {
    return Promise.reject('不可与账号名重复')
  }
  return Promise.resolve()
}

export const passwordRule = (_userName?: string): Rule[] => {
  return [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: createLengthReg(8, 20),
      message: '密码长度必须是8-20位字符',
      trigger: 'blur',
    },
    {
      pattern: passwordReg,
      message: '密码应该包含大写字母、小写字母、数字和特殊字符中的至少三种',
      trigger: 'blur',
    },
    {
      validator: (_rule: Rule, value: string) => {
        if (value === 'admin123+') {
          return Promise.reject('不可与账号名重复')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ]
}
