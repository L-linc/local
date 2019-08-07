<template>
  <div class="reportMana">
    <div v-if="tableData.length === 0 && firstTime" class="reportMana_nodata">
      <p class="no_report" @click="addReport">
        + 添加报表
      </p>
    </div>
    <div v-else class="report_mana">
      <div class="report_mana_top">
        <div>
          <Input prefix="ios-search" placeholder="请输入报表名称" style="width:180px;" v-model="searchValue"/>
          <Button type="primary" style="margin-left: 12px;" @click="search">搜 索</Button>
        </div>
        <div>
          <Button @click="addReport" style="color:#3B72A8;" v-has="'SYS_REPORT_ADD'">+ 添加报表</Button>
        </div>
      </div>
      <div class="report_mana_contain">
        <Table :columns="columns" :data="tableData"></Table>
      </div>
      <div class="report_mana_footer">
        <div class="footer_left_wrap">
          <Checkbox v-model="allCheck" @on-change="checkAll" style="margin-left: 20px;margin-right: 12px;font-size: 14px">全选</Checkbox>
          <div class="del_btn_wrap" @click="del" v-has="'SYS_REPORT_DEL'">
            <icon class="app_icon app_icon_del" style="margin-left: 0;"></icon>
            <span style="margin-left: 2px;">删除</span>
          </div>
        </div>
        <Page @on-change="getPage"
              @on-page-size-change="changePageSize"
              prev-text="上一页"
              next-text="下一页"
              style="float:left;margin-right:12px"
              :total="total"
              :current="pageIndex"
              show-total
              show-elevator
              show-sizer
        />
      </div>
    </div>
    <!-- 模拟剪贴板 -->
    <textarea readonly id="copy_text" style="position:absolute;left:-9999px"></textarea>
    <!-- 弹框 -->
    <Modal
      :title="modalTitle"
      v-model="add"
      >
      <Form ref="reportForm" :model="addForm" label-position="right" :label-width="100" :rules="ruleValidate">
        <FormItem label="报表名称 : " prop="name">
          <Input v-model="addForm.name" />
        </FormItem>
        <FormItem label="Link 地址 : " prop="url">
          <Input v-model="addForm.url" />
        </FormItem>
        <FormItem label="描述 : " prop="descript">
          <Input type="textarea" v-model="addForm.descript"/>
        </FormItem>
      </Form>
      <div slot="footer" style="display: flex;justify-content: center;">
        <Button type="primary" style="width:120px;height:42px;font-size:18px;" @click="handleAdd">提 交</Button>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import './appCenter.less';
import Vue from 'vue';
import appCenterApi from '@/api/appCenter.ts';
import {Component} from 'vue-property-decorator';
@Component
export default class ReportMana extends Vue {

  // data
  private total: number = 0; // 总条数
  private pageSize: number = 10; // 每页条数
  private pageIndex: number = 1; // 当前页码
  private totalPage: number = 1; // 总页数
  private tableData: any[] = []; // 表格数据
  private columns: any[] = [];
  private add: boolean = false; // 模态框显示
  private firstTime: boolean = true; // 模态框显示
  private allCheck: boolean = false; // 全选
  private addForm: any = {
    name: '',
    descript: '',
    url: '',
  }; // 表单数据
  private ruleValidate: any = {
    name: [
      { required: true, message: '请输入报表名称', trigger: 'blur' },
    ],
    // descript: [{ required: true, message: '请输入描述', trigger: 'blur' }],
    url: [{ required: true, message: '请输入link 地址', trigger: 'blur' }],
  }; // 表单数据验证
  private searchValue: string = ''; // 搜索框
  private modalTitle: string = '添加报表'; // 弹框

