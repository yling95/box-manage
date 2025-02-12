import dayjs, { Dayjs } from 'dayjs'
import { log } from 'fabric/fabric-impl'
import { cloneDeep } from 'g6-fn'

/**
 * 截取字符串指定长度
 * @param name
 * @param length
 * @returns
 */
export function getShortName(name = '', length = 2) {
  return name.substring(0, length)
}

/**
 * 根据路由地址截取指定长度的路由
 * @param path
 * @param length
 * @returns
 */
export function getShortPath(path = '', length = 2) {
  const pathArr = path.split('/')
  return pathArr.slice(0, length + 1).join('/')
}

/**
 * 根据环境变量获取真实地址
 * @param url
 * @returns
 */
export function getRealUrl(url = '') {
  const baseUrl = import.meta.env.VITE_BASE_URL
  const newUrl = encodeURI(url).replace(/%5B/g, '[').replace(/%5D/g, ']')
  return `${baseUrl}/static/${newUrl}`
}

/**
 * 根据路径和id拼图片完整路径
 * @param url
 * @param id
 * @returns
 */
export function getImgUrl(url = '', id: number, suffix = 'png') {
  return `${url}${id}.${suffix}?t=${new Date().getTime()}`
}

/**
 * 验证分辨率
 * @param file
 * @param dpi [number, number] | [[number, number], [number, number]] 分辨率
 * @param isRatio 是否等比
 * @returns Promise 1:通过 -1:不满足最小分配率 -2: 满足最小分辨率但不符合等比分辨率 -3:超过最大分配率
 */
export const isDpi = (file: any, dpi: [number, number] | [[number, number], [number, number]], isRatio = false) => {
  return new Promise(function (resolve, reject) {
    const _URL = window.URL || window.webkitURL
    const image = new Image()
    image.onload = function () {
      let result: number = 1
      if (typeof dpi[0] === 'number') {
        const [width, height] = dpi as [number, number]
        const w_ratio = image.width / width
        const h_ratio = image.height / height
        if (isRatio) {
          w_ratio >= 1 && h_ratio >= 1 && w_ratio === h_ratio ? (result = 1) : (result = -2)
        } else {
          w_ratio >= 1 && h_ratio >= 1 ? (result = 1) : (result = -1)
        }
      } else {
        const [[width1, height1], [width2, height2]] = dpi as [[number, number], [number, number]]
        const w = image.width
        const h = image.height
        const w_ratio = w / width1
        const h_ratio = h / height1

        if (w_ratio >= 1 && h_ratio >= 1) {
          if (isRatio) {
            w_ratio === h_ratio ? (result = 1) : (result = -2)
          } else {
            w <= width2 && h <= height2 ? (result = 1) : (result = -3)
          }
        } else {
          result = -1
        }
      }

      result === 1 ? resolve(result) : reject(result)
    }
    image.src = _URL.createObjectURL(file)
  })
}

/**
 * 验证视频分辨率
 * @param videoFile 文件
 * @param minResolution 最小分辨率
 * @param maxResolution 最大分辨率
 * @param multiple 分辨率必须是multiple的倍数
 * @returns Promise
 */
export const isVideoDpi = (
  videoFile: File,
  minResolution?: [number, number],
  maxResolution?: [number, number],
  multiple: number = 1,
): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { width: videoWidth, height: videoHeight } = await getVideoSize(videoFile)
      // 校验最小分辨率
      if (minResolution && (videoWidth < minResolution[0] || videoHeight < minResolution[1])) {
        return reject({
          code: -1,
          message: `分辨率太小，最小要求 ${minResolution[0]}x${minResolution[1]}`,
        })
      }
      // 校验最大分辨率
      if (maxResolution && (videoWidth > maxResolution[0] || videoHeight > maxResolution[1])) {
        return reject({
          code: -3,
          message: `分辨率太大，最大允许 ${maxResolution[0]}x${maxResolution[1]}`,
        })
      }
      if (multiple > 0) {
        if (videoWidth % multiple !== 0 || videoHeight % multiple !== 0) {
          return reject({
            code: -4,
            message: `分辨率不符合要求，必须是${multiple}的倍数`,
          })
        }
      }
      // 通过校验
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 是否满足给定的几种分辨率中的一种
 * @param videoFile
 * @param dpiList
 * @returns
 */
