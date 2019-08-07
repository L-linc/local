<template>
  <div class="modelAppManage">
    <div class="header">
      <div style="float:left">
        <Input v-model="searchValue" :maxlength="200" prefix="ios-search"  placeholder="请输入模型名称" style="width: 280px;" />
        <Button type="primary" style="width:100px;marginLeft:20px;" @click="getModalList">搜索</Button>
      </div>
      <div style="float: right;" class="gheader-add-role">
        <Button style="width:100px;marginLeft:20px;" @click="addNewModel">
          <img class="header-add-role-img" style="width:12px;" src="@/assets/images/systemManage/role_add.png" />
          <span>&nbsp;添加模型</span>
        </Button>
      </div>
    </div>
    <div class="content">
      <div class="content-list">
        <div class="content-left">
          <Table max-height ="624" highlight-row ref="selection" :columns="leftColumns" :data="leftList" @on-row-click="getRowInfo"></Table>
        </div>
        <div class="content-right">
          <ul>
            <li class="left" style="width: 150px; marginLeft: 12px;">
              模型应用名称
            </li>
            <li class="middle1" style="width: 250px; marginLeft: 12px;">
              模型应用规则
            </li>
            <li class="middle2" style="width: 72px; marginLeft: 12px;">
              
            </li>
            <li class="right" style="width: 110px; textAlign: right">
              操作
            </li>
          </ul>
          <div class="middle-search">
            <Input v-model="modalAppName" @on-enter="getModalAppList" class="input-name" placeholder="请输入模型应用名称"/>
            <Input v-model="modalAppRegular" @on-enter="getModalAppList" class="input-regular" placeholder="请输入模型应用规则"/>
          </div>
          <Table highlight-row ref="selection" :columns="table.columns1" :data="table.list1" :show-header="false">
          </Table>
          <div style="marginTop:10px;float: right;">
            <Page style="float: left;"
              show-total
              :total="table.total"
              :current.sync="table.currentPage"
              :page-size="table.pageSize"
              :page-size-opts="[10,20,30,40,50]"
              @on-change="pageChange"
              @on-page-size-change="pageSizeChange"
              prev-text="上一页"
              next-text="下一页"
              ></Page>
          </div>
        </div>
      </div>
  

    </div>

  <Modal v-model="iSDeleteModal">
    <p>确定要删除吗?</p>
    <div slot="footer" style="text-align: center">
        <Button type="primary" width="84" size="large" @click="deleteElement">是</Button>
        <Button size="large" width="84" @click="cancelElement">否</Button>
    </div>
  </Modal>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import './appCenter.less';
