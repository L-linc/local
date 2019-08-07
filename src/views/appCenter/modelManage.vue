<template>
  <div class="modelMana">
    <div class="model_mana_top">
      <div>
        <Input prefix="ios-search" placeholder="搜索" style="width:180px;" v-model="searchValue"/>
        <Button type="primary" style="margin-left: 12px;" @click="search">搜 索</Button>
      </div>
      <div>
        <Button @click="addModel" style="color:#3B72A8;" v-has="'SYS_MODEL_ALL'">+ 添加模型</Button>
      </div>
    </div>
    <div class="model_mana_contain">
      <div class="left_model">
        <Table 
          :columns="left" 
          :data="leftTable" 
          @on-row-click="getModelAppLists" 
          @on-current-change="getCurrModelId" 
          stripe 
          max-height="640" 
          highlight-row 
          disabled-hover></Table>
      </div>
      <div class="right_model">
        <Table :columns="right" :data="fakeTable" stripe></Table>
        <Table :columns="right" :data="rightTable" stripe border :show-header="false"></Table>
        <div class="model_mana_footer">
          <Page @on-change="getPage" @on-page-size-change="changePageSize" prev-text="上一页" next-text="下一页" style="float:right;margin-right:12px" :total="total" :current="modelAppPage" show-total show-elevator show-sizer/>
        </div>
      </div>
    </div>
    <Modal
      v-model="delModelApp"
      >
      <p style="font-size:16px;text-align: center;margin: 20px 0;">确定删除 {{delTitle}} 吗?</p>
      <div slot="footer" style="display: flex;justify-content: center;margin: 20px 0;">
        <Button type="primary" style="width:84px;height:42px;font-size:18px;" @click="ojbk">是</Button>
        <Button style="width:84px;height:42px;font-size:18px;" @click="nmsl">否</Button>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import './appCenter.less';
import Vue from 'vue';
import appCenterApi from '@/api/appCenter.ts';
import modalManageApi from '@/api/modalManage.ts';
import {Component} from 'vue-property-decorator';
@Component
export default class ModelMana extends Vue {

  // data
  private searchValue: string = ''; // 搜索框
  private leftTable: any[] = []; // 左边table数据
  private left: any[] = []; // 左边table列表
  private rightTable: any[] = []; // 右边table数据
  private right: any[] = []; // 右边table列表
  private fakeTable: any[] = []; // 右边table假数据
  private modelAppName: string = ''; // 模型应用名称-table搜索框
  private modelAppRole: string = ''; // 模型应用规则-table搜索框
  private modelAppPage: number = 1; // 右边table分页
  private modelAppPageSize: number = 10; // 右边table分页数量
  private total: number = 0; // 右边table总数
  private currModelId: string = ''; // 当前选中行的id
  private warnTypeList: any[] = []; // 通知方式
  private delModelApp: boolean = false;
  private delTitle: string = ''; // 删除模态框标题
  private viewToolId: string = '';

