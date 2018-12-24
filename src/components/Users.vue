<template>
  <div class="users">
    <!-- 面包屑导航: 显示当前页面的路径,快速返回之前的任意页面 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索栏 -->
    <el-input placeholder="请输入内容" v-model="query" class="input-with-select">
      <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
    </el-input>
    <el-button type="success" plain>添加用户</el-button>
    <!-- 表格组件 -->
    <!--
        el-table: 表格组件
        data: 指定必须要渲染的数据(数组)
        style: 让表格宽度100%
        el-table-column: 定义表格的每一列
        label="日期": 列的标题
        prop: 对应显示的数据的属性名
        width: 列的宽度 不支持百分比
        在el-table中,如果想要自定义列模板,在el-table-column中使用template
        <template slot-scope="scope">自定义的内容</template>
    -->
    <el-table :data="userList" style="width: 100%">
      <el-table-column prop="username" label="姓名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="mg_state" label="用户状态">
        <!-- 在自定义列模板中,如何访问到当前列的数据 -->
        <template slot-scope="scope">
          <!-- scope.row.mg_state: 拿到用户状态是false/true -->
          <el-switch
            @change="changeState(scope.row)"
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" plain></el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            plain
            @click="delUser(scope.row.id)"
          ></el-button>
          <el-button size="mini" type="success" icon="el-icon-check" plain>分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!--
        分页
      @size-change: 表示每页的条数发生了改变，会触发handleSizeChange
      @current-change: 当前页发生改变
      current-page: 指定当前页面
      page-sizes: 指定选择每页条数的数组
      page-size: 每页的条数
      total:指定总条数
      layout: 指定分页的空间
    -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      background
    ></el-pagination>
  </div>
</template>

<script>
// import axios from 'axios'
export default {
  data() {
    return {
      // 用户列表
      userList: [],
      // 查询参数
      query: '',
      currentPage: 1,
      pageSize: 2,
      total: 0
    }
  },
  methods: {
    async getUserList() {
      // axios如果是get/delete请求,参数要么是直接拼在地址栏,要么放到params中
      // 如果是post/patch请求,参数放到data中
      // 除了login请求,其他所有的接口都必须携带token,要求设置给请求头:Authorization
      let res = await this.axios({
        method: 'get',
        url: 'users',
        //   请求参数
        params: {
          query: this.query,
          pagenum: this.currentPage,
          pagesize: this.pageSize
        }
        // headers: {
        //   Authorization: localStorage.getItem('token')
        // }
      })
      //   console.log(res.data)
      // 打印到"无效token",是因为整个API认证统一使用token认证,
      // 需要授权的API,必须在请求头中使用Authorization字段提供token令牌
      let {
        meta: { status },
        data: { users, total }
      } = res
      if (status === 200) {
        this.userList = users
        this.total = total
        console.log(this.userList)
      }
    },
    handleSizeChange(val) {
      //   console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.getUserList()
    },
    handleCurrentChange(val) {
      //   console.log(`当前页: ${val}`)
      this.currentPage = val
      this.getUserList()
    },
    search() {
      // 搜索的时候,把当前页改成第一页
      this.currentPage = 1
      this.getUserList()
    },
    async delUser(id) {
      try {
        // console.log(id)
        await this.$confirm('确定要删除嘛?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        //   发送ajax请求,删除数据
        let res = await this.axios({
          method: 'delete',
          url: `users/${id}`
          // headers: {
          //   Authorization: localStorage.getItem('token')
          // }
        })
        if (res.meta.status === 200) {
          // 如果删除成功,我们会发现当前的数据<=1,应该current-1,再渲染上一页
          if (this.userList.length <= 1 && this.currentPage > 1) {
            this.currentPage--
          }
          this.getUserList()
          this.$message.success('删除成功')
        }
      } catch (e) {
        this.$message.info('取消删除')
      }
    },
    // 修改用户状态
    async changeState({ id, mg_state: mgState }) {
      // console.log(user)
      // this指的是当前实例,在main.js中已经创建了当前实例
      // 这样不用在上面导入 import axios from axios
      let res = await this.axios({
        method: 'put',
        url: `users/${id}/state/${mgState}`
        // headers: {
        //   Authorization: localStorage.getItem('token')
        // }
      })
      // console.log(res.data)
      if (res.meta.status === 200) {
        this.$message.success('修改状态成功')
      } else {
        this.$message.error('修改状态失败')
      }
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
.el-input {
  width: 300px;
  margin-bottom: 5px;
}
</style>
