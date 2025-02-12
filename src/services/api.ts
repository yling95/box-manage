import axios from '@/request/index'
import { message } from 'ant-design-vue'
import { AxiosRequestConfig } from 'axios'

/**
 * 公共接口
 */
export enum ModuleType {
  SYSTEM = 0, // 系统Logo
  SYSTEM_SOFTWARE_UPGRADE = 1, // 系统软件升级
  SYSTEM_HARDWARE_UPGRADE = 2, // 系统硬件升级
  AI_UNIFORM = 3, // AI工服库接口
  AI_FACE = 4, // AI人脸接口
  AI_SDK = 7, // AI服务接口
  ALGO_AUTH = 13, // 算法授权
}

export interface MaskingAreaSize {
  width: number
  height: number
}

export const commonApi = {
  upload: (type: ModuleType, file: any, config?: AxiosRequestConfig<any> | undefined, url?: string) =>
    axios.post(`${url || '/upload'}?uploadType=${type}`, file, {
      headers: { 'Content-Type': 'multipart/form-data', cancelable: false },
      timeout: 1000 * 60 * 30,
      ...config,
    }),
  heartbeat: () => axios.get('/user/heartbeat', { headers: { 'hide-message': true } }),
}

export const commonTaskApi = {
  // 批量导出-任务栏-列表查询
  getExportList: (params: any) => axios.get('/dataConvertExport/list', { params }),
  //批量删除导出任务
  deleteExport: (params: any) => axios.delete(`/dataConvertExport/deleteBatchByIds`, { params }),
  //下载
  downloadExport: (params: any) => axios.get('/dataConvertExport/download', { params }),
  exportPrepare: (params: any) => axios.post('/dataConvertExport/exportPrepare', params),
}

/**
 * 用户接口
 */
export const userApi = {
  login: (params: any) => axios.post('/login', params),
  getMenuList: () => axios.get('/menus-token'),
  loginResetPassword: (params: any) => axios.put('/login-pwd', params),
  logout: () => axios.post('/logout'),
  resetAdminPassword: (params: any) => axios.post('/reset-secret', params),
  updatePassword: (params: any) => axios.put('/user/update-pwd', params),
}

/**
 * 系统维护接口
 */
export const systemApi = {
  getNetSetting: (params: any) => axios.get('/net-setting', { params }),
  getNetSettingV2: () => axios.get('/net-setting/v2'),
  putNetSetting: (params: any) => axios.put('/net-setting', params),
  putNetSettingV2: (params: any) => axios.put('/net-setting/v2', params),

  systemLog: (params: any) => axios.get('/log', { params }),
  getMonitor: () => axios.get('/monitor'),
  getUserList: (params: any) => axios.get('/user', { params }),
  addUser: (params: any) => axios.post('/user', params),
  resetUser: (params: any) => axios.put('/user/reset-pwd', params),
  updateUser: (params: any) => axios.put('/user', params),
  deleteUser: (id: number) => axios.delete(`/user/${id}`),
  getRoleList: () => axios.get('/user/roles-token'),
  restart: () => axios.post('/reboot'),
  shutdown: () => axios.post('/shut-down'),
  updateTime: (time: any) => axios.post(`/time?timeString=${time}`),
  getSystemInfo: () => axios.get('/system-config'),
  updateLogo: (logo: string) => axios.post(`/system-logo?systemLogo=${logo}`),
  updateName: (name: string) => axios.post(`/system-name?systemName=${name}`),

  getMqttSetting: () => axios.get('/system/config/platform'),
  putMqttSetting: (params: any) => axios.post('/system/config/platform/mqtt', params),
  putMqttStatus: (mqttEnabled: number) => axios.post('/system/config/platform/mqtt/status', { mqttEnabled }),
  getMqttStatus: () => axios.get('/mqtt/status'),
  getSip: () => axios.get('/sip'),
  getBoxInfo: () => axios.get('/info'),
  getAiList: () => axios.get('/device/management/push-ai'),
  getEquipmentList: () => axios.get('/device/management/push-device'),
  addPush: (params: any) => axios.post('/push', params),
  getPushList: () => axios.get('/pushs'),
  deletePush: (id: number) => axios.delete(`/push/${id}`),
  updatePush: (params: any) => axios.put('/push', params),
  updatePushStatus: (id: number, status: boolean) => axios.put('/push-status', { id, status }),
  getSystemExport: (params: any) =>
    downLoadFn('/log/export', params, {
      headers: { 'Export-Key': 'log_export', 'Content-Type': 'multipart/from-data' },
    }),
  firmwareUpgrade: (params: any) => axios.put('/system/upgrade/firmware', null, { params, timeout: 1000 * 60 * 30 }),
  softwareUpgrade: (params: any) => axios.put('/system/upgrade/software', null, { params, timeout: 1000 * 60 * 30 }),
  resetFactory: () => axios.put('/system/restore', null, { timeout: undefined }),
  updateNvr: (params: any) => axios.post('/system/config/platform/nvr', params),
  checkNvr: () => axios.get('/nvr/check'),
  openVideo: (params: any) => axios.get('/nvr/video', { params, timeout: 1000 * 60 * 30 }),
  closeVideo: (params: any) =>
    axios.delete('/nvr/video', {
      params,
      headers: {
        'hide-message': 'true',
      },
    }),
  getAlgoAuth: () => axios.get('/algo'),
  updateAlgoAuthUrl: (params: any) => axios.post('/algo', params),
  algoAuthOffline: (params: any) => axios.post('/algo/auth/offline', params),
  algoAuthOnline: () => axios.get('/algo/auth/online', { headers: { 'hide-message': true } }),

  refluxConfigDetail: (id: string) => axios.get(`/base/video/reflow/get/config/${id}`),
}

