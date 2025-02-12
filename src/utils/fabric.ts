import { message } from 'ant-design-vue'
import { fabric } from 'fabric'
import { fomatFloat } from './utils'

export interface Point {
  x: number
  y: number
}

export interface PositionInfo {
  top: number
  left: number
  width?: number
  height?: number
}

export type EventKey = 'finish' | 'error'
export type EventMap = {
  [key in EventKey]: Function | undefined
}

export enum ERROR_TYPE {
  // 未知错误
  UNKNOWN = 1001,
  // 超出最大数量
  MAX_NUM = 1002,
  // 区域过小
  MIN_AREA = 1003,
  // 点的数量过少
  MIN_POINT = 1004,
  // 点的数量过多
  MAX_POINT = 1005,
  // 超出边界
  OUT_OF_BOUNDS = 1006,
  // 线段相交
  INTERSECT = 1007,
}

/**
 * @description: 矩形
 * @param {fabric.Canvas} canvas
 */
export class Rect {
  // 画布
  canvas: fabric.Canvas
  // 是否开始绘制
  isStarted = false
  // 当前矩形
  currentRect: fabric.Rect | null = null
  // 当前图形填充色
  nowGraphFillColor = 'rgba(255, 142, 66, 0.20)'
  // 当前图形边框色
  nowGraphStrokeColor = '#FF8E42'
  // 控制点颜色
  cornerColor = '#FFDB93'
  // 控制点大小
  cornerSize = 6
  // 矩形配置
  rectOptions?: fabric.IObjectOptions
  // 当前按下点
  currentDownPoint?: fabric.Point
  // 最大数量
  maxNum = 50
  // 可以绘制的最小区域
  minArea = 10
  // 绘制完成回调
  finishCallback?: (rect: fabric.Rect) => void
  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas
  }

  /**
   * @description: 开始绘制矩形
   * @param rectOptions 矩形配置
   * @param callback 绘制完成后的回调
   */
  startDraw(rectOptions?: fabric.IObjectOptions, callback?: (rect: fabric.Rect) => void) {
    if (this.isStarted) return
    this.canvas.on('mouse:down', this.mouseDown)
    this.canvas.on('mouse:move', this.mouseMove)
    this.canvas.on('mouse:up', this.mouseUp)
    this.rectOptions = rectOptions
    this.finishCallback = callback
    this.isStarted = true
  }

  // 结束
  endDraw() {
    if (!this.isStarted) return
    this.canvas.off('mouse:down', this.mouseDown)
    this.canvas.off('mouse:move', this.mouseMove)
    this.canvas.off('mouse:up', this.mouseUp)
    this.rectOptions = undefined
    this.finishCallback = undefined
    this.isStarted = false
    this.currentRect = null
  }

  // 鼠标按下
  private mouseDown = (e: fabric.IEvent) => {
    // 鼠标在已绘制图形上启用拖动
    if (e.target && e.target instanceof fabric.Rect) {
      this.canvas.setActiveObject(e.target as fabric.Object)
      // 更新矩形点
      this.updateDot(e.target)
      return
    }
    // 获取画布中对象总数量
    const total = this.canvas.getObjects().length
    if (total >= this.maxNum) {
      return message.warning(`最多只能绘制${this.maxNum}个`)
    }

    // 鼠标在未绘制图形上启用绘制
    this.currentDownPoint = e.absolutePointer as fabric.Point
    if (this.currentRect === null) {
      // 创建矩形
      this.currentRect = this.create({
        width: 0,
        height: 0,
      })
      this.canvas.add(this.currentRect)
    }
  }

  // 鼠标移动
  private mouseMove = (e: fabric.IEvent) => {
    const currentPoint = e.absolutePointer as fabric.Point
    if (this.currentRect) {
      this.updatePath(currentPoint)
    }
  }

  // 鼠标抬起
  private mouseUp = (e: fabric.IEvent) => {
    if (this.currentRect) {
      this.finish()
    } else if (e.target) {
      this.validate(e.target)
    }
  }

  // 创建矩形
  create(options: fabric.IObjectOptions) {
    return new fabric.Rect({
      fill: this.nowGraphFillColor,
      stroke: this.nowGraphStrokeColor,
      strokeWidth: 1,
      ...this.rectOptions,
      ...options,
    })
  }

  // 更新矩形点
  private updateDot(currentRect: fabric.Rect) {
    if (currentRect === null || !(currentRect instanceof fabric.Rect)) return
    const modified = () => {
      const newWidth = currentRect.width! * currentRect.scaleX!
      const newHeight = currentRect!.height! * currentRect!.scaleY!
      currentRect.set({ width: newWidth, height: newHeight, scaleX: 1, scaleY: 1 })
      const isPass = this.validate(currentRect)
      if (!isPass) {
        this.canvas.remove(currentRect)
      }
      this.canvas.off('object:modified', modified)
    }
    // 元素被修改时触发
    this.canvas.off('object:modified', modified)
    this.canvas.on('object:modified', modified)
  }

  // 更新矩形路径
  private updatePath(currentPoint: fabric.Point) {
    if (this.currentRect === null) return
    const top = Math.min(this.currentDownPoint!.y, currentPoint.y)
    const left = Math.min(this.currentDownPoint!.x, currentPoint.x)
    const width = Math.abs(this.currentDownPoint!.x - currentPoint.x)
    const height = Math.abs(this.currentDownPoint!.y - currentPoint.y)
    this.currentRect.set({
      top,
      left,
      width,
      height,
    })
    this.canvas.requestRenderAll()
  }

  // 绘制完成
  private finish() {
    if (this.currentRect === null) return
    // 验证区域大小
    if (this.currentRect.width! < this.minArea || this.currentRect.height! < this.minArea) {
      this.canvas.remove(this.currentRect)
      this.currentRect = null
      message.warning('绘制区域过小')
      return
    }
    // 是否通过验证: 绘制超出背景图的部分将其点位设置到背景图边缘
    const isPass = this.validate(this.currentRect)
    if (!isPass) {
      this.canvas.remove(this.currentRect)
      this.currentRect = null
      return
    }

    // 修改矩形控制点样式
    this.currentRect.set({
      cornerColor: this.cornerColor,
      cornerSize: this.cornerSize,
    })
    // 不显示旋转控制点
    this.currentRect.setControlVisible('mtr', false)
    this.canvas.setActiveObject(this.currentRect)
    this.canvas.isDrawingMode = false
    this.canvas.requestRenderAll()
    this.finishCallback && this.finishCallback(this.currentRect)
    this.currentRect = null
  }

  // 验证是否可以绘制
  private validate(currentRect: fabric.Rect) {
    if (!currentRect || !currentRect?.canvas) {
      return false
    }
    const {
      top: bgcTop,
      left: bgcLeft,
      height: bgcHeight,
      width: bgcWidth,
      scale: bgcScale,
    } = this.getBackgroundInfo(currentRect)
    const { top: currentRectTop, left: currentRectLeft } = currentRect as any
    // 超出上边界
    if (currentRectTop < bgcTop) {
      currentRect.set({ top: bgcTop })
    }
    // 超出左边界
    if (currentRectLeft < bgcLeft) {
      currentRect.set({ left: bgcLeft })
    }
    // 背景底边距离画布顶部的距离 = 背景顶边距离画布顶部的距离 + 背景高度 * 背景缩放比例
    const bgcBottom = bgcTop + bgcHeight * bgcScale
    // 矩形底边距离画布顶部的距离 = 矩形顶边距离画布顶部的距离 + 矩形高度
    const currentRectBottom = currentRectTop + currentRect.height!
    // 超出下边界
    if (currentRectBottom > bgcBottom) {
      currentRect.set({ top: bgcBottom - currentRect.height! })
    }
    // 超出右边界
    const bgcRight = bgcLeft + bgcWidth * bgcScale
    const currentRectRight = currentRectLeft + currentRect.width!
    if (currentRectRight > bgcRight) {
      currentRect.set({ left: bgcRight - currentRect.width! })
    }
    // 矩形高度大于背景图高度
    if (currentRect.height! > bgcHeight * bgcScale) {
      currentRect.set({ top: bgcTop, height: bgcHeight * bgcScale })
    }
    // 矩形宽度大于背景图宽度
    if (currentRect.width! > bgcWidth * bgcScale) {
      currentRect.set({ left: bgcLeft, width: bgcWidth * bgcScale })
    }

    return true
  }

  /**
   * 获取背景信息
   * @param polygon
   * @returns
   */
  getBackgroundInfo(rect: fabric.Rect) {
    let bgcTop: number, bgcLeft: number, bgcWidth: number, bgcHeight: number, bgcScale: number
    if (rect?.canvas?.backgroundImage) {
      const backgroundImage = rect.canvas.backgroundImage as any
      bgcTop = backgroundImage.top
      bgcLeft = backgroundImage.left
      bgcWidth = backgroundImage.width
      bgcHeight = backgroundImage.height
      bgcScale = backgroundImage.scaleX
    } else {
      bgcTop = 0
      bgcLeft = 0
      bgcWidth = rect?.canvas?.width || 0
      bgcHeight = rect?.canvas?.height || 0
      bgcScale = 1
    }

    return {
      top: bgcTop,
      left: bgcLeft,
      width: bgcWidth,
      height: bgcHeight,
      scale: bgcScale,
    }
  }

  // 设置当前图形填充色
  setNowGraphFillColor(color: string) {
    this.nowGraphFillColor = color
  }

  // 设置当前图形边框色
  setNowGraphStrokeColor(color: string) {
    this.nowGraphStrokeColor = color
  }

  // 设置当前图形配置
  setNowGraphOptions(options: fabric.IObjectOptions) {
    this.rectOptions = options
  }

  // 设置绘制完成回调
  setFinishCallback(callback: (rect: fabric.Rect) => void) {
    this.finishCallback = callback
  }

  // 所有矩形只读
  setAllRectReadOnly() {
    this.canvas.getObjects().forEach((item) => {
      if (item.type === 'rect') {
        item.set({ selectable: false, evented: false })
      }
    })
    // 取消激活
    this.canvas.discardActiveObject()
  }

  // 清除
  clearAllRect() {
    this.canvas.getObjects().forEach((item) => {
      if (item.type === 'rect') {
        this.canvas.remove(item)
      }
    })
  }

  // 清除当前绘制的对象
  clearCurrentObject() {
    if (this.currentRect) {
      this.canvas.remove(this.currentRect)
      this.currentRect = null
    }
  }

  // 销毁
  destroy() {
    this.endDraw()
    this.currentRect = null
    this.rectOptions = undefined
    this.finishCallback = undefined
  }

  // 获取图形在图片中的原始坐标
  getOriginAxis(imageObj: PositionInfo, graphObj: fabric.Rect, scale: number) {
    if (!imageObj || !graphObj) return []
    const { top: bgcTop, left: bgcLeft } = imageObj
    const { top: graphTop, left: graphLeft, width: graphWidth = 0, height: graphHeight = 0 } = graphObj
    // 左上
    const x1 = fomatFloat(((graphLeft as number) - bgcLeft) / scale, 6)
    const y1 = fomatFloat(((graphTop as number) - bgcTop) / scale, 6)
    // 左下
    const x2 = x1
    const y2 = fomatFloat(y1 + graphHeight / scale, 6)
    // 右下
    const x3 = fomatFloat(x1 + graphWidth / scale, 6)
    const y3 = y2
    // 右上
    const x4 = x3
    const y4 = y1
    return [
      [x1, y1],
      [x2, y2],
      [x3, y3],
      [x4, y4],
    ]
  }

  // 根据数据坐标获取图形在图片中的位置
  getCurrentAxis(imageObj: PositionInfo, graphAxis: [number, number][], scale: number) {
    if (!imageObj || !graphAxis) return {}
    const { top: bgcTop, left: bgcLeft } = imageObj
    const [axis1] = graphAxis
    // 左上坐标
    const left = axis1[0] * scale + bgcLeft
    const top = axis1[1] * scale + bgcTop
    const width = (graphAxis[2][0] - graphAxis[0][0]) * scale
    const height = (graphAxis[2][1] - graphAxis[0][1]) * scale

    return {
      top,
      left,
      width,
      height,
    }
  }
}

