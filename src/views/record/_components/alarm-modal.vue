<template>
  <g-modal v-model:visible="visible" fullscreen :footer="null" destroy-on-close @cancel="onCancel">
    <div style="display: flex; align-items: center; height: 100%; width: 100%">
      <a-button class="alone-icon-button" :class="[(dataList.length === 1 || hidePrev) && 'hidden']" @click.stop="prev">
        <i class="iconfont icon-arrow-left-s-line"></i>
      </a-button>
      <div class="alarm-modal">
        <div class="content">
          <div class="left">
            <div class="alarm-modal-top">
              <ul class="media-tabs" v-if="dataList[activeIndex].type === 'video'">
                <li
                  class="media-tab"
                  :class="[index === tabActiveIndex && 'active']"
                  v-for="(item, index) in tabs"
                  :key="item.key"
                  @click="changeTab(index)"
                >
                  {{ item.name }}
                </li>
              </ul>
              <div class="_right">
                <i class="iconfont icon-mouse" style="margin-right: 8px"></i>
                可使用鼠标缩放和拖拽图片
              </div>
            </div>
            <div
              class="carousel-item"
              :style="{ padding: props.recordFaceData.length ? '' : '0 32px' }"
              :key="activeIndex"
            >
              <g-image
                v-if="tabActive?.key === 'image'"
                :error="defaultImage"
                :src="dataList[activeIndex]?.image"
                :scalable="true"
                :min-scale="0"
                :max-scale="50"
              />
              <div class="video-wrap" v-show="tabActive?.key === 'video'">
                <g-video-spin :spinning="dataList[activeIndex]?.spinning">
                  <video :id="`video-${dataList[activeIndex]?.id}`" class="video" autoplay muted />
                </g-video-spin>
              </div>
            </div>
            <div class="alarm-modal-bottom">
              <div class="alarm-modal-bottom-left" v-if="!hideInfo">
                <div class="alarm-modal-bottom-info">
                  <div class="tag">
                    <span>{{ dataList[activeIndex]?.tag || '' }}</span>
                    <a-tooltip>
                      <template #title> 与【人脸识别】算法产生报警联动 </template>
                      <i
                        class="iconfont algoLinkIcon icon-links-line"
                        v-if="
                          dataList[activeIndex]?.algorithmLinkageAlarm !== null &&
                          dataList[activeIndex]?.algorithmLinkageAlarm !== undefined &&
                          dataList[activeIndex]?.algorithmLinkageAlarm !== -1
                        "
                      ></i>
                    </a-tooltip>
                  </div>

                  <p class="time">{{ dataList[activeIndex]?.time || '' }}</p>
                  <div class="media-tag lg" v-if="dataList[activeIndex]?.type === 'video'">
                    <i class="iconfont icon-play-fill"></i>
                    视频
                  </div>
                </div>
                <div class="alarm-modal-bottom-info">
                  <div class="icon-camera">
                    <i class="iconfont icon-shexiangtou"></i>
                  </div>
                  <div class="title-wrap">
                    <p class="title">{{ dataList[activeIndex]?.title || '' }}</p>
                    <p class="sub-title" v-if="dataList[activeIndex]?.subTitle">
                      -{{ dataList[activeIndex]?.subTitle || '' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="alarm-modal-bottom-right">
                <a-button type="default" class="icon-button" :loading="openVideoLoading" @click="handleDownLoad('AI')">
                  <i class="iconfont icon-download-2-line"></i>
                  {{ tabActive?.key === 'video' ? '下载视频' : '下载图片' }}
                </a-button>
                <a-button v-if="isDebug" type="default" class="icon-button" @click="handleDownLoad('origin')">
                  <i class="iconfont icon-download-2-line"></i>
                  下载原图
                </a-button>
              </div>
            </div>
          </div>
          <div class="right" v-if="props.recordFaceData.length">
            <div class="record-title">识别记录</div>
            <div class="record-list">
              <div v-for="item in props.recordFaceData" :key="item.id" class="record-item">
                <img
                  :src="getRealUrl(item.detectImage)"
                  :onerror="
                    (e:any) => {
                      console.log(e);
                      e.target.src = noImgDefaultImage
                      e.target.style.objectFit='cover'
                      e.target.onerror = null 
                    }
                  "
                />
                <img
                  :src="getRealUrl(item.imageLocation)"
                  :onerror="
                    (e:any) => {
                      console.log(e);
                      e.target.src = item.storageType === 2 ? strangerImg : noImgDefaultImage
                      e.target.style.objectFit='cover'
                      e.target.onerror = null 
                    }
                  "
                />
                <div class="info-box">
                  <p class="name" :title="item.personName">
                    <span v-if="item.personName"> {{ item.personName }}</span>
                    <span v-else class="no-data">-</span>
                  </p>
                  <p class="id" :title="item.thirdpartyId ? `ID: ${item.thirdpartyId}` : ''">
                    <span v-if="item.thirdpartyId"> ID:{{ item.thirdpartyId }}</span>
                    <span v-else class="no-data">-</span>
                  </p>
                  <span :class="['alarm-type', { 'alarm-type--black': item.storageType === 0 }]">{{
                    StorageType[item.storageType as StorageTypeKey]
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a-button
        type="default"
        class="alone-icon-button"
        :class="[(dataList.length === 1 || hideNext) && 'hidden']"
        @click.stop="next"
        ><i class="iconfont icon-arrow-right-s-line"></i
      ></a-button>
    </div>
  </g-modal>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted, ref, computed } from 'vue'
import { Carousel } from 'ant-design-vue'
import { getFileName2, getFileSuffix, getRealUrl } from '@/utils/utils'
import defaultImage from '@/assets/images/alarm/default.jpg'
import noImgDefaultImage from '@/assets/images/alarm/no-img.png'
import strangerImg from '@/assets/images/record/stranger.png'
import { GImage } from 'g6-ui'
import { useRoute } from 'vue-router'
import useTabs from '@/hooks/useTabs'
import { downloadFile, systemApi } from '@/services/api'
import { JSWebrtc } from '@/utils/webtc'
import { useRequest } from 'vue-request'

type StorageTypeKey = 0 | 1 | 2 | 3
const StorageType = ref({
  0: '黑名单',
  1: '白名单',
  2: '陌生人',
  3: '黑白名单',
})

// 键盘快捷键切换图片
const switchover = (e: KeyboardEvent) => {
  if (!visible.value || dataList.value.length < 2) return
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && !props.hidePrev) {
    prev()
  } else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !props.hideNext) {
    next()
  }
}
window.addEventListener('keydown', switchover)

const props = defineProps({
  activeIndex: {
    type: Number,
    default: 0,
  },
  hideInfo: {
    type: Boolean,
    default: false,
  },
  hidePrev: {
    type: Boolean,
    default: false,
  },
  hideNext: {
    type: Boolean,
    default: false,
  },
  recordFaceData: {
    type: Object,
    default: [],
  },
})

const visible = ref(false)
const carouselRef = ref<typeof Carousel>()
const route = useRoute()

const changeTabCallback = async (_index: number, tab: any) => {
  const data = dataList.value[props.activeIndex]
  if (tab?.key === 'image') return
  // 开始视频
  try {
    const { data: result } = await systemApi.openVideo({ alarmId: data.id })
    videoRender(result.videoUrl)
  } finally {
  }
}

const closeVideo = async () => {
  const data = dataList.value[props.activeIndex]
  if (data.type === 'image') return
  await systemApi.closeVideo({ alarmId: data.id })
}
const { tabs, tabActive, tabActiveIndex, changeTab } = useTabs(
  [
    {
      name: '抓拍图片',
      key: 'image',
    },
    {
      name: '抓拍视频',
      key: 'video',
    },
  ],
  changeTabCallback,
)

const isDebug = computed(() => {
  return route.query.isDebug
})

export type ResourceType = 'image' | 'video'
export interface CarouselDataProps {
  id?: number
  type?: ResourceType
  image?: string
  video?: string
  time?: string
  title?: string
  subTitle?: string
  tag?: string
  downLoadLink?: string
  spinning?: boolean
  algorithmLinkageAlarm?: null | number
}

const dataList = ref<CarouselDataProps[]>([])

const onCancel = () => {
  visible.value = false
  openVideoLoading.value = false
  changeTab(0)
  closeVideo()
  emits('close')
}
const emits = defineEmits(['next', 'prev', 'close'])

// 上一张
const prev = () => {
  openVideoLoading.value = false
  changeTab(0)
  closeVideo()
  emits('prev', props.activeIndex)
}
// 下一张
const next = () => {
  openVideoLoading.value = false
  changeTab(0)
  closeVideo()
  emits('next', props.activeIndex)
}

// 下载
const { loading: openVideoLoading, runAsync: runOpenVideo } = useRequest(systemApi.openVideo)
const handleDownLoad = async (type: 'AI' | 'origin') => {
  const data = dataList.value[props.activeIndex]
  if (tabActive.value?.key === 'image') {
    let downLink = data.downLoadLink
    if (type === 'origin') {
      downLink = `${getFileName2(data.downLoadLink)}-A.${getFileSuffix(data.downLoadLink)}`
    }
    const name = `${Date.now()}-${data.tag || ''}-${data.title}${type === 'origin' ? '-A' : ''}.${getFileSuffix(
      data.image,
    )}`
    downloadFile(downLink || '', name)
  } else {
    const { data: result } = await runOpenVideo({ alarmId: data.id, realtime: 0 })
    const name = `${Date.now()}-${data.tag || ''}-${data.title}${type === 'origin' ? '-A' : ''}.${getFileSuffix(
      result.videoUrl,
    )}`
    downloadFile(getRealUrl(result.videoUrl || ''), name)
  }
}

const openModal = (data: CarouselDataProps[], index = 0) => {
  visible.value = true
  dataList.value = data
  nextTick(() => {
    const box = document.querySelector('.carousel-item')
    const video = document.querySelector('#video') as HTMLVideoElement
    if (video) {
      video.width = box?.clientWidth || 1080
      video.height = box?.clientHeight || 622
    }
    carouselRef.value?.goTo(index, true)
  })
}

const changeData = (data: CarouselDataProps[]) => {
  dataList.value = data
}

const closeModal = (callback: Function) => {
  onCancel()
  callback && callback()
}

// 渲染视频
let oldVideoPlay: any = null
const videoRender = (url: any) => {
  const data = dataList.value[props.activeIndex]
  if (oldVideoPlay) {
    oldVideoPlay.destroy()
    oldVideoPlay = null
  }
  data.spinning = true
  nextTick(() => {
    const theVideo = document.getElementById(`video-${data?.id}`)
    //@ts-ignore
    oldVideoPlay = new JSWebrtc.Player(url, {
      video: theVideo,
      autoplay: true,
      onPlay: () => {
        data.spinning = false
      },
    })
  })
}

defineExpose({
  openModal,
  closeModal,
  changeData,
})

onUnmounted(() => {
  window.removeEventListener('keydown', switchover)
})
</script>
<style lang="less" scoped>
.alarm-modal {
  margin: 0 auto;
  border-radius: 8px;
  display: flex;
  margin: 0 64px;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(0deg, rgba(46, 75, 120, 0.15) 0%, rgba(46, 75, 120, 0.15) 100%),
    radial-gradient(50% 36.98% at 50% 100%, rgba(69, 83, 106, 0.5) 0%, rgba(56, 83, 128, 0) 100%), #161c2e;

  .content {
    width: 100%;
    display: flex;
    .left {
      flex-grow: 1;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(0deg, rgba(46, 75, 120, 0.15) 0%, rgba(46, 75, 120, 0.15) 100%),
        radial-gradient(50% 36.98% at 50% 100%, rgba(69, 83, 106, 0.5) 0%, rgba(56, 83, 128, 0) 100%), #161c2e;
      .alarm-modal-top {
        padding: 16px 32px 0 32px;
        display: flex;
        width: 100%;
        justify-content: flex-end;
        height: 53px;
        position: relative;
        align-items: self-start;
        margin-bottom: 8px;

        .media-tabs {
          height: 100%;
          position: absolute;
          top: 0;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 0 40px;
          transform: translateX(-50%);

          .media-tab {
            height: 33px;
            color: @text2;
            font-size: 16px;
            font-weight: 700;
            line-height: 24px;
            cursor: pointer;
            position: relative;

            &.active {
              &::after {
                content: '';
                width: 100%;
                height: 3px;
                background-color: @primary1;
                position: absolute;
                left: 0;
                bottom: 0;
              }
            }
          }
        }

        ._right {
          color: @text4;
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: 22px;
          align-items: center;
          align-items: self-start;

          display: flex;
        }
      }
      .carousel-item {
        width: 100%;
        height: calc(100vh - 240px);

        .video-wrap {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

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
      }
      .alarm-modal-bottom {
        padding: 16px 32px 32px 32px;
        width: 100%;
        height: 114px;
        display: flex;

        .alarm-modal-bottom-left {
          display: flex;
          flex-direction: column;

          .alarm-modal-bottom-info {
            display: flex;
            align-items: center;
            .algoLinkIcon {
              font-size: 18px;
              margin-left: 8px;
              font-weight: 400;
              color: @primary2;
            }

            .tag {
              color: @text1;
              font-size: 20px;
              font-style: normal;
              font-weight: 700;
              line-height: 26px;
              margin-right: 16px;
            }

            .time {
              color: @primary2;
              text-align: center;
              font-size: 14px;
              font-style: normal;
              font-weight: 700;
              line-height: 22px;
              display: flex;
              padding: 4px 12px;
              align-items: center;
              gap: 6px;
              border-radius: 100px;
              border: 1px solid @border2;
              background: @mask2;
              margin-right: 8px;
            }

            &:last-child {
              padding-top: 10px;

              .icon-camera {
                border-radius: 8px;
                border: 1px solid @border2;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 8px;

                i {
                  color: #a7b0bc;
                  font-size: 20px;
                }
              }

              .title-wrap {
                display: flex;
                color: @text1;
                font-size: 16px;
                font-weight: 700;
                line-height: 24px;
              }
            }
          }
        }

        .alarm-modal-bottom-right {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-left: auto;
        }

        .title {
          color: @text1;
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: 24px;
        }
      }
    }
    .right {
      width: 288px;
      max-height: 100%;
      overflow: hidden;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(0deg, rgba(46, 75, 120, 0.15) 0%, rgba(46, 75, 120, 0.15) 100%),
        radial-gradient(50% 36.98% at 50% 100%, rgba(69, 83, 106, 0.5) 0%, rgba(56, 83, 128, 0) 100%), #161c2e;

      .record-title {
        height: 46px;
        padding: 0 24px;
        padding-top: 16px;
        color: @text3;
        font-weight: 700;
      }
      .record-list {
        // max-height: 774px;
        height: calc(100vh - 101px);
        max-height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        overflow: auto;
        gap: 8px 0;
        padding: 12px 24px;
        .record-item {
          padding: 12px 8px;
          display: flex;
          border-radius: 8px;
          border: 1px solid @border2;
          background: @mask5;
          img {
            width: 65px;
            margin-right: 3px;
            border-radius: 4px;
            border: 1px solid #313e5e;
            height: 65px;
            object-fit: cover;
          }

          .info-box {
            margin-left: 7px;
            max-width: 76px;
            .name {
              color: @text2;
              max-width: 76px;
              font-weight: 700;
              line-height: 22px;
              font-size: 14px;
              cursor: default;
              .ellipsis();
            }
            .id {
              color: @text3;
              max-width: 76px;
              font-size: 12px;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 20px;
              margin-bottom: 4px;
              cursor: default;
              .ellipsis();
            }
            p {
              .no-data {
                font-size: 12px;
                color: @text3;
                font-weight: 400;
              }
            }
            .alarm-type {
              padding: 0 6px;
              display: inline-flex;
              cursor: default;
              align-items: center;
              height: 18px;
              white-space: nowrap;
              text-align: center;
              line-height: 18px;
              border-radius: 5px;
              border: 1px solid @mask5;
              font-size: 12px;
              font-weight: 400;
              background: @mask4;
              color: @text2;
              &--black {
                background: #ff8e42;
              }
            }
          }
        }
      }
    }
  }
}

.icon-button {
  border-radius: 54px;
  border: 1px solid @border3;
  background: @mask2;
  box-shadow: 0px 1px 2px 0px rgba(2, 36, 59, 0.03);
}

.alone-icon-button {
  border-radius: 37px;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  font-size: 20px;
  color: @text2;
  border-radius: 50%;
  line-height: 32px;
  margin: 0 22px;

  &.hidden {
    visibility: hidden;
  }
}

//所有控件
video::-webkit-media-controls-enclosure {
  width: 100%;
}
</style>
