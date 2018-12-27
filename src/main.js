import Vue from 'vue'
import App from './App'
import router from './router'

// 导入elememtui
import ElementUI from 'element-ui'
// 导入elementui的样式
import 'element-ui/lib/theme-chalk/index.css'

// 导入通用样式
import '@/assets/base.less'

// 优化(给users.vue里的script中的代码进行优化)
// 1.导入axios
import axios from 'axios'

// 使用element-tree-grid
import ElTreeGrid from 'element-tree-grid'
// 2. 注册为全局的组件 el-table-tree-column支持el-table-column所有属性
Vue.component('el-table-tree-column', ElTreeGrid)

//  1.1 把axios绑定给vue的原型
Vue.prototype.axios = axios
// 2.给axios对象设置一个全局的默认baseURL,后续接口可以不用写baseURL了
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
// 3.给axios设置请求拦截器
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
//  不可以直接设置全局默认的请求头,因为token值是会变化的,如果不变化可以直接像上面那样设置
// 因为再次登录token值会发生变化,而像那样设置,token值还是之前的默认值,不会变化上面

// 拦截器:每次axios请求或响应的时候都会拦截他们
// token是每次都要加的
axios.interceptors.request.use(
  function(config) {
    // 在发送请求之前做些什么?
    // config.headers.Authorization = localStorage.getItem('token')
    // console.log('我拦截了吗?')
    // console.log(config)
    // config能拿到我们所有的配置
    // config.baseURL = 'http://localhost:8888/api/private/v1/'
    // 每次请求的时候,都会自动给config.headers增加一个Authorization
    config.headers.Authorization = localStorage.getItem('token')
    return config
  },
  function(error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)
// 给axios配置响应拦截器
axios.interceptors.response.use(
  function(response) {
    return response.data
  },
  function(error) {
    return Promise.reject(error)
  }
)
// 使用elementui
Vue.use(ElementUI)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