/**
 * 线
 * @description: 线
 * @param {fabric.Canvas} canvas
 */
export class Line {
  // 画布
  canvas: fabric.Canvas
  // 是否开始绘制
  isStarted = false
  // 当前线
  currentLine: fabric.Line | null = null
  // 当前图形边框色
  nowGraphStrokeColor = '#FFDB93'
  // 线配置
  lineOptions?: fabric.IObjectOptions
  // 最大数量
  maxNum = 50
  // 可以绘制的最小区域
  minArea = 20
  // 绘制完成回调
  finishCallback?: (line: fabric.Line) => void
  eventMap?: EventMap | {} = {}
  constructor(canvas: fabric.Canvas, options?: fabric.IObjectOptions) {
    this.canvas = canvas
    this.lineOptions = options
  }

  /**
   * @description: 开始绘制线
   * @param lineOptions 线配置
   * @param callback 绘制完成后的回调
   * @return {*}
   */
  startDraw(lineOptions?: fabric.IObjectOptions, callback?: (line: fabric.Line) => void) {
    if (this.isStarted) return
    this.canvas.on('mouse:down', this.mouseDown)
    this.canvas.on('mouse:move', this.mouseMove)
    this.canvas.on('mouse:up', this.mouseUp)
    this.lineOptions = lineOptions
    this.finishCallback = callback
    this.isStarted = true
  }

