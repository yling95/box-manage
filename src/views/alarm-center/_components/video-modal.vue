<template>
  <g-modal v-model:visible="visible" fullscreen :footer="null" destroyOnClose @cancel="onCancel">
    <div class="alarm-modal" @dblclick="onDbClick">
      <div class="carousel-wrap">
        <g-video-spin :spinning="spinning">
          <div class="carousel-item" ref="aiVideoRef">
            <video id="video" class="video" autoplay muted></video>
            <img
              v-if="videoMaskingEnabled"
              :src="getRealUrl(getImgUrl('device/mask/', videoData.deviceId))"
              class="image"
              @error.once="(e: any) => (e.currentTarget.src = '')"
            />
          </div>
          <canvas v-if="isFullVideo" id="gxAiMarkCanvas" class="gxAiMarkCanvas"></canvas>
        </g-video-spin>
        <div class="video-location">
          <div class="location-locationName">{{ StrFn(videoData.deviceConcatName, true) }}</div>
          <div>-</div>
          <div class="location-deviceName">{{ StrFn(videoData.deviceConcatName, false) }}</div>
        </div>
        <div class="ai-num-wrap">
          <img src="@/assets/images/public/icon_ai.png" alt="" />
          <span>{{ videoData?.deviceActiveSrvCount }}</span>
        </div>
      </div>
    </div>
  </g-modal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, onUnmounted } from 'vue'
import { AlarmCenterListProps } from '../interface'
import { JSWebrtc } from '@/utils/webtc'
import { getRealUrl, getImgUrl } from '@/utils/utils'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import createAiMarkModule from '../../../utils/Webassembly/edge-box-ai-mark-agent'
import { useElementBounding } from '@vueuse/core'
const visible = ref(false)

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const videoData = ref<AlarmCenterListProps>({} as AlarmCenterListProps)

const spinning = ref<boolean>()

const emit = defineEmits(['openAiMarkFn'])

const onCancel = () => {
  visible.value = false
  play?.destroy && play.destroy()
}

onUnmounted(() => {
  if (!isFullVideo.value) return
  isFullVideo.value = false
  aiMark.value.unbindDevice(0)
  aiMark.value.closeAiMarkService()
})
// 是否显示视频遮罩
const videoMaskingEnabled = computed(() => (userInfo.value.videoMaskingEnabled === 1 ? true : false))

let play: any = null

const StrFn = (str: string, position: boolean) => {
  let index = str.indexOf('-')
  if (position) {
    return str.substring(0, index)
  } else {
    return str.substring(index + 1)
  }
}

const isFullVideo = ref<boolean>(false)

const aiMark = ref()

const getModuleFn = async (fullVideo: boolean) => {
  aiMark.value = await createAiMarkModule()
  if (fullVideo) {
    aiMark.value.setDivision(1)
    aiMark.value.bindDevice(0, videoData.value.deviceId)
    canvasPositionFn()
  }
}

const aiVideoRef = ref()

const { x, y, width, height } = useElementBounding(aiVideoRef)

watch(
  () => {
    return {
      x: x.value,
      y: y.value,
      width: width.value,
      height: height.value,
    }
  },
  () => {
    isFullVideo.value && canvasPositionFn()
  },
)
// ai标记位置
const canvasPositionFn = () => {
  const aiCanvas = document.getElementById('gxAiMarkCanvas')
  if (!aiCanvas) return
  if (width.value / 16 > height.value / 9) {
    const currentWidth = (height.value / 9) * 16
    const left = (width.value - currentWidth) / 2
    aiMark.value && aiMark.value.setCanvasSize(currentWidth, height.value)
    aiCanvas.style['left'] = `${left}px`
  } else {
    const currentHeight = (width.value / 16) * 9
    const top = (height.value - currentHeight) / 2
    aiMark.value && aiMark.value.setCanvasSize(width.value, currentHeight)
    aiCanvas.style['top'] = `${top}px`
  }
}

const openModal = (data: AlarmCenterListProps, fullVideo: boolean = false) => {
  spinning.value = true
  videoData.value = data
  visible.value = true
  isFullVideo.value = fullVideo

  nextTick(() => {
    const theVideo = document.getElementById(`video`)
    //@ts-ignore
    play = new JSWebrtc.Player(videoData.value.deviceStreamingLocation, {
      video: theVideo,
      autoplay: true,
      onPlay: () => {
        spinning.value = false
        fullVideo && getModuleFn(fullVideo)
      },
    })
  })
}

const closeModal = (callback?: Function) => {
  visible.value = false
  callback && callback()
}

const onDbClick = () => {
  closeModal()
}

defineExpose({
  openModal,
  closeModal,
})
</script>

<style lang="less" scoped>
.alarm-modal {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 100px;
}
.carousel-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0 8px;
  margin-top: 20px;
  position: relative;
  .g-video-spin {
    width: 100%;
    height: 803px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .gxAiMarkCanvas {
      position: absolute;
      top: 0;
    }
  }
  .carousel-item {
    width: 100%;
    height: 803px;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: radial-gradient(50% 36.98% at 50% 100%, rgba(69, 83, 106, 0.5) 0%, rgba(56, 83, 128, 0) 100%), #161c2e;
    position: relative;
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .image {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
    }
  }
  .video-location {
    position: absolute;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    color: @text1;
    bottom: 4px;
    left: 8px;
    z-index: 9;
    text-shadow: 0px 0px 1.5px rgba(37, 37, 45, 0.8);
    & > div {
      display: inline-block;
      .ellipsis();
    }
    .location-locationName {
      max-width: 202px;
    }
    .location-deviceName {
      max-width: 130px;
    }
  }
}

//所有控件
video::-webkit-media-controls-enclosure {
  width: 100%;
}
</style>
