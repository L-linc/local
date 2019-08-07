<template>
  <div class="modelToolManage" style="display: flex">
    <div class="content">
      <div class="content-list1">
        <div class="content-right">
          <ul class="content-right-list title">
            <li v-for="(item, index) in titleList" :key="index">{{item}}</li>
            <li class="grid">操作</li>
          </ul>
          <div class="middle-search">
            <slot name="input"></slot>
            <div v-if="isShowAddButton">
              <span @click="addElement" class="addField">添加字段</span>
            </div>
          </div>
          <div class="content">
            <ul class="content-right-list" :class="{activeClass: isActiveIndex === parentIndex}"  v-for="(parentItem, parentIndex) in showListData" :key="parentIndex" @click="getItemModel(parentItem, parentIndex)">
              <li class="grid" v-for="(item, childIndex) in parentItem.params" :key="childIndex">
                <span class="readContent" :title="item.value"
                  v-if="item.wordType ==='span'"
                  @dblclick="setWrite(parentIndex, childIndex, parentItem, item)"
                >{{item.value}}</span>
                <input
                  type="input"
                  ref='editInput'
                  name
                  id="only"
                  @keyup.enter="setInfo()"
                  @click.stop=""
                  @blur="setReadOnly(parentIndex, childIndex, parentItem, item)"
                  @on-change.stop="onchange"
                  @on-open-change.stop="onopen"
                  v-model="editValue"
                  v-else-if="item.wordType === 'input'"
                >
                <div id="only" ref='editSelect' @click.stop="" v-else-if="item.wordType === 'select'">
                  <Select v-model="editValue" class="select-item">
                    <Option v-for="item in typeCollect"  :value="item.label" :key="item.id">{{ item.label }}</Option>
                  </Select>
                </div>
              </li>
              <li class="handle-icon">
                <span class="edit-row" @click.stop="editHandle(parentItem, parentIndex)"></span>
                <span class="delete-row" @click.stop="deleteHandle(parentItem, parentIndex)"></span>
              </li>
            </ul>
          </div>
          <div class="page-mark" v-if="pageSize === 15">
              <div class="page-left">当前{{filterData.length === 0 ? 0 : prePage}} - {{filterData.length > 15 ? endPage : filterData.length}}个{{configType === 'param' ? '参数' : '变量'}}, 共{{filterData.length}}个</div>
              <Page :total="filterData.length" :page-size="pageSize" @on-change="changePage" :current="currentPage" class="page-right"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component
export default class ModelToolConfig extends Vue {
  @Prop({
    type: Number,
    default: -1,
  })
  private addCount: any;

  @Prop({
    type: Object,
    default: {
      name: '',
      title: '',
    },
  })
  private filterinfo: any;

  @Prop({
    type: String,
    default: '',
  })
  private configType: any;

  @Prop({
    type: Object,
    default: () => {
      return {};
    },
  })
  private library: any;

  @Prop({
      type: Boolean,
      default: false,
  })
  private isShowAddButton: any;

  @Prop({
    type: Number,
    default: 15,
  })
  private pageSize: any;

  @Prop({
    type: Array,
    default: [
        '字段名',
        '标题',
        '数据类型',
    ],
  })
  private titleList: any;

  @Prop({
    type: Array,
    default: [],
  })
  private listData: any;

  @Prop({
    type: Object,
    default: {},
  })
  private blankElement: any;
  private editValue: any;
  private isActiveIndex: number = 0;
  private currentPage: number = 1;
  private dataType: string = '';
  private wordType: string = 'span';
  private selectedIndex: any = {
    parentIndex: 0,
    childIndex: 0,
  };
  private params: string = '请输入标题';
  private typeCollect: any = [
      {
          id: '0',
          label: '请选择',
      },
      {
          id: '1',
          label: 'TINYINT',
      },
      {
          id: '2',
          label: 'SMALLINT',
      },
      {
          id: '3',
          label: 'INT',
      },
      {
          id: '4',
          label: 'BIGINT',
      },
      {
          id: '5',
          label: 'FLOAT',
      },
      {
          id: '6',
          label: 'DOUBLE',
      },
      {
          id: '7',
          label: 'DECIMAL',
      },
      {
          id: '8',
          label: 'VARCHAR(n)',
      },
      {
          id: '9',
          label: 'STRING',
      },
  ];
  private model1: string = '';
  private showListData: any = [];
  private filterListData: any = [];