  // 结束
  endDraw() {
    if (!this.isStarted) return
    this.canvas.off('mouse:down', this.mouseDown)
    this.canvas.off('mouse:move', this.mouseMove)
    this.canvas.off('mouse:up', this.mouseUp)
    this.lineOptions = undefined
    this.finishCallback = undefined
    this.isStarted = false
    this.currentLine = null
  }

  // 鼠标按下
  private mouseDown = (e: fabric.IEvent) => {
    // 鼠标在已绘制图形上启用拖动
    if (e.target && e.target instanceof fabric.Line) {
      this.canvas.setActiveObject(e.target as fabric.Object)
      // 更新线点
      this.updateDot(e.target as fabric.Line)
      return
    }

    // 获取画布中对象总数量
    const total = this.canvas.getObjects().length
    if (total >= this.maxNum) {
      ;(this.eventMap as EventMap)?.error?.({ code: ERROR_TYPE.MAX_NUM, message: '超出最大绘制个数' })
      return message.warning(`最多只能绘制${this.maxNum}个`)
    }

    // 鼠标在未绘制图形上启用绘制
    const currentPoint = e.absolutePointer as fabric.Point
    if (this.currentLine === null) {
      // 创建线
      this.currentLine = this.create([currentPoint.x, currentPoint.y, currentPoint.x, currentPoint.y])
      this.canvas.add(this.currentLine)
    }
  }

  // 鼠标移动
  private mouseMove = (e: fabric.IEvent) => {
    const currentPoint = e.absolutePointer as fabric.Point
    if (this.currentLine) {
      this.updatePath(currentPoint)
    }
  }

  // 鼠标抬起
  private mouseUp = (e: fabric.IEvent) => {
    if (this.currentLine) {
      this.finish()
    } else if (e.target) {
      this.validate(e.target as fabric.Line)
    }
  }

  // 创建线
  create(points?: number[], options?: fabric.IObjectOptions) {
    return new fabric.Line(points, {
      stroke: this.nowGraphStrokeColor,
      strokeWidth: 2,
      // lockScalingFlip: true,
      ...this.lineOptions,
      ...options,
    }).setControlsVisibility({
      mb: false,
      ml: false,
      mr: false,
      mt: false,
      tl: false,
      tr: false,
      br: false,
      bl: false,
      mtr: false,
    })
  }

  // 更新线点
  private updateDot(currentLine: fabric.Line) {
    if (currentLine === null || !(currentLine instanceof fabric.Line)) return
    let left = currentLine.left!
    let top = currentLine.top!

    const modified = (e: fabric.IEvent<Event>) => {
      // 检查修改对象是否是线对象
      let modifiedObject = e.target
      if (modifiedObject instanceof fabric.Line) {
        let x1 = modifiedObject.x1! + (modifiedObject.left! - left)
        let y1 = modifiedObject.y1! + (modifiedObject.top! - top)
        let x2 = modifiedObject.x2! + (modifiedObject.left! - left)
        let y2 = modifiedObject.y2! + (modifiedObject.top! - top)
        currentLine.set({ x1, y1, x2, y2 })
      }
      const isPass = this.validate(currentLine)
      if (!isPass) {
        this.canvas.remove(currentLine)
      }
      this.canvas.off('object:modified', modified)
    }
    // 元素被修改时触发
    this.canvas.off('object:modified', modified)
    this.canvas.on('object:modified', modified)
    const up = () => {
      this.canvas.off('mouse:up', up)
      this.canvas.off('object:modified', modified)
    }
    // 监听鼠标松开
    this.canvas.on('mouse:up', up)
  }

