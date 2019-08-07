<template>
  <div class="dic_wrap tree_wrap">
    <div class="search_wrap">
        <div style="float:left;marginBottom:24px">
            <Input prefix="ios-search" placeholder="搜索" style="width: 280px;" v-model="searchTreeNode"/>
            <Button type="primary" @click="search" style="width:72px;marginLeft:20px;height:36px;fontSize:16px">搜 索</Button>
        </div>
    </div>
    <div class="device_tree">
        <Tree :data="treeData" @on-toggle-expand="toggTree" :load-data="loadData" @on-select-change="getChosenNodes" ref="deviceTree"></Tree>
        <div class="tree_tool" :style="treeNodePosition" v-show="showTreeNode">
            <div class="tool_li" @click="addself" v-show="theme" v-has="'SYS_DICT_LOCATION_SIBLING_ADD'">
                <icon class="tool_icon theme"></icon>
                <span>主题</span>    
            </div>
            <div class="tool_li" @click="addchild" v-show="childTheme" v-has="'SYS_DICT_LOCATION_CHILDREN_ADD'">
                <icon class="tool_icon child-theme"></icon>
                <span>子主题</span>  
            </div>
            <div class="tool_li" @click="edit" v-show="theme" v-has="'SYS_DICT_LOCATION_MOD'">
                <icon class="tool_icon editor"></icon>
                <span>编辑</span>  
            </div>
            <div class="tool_li" @click="del" v-show="theme" v-has="'SYS_DICT_LOCATION_DEL'">
                <icon class="tool_icon del"></icon>
                <span>删除</span>  
            </div>
        </div>
    </div>
    <div class="tree_input" :style="treeInputPosition" v-show="showInputNode">
        <input ref="inputTitle" type="text" @blur="setTitle"  @keydown.enter="lostFocus" :style="inputWidth" v-model="treeTitle" style="height: 22px;border: 1px solid #5EA4EB"/>
    </div>
  </div>
  
</template>

<script lang="ts">
import './dataDictionary.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import {Component} from 'vue-property-decorator';
@Component
export default class DeviceTreeMana extends Vue {

    // data
    private searchTreeNode: string = '';
    private treeData: any[] = [
        {
            id: 1,
            title: '深圳华星光电',
            expand: false,
            loading: false,
            parent: null,
            level: 1,
            hasChildren: 1,
            children: [],
            descript: '描述',
            locationPath: '1',
            type: '最高点',
        },
    ];
    private treeNodePosition: any = {
        top: '0px',
        left: '0px',
    };
    private treeInputPosition: any = {
        top: '0px',
        left: '0px',
    };
    private showTreeNode: boolean = false;
    private choseNode: any = null;
    private theme: boolean = true;
    private childTheme: boolean = true;
    private showInputNode: boolean = false;
    private treeTitle: string = '';
    private inputWidth: any = {
        width: '200px',
    };
    private currentNode: any = null;
    private inputP: any = {};
    private inputN: number = 0;
    private authShow: boolean = false;

    // life-cycle
    private mounted() {
        // 点击其他区域,主题等消失
        document.addEventListener('click', (e: any) => {
            const ts = document.getElementsByClassName('ivu-tree-title') as HTMLCollection; // 树节点DOM集合
            for (const i of ts) {
                if (i === e.target && (this as any).$refs.deviceTree.getSelectedNodes().length > 0 && this.authShow) {
                    this.showTreeNode = true;
                    return;
                } else {
                    this.showTreeNode = false;
                }
            }
        });
    }
    private created() {
        const a: any = localStorage.getItem('roleAuth');
        const b: any = JSON.parse(a);
        if (b.includes('ADMIN') || b.includes('SYS_DICT_LOCATION_SIBLING_ADD') || b.includes('SYS_DICT_LOCATION_CHILDREN_ADD') || b.includes('SYS_DICT_LOCATION_MOD') || b.includes('SYS_DICT_LOCATION_DEL')) {
            this.authShow = true;
        }
    }

