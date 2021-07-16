<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">客户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>客户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索与添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList">
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="customerName"></el-table-column>
        <el-table-column label="电话" prop="tel"></el-table-column>
        <el-table-column label="客户类型" prop="customerType">
          <template slot-scope="scope">
            <span v-if="scope.row.customerType === 1">货源</span>
            <span v-if="scope.row.customerType === 2">货主</span>
          </template>
        </el-table-column>
        <el-table-column label="客户地址" prop="address"></el-table-column>
        <el-table-column label="创建时间" prop="createTime"></el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <!-- 修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialogVisible(scope.row.id)">
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCustomerInfo(scope.row.id)">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[10, 15, 20]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 添加用户对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
        <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
            <el-form-item label="客户姓名" prop="customerName">
                <el-input v-model="addForm.customerName"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="tel">
                <el-input v-model="addForm.tel"></el-input>
            </el-form-item>
            <el-form-item label="客户类型" prop="customerType">
                <el-input v-model="addForm.customerType"></el-input>
            </el-form-item>
            <el-form-item label="地址" prop="address">
                <el-input v-model="addForm.address"></el-input>
            </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
     </el-dialog>

      <!-- 编辑用户对话框 -->
      <el-dialog
        title="编辑客户"
        :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
          <el-form-item label="客户名称" prop="customerName">
            <el-input v-model="editForm.customerName"></el-input>
          </el-form-item>
          <el-form-item label="电话"  prop="tel">
            <el-input v-model="editForm.tel"></el-input>
          </el-form-item>
          <el-form-item label="客户类型" prop="customerType">
            <el-input v-model="editForm.customerType"></el-input>
          </el-form-item>
          <el-form-item label="地址"  prop="address">
            <el-input v-model="editForm.address"></el-input>
          </el-form-item>
        </el-form>  
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10,
      },
      userList: [],
      total: 0,
      //控制对话框的显示与隐藏
      addDialogVisible: false,
      //客户新增表单
      addForm: {
          customerName: '',
          tel: '',
          customerType: '',
          address: ''
      },
      //客户新增规则
      addRules: {
          customerName: [{
              required: true, message: "请输入客户姓名", trigger: 'blur'
          },{
              min: 1, max: 10, message: "用户名长度在3-10之间", trigger: 'blur'
          }]
      },
      //编辑客户对话框显示与隐藏
      editDialogVisible: false,
      editForm: {
        customerName: '',
        tel: '',
        customerType: '',
        address: ''
      },
      editRules: {
          customerName: [{
              required: true, message: "请输入客户姓名", trigger: 'blur'
          },{
              min: 1, max: 10, message: "用户名长度在3-10之间", trigger: 'blur'
          }]
      },
    }
  },
  
  created() {
    this.getUserList()
  },
  
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('/customer/customerList', {
        params: this.queryInfo,
      })
      // console.log(res)
      if (res.code !== 200) {
        return this.$message.error(res.msg)
      }
      (this.userList = res.data.list), 
      (this.total = res.data.total)
    },
    // 监听pageSize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pageSize = newSize
      this.getUserList()
    },

    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pageNum = newPage
      this.getUserList()
    },

    //监听对话框关闭事件
    addDialogClose() {
        this.$refs.addFormRef.resetFields()
    },
    //添加用户
    addUser(){
      this.$refs.addFormRef.validate(async valid => {
        //  console.log(valid)
        if(!valid) return
        //添加用户网络请求
        const {data: res} = await this.$http.post('/customer/addCustomer', this.addForm)
        if(res.code !== 200) {
          return this.$message.error("添加用户失败！")
        }
        this.$message.success("添加用户成功！")
        this.addDialogVisible = false
        //重新获取用户列表数据
        this.getUserList()
      })
    },
    //编辑用户对话框
    async showEditDialogVisible(id) {
      // console.log(id)
      const {data: res} = await this.$http.get("/customer/getById?id=" + id)
      console.log(res)
      if(res.code !== 200){
        return this.$message.error("添加用户失败！")
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //重置编辑对话框
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if(!valid) return
        //发起修改用户信息的数据请求
        const {data: res} = await this.$http.post("/customer/edit",this.editForm)
        if(res.code !== 200){
          this.$message.error("编辑失败！")
        }
        this.$message.success("编辑成功！")
        //关闭对话框
        this.editDialogVisible = false
        //刷新数据
        this.getUserList()
      })
    },
    a(value) {

    },
    //删除用户信息
    async deleteCustomerInfo(id) {
      //对话框提示信息
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(confirmResult !== 'confirm'){
        return this.$message.info("已经取消删除！")
      }

      //发送请求
      const {data: res} = await this.$http.delete("/customer/deleteById/" + id)
      if(res.code !== 200){
        return this.$message.error("删除失败！")
      }
      this.$message.success("删除成功！")
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>