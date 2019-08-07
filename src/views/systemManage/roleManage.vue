<template>
  <div class="roleManage">
    <div class="header">
      <div style="float:left">
        <Input v-model="searchValue" :maxlength="20" prefix="ios-search" placeholder="输入角色名称" style="width: 360px;" />
        <Button type="primary" @click="getRequest" style="width:100px;marginLeft:20px;">搜索</Button>
      </div>
      <div style="float: right;" class="header-add-role">
        <Button style="width:100px;marginLeft:20px;" @click="addRoleModel('add', '')" v-has="'SYS_ROLE_ADD'">
          <img class="header-add-role-img" src="@/assets/images/systemManage/role_add.png" />
          <span>&nbsp;添加角色</span>
        </Button>
      </div>
    </div>
    <div class="content" v-if="hasData">
      <Table ref="selection" :columns="table.columns" :data="table.list"></Table>
      <div style="marginTop:10px;float: right;">
        <Page style="float: left;"
          show-total
          :total="table.total"
          :current="1"
          @on-change="changePageIndex"
          show-sizer
          :page-size="table.pageSize"
          :page-size-opts="[10,20,30,40,50]"
          @on-page-size-change="changePageSize"
          show-elevator
          prev-text="上一页"
          next-text="下一页"
          ></Page>
      </div>
    </div>
    <!-- 添加角色 -->
    <Modal
      className="sys-role-add-modal"
      width="607"
      v-model="model.roleAddModel"
      @on-visible-change="roleAddModelShowChange">
      <div class="content">
        <p class="model-title">{{addRoleData.roleAddModalText}}</p>
        <Form ref="addRoleForm" :model="addRoleData" :rules="addRoleDataRules" label-position="right" :label-width="80">
          <FormItem label="角色名称: " prop="roleName">
            <Input v-model="addRoleData.roleName" :maxlength="addRoleData.maxlength" style="width: 360px" />
          </FormItem>
          <FormItem label="描述: " prop="description">
            <Input v-model="addRoleData.description" :maxlength="200" style="width: 360px" />
          </FormItem>
          <FormItem label="功能权限: " prop="defaultTansferKeys">
            <transfer-tree
              :fromData="addRoleData.fromData"
              :defaultTansferKeys="addRoleData.defaultTansferKeys"
              height="280px"
              @addEvent="add"
              @removeEvent="remove"
            ></transfer-tree>
            <span v-show="addRoleData.noDefaultTansferKeys" style="float: right; color: #ed4014; margin-right: 94px;">请选择功能权限</span>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" style="width: 120px" size="large" @click="confirmAdd">提交</Button>
      </div>
    </Modal>
    <!-- 授权 -->
    <Modal
      className="sys-role-auth-modal"
      @on-cancel="clearAuth"
      v-model="model.roleAuthModel">
      <div class="content">
        <p class="model-title">角色授权</p>
        <Form :model="roleAuth" ref="roleAuth" label-position="right">
          <FormItem label="角色名称: " style="margin-bottom: 30px">
            <Input v-model="roleAuth.roleName" style="width: 360px" disabled />
          </FormItem>
          <FormItem class="special-item">
            <span style="marginLeft:24px;marginRight:7px;">员工: </span>
            <Input v-model="roleAuth.staff" @on-blur="checkAuth" style="width: 360px;" :disabled="roleAuth.radio==='depart'" placeholder="请输入员工工号" />
            <span v-if="roleAuth.staffErrorShow && roleAuth.radio === 'staff'" style="color: #FF5542; display: block; padding-left: 62px">请输入员工工号</span>
            <!-- <RadioGroup v-model="roleAuth.radio" vertical>
              <Radio label="staff" style="margin-bottom: 30px">
                <Icon type="social-apple"></Icon>
              </Radio>
              <Radio label="depart">
                <Icon type="social-android"></Icon>
                <span style="marginRight:14px;">部门</span>
                <Select
                  ref="roleAuthSelectRef"
                  style="width: 280px; margin-right: 7px"
                  v-model="roleAuth.depart"
                  filterable
                  remote
                  :remote-method="remoteGetSearchInput"
                  :loading="roleAuth.loading"
                  :disabled="roleAuth.radio==='staff'"
                  @on-change="checkAuth">
                  <Option v-for="(option) in roleAuth.departList" :value="option.id" :key="option.id">{{option.orgName}}</Option>
                </Select>
                <Button type="primary" @click="getRoleAuthDepartList" style="width: 72px;">搜索</Button>
                <div v-if="roleAuth.departInputErrorShow && roleAuth.radio === 'depart' && !roleAuth.departErrorShow" style="color: #FF5542; display: block; padding-left: 62px">字符长度不超过 20</div>
              </Radio>
            </RadioGroup> -->
            <!-- <span v-if="roleAuth.departErrorShow && roleAuth.radio === 'depart'" style="color: #FF5542; display: block; padding-left: 62px">请选择部门</span> -->
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" style="width: 120px" size="large" @click="confirmAuth">提交</Button>
      </div>
    </Modal>
    <!-- 删除 -->
    <Modal
      className="sys-role-modal"
      width="360" 
      v-model="model.deleteModel"
      :closable="false">
      <div class="content" style="text-align: center;">
        <p>{{model.deleteModelText}}</p>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" width="84" size="large" @click="confirmDelete">是</Button>
        <Button size="large" width="84" @click="cancelDelete">否</Button>
      </div>
    </Modal>
    <!-- 删除 - 账号已绑定 -->
    <Modal
      className="sys-role-modal"
      width="360" 
      v-model="model.cantDeleteModel"
      :closable="false">
      <div class="content" style="text-align: center;">
        <p>{{model.cantDeleteModelText}}</p>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" width="84" size="large" @click="confirmCantDelete">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import TransferTree from './components/TransferTree.vue';
