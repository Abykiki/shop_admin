<template>
  <el-container class="home">
    <el-header>
      <div class="logo"></div>
      <div class="title">
        <h1>电商管理系统</h1>
      </div>
      <div class="logout">
        <span>欢迎光临</span>
        <a href="javascript:;" @click="logout">退出</a>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <!--
          el-menu: 整个导航菜单组件
          default-active: 默认激活的菜单\
          background-color: 导航菜单背景色
          active-text-color： 激活的文字的颜色

          el-submenu: 子菜单
          template: 制订了子菜单的文本和图标
          el-menu-item-group: 菜单项的分组
          el-menu-item: 菜单项
          router: 布尔类型直接加router,是否开启导航模式,如果开启,比如
                  我们点击"用户列表"的时候,会跳转到该页面
        -->
        <el-menu
          :default-active="$route.path.slice(1)"
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
          router
        >
          <el-submenu v-for="menu in menuList" :key="menu.id" :index="menu.path">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{ menu.authName}}</span>
            </template>
            <!-- 菜单项 -->
            <el-menu-item :index="item.path" v-for="item in menu.children" :key="item.id">
              <i class="el-icon-menu"></i>
              <span slot="title">{{ item.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 显示home组件的子路由出口 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// 退出功能
// 1.点击退出按钮
// 2.弹出一个确认框
// 3.点击确定,删除token,跳转到登录组件
export default {
  data() {
    return {
      menuList: []
    }
  },
  methods: {
    async logout() {
      try {
        await this.$confirm('你确定要退出系统吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.$message({
          type: 'success',
          message: '退出成功!'
        })
        // 删除token
        localStorage.removeItem('token')
        this.$router.push('/login')
      } catch (e) {
        this.$message.info('取消退出')
      }
    },
    // 获取所有菜单数据
    async getMenuList() {
      let res = await this.axios.get('menus')
      if (res.meta.status === 200) {
        this.menuList = res.data
        // console.log(this.menuList)
      }
    }
  },
  // 进入页面,获取菜单数据
  created() {
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
// lang设置语言 less sass stylus
// scoped: 如果设置了,表示样式只会在当前组件生效
.home {
  height: 100%;
  .el-header {
    display: flex;
    background-color: #b3c1cd;
    .logo {
      width: 180px;
      background-image: url('~@/assets/logo.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center center;
    }
    .logout {
      width: 180px;
      text-align: right;
      line-height: 60px;
      font-weight: 700;
      a {
        color: orange;
      }
    }
    .title {
      flex: 1;
      h1 {
        text-align: center;
        line-height: 60px;
        color: #fff;
        font-size: 30px;
      }
    }
  }
  .el-aside {
    background-color: #545c64;
  }
  .el-main {
    background-color: #eaeef1;
  }
}
</style>