    // methods
    private toggTree() {
        // 点击 root 收起时,整棵树重置
        // if ((this as any).treeData[0].expand === false) {
        //     (this as any).treeData = [
        //         {
        //             id: 1,
        //             title: 'root',
        //             expand: false,
        //             loading: false,
        //             parent: null,
        //             level: 1,
        //             sort: 1,
        //             hasChildren: 1,
        //             children: [],
        //             descript: '描述',
        //             locationPath: '1',
        //             type: '最高点',
        //         },
        //     ];
        // }
    }
    private search() {
        // 点击之后请求模糊查询数据
        if (this.searchTreeNode === '') {
            // this.$Message.error('当前查询树节点为空,请先输入您要查询的树节点');
            this.treeData = [
                {
                    id: 1,
                    title: '深圳华星光电',
                    expand: false,
                    loading: false,
                    parent: null,
                    level: 1,
                    hasChildren: 1,
                    children: [],
                    descript: '描述',
                    locationPath: '1',
                    type: '最高点',
                },
            ];
            return;
        }
        const params = {
            title:  encodeURIComponent (this.searchTreeNode),
        };
        dictionaryApi.getSearchChildren(params).then((res: any) => {
            if (res.data === '') {
                this.$Message.error('当前查询树节点不存在,请确认后重新输入');
                this.treeData = [
                    {
                        id: 1,
                        title: '深圳华星光电',
                        expand: false,
                        loading: false,
                        parent: null,
                        level: 1,
                        hasChildren: 1,
                        children: [],
                    },
                ];
                // 搜索框是否置空
                this.searchTreeNode = '';
                return;
            }
            this.addExpand(res.data, true, '');
            // 搜索框是否置空
            this.searchTreeNode = '';
            // 如果搜索返回的数据仍然包含有下级子节点的时候,将该树节点 expand 重置为 false,即未展开的情况
            const loop = (tree: any) => {
                for (let i = 0; tree && i < tree.length; i++) {
                    if (tree[i].hasChildren && tree[i].children === null) {
                        this.$set(tree[i], 'expand', false);
                        tree[i].children = [];
                    }
                    if (tree[i].hasSign) {
                        this.$set(tree[i], 'render', this.selectedSearch());
                    }
                    if (tree[i].children ) {
                        tree[i].children = loop(tree[i].children);
                    }
                }
                return tree;
            };
            res.data = loop(res.data);
            this.treeData = res.data;
            // console.log((this as any).treeData);
        }, (res) => {
            this.$Message.error('服务器出错了,请找工程师解决');
        });
    }
    private selectedSearch() {
        return (h: any, { root, node, data }: any) => {
            return h('span', {
                class: node.node.selected ? 'ivu-tree-title ivu-tree-title-selected' : 'ivu-tree-title',
                style: {
                    color: 'red',
                },
                on: {
                    click: (e: any) => {
                        if (!node.node.selected) {
                            (this as any).$refs.deviceTree.handleSelect(node.nodeKey); // 手动选择树节点
                        }
                    },
                },
            }, data.title);
        };
    }
    private getChosenNodes() {
        this.showInputNode = false;
        this.choseNode = (this as any).$refs.deviceTree.getSelectedNodes();
        if (this.choseNode.length < 1) {
            return;
        }
        // 后台返回的 root 是 0
        this.theme = (this.choseNode[0].parent === null || this.choseNode[0].parent === 0) ? false : true;
        // 只能有5层,改变level,改变所需要的层级
        this.childTheme = (this.choseNode[0].level === 6) ? false : true;
        // 获取后台是否有子节点, 判断显示子主题
        const event: any = window.event;
        const currEle = event.target;
        this.currentNode = currEle;
        if (! currEle) {
            return;
        }
        const eleWidth = currEle.offsetWidth;
        const eleHeight = currEle.offsetHeight;
        const eleTop = currEle.offsetTop;
        const eleLeft = currEle.offsetLeft;
        const treeNodeTop = eleTop;
        const treeNodeLeft = eleLeft + eleWidth + 8;   // 5是设计图和数组件相距的距离；
        this.treeNodePosition = {
            left: treeNodeLeft + 'px',
            top: treeNodeTop + 'px',
        };
        // 直接编辑当前节点名称时,输入框位置
        this.treeInputPosition = {
            left: eleLeft + 'px',
            top: eleTop + 'px',
        };
        this.inputWidth.width = eleWidth + 'px';
        // 新增子主题或者主题的时候,将上一次的节点位置记录下来
        if (this.treeInputPosition.left !== 'undefinedpx') {
            this.inputP = this.treeInputPosition;
            this.inputN = this.choseNode[0].nodeKey;
        } else {
            this.inputWidth.width = '200px'; // 默认200px长度
            const left = Number(this.inputP.left.substring(0, this.inputP.left.length - 2));
            const top = Number(this.inputP.top.substring(0, this.inputP.top.length - 2));
            if (this.inputN === 0) { // 如果是直接在root节点点击新增子主题(因为字体18px,高度不同)
                this.treeInputPosition = {
                    left: left + 'px',
                    top: top  + (this.choseNode[0].nodeKey - this.inputN) * 29 + 6 + 'px',
                };
            } else {
                this.treeInputPosition = {
                    left: left + 'px',
                    top: top  + (this.choseNode[0].nodeKey - this.inputN) * 29 + 'px',
                };
            }
        }
    }
    private loadData(item: any, callback: any) {
        // 点击之后请求后台树节点数据
        let data: any[] = [];
        const params = {
            id: item.id,
        };
        dictionaryApi.getTreeChildren(params).then((res: any) => {
            data = res.data.children;
            this.addExpand(data, false, 'load');
            callback(data);
        }, (res: any) => {
            // todo:加载时间过久
            this.$Message.error('网络情况不好,请稍候再试');
            this.treeData[0].loading = false;
        });
    }
    private addself() {
        if (!this.choseNode[0].children) {
            this.choseNode[0].children = [];
        }
        const delId = (tree: any[], id: number) => {
            for (const i of tree) {
                if (i.id === id) {
                    for (const j of tree) {
                        if (j.id === i.id) {
                            const addParams = {
                                title: '',
                                type: '最高点',
                                parent: i.parent,
                                descript: j.descript,
                            };
                            dictionaryApi.addtTree(addParams).then((res: any) => {
                                this.$Message.info('添加成功');
                                tree.push(res.data);
                                this.choseNode = [];
                                this.choseNode.push(tree[tree.length - 1]);
                                this.$nextTick(() => {
                                    (this as any).$refs.deviceTree.handleSelect(res.data.nodeKey); // 手动选择树节点
                                    // this.getChosenNodes(this.choseNode, res.data, res.data.nodeKey);
                                    this.edit();
                                });
                                // (this as any).setTitle();
                            }, (res: any) => {
                                // console.log('添加失败,请联系工程师处理');
                            });
                        }
                    }
                    return;
                }
                if (i.children && i.children.length > 0) {
                    const child = i.children;
                    delId(child, id);
                }
            }
        };
        delId(this.treeData, this.choseNode[0].id);
    }
    private addchild() {
        // 如果是在未展开的状态下选择添加子主题, 则在展开之前需要手动请求一次数据并添加
        // ie11
        if (!this.choseNode[0].children) {
            this.choseNode[0].children = [];
        }
        if (this.choseNode[0].children.length === 0) {
            const params = {
                id: this.choseNode[0].id,
            };
            dictionaryApi.getTreeChildren(params).then((res: any) => {
                const data = res.data.children;
                if (data.length > 0) {
                    this.addExpand(data, false, 'load');
                    this.choseNode[0].children.push(...res.data.children);
                }
                // UAT
                const addParams = {
                    title: '',
                    type: '最高点',
                    parent: this.choseNode[0].id,
                    descript: this.choseNode[0].descript,
                };
                dictionaryApi.addtTree(addParams).then((resp: any) => {
                    this.$Message.info('添加成功');
                    if (!resp.data.children) {
                        resp.data.children = [];
                    }
                    this.$set(this.choseNode[0], 'expand', true);
                    this.$set(this.choseNode[0], 'loading', false);
                    if (!this.choseNode[0].children) {
                        this.choseNode[0].children = [];
                    }
                    this.choseNode[0].children.push(resp.data);
                    this.$nextTick(() => {
                        (this as any).$refs.deviceTree.handleSelect(resp.data.nodeKey); // 手动选择树节点
                        this.edit();
                    });
                });
            });
        } else {
            const addParams = {
                title: '',
                type: '最高点',
                parent: this.choseNode[0].id,
                descript: this.choseNode[0].descript,
            };
            dictionaryApi.addtTree(addParams).then((res: any) => {
                this.$Message.info('添加成功');
                if (!res.data.children) {
                    res.data.children = [];
                }
                this.$set(this.choseNode[0], 'expand', true);
                this.$set(this.choseNode[0], 'loading', false);
                if (!this.choseNode[0].children) {
                    this.choseNode[0].children = [];
                }
                this.choseNode[0].children.push(res.data);
                this.$nextTick(() => {
                    (this as any).$refs.deviceTree.handleSelect(res.data.nodeKey); // 手动选择树节点
                    this.edit();
                });
            });
        }
        // const addParams = {
        //     title: '请输入子主题',
        //     type: this.choseNode[0].type,
        //     parent: this.choseNode[0].id,
        //     descript: this.choseNode[0].descript,
        // };
        // dictionaryApi.addtTree(addParams).then((res: any) => {
        //     this.$Message.info('添加成功');
        //     if (!res.data.children) {
        //         res.data.children = [];
        //     }
        //     this.$set(this.choseNode[0], 'expand', true);
        //     this.$set(this.choseNode[0], 'loading', false);
        //     if (!this.choseNode[0].children) {
        //         this.choseNode[0].children = [];
        //     }
        //     this.choseNode[0].children.push(res.data);
        //     this.$nextTick(() => {
        //         (this as any).$refs.deviceTree.handleSelect(res.data.nodeKey); // 手动选择树节点
        //         this.edit();
        //     });
        // }, (res: any) => {
        //     this.$nextTick( () => {
        //         (this as any).$refs.inputTitle.focus();
        //         (this as any).$refs.inputTitle.select();
        //     });
        // });
    }
    private edit() {
        this.showInputNode = true;
        this.showTreeNode = false;
        this.treeTitle = this.choseNode[0].title;
        // 聚焦
        this.$nextTick( () => {
            (this as any).$refs.inputTitle.focus();
            (this as any).$refs.inputTitle.select();
        });
    }
    // input enter事件
    private lostFocus() {
        (this as any).$refs.inputTitle.blur();
    }
    private setTitle() {
        // 改变数据之后,传回给后台,(this as any).showInputNode = false;
        // if (this.treeTitle === '') {
        //     this.$Message.error('名称不能为空,请输入主题(子主题)名称');
        //     this.$nextTick( () => {
        //         (this as any).$refs.inputTitle.focus();
        //         (this as any).$refs.inputTitle.select();
        //     });
        //     return;
        // }
        // if (this.treeTitle === '请输入子主题' || this.treeTitle === '请输入主题') {
        //     this.$nextTick( () => {
        //         (this as any).$refs.inputTitle.focus();
        //         (this as any).$refs.inputTitle.select();
        //     });
        // }
        // 当前节点名称没有改变,不传后台
        const currentTitle = this.choseNode[0].title;
        if (this.treeTitle === currentTitle) {
            this.$Message.info('当前节点名称未改变');
            this.showInputNode = false;
            return;
        }
        const editParams = {
            title: this.treeTitle,
            parent: this.choseNode[0].parent,
            id: this.choseNode[0].id,
            type: this.choseNode[0].type,
            descript: this.choseNode[0].descript,
        };
        const editNodes = this.choseNode; // 防止失焦事件发生的时候,将title赋值到其他点中的树节点,先将当前选中的节点存起
        dictionaryApi.editTree(editParams).then((res: any) => {
            this.$Message.info('当前节点已经更新,关联地方同步更新');
            if (editNodes[0].id === this.choseNode[0].id) {
                this.choseNode[0].title = this.treeTitle;
            } else {
                editNodes[0].title = this.treeTitle;
            }
        }, (res: any) => {
            // console.log('修改失败,请联系工程师处理');
        });
        this.showInputNode = false;
    }
    private del() {
        const delId = (tree: any[], id: number) => {
            for (const i of tree) {
                if (i.id === id) {
                    for (let j = 0; j < tree.length; j++) {
                        if (tree[j].id === i.id) {
                            const params = {
                                id: i.id,
                            };
                            dictionaryApi.canDelChildren(params).then((res: any) => {
                                if (res) {
                                    this.$Modal.confirm({
                                        title: `是否确认删除 ' ${i.title} ' 节点`,
                                        onOk: () => {
                                            this.delOk(params, tree, j);
                                        },
                                    });
                                } else {
                                   this.$Message.error('当前节点有设备关联,请先取消关联');
                                }
                            }, (res: any) => {
                                // todo:加载时间过久
                                this.$Message.error('网络情况不好,请稍候再试');
                            });
                        }
                    }
                    return;
                }
                if (i.children && i.children.length > 0) {
                    const child = i.children;
                    delId(child, id);
                }
            }
        };
        delId(this.treeData, this.choseNode[0].id);
    }
    private delOk(params: any, tree: any, j: number) {
        dictionaryApi.DeleteTree(params).then((res: any) => {
            this.$Message.info('删除成功');
            tree.splice(j, 1);
        });
    }
    // 后台返回的数据没有expand,loading,递归添加
    private addExpand(treeData: any[], flag: boolean, source: string) {
      for (let i = 0; treeData && i < treeData.length; i++) {
        /*
         *   vue直接在json数据中添加属性是不行的，无法生成get和set方法，而需要使用vue的set方法
         *   vue.set方法主要是设置对象属性,确保属性被创建后也是响应式的, 同时会触发视图更新
        */
        // 如果 hasChildren 为 0 ,则不加 loading 属性.判断为叶节点
        if (treeData[i].hasChildren) {
            this.$set(treeData[i], 'expand', flag);
            treeData[i].loading = false;
        }
        // 点击搜索按钮, children 返回是正常的数组
        // 点击箭头打开树结构时,后台返回的 children 是 null,此处修改为 []
        if (source === 'load') {
            treeData[i].children = [];
        }
        if (treeData[i].children) {
          treeData[i].children = this.addExpand(treeData[i].children, flag, '');
        }
      }
      return treeData;
    }
}
</script>