export const isVideoFixedDpi = (videoFile: File, dpiList: [number, number][]): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { width: videoWidth, height: videoHeight } = await getVideoSize(videoFile)
      const dpi = dpiList.find(([width, height]) => width === videoWidth && height === videoHeight)
      if (dpi) {
        resolve(true)
      } else {
        reject({
          code: -1,
          message: `分辨率不符合要求，必须是${dpiList
            .map(([width, height]) => `${width}x${height}`)
            .join('、')}中的一种`,
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 获取视频分辨率
 * @param videoFile
 * @returns
 */
export const getVideoSize = (videoFile: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    console.log('视频dom', video)

    video.preload = 'metadata'
    video.src = URL.createObjectURL(videoFile)

    video.onloadedmetadata = () => {
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
      console.log('视频src', videoWidth)

      // 通过校验
      return resolve({
        width: videoWidth,
        height: videoHeight,
      })
    }

    video.onerror = () => {
      return reject({
        code: -1,
        message: '无法读取视频信息',
      })
    }

    video.onloadeddata = () => {
      // 使用 Canvas 提取视频帧
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)
      video.remove()
      canvas.remove()
    }
  })
}

/**
 * 将对象的所有属性值转换为字符串最后拼接成一个字符串
 * @param obj
 * @returns
 */
export function obj2str(obj: any) {
  let str = ''
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      if (obj[key] === null) {
        str += ''
      } else {
        str += obj2str(obj[key])
      }
    } else {
      str += obj[key]
    }
  }
  return str
}

/**
 * 将数组的坐标缩放到指定的范围
 * @param axisList
 * @param scale
 * @returns
 */
export function scaleAxis(axisList: [number, number][][], scale: number) {
  if (axisList && axisList.length === 0) return []
  const list = cloneDeep(axisList) as [number, number][][]
  list.forEach((axis) => {
    axis.forEach((item) => {
      // 保留六位小数
      item[0] = item[0] * scale
      item[1] = item[1] * scale
    })
  })
  return list
}

/**
 * 保留n位小数并格式化输出（不足的部分补0）
 * @param value
 * @param n
 * @returns
 */
export function fomatFloat(value: number, n: number) {
  const f = Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
  let s = f.toString()
  const rs = s.indexOf('.')
  if (rs < 0) {
    s += '.'
  }
  for (let i = s.length - s.indexOf('.'); i <= n; i++) {
    s += '0'
  }
  return Number(s)
}

/**
 * 获取文件名后缀
 * @param fileName
 * @returns
 */
export function getFileSuffix(fileName = '') {
  if (!fileName) return ''
  const index = fileName.lastIndexOf('.')
  return fileName.substring(index + 1)
}

/**
 * 获取文件名
 * @param fileName
 * @returns
 */
export function getFileName(fileName = '') {
  if (!fileName) return ''
  const index = fileName.lastIndexOf('.')
  const name = fileName.substring(0, index)
  const lastIndex = name.lastIndexOf('/')
  return name.substring(lastIndex + 1)
}

/**
 * 获取文件名（方式2）
 * @param fileName
 * @returns
 */
export function getFileName2(fileName = '') {
  return fileName.substring(0, fileName.lastIndexOf('.'))
}

/**
 * base64加密
 * @param str
 * @returns
 */
export function base64Encode(str: string) {
  return btoa(encodeURIComponent(str))
}

/**
 * base64解密
 * @param str
 * @returns
 */
export function base64Decode(str: string) {
  return decodeURIComponent(atob(str))
}

/**
 * 截取时间
 * @param time
 * @returns
 */
export const cutoutTime = (time: Dayjs | string) => {
  const nowTime = dayjs().format('YYYY-MM-DD')
  if (nowTime === dayjs(time).format('YYYY-MM-DD')) {
    return dayjs(time).format('HH:mm')
  }
  return dayjs(time).format('MM-DD HH:mm')
}

/**
 * 图片加载失败替换src
 * @param e 事件对象
 * @param src 替换的值
 */
export const imageErrorReplaceSrc = (e: any, src = '') => {
  if (src) {
    e.target.src = src
    e.target.onerror = null
  } else {
    e.target.style.display = 'none'
  }
}

/**
 * 历史调用时间间隔
 */
export const historyCallInterval = () => {
  let oldTime: number = Date.now()
  return () => {
    const nowTime = Date.now()
    const interval = nowTime - oldTime
    oldTime = nowTime
    return interval || -1
  }
}

