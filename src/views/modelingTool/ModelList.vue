<template>
  <div class="list_wrap">
    <Table :columns="columnsData" :data="currentTableData"></Table>
    <div class="page_box">
        <span class="total_txt">当前<em>{{(pageIndex - 1) * pageSize + 1}}-{{pageIndex  * pageSize > pageTotal ? pageTotal : pageIndex  * pageSize}}</em>个模型, 共 {{pageTotal}} 个</span>
        <Page :total="pageTotal" :page-size="pageSize" :current="pageIndex" @on-change="changePageIndex" />
    </div>
    <Modal
        v-model="addFlag"
        class-name="model_modal"
        title="编辑模型"
        :loading="true"
        width="460px"
        @on-ok="toEditSubmit"
        @on-cancel="closeModal">       
        <div class="add_label"><span class="label_name">模型名称：</span><Input v-model="editName" placeholder="模型名称" /></div>
        <!-- <div class="add_label"><span class="label_name">模型描述：</span><Input type="textarea" v-model="editDsc" placeholder="模型描述" /></div> -->
    </Modal>
  </div>
</template>
<script lang="ts">
import './modelingTool.less';
import Vue from 'vue';
import moToolApi from '@/api/modelingTool.ts';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as util from '../../config/utils';
@Component
export default class ModelList extends Vue {
  @Prop({
      type: Array,
      default: () => {
          return [];
      },
  })
  private modelListData: any;  //  props

  private columnsData: any = [
    {
      title: '模型名称',
      key: 'name',
      render: (h: any, params: any): any => {
        if (params.row.type === 'search') {
          return h('div', [
                  h('Input', {
                      attrs: {
                        suffix: 'ios-search',
                        placeholder: '搜索',
                        value: params.row.name,
                      },
                      on: {
                        'on-blur': (event: any) => {
                          this.searchHandle(event.target.value);
                        },
                        'on-enter': (event: any) => {
                          this.searchHandle(event.target.value);
                        },
                      },
                  }),
                ]);
        } else {
          return h('div', params.row.name);
        }
      },
    },
    {
      title: '描述',
      key: 'describe',
    },
    {
      title: '更新时间',
      key: 'updateTime',
      render: (h: any, params: any): any => {
        if (params.row.updateTime) {
          return h('div', util.timeFormate(params.row.updateTime));
        } else {
          return '';
        }
      },
    },
    {
      title: '状态',
      key: 'status',
      render: (h: any, params: any): any => {
        let staTxt = '';
        if (params.row.status === 1) {
          staTxt = '已发布';
        } else if (params.row.status === 2) {
          staTxt = '应用中';
        } else if (params.row.status === 0) {
          staTxt = '未发布';
        }
        return h('div', staTxt);
      },
    },
    {
      title: '操作',
      key: 'opear',
      render: (h: any, params: any): any => {
        if (params.row.status === 1) {
          return h('div', [
                    h('Icon', {
                      props: {
                        type: 'ios-create-outline',
                        size: '24',
                      },
                      style: {
                        cursor: 'pointer',
                      },
                      on: {
                        click: () => {
                          this.toEditHandle(params.row);
                        },
                      },
                    }),
                    h('Icon', {
                      props: {
                        type: 'ios-trash-outline',
                        size: '24',
                      },
                      style: {
                        cursor: 'pointer',
                        margin: '0 12px',
                      },
                      on: {
                        click: () => {
                          this.toDeleteHandle(params.row);
                        },
                      },
                    }),
                ]);
        } else if (params.row.status === 2) {
          return h('div', [
                    h('Icon', {
                      props: {
                        type: 'ios-search',
                        size: '24',
                      },
                      style: {
                        cursor: 'pointer',
                      },
                      on: {
                        click: () => {
                          this.toShowModel(params.row);
                        },
                      },
                    }),
                    h('Icon', {
                        props: {
                          type: 'ios-trash-outline',
                          size: '24',
                        },
                        style: {
                          cursor: 'pointer',
                          margin: '0 12px',
                        },
                        on: {
                          click: () => {
                            this.toDeleteHandle(params.row);
                          },
                        },
                    }),
                ]);
        } else if (params.row.status === 0) {
          return h('div', [
                    h('Icon', {
                      props: {
                        type: 'ios-paper-plane-outline',
                        size: '24',
                      },
                      style: {
                        cursor: 'pointer',
                      },
                      on: {
                        click: () => {
                          this.toPublishHandle(params.row);
                        },
                      },
                      directives: [{
                        name: 'has',
                        value: 'SYS_MODEL_PUSH',
                      }],
                    }),
                    h('Icon', {
                      props: {
                        type: 'ios-create-outline',
                        size: '24',
                      },
                      style: {
                        cursor: 'pointer',
                        margin: '0 12px',
                      },
                      on: {
                        click: () => {
                          this.toEditHandle(params.row);
                        },
                      },
                    }),
                    h('Icon', {
                      props: {
                        type: 'ios-trash-outline',
                        size: '24',
                      },
                      style: {
                        cursor: 'pointer',
                      },
                      on: {
                        click: () => {
                          this.toDeleteHandle(params.row);
                        },
                      },
                    }),
                ]);
        }
      },
    },
  ];  // 表格column;
  private tableData: any = []; // 表格data;
  private pageTotal: number = 0; // 表格条数总数;
  private pageIndex: number = 1; // 表格当前页数,从1开始;
  private pageSize: number = 15; // 表格每页显示的条数;
  private addFlag: boolean = false; // 编辑弹窗;
  private editName: string = ''; // 编辑名称
  private editDsc: string = ''; // 编辑描述
  private editLi: any = null; // 编辑列项
  private searchName: string = ''; // 搜索回显