  // life-cycle
  private created() {
    this.columns = [
      {
        title: '报表名称',
        key: 'name',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
            },
          },
          [
            h('checkbox', {
              props: {
                value: params.row.checked, // 绑定当前row的checked属性,是否勾选
              },
              style: {
                marginRight: '4px',
              },
              nativeOn: {
                click: () => {
                  params.row.checked = !params.row.checked;
                  this.checkItem(params, params.index);
                },
              },
            }),
            h('span', {
              style: {
                display: 'inline',
              },
            }, params.row.name),
          ]);
        },
      },
      {
        title: '报表编号',
        key: 'symbol',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.symbol}}, params.row.symbol);
        },
      },
      {
        title: '描述',
        key: 'descript',
        align: 'left',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.descript}}, params.row.descript);
        },
      },
      {
        title: '操作',
        key: 'actions',
        align: 'right',
        width: 150,
        render: (h: any, params: any): any => {
          return h('div', [
            h('icon', {
              class: ['app_icon', 'app_icon_copy'],
              on: {
                click: (e: any) => {
                  for (const i of this.tableData) {
                    i.checked = false;
                  }
                  this.allCheck = false;
                  this.tableData[params.index].checked = true;
                  const copyText: any = document.getElementById('copy_text');
                  copyText.readOnly = false;
                  copyText.innerHTML = params.row.url;
                  copyText.select();
                  copyText.setSelectionRange(0, copyText.value.length);
                  document.execCommand('copy');
                  copyText.readOnly = true;
                  this.$Message.success(`复制 ${params.row.name} 成功!`);
                  // IE剪切板方法,由于安全问题,谷歌浏览器不支持
                  // window.clipboardData.setData('Text', params.row.url);
                },
              },
              directives: [{
                name: 'has',
                value: 'SYS_REPORT_COPY',
              }],
            }),
            h('icon', {
              class: ['app_icon', 'app_icon_search'],
              on: {
                click: () => {
                  for (const i of this.tableData) {
                    i.checked = false;
                  }
                  this.allCheck = false;
                  this.tableData[params.index].checked = true;
                  const param = {
                    id: params.row.id,
                  };
                  appCenterApi.getChart(param).then((res: any) => {
                    let url = params.row.url;
                    if (url.indexOf('http') === -1) {
                      url = 'http://' + url;
                    }
                    window.open(url, '_blank');
                  });
                },
              },
              directives: [{
                name: 'has',
                value: 'SYS_REPORT_DETAIL',
              }],
            }),
            h('icon', {
              class: ['app_icon', 'app_icon_edit'],
              on: {
                click: () => {
                  for (const i of this.tableData) {
                    i.checked = false;
                  }
                  this.allCheck = false;
                  this.tableData[params.index].checked = true;
                  this.modalTitle = '编辑报表';
                  this.add = true;
                  this.addForm = params.row;
                },
              },
              directives: [{
                name: 'has',
                value: 'SYS_REPORT_MOD',
              }],
            }),
            h('icon', {
              class: ['app_icon', 'app_icon_del'],
              on: {
                click: () => {
                  for (const i of this.tableData) {
                    i.checked = false;
                  }
                  this.allCheck = false;
                  this.tableData[params.index].checked = true;
                  const arr: any[] = [];
                  arr.push(params.row.id);
                  this.$Modal.confirm({
                    title: `确定删除 ${params.row.name} 吗?`,
                    onOk: () => {
                      this.delete(arr);
                    },
                  });
                },
              },
              directives: [{
                name: 'has',
                value: 'SYS_REPORT_DEL',
              }],
            }),
          ]);
        },
      },
    ];
    this.getTable();
  }

  // methods
  private getTable(isSearch?: string) {
    const params = {
      page: this.pageIndex - 1,
      size: this.pageSize,
      name: this.searchValue,
    };
    if (isSearch) {
      this.firstTime = false;
    }
    appCenterApi.getCharts(params).then((res: any) => {
      this.tableData = res.data.content;
      this.total = res.data.totalElements;
      for (const i of this.tableData) {
        this.$set(i, 'checked', false);
      }
      this.allCheck = false;
    });
  }
  // 添加报表,显示模态框
  private addReport() {
    this.modalTitle = '添加报表';
    this.addForm = {
      name: '',
      descript: '',
      url: '',
    };
    this.add = true;
  }

  // 添加报表/编辑报表
  private handleAdd() {
    const txt = this.addForm.descript.trim();
    if (txt.length > 200) {
      this.$Message.error('描述最多200个字符');
      return;
    }
    (this as any).$refs.reportForm.validate((valid: any) => {
      if (valid) {
        if (!this.addForm.id) {
          const params = {
            url: this.addForm.url,
            descript: this.addForm.descript,
            name: this.addForm.name,
          };
          appCenterApi.addChart(params).then((res: any) => {
            this.$Message.success('添加报表成功');
            this.add = false;
            this.getTable();
          });
        } else {
          const params = {
            url: this.addForm.url,
            descript: this.addForm.descript,
            name: this.addForm.name,
            id: this.addForm.id,
          };
          appCenterApi.editChart(params).then((res: any) => {
            this.pageIndex = 1;
            this.$Message.success('编辑报表成功');
            this.add = false;
            this.getTable();
          });
        }
      }
    });
  }

  // 搜索
  private search() {
    if (this.searchValue.length > 50) {
      this.$Message.error('只允许50个字符以内');
      return;
    }
    this.searchValue = this.searchValue.trim();
    this.pageIndex = 1;
    this.getTable('search');
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

  // 选中单个
  private checkItem(params: any, index: number) {
    this.tableData[index].checked = params.row.checked;
    for (const i of this.tableData) {
      if (!i.checked) {
        this.allCheck = false;
        break;
      } else {
        this.allCheck = true;
      }
    }
  }

  // 全选
  private checkAll(event: any) {
    if (this.allCheck) {
      for (const i of this.tableData) {
        i.checked = true;
      }
    } else {
      for (const i of this.tableData) {
        i.checked = false;
      }
    }
  }

  // 删除按钮
  private del() {
    const delArr: any[] = [];
    const arr: any[] = [];
    let delTitle = '';
    for (const i of this.tableData) {
      if (i.checked) {
        delArr.push(i);
      }
    }
    if (delArr.length === 0) {
      this.$Message.error('请至少选择一项');
      return;
    } else if (delArr.length === 1) {
      delTitle = delArr[0].name;
    } else {
      delTitle = '所有选中的报表';
    }
    for (const i of delArr) {
      arr.push(i.id);
    }
    this.$Modal.confirm({
      title: `确定删除 ${delTitle} 吗?`,
      onOk: () => {
        this.delete(arr);
      },
    });
  }

  private delete(arr: any) {
    const params = {
      ids: arr,
    };
    appCenterApi.delCharts(params).then((res: any) => {
      this.$Message.success('删除成功');
      this.pageIndex = 1;
      this.getTable();
    });
  }

}
</script>