  // 更新线路径
  private updatePath(currentPoint: fabric.Point) {
    if (this.currentLine === null) return
    this.currentLine.set({
      x2: currentPoint.x,
      y2: currentPoint.y,
    })
    this.canvas.requestRenderAll()
  }

  // 绘制完成
  private finish() {
    if (this.currentLine === null) return
    // 线条绘制太短 删除
    if (this.currentLine.width! < this.minArea && this.currentLine.height! < this.minArea) {
      this.canvas.remove(this.currentLine)
      this.currentLine = null
      message.warning('绘制区域过小')
      ;(this.eventMap as EventMap)?.error?.({ code: ERROR_TYPE.MIN_AREA, message: '绘制区域过小' })
      return
    }

    // 验证区域大小
    const isPass = this.validate(this.currentLine)
    if (!isPass) {
      this.canvas.remove(this.currentLine)
      this.currentLine = null
      return
    }

    // 修改线控制点样式
    this.currentLine.set({
      cornerColor: this.nowGraphStrokeColor,
      cornerSize: 6,
      // 线的宽度不能变
      // lockScalingX: true,
      // lockScalingY: true,
    })
    this.canvas.setActiveObject(this.currentLine)
    this.canvas.isDrawingMode = false
    this.canvas.requestRenderAll()
    this.finishCallback && this.finishCallback(this.currentLine)
    this.currentLine = null
  }

  // 验证是否可以绘制
  private validate(currentLine: fabric.Line) {
    if (!currentLine || !currentLine?.canvas) {
      return false
    }

    let bgcTop, bgcLeft, bgcWidth, bgcHeight, bgcScale
    // 如果图片不存在就以容器的宽高作为数值进行边缘处理，使得线不会画出容器外
    if (currentLine.canvas.backgroundImage) {
      const backgroundImage = currentLine.canvas.backgroundImage as any
      bgcTop = backgroundImage.top
      bgcLeft = backgroundImage.left
      bgcWidth = backgroundImage.width
      bgcHeight = backgroundImage.height
      bgcScale = backgroundImage.scaleX
    } else {
      bgcTop = 0
      bgcLeft = 0
      bgcWidth = currentLine.canvas.width
      bgcHeight = currentLine.canvas.height
      bgcScale = 1
    }
    const { x1, y1, x2, y2 } = currentLine as any
    // 超出上边界
    if (y1 < bgcTop) {
      currentLine.set({ y1: bgcTop })
    }
    if (y2 < bgcTop) {
      currentLine.set({ y2: bgcTop })
    }
    // 超出左边界
    if (x1 < bgcLeft) {
      currentLine.set({ x1: bgcLeft })
    }
    if (x2 < bgcLeft) {
      currentLine.set({ x2: bgcLeft })
    }
    // 超出下边界
    const bgcBottom = bgcTop + bgcHeight * bgcScale
    if (y1 > bgcBottom) {
      currentLine.set({ y1: bgcBottom })
    }
    if (y2 > bgcBottom) {
      currentLine.set({ y2: bgcBottom })
    }
    // 超出右边界
    const bgcRight = bgcLeft + bgcWidth * bgcScale
    if (x1 > bgcRight) {
      currentLine.set({ x1: bgcRight })
    }
    if (x2 > bgcRight) {
      currentLine.set({ x2: bgcRight })
    }

    if (
      (currentLine.x1 === currentLine.x2 && currentLine.x1 === bgcLeft) ||
      (currentLine.x1 === currentLine.x2 && currentLine.x1 === bgcRight) ||
      (currentLine.y1 === currentLine.y2 && currentLine.y1 === bgcTop) ||
      (currentLine.y1 === currentLine.y2 && currentLine.y1 === bgcBottom)
    ) {
      this.canvas.remove(currentLine)
      message.warning('超出边界，已删除')
      ;(this.eventMap as EventMap)?.error?.({ code: ERROR_TYPE.OUT_OF_BOUNDS, message: '超出边界，已删除' })
      return false
    }

    return true
  }

  /**
   * 新增监听事件
   */
  addListener(type: EventKey, callback: Function) {
    ;(this.eventMap as EventMap)![type] = callback
  }

  /**
   * 移除监听事件
   */
  removeListener(type: EventKey) {
    ;(this.eventMap as EventMap)![type] = undefined
  }

  /**
   * 移除所有监听事件
   */
  removeAllListener() {
    this.eventMap = {}
  }

