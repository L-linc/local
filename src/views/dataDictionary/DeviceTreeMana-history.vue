<template>
  <div class="dic_wrap tree_wrap">
    <div class="com_top">
        <Select @on-change="changeTree(index)" v-for="(treeLi, index) in treeValue" v-model="treeValue[index]" :key="index">
            <Option v-show="checkOption(index, optLi)" v-for="(optLi, i) in selectTree[index]" :key="i" :value="optLi.id">{{optLi.name}}</Option>
        </Select>        
    </div>
    <div class="com_tab">
        <Tree ref="treeWrap" @on-toggle-expand="toggTree" @on-select-change="selTree" :data="treeData"></Tree>
    </div>
    <Modal
        class="dictionary_modal"
        v-model="addFlag"
        :title="toastTit"
        width="440px"
        @on-ok="brandSubmit"
        @on-cancel="closeModal">       
        <label class="add_label"><span class="label_name">主题名称：</span><Input name="name" v-model="brandNameAdd" placeholder="主题名称" /></label>
    </Modal>
    <div v-show="toolShow" :style="toolPosition" class="tree_tool">
      <div class="tool_li" @click="toAdd($event, 'addself')">主题</div>
      <div class="tool_li" @click="toAdd($event, 'addchild')">子主题</div>
      <div class="tool_li" @click="toAdd($event, 'edit')">编辑</div>
      <div class="tool_li" @click="toDelete($event, 'child')">删除</div>
    </div>
  </div>
  
</template>

