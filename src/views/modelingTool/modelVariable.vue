<template>
  <div class="model-variable">
    <div class="left-side">
      <ModelTooConfig :configType="'variable'" @checkSave="checkSave" :filterinfo="filterVariable" :library="library" :addCount="addCount" :titleList="titleList1" :listData="variableListData" :blankElement="blankElement1"  @editHandle="editHandle" @deleteHandle="deleteHandle" @getItemModel="getItemModel">
         <template slot="input">
            <Input suffix="ios-search" v-model="variableName" @on-enter="searchVariableList" placeholder="搜索"/>
        </template> 
      </ModelTooConfig>
    </div>
    <div class="right-side">
      <ModelTooConfig :configType="'field'" @checkSave="checkSave" :filterinfo="filterField" :isShowAddButton="variableListData.length > 0" :titleList="titleList2" :listData="FieldListData" :blankElement="blankElement2"  @editHandle="editHandle" @deleteHandle="deleteHandle" :pageSize="100000">
        <template slot="input">
            <Input suffix="ios-search" v-model="fieldParams.name"   @on-enter="getFieldList" placeholder="搜索"/>
            <Input suffix="ios-search" v-model="fieldParams.title" @on-enter="getFieldList" placeholder="搜索"/>
        </template> 
      </ModelTooConfig>
    </div>
    <!-- 进行编辑的弹框 -->
    <ModalFrame  :modalContent="modalEditContent" :editModal_a='isEdit' :varCollectList="varCollectList" @closeFrame="closeFrame" @confirm="confirm"></ModalFrame>
     <!-- <Button style="width:84px;height:28px;;fontSize:14px;" @click="saveResult">保存</Button> -->
  </div>
