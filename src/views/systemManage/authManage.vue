<template>
  <div class="authManage">
    <table-tree
      :items='treeData' 
      :columns='columns'
      @on-row-click='rowClick'
    ></table-tree>
    <Modal
        v-model="addAuth"
        :title="toastTit"
        width="440px"
        @on-cancel="closeModal">
        <Form  ref="formValidates" :model="formValidate" :rules="rules">
          <FormItem label="一级权限：">
            <Input name="name" v-model="formValidate.one" disabled/>
          </FormItem>
          <FormItem label="二级权限：">
            <Input name="name" v-model="formValidate.two" disabled/>
          </FormItem>
          <FormItem label="三级权限：">
            <Input name="name" v-model="formValidate.three" disabled/>
          </FormItem>
          <FormItem label="子权限：" prop="selectValue">
            <Select v-model="formValidate.selectValue" style="width:200px" placeholder="添加角色">
              <Option v-for="item in roleList" :value="item.alias" :key="item.id" :disabled="item.status==='1'">{{ item.alias }}</Option>
            </Select>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="primary" size="large" @click="authSubmit">提 交</Button>
        </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import './systemManage.less';
import tableTree from './tableTree.vue';
import systemManageApi from '@/api/systemManage.ts';
export default {
  name: 'authManage',
  data() {
    return {
      columns: [
        {
          title: '权限名称',
          key: 'alias',
          // sortable: true, // 排序
          width: '150',
        },
        {
          title: '权限代码',
          key: 'name',
          width: '150',
        },
        // {
        //   title: '操作',
        //   type: 'action',
        //   width: '150',
        // },
      ],
      treeData: [],
      treeArr: [],
      addAuth: false,
      toastTit: '添加子权限',
      one: '',
      two: '',
      three: '',
      formValidate: {
        one: '',
        two: '',
        three: '',
        selectValue: '',
      },
      roleList: [],
      editRoleId: 0,
    };
  },
  props: {
    selectValueRules: {
      type: Array,
      default: () => {
        return [{ required: true, message: '请选择角色类型', trigger: 'change' }];
      },
    },
  },
  computed: {
    rules() {
      return {
        selectValue: (this as any).selectValueRules,
      };
    },
  },
  components: {
    tableTree,
  },
  created() {
    (this as any).getPermissionTable();
  },
  methods: {
    getPermissionTable() {
      systemManageApi.getPermission().then((res) => {
        for (const i of res.data) {
          i.id = i.id * 1;
          i.pid = i.pid * 1;
        }
        (this as any).treeArr = res.data;
        (this as any).treeData = res.data;
        const arrToTree = (data: any, parent: number) => {
          const tree = [];
          let temp = [];
          for (const i of data) {
              if (i.pid === parent) {
                  const obj = i;
                  temp = arrToTree(data, i.id);
                  if (temp.length > 0) {
                      obj.children = temp;
                  }
                  tree.push(obj);
              }
          }
          return tree;
        };
        (this as any).treeData = arrToTree((this as any).treeData, 0);
      }, (res) => {
        (this as any).treeData = [
          {id: -100, name: '暂无数据'},
        ];
      });
    },
    rowClick(data: any, index: any, event: any, str: string) {
      switch (true) {
        case str === 'add':
          (this as any).getRoleList(data, str);
          break;
        case str === 'edit':
          (this as any).editRoleList(data, str);
          break;
        case str === 'del':
          (this as any).delRoleList(data, str);
          break;
      }
    },
    getRoleList(data: any, str: string) {
      const params = {
        id: data.id,
      };
      systemManageApi.getChildPermission(params).then((res: any) => {
        (this as any).roleList = res.data;
        if ((this as any).roleList.length === 0) {
          (this as any).$Message.info('当前账号已开启所有权限');
          return;
        }
        (this as any).addAuth = true;
        (this as any).toastTit = '添加子权限';
        (this as any).formValidate.three = data.alias;
        let add = 0;
        for (const i of (this as any).treeArr) {
          if (data.pid === i.id) {
            (this as any).formValidate.two = i.alias;
            add = i.pid;
            break;
          }
        }
        for (const i of (this as any).treeArr) {
          if (add === i.id) {
            (this as any).formValidate.one = i.alias;
            break;
          }
        }
      }, (res: any) => {
      // console.log(res);
      });
    },
    editRoleList(data: any, str: string) {
      const params = {
        id: data.pid,
      };
      systemManageApi.getChildPermission(params).then((res: any) => {
        (this as any).roleList = res.data;
        if ((this as any).roleList.length === 0) {
          (this as any).$Message.info('当前账号已开启所有权限,无法编辑');
          return;
        }
        const param = {
          id: data.id,
        };
        systemManageApi.canDelChildPermission(param).then( (resp: any) => {
          if (resp.data.status === 2) {
            (this as any).$Modal.error({
              title: '当前子权限已经绑定了角色,请先解绑角色',
            });
            return;
          } else {
            (this as any).addAuth = true;
            (this as any).toastTit = '编辑子权限';
            let edit = 0;
            for (const i of (this as any).treeArr) {
              if (data.pid === i.id) {
                (this as any).formValidate.three = i.alias;
                edit = i.pid;
                break;
              }
            }
            for (const i of (this as any).treeArr) {
              if (edit === i.id) {
                (this as any).formValidate.two = i.alias;
                edit = i.pid;
                break;
              }
            }
            for (const i of (this as any).treeArr) {
              if (edit === i.id) {
                (this as any).formValidate.one = i.alias;
                break;
              }
            }
            // (this as any).roleList.push(data);
            (this as any).editRoleId = data.id;
            (this as any).formValidate.selectValue = data.alias;
          }
        });
      }, (res: any) => {
      // console.log(res);
      });
    },
    delRoleList(data: any, str: string) {
      const param = {
        id: data.id,
      };
      systemManageApi.canDelChildPermission(param).then( (res: any) => {
        if (res.data.status === 1) {
          let del = 0;
          for (const i of (this as any).treeArr) {
            if (data.pid === i.id) {
              (this as any).formValidate.three = i.alias;
              del = i.pid;
              break;
            }
          }
          for (const i of (this as any).treeArr) {
            if (del === i.id) {
              (this as any).formValidate.two = i.alias;
              del = i.pid;
              break;
            }
          }
          for (const i of (this as any).treeArr) {
            if (del === i.id) {
              (this as any).formValidate.one = i.alias;
              break;
            }
          }
          (this as any).$Modal.confirm({
            title: '确定删除',
            content: (this as any).formValidate.one + ' / ' + (this as any).formValidate.two  + ' / ' + (this as any).formValidate.three + ' / ' + data.alias + ' 权限?',
            onOk: () => {
              const params = {
                id: data.id,
              };
              systemManageApi.delChildPermission(params).then( () => {
                (this as any).$Message.info('删除成功');
                (this as any).getPermissionTable();
              });
            },
            onCancel: () => {
              // (this as any).$Message.info('');
            },
          });
        } else {
          (this as any).$Modal.error({
            title: '已经绑定了角色,请先解绑角色',
          });
        }
      });
    },
    authSubmit() {
      const params = {
        id: 0,
        name: '',
        alias: '',
        pid: 0,
        status: '1',
      };
      (this as any).$refs.formValidates.validate((valid: any) => {
        if (valid) {
          for (const i of (this as any).roleList) {
            if (i.alias === (this as any).formValidate.selectValue) {
              params.id = i.id;
              params.name = i.name;
              params.alias = i.alias;
              params.pid = i.pid;
              break;
            }
          }
          systemManageApi.openChildPermission(params).then( (res) => {
            if ((this as any).editRoleId === params.id) {
              (this as any).$Message.info('当前子权限未改变');
              (this as any).addAuth = false;
              return;
            }
            if ((this as any).toastTit === '编辑子权限') {
              const param = {
                id: (this as any).editRoleId,
              };
              systemManageApi.delChildPermission(param).then( () => {
                (this as any).$Message.success((this as any).toastTit + '成功,当前子权限为启用状态');
                (this as any).formValidate.selectValue = '';
                (this as any).addAuth = false;
                (this as any).getPermissionTable();
              });
            } else {
              (this as any).$Message.success((this as any).toastTit + '成功,当前子权限为启用状态');
              (this as any).formValidate.selectValue = '';
              (this as any).addAuth = false;
              (this as any).getPermissionTable();
            }
          }, (res) => {
            (this as any).$Message.error((this as any).toastTit + '失败,请稍候再试');
            (this as any).formValidate.selectValue = '';
            (this as any).addAuth = false;
          });
        } else {
          return;
        }
      });
    },
    closeModal() {
      (this as any).addAuth = false;
    },
  },
};
</script>
