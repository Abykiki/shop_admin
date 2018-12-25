<template>
  <div class="roles">
    <!-- 面包屑导航: 显示当前页面的路径,快速返回之前的任意页面 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 增加按钮 -->
    <el-button type="success" plain @click="showAddDialog">增加角色</el-button>
    <!-- 表格组件 -->
    <el-table :data="roleList">
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <span v-if="row.children.length === 0">暂无权限</span>
          <!-- 一级分类 -->
          <el-row class="l1" v-for="l1 in row.children" :key="l1.id">
            <el-col :span="4">
              <!-- closable属性可以定义一个标签是否可移除 -->
              <el-tag closable @close="delRight(row,l1.id)">{{l1.authName}}</el-tag>
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <!-- 一级分类里的二三级分类 -->
            <el-col :span="20">
              <!-- 显示二级分类 -->
              <el-row class="l2" v-for="l2 in l1.children" :key="l2.id">
                <el-col :span="4">
                  <el-tag @close="delRight(row,l2.id)" closable type="success">{{l2.authName}}</el-tag>
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="20">
                  <!-- 显示三级分类 -->
                  <span v-for="l3 in l2.children" :key="l3.id">
                    <el-tag
                      @close="delRight(row,l3.id)"
                      closable
                      class="l3"
                      type="warning"
                    >{{l3.authName}}</el-tag>
                  </span>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- 显示下标 -->
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <!-- 解构 -->
        <template slot-scope="{row}">
          <el-button
            type="primary"
            plain
            icon="el-icon-edit"
            @click="showEditDialog(row)"
            size="mini"
          ></el-button>
          <el-button type="danger" plain icon="el-icon-delete" size="mini" @click="delRole(row.id)"></el-button>
          <el-button
            type="success"
            plain
            icon="el-icon-check"
            size="mini"
            @click="showAssignDialog(row)"
          >分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分配角色对话框 -->
    <el-dialog title="角色授权" :visible.sync="assignDialogVisible" width="40%">
      <!-- 树形控件 -->
      <!--
          default-expand-all:是否默认展开所有节点
          show-checkbox:节点是否可被选择
          node-key:每个树节点用来作为唯一标识的属性，整棵树应该是唯一的,
                    通过 key 来获取或设置，则必须设置node-key
      -->
      <el-tree
        ref="tree"
        :data="data"
        :props="defaultProps"
        node-key="id"
        show-checkbox
        default-expand-all
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button @click="assignRight" type="primary">分配</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <!-- 添加角色和修改角色共用一个模态框 -->
    <!-- 可以区分二者的条件是有无id值,修改角色是会传入id,而添加角色不需要id -->
    <el-dialog
      :title="this.addForm.id ? '修改角色' : '添加角色'"
      :visible.sync="addDialogVisible"
      width="40%"
    >
      <el-form status-icon ref="addForm" :rules="rules" :model="addForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button @click="saveRole" type="primary">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      assignDialogVisible: false,
      data: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      roleId: '',
      addDialogVisible: false,
      addForm: {
        roleName: '',
        id: '',
        roleDesc: ''
      },
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //   角色列表的页面渲染
    async getRoleList() {
      let res = await this.axios.get('roles')
      if (res.meta.status === 200) {
        this.roleList = res.data
        console.log(this.roleList)
      }
    },
    // 删除分类信息
    async delRight(role, rightId) {
      let res = await this.axios.delete(`roles/${role.id}/rights/${rightId}`)
      let {
        meta: { status },
        data
      } = res
      if (status === 200) {
        role.children = data
        this.$message.success('取消权限成功')
      } else {
        this.$message.info('取消权限失败')
      }
    },
    // 点击"分配权限",显示内容,进行分配操作
    async showAssignDialog(role) {
      this.roleId = role.id
      this.assignDialogVisible = true
      // 发送ajax请求,获取到所有的权限的数据,树状
      let res = await this.axios.get('rights/tree')
      let {
        meta: { status },
        data
      } = res
      if (status === 200) {
        this.data = data
        // console.log(this.data)
      }
      //   让节点选中,找到当前角色拥有的所有的三级权限
      //   console.log(role)
      let ids = []
      role.children.forEach(l1 => {
        l1.children.forEach(l2 => {
          l2.children.forEach(l3 => {
            ids.push(l3.id)
          })
        })
      })
      //   通过 keys 设置目前勾选的节点
      this.$refs.tree.setCheckedKeys(ids)
    },
    // 点击"分配"按钮,重新分配权限
    async assignRight() {
      // 获取到所有选中的id,通过key获取
      let checkedKeys = this.$refs.tree.getCheckedKeys()
      //   再获取半选中的id
      let halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()
      //   需要以字符串的形式传入
      //   将获取到的两个数组进行拼接,然后转成字符串的形式
      let rids = checkedKeys.concat(halfCheckedKeys).join()
      //   发送ajax请求,获取到所有的权限数据
      let res = await this.axios.post(`roles/${this.roleId}/rights`, {
        rids
      })
      let {
        meta: { status }
      } = res
      if (status === 200) {
        this.getRoleList()
        this.assignDialogVisible = false
        this.$message.success('分配权限成功')
      } else {
        this.$message.error('分配权限失败')
      }
    },
    // 删除角色
    async delRole(id) {
      try {
        await this.$confirm('此操作将永久删除该角色', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 确定即删除
        // 发送ajax请求
        let res = await this.axios.delete(`roles/${id}`)
        // let {
        //   meta: { status }
        // } = res.data
        if (res.meta.status === 200) {
          this.$message.success('删除成功')
          this.getRoleList()
        } else {
          this.$message.error('删除失败')
        }
      } catch (e) {
        this.$message.info('取消删除')
      }
    },
    // 显示添加角色对话框
    showAddDialog() {
      this.addDialogVisible = true
      this.addForm.roleName = ''
      this.addForm.roleDesc = ''
      this.addForm.id = ''
    },
    // 保存增加/修改的角色
    saveRole() {
      // 1.表单校验
      this.$refs.addForm.validate(async valid => {
        if (!valid) return false
        // 2.发送ajax请求
        let id = this.addForm.id
        let method = id ? 'put' : 'post'
        let url = id ? `roles/${id}` : `roles`
        let status = id ? 200 : 201
        let res = await this.axios({
          method,
          url,
          data: this.addForm
        })
        if (res.meta.status === status) {
          this.$refs.addForm.resetFields()
          this.addDialogVisible = false
          this.getRoleList()
          this.$message.success('操作成功')
        } else {
          this.$message.error('操作失败')
        }
      })
    },
    // 显示修改角色对话框
    showEditDialog(role) {
      this.addDialogVisible = true
      this.addForm.roleName = role.roleName
      this.addForm.roleDesc = role.roleDesc
      this.addForm.id = role.id
    }
  },
  created() {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
.l1 {
  border-bottom: 1px dotted #ccc;
  padding: 10px 0;
}
.l2 {
  margin-bottom: 5px;
}
.l3 {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
