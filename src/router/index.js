import Vue from 'vue'
import Router from 'vue-router'
import Login from 'components/Login'
// 导入home组件
import Home from 'components/Home'
// 导入users组件
import Users from 'components/users/Users'
// 导入Rights组件
import Rights from 'components/rights/Rights'
// 导入Roles组件
import Roles from 'components/rights/Roles'
// 导入categories组件
import Category from 'components/product/Category'
// 导入Goods组件
import Goods from 'components/product/Goods'

Vue.use(Router)
/*
1.配置子路由:
1.给某个路由配置childern选项
2.要在当前路由对应的组件中配置一个<router-view/>出口
*/

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
      component: Home,
      // 用于配置home的子路由
      children: [
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/categories',
          component: Category
        },
        {
          path: '/goods',
          component: Goods
        }
      ]
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
