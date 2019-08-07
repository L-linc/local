<template>
    <div @click="globalReset" class="modeling_tool">
        <Layout>
            <Header>
                <div class="header_left">
                    <div class="left_top">
                        <icon class="left_logo" />
                        <span style="line-height: 30px;">模型工具</span>
                    </div>
                    <Input v-model="selModName" suffix="ios-search" @on-enter="getModalList" placeholder="搜索" />
                </div>
                <div class="header_right">
                    <div class="right_top">
                        <!-- 选中添加 top_items_active -->
                        <div @click="choosePage(item)" v-for="(item,i) in pageList" :key="i" :class=" item.isAct ? 'top_items top_items_active' : 'top_items'">
                            <span>{{item.name}}</span>
                            <icon @click.stop="closePage(item, i)" class="item_close"/>
                        </div>
                    </div>
                    <div class="right_bottom">
                        <!-- <div @click="addVarList('var')" v-if="curPageType === 'model'"  class="bottom_wrap">
                            <icon class="w_icon variableicon"/>
                            <span>变量库</span>
                        </div> -->
                        <div @click="modelAddHandle('var')" v-if="curPageType === 'var'" class="bottom_wrap">
                            <icon class="w_icon variableicon"/>
                            <span>添加变量</span>
                        </div>
                        <div @click="modelAddHandle('param')"  v-if="curPageType === 'param'" class="bottom_wrap">
                            <icon class="w_icon parametericon"/>
                            <span>添加参数</span>
                        </div>
                        <div @click="btnAddHandle"  v-if="curPageType === 'modelList'" class="bottom_wrap">
                            <icon class="w_icon parametericon"/>
                            <span>添加模型</span>
                        </div>
                        <!-- 选中添加 bottom_wrap_active -->
                        <!-- <div @click="addVarList('param')" v-show="curPageType === 'model'"  class="bottom_wrap">
                            <icon class="w_icon parametericon"/>
                            <span>参数库</span>
                        </div>                       -->
                        <div @click="saveHandle" :class="curEditType ? 'bottom_wrap' : 'bottom_wrap bottom_wrap_active'">
                            <icon class="w_icon saveicon"/>
                            <span>保存</span>
                        </div>
                        <div @click="publishHandle" v-show="curPageType === 'model'" v-has="'SYS_MODEL_PUSH'" class="bottom_wrap">
                            <icon class="w_icon releaseicon"/>
                            <span>发布</span>
                        </div>                       
                    </div>
                </div>
            </Header>
            <Layout>
                <Sider hide-trigger :width=230 class="sider_bar">
                    <div class="sider_item">
                        <div class="sider_item_title">
                            <icon @click="modRowExpand" :class="modRowOpen ? 'expand_down' : 'expand_right'"/>
                            <span class="btn_addmodel" @click="addModelList">模型管理</span>
                        </div>
                        <div v-show="modRowOpen" class="sider_item_row">
                            <!-- 选中添加 row_item_active -->
                            <p v-for="(item, index) in modelList" @dblclick="editNameHandle($event, index, 'model')" @click="selectModel(index, item, 'model')" @contextmenu.prevent="opearMenuShowHandle($event, index, 'model')" :key="item.id" :class="modelIndex === index ? 'row_item row_item_active' : 'row_item' ">{{item.name}}</p>
                        </div>
                    </div>
                    <div class="sider_item">
                        <div class="sider_item_title" @click="libRowExpand" >
                            <icon :class="libRowOpen ? 'expand_down' : 'expand_right'"/>
                            <span>库文件</span>
                        </div>
                        <div v-show="libRowOpen" class="sider_item_row">
                            <div class="row_wrap">
                                <div class="row_title" @click="varRowExpand">
                                    <icon :class="varRowOpen ? 'expand_down' : 'expand_right'"/>
                                    <span>变量库管理</span>
                                </div>
                                <div v-show="varRowOpen">
                                    <!-- 选中添加 row_item_active -->
                                    <!-- <p v-for="(item, index) in variableLibraryList" 
                                        @click="selectVariableLibrary(index, item, 'var')" 
                                        @contextmenu.prevent="opearMenuShowHandle($event, index, 'var')"
                                        @dblclick="editNameHandle($event, index, 'var')"
                                        :key="item.id" 
                                        :class="variableLibraryIndex === index ? 'row_item pl32 row_item_active' : 'row_item pl32' ">
                                        {{item.name}}
                                    </p> -->
                                    <p v-for="(item, index) in variableLibraryList" 
                                        :key="item.id" 
                                         @click="selectVariableLibrary(index, item, 'var')" 
                                        :class="variableLibraryIndex === index ? 'row_item pl32 row_item_active' : 'row_item pl32' ">
                                        {{item.name}}
                                    </p>
                                </div>
                                <!-- <p class="row_item pl32">变量库1</p>
                                <p class="row_item pl32 row_item_active">变量库2</p>
                                <p class="row_item pl32">变量库3</p>
                                <p class="row_item pl32">变量库4</p> -->
                            </div>
                            <!-- <div class="row_wrap">
                                <div class="row_title" @click="paramRowExpand">
                                    <icon :class="paramRowOpen ? 'expand_down' : 'expand_right'"/>
                                    <span>参数库管理</span>
                                </div>
                                <div v-show="paramRowOpen"> -->
                                    <!-- 选中添加 row_item_active -->
                                    <!-- <p v-for="(item, index) in paramLibraryList" 
                                        @click="selectParamLibrary(index, item, 'param')" :key="item.id"
                                        @contextmenu.prevent="opearMenuShowHandle($event, index, 'param')" 
                                        @dblclick="editNameHandle($event, index, 'param')"
                                        :class="paramLibraryIndex === index ? 'row_item pl32 row_item_active' : 'row_item pl32' ">
                                        {{item.name}}
                                    </p>
                                    <p v-for="(item, index) in paramLibraryList" :key="item.id"
                                        @click="selectParamLibrary(index, item, 'param')"
                                        :class="paramLibraryIndex === index ? 'row_item pl32 row_item_active' : 'row_item pl32' ">
                                        {{item.name}}
                                    </p>
                                </div>
                            </div> -->
                        </div>
                    </div>
                </Sider>
                <Layout>
                    <Content class="content_wrap">
                        <div v-show="item.isAct" v-for="(item,i) in pageList" :key="i">
                            <Model v-if="item.type === 'model'" :saveVarType="saveVarType" @checkSave="checkSaveHandle" :modelData="item" :globalClick="globalClickCount" :saveCount="saveCount[item.type]" :publishCount="publishCount"></Model>
                            <modelVariable v-if="item.type === 'var'" :library="item" @checkSave="checkSaveHandle" :addCount="addCount[item.type]" :saveCount="saveCount[item.type]"></modelVariable>
                            <modelParams v-if="item.type === 'param'" :library="item" @checkSave="checkSaveHandle" :addCount="addCount[item.type]" :saveCount="saveCount[item.type]"></modelParams>
                            <ModelListCom v-if="item.type === 'modelList'" @checkSave="checkSaveHandle" :modelListData="modelList" @getModalList="getModalList" @selectPage="selectPage"> </ModelListCom>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
        <div :style="opearBoxStyle" v-show="opearShow" class="opear_bar">
            <p @click="toAddHandle">添加{{opearHandle.typeName}}</p>
            <p @click="toCopyHandle">复制{{opearHandle.typeName}}</p>
            <p v-show="opearHandle.showDelete" @click="toDeleteHandle">删除{{opearHandle.typeName}}</p>
            <p @click="inputShowHandle(false, opearHandle.index, opearHandle.type)">重命名</p>
        </div>
        <div :style="editBoxStyle" v-show="editShow" class="edit_bar">
            <Input @on-blur="editCbFun" @on-enter="editCbFun" ref='inputEditName' v-model="editName" />
        </div>
        <Modal
            class="model_modal"
            v-model="addFlag"
            :loading="addLoading"
            :title="addTitle"
            width="580px"
            :mask-closable="false"
            @on-ok="toAddVar"
            @on-cancel="hideModel">
            <Table @on-selection-change="changeVar" ref="selection" :columns="columnsData" :data="tableData"></Table>         
        </Modal>
    </div>
