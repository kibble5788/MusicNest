import axios from "axios"

// 创建一个 axios 实例，可以设置基础 URL 和默认配置
const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// 请求拦截器 - 可以在这里添加认证令牌等
axiosInstance.interceptors.request.use(
  (config) => {
    // 例如，从 localStorage 获取 token 并添加到请求头
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器 - 处理常见错误，如 401 未授权等
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回了错误状态码
      const { status } = error.response

      if (status === 401) {
        // 未授权，可以重定向到登录页或刷新令牌
        console.error("未授权，请重新登录")
        // 可以在这里清除本地存储的令牌
        localStorage.removeItem("auth_token")
      } else if (status === 403) {
        console.error("没有权限访问此资源")
      } else if (status === 404) {
        console.error("请求的资源不存在")
      } else if (status === 500) {
        console.error("服务器错误")
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error("网络错误，无法连接到服务器")
    } else {
      // 设置请求时发生错误
      console.error("请求配置错误:", error.message)
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
