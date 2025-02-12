// 均匀模式色值
export const evenColorList = [
  {
    value: 0,
    label: '黑',
    color: '#000000',
  },
  {
    value: 1,
    label: '灰',
    color: '#93a2a9',
  },
  {
    value: 2,
    label: '白',
    color: '#FFFFFF',
  },
  {
    value: 3,
    label: '红',
    color: '#ff2121',
  },
  {
    value: 4,
    label: '橙',
    color: '#fa8c35',
  },
  {
    value: 5,
    label: '黄',
    color: '#fadb14',
  },
  {
    value: 6,
    label: '绿',
    color: '#21ba45',
  },
  {
    value: 7,
    label: '青',
    color: '#39b54a',
  },
  {
    value: 8,
    label: '蓝',
    color: '#5bb9bd',
  },
  {
    value: 9,
    label: '紫',
    color: '#79569c',
  },
]

// 复杂模式色值
export const complexColorList = [
  {
    value: 2,
    label: '白',
    color: '#FFFFFF',
  },
  {
    value: 3,
    label: '红',
    color: '#ff2121',
  },
  {
    value: 4,
    label: '橙',
    color: '#fa8c35',
  },
  {
    value: 5,
    label: '黄',
    color: '#fadb14',
  },
  {
    value: 6,
    label: '绿',
    color: '#21ba45',
  },
  {
    value: 7,
    label: '青',
    color: '#39b54a',
  },
  {
    value: 8,
    label: '蓝',
    color: '#5bb9bd',
  },
  {
    value: 9,
    label: '紫',
    color: '#79569c',
  },
]

// 大房间id
export const LargeRoomId = [
  {
    value: 10,
    label: 10,
  },
  {
    value: 11,
    label: 11,
  },
  {
    value: 12,
    label: 12,
  },
  {
    value: 13,
    label: 13,
  },
]

// 小房间id
export const SmallRoomId = [
  {
    value: 15,
    label: 15,
  },
  {
    value: 16,
    label: 16,
  },
  {
    value: 17,
    label: 17,
  },
]

// 服务枚举
export enum ServiceEnum {
  SLEEP_DURING_DUTY = 0, //睡岗检测
  LEAVING_POST = 1,
  HELMET = 2, //	安全帽检测
  SMOKING = 3, //	抽烟检测
  UNIFORM = 4, //	工服检测
  SMOKING_FIRE = 5,
  CALL = 6, //	打电话检测
  CLIMBING = 7, //	攀爬检测
  REFLECTIVE_CLOTHING = 8, //	反光衣检测
  LABOR_PROTECTION_MASK = 9, //	劳保口罩检测
  LABOR_PROTECTION_GLOVES = 10, //	劳保手套检测
  GOGGLE = 11, //	护目镜检测
  FACE_RECOGNITION = 12,
  PEDESTRIAN = 13, // 行人检测
  PLAY_PHONE = 14, //	玩手机检测
  TUMBLE = 16, //	跌倒检测
  STEAL_BATTERY = 17, //	偷电瓶
  WANDER = 18, //	徘徊
  CROWD = 19, //	人群聚集检测
  FIGHT = 20, //	打架斗殴检测
  TRESPASS = 22, //	越界检测
  NUMBER_PEOPLE = 23, //	人员超限检测
  LIGHTING = 24,
  MASK = 25, //防护面罩
  GATE_NOTCLOSE = 29, //大门未关闭
  WELDING = 31, // 宝鸡：焊接规范检测
  NOONE_AREA = 34, // 宝鸡：设备联动报警
  REGIONAL_INVASION = 33, //	区域入侵检测
  PERSONNEL_CROSSING = 35, //	人员翻越检测
  FACE_MASK = 36, //	口罩检测
  DUST_MASK = 37, // 防尘面罩检测
  FOREIGN_BODY_DETECTION = 39, // 异物检测
  POLICE_UNIFORM_DETECTION = 42, // 警服检测
}

export const AlgoLinkServiceIds: number[] = [
  ServiceEnum.SLEEP_DURING_DUTY,
  ServiceEnum.HELMET,
  ServiceEnum.SMOKING,
  ServiceEnum.UNIFORM,
  ServiceEnum.CALL,
  ServiceEnum.CLIMBING,
  ServiceEnum.REFLECTIVE_CLOTHING,
  ServiceEnum.LABOR_PROTECTION_MASK,
  ServiceEnum.LABOR_PROTECTION_GLOVES,
  ServiceEnum.GOGGLE,
  ServiceEnum.PEDESTRIAN,
  ServiceEnum.PLAY_PHONE,
  ServiceEnum.TUMBLE,
  ServiceEnum.STEAL_BATTERY,
  ServiceEnum.WANDER,
  ServiceEnum.CROWD,
  ServiceEnum.FIGHT,
  ServiceEnum.TRESPASS,
  ServiceEnum.NUMBER_PEOPLE,
  ServiceEnum.REGIONAL_INVASION,
  ServiceEnum.PERSONNEL_CROSSING,
  ServiceEnum.FACE_MASK,
  ServiceEnum.DUST_MASK,
]

export type AlarmsHintMap = {
  [key in number]: string
}

// 声光报警器提示Map
export const alarmsHintMap: AlarmsHintMap = {
  0: '检测到人员睡岗行为！',
  1: '检测到人员离岗行为！',
  2: '检测到未戴安全帽！',
  3: '检测到抽烟行为！',
  4: '检测到未穿工服！',
  5: '检测到烟火报警！',
  6: '检测到打电话行为！',
  7: '检测到攀爬行为！',
  8: '检测到未穿反光衣！',
  9: '检测到未戴劳保口罩！',
  10: '检测到未戴劳保手套！',
  11: '检测到未戴护目镜！',
  12: '检测到异常人员！',
  13: '检测到违规闯入行为！',
  14: '检测到人员玩手机行为！',
  15: '检测到烟雾报警！',
  16: '检测到人员跌倒！',
  17: '检测到偷电瓶行为！',
  18: '检测到异常人员徘徊行为！',
  19: '检测到异常聚众行为！',
  20: '检测到打架斗殴行为！',
  // 泵业定制算法====开始
  24: '检测到设备状态灯光异常提示！',
  25: '检测到人员未戴防护面罩！',
  26: '检测到人员泵顶作业未系安全带！',
  27: '检测到人员未戴安全帽！',
  28: '检测到人员未戴防护镜违规作业！',
  29: '检测到作业间大门未关闭！',
  30: '检测到狭小空间人员违规站位！',
  31: '检测到人员焊接未使用吸烟机！',
  32: '检测到人员泵顶违规操作！',
  34: '检测到人员泵顶违规操作！',
  // 泵业定制算法====结束
}