</template>
<script lang="ts">
import ModelTooConfig from './modelToolConfig.vue';
import ModalFrame from './ModalFrame.vue';
import modelVariableApi from '@/api/modalManage.ts';
import Vue from 'vue';
export default Vue.extend({
  name: 'modelVariable',
  components: {
    ModelTooConfig,
    ModalFrame,
  },
  props: {
    library: {
      type: Object,
      default: {},
    },
    addCount: {
      type: Number,
      default: -1,
    },
    saveCount: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      widthValue: 'width: 250px',
      variableName: '', // 变量名称,
      filterVariable: {
        name: '',
        title: '',
      },
      filterField: {
        name: '',
        title: '',
      },
      fieldParams: {
        name: '',
        title: '',
      },
      isEdit: false,
      isConfirm: false,
      modalEditContent: {
        isTip: true,
        title: '编辑',
        tipWords: '确定删除0.1u吗',
      },
      modalDeleteContent: {
        isTip: false,
        title: '删除',
        tipWords: '确定删除0.1u吗',
      },
      varCollectList: [
        {value: '1', label: '字段名', type: 'input'},
        {value: 'String', label: '名称', type: 'select'},
      ],
      typeCollect: [{
        id: '2',
        label: '2',
      }],
      blankElement1: {
        index: 0,
        id: null,
        fields: [],
        params: [
          {
            index: 0,
            value: '新变量',
            wordType: 'span',
            hasOption: false,
          },
        ],
      },
      blankElement2: {
        index: 0,
        id: null,
        params: [
          {
            index: 0,
            value: '新字段',
            wordType: 'span',
            hasOption: false,
          },
          {
            index: 1,
            value: '新标题',
            wordType: 'span',
            hasOption: false,
          },
          {
            index: 2,
            value: '请选择',
            wordType: 'span',
            hasOption: true,
          },
        ],
      },
      titleList1: ['变量名称'],
      titleList2: ['字段名', '标题', '数据类型'],
      variableListData: [],
      FieldOriginListData: [],
      FieldListData: [],
      keyMark: '',
      startModel: 'left', // right
      filedArray: [],
      titleArray: [],
      isUseding: false,
    };
  },
  methods: {
    getItemModel(data: any) {
      const index = data.index;
      (this as any).FieldListData = (this as any).variableListData[index] ? (this as any).variableListData[index].fields : [];
    },
    // 删除
    deleteHandle(data: any) {
      (this as any).isUseding = false;
      if (data.item.applieNum > 0) {
        (this as any).isEdit = true;
        (this as any).isUseding = true;
        (this as any).modalEditContent = {
          isTip: false,
          title: '删除',
          tipWords: `该数据在应用中,无法删除`,
        };
        return;
      }
      if (data.item.params.length > 1) {
        (this as any).startModel = 'right';
      } else {
        (this as any).startModel = 'left';
      }
      (this as any).keyMark = data.index;
      (this as any).isEdit = true;
      (this as any).modalEditContent = {
        isTip: false,
        title: '删除',
        tipWords: `确定要删除${data.item.params[0].value}`,
      };
    },
    // 编辑
    editHandle(item: any, key: any) {
      (this as any).keyMark = key;
      let le: any = null;
      if (item.params.length > 1) {
        (this as any).startModel = 'right';
        le = [
          {label: '字段名', type: 'input', value: ''},
          {label: '标题', type: 'input', value: ''},
          {label: '数据类型', type: 'select',  value: ''},
        ];
      } else {
        (this as any).startModel = 'left';
        le = [{label: '变量名称', type: 'input', value: ''}];
      }
      item.params.forEach((item1: any, index: any) => {
        le[index].value = item1.value;
      });
      (this as any).varCollectList = le;
      (this as any).isEdit = true;
      (this as any).modalEditContent.isTip = true;
      (this as any).modalEditContent.title = '编辑';
    },
    // 确认
    confirm(status: any) {
      let listData: any = null;
      if ((this as any).startModel === 'right') {
        listData = (this as any).FieldListData;
      } else {
        listData = (this as any).variableListData;
      }
      if (!status) {
        // 删除指定的元素
        if ((this as any).isUseding) {
          (this as any).isEdit = false;
          return;
        }
        const index = (this as any).keyMark;
        listData.splice(index, 1);
        for (let i = 0; i <  listData.length; i++) {
          listData[i].index = i;
        }
        if ((this as any).startModel === 'left') {
          (this as any).getItemModel({index});
        }
      } else {
        // 编辑指定的元素
        const key = (this as any).keyMark;
        if (!/^([\u4e00-\u9fa5]|[a-zA-Z]){1}([\u4e00-\u9fa5]|\w){0,49}$/.test(status[0].value.trim())) {
          this.$Message.error('输入格式有误，支持50字符以内的中文、英文字母、数字和下划线，且不可以数字开头！');
          return;
        }
        if (status.length > 1 && !/^.{1,50}$/.test(status[1].value.trim())) {
          this.$Message.error('标题不能超过50个字符');
          return;
        }
        for (let i = 0; i < listData.length; i++) {
          if (status[0].value === listData[i].params[0].value && key !== i) {
            this.$Message.error('命名重复');
            return;
          }
        }
        for (let i = 0; i < status.length; i++) {
          listData[key].params[i].value = status[i].value.trim();
        }
        this.$emit('checkSave', true);
      }
      (this as any).isEdit = false;
    },
    // 取消
    closeFrame() {
      (this as any).isEdit = false;
    },
    checkSave(val: boolean) {
      this.$emit('checkSave', val);
    },
    async searchVariableList() {
      (this as any).filterVariable = Object.assign({}, {
        name: this.variableName,
        title: '',
      });
    },
    // 请求变量名列表
    async getVariableList() {
      const paramsContent: any = {};
      paramsContent.libraryId = (this as any).library.id;
      if (!!(this as any).variableName) {
        paramsContent.name = (this as any).variableName;
      }
      const result = await modelVariableApi.getVariableList(paramsContent);
      const listParams: any = result && result.data || [];
      if (listParams.length === 0) {
        return;
      }
      const res: any = [];
      listParams.forEach((item: any) => {
        res.push({
          id: item.id,
          name: item.name,
          applieNum: item.applieNum,
          varietyPath: item.varietyPath,
          libraryId: item.libraryId,
          fields: item.fields,
        });
      });
      (this as any).variableListData = [];
      res.forEach((item: any, index: any) => {
        const params = [];
        // 一维数组
        params.push({
          index: 0,
          value: item.name,
          wordType: 'span',
          hasOption: false,
        });
        (this as any).variableListData.push({
          index,
          id: item.id,
          name: item.name,
          libraryId: item.libraryId,
          applieNum: item.applieNum,
          params,
          fields: (this as any).transformDataToShow(item.fields), // 具体字段的存储;转换以后的数据
        });
      });
      (this as any).getItemModel({index: 0});

      // (this as any).getAllFiledList(listParams[0].fields)
    },
    // 字段转化函数
    transformDataToShow(listParams: any) {
      // debugger
      const res: any = [];
      listParams.forEach((item: any) => {
        res.push({
          id: item.id,
          name: item.name,
          title: item.title,
          applieNum: item.applieNum,
          dataType: item.dataType,
          varietyId: item.varietyId,
        });
      });
      const fieldListData: any = [];
      const nameList = ['name', 'title', 'dataType'];
      res.forEach((item: any, index: any) => {
        const params = [];
        for (let i = 0; i < 3; i++) {
          params.push({
            index: i,
            value: item[nameList[i]],
            wordType: 'span',
            hasOption: i === 2 ? true : false,
          });
        }
        fieldListData.push({
          index,
          applieNum: item.applieNum,
          varietyId: item.varietyId,
          id: item.id,
          params,
        });
      });
      return fieldListData;
    },
    getFieldList() {
      (this as any).filterField = Object.assign({}, (this as any).fieldParams);
    },
    getMathWord(keyWord: any, index: any) {
      // 字符串方法indexOf
      const list = (this as any).FieldOriginListData;
      const len = list.length;
      const arr = [];
      for (let i = 0; i < len; i++) {
          // 如果字符串中不包含目标字符会返回-1
          if (list[i].params[index].value.indexOf(keyWord) >= 0) {
              arr.push(list[i]);
          }
      }
      return arr;
    },
    getIntersect(arr1: any, arr2: any) {
      const a = new Set(arr1);
      const b = new Set(arr2);
      // 交集
      const intersect = new Set([...a].filter(x => b.has(x)));
      return [...intersect];
    },
    saveResult() {
      const sendBackData: any = {};
      sendBackData.id = (this as any).library.id;
      sendBackData.name = (this as any).library.name;
      sendBackData.varietys = [];
      this.variableListData.forEach((item1: any) => {
        sendBackData.varietys.push({
          id: item1.id,
          name: item1.params[0].value,
          libraryId: item1.libraryId,
          varietyPath: '',
          fields: (this as any).getFieldsParamsList(item1.fields),
        });
      });
      modelVariableApi.modifyVaribaleLibrary(sendBackData).then((res: any) => {
        if (res.status === 200) {
          (this as any).variableListData = [];
          res.data.varietys.forEach((item: any, index: any) => {
            const params = [];
            // 一维数组
            params.push({
              index: 0,
              value: item.name,
              wordType: 'span',
              hasOption: false,
            });
            (this as any).variableListData.push({
              index,
              id: item.id,
              name: item.name,
              libraryId: item.libraryId,
              applieNum: item.applieNum,
              params,
              fields: (this as any).transformDataToShow(item.fields), // 具体字段的存储;转换以后的数据
            });
          });
          // 重新默认选中
          // (this as any).getItemModel({index: 0});
          this.$Message.success('保存成功');
        } else {
          this.$Message.error('保存失败');
        }
      });
    },
    getFieldsParamsList(fields: any) {
      const params: any = [];
      fields.forEach((item: any, index: any) => {
        params.push({
          id: item.id,
          name: item.params[0].value, // 字段名
          title: item.params[1].value, // 标题
          dataType: item.params[2].value, // 数据类型
          varietyId: item.id,
        });
      });
      return params;
    },
  },
  watch: {
    saveCount() {
      if (this.library.isAct) {
        (this as any).saveResult();
      }
    },
  },
  mounted() {
    (this as any).FieldListData = (this as any).FieldOriginListData;
    (this as any).getVariableList();
  },
});
</script>
<style lang="less">
.model-variable {
  display: flex;
  .left-side {
    float: left;
    flex: 2;
    margin-right: 12px;
    .middle-search {
      .ivu-input-wrapper {
        width: 250px;
        input {
          width: 230px;
        }
      }
    }
  }
  .right-side {
    float: right;
    flex: 3;
    .middle-search {
      .ivu-input-wrapper {
        flex: 1;
        width: 198px;
        input {
          width: 183px;
        }
      }
    }
  }
}



</style>


