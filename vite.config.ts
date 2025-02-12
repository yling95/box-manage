import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vitePluginImp from 'vite-plugin-imp'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteCompression from 'vite-plugin-compression'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
const postcssPresetEnv = require('postcss-preset-env')
import { visualizer } from 'rollup-plugin-visualizer'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE')
  const target = env.VITE_SERVE
  const outDir = env.VITE_OUT_DIR

  return {
    plugins: [
      vue(),
      vueJsx(),
      svgLoader(),
      visualizer(),
      Components({
        resolvers: [AntDesignVueResolver({ importLess: true, resolveIcons: true })],
        dirs: ['src/components'],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        extensions: ['jsx', 'vue'],
        deep: true,
      }),
      vitePluginImp({
        libList: [
          {
            libName: 'ant-design-vue',
            style(name) {
              return `ant-design-vue/es/${name}/style/index`
            },
          },
        ],
      }),
      // 生成.gz文件
      {
        ...viteCompression(),
        apply: 'build',
      },
    ],
    css: {
      postcss: {
        plugins: [postcssPresetEnv()],
      },
      preprocessorOptions: {
        less: {
          math: 'always',
          javascriptEnabled: true,
          modifyVars: {
            hack: `true; @import (reference) "${path.resolve('src/styles/index.less')}";`,
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 9999,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          ws: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
        // '/api/': {
        //   target: 'http://192.168.7.226',
        //   changeOrigin: true,
        //   ws: true,
        //   rewrite: (path: string) => path.replace(/^\/api/, '/edgebox'),
        // },
        // '/v1/edgebox': {
        //   target: ':60666/',
        //   changeOrigin: true,
        //   ws: true,
        //   // rewrite: (path: string) => path.replace(/^\/localhost:60666/, 'edgebox'),
        // },
        '/live': {
          target: 'rtmp://192.168.7.251:1935',
          changeOrigin: true,
          ws: true,
          rewrite: (path: string) => path.replace(/^\/live/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    esbuild: {
      // 删除console，debugger
      drop: command === 'build' ? ['console', 'debugger'] : [],
    },
    build: {
      outDir: outDir,
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          // 分包
          manualChunks: {
            vue: ['vue', 'pinia', 'vue-router'],
          },
        },
      },
    },
  }
})