  /**
   * 清除当前绘制的对象
   */
  clearCurrentObject() {
    if (this.currentLine) {
      this.canvas.remove(this.currentLine)
      this.currentLine = null
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.endDraw()
    this.currentLine = null
    this.lineOptions = undefined
    this.finishCallback = undefined
  }

  /**
   * 清除所有线
   */
  clearAllLine() {
    this.canvas.getObjects().forEach((item) => {
      if (item.type === 'line') {
        this.canvas.remove(item)
      }
    })
  }

  /**
   * 获取图形在图片中的原始坐标
   * @param imageObj 图片信息
   * @param graphObj 图形信息
   * @param scale 缩放比例
   * @return {*}  number[[][]]
   */
  getOriginAxis(imageObj: PositionInfo, graphObj: fabric.Line, scale: number): number[][] {
    if (!imageObj || !graphObj) return []
    const { top: bgcTop, left: bgcLeft } = imageObj
    const { x1, y1, x2, y2 } = graphObj
    const x1_ = x1! - bgcLeft
    const y1_ = y1! - bgcTop
    const x2_ = x2! - bgcLeft
    const y2_ = y2! - bgcTop
    const x1_scale = fomatFloat(x1_ / scale, 6)
    const y1_scale = fomatFloat(y1_ / scale, 6)
    const x2_scale = fomatFloat(x2_ / scale, 6)
    const y2_scale = fomatFloat(y2_ / scale, 6)
    return [
      [x1_scale, y1_scale],
      [x2_scale, y2_scale],
    ]
  }

  /**
   * 获取图形在当前图片中的坐标
   * @param imageObj 图片信息
   * @param graphObj 图形原始坐标
   * @param scale 缩放比例
   * @return {*}  LinePosition
   */
  getCurrentAxis(imageObj: PositionInfo, graphAxis: number[][], scale: number): number[] | [] {
    if (!imageObj || !graphAxis) return []
    const { top: bgcTop, left: bgcLeft } = imageObj
    for (let i = 0; i < graphAxis.length; i++) {
      const element = graphAxis[i]
      element[0] = element[0]! * scale + bgcLeft
      element[1] = element[1]! * scale + bgcTop
    }

    return [graphAxis[0][0], graphAxis[0][1], graphAxis[1][0], graphAxis[1][1]]
  }
}

export interface PolygonOptions {
  minDotCount?: number
  maxDotCount?: number
  nowGraphFillColor?: string
  nowGraphStrokeColor?: string
  cornerColor?: string
  cornerSize?: number
  maxNum?: number
}
const defaultOptions: Required<PolygonOptions> = {
  minDotCount: 3,
  maxDotCount: -1,
  nowGraphFillColor: 'rgba(255, 142, 66, 0.20)',
  nowGraphStrokeColor: '#FF8E42',
  cornerColor: '#FF8E42',
  cornerSize: 6,
  maxNum: 50,
}
/**
 * @description: 多边形
 * @param {fabric.Canvas} canvas
 */
export class Polygon {
  // 画布
  canvas: fabric.Canvas
  // 是否开始绘制
  isStarted = false
  // 最少点数
  minDotCount = defaultOptions.minDotCount
  // 最多点数
  maxDotCount = defaultOptions.maxDotCount
  // 当前图形填充色
  nowGraphFillColor = defaultOptions.nowGraphFillColor
  // 当前图形边框色
  nowGraphStrokeColor = defaultOptions.nowGraphStrokeColor
  // 控制点颜色
  cornerColor = defaultOptions.cornerColor
  // 控制点大小
  cornerSize = defaultOptions.cornerSize
  // 最大数量
  maxNum = defaultOptions.maxNum
  // 当前多边形
  currentPolygon: fabric.Polygon | null = null
  // 多边形配置
  polygonOptions?: fabric.IObjectOptions
  // 绘制完成回调
  finishCallback?: (polygon: fabric.Polygon) => void
  eventMap?: EventMap | {} = {}
  constructor(canvas: fabric.Canvas, options?: fabric.IObjectOptions) {
    this.canvas = canvas
    this.polygonOptions = options
  }

  /**
   * 设置配置
   * @param options
   */
  set(options: PolygonOptions) {
    this.minDotCount = options.minDotCount || this.minDotCount
    this.maxDotCount = options.maxDotCount || this.maxDotCount
    this.nowGraphFillColor = options.nowGraphFillColor || this.nowGraphFillColor
    this.nowGraphStrokeColor = options.nowGraphStrokeColor || this.nowGraphStrokeColor
    this.cornerColor = options.cornerColor || this.cornerColor
    this.cornerSize = options.cornerSize || this.cornerSize
    this.maxNum = options.maxNum || this.maxNum
  }

  /**
   * 获取默认配置
   * @returns 默认配置
   */
  getDefaultOptions() {
    return defaultOptions
  }

  /**
   * 重置默认配置
   */
  resetDefaultOptions() {
    this.minDotCount = defaultOptions.minDotCount
    this.maxDotCount = defaultOptions.maxDotCount
    this.nowGraphFillColor = defaultOptions.nowGraphFillColor
    this.nowGraphStrokeColor = defaultOptions.nowGraphStrokeColor
    this.cornerColor = defaultOptions.cornerColor
    this.cornerSize = defaultOptions.cornerSize
    this.maxNum = defaultOptions.maxNum
  }

  /**
   * @description: 开始绘制多边形
   * @param polygonOptions 多边形配置
   * @param callback 绘制完成后的回调
   */
  startDraw(polygonOptions?: fabric.IObjectOptions, callback?: (polygon: fabric.Polygon) => void) {
    if (this.isStarted) return
    this.canvas.on('mouse:down', this.mouseDown)
    this.canvas.on('mouse:move', this.mouseMove)
    this.canvas.on('mouse:dblclick', this.mouseDblclick)
    this.polygonOptions = polygonOptions
    this.finishCallback = callback
    this.isStarted = true
  }

  /**
   * 结束
   */
  endDraw() {
    if (!this.isStarted) return
    this.canvas.off('mouse:down', this.mouseDown)
    this.canvas.off('mouse:move', this.mouseMove)
    this.canvas.off('mouse:dblclick', this.mouseDblclick)
    this.currentPolygon = null
    this.polygonOptions = undefined
    this.finishCallback = undefined
    this.isStarted = false
  }