/**
 * AI服务接口
 */
export const aiApi = {
  getLocalDetectAiList: () => axios.get('/ai?isLocalDetect=true'),
  getAiList: (params: any) => axios.get('/ai', { params }),
  getByIdService: (id: string) => axios.get(`/ai/${id}`),
  getUniformCategoryList: () => axios.get('/ai/uniform/category'),
  addUniformCategory: (name: string) => axios.post(`/ai/uniform/category?uniformCategoryName=${name}`),
  updateUniformCategory: (params: any) => axios.put('/ai/uniform/category', params),
  deleteUniformCategory: (id: number) => axios.delete(`/ai/uniform/category/${id}`),
  addUniform: (params: any) => axios.post('/ai/uniform', params),
  getUniform: (categoryId: string) => axios.get('/ai/uniform', { params: { categoryId } }),
  deleteUniformIds: (uniformIds: string) => axios.delete('/ai/uniform', { params: { uniformIds } }),
  getFaceList: (params: any) => axios.get('/ai/face/recognition', { params }),
  addFace: (params: any) => axios.post('/ai/face/recognition', params),
  updateFace: (params: any) => axios.put('/ai/face/recognition', params),
  deleteFace: (faceIds: any) => axios.delete('/ai/face/recognition', { params: { faceIds } }),
  updateAIRule: (params: any) => axios.put('/ai', params),
  resetAIRule: (id: string) => axios.get(`/ai/restore/${id}`),
  updateAIStatus: (id: string, aiServiceStatus: number) => axios.put('/ai/status', { id, aiServiceStatus }),
  addAISdk: (params: any) => axios.post('/ai/sdk', null, { params, timeout: 1000 * 60 * 30 }),
  getDevicesAlgorithms: (params?: any) => axios.get('/device/management/algorithm-linkage-alarm', { params }),
}

/**
 * 摄像头管理接口
 */
export const equipmentApi = {
  getManagement: (params?: any) => axios.get('/device/management', { params }),
  putLocationName: (params: any) => axios.put('device/location', params),
  deleteLocationName: (params: any) => axios.delete(`device/location/${params}`),
  postLocationName: (params: any) => axios.post(`device/location?deviceLocationName=${params}`),
  postCamera: (params: any) => axios.post(`device/camera`, params),
  deleteCamera: (params: any) => axios.delete(`device/camera/${params}`),
  putCamera: (params: any) => axios.put(`device/camera`, params),
  putOrder: (params: any) => axios.put(`device/camera/order`, params),
  getCamera: (id: number) => axios.get(`/device/camera/${id}`),
  getByDeviceIdAreaList: (deviceId: number) => axios.get(`/device/recognition/area/deviceId/${deviceId}`),
  getByDeviceIdAiList: (deviceAreaId: number) => axios.get('/device/recognition/area/ai', { params: { deviceAreaId } }),
  addDeviceArea: (deviceId: number) => axios.post(`/device/recognition/area/deviceId/${deviceId}`),
  deleteDeviceArea: (id: number, maskingAreaSize: MaskingAreaSize) =>
    axios.delete(`/device/recognition/area/${id}`, { data: { maskingAreaSize } }),
  // 根据区域id获取区域详细信息
  getByAreaInfo: (areaId: number) => axios.get(`/device/recognition/area/${areaId}`),
  // 保存配置
  saveAreaInfo: (params: any) => axios.put('/device/recognition/area', params),
  getManagementAiList: () => axios.get('/device/management/ai'),
  // 复制配置
  copyAreaInfo: (params: any) => axios.put('/device/management/copy', params),
  // 获取设备区域AI服务配置
  getAiConfig: (id: number) => axios.get(`/device/recognition/area/ai/${id}`),
  resetDefaultAiConfig: (id: number) => axios.put(`/device/recognition/area/ai/restore/${id}`),
  postCameraConnection: (params: any) => axios.post(`device/camera/connection`, params),
  postCloseCameraConnection: (params: any) => axios.post(`device/camera/connection/close`, params),
  getNvrChannel: (params: any) => axios.get(`/nvr/channel`, { params }),
}

