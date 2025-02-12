import { isAuth } from '@/config'
import { RouteRecordRaw, RouterView } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'layouts',
    component: () => import('@/layouts/index.vue'),
    redirect: '/alarm-center',
    children: [
      {
        path: '/alarm-center',
        meta: {
          title: '报警中心',
          auth: true,
        },
        component: () => import('@/views/alarm-center/index.vue'),
      },
      {
        path: '/record',
        name: 'record',
        meta: {
          title: '记录查询',
          auth: isAuth,
        },
        component: () => import('@/views/record/record.vue'),
      },
      {
        path: '/system-layout/local-conversion',
        meta: {
          title: '本地数据转换',
          auth: isAuth,
        },
        component: () => import('@/static-page/keep-alive.vue'),
        redirect: '/system-layout/internal-staff/Local-conversion/list',
        children: [
          {
            path: '/system-layout/internal-staff/Local-conversion/list',
            meta: {
              title: '本地数据转换列表',
              auth: isAuth,
              keepAlive: true,
            },
            component: () => import('@/views/system/local-conversion/list.vue'),
          },
          {
            path: '/system-layout/local-conversion/form',
            meta: {
              title: '本地数据转换表单',
              auth: isAuth,
            },
            component: () => import('@/views/system/local-conversion/form.vue'),
          },
          {
            path: '/system-layout/local-conversion/detail/:id',
            meta: {
              title: '本地数据转换详情',
              auth: isAuth,
            },
            component: () => import('@/views/system/local-conversion/detail.vue'),
          },
        ],
      },
      {
        path: '/system-layout',
        meta: {
          title: '配置管理',
          auth: isAuth,
        },
        component: () => import('@/views/system/index.vue'),
        children: [
          {
            path: '/system-layout/equipment-management',
            meta: {
              title: '摄像头管理',
              auth: isAuth,
            },
            component: RouterView,
            redirect: '/system-layout/equipment-management/equipment-list',
            children: [
              {
                path: '/system-layout/equipment-management/equipment-list',
                meta: {
                  title: '设备列表',
                  auth: isAuth,
                  secondPage: false,
                },
                component: () => import('@/views/system/equipment-management/equipment-management.vue'),
              },
              {
                path: '/system-layout/equipment-management/configuration',
                meta: {
                  title: '设备配置',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () => import('@/views/system/equipment-management/configuration/index.vue'),
              },
              {
                path: '/system-layout/equipment-management/equipment-add-edit',
                meta: {
                  title: '新增编辑设备',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () => import('@/views/system/equipment-management/equipment-add-edit.vue'),
              },
            ],
          },
          {
            path: '/system-layout/ai-service',
            meta: {
              title: 'AI服务',
              auth: isAuth,
            },
            component: RouterView,
            redirect: '/system-layout/ai-service/list',
            children: [
              {
                path: '/system-layout/ai-service/list',
                meta: {
                  title: 'AI服务',
                  auth: isAuth,
                  secondPage: false,
                },
                component: () => import('@/views/system/ai-service/ai-service.vue'),
              },
              {
                path: '/system-layout/ai-service/face-database',
                meta: {
                  title: '人脸库',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () => import('@/views/system/ai-service/face-database.vue'),
              },
            ],
          },
          {
            path: '/system-layout/system-maintenance',
            meta: {
              title: '系统维护',
              auth: isAuth,
            },
            component: () => import('@/views/system/system-maintenance/index.vue'),
            children: [
              // --------- 通用配置页面 ---------
              {
                path: '/system-layout/system-maintenance/system-maintenance',
                meta: {
                  title: '通用配置',
                  auth: isAuth,
                },
                component: () => import('@/views/system/system-maintenance/general-configuration/index.vue'),
              },
              {
                path: '/system-layout/system-maintenance/algo-auth',
                meta: {
                  title: '算法授权',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () =>
                  import('@/views/system/system-maintenance/general-configuration/algo-authorization.vue'),
              },
              {
                path: '/system-layout/system-maintenance/push-configuration',
                meta: {
                  title: '推送配置',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () =>
                  import('@/views/system/system-maintenance/general-configuration/push-configuration.vue'),
              },
              {
                path: '/system-layout/system-maintenance/platform-access',
                meta: {
                  title: '平台接入',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () => import('@/views/system/system-maintenance/general-configuration/platform-access.vue'),
              },
              {
                path: '/system-layout/system-maintenance/network-configuration',
                meta: {
                  title: '网络配置',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () =>
                  import('@/views/system/system-maintenance/general-configuration/network-configuration.vue'),
              },
              // ------------------
              {
                path: '/system-layout/system-maintenance/account-management',
                meta: {
                  title: '账号管理',
                  auth: isAuth,
                },
                component: () => import('@/views/system/system-maintenance/account-management.vue'),
              },
              {
                path: '/system-layout/system-maintenance/system-journal',
                meta: {
                  title: '系统日志',
                  auth: isAuth,
                },
                component: () => import('@/views/system/system-maintenance/system-journal.vue'),
              },
              {
                path: '/system-layout/system-maintenance/performance-monitor',
                meta: {
                  title: '性能监控',
                  auth: isAuth,
                },
                component: () => import('@/views/system/system-maintenance/performance-monitor.vue'),
              },
              // --------- 回流配置页面 ---------
              {
                path: '/system-layout/system-maintenance/reflux-config/list',
                meta: {
                  title: '回流配置',
                  auth: isAuth,
                },
                component: () => import('@/views/system/system-maintenance/reflux-config/list.vue'),
              },
              {
                path: '/system-layout/system-maintenance/reflux-config/form',
                meta: {
                  title: '新增编辑回流配置',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () => import('@/views/system/system-maintenance/reflux-config/form.vue'),
              },
              // ------------------
              {
                path: '/system-layout/system-maintenance/data-reflux',
                meta: {
                  title: '数据回流',
                  auth: isAuth,
                  customContent: true,
                },
                component: () => import('@/views/system/system-maintenance/data-reflux.vue'),
              },

              // ------- 数据回流版本去掉 NVR配置
              // {
              //   path: '/system-layout/system-maintenance/nvr-configuration',
              //   meta: {
              //     title: 'NVR配置',
              //     auth: isAuth,
              //   },
              //   component: () => import('@/views/system/system-maintenance/nvr-configuration.vue'),
              // },
            ],
          },
          {
            path: '/system-layout/local-detection',
            meta: {
              title: '本地检测',
              auth: isAuth,
            },
            component: () => import('@/static-page/keep-alive.vue'),
            redirect: '/system-layout/local-detection/list',
            children: [
              {
                path: '/system-layout/local-detection/list',
                meta: {
                  title: '本地检测列表',
                  auth: isAuth,
                  keepAlive: true,
                },
                component: () => import('@/views/system/local-detection/list.vue'),
              },
              {
                path: '/system-layout/local-detection/form',
                meta: {
                  title: '本地检测表单',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () => import('@/views/system/local-detection/form.vue'),
              },
              {
                path: '/system-layout/local-detection/detail/:id',
                meta: {
                  title: '本地检测详情',
                  auth: isAuth,
                  secondPage: true,
                },
                component: () => import('@/views/system/local-detection/detail.vue'),
              },
            ],
          },
        ],
      },
      {
        path: '/403',
        component: () => import('@/views/not-auth.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/not-found.vue'),
      },
    ],
  },
  {
    path: '/dash-board',
    component: () => import('@/views/dash-board/index.vue'),
  },
  {
    path: '/fabric',
    component: () => import('@/views/fabric.vue'),
  },
  {
    path: '/standard',
    component: () => import('@/views/standard.vue'),
  },
  {
    path: '/login',
    component: () => import('@/views/login/login.vue'),
    beforeEnter: (_to, _from, next) => {
      const toHref = localStorage.getItem('to-href')
      if (!!toHref) {
        localStorage.removeItem('to-href')
        next(toHref)
      } else {
        next()
      }
    },
  },
]