  /**
   * 鼠标按下
   * @param e
   * @returns
   */
  private mouseDown = (e: fabric.IEvent) => {
    // 鼠标右击
    if (e.button === 3) {
      return this.mouseRightClick()
    }
    // 鼠标在已绘制图形上启用拖动
    if (e.target && e.target instanceof fabric.Polygon) {
      this.canvas.setActiveObject(e.target as fabric.Object)
      this.updateGraphPosition(e.target as fabric.Polygon)
      return
    }

    const currentPoint = e.absolutePointer as fabric.Point
    // 鼠标在未绘制图形上启用绘制
    if (this.currentPolygon === null) {
      // 获取画布中对象总数量
      const total = this.canvas.getObjects().length
      if (total >= this.maxNum) {
        ;(this.eventMap as EventMap)?.error?.({ code: ERROR_TYPE.MAX_NUM, message: '超出最大绘制个数' })
        this.deleteCurrentPolygon()
        return message.warning(`最多只能绘制${this.maxNum}个`)
      }
      // 创建多边形
      this.currentPolygon = this.create([
        { x: currentPoint.x, y: currentPoint.y },
        { x: currentPoint.x, y: currentPoint.y },
      ])

      this.canvas.add(this.currentPolygon)
    } else {
      // 更新多边形点
      this.updateDot(currentPoint)
    }
  }

  /**
   * 鼠标移动
   * @param e
   */
  private mouseMove = (e: fabric.IEvent) => {
    const currentPoint = e.absolutePointer as fabric.Point
    if (this.currentPolygon) {
      this.updatePath(currentPoint)
    }
  }

  /**
   * 鼠标双击
   */
  private mouseDblclick = () => {
    this.finish()
  }

  /**
   * 鼠标右击
   */
  private mouseRightClick = () => {
    this.mouseDblclick()
  }

  /**
   * 创建多边形
   * @param points
   * @param options
   * @returns
   */
  create(points: Point[], options?: fabric.IObjectOptions) {
    const polygon = new fabric.Polygon(points, {
      // 填充色
      fill: this.nowGraphFillColor,
      strokeWidth: 1,
      cornerSize: this.cornerSize,
      stroke: this.nowGraphStrokeColor,
      objectCaching: false,
      transparentCorners: false,
      cornerColor: this.cornerColor,
      hasBorders: false,
      // 禁止旋转
      lockRotation: true,
      // 不显示旋转控件
      hasRotatingPoint: false,
      // 禁止缩放
      lockScalingX: true,
      lockScalingY: true,
      // 显示缩放控件
      hasControls: true,
      ...this.polygonOptions,
      ...options,
    })
    this.createControl(polygon)
    return polygon
  }

  /**
   * 更新图形位置
   * @param currentPolygon
   * @returns
   */
  updateGraphPosition(currentPolygon: fabric.Polygon) {
    if (currentPolygon === null || !(currentPolygon instanceof fabric.Polygon)) return
    let left = currentPolygon.left!
    let top = currentPolygon.top!
    const points = currentPolygon.points as fabric.Point[]
    const modified = (e: fabric.IEvent<Event>) => {
      let modifiedObject = e.target as fabric.Polygon
      let offsetX = modifiedObject.left! - left
      let offsetY = modifiedObject.top! - top
      if (modifiedObject instanceof fabric.Polygon) {
        let newPoints = [] as fabric.Point[]
        for (let index = 0; index < points.length; index++) {
          const { x, y } = points[index]
          newPoints[index] = { x: x + offsetX, y: y + offsetY } as fabric.Point
        }
        this.canvas.remove(modifiedObject)
        const polygon = this.create(newPoints)
        this.canvas.add(polygon)
        this.canvas.setActiveObject(polygon)
        this.canvas.requestRenderAll()

        if (!this.validate(polygon)) {
          this.canvas.remove(polygon)
        }
      }
      this.canvas.off('object:modified', modified)
    }
    // 元素被修改时触发
    this.canvas.off('object:modified', modified)
    this.canvas.on('object:modified', modified)
    const up = () => {
      this.canvas.off('mouse:up', up)
      this.canvas.off('object:modified', modified)
    }
    // 监听鼠标松开
    this.canvas.on('mouse:up', up)
  }

  /**
   * 更新多边形点位
   * @param point
   * @returns
   */
  updateDot(point: fabric.Point) {
    const points = this.currentPolygon!.points as fabric.Point[]
    if (this.isIntersect(points)) {
      return message.warning('线段不能相交')
    }
    if (this.maxDotCount !== -1 && points.length >= this.maxDotCount) {
      ;(this.eventMap as EventMap)?.error?.({ code: ERROR_TYPE.MAX_POINT, message: '点的数量过多' })
      return this.finish()
    }
    points.push(point)
    this.canvas.requestRenderAll()
  }

  /**
   * 更新绘制路径
   * @param point
   */
  updatePath(point: fabric.Point) {
    const points = this.currentPolygon!.points as fabric.Point[]
    points[points.length - 1].x = point.x
    points[points.length - 1].y = point.y
    this.canvas.requestRenderAll()
  }

