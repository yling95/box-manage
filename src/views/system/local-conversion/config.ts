/**
 * 任务进度
 */
export const taskProgressOptions = [
  {
    label: '进行中',
    value: 0,
    name: '进行中..',
    icon: 'icon-stop-circle-line',
    tip: '终止',
    progressStatus: 'normal',
  },
  {
    label: '排队中',
    value: 1,
    name: '排队中..',
    icon: 'icon-play-fill',
    tip: '终止',
    progressStatus: 'normal',
  },
  {
    label: '分析失败',
    value: 2,
    name: '分析失败',
    icon: 'icon-memories-line',
    tip: '重新运行',
    progressStatus: 'exception',
  },
  {
    label: '分析终止',
    value: 3,
    name: '终止',
    icon: 'icon-memories-line',
    tip: '重新运行',
    progressStatus: 'exception',
  },
  {
    label: '已完成',
    value: 4,
    name: '完成',
    icon: '',
    tip: '',
    progressStatus: 'success',
  },
]
