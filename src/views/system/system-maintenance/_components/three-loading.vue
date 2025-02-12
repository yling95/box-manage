<template>
  <div class="three-loading">
    <div class="loading-body__dot" v-for="item in 3" :key="item"></div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  size: {
    type: String,
    default: '35px',
  },
  speed: {
    type: String,
    default: '0.8s',
  },
  color: {
    type: String,
    default: 'rgba(48, 93, 194, 1)',
  },
})
</script>

<style lang="less" scoped>
@uib-size: v-bind(size);
@uib-speed: v-bind(speed);
@uib-color: v-bind(color);
@keyframes spin78236 {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes wobble1 {
  0%,
  100% {
    transform: translateY(0%) scale(1);
    opacity: 1;
  }

  50% {
    transform: translateY(-66%) scale(0.65);
    opacity: 0.8;
  }
}

@keyframes wobble2 {
  0%,
  100% {
    transform: translateY(0%) scale(1);
    opacity: 1;
  }

  50% {
    transform: translateY(66%) scale(0.65);
    opacity: 0.8;
  }
}
.three-loading {
  position: relative;
  display: inline-block;
  height: @uib-size;
  width: @uib-size;
  animation: spin78236 calc(@uib-speed * 2.5) infinite linear;
  .loading-body__dot {
    position: absolute;
    height: 100%;
    width: 30%;
    &::after {
      content: '';
      position: absolute;
      height: 0%;
      width: 100%;
      padding-bottom: 100%;
      background-color: @uib-color;
      border-radius: 50%;
    }
    &:nth-child(1) {
      bottom: 5%;
      left: 0;
      transform: rotate(60deg);
      transform-origin: 50% 85%;
    }
    &:nth-child(1)::after {
      bottom: 0;
      left: 0;
      animation: wobble1 @uib-speed infinite ease-in-out;
      animation-delay: calc(@uib-speed * -0.3);
    }
    &:nth-child(2) {
      bottom: 5%;
      right: 0;
      transform: rotate(-60deg);
      transform-origin: 50% 85%;
    }
    &:nth-child(2)::after {
      bottom: 0;
      left: 0;
      animation: wobble1 @uib-speed infinite calc(@uib-speed * -0.15) ease-in-out;
    }
    &:nth-child(3) {
      bottom: -5%;
      left: 0;
      transform: translateX(116.666%);
    }
    &:nth-child(3)::after {
      top: 0;
      left: 0;
      animation: wobble2 @uib-speed infinite ease-in-out;
    }
  }
}
</style>
