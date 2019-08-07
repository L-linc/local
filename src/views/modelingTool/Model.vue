<template>
    <div class="modal_wrap">
       <div class="des_wrap">
           <div class="tit_bar">
               <span>描述</span>
               <icon @click="dspShowHandle" :class="dspShow ? 'icon_des' : 'icon_des des_act'" />
           </div>
           <div v-show="dspShow" class="des_txtar">
               <Input v-model="dsp" type="textarea" placeholder="请输入描述内容" />
           </div>
        </div>
        <div class="model_content">
            <div class="model_if">
                <p class="model_tit">
                    如果
                </p>
                <div class="model_li" v-for="(item,i) in condList" :key="i">
                    <Cascader :ref="`testCas${i}-${j}`" :style="'margin-left:' + (j === 0 ? (ele.type === 'select' ? ((ele.level - 1) * 180  + 10) : (ele.level * 180 + 20)) : '') + 'px'" v-for="(ele,j) in item" :key="j" :data="dataList[ele.type]" @on-change="handleChange($event, ele, j, item , i)" trigger="hover">
                        <span v-if="ele.type === 'select'" class="condi_bar"  @click.stop="selectShowHandle($event,ele,item,i)">
                            <span class="condi_tit" @click.stop="">{{ele.value}}</span>
                            <icon class="icon_sel" />
                        </span>                       
                        <span v-else class="var_bar">
                            <em v-if="ele.type === 'leftBra'" @click.stop="">(</em>
                            <span v-if="ele.type !== 'symType' && ele.type !== 'rightBra' && ele.type !== 'leftBra'" @click="testFun" class="other_tit">{{ele.value}}</span>
                            <span class="btn_sym" :style="{'background': ele.symVla && ele.symVla.length > 0 ? '#eaf2fe' : '#FFFFFF'}" v-if="ele.type === 'symType'" @click.stop="countHandle($event,ele,item,j)">{{ele.symVla}}</span>
                            <em v-if="ele.type === 'rightBra'"  @click.stop="">)</em>
                        </span>                        
                        <span @click.stop="" class="inputVal_bar" v-if="ele.type === 'valType' || ele.type === 'countType'" v-show="ele.showInput">
                            <Input @click.stop="" :ref="'input'+ i + j" @on-blur="changeVal($event,ele)" @on-enter="changeVal($event,ele)" v-model="ele.value" />
                        </span>
                    </Cascader>
                    <icon @click="delCondi(item, i, 'if')" v-if="item.length > 1 || item[0].type !== 'select'" class="icon_del" />    
                </div>
            </div>
            <!-- <div class="model_else">
                <p class="model_tit">
                    那么
                    <span @click="addActHandle('else')" class="btn_add">+ 添加动作</span>
                </p>
                <div class="model_li" v-for="(item,i) in elseList" :key="i">
                    <icon @click="delCondi(item, i, 'else')"  class="icon_del" />
                    <Cascader v-for="(ele,j) in item" :key="j" :data="dataList[ele.type]" @on-change="handleChange($event, ele, j, item , i)" trigger="hover">
                        <span v-if="j === 0" class="else_tit"  @click.stop="">
                            {{ele.value}}
                        </span>                       
                        <span v-else class="var_bar">
                            <em v-if="ele.type === 'leftBra'" @click.stop="">(</em>
                            <span v-if="ele.type !== 'symType' && ele.type !== 'rightBra' && ele.type !== 'leftBra'" @click="testFun" class="other_tit">{{ele.value}}</span>
                            <span class="btn_sym" v-if="ele.type === 'symType'" @click.stop="countHandle($event,ele,item,j)">{{ele.symVla}}</span>
                            <em v-if="ele.type === 'rightBra'"  @click.stop="">)</em>
                        </span>                        
                        <span @click.stop="" class="inputVal_bar" v-if="ele.type === 'valType' || ele.type === 'countType'" v-show="ele.showInput">
                            <Input @click.stop="" :ref="'input'+ i + j" @on-blur="changeVal($event,ele)" @on-enter="changeVal($event,ele)" v-model="ele.value" />
                        </span>
                    </Cascader>
                </div>
            </div>
            <div class="model_final">
                <p @click= "saveHandle" class="model_tit">
                    否则
                    <span class="btn_add">+ 添加动作</span>
                </p>
                <div v-for="(item,i) in otherList" :key="i">
                    
                </div>
            </div> -->
        </div>
        <div class="count_bar" :style="showCountStyle" v-show="showCountBar">
            <p v-for="(item,i) in countDataList" :key="i" @click="setSym($event,item)">{{item.name}}</p>
        </div>    
        <div class="count_bar" :style="showCountStyle" v-show="showSelectBar">
            <p v-for="(item,i) in selectDataList" :key="i" @click="selectHandle($event,item)">{{item.name}}</p>
        </div>     
    </div>