  /**
   * 完成多边形
   * @param points
   * @returns
   */
  finish() {
    if (!this.currentPolygon) return
    const points = this.currentPolygon!.points as fabric.Point[]
    const newPoints = this.uniquePoint(points)
    this.currentPolygon.points = newPoints
    if (this.minDotCount !== -1 && newPoints.length < this.minDotCount) {
      ;(this.eventMap as EventMap)?.error?.({ code: ERROR_TYPE.MIN_POINT, message: '点的数量过少' })
      this.deleteCurrentPolygon()
      return message.warning('点的数量过少，已删除')
    }
    if (!this.validate(this.currentPolygon as fabric.Polygon)) {
      this.canvas.remove(this.currentPolygon as fabric.Polygon)
      this.deleteCurrentPolygon()
      return
    }
    this.canvas.remove(this.currentPolygon as fabric.Polygon)
    const polygon: fabric.Polygon = this.create(newPoints)

    this.canvas.add(polygon as fabric.Polygon)
    // 选中当前图形
    this.canvas.setActiveObject(polygon)
    this.finishCallback && this.finishCallback(polygon)
    this.currentPolygon = null
    this.canvas.requestRenderAll()
  }

  /**
   * 点位去重
   * @param points
   * @returns
   */
  private uniquePoint(points: fabric.Point[]) {
    const newPoints: fabric.Point[] = []
    points.forEach((item) => {
      const isExist = newPoints.some((point) => {
        return point.x === item.x && point.y === item.y
      })
      if (!isExist) {
        newPoints.push(item)
      }
    })
    return newPoints
  }

  /**
   * 验证是否可以绘制
   * @param polygon
   * @returns
   */
  private validate(polygon: fabric.Polygon) {
    if (!polygon || !polygon?.canvas) {
      return false
    }
    let points = polygon.points as fabric.Point[]
    if (this.isIntersect(points)) {
      ;(this.eventMap as EventMap)?.error?.({ code: ERROR_TYPE.INTERSECT, message: '不能相交' })
      message.warning('线段不能相交，已删除')
      return false
    }
    const { top, left, width, height, scale } = this.getBackgroundInfo(polygon)
    for (let index = 0; index < points.length; index++) {
      const point = points[index]
      // 超出左边界
      if (point.x < left) {
        point.x = left
      }
      // 超出右边界
      if (point.x > left + width * scale) {
        point.x = left + width * scale
      }
      // 超出上边界
      if (point.y < top) {
        point.y = top
      }
      // 超出下边界
      if (point.y > top + height * scale) {
        point.y = top + height * scale
      }
    }

    return true
  }

  /**
   * 获取背景信息
   * @param polygon
   * @returns
   */
  getBackgroundInfo(polygon: fabric.Polygon) {
    let bgcTop: number, bgcLeft: number, bgcWidth: number, bgcHeight: number, bgcScale: number
    if (polygon?.canvas?.backgroundImage) {
      const backgroundImage = polygon.canvas.backgroundImage as any
      bgcTop = backgroundImage.top
      bgcLeft = backgroundImage.left
      bgcWidth = backgroundImage.width
      bgcHeight = backgroundImage.height
      bgcScale = backgroundImage.scaleX
    } else {
      bgcTop = 0
      bgcLeft = 0
      bgcWidth = polygon?.canvas?.width || 0
      bgcHeight = polygon?.canvas?.height || 0
      bgcScale = 1
    }

    return {
      top: bgcTop,
      left: bgcLeft,
      width: bgcWidth,
      height: bgcHeight,
      scale: bgcScale,
    }
  }

  /**
   * 获取图形在图片中的原始坐标
   * @param polygon
   * @returns
   */
  getOriginAxis(imageObj: PositionInfo, polygon: fabric.Polygon, scale: number) {
    if (!(polygon instanceof fabric.Polygon)) return
    const { top, left } = imageObj
    const points = polygon.points as fabric.Point[]
    const originPoints: number[][] = []
    points.forEach((item) => {
      const { x, y } = item
      originPoints.push([fomatFloat((x - left) / scale, 6), fomatFloat((y - top) / scale, 6)])
    })
    return originPoints
  }

  /**
   * 获取图形在当前图片中的坐标
   * @param imageObj
   * @param graphAxis
   * @param scale
   * @returns
   */
  getCurrentAxis(imageObj: PositionInfo, graphAxis: number[][], scale: number): fabric.Point[] {
    if (!imageObj || !graphAxis) return []
    const { top: bgcTop, left: bgcLeft } = imageObj
    let points: fabric.Point[] = []
    for (let i = 0; i < graphAxis.length; i++) {
      const element = graphAxis[i]
      let x = element[0] * scale + bgcLeft
      let y = element[1] * scale + bgcTop
      points.push({ x, y } as fabric.Point)
    }

    return points
  }

  /**
   * 判断这组数据是否存在相交情况
   */
  isIntersect(points: fabric.Point[]) {
    const lines: fabric.Line[] = []
    points = this.uniquePoint(points)
    let intersectLength = 0
    for (let i = 0; i < points.length; i++) {
      const item = points[i]
      const nextItem = points[i + 1]
      if (nextItem) {
        lines.push({
          x1: item.x,
          y1: item.y,
          x2: nextItem.x,
          y2: nextItem.y,
        } as fabric.Line)
      } else {
        lines.push({
          x1: item.x,
          y1: item.y,
          x2: points[0].x,
          y2: points[0].y,
        } as fabric.Line)
      }
    }
    for (let i = 0; i < lines.length; i++) {
      const item = lines[i]
      for (let j = i + 1; j < lines.length; j++) {
        const nextItem = lines[j]
        if (this.doEdgesIntersect(item, nextItem)) {
          intersectLength++
        }
      }
    }
    return intersectLength > lines.length
  }

