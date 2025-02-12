export interface ArrayRecords {
  aiId: number
  aiAlarmName: string
  aiName: string
  deviceId: number
  deviceName: string
  eventFile: string
  eventImg: string
  eventTime: string
  eventType: number
  id: number
  senceId: number
  senceName: string
  algorithmLinkageAlarm: null | number
}

export interface currentConfigProps {
  aiTagStatus: boolean
  deviceIds: Array<any>
  id: number
  inspectionStatus: boolean
  screenType: number
  userId: number
  warningStatus: boolean
}

export interface AlarmCenterListProps {
  deviceId: number
  deviceName: string
  deviceStatus: number
  deviceStreamingLocation: string
  deviceActiveSrvCount: number
  deviceConcatName: string
  alarmStatus?: boolean
  warningStatus?: boolean
  deviceAreaMaskingImageLocation?: string
}

export interface deviceListProps {
  deviceLocationName: string
  deviceLocationId: number
  deviceAlarmCenterList: AlarmCenterListProps[]
}

export interface aiMarkDeviceListProps {
  deviceId: number
  aiMarkIndex: number
}