</template>

<script lang="ts">
import './modelingTool.less';
import Vue from 'vue';
import moToolApi from '@/api/modelingTool.ts';
import {Component, Prop, Watch} from 'vue-property-decorator';
@Component
export default class ModelingTool extends Vue {
    @Prop({
        type: Object,
        default: () => {
            return {};
        },
    })
    private modelData: any;  //  props

    @Prop({
        type: Number,
        default: () => {
            return 0;
        },
    })
    private globalClick: any;  //  props

    @Prop({
        type: Array,
        default: () => {
            return [];
        },
    })
    private saveVarType: any;  //  props

    @Prop({
        type: Number,
        default: () => {
            return 2;
        },
    })
    private saveCount: any;  //  props

    @Prop({
        type: Number,
        default: () => {
            return 2;
        },
    })
    private publishCount: any;  //  props

    private dsp: string = '';   // 描述model
    private dspShow: boolean = true;  // 描述显示handle
    private condList: any[] = [ // 整个页面if条件list
        [
            {
                type: 'select',
                value: 'And',
                level: 1,

            },
        ],
    ];
    private elseList: any[] = []; // 整个页面else条件list
    private otherList: any[] = []; // 整个页面else条件list
    private showCountBar: boolean = false;  // 运算框显示
    private showSelectBar: boolean = false;  // 运算框显示
    private showCountStyle: any = {
        left: '0',
        top: '0',
    }; // 运算框样式
    private countDataList = [  // 运算符数组
        {
            name: '+',
            value: '+',
            label: '+',
        },
        {
            name: '-',
            value: '-',
            label: '-',
        },
        {
            name: '×',
            value: '*',
            label: '×',
        },
        {
            name: '÷',
            value: '/',
            label: '÷',
        },
        {
            name: '%',
            value: '%',
            label: '%',
        },
        {
            name: '删除',
            value: '',
            label: '',
        },
    ];
    private selectDataList = [  // 运算符数组
        // {
        //     name: '请选择条件',
        //     value: '请选择条件',
        // },
        {
            name: 'And',
            value: 'And',
        },
        {
            name: 'Or',
            value: 'Or',
        },
        {
            name: 'Add condition',
            value: 'Add condition',
        },
        {
            name: 'Add co-condition',
            value: 'Add co-condition',
        },
        // {
        //     name: 'Copy condition',
        //     value: 'Copy condition',
        // },
        // {
        //     name: 'Paste condition',
        //     value: 'Paste condition',
        // },
        {
            name: 'Delete condition',
            value: 'Delete condition',
        },
    ];
    private storeCondiEle: any = null;  // 存储当前操作的类型对象
    private storeCondiItem: any = null;  // 存储当前操作的类型条件数组
    private storeCondiIndex: number = 0;  // 存储当前操作的类型条件数组index
    private storeCopyCondition: any = null;  // 存储当前复制的条件
    private dataList: any = {};  // 模型各类型级联数据
    private varlibList: any[] = []; // 当前模型绑定的变量库list;
    private parlibList: any[] = []; // 当前模型绑定的参数库list;
    private useVarList: any = []; // 当前使用的变量;
    private useParList: any = []; // 当前使用的变量;

    @Watch('globalClick')
    private onChangeGlobalClick() {
        if (this.modelData.isAct) {
            this.globalReset();
        }
    }

