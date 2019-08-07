<template>
  <div class="model-params">
    <div class="right-side">
      <ModelTooConfig :configType="'param'" @checkSave="checkSave" :filterinfo="filterParam" :library="library" :addCount="addCount" :titleList="titleList" :listData="listData" :blankElement="blankElement"  @editHandle="editHandle" @deleteHandle="deleteHandle" @changePage="changePage">
        <template slot="input">
            <Input suffix="ios-search" v-model="serachKeyWord.name"  @on-enter="searchParamList" placeholder="搜索"/>
            <Input suffix="ios-search" v-model="serachKeyWord.title" @on-enter="searchParamList" placeholder="搜索"/>
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
import modelParamsApi from '@/api/modalManage.ts';
import Vue from 'vue';
export default Vue.extend({
  name: 'modelParam',
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
      currentPage: 1,
      filterParam: {
        name: '',
        title: '',
      },
      serachKeyWord: {
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
      varCollectList: [
        {value: '1', label: '字段名', type: 'input'},
        {value: 'String', label: '名称', type: 'select'},
      ],
      blankElement: {
        index: 0,
        id: null,
        params: [
          {
            index: 0,
            value: '新参数',
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
            value: 'STRING',
            wordType: 'span',
            hasOption: true,
          },
        ],
      },
      titleList: ['参数名称', '标题', '数据类型'],
      listData: [],
      keyMark: 0,
      isUseding: false,
    };
  },
  methods: {
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
      (this as any).keyMark = data.index;
      (this as any).isEdit = true;
      (this as any).modalEditContent = {
        isTip: false,
        title: '删除',
        tipWords: `确定要删除${data.item.params[0].value}`,
      };
    },
    editHandle(item: any, key: any) {
      (this as any).keyMark = key;
      const le = [{label: '参数名称', type: 'input', value: ''}, {label: '标题', type: 'input', value: ''}, {label: '数据类型', type: 'select',  value: ''}];
      item.params.forEach((item1: any, index: any) => {
        le[index].value = item1.value;
      });
      (this as any).varCollectList = le;
      (this as any).isEdit = true;
      (this as any).modalEditContent.isTip = true;
      (this as any).modalEditContent.title = '编辑';
    },
    changePage(pageNumber: number) {
      // console.log(1);
    },
    confirm(status: any) {
      if (!status) {
        // 删除指定的元素
        // 分为能删除的很在应用中的
        if ((this as any).isUseding) {
          (this as any).isEdit = false;
          return;
        }
        const index = (this as any).keyMark;
        (this as any).listData.splice(index, 1);
        for (let i = 0; i <  (this as any).listData.length; i++) {
          (this as any).listData[i].index = i;
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
        for (let i = 0; i < (this as any).listData.length; i++) {
          if (status[0].value === (this as any).listData[i].params[0].value && key !== i) {
            this.$Message.error('命名重复');
            return;
          }
        }
        for (let i = 0; i < status.length; i++) {
          (this as any).listData[key].params[i].value = status[i].value.trim();
        }
      }
      (this as any).isEdit = false;
    },
    closeFrame() {
      (this as any).isEdit = false;
    },
    checkSave(val: boolean) {
      this.$emit('checkSave', val);
    },
    async searchParamList() {
      (this as any).filterParam = Object.assign({}, this.serachKeyWord);
    },
    // 参数名称列表搜索
    async getParamsList() {
      const paramsContent: any = {};
      paramsContent.libraryId = (this as any).library.id;
      const result = await modelParamsApi.getParamsModelStore(paramsContent);
      const listParams = result && result.data  || [];
      const res: any = [];
      listParams.forEach((item: any) => {
        res.push({
          id: item.id,
          name: item.name,
          title: item.title,
          dataType: item.dataType,
          applieNum: item.applieNum,
          libraryId: item.libraryId,
        });
      });
      (this as any).listData = [];
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
        (this as any).listData.push({
          index,
          applieNum: item.applieNum,
          libraryId: item.libraryId,
          id: item.id,
          params,
        });
      });
    },
    // 保存结果
    async saveResult() {
      const params: any = [];
      this.listData.forEach((item: any, index: any) => {
        params.push({
          name: item.params[0].value,
          title: item.params[1].value,
          dataType: item.params[2].value,
          libraryId: item.libraryId,
          applieNum: item.applieNum,
          id: item.id,
        });
      });
      const sendBackData = {
        id: (this as any).library.id,
        name: (this as any).library.name,
        fields: params,
      };
      modelParamsApi.modifyParamsLibrary(sendBackData).then((res: any) => {
        if (res.status === 200) {
          this.$emit('checkSave', false);
          this.$Message.success('保存成功');
        } else {
          this.$Message.error('保存失败');
        }
      });
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
    this.getParamsList();
  },
  activated() {
    this.getParamsList();
  },
});
</script>
<style lang="less">
.model-params {
  .middle-search {
    .ivu-input-wrapper {
      width: 300px;
        input {
          width: 297px;
        }
    }
  }
}

</style>