</template>

<script lang="ts">
import './modelingTool.less';
import Vue from 'vue';
import moToolApi from '@/api/modelingTool.ts';
import {Component} from 'vue-property-decorator';
import Model from '@/views/modelingTool/Model.vue';
import modelVariable from '@/views/modelingTool/modelVariable.vue';
import modelParams from '@/views/modelingTool/modelParams.vue';
import ModelListCom from '@/views/modelingTool/ModelList.vue';
@Component({
  components: {
    Model,
    modelVariable,
    modelParams,
    ModelListCom,
  },
})
export default class ModelingTool extends Vue {

    // data
    private selModName: string = ''; // 搜索框模型名称
    private modelIndex: number = -1; // 模型列表, 默认选中第一个
    private variableLibraryIndex: number = -1; // 变量库,默认选中第一个
    private paramLibraryIndex: number = -1; // 参数库,默认选中第一个
    private globalClickCount: number = 0; // 记录全局点击时间触发次数
    private addCount: any = {
        var: 0,
        param: 0,
        modelList: 0,
        model: 0,
    }; // 记录添加变量触发次数
    private saveCount: any = {
        var: 0,
        param: 0,
        modelList: 0,
        model: 0,
    }; // 记录保存触发次数
    private publishCount: number = 0;
    private saveVarType: any[] = [1, 1];
    private variableLibraryList: any[] = []; // 变量库
    private paramLibraryList: any[] = []; // 参数库
    private modelList: any[] = []; // 模型列表;
    private pageList: any[] = []; // 页面标签List
    private opearHandle: object = {
        type: 'model',
        typeName: '模型',
        index: -1,
        left: '0',
        top: '0',
    };  // 模型、变量、参数右键编辑操作定位的对象;
    private opearBoxStyle: object = {
        left: '0',
        top: '0',
    }; // 模型、变量、参数右键编辑框定位样式;
    private editBoxStyle: object = {
        left: '0',
        top: '0',
    }; // 模型、变量、参数右键编辑框定位样式;
    private opearShow: boolean = false; // 是否展示模型、变量、参数右键编辑框;
    private editName: string = ''; // 重命名input值
    private editShow: boolean = false; // 是否展示模型、变量、参数右键编辑框;
    private editStoreRect: any = {};  // 存储右键编辑的rect对象;
    private modRowOpen: boolean = true; // 模型库默认展开全部列表;
    private libRowOpen: boolean = true; // 库文件默认展开全部列表;
    private varRowOpen: boolean = true; // 变量库默认展开全部列表;
    private paramRowOpen: boolean = true; // 参数库默认展开全部列表;
    private curPageType: string = '';
    private addTitle: string = '添加变量库'; // modal标题
    private addLoading: boolean = true; // 弹窗加载
    private addFlag: boolean = false; // 弹窗显示
    private columnsData: any[] = [
            {
                type: 'selection',
                width: 60,
                align: 'center',
            },
            {
                title: '参数库名称',
                key: 'name',
            },
            {
                title: '操作',
                key: 'opear',
                align: 'center',
                render: (h: any, params: any): any => {
                    if (params.row.use !== '0') {
                        return h('div', [
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
                                        (this as any).toDelete(params.row);
                                    },
                                },
                            }),
                        ]);
                    }
                },
            },
        ];  // 表格column;
    private tableData: any[] = [];  // 表格data;
    private checkVarList: any = []; // 选中的变量list 和 varList;
    private routeParamId: any = '';  // 初始化页面Id

    // // computed
    get curEditType(): boolean {
        let flag = false;
        this.pageList.map((ele: any) => {
            if (ele.isAct && ele.isEdit) {
                flag = true;
            }
        });
        return flag;
    }

    // life-cycle
    private created() {
        this.getModalList();
        this.getVarList();
        this.getParamList();
        this.addModelList();
        this.routeParamId = this.$route.query.id || '';
    }
    // methods

    private getModalList(id?: string) { // 获取模型list
        const param = {
            name: this.selModName,
        };
        moToolApi.getModelList(param).then((res: any = {}) => {
            const data = res.data || [];
            this.modelList = data;
            if (this.routeParamId || id) {
                data.map((ele: any, i: number) => {
                    if (ele.id === this.routeParamId || ele.id === id) {
                        this.selectModel(i, ele, 'model');
                    }
                });
                this.routeParamId = '';
            }
            // const url = document.location.toString().split('?');
            // const defModelParam: any = {};
            // if (url.length > 1) {
            //     const urlParams = url[1].split('&');
            //     for (const i of urlParams) {
            //         defModelParam[i.split('=')[0]] = unescape(i.split('=')[1]);
            //     }
            // }
            // if (this.$route.query.id) {
            //     for (let i = 0; i < this.modelList.length; i++) {
            //         if (this.modelList[i].id === this.$route.query.id) {
            //             this.selectModel(i, this.modelList[i], 'model');
            //         }
            //     }
            // }
        });
    }

    private getVarList(id?: string) { // 获取变量list
        moToolApi.getVariableLibrarylList({}).then((res: any = {}) => {
            const data = res.data || [];
            this.variableLibraryList = data;
            if (id) {
                data.map((ele: any) => {
                    if (ele.id === id) {
                        this.selectPage(ele, 'var');
                    }
                });
                this.routeParamId = '';
            }
        });
    }

    private getParamList(id?: string) { // 获取参数list
        moToolApi.getParameterList({}).then((res: any = {}) => {
            const data = res.data || [];
            this.paramLibraryList = data;
            if (id) {
                data.map((ele: any) => {
                    if (ele.id === id) {
                        this.selectPage(ele, 'param');
                    }
                });
                this.routeParamId = '';
            }
        });
    }

    // 模型切换,样式切换
    private selectModel(i: number, ele?: any, type?: string) {
        this.modelIndex = i;
        this.variableLibraryIndex = -1;
        this.paramLibraryIndex = -1;
        if (type) {
            this.selectPage(ele, type);
        }
    }

    // 变量库切换,样式切换
    private selectVariableLibrary(i: number, ele?: any, type?: string) {
        this.modelIndex = -1;
        this.variableLibraryIndex = i;
        this.paramLibraryIndex = -1;
        if (type) {
            this.selectPage(ele, type);
        }
    }

    // 参数库切换,样式切换
    private selectParamLibrary(i: number, ele?: any, type?: string) {
        this.modelIndex = -1;
        this.variableLibraryIndex = -1;
        this.paramLibraryIndex = i;
        if (type) {
            this.selectPage(ele, type);
        }
    }

    // 模型库展开/收起
    private modRowExpand() {
        this.modRowOpen = !this.modRowOpen;
    }

    // 库文件展开/收起
    private libRowExpand() {
        this.libRowOpen = !this.libRowOpen;
    }

    // 变量库展开/收起
    private varRowExpand() {
        this.varRowOpen = !this.varRowOpen;
    }

    // 参数库展开/收起
    private paramRowExpand() {
        this.paramRowOpen = !this.paramRowOpen;
    }

    // 模型、参数、变量鼠标右键显示控制面板;
    private opearMenuShowHandle(event: any, index: number, type: string) {
        event = event || window.event;
        const target: any = event.targte || event.srcElement;
        let showDelete: boolean = false;
        const rect = target.getBoundingClientRect();
        if ((type === 'model' && this.modelList.length > 1) || (type === 'var' && this.variableLibraryList.length > 1) || (type === 'param' && this.paramLibraryList.length > 1)) {
            // 显示删除操作判断;
            showDelete = true;
        }
        switch (type) {
            case 'model':
                this.selectModel(index);
                break;
            case 'var':
                this.selectVariableLibrary(index);
                break;
            case 'param':
                this.selectParamLibrary(index);
                break;
        }
        this.opearHandle = {
            type,
            typeName: this.transVarName(type),
            index,
            showDelete,
            left: rect.left,
            top: rect.top,
        };
        const intval: number = type === 'model' ? 0 : 32;
        this.opearBoxStyle = {
            left: rect.left + 32 + intval + 'px',
            top: rect.top + rect.height + 'px',
        };
        // this.editStoreRect = {
        //     index,
        //     type,
        //     left: rect.left,
        //     top: rect.top,
        // };
        this.opearShow = true;
    }

    // 双击修改名称
    private editNameHandle(event: any, index: number, type: string) {
        event = event || window.event;
        const target: any = event.targte || event.srcElement;
        const rect = target.getBoundingClientRect();
        this.inputShowHandle(rect, index, type);
    }

    // 显示修改模型、变量、参数名称编辑框
    private inputShowHandle(rect: any, index: number, type: string) {
        if (!rect) {
            // 点击重命名的编辑重新赋值;
            rect = this.opearHandle;
            switch (rect.type) {
                case 'model':
                    this.selectModel(rect.index);
                    break;
                case 'var':
                    this.selectVariableLibrary(rect.index);
                    break;
                case 'param':
                    this.selectParamLibrary(rect.index);
                    break;
            }
        } else {
            this.opearHandle = {
                index,
                type,
                left: rect.left,
                typeName: this.transVarName(type),
                top: rect.top,
            };
        }
        this.editName = '';
        this.editBoxStyle = {
            left: rect.left + 'px',
            top: rect.top + 'px',
        };
        this.editShow = true;
        this.$nextTick(() => {
            (this as any).$refs.inputEditName.focus();
        });
    }

    // 编辑修改名称回调
    private editCbFun() {
        if (!this.editShow) {
            return;
        }
        const val = this.editName.trim();
        this.editShow = false;
        const rect: any = this.opearHandle;
        if (!val) {
            // val = this.transVarName(rect.type) + '1';
            return;
        }
        switch (rect.type) {
            case 'model':
                // if (!rect.opearType) {
                moToolApi.reNameModel({id: this.modelList[rect.index].id, name: val}).then((res: any = {}) => {
                    this.$Message.success('重命名成功');
                    this.pageList.map((ele: any) => {
                        if (ele.id === this.modelList[rect.index].id && ele.type === 'model') {
                            ele.name = val;
                        }
                    });
                    this.getModalList();
                });
                // } else {
                //     moToolApi.addModel({name: val}).then((res: any = {}) => {
                //         this.getModalList();
                //     }, () => {
                //         this.variableLibraryList.splice(rect.index, 1);
                //     });
                // }
                break;
            case 'var':
                // if (!rect.opearType) {
                moToolApi.reNameVar({id: this.variableLibraryList[rect.index].id, name: val}).then((res: any = {}) => {
                    this.$Message.success('重命名成功');
                    this.pageList.map((ele: any) => {
                        if (ele.id === this.variableLibraryList[rect.index].id && ele.type === 'var') {
                            ele.name = val;
                        }
                    });
                    this.getVarList();
                });
                // } else {
                //     moToolApi.addVar({name: val}).then((res: any = {}) => {
                //         this.getVarList();
                //     }, () => {
                //         this.variableLibraryList.splice(rect.index, 1);
                //     });
                // }
                break;
            case 'param':
                // if (!rect.opearType) {
                moToolApi.reNameParam({id: this.paramLibraryList[rect.index].id, name: val}).then((res: any = {}) => {
                    this.$Message.success('重命名成功');
                    this.pageList.map((ele: any) => {
                        if (ele.id === this.paramLibraryList[rect.index].id && ele.type === 'param') {
                            ele.name = val;
                        }
                    });
                    this.getParamList();
                });
                // } else {
                //     moToolApi.addParam({name: val}).then((res: any = {}) => {
                //         this.getParamList();
                //     }, () => {
                //         this.paramLibraryList.splice(rect.index, 1);
                //     });
                // }
                break;
        }
    }

    private btnAddHandle() {  // 添加模型按钮
        // const name = this.checkRepateName('model') || '模型1';
        moToolApi.addModel({}).then((res: any = {}) => {
            this.$Message.success('添加成功');
            this.getModalList(res.data.id);
        });
    }

    // 添加模型、参数、变量;
    private toAddHandle() {
        const rect: any = this.opearHandle;
        // const name = this.checkRepateName(rect.type) || '';
        switch (rect.type) {
            case 'model':
                moToolApi.addModel({}).then((res: any = {}) => {
                    this.$Message.success('添加成功');
                    this.getModalList(res.data.id);
                });
                break;
            case 'var':
                moToolApi.addVar({}).then((res: any = {}) => {
                    this.$Message.success('添加成功');
                    this.getVarList(res.data.id);
                });
                break;
            case 'param':
                moToolApi.addParam({}).then((res: any = {}) => {
                    this.$Message.success('添加成功');
                    this.getParamList(res.data.id);
                });
                break;
        }
        // rect.opearType = 'add';
        // switch (rect.type) {
        //     case 'model':
        //         this.modelList.splice(rect.index, 0 , {
        //             name: '模型1',
        //             content: '',
        //             formula: '',
        //             describe: '',
        //         });
        //         this.selectModel(rect.index + 1);
        //         break;
        //     case 'var':
        //         this.variableLibraryList.splice(rect.index, 0 , {
        //             name: '变量1',
        //             content: '',
        //             formula: '',
        //             describe: '',
        //         });
        //         this.selectVariableLibrary(rect.index + 1);
        //         break;
        //     case 'param':
        //         this.paramLibraryList.splice(rect.index, 0 , {
        //             name: '参数1',
        //             content: '',
        //             formula: '',
        //             describe: '',
        //         });
        //         this.selectParamLibrary(rect.index + 1);
        //         break;
        // }
        // this.editName = '';
        // this.editBoxStyle = {
        //     left: rect.left + 'px',
        //     top: rect.top - 0 + 24 + 'px',
        // };
        // this.editShow = true;
        // this.$nextTick(() => {
        //     (this as any).$refs.inputEditName.focus();
        // });
    }

    // private checkRepateName(type: string, index?: number): string | void {
    //     // 检查重复的名称;
    //     let flag: boolean = false;
    //     index = index || 1;
    //     let name = '';
    //     switch (type) {
    //         case 'model':
    //             name = '新模型' + index;
    //             this.modelList.map((ele: any) => {
    //                 if (ele.name === name) {
    //                     flag = true;
    //                 }
    //             });
    //             break;
    //         case 'var':
    //             name = '变量库' + index;
    //             this.variableLibraryList.map((ele: any) => {
    //                 if (ele.name === name) {
    //                     flag = true;
    //                 }
    //             });
    //             break;
    //         case 'param':
    //             name = '参数库' + index;
    //             this.paramLibraryList.map((ele: any) => {
    //                 if (ele.name === name) {
    //                     flag = true;
    //                 }
    //             });
    //             break;
    //     }
    //     if (flag) {
    //         index ++;
    //         return this.checkRepateName(type, index);
    //     } else {
    //         return name;
    //     }
    // }

    // 复制模型、参数、变量;
    private toCopyHandle() {
        const rect: any = this.opearHandle;
        switch (rect.type) {
            case 'model':
                // this.modelList[rect.index].name = val;
                moToolApi.copyModel({id: this.modelList[rect.index].id}).then((res: any = {}) => {
                    this.$Message.success('复制成功');
                    this.getModalList(res.data.id);
                });
                break;
            case 'var':
                // this.variableLibraryList[rect.index].name = val;
                moToolApi.copyVar({id: this.variableLibraryList[rect.index].id}).then((res: any = {}) => {
                    this.$Message.success('复制成功');
                    this.getVarList(res.data.id);
                });
                break;
            case 'param':
                // this.paramLibraryList[rect.index].name = val;
                moToolApi.copyParam({id: this.paramLibraryList[rect.index].id}).then((res: any = {}) => {
                    this.$Message.success('复制成功');
                    this.getParamList(res.data.id);
                });
                break;
        }
    }

    // 删除模型、参数、变量;
    private toDeleteHandle() {
        const rect: any = this.opearHandle;
        const typeName = this.transVarName(rect.type);
        let currName: string = '';
        switch (rect.type) {
            case 'model':
                currName = this.modelList[rect.index].name;
                break;
            case 'var':
                currName = this.variableLibraryList[rect.index].name;
                break;
            case 'param':
                currName = this.paramLibraryList[rect.index].name;
                break;
        }
        (this as any).$Modal.confirm({
            title: `删除${typeName}`,
            content: `<p>是否确定删除${typeName}:${currName}？</p>`,
            loading: true,
            onOk: () => {
                switch (rect.type) {
                case 'model':
                    // this.modelList[rect.index].name = val;
                    moToolApi.deleteModel({id: this.modelList[rect.index].id}).then((res: any) => {
                        this.$Message.success('删除成功');
                        this.pageList.map((ele: any, i: number) => {
                            if (ele.id === this.modelList[rect.index].id && ele.type === 'model') {
                                if (ele.isAct) {
                                    if (i - 1 >= 0) {
                                        this.pageList[i - 1].isAct = true;
                                    } else {
                                        if (this.pageList[i + 1]) {
                                            this.pageList[i + 1].isAct = true;
                                        }
                                    }
                                }
                                this.pageList.splice(i, 1);
                            }
                        });
                        this.getModalList();
                        this.$Modal.remove();
                    }, () => {
                        this.$Modal.remove();
                    });
                    break;
                case 'var':
                    // this.variableLibraryList[rect.index].name = val;
                    moToolApi.deleteVar({id: this.variableLibraryList[rect.index].id}).then((res: any = {}) => {
                        this.$Message.success('删除成功');
                        this.pageList.map((ele: any, i: number) => {
                            if (ele.id === this.variableLibraryList[rect.index].id && ele.type === 'var') {
                                if (ele.isAct) {
                                    if (i - 1 >= 0) {
                                        this.pageList[i - 1].isAct = true;
                                    } else {
                                        this.pageList[i + 1].isAct = true;
                                    }
                                }
                                this.variableLibraryList.splice(i, 1);
                            }
                        });
                        this.getVarList();
                        this.$Modal.remove();
                    }, () => {
                        this.$Modal.remove();
                    });
                    break;
                case 'param':
                    // this.paramLibraryList[rect.index].name = val;
                    moToolApi.deleteParam({id: this.paramLibraryList[rect.index].id}).then((res: any = {}) => {
                        this.$Message.success('删除成功');
                        this.pageList.map((ele: any, i: number) => {
                            if (ele.id === this.paramLibraryList[rect.index].id && ele.type === 'var') {
                                if (ele.isAct) {
                                    if (i - 1 >= 0) {
                                        this.pageList[i - 1].isAct = true;
                                    } else {
                                        this.pageList[i + 1].isAct = true;
                                    }
                                }
                                this.paramLibraryList.splice(i, 1);
                            }
                        });
                        this.getParamList();
                        this.$Modal.remove();
                    }, () => {
                        this.$Modal.remove();
                    });
                    break;
                }
            },
        });
    }

    // 模型、参数、变量中英文互转;
    private transVarName(type: string) {
        let txt = '';
        switch (type) {
            case 'modelList':
                txt = '模型库';
                break;
            case 'model':
                txt = '模型';
                break;
            case 'var':
                txt = '变量库';
                break;
            case 'param':
                txt = '参数库';
                break;
        }
        return txt;
    }

    // 监听全局清除显示的菜单;
    private globalReset() {
        this.opearShow = false;
        this.globalClickCount ++;
    }

    // 选择当前页
    private selectPage(ele: any, type?: string) {
        let flag: boolean = false;
        type = type || '';
        this.pageList.map((item: any) => {
            if (item.id === ele.id && item.name === ele.name) {
                flag = true;
                item.isAct = true;
            } else {
                item.isAct = false;
            }

        });

        if (this.pageList.length > 12) {
            this.pageList.shift();
        }

        if (!flag) {
            this.pageList.push({
                id: ele.id,
                name: ele.name,
                data: ele,
                type,
                isAct: true,
                isEdit: false,
            });
        }
        this.curPageType = type;
    }

    // 点击标签页选择页面
    private choosePage(ele: any) {
        if (ele.isAct) {
            return;
        }
        this.pageList.map((item: any) => {
            item.isAct = false;
        });
        ele.isAct = true;
        this.curPageType = ele.type;
        if (ele.type === 'model') {
            this.saveVarType = [0, this.saveVarType[1] ++];
            this.$nextTick(() => {
                this.saveVarType = [1, this.saveVarType[1] ++];
            });
        }
    }

    // 关闭页签
    private closePage(item: any, index: number) {
        if (this.pageList.length <= 1) {
            this.$Message.warning('最后一个标签页不能被删除');
        }
        if (item.isAct) {
            if (index === 0) {
                this.pageList[index + 1].isAct = true;
                this.curPageType = this.pageList[index + 1].type;
            } else {
                this.pageList[index - 1].isAct = true;
                this.curPageType = this.pageList[index - 1].type;
            }
        }
        this.pageList.splice(index, 1);
    }

    // 添加模型库
    private addModelList() {
        let flag = false;
        this.pageList.map((ele: any) => {
            ele.isAct = false;
            if (ele.type === 'modelList') {
                flag = true;
                ele.isAct = true;
            }
        });
        if (!flag) {
           this.pageList.push({
                id: '模型库',
                name: '模型库',
                data: '模型库',
                type: 'modelList',
                isAct: true,
                isEdit: false,
           });
        }
        this.curPageType = 'modelList';
    }

    // 弹窗确定绑定参数库或者变量库
    private toAddVar() {
        const type: string = this.addTitle === '添加变量库' ? 'var' : 'param';
        let modelId: string | number = '';
        this.pageList.map((ele: any) => {
            if (ele.isAct) {
                modelId = ele.id;
            }
        });
        const params = {
            modelId,
            type: type === 'var' ? 0 : 1,
            libraryIds: this.checkVarList,
        };
        moToolApi.bindVarPar(params).then((res: any = {}) => {
            this.$Message.success('绑定成功');
            this.hideModel();
            this.saveVarType = [type === 'var' ? 0 : 1, this.saveVarType[1] ++];
        });
        // if (type === 'var') {
        //     moToolApi.bindVarPar().then((res: any = {}) => {});
        // } else {
        //     moToolApi.getBindVarList().then((res: any = {}) => {});
        // }
    }

    // 隐藏弹窗
    private hideModel() {
        this.addFlag = false;
    }

    // 添加参数库变量库
    private addVarList(type: string) {
        this.checkVarList = [];
        let modelId: string | number = '';
        this.pageList.map((ele: any) => {
            if (ele.isAct) {
                modelId = ele.id;
            }
        });
        const params = {
            id: modelId,
        };
        if (type === 'var') {
            this.columnsData[1].title = '变量库名称';
            this.addTitle = '添加变量库';
            moToolApi.getBindVarList(params).then((res: any = {}) => {
                const data = res.data || [];
                data.map((ele: any) => {
                    if (ele.use === '1') {
                        ele._disabled = true;
                        this.checkVarList.push(ele.id);
                    }
                });
                this.tableData = data;
            });
        } else {
            this.columnsData[1].title = '参数库名称';
            this.addTitle = '添加参数库';
            moToolApi.getBindParamList(params).then((res: any = {}) => {
                const data = res.data || [];
                data.map((ele: any) => {
                    if (ele.use === '1') {
                        ele._disabled = true;
                        this.checkVarList.push(ele.id);
                    }
                });
                this.tableData = data;
            });
        }
        this.addFlag = true;
    }

    // 删除选中的参数库变量库
    private toDelete(data: any) {
        this.tableData[data._index].use  = '0';
        this.tableData[data._index]._disabled  = false;
        let index = 0;
        this.checkVarList.map((ele: any, i: number) => {
            if (ele === data.id) {
                index = i;
            }
        });
        this.checkVarList.splice(index, 1);
    }

    // 列表添加变量、添加参数、添加模型
    private modelAddHandle(type: string) {
        this.addCount[type] ++;
    }

    // 变量库/参数库选中某一项
    private changeVar(data: any) {
        const newArray: any = [...this.checkVarList];
        data.map((ele: any) => {
            newArray.push(ele.id);
        });
        this.checkVarList = [...new Set(newArray)];
    }

    private saveHandle() {
        let type: string = 'model';
        if (!this.curEditType) {
            return;
        }
        this.pageList.map((ele: any) => {
            if (ele.isAct) {
                type = ele.type;
            }
        });
        if (type === 'model') {
            this.getModalList();
        }
        this.saveCount[type] ++;
        this.checkSaveHandle(false);
    }

    private publishHandle() {
        this.publishCount ++;
    }

    private checkSaveHandle(val?: boolean) {
        this.pageList.map((ele: any) => {
            if (ele.isAct) {
                ele.isEdit = val === undefined ? false : val;
            }
        });
    }
}
</script>