    @Watch('saveVarType')
    private onChangeSaveVarType(val: any[]) {
        if (this.modelData.isAct) {
            this.getVarlibList(val[0]);
        }
    }

    @Watch('saveCount')
    private onChangeSaveCount(val: number) {
        if (this.modelData.isAct) {
            this.saveModel(1);
        }
    }

    @Watch('publishCount')
    private onChangePublishCount(val: number) {
        if (this.modelData.isAct) {
            this.saveModel(2);
        }
    }

    private created() {
        this.getVarlibList(0);
        this.getVarlibList(1);
        let condList: any = null;
        condList = this.modelData.data.formula ? JSON.parse(this.modelData.data.formula) : [
            [
                {
                    type: 'select',
                    value: 'And',
                    level: 1,

                },
            ],
        ];
        this.condList = condList;
        this.dsp = this.modelData.data.describe;
        // this.useVarList = this.modelData.data.useField ? JSON.parse(this.modelData.data.useField) : [];
        // this.useParList = this.modelData.data.useConstant ? JSON.parse(this.modelData.data.useConstant) : [];
    }

    private dspShowHandle() { //  描述输入框显示控制
        this.dspShow = !this.dspShow;
    }

    private getVarlibList(type: number) { // 获取当前模型绑定的变量库list;
        const params = {
            modelId: this.modelData.id,
            type,
        };
        moToolApi.geVarlibList(params).then((res: any = {}) => {
            const data: any = res.data || [];
            if (type === 0) {
                data.map((ele: any) => {
                    ele.value = ele.name;
                    ele.label = ele.name;
                    ele.children = ele.varietys || [];
                    ele.children.map((item: any) => {
                        item.value = item.name;
                        item.children = item.fields || [];
                        item.label = item.name;
                        item.children.map((childItem: any) => {
                            childItem.value = childItem.name;
                            childItem.label = childItem.name;
                        });
                    });
                });
                this.varlibList = data;
            } else {
                data.map((ele: any) => {
                   ele.children = ele.fields || [];
                   ele.children.map((item: any) => {
                       item.value = item.name;
                       item.label = item.name;
                   });
                   ele.value = ele.name;
                   ele.label = ele.name;
                });
                this.parlibList = data;
            }
            this.dataList = {  // 模型各类型级联数据
                select: [
                    // {
                    //     value: '请输入条件',
                    //     label: '请选择条件',
                    // },
                    {
                        value: 'And',
                        label: 'And',
                    },
                    {
                        value: 'Or',
                        label: 'Or',
                    },
                    {
                        value: 'Add condition',
                        label: 'Add condition',
                    },
                    {
                        value: 'Add co-condition',
                        label: 'Add co-condition',
                    },
                    {
                        value: 'Copy condition',
                        label: 'Copy condition',
                    },
                    {
                        value: 'Paste condition',
                        label: 'Paste condition',
                    },
                    {
                        value: 'Delete conditionn',
                        label: 'Delete condition',
                    },
                ],
                condition: [
                    {
                        value: '选择变量',
                        label: '选择变量',
                        children: this.varlibList,
                    },
                    // {
                    //     value: '选择参数',
                    //     label: '选择参数',
                    //     children: this.parlibList,
                    // },
                ],
                compare: [
                    {
                        value: '大于',
                        label: '大于',
                        transVal: '>',
                    },
                    {
                        value: '大于等于',
                        transVal: '>=',
                        label: '大于等于',
                    },
                    {
                        value: '小于',
                        transVal: '<',
                        label: '小于',
                    },
                    {
                        value: '小于等于',
                        transVal: '<=',
                        label: '小于等于',
                    },
                    {
                        value: '等于',
                        transVal: '==',
                        label: '等于',
                    },
                    {
                        value: '不等于',
                        transVal: '!=',
                        label: '不等于',
                    },
                ],
                valType: [
                    {
                        value: '输入值',
                        label: '输入值',
                    },
                    {
                        value: '选择变量',
                        label: '选择变量',
                        children: this.varlibList,
                    },
                    // {
                    //     value: '选择参数',
                    //     label: '选择参数',
                    //     children: this.parlibList,
                    // },
                ],
                countType: [
                    {
                        value: 'value',
                        label: '值',
                        children:  [
                            {
                                value: '输入值',
                                label: '输入值',
                            },
                            {
                                value: '选择变量',
                                label: '选择变量',
                                children: this.varlibList,
                            },
                            // {
                            //     value: '选择参数',
                            //     label: '选择参数',
                            //     children: this.parlibList,
                            // },
                        ],
                    },
                    {
                        value: 'brackets',
                        label: '括号',
                    },
                ],
                actType: [
                    {
                        value: '输出',
                        label: '输出',
                    },
                    {
                        value: '变量赋值',
                        label: '变量赋值',
                    },
                ],
            };
        });
    }

