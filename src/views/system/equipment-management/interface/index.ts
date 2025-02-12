interface deviceAreaListType {
  deviceAreaId: number
  deviceAreaSelectConcatAISrv: string | null
}

export interface cameraDeviceListType {
  aiSrvConcatName: string
  createTime: string
  deviceActiveSrvCount: number
  deviceAreaList: deviceAreaListType[]
  deviceLocationId: number
  deviceLocationName: string
  deviceName: string
  deviceProvider: string
  deviceRemark: string | null
  deviceStatus: number
  deviceStreamingProtocol: number
  deviceStreamingUrl?: string
  deviceSipId?: number
  deviceVideoChannelId?: number
  id: number
  sort: number
}

export interface deviceManagementListType {
  cameraDeviceList: cameraDeviceListType[]
  createTime: string
  locationId: number
  locationName: string
}

export interface equipmentType {
  id?: number
  deviceName?: string
  deviceLocationId?: number | undefined
  deviceNetIpAddress?: string
  deviceNetPort?: number
  deviceStreamingProtocol?: number
  deviceStreamingUrl?: string
  deviceStreamingSecret?: string
  deviceProvider?: string
  deviceRemark?: string
  deviceSipId?: string
  deviceUsername?: string
  devicePassword?: string
}

export interface LocationType {
  locationId?: number
  locationName?: string
}