  // life-cycle
  private activated() {
    this.getModelAppLists();
  }
  private created() {
    this.fakeTable = [
      {
        fake: true,
      },
    ];
    this.left = [
      {
        title: '模型名称',
        key: 'name',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.name}}, params.row.name);
        },
      },
      {
        title: '模型编号',
        key: 'serialNumber',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.serialNumber}}, params.row.serialNumber);
        },
      },
      {
        title: '描述',
        key: 'describe',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.describe}}, params.row.describe);
        },
      },
      {
        title: '操作',
        key: 'actions',
        align: 'right',
        width: 100,
        render: (h: any, params: any): any => {
          if (!params.row.status) {
            return h('div', [
              h('icon', {
                class: ['app_icon', 'app_icon_release'],
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                    this.release(params.row.id);
                  },
                },
                // directives: [{
                //   name: 'has',
                //   value: 'SYS_APP_DETAIL',
                // }],
              }),
              h('icon', {
                class: ['app_icon', 'app_icon_search'],
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                    const href = `${location.protocol}//${location.hostname}:${location.port}/modelingTool`;
                    window.open(href, '_blank');
                  },
                },
                // directives: [{
                //   name: 'has',
                //   value: 'SYS_APP_MOD',
                // }],
              }),
            ]);
          } else {
            return h('div', [
              h('icon', {
                class: ['app_icon', 'app_icon_add'],
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                    this.$router.push({name: 'modelManageDetail', query: {status: 'add', ojbk: params.row}});
                    const a: any = sessionStorage.getItem('oldTab');
                    const b: any = sessionStorage.getItem('tabIndex');
                    const c: any = JSON.stringify(params.row);
                    const d: any = JSON.parse(a);
                    d[b].current = c;
                    d[b].status = 'add';
                    sessionStorage.setItem('oldTab', JSON.stringify(d));
                  },
                },
                directives: [{
                  name: 'has',
                  value: 'SYS_MODEL_ADD',
                }],
              }),
              h('icon', {
                class: ['app_icon', 'app_icon_search'],
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                    const href = `${location.protocol}//${location.hostname}:${location.port}/modelingTool?type=model&id=${params.row.id}`;
                    window.open(href, '_blank');
                  },
                },
                // directives: [{
                //   name: 'has',
                //   value: 'SYS_APP_MOD',
                // }],
              }),
            ]);
          }
        },
      },
    ];
    this.right = [
      {
        title: '模型应用名称',
        key: 'name',
        align: 'left',
        width: 180,
        render: (h: any, params: any): any => {
          if (params.row.fake) {
            return h('Input', {
                attrs: {
                  placeholder: '请输入名称',
                },
                on: {
                  'on-blur': (event: any) => {
                    this.modelAppName = event.target.value;
                    this.searchModelAppName();
                  },
                  'on-enter': (event: any) => {
                    this.modelAppName = event.target.value;
                    this.searchModelAppName();
                  },
                },
              },
            );
          } else {
            if (!params.row.viewToolName) {
              return h('span', '/');
            } else {
              return h('span', {attrs: {title: params.row.viewToolName}}, params.row.viewToolName);
            }
          }
        },
      },
      {
        title: '模型应用规则',
        key: 'name',
        align: 'left',
        render: (h: any, params: any): any => {
          if (params.row.fake) {
            return h('Input', {
                attrs: {
                  placeholder: '请输入应用规则',
                },
                on: {
                  'on-blur': (event: any) => {
                    this.modelAppRole = event.target.value;
                    this.searchModelAppRole();
                    // event.target.value = '';
                  },
                  'on-enter': (event: any) => {
                    this.modelAppRole = event.target.value;
                    this.searchModelAppRole();
                    // event.target.value = '';
                  },
                },
              },
            );
          } else {
            const rule = JSON.parse(params.row.modelContent)[0].replaceName;
            return h('span', {attrs: {title: rule}}, rule);
          }
        },
      },
      {
        title: ' ',
        key: 'name',
        align: 'left',
        width: 150,
        render: (h: any, params: any): any => {
          if (params.row.fake) {
            return h('span', '');
          } else {
            const txt = params.row.warnType.split(',');
            const label = txt.reduce((pre: any[], ele: any) => {
              let name = '';
              this.warnTypeList.map((eles: any) => {
                if (ele === eles.id) {
                  name = eles.warnType;
                }
              });
              return pre.concat(name);
            }, []).join(' ');
            return h('span', {attrs: {title: label}}, label);
          }
        },
      },
      {
        title: '操作',
        key: 'actions',
        align: 'right',
        width: 100,
        render: (h: any, params: any): any => {
          if (params.row.fake) {
            return h('span', '');
          } else {
            return h('div', [
              h('icon', {
                class: ['app_icon', 'app_icon_set'],
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                    this.$router.push({name: 'modelManageDetail', query: {status: 'edit', ojbk: params.row}});
                    const a: any = sessionStorage.getItem('oldTab');
                    const b: any = sessionStorage.getItem('tabIndex');
                    const c: any = JSON.stringify(params.row);
                    const d: any = JSON.parse(a);
                    d[b].current = c;
                    d[b].status = 'edit';
                    sessionStorage.setItem('oldTab', JSON.stringify(d));
                  },
                },
                directives: [{
                  name: 'has',
                  value: 'SYS_MODEL_MOD',
                }],
              }),
              h('icon', {
                class: ['app_icon', 'app_icon_del'],
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                    this.delModelApp = true;
                    this.delTitle = !params.row.viewToolName ? '该模型' : params.row.viewToolName;
                    this.viewToolId = params.row.id;
                  },
                },
                directives: [{
                  name: 'has',
                  value: 'SYS_MODEL_DEL',
                }],
              }),
            ]);
          }
        },
      },
    ];
    this.getTable();
    this.getAlarmTypes();
  }


  // methods
  // 获取报警方式
  private getAlarmTypes() {
    modalManageApi.getAlarmType().then((res: any) => {
      this.warnTypeList = res.data;
    });
  }

  // 获取模型table表格
  private getTable() {
    const param = {
      name: this.searchValue,
      isPublish: 1,
    };
    appCenterApi.getModelList(param).then((res: any) => {
      this.leftTable = res.data;
      this.leftTable[0]._highlight = true; // 默认选中第一项
      this.currModelId = this.leftTable[0].id; //
      this.getModelAppLists();
    });
  }
  // 根据模型ID查询模型应用
  private getModelAppLists() {
    const param = {
      id: this.currModelId,
      viewToolName: this.modelAppName,
      modelRule: this.modelAppRole,
      page: this.modelAppPage - 1,
      size: this.modelAppPageSize,
    };
    appCenterApi.getModelAppList(param).then((res: any) => {
      this.rightTable = res.data.content;
      this.total = res.data.totalElements;
    });
  }
  // 搜索框
  private search() {
    this.rightTable = [];
    this.modelAppPage = 1;
    this.getTable();
  }
  // 添加模型
  private addModel() {
    const href = `${location.protocol}//${location.hostname}:${location.port}/modelingTool`;
    window.open(href, '_blank');
  }
  // 右边table第一个搜索框
  private searchModelAppName() {
    this.getModelAppLists();
  }
  // 右边table第二个搜索框
  private searchModelAppRole() {
    this.getModelAppLists();
  }
  // 右边table切换
  private getPage(page: number) {
    this.modelAppPage = page;
    this.getModelAppLists();
  }
  // 右边table选择页面当前条数
  private changePageSize(pagesize: number) {
    this.modelAppPageSize = pagesize;
    this.modelAppPage = 1;
    this.getModelAppLists();
  }
  // 确定删除
  private ojbk() {
    const param = {
      modelToolId: this.viewToolId,
    };
    appCenterApi.deleteModelApp(param).then(() => {
      this.delModelApp = false;
      this.getModelAppLists();
    });
  }
  // 关闭弹框
  private nmsl() {
    this.delModelApp = false;
  }
  // 发布模型
  private release(id: string) {
    const param = {
      id,
    };
    appCenterApi.getModelPublish(param).then(() => {
      this.$Message.success('发布成功');
      this.getTable();
    });
  }
  // 选中高亮时保存当前选中行模型id
  private getCurrModelId(data1: any, data2: any) {
    this.currModelId = data1.id;
    if (data1 !== data2) {
      this.modelAppName = '';
      this.modelAppRole = '';
    }
  }
}
</script>