  // 过滤信息
  private filterData: any = [];

  get prePage() {
    return  (this.currentPage - 1) * (this.pageSize) + 1;
  }

  get endPage() {
    const long = Math.ceil(this.listData.length / this.pageSize);
    if (long === this.currentPage) {
      return this.listData.length;
    }
    return (this.currentPage - 1) * this.pageSize + this.pageSize;
  }

  @Watch('addCount')
  private addCountChange() {
    if (this.library.isAct) {
      this.addElement();
    }
  }

  @Watch('filterinfo')
  private filterinfoChange() {
    const {
      name,
      title,
    } = this.filterinfo ;
    this.filterData = this.listData.filter((val: any) => {
      if (val.params.length > 1 && val.params[0].value.indexOf(name) !== -1 && val.params[1].value.indexOf(title) !== -1) {
        return true;
      } else if (val.params.length === 1 && val.params[0].value.indexOf(name) !== -1) {
        return true;
      }
    });
    // 获取数据
    let showListData = this.filterData.slice((this.currentPage - 1) * this.pageSize, (this.currentPage - 1) * this.pageSize + this.pageSize);
    this.showListData = showListData;
    if (this.showListData.length === 0) {
      if (this.currentPage === 1) {
        // this.currentPage === 1;
      } else {
        this.currentPage = this.currentPage - 1;
      }
      showListData = this.filterData.slice((this.currentPage - 1) * this.pageSize, (this.currentPage - 1) * this.pageSize + this.pageSize);
      this.showListData = showListData;
    }
  }
  @Watch('listData')
  private listDataChange() {
    const {
      name,
      title,
    } = this.filterinfo;

    this.filterData = this.listData.filter((val: any) => {
      if (val.params.length > 1 && val.params[0].value.indexOf(name) !== -1 && val.params[1].value.indexOf(title) !== -1) {
        return true;
      } else if (val.params.length === 1 && val.params[0].value.indexOf(name) !== -1) {
        return true;
      }
    });
    let showListData = this.filterData.slice((this.currentPage - 1) * this.pageSize, (this.currentPage - 1) * this.pageSize + this.pageSize);
    this.showListData = showListData;
    if (this.showListData.length === 0) {
      if (this.currentPage === 1) {
        // this.currentPage === 1;
      } else {
        this.currentPage = this.currentPage - 1;
      }
      showListData = this.filterData.slice((this.currentPage - 1) * this.pageSize, (this.currentPage - 1) * this.pageSize + this.pageSize);
      this.showListData = showListData;
    }
    // return {
    //   handler() {
    //   },
    //   deep: true
    // }
  }
  private getItemModel(item: any, index: any) {
    this.isActiveIndex = index;
    this.$emit('getItemModel', {item, index});
  }
  private setWrite(parentIndex: any, index: any, parentItem: any, item: any) {
    // if (parentItem.index === parentIndex && item.index === index) {
      if (item.hasOption) {
        item.wordType = 'select';
      } else {
        item.wordType = 'input';
        this.$nextTick(() => {
          (this as any).$refs.editInput[0].focus();
        });
      }
      this.selectedIndex = {
        parentIndex,
        childIndex: index,
      };
      this.editValue = item.value;
      return;
    // }
  }
  private setReadOnly(parentIndex: any, index: any, parentItem: any, item: any) {
    if (parentItem.index === parentIndex && item.index === index) {
      this.selectedIndex = {
        parentIndex,
        childIndex: index,
      };
    }
  }
  private editHandle(item: any, index: any) {
    const index1 = index + (this.currentPage - 1) * this.pageSize;
    this.$emit('editHandle', item, index1);
  }
  private deleteHandle(item: any, index: any) {
    const index1 = index + (this.currentPage - 1) * this.pageSize;
    this.$emit('deleteHandle', {item, index: index1});
  }
  private addElement() {
    this.currentPage = 1;
    const el = JSON.parse(JSON.stringify(this.blankElement));
    let numberList = [];
    let reg: RegExp = /^新变量([0-9]+)$/;
    if (this.configType === 'variable') {
      reg = /^新变量([0-9]+)$/;
    } else if (this.configType === 'field') {
      reg = /^新字段([0-9]+)$/;
    } else if (this.configType === 'param') {
      reg = /^新参数([0-9]+)$/;
    }
    for (const item of this.listData) {
      const value = reg.exec(item.params[0].value);
      if (value) {
        numberList.push(parseFloat(value[1]));
      }
    }
    numberList = numberList.sort((a, b) => a - b);
    numberList = [...new Set(numberList)];
    let newNum = 1;
    for (let i = 0; i < numberList.length + 1; i++) {
      if (i + 1 !== numberList[i]) {
        newNum = i + 1;
        break;
      }
    }
    el.params[0].value += newNum;
    this.listData.unshift(el);
    for (let i = 0; i <  this.listData.length; i++) {
      this.listData[i].index = i;
    }
    const showListData = this.listData.slice(0, this.pageSize);
    this.showListData = showListData;
    this.getItemModel(this.showListData[0], 0);
    this.$emit('checkSave', true);
  }
  private changePage(pageNumber: number) {
    this.currentPage = pageNumber;
    // 分页
    const showListData = this.listData.slice((pageNumber - 1) * this.pageSize, (pageNumber - 1) * this.pageSize + this.pageSize);
    this.showListData = showListData;
  }

