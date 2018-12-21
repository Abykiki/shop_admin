<template>
  <div class="login">
    <!--
      el-form: 整个form组件
      :model="form"  必须提供的对象
      label-width="80px":提示消息的宽度,label的宽度
      el-form-item：一个表单项
    -->
    <!-- 通过 rules 属性传入约定的验证规则,给整个el-form传入一个rules规则 -->
    <el-form status-icon ref="form" :model="form" :rules="rules" label-width="80px">
      <img src="@/assets/avatar.jpg" alt>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登录</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      // 表单的校验规则
      rules: {
        // 用户名的校验规则
        username: [
          // 非空校验
          { required: true, message: '用户名不能为空', trigger: 'change' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'change' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'change' },
          {
            min: 6,
            max: 12,
            message: '用户长度在 6 到 12 个字符',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    reset() {
      // 获取到整个表单组件,重置
      this.$refs.form.resetFields()
    },
    // 登录校验
    login() {
      // 让整个表单校验
      this.$refs.form.validate(valid => {
        // valid如果为true,就表示通过,否则不通过
        if (valid) {
          // 发送ajax请求,进行登录
          axios({
            method: 'post',
            url: 'http://localhost:8888/api/private/v1/login',
            data: this.form
          }).then(res => {
            console.log(res.data)
            if (res.data.meta.status === 200) {
              this.$message.success('登录成功')
              // 把后台颁发的token存起来
              localStorage.setItem('token', res.data.data.token)
              // 跳转到home组件
              // 参数:跳转的路径
              // 类似于location.href
              this.$router.push('/home')
              // 把后台颁发的token保存起来
              // localStorage.setItem('token', res.data.data.token)
            } else {
              // 失败的消息 this.$message:弹出一个消息提示
              this.$message({
                message: res.data.meta.msg,
                type: 'error',
                duration: 1000
              })
            }
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="less">
.login {
  height: 100%;
  width: 100%;
  background-color: #2d434c;
  overflow: hidden;
  .el-form {
    width: 400px;
    background-color: #fff;
    margin: 200px auto;
    padding: 75px 40px 15px;
    position: relative;
    img {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: -70px;
      border-radius: 50%;
      border: 10px solid #fff;
    }
  }
}
</style>