import modalManageApi from '@/api/modalManage.ts';
export default Vue.extend ({
  name: 'modelManage',
  data() {
    const arrRight = [];
    const arrLeft = [];
    for (let i = 0; i < 10; i++) {
        arrRight.push({
          name: 'a',
          regular: 'b',
          alarmSet: 'c',
          id: '666',
        });
        arrLeft.push({
          name: 'a',
          modal: 'b',
          description: 'c',
          id: '8888',
        });
    }
    return {
      // isModelAppHasData: false,
      iSDeleteModal: false,
      searchValue: '',
      modalAppName: '',
      modalAppRegular: '',
      table: {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        columns1: [
          {
            title: '模型应用名称',
            key: 'name',
            align: 'left',
            minWidth: 150,
            render: (h: any, params: any): any => {
              return params.row.name == null ?  h('span', '/') : h('span', {attrs: {title: params.row.name}}, params.row.name);
            },
          },
          {
            title: '模型应用规则',
            // key: 'regular',
            minWidth: 250,
            render: (h: any, params: any) => {
              return h('div', [
                  h('span', {
                      style: {
                          display: 'inline-block',
                          minWidth: 250,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                      },
                      domProps: {
                          title: params.row.regular,
                      },
                  }, params.row.regular),
              ]);
            },
          },
          {
            title: '报警设置',
            key: 'alarmSet',
            minWidth: 84,
          },
          {
            title: '操作',
            align: 'right',
            minWidth: 110,
            render: (h: any, params: any) => {
              return h('div', [
                h('span', {
                  class: 'icon-bg icon-set',
                  attrs: {
                    title: '设置',
                  },
                  on: {
                    click: () => {
                      console.log('模型应用id', params.row.id);
                      this.$router.push({name: 'modelManageDetail', params: {status: 'edit', params: params.row}});
                    },
                  },
                }, ''),
                h('span', {
                  class: 'icon-bg icon-role-delete',
                  attrs: {
                    title: '删除',
                  },
                  on: {
                    click: () => {
                      console.log('999', params.row.id);
                      (this as any).SelectElementId = params.row.id;
                      (this as any).iSDeleteModal = true;
                    },
                  },
                }, ''),
              ]);
            },
          },
        ],
        list1: [],
      },
      leftColumns:  [
          {
            title: '模型名称',
            key: 'name',
            align: 'left',
            width: 160,
            render: (h: any, params: any): any => {
              return h('span', {attrs: {title: params.row.name}}, params.row.name);
            },
          },
          {
            title: '模型编号',
            key: 'modal',
            width: 150,
            render: (h: any, params: any): any => {
              return h('span', {attrs: {title: params.row.modal}}, params.row.modal);
            },
          },
          {
            title: '描述',
            key: 'description',
            render: (h: any, params: any): any => {
              return h('span', {attrs: {title: params.row.description}}, params.row.description);
            },
          },
          {
            title: '操作',
            align: 'right',
            render: (h: any, params: any) => {
              return h('div', [
                h('span', {
                  class: 'icon-bg icon-add',
                  attrs: {
                    title: '添加',
                  },
                  on: {
                    click: () => {
                      console.log('888', params);
                      this.$router.push({name: 'modelManageDetail', params: {status: 'add', modelId: params.row.id}});
                    },
                  },
                }, ''),
                h('span', {
                  class: 'icon-bg icon-role-view',
                  attrs: {
                    title: '查看',
                  },
                  on: {
                    click: () => {
                      // console
                      // this.$router.push({name: 'modelingTool', params: {id: params.row.id}});
                      const href = `${location.protocol}//${location.hostname}:${location.port}/modelingTool`;
                      window.open(href, '_blank');
                    },
                  },
                }, ''),
              ]);
            },
          },
        ],
      leftList: arrLeft as any,
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
      isShowStatus: true,
      params: '',
      SelectElementId: '',
      selectModelId: '', // 1e96fca720fdd30a2405b17f502d101
    };
  },
  watch: {
    iSDeleteModal(newvalue) {
      console.log(newvalue);
    },
    $route(to , from ) {
      if (to.fullPath === '/modelManage') {
        const params: any = to.params;
        if (params.status === 'edit') {
          (this as any).setModalApp(params.params);
        }
        if (params.status === 'add') {
          (this as any).addModalApp(params.params);
        }
      }
    },
  },
  methods: {
    addNewModel() {
      const href = `${location.protocol}//${location.hostname}:${location.port}/modelingTool`;
      window.open(href, '_blank');
    },
    getRowInfo(data: any) {
      (this as any).selectModelId = data.id;
      (this as any).getModalAppList();
    },
    // 查询模型
    async getModalList() {
      (this as any).leftList = [];
      const modelParams: any = {};
      if ((this as any).searchValue !== '') {
        modelParams.name = (this as any).searchValue;
      }
      const result = await modalManageApi.getModalList(modelParams);
      const data = result && result.data || [];
      if (data.length === 0) {
        (this as any).table.list1 = [];
        (this as any).table.total = 0;
        return;
      }
      (this as any).selectModelId = data[0].id;
      (this as any).leftList = data.map(({name = '', serialNumber = '', describe = '', id = ''}: any) => {
        return {
          name,
          id,
          modal: serialNumber,
          description: describe,
        };
      });
      (this as any).leftList[0]._highlight = true;
      await (this as any).getModalAppList();
      // if ((this as any).table.list1.length === 0) {
      //   (this as any).isModelAppHasData = false;
      //   return;
      // }
      // (this as any).isModelAppHasData = true;;
    },
    getParams() {
      const p: any = {
        page: this.table.pageIndex - 1,
        size: this.table.pageSize,
      };
      if (this.modalAppName !== '') {
        p.viewToolName = this.modalAppName;
      }
      if (this.modalAppRegular !== '') {
        p.modelRule = this.modalAppRegular;
      }
      return p;

    },
    // 查询模型应用
    async getModalAppList() {
      const appParams = (this as any).getParams();
      appParams.id = (this as any).selectModelId;
      const result = await modalManageApi.getModalAppList(appParams);
      const data = result && result.data || [];
      if (data.content.length === 0) {
        // 让右侧显示为空
        (this as any).table.list1 = [];
        return;
      }
      // (this as any).isModelAppHasData = true;
      const resultArr = data.content.map(({modelContent = '', warn = '', viewToolId = '', viewToolName = '', modelRule = '', warnType = '', id = '', modelId = '', warnRemark = '', warnTitle = ''}: any) => {
        const conentArray = JSON.parse(modelContent);
        return {
          modelContent,
          name: viewToolName,
          regular: conentArray[0].replaceName || '',
          alarmSet: (this as any).transformCodeToSoft(warnType),
          id,
          viewToolId,
          remark: warnRemark,
          headTitle: warnTitle,
          warn: warn || '',
          modelId: (this as any).selectModelId,
        };
      });
      (this as any).table.list1 = [...resultArr];
      (this as any).table.list1[0]._highlight = true;
      (this as any).table.total = resultArr.length;
    },
    // 添加模型应用
    async addModalApp(params: any) {
      const result = await modalManageApi.addModalApp(params);
    },
    // 设置模型应用
    async setModalApp(params: any) {
      const result = await modalManageApi.setModalApp(params);
    },
    // 删除模型应用
    async deleteModalApp(id: any) {
      const result = await modalManageApi.deleteModalApp(id);
    },
    pageChange(pageNum: any) {
      (this as any).table.pageIndex = pageNum;
      this.getModalAppList();
    },
    pageSizeChange() {
      //
    },
    deleteElement() {
      (this as any).deleteModalApp((this as any).SelectElementId);
      (this as any).getModalList();
      (this as any).iSDeleteModal = false;
    },
    cancelElement() {
      //
    },
    transformCodeToSoft(codeString: string) {
      const codeArray: any = codeString.split(',');
      const array: any = [];
      codeArray.forEach((item: any) => {
        if (item === '1') {
          array.push('微信');
        } else if (item === '2') {
          array.push('KK');
        } else if (item === '3') {
          array.push('邮件');
        }
      });
      return array.join(',');
    },
  },
  activated() {
    (this as any).getModalList();
    console.log('activated');
    // (this as any).getModalAppList();
  },
});
</script>
<style lang="less">
.content-list {
  height: 700px;
  display: flex;
  .content-left {
    flex: 1;
    float: left;
    width: 472px;
    // width: 100%;
    .ivu-table thead th {
      background: #deeefe;
      height: 32px;
      font-size:14px;
      font-family:MicrosoftYaHei;
      font-weight:400;
      color:rgba(59,114,168,1);
    }

  }
  .full-row {
    width: 100%;
  }
  .content-right {
    flex: 2;
    // width: 620px;
    // float: right;
    margin-left: 40px;
    height:32px;
    background:rgba(222,238,254,1);
    border:1px solid rgba(197,208,212,1);
    border-radius:2px 2px 0px 0px;
    ul {
      width: 100%;
      list-style: none;
      height: 32px;
      li {
        float: left;
        height: 32px;
        line-height: 32px;
        text-align: left;
        font-size:14px;
        font-family:MicrosoftYaHei;
        font-weight:400;
        color:rgba(59,114,168,1);
      }
    }
    .middle-search {
      width: 100%;
      height:48px;
      background:rgba(234,238,242,1);
      border:1px solid rgba(235,240,242,1);
      input {
        height: 28px;
        margin: 10px 0 10px 7px;
      }
      .input-name {
        width: 168px;
      }
      .input-regular {
        width: 230px;
      }
    }
  }
}

</style>