  /**
   * 判断两条线是否相交
   * @param line1
   * @param line2
   * @returns
   */
  doEdgesIntersect(line1: fabric.Line, line2: fabric.Line) {
    // 计算向量 A 和 B
    const { x1, y1, x2, y2 } = line1
    const { x1: x3, y1: y3, x2: x4, y2: y4 } = line2
    let A = { x: x2! - x1!, y: y2! - y1! }
    let B = { x: x4! - x3!, y: y4! - y3! }

    // 计算向量 C 作为线段1的起点到线段2的起点的向量
    let C = { x: x3! - x1!, y: y3! - y1! }

    // 计算交叉积
    let cross = A.x * B.y - A.y * B.x

    // 如果 cross 为零，则线段平行
    if (Math.abs(cross) < 1e-8) {
      // 检查线段是否共线（重叠）
      if (Math.abs(C.x * A.y - C.y * A.x) < 1e-8 && Math.abs(C.x * B.y - C.y * B.x) < 1e-8) {
        // 检测线段重叠
        return true
      }
      // 线段平行但不重叠
      return false
    }

    // 计算 t 和 u，它们是参数化方程 x = x1 + t * (x2 - x1) 和 x = x3 + u * (x4 - x3) 的参数
    let t = (C.x * B.y - C.y * B.x) / cross
    let u = (C.x * A.y - C.y * A.x) / cross

    // 如果 t 和 u 在 [0, 1] 范围内，则线段相交
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return true
    }

    return false
  }

  /**
   * 新增监听事件
   * @param type
   * @param callback
   */
  addListener(type: EventKey, callback: Function) {
    ;(this.eventMap as EventMap)![type] = callback
  }

  /**
   * 移除监听事件
   * @param type
   */
  removeListener(type: EventKey) {
    ;(this.eventMap as EventMap)![type] = undefined
  }

  /**
   * 移除所有监听事件
   */
  removeAllListener() {
    this.eventMap = {}
  }

  /**
   * 删除当前正在绘制的图形
   */
  deleteCurrentPolygon() {
    this.canvas.remove(this.currentPolygon as fabric.Polygon)
    this.currentPolygon = null
  }

  /**
   * 清除当前绘制的对象
   */
  clearCurrentObject() {
    if (this.currentPolygon) {
      this.canvas.remove(this.currentPolygon)
      this.currentPolygon = null
    }
  }

  /**
   * 清除所有多边形
   */
  clearAll() {
    this.canvas.getObjects().forEach((item) => {
      if (item instanceof fabric.Polygon) {
        this.canvas.remove(item)
      }
    })
  }

  /**
   * 销毁
   */
  destroy() {
    this.endDraw()
    this.currentPolygon = null
    this.polygonOptions = undefined
    this.finishCallback = undefined
  }

  /**
   * 创建多边形控制点并使其可根据多边形一起被拖动
   * @param polygon
   * @returns
   */
  createControl(polygon: fabric.Polygon = this.canvas.getActiveObject() as fabric.Polygon) {
    if (!(polygon instanceof fabric.Polygon)) return
    polygon.cornerStyle = 'rect'
    polygon.cornerColor = this.nowGraphStrokeColor
    const lastControl = polygon.points!.length - 1

    const getObjectSizeWithStroke = (object: fabric.Polygon) => {
      const stroke = new fabric.Point(
        object.strokeUniform ? 1 / object.scaleX! : 1,
        object.strokeUniform ? 1 / object.scaleY! : 1,
      ).multiply(object.strokeWidth as number)
      return new fabric.Point(object.width! + stroke.x, object.height! + stroke.y)
    }

    // define a function that will define what the control does
    // this function will be called on every mouse move after a control has been
    // clicked and is being dragged.
    // The function receive as argument the mouse event, the current trasnform object
    // and the current position in canvas coordinate
    // transform.target is a reference to the current object being transformed,
    const actionHandler = (_eventData: any, transform: any, x: number, y: number) => {
      const polygon = transform.target,
        currentControl = polygon.controls[polygon.__corner],
        mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
        polygonBaseSize = getObjectSizeWithStroke(polygon),
        size = polygon._getTransformedDimensions(0, 0),
        finalPointPosition = {
          x: (mouseLocalPosition.x * polygonBaseSize.x) / size.x + polygon.pathOffset.x,
          y: (mouseLocalPosition.y * polygonBaseSize.y) / size.y + polygon.pathOffset.y,
        }
      polygon.points[currentControl.pointIndex] = finalPointPosition
      return true
    }

    // define a function that can keep the polygon in the same position when we change its
    // width/height/top/left.
    const anchorWrapper = (anchorIndex: number, fn: any) => {
      return function (eventData: any, transform: any, x: number, y: number) {
        const fabricObject = transform.target,
          absolutePoint = fabric.util.transformPoint(
            {
              x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
              y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
            } as fabric.Point,
            fabricObject.calcTransformMatrix(),
          ),
          actionPerformed = fn(eventData, transform, x, y),
          polygonBaseSize = getObjectSizeWithStroke(fabricObject),
          newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
          newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y
        fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5)
        return actionPerformed
      }
    }

    polygon.controls = polygon.points!.reduce(function (acc: any, _point, index) {
      acc['p' + index] = new fabric.Control({
        positionHandler: (_dim: Point, _finalMatrix: any, fabricObject: fabric.Object) => {
          const x = polygon.points![index].x - polygon.pathOffset.x
          const y = polygon.points![index].y - polygon.pathOffset.y
          const point = { x: x, y: y } as fabric.Point
          return fabric.util.transformPoint(
            point,
            fabric.util.multiplyTransformMatrices(
              fabricObject.canvas?.viewportTransform as number[],
              fabricObject.calcTransformMatrix(),
            ),
          )
        },
        actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
        actionName: 'modifyPolygon',
        pointIndex: index,
      } as any)
      return acc
    }, {})
  }
}
