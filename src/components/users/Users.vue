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
    <el-button type="success" plain @click="showAddDialog">添加用户</el-button>
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
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row)"
            plain
          ></el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            plain
            @click="delUser(scope.row.id)"
          ></el-button>
          <el-button
            @click="showAssignDialog(scope.row)"
            size="mini"
            type="success"
            icon="el-icon-check"
            plain
          >分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!--
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
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="40%">
      <!-- 添加表单 -->
      <el-form ref="addForm" :model="addForm" label-width="80px" :rules="rules" status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="请输入用户邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" placeholder="请输入用户手机"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="40%">
      <!-- 修改表单 -->
      <el-form ref="editForm" :model="editForm" label-width="80px" :rules="rules" status-icon>
        <el-form-item label="用户名">
          <el-tag type="info">{{editForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入用户邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" placeholder="请输入用户手机"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="assignDialogVisible" width="40%">
      <el-form ref="assignForm" :model="assignForm" label-width="80px" :rules="rules" status-icon>
        <el-form-item label="用户名">
          <el-tag type="info">{{assignForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="角色列表">
          <el-select v-model="assignForm.rid" placeholder="请选择">
            <!--
              options(roleList): 遍历的是所有角色,角色列表
            -->
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRole">确 定</el-button>
      </span>
    </el-dialog>
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
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      rules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 3, max: 9, message: '用户名长度在3-9位', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 12, message: '密码长度在6-12位', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入一个合法的邮箱', trigger: 'blur' }
        ],
        mobile: [
          {
            pattern: /^1\d{10}$/,
            message: '请输入一个合法的手机号',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      assignDialogVisible: false,
      assignForm: {
        id: '',
        username: '',
        rid: ''
      },
      roleList: []
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
    },
    // 显示添加的对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    addUser() {
      // 1. 表单校验功能
      // 2. 发送ajax请求添加数据
      // 3. 重新渲染  关闭模态框  重置样式
      this.$refs.addForm.validate(async valid => {
        if (!valid) return false
        // 校验成功
        let res = await this.axios({
          method: 'post',
          url: 'users',
          data: this.addForm
        })
        let {
          meta: { status, msg }
        } = res
        if (status === 201) {
          this.total++
          this.currentPage = Math.ceil(this.total / this.pageSize)
          // 重新渲染
          this.getUserList()
          // 重置表单样式
          this.$refs.addForm.resetFields()
          // 隐藏模态框
          this.addDialogVisible = false
          // 提示信息
          this.$message.success('添加成功了')
        } else {
          this.$message.error(msg)
        }
      })
    },
    // 修改用户的对话框显示
    showEditDialog(row) {
      // 显示对话框
      this.editDialogVisible = true
      this.editForm.id = row.id
      this.editForm.username = row.username
      this.editForm.email = row.email
      this.editForm.mobile = row.mobile
    },
    // 修改用户的操作
    updateUser() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return false
        // 发送ajax请求
        let res = await this.axios({
          method: 'put',
          url: `users/${this.editForm.id}`,
          data: this.editForm
        })
        let {
          meta: { status }
        } = res
        if (status === 200) {
          // 重新渲染
          this.getUserList()
          // 隐藏修改对话框
          this.editDialogVisible = false
          // 重置修改表单
          this.$refs.editForm.resetFields()
          // 提示消息
          this.$message.success('恭喜你，修改成功了')
        } else {
          this.$message.error('服务器异常')
        }
      })
    },
    // 获取角色id rid
    async getUserInfo(id) {
      let res = await this.axios.get(`users/${id}`)
      // 根据用户的id获取用户信息,其中就能获取到角色id
      // console.log(res)
      if (res.meta.status === 200) {
        let rid = res.data.rid
        // 新增的用户没有指定角色id,则rid=-1,为了达到更好的效果让-1为空
        if (rid === -1) {
          rid = ''
        }
        this.assignForm.rid = rid
      }
    },
    async showAssignDialog(user) {
      // 1.显示分配角色的对话框
      this.assignDialogVisible = true
      // 2.回显数据
      this.assignForm.id = user.id
      this.assignForm.username = user.username
      // rid是当前用户的角色id，后台没有直接传rid
      // 解决方法：发送ajax请求，根据用户id查询角色id
      this.getUserInfo(user.id)
      // 3.获取角色列表
      let res = await this.axios.get('roles')
      // console.log(res)
      // res.data就是所有的角色列表
      if (res.meta.status === 200) {
        this.roleList = res.data
        // console.log(this.roleList)
      }
    },
    // 分配角色操作
    async assignRole() {
      // 表单校验:如果没有角色id:rid,则表示没有分配角色
      if (!this.assignForm.rid) {
        this.$message.error('请选择一个角色')
        return
      }
      let res = await this.axios.put(`users/${this.assignForm.id}/role`, {
        rid: this.assignForm.rid
      })
      if (res.meta.status === 200) {
        this.$refs.assignForm.resetFields()
        this.assignDialogVisible = false
        this.getUserList()
        this.$message.success('分配角色成功')
      }
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
.input-with-select {
  width: 300px;
  margin-bottom: 5px;
}
</style>