import systemManageApi from '@/api/systemManage.ts';
import './systemManage.less';
export default Vue.extend ({
  name: 'roleManage',
  components: { TransferTree },
  data() {
    return {
      searchValue: '',
      table: {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        columns: [
          {
            title: '角色名称',
            key: 'name',
            align: 'left',
          },
          {
            title: '功能权限',
            key: 'permissions',
            render: (h: any, params: any) => {
              const perList: any = [];
              params.row.permissions.forEach((item: any) => {
                perList.push(item.alias);
              });
              return h('div', {
                attrs: {
                  title: perList.toString(),
                },
              }, perList.toString());
            },
          },
          {
            title: '描述/类型',
            key: 'remark',
            render: (h: any, params: any) => {
              return h('div', {
                attrs: {
                  title: params.row.remark,
                },
              }, params.row.remark);
            },
          },
          // {
          //   title: '是否启用',
          //   key: 'status',
          //   render: (h: any, params: any) => {
          //     return h('div', {}, params.row.status === 1 ? '是' : '否');
          //   },
          // },
          {
            title: '创建人 | 创建时间',
            key: 'createBy',
            render: (h: any, params: any) => {
              return h('div', [
                h('p', params.row.createBy),
                h('span', {
                  style: {fontSize: '12px', color: '#999', fontWeight: 'normal'},
                }, params.row.createTime),
              ]);
            },
          },
          {
            title: '操作',
            align: 'right',
            render: (h: any, params: any) => {
              let operate = [
                h('span', {
                  class: 'icon-bg icon-role-auth',
                  attrs: {
                    title: '授权',
                  },
                  directives: [
                    {
                      name: 'has',
                      value: 'SYS_ROLE_AUTH',
                    },
                  ],
                  on: {
                    click: () => {
                      (this as any).model.roleAuthModel = true;
                      (this as any).roleAuth.roleName = params.row.name;
                      (this as any).roleAuth.roleId = params.row.id;
                      (this as any).roleAuth.staffErrorShow = false;
                      (this as any).roleAuth.departErrorShow = false;
                    },
                  },
                }, ''),
              ];
              const operate2 = [
                h('span', {
                  class: 'icon-bg icon-role-edit',
                  attrs: {
                    title: '编辑',
                  },
                  on: {
                    click: () => {
                      (this as any).addRoleModel('edit', params.row);
                    },
                  },
                  directives: [
                    {
                      name: 'has',
                      value: 'SYS_ROLE_MOD',
                    },
                  ],
                }, ''),
                h('span', {
                  class: 'icon-bg icon-role-delete',
                  attrs: {
                    title: '删除',
                  },
                  on: {
                    click: () => {
                      (this as any).deleteRoleData.id = params.row.id;
                      (this as any).getIfCanDelete(params.row.name);
                    },
                  },
                  directives: [
                    {
                      name: 'has',
                      value: 'SYS_ROLE_DEL',
                    },
                  ],
                }, ''),
              ];
              operate = operate.concat(params.row.status !== '0' ? operate2 : []);
              return h('div', operate);
            },
          },
        ],
        list: [] as any[],
      },
      model: {
        roleAddModel: false,
        roleAuthModel: false,
        deleteModel: false,
        deleteModelText: '',
        cantDeleteModel: false,
        cantDeleteModelText: '',
        roleAddModelType: 'add',
      },
      addRoleData: { // 新增 & 编辑
        roleAddModalText: '新增角色',
        maxlength: 20,
        id: '',
        roleName: '',
        description: '',
        fromData: [] as any[],  // 源数据 - 扁平列表
        fromDataOrigin: [] as any[], // 源数据副本
        defaultTansferKeys: [] as string[], // 默认穿梭数据（即会从源树构建一个包含他们的子树，并放到目标树）
        noDefaultTansferKeys: false,
      },
      deleteRoleData: { // 删除
        id: '',
      },
      addRoleDataRules: { // 校验新增
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        description: [
          { required: true, message: '请输入描述', trigger: 'blur' },
        ],
      },
      roleAuth: {
        roleId: '',
        roleName: '',
        radio: 'staff',
        staff: '',
        depart: '',
        searchInput: '',
        loading: false,
        staffErrorShow: false,
        departErrorShow: false,
        departInputErrorShow: false,
        departList: [] as any,
      },
      hasData: false,
    };
  },
  methods: {
    // 新增角色 - 添加按钮
    add(treeData: any, listData: any) {
      (this as any).addRoleData.defaultTansferKeys = treeData;
      (this as any).checkDefaultTansferKeys();
    },
    // 新增角色 - 移除按钮
    remove(treeData: any, listData: any) {
      (this as any).addRoleData.defaultTansferKeys = treeData;
      (this as any).checkDefaultTansferKeys();
    },
    getParams() {
      const p: any = {
        page: (this as any).table.pageIndex - 1,
        size: (this as any).table.pageSize,
      };
      p.name = (this as any).searchValue;
      if (p.name !== '') {
        p.page = 0;
        (this as any).table.pageIndex = 1;
      }
      return p;
    },
    getRequest() {
      systemManageApi.getRoleListApi((this as any).getParams()).then((res: any) => {
        this.table.list = [...res.data.content];
        this.table.total = res.data.totalElements;
        this.hasData = !this.hasData && res.data.totalElements === 0 ? false : true;
      });
    },
    getSearch(index: number = 1) {
      (this as any).table.pageIndex = index;
      (this as any).getRequest();
    },
    changePageIndex(pageIndex: any) {
      (this as any).table.pageIndex = pageIndex;
      (this as any).getRequest();
    },
    changePageSize(pageSize: any) {
      (this as any).table.pageSize = pageSize;
      (this as any).getRequest();
    },
    // 添加角色
    addRoleModel(type: string, currentData: any) {
      (this as any).model.roleAddModelType = type;
      (this as any).model.roleAddModel = true;
      // 编辑时初始化数据
      if (type === 'edit') {
        (this as any).addRoleData.roleAddModalText = '编辑角色';
        (this as any).addRoleData.roleName = currentData.name;
        (this as any).addRoleData.description = currentData.remark;
        (this as any).addRoleData.id = currentData.id;
        // 获取子权限列表并转为id数组
        (this as any).addRoleData.defaultTansferKeys = currentData.permissions.map((item: any) => {
          return item.id;
        });
        // 两个数组去重,得到不同的数组权限
        const arr = JSON.parse(JSON.stringify((this as any).addRoleData.fromDataOrigin));
        for (const i of currentData.permissions) {
          for (let j = 0 ; j < arr.length; j++) {
            if (i.id === arr[j].id) {
              arr.splice(j, 1);
            }
          }
        }
        // 获取数组权限id数组
        const arrs: any = [];
        arr.map((ele: any) => {
          arrs.push(ele.id);
        });
        const loop = (arry: any) => {
          for (const i of arry) {
            for (const j of (this as any).addRoleData.fromDataOrigin) {
              if (i === j.id) {
                if (i === '0' || j.pid === '0' || j.pid === null) {
                  continue;
                } else {
                  arrs.push(j.pid);
                  const arr2 = [];
                  arr2.push(j.pid);
                  loop(arr2);
                }
              }
            }
          }
        };
        loop(arrs);
        const finalArr = [...new Set(arrs)];
        for (let i = 0; i < finalArr.length; i++) {
          if (finalArr[i] === '0') {
            finalArr.splice(i, 1);
          }
        }
        for (const i of finalArr) {
          for (let j = 0 ; j < (this as any).addRoleData.defaultTansferKeys.length; j++) {
            if (i === (this as any).addRoleData.defaultTansferKeys[j]) {
              (this as any).addRoleData.defaultTansferKeys.splice(j, 1);
            }
          }
        }
      } else {
        (this as any).addRoleData.roleAddModalText = '新增角色';
      }
    },
    // 获取所有权限列表
    getAllPermissionList() {
      systemManageApi.getAllPermissionApi().then((res: any) => {
        const tmpList = res.data;
        const rootNode = [{
          id: '0',
          pid: null,
          title: '功能权限',
        }];
        (this as any).addRoleData.fromData = rootNode.concat(tmpList.map((d: any) => {
          d.title = d.alias;
          delete d.children;
          return d;
        }));
        (this as any).addRoleData.fromDataOrigin = JSON.parse(JSON.stringify((this as any).addRoleData.fromData));
      });
    },
    // 确认添加
    confirmAdd() {
      const type = (this as any).model.roleAddModelType;
      (this as any).$refs.addRoleForm.validate((valid: any) => {
        if (valid && (this as any).checkDefaultTansferKeys()) {
          let permissions = (this as any).addRoleData.defaultTansferKeys.filter((item: any) => {
            return item !== '0';
          });
          // let permissions = (this as any).addRoleData.defaultTansferKeys.filter((item: any) => {
          //   return item !== '0';
          // }).map((child: any) => {
          //   return {id: child};
          // });
          const arr1: any = [];
          const loop = (arr: any) => {
            for (const i of arr) {
              for (const j of (this as any).addRoleData.fromDataOrigin) {
                if (i === j.id) {
                  if (j.pid === '0' || j.pid === null) {
                    continue;
                  } else {
                    arr1.push(j.pid);
                    const arr2 = [];
                    arr2.push(j.pid);
                    loop(arr2);
                  }
                }
              }
            }
          };
          loop((this as any).addRoleData.defaultTansferKeys);
          // const arr3: any = [...new Set(arr1)];
          permissions = [...new Set(permissions.concat(...[...new Set(arr1)]))].map((item: any) => {
            return {id: item};
          });
          const p: any = {
            name: (this as any).addRoleData.roleName,
            remark: (this as any).addRoleData.description,
            permissions,
          };
          if (type === 'edit') {
            p.id = (this as any).addRoleData.id;
          }
          systemManageApi.addRoleApi(p, type).then((res: any) => {
            (this as any).model.roleAddModel = false;
            (this as any).$Message.info(`${type === 'add' ? '添加' : '编辑'}成功`);
            (this as any).getSearch(this.table.pageIndex);
          });
        }
      });
    },
    // 校验功能权限
    checkDefaultTansferKeys() {
      if ((this as any).addRoleData.defaultTansferKeys.length > 0) {
        (this as any).addRoleData.noDefaultTansferKeys = false;
        return true;
      } else {
        (this as any).addRoleData.noDefaultTansferKeys = true;
        return false;
      }
    },
    // 新增弹框关闭时清空数据
    roleAddModelShowChange(val: any) {
      if (val === false) {
        (this as any).$refs.addRoleForm.resetFields();
        (this as any).addRoleData.roleName = '';
        (this as any).addRoleData.description = '';
        (this as any).addRoleData.id = '';
        (this as any).addRoleData.defaultTansferKeys = [];
        (this as any).addRoleData.fromData = JSON.parse(JSON.stringify((this as any).addRoleData.fromDataOrigin));
        (this as any).addRoleData.noDefaultTansferKeys = false;
      }
    },
    // 授权
    confirmAuth() {
      if ((this as any).checkAuth()) {
        const authParams: any = {
          roleId: (this as any).roleAuth.roleId,
        };
        if ((this as any).roleAuth.radio === 'staff') { // 授权给员工
          const userParams: any = {
            code: (this as any).roleAuth.staff,
          };
          systemManageApi.getUserInfoByCode(userParams).then((res: any) => {
            if (res.data && res.data.id) {
              authParams.userId = res.data.id;
              systemManageApi.addRoleToUserApi(authParams).then((data: any) => {
                (this as any).$Message.success('授权成功');
                (this as any).model.roleAuthModel = false;
                (this as any).clearAuth();
              }, (error: any) => {
                  (this as any).$Message.error('授权失败');
                  (this as any).clearAuth();
              });
            } else {
              (this as any).$Message.error('员工信息有误，请重新输入');
            }
          });
        } else if ((this as any).roleAuth.radio === 'depart') { // 授权给部门
          if ((this as any).roleAuth.depart) {
            authParams.orgId = (this as any).roleAuth.depart;
            systemManageApi.addRoleToOrgApi(authParams).then((res: any) => {
              (this as any).$Message.success('授权成功');
              (this as any).model.roleAuthModel = false;
              (this as any).clearAuth();
            });
          } else {
            (this as any).$Message.error('部门信息有误');
          }
        }
      }
    },
    cancelAuth() {
      (this as any).model.roleAuthModel = false;
    },
    clearAuth() {
      (this as any).roleAuth.staff = '';
      (this as any).roleAuth.depart = '';
      (this as any).roleAuth.departList = [];
      (this as any).roleAuth.roleId = '';
      (this as any).roleAuth.roleName = '';
      (this as any).roleAuth.staff = '';
      (this as any).roleAuth.searchInput = '';
      (this as any).roleAuth.staffErrorShow = false;
      (this as any).roleAuth.departErrorShow = false;
    },
    checkAuth() {
      let status = true;
      if ((this as any).roleAuth.radio === 'staff') {
        if (!(this as any).roleAuth.staff) {
          (this as any).roleAuth.staffErrorShow = true;
          status = false;
        } else {
          (this as any).roleAuth.staffErrorShow = false;
        }
      } else if ((this as any).roleAuth.radio === 'depart') {
        if (!(this as any).roleAuth.depart) {
          (this as any).roleAuth.departErrorShow = true;
          status = false;
        } else {
          (this as any).roleAuth.departErrorShow = false;
        }
      }
      return status;
    },
    getUserId(info: any) { // 获取用户id
      const p = {
        keyword: info,
      };
      systemManageApi.getUserInfoApi(p).then((res: any) => {
        if (res.data && res.data.content) {
          return res.data.content[0].id;
        } else {
          return '';
        }
      }, (res: any) => {
        return '';
      });
    },
    getRoleAuthDepartList() { // 获取部门列表
      const p = {
        orgName: (this as any).roleAuth.searchInput,
      };
      systemManageApi.getOrgInfoApi(p).then((res: any) => {
        (this as any).roleAuth.departList = res.data;
      });
    },
    remoteGetSearchInput(query: any) {
      if (query.length <= 20) {
        (this as any).roleAuth.departInputErrorShow = false;
        (this as any).roleAuth.searchInput = query;
        const timer = setTimeout(() => {
          (this as any).getRoleAuthDepartList();
        }, 200);
      } else {
        (this as any).roleAuth.departInputErrorShow = true;
      }
    },
    // 删除
    getIfCanDelete(name: any) { // 获取是否可删
      const p = {
        id: (this as any).deleteRoleData.id,
      };
      systemManageApi.getRoleIfCanDelApi(p).then((res: any) => {
        if (res.data.result === true) {
          (this as any).model.deleteModelText = '确定删除 ' + name + ' ?';
          (this as any).model.deleteModel = true;
        } else {
          (this as any).model.cantDeleteModel = true;
          (this as any).model.cantDeleteModelText = '该角色已绑定账号，请至系统管理>账号管理解绑该角色账号！';
        }
      });
    },
    confirmDelete() { // 确认删除
      const p = {
        id: (this as any).deleteRoleData.id,
      };
      systemManageApi.deleteRoleApi(p).then((res: any) => {
        (this as any).model.deleteModel = false;
        (this as any).$Message.success('删除成功');
        (this as any).getSearch();
      }, (res: any) => {
        (this as any).model.deleteModel = false;
      });
    },
    cancelDelete() {
      (this as any).model.deleteModel = false;
    },
    confirmCantDelete() {
      (this as any).model.cantDeleteModel = false;
    },
  },
  beforeMount() {
    (this as any).getRequest();
    (this as any).getAllPermissionList();
  },
});
</script>
<style lang="less">
  .sys-role-modal,.sys-role-auth-modal, .sys-role-add-modal {
    label {
        margin: 0;
    }
    .ivu-modal-body {
      min-height: 93px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      padding: 40px 40px 0 40px;
      .content {
        width: 100%;
        p.model-title {
          margin-bottom: 30px;
          font-size: 18px; 
          font-weight: bold;
        }
        .ivu-form-item {
          margin-bottom: 24px;
          .el-checkbox__input.is-checked .el-checkbox__inner, 
          .el-checkbox__input.is-indeterminate .el-checkbox__inner {
            background-color: #4DD67F;
            border-color: #4DD67F;
          }
          .transfer-center-item {
            &:last-child {
              .el-button.el-button--primary {
                background-color: #E9EEF3!important;
                color: #333333!important;
                border-color: #DCE5E8!important;
              }
            }
            .el-button.el-button--primary {
              padding: 6px 9px!important;
              background-color: #3B72A8!important;
              color: #fff!important;
              border-color: #3B72A8!important;
            }
          }
        }
      }
    }
    .ivu-modal-footer {
      padding: 12px 18px 42px 18px;
      text-align: center;
      border-top: none;
      .ivu-btn {
        width: 84px;
      }
    }
  }

  .transfer-title {
    display: none!important;
  }
</style>