/**
 *获取被隐藏的文字
 * @param element 元素
 * @param slampValue 流动值（用于保证可靠性）
 * @returns 被隐藏的文字
 */
export const getHiddenText = (element: Element, slampValue: number = 15) => {
  // 创建一个和原始元素样式相同的临时元素
  let tempElement = document.createElement('div')
  let style = getComputedStyle(element)
  // tempElement.style.width = style.width
  tempElement.style.fontSize = style.fontSize
  tempElement.style.fontWeight = style.fontWeight
  tempElement.style.letterSpacing = style.letterSpacing
  tempElement.style.position = 'absolute'
  tempElement.style.visibility = 'hidden'
  document.body.appendChild(tempElement)

  let text = element.textContent as string
  let visibleText = ''
  let hiddenText = ''

  // 逐字添加文字，直到临时元素的宽度超过原始元素的宽度
  for (let i = 0; i < text.length; i++) {
    tempElement.textContent += text[i]
    if (tempElement.scrollWidth + slampValue > element.clientWidth) {
      hiddenText = text.slice(i)
      break
    } else {
      visibleText += text[i]
    }
  }
  // 删除临时元素
  document.body.removeChild(tempElement)

  return hiddenText
}

/**
 *  对象深比较 不管对象内部数据索引顺序
 * @param obj1  对比对象1
 * @param obj2 对比对象2
 * @returns true|false true是一致的 false不一致
 */
export const deepEqual = (obj1: any, obj2: any, ignoreFields: string[] = []) => {
  // 检查基本类型的相等性
  if (obj1 === obj2) {
    return true
  }

  // 检查 null 或者 undefined
  if (obj1 == null || obj2 == null) {
    return false
  }

  // 获取 obj1 和 obj2 的类型
  const type1 = Object.prototype.toString.call(obj1)
  const type2 = Object.prototype.toString.call(obj2)

  // 检查类型是否相同
  if (type1 !== type2) {
    return false
  }

  // 根据类型进行比较
  switch (type1) {
    case '[object Object]':
      return deepEqualObjects(obj1, obj2, ignoreFields)
    case '[object Array]':
      return deepEqualArrays(obj1, obj2, ignoreFields)
    case '[object Date]':
      return obj1.getTime() === obj2.getTime()
    case '[object RegExp]':
      return obj1.toString() === obj2.toString()
    default:
      return false
  }
}

function deepEqualObjects(obj1: any, obj2: any, ignoreFields: string[]) {
  const keys1 = Object.keys(obj1).filter((key) => !ignoreFields.includes(key))
  const keys2 = Object.keys(obj2).filter((key) => !ignoreFields.includes(key))

  if (keys1.length !== keys2.length) {
    return false
  }

  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key) || !deepEqual(obj1[key], obj2[key], ignoreFields)) {
      return false
    }
  }

  return true
}

function deepEqualArrays(arr1: any, arr2: any, ignoreFields: string[]) {
  if (arr1.length !== arr2.length) {
    return false
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!deepEqual(arr1[i], arr2[i], ignoreFields)) {
      return false
    }
  }
  return true

  // const visited = new Array(arr2.length).fill(false)

  // for (let i = 0; i < arr1.length; i++) {
  //   let found = false
  //   console.log('88888', arr1);

  //   for (let j = 0; j < arr2.length; j++) {
  //     if (!visited[j] && deepEqual(arr1[i], arr2[j], ignoreFields)) {
  //       visited[j] = true
  //       found = true
  //       break
  //     }
  //   }
  //   return found
  // }
}

/**
 * 通过视频地址 获取视频第一帧
 * @param videoUrl  视频地址
 * @param callback  回调 (imgUrl)=>{}
 */
export const extractFirstFrameFromVideo = (videoUrl: string, callback: Function) => {
  let video = document.createElement('video')
  video.crossOrigin = 'anonymous'
  video.src = videoUrl
  video.muted = true
  video.load()
  video.play()
  video.addEventListener('loadeddata', function () {
    let canvas = document.createElement('canvas')
    canvas.width = 540
    canvas.height = 220
    let ctx = canvas.getContext('2d')
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
    let dataURL = canvas.toDataURL('image/png')
    // 调用回调函数返回抽取的第一帧图像
    callback(dataURL)

    // 清理
    video.remove()
    canvas.remove()
  })
}