/**
 * 报警接口
 */
export const warningApi = {
  postChangeDevice: (params: any) => axios.post('/warning-center/change-device', params),
  postChangeScreen: (params: any) => axios.post('/warning-center/change-screen', params),
  putChangeInspection: (params: any) => axios.put('/warning-center/change-inspection', params),
  putChangeAiTag: (params: any) => axios.put('/warning-center/change-aiTag', params),
  putChangeWarning: (params: any) => axios.put('/warning-center/change-warning', params),
  putChangeFullScreen: (params: any) => axios.put('/warning-center/change-fullScreen', params),
  getWarningToken: () => axios.get('/warning-center/token'),
  getWarningCenter: (params: any) => axios.get('/warning-events/center', { params }),
  getWarningManagement: () => axios.get('/device/management/alarm-center'),
  getDisconnectWarning: () => axios.get('/sse/disconnect-warning'),
  getRefreshWarning: () => axios.get('/warning-center/refresh'),
  getStatistics: () => axios.get('/statistics/monitor'),
  updateMasking: (videoMaskingEnabled: number) => axios.post('/system/config/video-masking', { videoMaskingEnabled }),
}

/**
 * 记录查询接口
 */
export const recordApi = {
  getRecordList: (params: any) => axios.get('/warning-event', { params }),
  getRecordCenter: () => axios.get('/device/management/record-center'),
  recordExport: (params: any) =>
    downLoadFn(
      '/warning-event/export',
      params,
      {
        headers: { 'Export-Key': 'warning_export', 'Content-Type': 'multipart/from-data' },
      },
      `AI报警记录-${Date.now()}.zip`,
    ),
  recordExportOriginal: (params: any) =>
    downLoadFn(
      '/warning-event/export/original',
      params,
      {
        headers: { 'Export-Key': 'warning_export', 'Content-Type': 'multipart/from-data' },
      },
      `AI报警记录-${Date.now()}-A.zip`,
    ),
  recordDetail: (id: string) => axios.get(`/warning-details/${id}`),
}

/**
 * 本地检测接口
 */
export const localDetectionApi = {
  getList: (params: any) => axios.get('/ai/local-detect/jobs', { params }),
  startTask: (id: number) => axios.put('/ai/local-detect/job/start', null, { params: { jobId: id } }),
  stopTask: (id: number) => axios.put('/ai/local-detect/job/stop', null, { params: { jobId: id } }),
  getInternalSeats: () => axios.get('/ai/local-detect/job/internal/seats'),
  createTask: (params: any) => axios.post('/ai/local-detect/job', params),
  updateTask: (params: any) => axios.put('/ai/local-detect/job', params),
  deleteTask: (id: number) => axios.delete(`/ai/local-detect/job`, { params: { jobId: id } }),
  getDetail: (params: any) => axios.get(`/ai/local-detect/job/results`, { params }),
  getFileList: (id: number) => axios.get('/ai/local-detect/job/src', { params: { jobId: id } }),
  deleteFile: (id: string, fileName?: string) =>
    axios.delete(`/ai/local-detect/job/src`, { params: { dataSrcId: id, srcFileName: fileName } }),
  uploadFile: (dataSrcId: string, file: FormData, config?: AxiosRequestConfig<any> | undefined) =>
    axios.post('/ai/local-detect/upload', file, {
      params: { dataSrcId },
      timeout: 1000 * 60 * 30,
      headers: { 'Content-Type': 'multipart/form-data', cancelable: false },
      ...config,
    }),
  recordExport: (params: any) => axios.post('/ai/local-detect/export', params, { timeout: 1000 * 60 * 30 }),
}

