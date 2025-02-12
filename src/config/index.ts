// 是否开启权限（开发环境权限放开，生产环境开启）
export const isAuth = process.env.NODE_ENV === 'development' ? true : true

// 密钥
export const secretKey = '157772cfb4d74316d8f6d2c7416fbd10'

// beforeRouteLeaveWhiteList
export const beforeRouteLeaveWhiteList = ['/login']
