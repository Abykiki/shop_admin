import Vue from 'vue'
import App from './App'
import router from './router'

// 导入elememtui
import ElementUI from 'element-ui'
// 导入elementui的样式
import 'element-ui/lib/theme-chalk/index.css'

// 导入通用样式
import '@/assets/base.less'

// 使用elementui
Vue.use(ElementUI)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
