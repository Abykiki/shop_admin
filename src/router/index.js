import Vue from 'vue'
import Router from 'vue-router'
import Login from 'components/Login'
// 导入home组件
import Home from 'components/Home'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home
    }
  ]
})
router.beforeEach((to, from, next) => {
  // console.log('hahahahah')
  // next()
  // 如果要去登录页.直接放行
  if (to.path === '/login') {
    next()
    return
  }
  // 如果不是登录页,判断是否有token,如果有,放行;如果没有,去登录
  let token = localStorage.getItem('token')
  if (token) {
    next()
  } else {
    next('/login')
  }
})

export default router