<script lang="ts">
import './dataDictionary.less';
import dictionaryApi from '@/api/dataDictionary.ts';
export default {
  name: 'deviceTreeMana',
  created() {
      (this as any).getTreeData();
  },
  data() {
    return {
        brandNameAdd: '',
        addFlag: false,
        toastTit: '添加品牌',
        toolPosition: {
          left: '0px',
          top: '0px',
        },
        selectNode: '', // 当前选中的树节点
        toolShow: false,
        toolChildShow: true,
        treeValue: [1, 4, 13, 36],
        treeData: [],
        selectTree: [],
    };
  },
  methods: {
    toDelete() {
        const data = (this as any).selectNode;
        (this as any).$Modal.confirm({
            title: '删除主题',
            content: `<p>是否确定删除：${data.name}？</p>`,
            loading: true,
            onOk: () => {
                const params = {
                    id: data.id,
                };
                (this as any).$Spin.show();
                // dictionaryApi.DeleteTree(params).then((res: any) => {
                //     (this as any).$Spin.hide();
                //     (this as any).$Modal.remove();
                //     (this as any).$Message.info('删除成功');
                //     (this as any).toolShow = false;
                //     (this as any).selectNode = null;
                //     (this as any).getTreeData();
                // }, (res: any) => {
                //     (this as any).$Spin.hide();
                // });
            },
        });
    },
    getTreeData() {
        const params = {urlStr: ''};
        // dictionaryApi.selectTree(params).then((res: any) => {
        //     const data = res.data || [];
        //     (this as any).dataTransTree(data);
        // });
    },
    dataTransTree(treeList: any[]) {
        if (treeList.length <= 0) {
            return ;
        }
        const selectData: any[] = [];
        for (const ele of treeList) {
            if (ele.level) {
                selectData[ele.level] = selectData[ele.level] || [];
                selectData[ele.level].push(ele);
                ele.title = ele.name;
            }
        }
        const treeSelData: any[] = [];
        // 去除数组empty元素；
        selectData.map((ele: any, i: any) => {
            if (ele) {
                treeSelData.push(ele);
            }
        });
        let  transList: any[] = [];
        const leveLen = treeSelData.length;
        transList = [...treeSelData[leveLen - 1]];
        for (let i = leveLen - 2; i >= 0; i--) {
            let treeData: any[] = [];
            treeData = [...treeSelData[i]];
            treeData.map((selLi: any, j: number) => {
                selLi.children = [];
                transList.map((traLi: any, k: number) => {
                    if (traLi.parent === selLi.id) {
                        selLi.children.push(traLi);
                    }
                });
            });
            transList = treeData;
        }
        (this as any).selectTree = treeSelData;
        (this as any).treeData = transList;
    },
    toAdd(event: any, type: string = 'addself') {
        (this as any).addFlag = true;
        (this as any).brandNameAdd = '';
        let tit = '添加主题';
        switch (type) {
          case 'addchild':
            tit = '添加子主题';
            break;
          case 'edit':
            tit = '修改主题';
            (this as any).brandNameAdd = (this as any).selectNode.name;
            break;
          default:
            tit = '添加主题';
            break;
        }
        (this as any).toastTit = tit;
    },
    closeModal() {
        (this as any).addFlag = false;
    },
    brandSubmit() {
        const {toastTit, brandNameAdd, selectNode} = (this as any);
        const params = {
            name: brandNameAdd,
            parent: selectNode.id,
            level: selectNode.level,
        };
        switch (toastTit) {
            case '添加子主题':
                params.level ++;
                // dictionaryApi.addtTree(params).then((res: any) => {
                //     (this as any).$Message.info('添加成功');
                //     (this as any).toolShow = false;
                //     (this as any).selectNode = null;
                //     (this as any).getTreeData();
                // });
                break;
            case '修改主题':
                // const editParams = {
                //     name: brandNameAdd,
                //     id: selectNode.id,
                //     parent: selectNode.parent,
                //     level: selectNode.level,
                // };
                // dictionaryApi.editTree(editParams).then((res: any) => {
                //     (this as any).$Message.info('修改成功');
                //     (this as any).toolShow = false;
                //     (this as any).selectNode = null;
                //     (this as any).getTreeData();
                // });
                break;
            case '添加主题':
                params.parent = selectNode.parent;
                // dictionaryApi.addtTree(params).then((res: any) => {
                //     (this as any).$Message.info('添加成功');
                //     (this as any).toolShow = false;
                //     (this as any).selectNode = null;
                //     (this as any).getTreeData();
                // });
                break;
        }
    },
    changeTree(index: number) {
        // select改变设备树更新，触发改变的当前select之后的select都会根据当前的变化value默认选择关联父级的子级第一项；
        // event = event || window.event;
        const valLen = (this as any).treeValue.length;
        const currVal = (this as any).treeValue[index];
        const listData = (this as any).selectTree[index + 1];
        let nexVal = '';
        if (index + 1 >= valLen) {
            // 最后一层终止
            return;
        }
        // (this as any).selectTree[index + 1].map((ele: any, i: number) => {
        //     // nexVal = ele.parent === currVal ? ele.id : '';
        //     if (!nexVal && ele.parent === currVal) {
        //         nexVal = ele.id;
        //     }
        // });
        if (currVal) {
            // 上一层值为空，后面的select值都为空减少循环；
            for (const ele of listData) {
                // 改成for循环查询到了可以及时终止；
                // console.log(currVal, ele.parent);
                if (!nexVal && ele.parent === currVal) {
                    nexVal = ele.id;
                    break;
                }
            }
        }
        (this as any).treeValue[index + 1] = nexVal;
        if (index + 1 < valLen - 1) {
            // 改变非第一层的设备树值，递归循环改变后面的数值；
            (this as any).changeTree(index + 1);
        }
    },
    checkOption(index: number, data: any) {
        if (index === 0 || data.parent === (this as any).treeValue[index - 1]) {
            // index为0是第一层设备树不需要过滤，其他层的父级ID === 上一层v-model双向绑定的值才显示；
            return true;
        }
        return false;
    },
    getParent(index: number, id: string) {
        // 递归从最后一层往回找父节点
        if (index < 0 ) {
            // 第一层开始终止
            return;
        }
        const newArry: string[] = [];
        for (index; index >= 0; index --) {
            let getNode: boolean = false;
            (this as any).selectTree[index].map((ele: any, i: number) => {
                if (id === ele.id) {
                    newArry.unshift(id);
                    id = ele.parent;
                    getNode = true;
                }
            });
            if (!getNode) {
                // 设备树节点不完整，后面的value都是空；
                newArry.unshift('');
            }
        }
        (this as any).treeValue = newArry;
    },
    selTree(data: any, liData: any) {
      const event: any = window.event;
      const currEle = event.target;
      if (! currEle) {
        return;
      }
      const eleWidth = currEle.offsetWidth;
      const eleHeight = currEle.offsetHeight;
      const eleTop = currEle.offsetTop;
      const eleLeft = currEle.offsetLeft;
      const toolTop = eleTop + eleHeight / 2 - 24; // 24是tool的本身内容高度的一半；
      const toolLeft = eleLeft + eleWidth  + 24;   // 24是设计图tool和数组件相距的距离；
      (this as any).toolPosition = {
        left: toolLeft + 'px',
        top: toolTop + 'px',
      };
      (this as any).selectNode = liData;
      if (!(this as any).toolShow) {
        (this as any).toolShow = !(this as any).toolShow;
      }
      if (liData.level && liData.level === (this as any).treeData.length && !(this as any).toolChildShow) {
        // 最后一层树不显示子主题
        (this as any).toolChildShow = true;
      } else {
        (this as any).toolChildShow = false;
      }
      console.log(eleWidth, eleHeight, eleTop, eleLeft);
    },
    toggTree(data: any) {
        // console.log(data);
        // console.log((this as any).$refs.treeWrap.getSelectedNodes());
    },
  },
};
</script>