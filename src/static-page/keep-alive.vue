<template>
  <!-- -alive判断的路由页面 -->
  <router-view v-slot="{ Component, route }">
    <keep-alive :max="2">
      <component :key="route.path" :is="Component" v-if="route.meta.keepAlive" />
    </keep-alive>
    <component :key="route.path" :is="Component" v-if="!route.meta.keepAlive" />
  </router-view>
</template>