    private handleChange(val: any, ele: any, index: number, arrayItem: any, itemIndex: number) { //  选择级联数据
        console.log('ele.type', ele.type);
        this.$emit('checkSave', true);
        switch (ele.type) {
            case'select':
                this.selectHandle(val, ele , index, arrayItem);
                break;
            case'condition':
                this.condiHandle(val, ele , index, arrayItem, itemIndex);
                break;
            case'compare':
                this.compareHandle(val, ele , index, arrayItem, itemIndex);
                break;
            case'valType':
                this.valTypeHandle(val, ele , index, arrayItem, itemIndex);
                break;
            case 'countType':
                this.countTypeHandle(val, ele , index, arrayItem, itemIndex);
                break;
            case 'actType':
                this.actTypeHandle(val, ele , index, arrayItem, itemIndex);
                break;
        }
    }

    private selectShowHandle(event: any, ele: any, item: any, index: number) { //  选择select
        if (this.showSelectBar) {
            this.showSelectBar = false;
            return;
        }
        event = event || window.event;
        const target: any = event.targte || event.srcElement;
        const rect = target.getBoundingClientRect();
        this.storeCondiEle = ele;
        this.storeCondiItem = item;
        this.storeCondiIndex = index;
        this.showCountStyle = {
            top: rect.top - 76 + 30 + 'px',
            left: rect.left - 230 - 160 + 'px',
            width: '180px',
        };
        this.showSelectBar = true;
    }

    private selectHandle(event: any, ele: any, index?: number, arrayItem?: any) { // 条件控制器
        const selectVal = ele.value;
        const condList = this.condList;
        arrayItem = arrayItem || this.storeCondiItem;
        switch (selectVal) {
            case 'Add condition':
                if (arrayItem.length > 1) {
                    this.condList.splice(this.storeCondiIndex + 1, 0,
                        [
                            {
                                type: 'condition',
                                value: '请输入条件类型',
                                level: this.storeCondiEle.level,
                            },
                            {
                                type: 'symType',
                                value: '',
                                level: this.storeCondiEle.level,
                                symVla: undefined,
                            },
                            {
                                type: 'compare',
                                value: '请选择比较符号',
                                level: this.storeCondiEle.level,
                            },
                        ],
                    );
                } else {
                    arrayItem.push(
                        {
                            type: 'condition',
                            value: '请输入条件类型',
                            level: this.storeCondiEle.level,
                        },
                        {
                            type: 'symType',
                            value: '',
                            level: this.storeCondiEle.level,
                            symVla: undefined,
                        },
                        {
                            type: 'compare',
                            value: '请选择比较符号',
                            level: this.storeCondiEle.level,
                        },
                    );
                }
                break;
            case 'Add co-condition':
                this.condList.push([
                    {
                        type: 'select',
                        value: 'And',
                        level: this.storeCondiEle.level + 1,
                    },
                ]);
                break;
            case 'Copy condition':
                const condition: any[] = [];
                condition.push(arrayItem.slice(1));
                for (let i = this.storeCondiIndex + 1, len = condList.length; i < len; i++) {
                    if (condList[i][0].level >= this.storeCondiEle.level) {
                        condition.push([...condList[i]]);
                    }
                }
                this.storeCopyCondition = condition;
                break;
            case 'Paste condition':
                if (!this.storeCopyCondition || this.storeCopyCondition.length === 0) {
                    this.$Message.error('没有复制条件无法粘贴');
                    return;
                }
                this.storeCopyCondition.map((item: any) => {
                    item.map((itemLi: any) => {
                        itemLi.level = this.storeCondiEle.level;
                    });
                });
                if (arrayItem.length <= 1) { //  当前条件选择器没有数据;
                    arrayItem.splice(1, 0, ...this.storeCopyCondition[0]);
                    condList.splice(this.storeCondiIndex + 1, 0, ...this.storeCopyCondition.slice(1));
                } else {
                    condList.splice(this.storeCondiIndex + 1, 0, ...this.storeCopyCondition);
                }
                break;
            case 'Delete condition':
                let delLength: number = 1;
                if (this.storeCondiEle.level === 1) {
                    this.$Message.error('第一层条件不能被删除');
                    return;
                }
                // this.delUseVarList(this.storeCondiIndex);
                for (let i = this.storeCondiIndex + 1, len = condList.length; i < len; i++) {
                    if (condList[i][0].level === this.storeCondiEle.level) {
                        // this.delUseVarList(i);
                        delLength ++;
                    }
                }
                condList.splice(this.storeCondiIndex, delLength);
                break;
            default:
                this.storeCondiEle.value = selectVal;
                break;
        }
        this.showSelectBar = false;
        this.$emit('checkSave', true);
    }