  private setInfo(e: any) {
    const tempParentIndex = this.selectedIndex.parentIndex;
    const childIndex = this.selectedIndex.childIndex;
    if (this.listData.length === 0) {
      return;
    }
    const selectElement = this.showListData[tempParentIndex].params;
    // 判断是否在编辑状态,名称查重
    if (document.getElementById('only') && this.editValue !== undefined) {
      const editValue = this.editValue.trim();
      this.editValue = undefined;
      if (childIndex === 0 && /^([\u4e00-\u9fa5]|[a-zA-Z]){1}([\u4e00-\u9fa5]|\w){0,49}$/.test(editValue)) {
        for (let i = 0; i < this.showListData.length; i++) {
          if (this.showListData[i].params[0].value === editValue && i !== tempParentIndex) {
            this.$Message.error('命名重复');
            selectElement[childIndex].wordType = 'span';
            return;
          }
        }
      } else if (childIndex === 0 && !/^([\u4e00-\u9fa5]|[a-zA-Z]){1}([\u4e00-\u9fa5]|\w){0,49}$/.test(editValue)) {
        this.$Message.error('输入格式有误，支持50字符以内的中文、英文字母、数字和下划线，且不可以数字开头！');
        selectElement[childIndex].wordType = 'span';
        return;
      } else if (childIndex === 1 && !/^.{1,50}$/.test(editValue)) {
        this.$Message.error('标题不能超过50个字符');
        selectElement[childIndex].wordType = 'span';
        return;
      }
      this.$emit('checkSave', true);
      selectElement[childIndex].value = editValue;
    }
    selectElement[childIndex].wordType = 'span';
  }
  private created() {
    this.$nextTick(() => {
      document.body.addEventListener('click', this.setInfo, true);
    });
    // let showListData = this.listData.slice(0, this.pageSize);
    // this.showListData = showListData;
  }

