<template>
  <div class="g-layout" :style="{ '--width': width, '--height': height }">
    <aside class="g-layout-aside" v-if="showAside">
      <header v-if="showAsideHeader">
        <slot name="aside-header"></slot>
      </header>
      <main>
        <slot name="aside-main"></slot>
      </main>
    </aside>
    <div class="g-layout-wrap">
      <header v-if="showMainHeader">
        <slot name="main-header"></slot>
      </header>
      <main>
        <slot name="main"></slot>
      </main>
      <footer v-if="showMainFooter">
        <slot name="main-footer"></slot>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '600px',
  },
  showAside: {
    type: Boolean,
    default: true,
  },
  showAsideHeader: {
    type: Boolean,
    default: true,
  },
  showMainHeader: {
    type: Boolean,
    default: true,
  },
  showMainFooter: {
    type: Boolean,
    default: true,
  },
})
</script>

<style lang="less" scoped>
.g-layout {
  display: flex;
  width: var(--width);
  height: var(--height);

  .g-layout-aside {
    width: 200px;
    height: 100%;
    background-color: @background2;
    border-right: 1px solid @border1;
    display: flex;
    flex-direction: column;

    > header {
      height: 50px;
    }

    > main {
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  }
  .g-layout-wrap {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #202c40;
    > header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    > main {
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px 4px 0 0;
      border-bottom: none;
    }
    > footer {
      width: 100%;
    }
  }
}
</style>