    private condiHandle(val: any, ele: any, index: number, arrayItem: any, j: number) {  // 选择条件类型控制
        const value = val.slice(2).join('.');
        ele.value = value;
        let type = 0;
        if (val[0] === '选择参数') {
            type = 1;
        }
        ele.typeName = 'var/par';
        ele.typeVal = type;
        ele.typeValue = val.slice(1);
        ele.name = val.slice(1).join('$');
        // this.transVar(type, val.slice(1), index, j);
        // let canAdd = true;
        // arrayItem.map((item: any) => {
        //     if (item.type === 'compare') {
        //         canAdd = false;
        //     }
        // });
        // if (!canAdd) {
        //     return false;
        // }
        // arrayItem.push(
        //     {
        //         type: 'compare',
        //         value: '请选择比较符号',
        //         level: ele.level,
        //     },
        // );
    }

    private compareHandle(val: any, ele: any, index: number, arrayItem: any, itemIndex: number) {  // 选择对比操作符
        const value = val[0];
        ele.value = value;
        if (!arrayItem[index + 1]) {
            arrayItem.push(
                {
                    type: 'valType',
                    value: '请选择值类型',
                    level: ele.level,
                    showInput: false,
                },
                {
                    type: 'symType',
                    value: undefined,
                    level: ele.level,
                    symVla: undefined,
                },
            );
        }
    }

    private valTypeHandle(val: any, ele: any, index: number, arrayItem: any, itemIndex: number) {  // 选择值或者变量;
        const value = val[val.length - 1];
        if (value === '输入值') {
            const obj = (this as any).$refs[`testCas${itemIndex}-${index}`][0];
            obj.currentValue.forEach( (vala: any, i: number) => {
                obj.currentValue[i] = '解决bug,此时是输入值';
            });
            ele.showInput = true;
            ele.value = '';
            ele.name = '';
            ele.typeName = 'input';
            ele.typeVal = null;
            ele.typeValue = null;
            const refStr = 'input' + itemIndex + index;
            this.$nextTick(() => {
                (this as any).$refs[refStr][0].focus();
            });
        } else {
            let type = 0;
            if (val[0] === '选择参数') {
                type = 1;
            }
            // this.transVar(type, val.slice(1), index, itemIndex);
            ele.value = val.slice(2).join('.');
            ele.typeName = 'var/par';
            ele.typeVal = type;
            ele.typeValue = val.slice(1);
            ele.name = val.slice(1).join('$');
        }
    }

