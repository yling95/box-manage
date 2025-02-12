<template>
  <button @click="start">开始</button>
  <button @click="drawLine">线</button>
  <button @click="drawRect">矩形</button>
  <button @click="drawPolygon">多边形</button>
  <button @click="stop">停止</button>
  <button @click="getPolygonAxis">获取多边形坐标点</button>
  <canvas id="canvas" class="canvas"></canvas>
  <video id="my-video" class="my-video" width="1920" height="1080">
    <!-- <source src="../../public/video.mp4" type="video/mp4" /> -->
  </video>
</template>

<script setup lang="ts">
import { Line, Rect, Polygon } from '@/utils/fabric'
import { fabric } from 'fabric'
import { onMounted } from 'vue'

let canvas: fabric.Canvas
let line: Line
let rect: Rect
let polygon: Polygon
let video: HTMLVideoElement
function init() {
  video = document.getElementById('my-video') as HTMLVideoElement
  canvas = new fabric.Canvas('canvas')
  canvas.selection = false
  canvas.setWidth(960)
  canvas.setHeight(540)
  line = new Line(canvas)
  rect = new Rect(canvas)
  polygon = new Polygon(canvas)
}

function draw() {
  const backgroundVideo = new fabric.Image(video)
  canvas.setBackgroundImage(backgroundVideo, canvas.renderAll.bind(canvas), {
    left: 0,
    top: 0,
    scaleX: canvas.width! / video.width!, // 计算出图片要拉伸的宽度
    scaleY: canvas.height! / video.height!, // 计算出图片要拉伸的高度
  })
  canvas.renderAll()
  requestAnimationFrame(draw)
}

onMounted(() => {
  init()
})

function start() {
  video.play()
  requestAnimationFrame(draw)
}
// 停止绘制
function stop() {
  rect.endDraw()
  line.endDraw()
  polygon.endDraw()
}

// 绘制多边形
function drawPolygon() {
  stop()
  polygon.startDraw()
}

// 绘制线
function drawLine() {
  stop()
  line.startDraw()
}

// 绘制矩形
function drawRect() {
  stop()
  rect.startDraw({
    strokeWidth: 1,
    opacity: 0.5,
  })
}

function getPolygonAxis() {
  let list = [
    [
      [240, 145],
      [416, 141],
      [410, 393],
      [201, 369],
      [201, 368],
    ],
    [
      [635, 130],
      [816, 130],
      [816, 342],
      [635, 342],
      [635, 191],
    ],
  ]
  list.forEach((item) => {
    console.log(polygon.getCurrentAxis({ left: 20, top: 20 }, item, 2))
  })
}

// 监听键盘delete按键
document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete') {
    // 删除激活的矩形
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.renderAll()
    }
  }
})
</script>

<style lang="less" scoped>
.canvas {
  border: 1px solid #ccc;
  background-color: #fff;
  object-fit: cover;
}
.my-video {
  display: none;
}
</style>