/**
 * 本地数据转换接口
 */
export const localConversionApi = {
  getList: (params: any) => axios.get('/ai/local-data-convert/jobs', { params }), //分页查询
  startTask: (id: number) => axios.get('/ai/local-data-convert/job/start', { params: { jobId: id } }), //根据任务id开始任务
  stopTask: (id: number) => axios.put('/ai/local-data-convert/job/stop', null, { params: { jobId: id } }), //终止任务
  createTask: (params: any) => axios.post('/ai/local-data-convert/job', params), //创建任务
  deleteTask: (id: number) => axios.delete(`/ai/local-data-convert/job`, { params: { jobId: id } }), //根据任务id删除任务
  getDetail: (params: any) => axios.get(`/ai/local-data-convert/job/results`, { params }), //查询任务本地数据转换详情

  deleteFile: (id: string, fileName?: string) =>
    axios.delete(`/ai/local-data-convert/job/src`, { params: { dataSrcId: id, srcFileName: fileName } }),
  uploadFile: (dataSrcId: string, file: FormData, config?: AxiosRequestConfig<any> | undefined) =>
    axios.post('/ai/local-data-convert/upload', file, {
      params: { dataSrcId },
      timeout: 1000 * 60 * 30,
      headers: { 'Content-Type': 'multipart/form-data', cancelable: false },
      ...config,
    }),

  // 导出准备
  exportPrepare: (params: any) => axios.post('/dataConvertExport/exportPrepare', params),
  // 列表查询
  getExportList: (params: any) => axios.get('/dataConvertExport/list', { params }),
  //批量删除导出任务
  deleteExport: (params: any) => axios.delete(`/dataConvertExport/deleteBatchByIds`, { params }),
  //下载
  downloadExport: (params: any) => axios.get('/dataConvertExport/download', { params }),
}

/**
 * 数据回流
 */
export const reflowApi = {
  getList: (params: any) => axios.get('/reflow/page', { params }), //分页查询
  savReflow: (params: any) => axios.post('/reflow', params),
  getReflowDetail: (id: string) => axios.get(`/reflow/detail/${id}`),
  updateReflow: (params: any) => axios.post('/reflow/update', params),
  deleteReflow: (id: string) => axios.delete(`/reflow/${id}`),
  getDeviceOptions: () => axios.get('/device/management/record-center/dropDown'),
  getReflowRecordList: (params: any) => axios.get('/reflowRecord/page', { params }), // 数据回流记录分页查询
  updateStates: (params: any) => axios.get('/reflow/update/states', { params }),
  exportReflowRecord: (params: any) => axios.post('/reflowRecord/exportPrepare', params),
}

/***
 * 下载方法
 */
const downLoadFn = (
  url: string,
  params?: object,
  config?: AxiosRequestConfig<any>,
  fileName?: string,
): Promise<any> => {
  return axios({
    url: url, // 接口地址
    method: 'get',
    responseType: 'blob', // 需要加上
    params: params,
    timeout: 1000 * 60 * 30,
    ...config,
  }).then((res: any) => {
    const blob = new Blob([res]) //excel,pdf等
    if (blob.type === 'application/json' || blob.size < 100) {
      const reader = new FileReader()
      reader.readAsText(blob, 'utf-8')
      reader.onload = function () {
        const data = JSON.parse(reader.result as string)
        message.error(data.message)
      }
      return Promise.reject(new Error('下载失败'))
    }
    const href = URL.createObjectURL(blob) //创建新的URL表示指定的blob对象
    const a = document.createElement('a') //创建a标签
    a.style.display = 'none'
    a.href = href // 指定下载链接
    a.download = fileName || '下载文件.xlsx'
    a.click() //触发下载
    URL.revokeObjectURL(a.href) //释放URL对象
    return Promise.resolve('下载成功')
  })
}

/**
 * 根据链接下载文件
 */
export const downloadFile = (url: string, fileName?: string) => {
  const a = document.createElement('a') //创建a标签
  a.style.display = 'none'
  a.href = url // 指定下载链接
  a.download = fileName || '下载文件.xlsx'
  a.click() //触发下载
  URL.revokeObjectURL(a.href) //释放URL对象
}