    private countTypeHandle(val: any, ele: any, index: number, arrayItem: any, itemIndex: number) {  // 括号值类型修改;
        const value = val[val.length - 1];
        if (value === '输入值') {
            const obj = (this as any).$refs[`testCas${itemIndex}-${index}`][0];
            obj.currentValue.forEach( (vala: any, i: number) => {
                obj.currentValue[i] = '解决bug,此时是输入值';
            });
            ele.showInput = true;
            ele.value = '';
            ele.name = '';
            ele.typeName = 'input';
            ele.typeVal = null;
            ele.typeValue = null;
            const refStr = 'input' + itemIndex + index;
            this.$nextTick(() => {
                (this as any).$refs[refStr][0].focus();
            });
        } else if (value === 'brackets') {
            arrayItem.splice(index, 1,
                {
                    type: 'leftBra',
                    value: '(',
                    level: ele.level,
                },
                {
                    type: 'valType',
                    value: '请选择值类型',
                    level: ele.level,
                    showInput: false,
                },
                {
                    type: 'symType',
                    value: undefined,
                    level: ele.level,
                    symVla: undefined,
                },
                {
                    type: 'rightBra',
                    value: ')',
                    level: ele.level,
                },
            );
        } else {
            let type = 0;
            if (val[1] === '选择参数') {
                type = 1;
            }
            // this.transVar(type, val.slice(2), index, itemIndex);
            ele.value = val.slice(3).join('.');
            ele.typeName = 'var/par';
            ele.typeVal = type;
            ele.typeValue = val.slice(1);
            ele.name = val.slice(2).join('$');
        }
    }

    private countHandle(event: any, ele: any, item: any, index: number) {  // 选择值或者变量;
        if (this.showCountBar) {
            this.showCountBar = false;
            return;
        }
        event = event || window.event;
        const target: any = event.targte || event.srcElement;
        const rect = target.getBoundingClientRect();
        this.storeCondiEle = ele;
        this.storeCondiItem = item;
        this.storeCondiIndex = index;
        this.showCountStyle = {
            top: rect.top - 76 + 28 + 'px',
            left: rect.left - 230 + 20 + 'px',
        };
        this.showCountBar = true;
    }

    private setSym($event: any, ele: any) {  // 设置运算符号
        this.showCountBar = false;
        this.$emit('checkSave', true);
        if (this.storeCondiEle.symVla !== undefined) {
            // 防止重复添加
            this.storeCondiEle.value = ele.value;
            this.storeCondiEle.symVla = ele.label;
            return;
        }
        this.storeCondiEle.value = ele.value;
        this.storeCondiEle.symVla = ele.label;
        const index: number = this.storeCondiIndex + 1;
        // if (this.storeCondiItem[index] && (this.storeCondiItem[index].type === 'countType' || this.storeCondiItem[index].type === 'valType')) {
        //     // 替换之前添加的元素
        //     index --;
        // }
        if (!ele.value) { // 运算符删除
            console.log('删除');
        } else {
           this.storeCondiItem.splice(index, 0,
                {
                    type: 'countType',
                    value: '请输入运算条件',
                    level: this.storeCondiEle.level,
                    showInput: false,
                },
                {
                    type: 'symType',
                    value: undefined,
                    level: this.storeCondiEle.level,
                    symVla: undefined,
                },
            );
        }
    }

    private actTypeHandle(val: any, ele: any, index: number, arrayItem: any, itemIndex: any) { // 添加新动作类型控制
        const value = val[0];
        arrayItem[0].value = value;
        if (value === '输出') {
            arrayItem.splice(1, 1, {
                type: 'valType',
                value: '请选择值类型',
                level: ele.level,
                showInput: false,
            });
        } else {
            arrayItem.splice(1, 1,
                {
                    type: 'condition',
                    value: '请输入条件类型',
                    level: 1,
                },
                {
                    type: 'symType',
                    value: '',
                    level: 1,
                    symVla: undefined,
                },
                {
                    type: 'compare',
                    value: '请选择比较符号',
                    level: 1,
                },
            );
        }
    }

    private delCondi(item: any, index: number, type: string) {  // 删除整行条件
        this.$emit('checkSave', true);
        if (item[0].type === 'select') {
            item.splice(1, item.length - 1);
        } else {
            switch (type) {
                case 'if':
                    this.condList.splice(index, 1);
                    break;
                case 'else':
                    this.elseList.splice(index, 1);
                    break;
                case 'other':
                    this.otherList.splice(index, 1);
                    break;
            }
        }
        // this.delUseVarList(index);
    }

