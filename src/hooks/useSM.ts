import { sm4 } from 'sm-crypto'
// const key = "157772cfb4d74316d8f6d2c7416fbd10";

// 将16进制字符串转为base64
function hexToBase64(hexString: string) {
  // 将16进制字符串转换为字节数组
  const byteArray = hexStringToByteArray(hexString)
  // 将字节数组转换为base64字符串
  const base64String = btoa(String.fromCharCode(...byteArray))
  return base64String
}

// 将16进制字符串转换为字节数组
function hexStringToByteArray(hexString: string) {
  const byteArray = []
  for (let i = 0; i < hexString.length; i += 2) {
    const byte = parseInt(hexString.substr(i, 2), 16)
    byteArray.push(byte)
  }
  return byteArray
}

export const useSM4 = (key: string) => {
  const _key = key
  const encrypt = (value: string | number[]) => {
    let encryptData = sm4.encrypt(value, _key)
    encryptData = encryptData.toUpperCase() // 将16进制字符串转大写
    encryptData = hexToBase64(encryptData)
    return encryptData
  }

  return {
    encrypt,
  }
}

export default useSM4