  get currentTableData() {
    const {pageIndex, pageSize, tableData} = this;
    const sliceStart = (pageIndex - 1) * pageSize;
    const sliceEnd = pageIndex * pageSize;
    const data = tableData.slice(sliceStart, sliceEnd);
    return [{type: 'search', name: this.searchName}, ...data];
  }

  @Watch('modelListData')
  private onChangeModelListData() {
    this.tableData = this.modelListData;
    this.pageTotal = this.modelListData.length;
  }

  @Watch('saveCount')
  private onChangeSaveCount() {
    // this.tableData = this.modelListData;
    // this.pageTotal = this.modelListData.length;
    this.$Message.success('保存成功');
  }

  private created() {
    this.tableData = this.modelListData;
    this.pageTotal = this.modelListData.length;
  }

  private changePageIndex(page: number) {
    // 切换表格;
    this.pageIndex = page;
  }

  private toEditHandle(data: any = {}) {
    // 编辑控制
    this.editName = data.name;
    // this.editDsc = data.describe;
    this.addFlag = true;
    this.editLi = data;
  }

  private toEditSubmit() {
    const editLi = this.editLi;
    const params = {
      id: editLi.id,
      name: this.editName,
    };
    moToolApi.reNameModel(params).then((res: any = {}) => {
      this.$Message.success('编辑成功');
      this.closeModal();
      this.$emit('getModalList');
      this.$emit('checkSave', true);
    });
  }

  private closeModal() {
    this.addFlag = false;
  }

  private toDeleteHandle(data: any = {}) {
    // 删除控制
    (this as any).$Modal.confirm({
      title: `删除模型`,
      content: `<p>是否确定删除模型：${data.name}？</p>`,
      loading: true,
      onOk: () => {
        const params = {
            id: data.id,
        };
        moToolApi.deleteModel(params).then((res: any) => {
            this.$Message.success('删除成功');
            this.$Modal.remove();
            this.$emit('getModalList');
            this.$emit('checkSave', true);
        }, () => {
          this.$Modal.remove();
        });
      },
    });
  }

  private toPublishHandle(data: any = {}) {
    // 发布控制
    this.$Modal.confirm({
      title: `发布模型`,
      content: `<p>是否确定发布模型：${data.name}？</p>`,
      loading: true,
      onOk: () => {
        const params = {
            id: data.id,
        };
        moToolApi.publishModel(params).then((resLi: any) => {
          this.$Message.success('发布成功');
          this.$Modal.remove();
          this.$emit('getModalList');
          this.$emit('checkSave', true);
        }, () => {
          this.$Modal.remove();
        });
      },
    });
  }

  private searchHandle(val: string) {
    // 搜索控制
    val = val.trim();
    const newArr: any = [];
    this.searchName = val;
    if (!val) {
      this.tableData = this.modelListData;
      this.pageTotal = this.modelListData.length;
      this.pageIndex = 1;
      return;
    }
    this.modelListData.map((ele: any) => {
      if (ele.name.indexOf(val) !== -1) {
        newArr.push(ele);
      }
    });
    this.tableData = newArr;
    this.pageTotal = newArr.length;
    this.pageIndex = 1;
  }

  private toShowModel(data: any) {
    // 显示模型
    this.$emit('selectPage', data, 'model');
  }

}
</script>