    private changeVal(event: any, ele: any) {  // 输入值输入框隐藏
        ele.showInput = false;
        if (!ele.value.trim()) {
            ele.value = '输入值';
            ele.name = '输入值';
        }
    }

    private testFun() {
        console.log(1);
    }

    private addActHandle(type: string) {
        const newAct = [
            {
                type: 'title',
                value: '',
                level: 1,
            },
            {
                type: 'actType',
                value: '请输入动作类型',
                level: 1,
            },
        ];
        switch (type) {
            case 'else':
                this.elseList.push(newAct);
                break;
            case 'other':
                this.otherList.push(newAct);
                break;
        }
    }

    private saveHandle() {  // 保存模型
        const logicArr: any[] = [''];
        const formulaArr: any[] = [[]];
        let curLevel: number = 0;
        let formulaStr: string = '';
        this.condList.map((item: any) => {
            let str: string = '';
            item.map((ele: any, i: any) => {
                if (curLevel !== ele.level) {
                    curLevel = ele.level;
                    logicArr[curLevel] = [];
                    formulaArr[curLevel] = [];
                }
                if (ele.type !== 'select') {
                    if (i === 0 || (i === 1 && item[0].type === 'select')) {
                        // 判断符首尾加括号;
                        str += '(';
                    }
                    if (ele.value) {
                        if (ele.type === 'compare') {
                            str += (')' + this.transCompVal(ele.value) + '(');
                        } else {
                            if (ele.typeName === 'var/par') {
                                str += ele.name;
                                this.useVarListHandle(ele);
                            } else {
                                str += ele.value;
                            }
                        }
                    }
                    if (i === item.length - 1) {
                         // 判断符首尾加括号;
                        str += ')';
                    }
                } else {
                    logicArr[curLevel] = ele.value === 'And' ? '&&' : '||';
                }
            });
            formulaArr[curLevel].push(str);
        });
        for (let i = formulaArr.length - 1; i > 0; i--) {
            if (i === 1) {
                formulaStr = '(' + formulaArr[i].join(logicArr[i]) + formulaStr + ')';
            } else {
                formulaStr = logicArr[i - 1] + '(' + formulaArr[i].join(logicArr[i]) + formulaStr + ')';
            }
        }
        // console.log(logicArr, formulaArr, formulaStr, JSON.stringify(this.condList));
        return {
            formulaArr,
            formulaStr,
        };
    }

    private transCompVal(val: string) {
        const dataList: any = this.dataList || {};
        let txt = '';
        dataList.compare.map((ele: any) => {
            if (val === ele.value) {
                txt = ele.transVal;
            }
        });
        return txt;
    }

    private globalReset() {
        if (this.showCountBar) {
            this.showCountBar = false;
        }
        if (this.showSelectBar) {
            this.showSelectBar = false;
        }
    }

    // private transVar(type: number, val: any, i: number, j: number) {
    //     // 转换保存用到的变量和参数;
    //     let varId: any = [];
    //     const varSym = j + '-' + i;
    //     let flag = false;
    //     this.delUseVarList(j, i);
    // }

    private saveModel(val: number) {
        const saveList = this.saveHandle();
        console.log(this.modelData);
        if (this.modelData.data.applieNum >= 1) {
            this.$Message.error('应用中的模型无法修改');
            return;
        }
        const params = {
            id: this.modelData.id,
            formula: JSON.stringify(this.condList),
            content: saveList.formulaStr,
            useConstant: JSON.stringify(this.useParList),
            useField: JSON.stringify(this.useVarList),
            describe: this.dsp,
        };
        moToolApi.saveModel(params).then((res: any) => {
            if (val === 2) {
                const pubParams = {
                    id: this.modelData.id,
                };
                moToolApi.publishModel(pubParams).then((resLi: any) => {
                    this.$Message.success('发布成功');
                });
                return;
            }
            this.$Message.success('保存成功');
            this.useVarList = [];
        });
    }

