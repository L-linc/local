<template>
  <div class="appMana">
    <div class="app_mana_top">
      <div>
        <Input prefix="ios-search" placeholder="请输入应用名称" style="width:180px;" v-model="searchValue"/>
        <Button type="primary" style="margin-left: 12px;" @click="search">搜 索</Button>
      </div>
      <div>
        <Button @click="addApp" style="color:#3B72A8;" v-has="'SYS_APP_ADD'">+ 添加应用</Button>
      </div>
    </div>
    <div class="app_mana_contain">
      <Table :columns="columns" :data="tableData"></Table>
    </div>
    <div class="app_mana_footer">
      <Page @on-change="getPage" @on-page-size-change="changePageSize" prev-text="上一页" next-text="下一页" style="float:left;margin-right:12px" :total="total" :current="pageIndex" show-total show-elevator show-sizer/>
    </div>
  </div>
</template>

<script lang="ts">
import './appCenter.less';
import Vue from 'vue';
import appCenterApi from '@/api/appCenter.ts';
import * as utils from '@/config/utils';
import {Component} from 'vue-property-decorator';
@Component
export default class AppMana extends Vue {

  // data
  private searchValue: string = '';
  private total: number = 0; // 总条数
  private pageSize: number = 10; // 每页条数
  private pageIndex: number = 1; // 当前页码
  private totalPage: number = 1; // 总页数
  private tableData: any[] = [];
  private columns: any[] = [];
  private curUseId: string = '';

  // life-cycle
  private created() {
    this.columns = [
      {
        title: '应用名称',
        key: 'name',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.name}}, params.row.name);
        },
      },
      {
        title: '应用编号',
        key: 'serialNumber',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.serialNumber}}, params.row.serialNumber);
        },
      },
      {
        title: '页面',
        key: 'applyCon',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.applyCon}}, params.row.applyCon);
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
        title: '模型',
        key: 'models',
        align: 'left',
        render: (h: any, params: any): any => {
          let str = '';
          if (params.row.models) {
            str = params.row.models.join(', ');
            return h('Tooltip',
              {
                attrs: {
                  content: str,
                  // offset: -30, // 设置偏移量
                  placement: 'bottom-start',
                  maxWidth: 300,
                },
              },
              [
                h('p', {
                    style: {
                      cursor: 'pointer',
                      width: '300px',
                      height: '21px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    },
                  }, str,
                ),
              ],
            );
          } else {
            return h('span', str);
          }
        },
      },
      {
        title: '创建者',
        key: 'createUser',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.createUser}}, params.row.createUser);
        },
      },
      {
        title: '操作',
        key: 'actions',
        align: 'right',
        width: 150,
        render: (h: any, params: any): any => {
          let curFunc = [];
          if (params.row.createUser === this.curUseId) {
            curFunc = [
              h('icon', {
                class: ['app_icon', 'app_icon_search'],
                on: {
                  click: () => {
                    // 查看,跳转界面工具
                    const href = `/interface/preview.html?id=${params.row.id}`;
                    window.open(href, '_blank');
                  },
                },
                attrs: {
                  title: '查看',
                },
                directives: [{
                  name: 'has',
                  value: 'SYS_APP_DETAIL',
                }],
              }),
              h('icon', {
                class: ['app_icon', 'app_icon_edit'],
                attrs: {
                  title: '编辑',
                },
                on: {
                  click: () => {
                    // 编辑,跳转界面工具
                    const href = `/interface/?id=${params.row.id}`;
                    window.open(href, '_blank');
                  },
                },
                directives: [{
                  name: 'has',
                  value: 'SYS_APP_MOD',
                }],
              }),
              h('icon', {
                class: ['app_icon', 'app_icon_del'],
                attrs: {
                  title: '删除',
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '确定删除该应用？',
                      content: '<p></p>',
                      onOk: () => {
                        const param = {
                          id: params.row.id,
                        };
                        appCenterApi.delApp(param).then((res: any) => {
                          this.$Message.info('删除成功');
                          this.pageIndex = 1;
                          this.getTable();
                        });
                      },
                    });
                  },
                },
                directives: [{
                  name: 'has',
                  value: 'SYS_APP_DEL',
                }],
              }),
            ];
          } else {
            curFunc = [
              h('icon', {
                class: ['app_icon', 'app_icon_search'],
                on: {
                  click: () => {
                    // 查看,跳转界面工具
                    const href = `/interface/preview.html?id=${params.row.id}`;
                    window.open(href, '_blank');
                  },
                },
                attrs: {
                  title: '查看',
                },
                directives: [{
                  name: 'has',
                  value: 'SYS_APP_DETAIL',
                }],
              }),
            ];
          }
          if (params.row.status === 0) {
            return h('div', [
              h('icon', {
                class: ['app_icon_release'],
                on: {
                  click: () => {
                    this.release(params.row);
                  },
                },
                attrs: {
                  title: '发布',
                },
                directives: [{
                  name: 'has',
                  value: 'SYS_APP_PUSH',
                }],
              }),
            ].concat(...curFunc));
          } else {
            return h('div', [].concat(...curFunc));
          }
        },
      },
    ];
    this.getTable();
    this.curUseId = utils.getUserId().userName;
  }
  private activated() {
    this.getTable();
    this.curUseId = utils.getUserId().userName;
  }

  // methods
  private getTable() {
    const {pageIndex, pageSize, searchValue} = this;
    const params = {
      page: pageIndex - 1,
      size: pageSize,
      name: searchValue,
      describe: '',
    };
    appCenterApi.getAppList(params).then((res: any) => {
      this.tableData = res.data.content;
      this.total = res.data.totalElements;
    });
  }
  private release(data: any) {
    const params = {
      id: data.id,
      push: 1,
    };
    appCenterApi.releaseApp(params).then((res: any) => {
      this.$Message.info('发布成功');
      this.getTable();
    });
  }
  private search() {
    if (this.searchValue.length > 50) {
      this.$Message.error('只允许50个字符以内');
      return;
    }
    this.searchValue = this.searchValue.trim();
    this.pageIndex = 1;
    this.getTable();
  }
  private addApp() {
    const href = `/interface/`;
    window.open(href, '_blank');
  }
  private getPage(page: number) {
    this.pageIndex = page;
    this.getTable();
  }

  private changePageSize(pagesize: number) {
    this.pageSize = pagesize;
    this.pageIndex = 1;
    this.getTable();
  }
}
</script>