  private beforeDestroy() {
    document.body.removeEventListener('click', this.setInfo);
  }
}
</script>

<style lang="less">
.modelToolManage {
  .content {
    width: 100%;
  }
  .activeClass {
    background:rgba(217,230,246,1) !important;
  }
  .content-list1 {
    .content-left {
      float: left;
    }
    .content-right {
      float: right;
      width: 100%;
      border-radius: 2px 2px 0px 0px;
      .middle-search {
        background: rgba(245,245,245,1);
        height: 42px;
        position: relative;
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
        .addField {
          position: absolute;
          top: 7px;
          right: 6px;
          display: inline-block;
          width: 82px;
          height: 28px;
          font-size: 12px;
          line-height: 28px;
          border: 1px solid #C4C4C4;
          border-radius: 4px;
          padding-left: 20px;
          cursor: pointer;
          background: url('~@/assets/images/modelingTool/addfield.png') 7px 50% no-repeat;
          background-color: #fff;
          background-size: 16px 16px;
        }
        .ivu-input-wrapper {
          float: left;
          .ivu-input-suffix{
            right: 8px;
            top: 5px;
          }
        }
      }
      .content {
        border-right: 1px solid rgba(204,204,204,1); 
        border-bottom: 1px solid rgba(204,204,204,1); 
      }
      .content-right-list {
        height: 42px;
        background: rgba(245,245,245,1);
        display: flex;
        > li {
          flex: 2;
          list-style: none;
          height: 42px;
          line-height: 42px;
          padding-left: 11px;
          text-align: left;
          font-size: 14px;
          border:1px solid rgba(204,204,204,1);   
          border-right: 0;
          border-bottom: 0;
          overflow: hidden;
          .ivu-select-selection {
            margin-right: 4px;
            height: 28px;
            .ivu-select-selected-value {
              height: 28px;
              line-height: 28px;
            }
          }
          .ivu-select-selected-value {
            font-size: 14px;
          }
          .ivu-select-selection:hover, .ivu-select-selection-focused {
            border-color: #337BF7;
          }
          .ivu-select-item-selected, .ivu-select-item-selected:hover {
            color: #337BF7;
          }
          .ivu-select-item {
            font-size: 14px !important;
          }
          input, select {
            border: 1px solid #337BF7;
            margin: 7px 7px 0 0;
            border-radius: 4px;
            width: calc(~"100% - 7px");
            line-height: 26px;
          }
          .readContent {
            display: inline-block;
            cursor: pointer;
            width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          &.handle-icon {
            flex: 0 0 100px;
            text-align: left;
            line-height: 56px;
            span {
                width: 22px;
                height: 20px;
                display: inline-block;
                cursor: pointer;
            }
            .edit-row {
              background-image: url('~@/assets/images/modelingTool/edit.png');
              background-size: 16px 16px;
              background-repeat:no-repeat;
            }
            .delete-row {
              background-image: url('~@/assets/images/modelingTool/delete.png');
              background-size: 16px 16px;
              background-repeat:no-repeat;
            }
          }
          .select-item {
            li {
              border: 0px;
              background:#fff;
            }
          }
        }
      }
      .title {
        height: 36px;
        > li {
          height: 36px;
          line-height: 36px;
          padding-left: 11px;
          background:linear-gradient(0deg,rgba(216,216,216,1) 0%,rgba(228,227,228,1) 100%);
        }
        li.grid {
          flex: 0 0 100px;
          border-right: 1px solid #ccc;
        }
      }

      .handle-icon {
        flex: 1;
        display: inline-block;
      }
      input {
        height: 28px;
        margin: 7px 9px 7px 6px;
      }

      .page-mark {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .page-right {
          li {
            width:15px;
            height: 27px;
            border: 0px;
          }
          .ivu-page-item {
            min-width: 15px;
          }
          .ivu-page-prev {
            min-width: 0;
          }
        }
      }
    }
  }
}
</style>