    // private delUseVarList(x: number, y?: number) {
    //     // 剔除同位置修改选中的变量和参数
    //     let curSym = '';
    //     const varSameList: any = [];
    //     const parSameList: any = [];
    //     const useVarList: any = [];
    //     const useParList: any = [];
    //     if (y !== undefined) {
    //         curSym = x + '-' + y;
    //     }
    //     this.useVarList.map((ele: any, i: any) => {
    //         if (y === undefined) {
    //             const symArr = ele.sym.split('-');
    //             if (symArr[0] - 0 === x) {
    //                 varSameList.push(i);
    //             }
    //         } else {
    //             if (ele.sym === curSym) {
    //                 varSameList.push(i);
    //             }
    //         }
    //     });
    //     this.useVarList.map((ele: any, i: number) => {
    //         if (varSameList.indexOf(i) === -1) {
    //             useVarList.push(ele);
    //         }
    //     });
    //     // varSameList.map((ele: any) => {
    //     //     this.useVarList.splice(ele, 1);
    //     // });
    //     this.useParList.map((ele: any, i: any) => {
    //         if (y === undefined) {
    //             const symArr = ele.sym.split('-');
    //             if (symArr[0] - 0 === x ) {
    //                 parSameList.push(i);
    //             }
    //         } else {
    //             if (ele.sym === curSym) {
    //                 parSameList.push(i);
    //             }
    //         }
    //     });
    //     // parSameList.map((ele: any) => {
    //     //     this.useParList.splice(ele, 1);
    //     // });
    //     this.useParList.map((ele: any, i: number) => {
    //         if (parSameList.indexOf(i) === -1) {
    //             useParList.push(ele);
    //         }
    //     });
    //     this.useVarList = useVarList;
    //     this.useParList = useParList;
    // }

    private useVarListHandle(data: any) {
        const type = data.typeVal;
        const varId: any = [];
        const val = data.typeValue || [];
        let flag = false;
        if (type === 0) {
            this.useVarList.map((ele: any) => {
                if (ele.name === data.name) {
                    flag = true;
                }
            });
            if (flag) {
                // 已有变量或者参数不再存储;
                return;
            }
            this.varlibList.map((ele: any) => {
                if (ele.name === val[0]) {
                    varId.push(ele.id);
                    if (ele.children.length > 1) {
                        ele.children.map((item: any) => {
                            if (item.name === val[1]) {
                                varId.push(item.id);
                                if (item.children.length > 1) {
                                    item.children.map((itemLi: any) => {
                                        if (itemLi.name === val[2]) {
                                            varId.push(itemLi.id);
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
            // this.useVarList.map((ele: any) => {
            //     if (ele.id === varId[varId.length - 1]) {
            //         flag = true;
            //     }
            // });
            // if (!flag) {
            //     this.useVarList.push({
            //         id: varId[varId.length - 1],
            //         libraryId: varId[0],
            //         name: val.join('$'),
            //         sym: varSym,
            //         valArr: val,
            //     });
            // }
            this.useVarList.push({
                id: varId[varId.length - 1],
                libraryId: varId[0],
                name: data.name,
                valArr: val,
            });
        } else {
            this.useParList.map((ele: any) => {
                if (ele.name === data.name) {
                    flag = true;
                }
            });
            if (flag) {
                // 已有变量或者参数不再存储;
                return;
            }
            this.parlibList.map((ele: any) => {
                if (ele.name === val[0]) {
                    varId.push(ele.id);
                    if (ele.children.length > 1) {
                        ele.children.map((item: any) => {
                            if (item.name === val[1]) {
                                varId.push(item.id);
                            }
                        });
                    }
                }
            });
            // this.useParList.map((ele: any) => {
            //     if (ele.id === varId[varId.length - 1]) {
            //         flag = true;
            //     }
            // });
            // if (!flag) {
            //     this.useParList.push({
            //         id: varId[varId.length - 1],
            //         libraryId: varId[0],
            //         name: val.join('$'),
            //         sym: varSym,
            //         valArr: val,
            //     });
            // }
            this.useParList.push({
                id: varId[varId.length - 1],
                libraryId: varId[0],
                name: data.name,
                valArr: val,
            });
        }
    }
}
</script>
