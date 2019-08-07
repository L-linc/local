<template>
  <div class="dic_wrap type_wrap">
    <div class="com_menu">
        <Tabs :value="pageType" @on-click="changePageType" :animated="false">
            <TabPane label="传感器类型" name="传感器类型" v-if="sensorPermission"></TabPane>
            <TabPane label="网关类型" name="网关类型" v-if="gatewayPermission"></TabPane>
            <TabPane label="采集点类型" name="采集点类型" v-if="pointPermission"></TabPane>
            <TabPane label="资产类型" name="资产类型" v-if="assetPermission"></TabPane>
            <!-- <TabPane label="角色类型" name="角色类型"></TabPane> -->
        </Tabs>
    </div>
    <div class="com_top">
        <div class="top_sear">
            <Input prefix="ios-search" placeholder="搜索" v-model="searName" />
            <Select v-if="pageType == '采集点类型'" v-model="dataSouSea">
                <Option value="all">ALL</Option>
                <Option v-for="(ele, i) in sourList" :key="i" :value="i">{{ele}}</Option>
            </Select>
            <Button class="btn_sear" type="primary" @click="getTable(1)"> 搜 索 </Button>
        </div>
        <div class="top_add">
            <Button type="primary" @click="showToast" v-has="ADDPERMISSION"> + 添加类型 </Button>
        </div>
    </div>
    <div class="com_tab">
        <Table stripe :columns="columnsData" :data="tableData"></Table>
        <div class="page_box">
            <Page :current="pageIndex" :page-size="pageSize" :total="pageTotal" @on-change="getTable" @on-page-size-change="changePageSize" show-total show-elevator show-sizer />
        </div>
    </div>
    <Modal
        class="dictionary_modal"
        v-model="addFlag"
        :title="toastTit"
        @on-visible-change="visibleChange"
        :width="width">
        <div v-if="pageType == '采集点类型'" class="add_label">
            <span class="label_name">数据源：</span>
            <Select v-model="dataSou" style="width: 320px;;">
                <Option v-for="(ele, i) in sourList" :key="i" :value="i">{{ele}}</Option>
            </Select>
        </div>
        <label class="add_label"><span class="label_name">类型名称：</span><Input name="name" v-model="typeNameAdd" placeholder="类型名称" /></label>
        <label v-if="pageType == '采集点类型'" class="add_label"><span class="label_name">上报频率：</span><Input v-model="typeRate" placeholder="请输入上报频率"/><span style="margin-left:10px">Hz</span></label>
        <div v-if="pageType == '采集点类型'" class="add_label">
            <span class="label_name" style="float: left">
                <Checkbox v-model="isMockInsert" :disabled="insertStatus">模拟接入</Checkbox>
            </span>
            <div class="mockLinkInfo" v-if="isMockInsert">
                <Select v-model="linkType" style="width: 320px;" disabled>
                    <Option value="MQTT">MQTT</Option>
                </Select>
                <Button type="primary" class="linkBtn"  @click.stop="insertChange">{{insertStatus ? '结束接入' : '开始接入'}}</Button>
                <ul class="li_backinfo">
                    <li>
                        <span>MQTT服务器地址: </span>
                        <span :title="insertInfo.serverHost">{{insertInfo.serverHost}}</span>
                    </li>
                    <li>
                        <span>Topic: </span>
                        <span :title="insertInfo.topic">{{insertInfo.topic}}</span>
                    </li>
                </ul>
            </div>
        </div>
        <div v-if="pageType == '采集点类型'" class="add_label">
            <span class="label_name var_label">参数：</span>
            <div class="var_box" ref="var_li">
                <div class="var_li" v-for="(ele, i) in varList" :key="i">
                    <Input @on-keyup="setVarName($event, ele)" :value="ele.name" placeholder="请输入参数名称"/>
                    <Select v-model="ele.dataType" class="dataType">
                        <Option v-for="(varLi, j) in varData" :key="j" :value="j">{{j}} ( {{varLi}} )</Option>
                    </Select>
                    <Input v-show="ele.dataType !== 'DATETIME'" class="unitFormat" @on-keyup="setVarUnit($event, ele)" :value="ele.unit" placeholder="请输入单位"/>
                    <Select v-show="ele.dataType === 'DATETIME'" class="unitFormat" v-model="ele.format">
                        <Option v-for="item in dateList" :value="item.label" :key="item.id">{{ item.label }}</Option>
                    </Select>
                    <!-- <Input @on-keyup="setVarRate($event, ele)" :value="ele.rate" placeholder="请输入上报频率" style="width:110px;"/> -->
                    <span class="label_btn" @click="varNumberHandle('del', i)" v-show="!insertStatus && varList.length > 1"></span>
                    <span class="label_btn" @click="varNumberHandle('add', i)" v-show="!insertStatus && i === varList.length - 1"></span>
                </div>
            </div>
        </div>
        <div slot="footer">
            <Button type="primary" size="large" @click="brandSubmit" :disabled="insertStatus">提交</Button>
        </div>
    </Modal>
    <Modal
        class="dictionary_modal"
        v-model="showParams"
        title="参数详情"
        width="440px">
        <p style="word-break: break-all;text-overflow: ellipsis;">{{allPointsStr}}</p>
        <div slot="footer">
            <Button type="primary" size="large" @click="ok">确定</Button>
            <Button type="text" size="large" @click="cancel">取消</Button>
        </div>
    </Modal>
  </div>
  
</template>

<script lang="ts">
import './dataDictionary.less';
import dictionaryApi from '@/api/dataDictionary.ts';
import { getCookie } from '@/config/utils';
import Vue from 'vue';
import {Component} from 'vue-property-decorator';
interface InsertInfo {
    topic: string;
    serverHost: string;
}

@Component
export default class TypeMana extends Vue {

    // data
    private insertInfo: InsertInfo = {
        topic: '',
        serverHost: '',
    };
    private insertStatus: boolean = false;
    // permission
    private sensorPermission: boolean = true;
    private gatewayPermission: boolean = true;
    private pointPermission: boolean = true;
    private assetPermission: boolean = true;
    private pageTotal: number = 0;
    private pageIndex: number = 1;
    private pageSize: number = 10;
    private limitNum: number = 4;
    private width: string = '520px';
    private pageType: string = '传感器类型';
    private ADDPERMISSION: string = 'SYS_DICT_TYPE_SENSOR_ADD';
    private typeNameAdd: string = '';
    private typeRate: string = '';
    private brandEditId: string = '';
    private searName: string = '';
    private allPointsStr: string = '';
    private toastTit: string = '添加类型';
    private dataSou: string = '';
    private linkType: string = 'MQTT';
    private isMockInsert: boolean = false;
    private dataSouSea: string = 'all';
    private sourList: any[] = [];
    private columnsData: any[] = [];
    private varData: any[] = [];
    private tableData: any[] = [];
    private wsEle: any = null;
    private wsTimer: any = null;
    private varList: any[] = [
        {
            name: '',
            dataType: '',
            unit: '',
            format: '',
        },
    ];
    private dateList: any[] = [
        {id: 1, label: 'yyyy-MM-dd HH:mm:ss.SSS'},
        {id: 2, label: 'yyyy-MM-dd HH:mm:ss'},
        {id: 3, label: 'yyyy-MM-dd'},
        {id: 4, label: 'HH:mm:ss'},
    ];
    private columnsData1: any[] = [
        {
            title: '传感器类型',
            key: 'name',
        },
        {
            title: '创建者',
            key: 'createUser',
        },
        {
            title: '创建时间',
            key: 'createTime',
        },
        {
            title: '操作',
            key: 'id',
            align: 'right',
            render: (h: any, params: any): any => {
                return h('div', [
                            h('Icon', {
                                props: {
                                    type: 'ios-create-outline',
                                    size: '24',
                                },
                                style: {
                                    cursor: 'pointer',
                                },
                                directives: [{
                                    name: 'has',
                                    value: this.pageType === '网关类型' ? 'SYS_DICT_TYPE_GATEWAY_MOD' : 'SYS_DICT_TYPE_SENSOR_MOD',
                                }],
                                on: {
                                    click: () => {
                                        this.brandEditId = params.row.id;
                                        this.showToast('edit', params.row);
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
                                directives: [{
                                    name: 'has',
                                    value: this.pageType === '网关类型' ? 'SYS_DICT_TYPE_GATEWAY_DEL' : 'SYS_DICT_TYPE_SENSOR_DEL',
                                }],
                                on: {
                                    click: () => {
                                        this.toDelete(params.row);
                                    },
                                },
                            }),
                        ]);
            },
        },
    ];
    private columnsData2: any[] = [
        {
            title: '采集点类型',
            key: 'name',
        },
        {
            title: '数据源',
            key: 'category',
            render: (h: any, params: any) => {
                let txt = '采集器数据源';
                if (params.row.category === 'thirdParty') {
                    txt = '第三方数据源';
                }
                return  h('span', txt);
            },
        },
        {
            title: '参数',
            key: 'params',
            render: (h: any, params: any) => {
                let paramsTxt = '';
                params.row.params = params.row.params || [];
                params.row.params.map((ele: any, i: number) => {
                    if (!ele.unit) {
                        ele.unit = '';
                    }
                    paramsTxt += ele.name + '- ' + ele.unit + ',';
                });
                paramsTxt = paramsTxt.substring(0, paramsTxt.length - 1);
                if (params.row.paramsSize > this.limitNum) {
                    paramsTxt = paramsTxt + '...';
                }
                return h('span', {
                    style: {
                        cursor: 'pointer',
                    },
                    on: {
                        click: () => {
                            this.showAllHandle(params.row);
                        },
                    },
                }, paramsTxt);
            },
        },
        {
            title: '上报频率 (s-1)',
            key: 'rate',
            // render: (h: any, params: any) => {
            //     let paramsTxt = '';
            //     params.row.params = params.row.params || [];
            //     params.row.params.map((ele: any, i: number) => {
            //         if (!ele.rate) {
            //             ele.rate = '';
            //         }
            //         paramsTxt += ele.name + '- ' + ele.rate + ',';
            //     });
            //     paramsTxt = paramsTxt.substring(0, paramsTxt.length - 1);
            //     if (params.row.paramsSize > this.limitNum) {
            //         paramsTxt = paramsTxt + '...';
            //     }
            //     return h('span', {
            //         style: {
            //             cursor: 'pointer',
            //         },
            //         on: {
            //             click: () => {
            //                 this.showAllHandle(params.row);
            //             },
            //         },
            //     }, paramsTxt);
            // },
        },
        {
            title: '创建者',
            key: 'createBy',
        },
        {
            title: '创建时间',
            key: 'createTime',
        },
        {
            title: '操作',
            key: 'id',
            align: 'right',
            render: (h: any, params: any): any => {
                return h('div', [
                            h('Icon', {
                                props: {
                                    type: 'ios-create-outline',
                                    size: '24',
                                },
                                style: {
                                    cursor: 'pointer',
                                },
                                directives: [{
                                    name: 'has',
                                    value: 'SYS_DICT_TYPE_POINT_MOD',
                                }],
                                on: {
                                    click: () => {
                                        this.brandEditId = params.row.id;
                                        this.showToast('edit', params.row);
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
                                directives: [{
                                    name: 'has',
                                    value: 'SYS_DICT_TYPE_POINT_DEL',
                                }],
                                on: {
                                    click: () => {
                                        this.toDelete(params.row);
                                    },
                                },
                            }),
                        ]);
            },
        },
    ];
    private columnsData3: any[] = [
        {
            title: '资产类型',
            key: 'title',
        },
        {
            title: '创建者',
            key: 'createUser',
        },
        {
            title: '创建时间',
            key: 'createTime',
        },
        {
            title: '操作',
            key: 'id',
            align: 'right',
            render: (h: any, params: any): any => {
                return h('div', [
                            h('Icon', {
                                props: {
                                    type: 'ios-create-outline',
                                    size: '24',
                                },
                                style: {
                                    cursor: 'pointer',
                                },
                                directives: [{
                                    name: 'has',
                                    value: 'SYS_DICT_TYPE_ASSET_MOD',
                                }],
                                on: {
                                    click: () => {
                                        this.brandEditId = params.row.id;
                                        this.showToast('edit', params.row);
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
                                directives: [{
                                    name: 'has',
                                    value: 'SYS_DICT_TYPE_ASSET_DEL',
                                }],
                                on: {
                                    click: () => {
                                        this.toDelete(params.row);
                                    },
                                },
                            }),
                        ]);
            },
        },
    ];
    private addFlag: boolean = false;
    private showParams: boolean = false;
    private pageData: any = {
        sensorType: '传感器类型',
        gatewayType: '网关类型',
        pointType: '采集点类型',
        assetType: '资产类型',
        roleType: '角色类型',
    };
    private toolPosition: any = {
        left: 0,
        top: 0,
    };

    // life-cycle
    private created() {
        this.getTable();
        this.columnsData = this.columnsData1;
        this.getDataSouType();
        this.getDataFormatList();
        this.sensorPermission = Vue.prototype.$_has('SYS_DICT_TYPE_SENSOR_LIST');
        this.gatewayPermission = Vue.prototype.$_has('SYS_DICT_TYPE_GATEWAY_LIST');
        this.pointPermission = Vue.prototype.$_has('SYS_DICT_TYPE_POINT_LIST');
        this.assetPermission = Vue.prototype.$_has('SYS_DICT_TYPE_ASSET_LIST');
    }

    private deactivated() {
        this.getName();
    }

    private activated() {
        this.getName();
        this.closeWS();
        this.changePageType(this.pageType);
    }

    // methods
    private closeWS() {
        if (this.wsEle) {
            this.wsEle.close();
            this.wsEle = null;
            clearTimeout(this.wsTimer);
        }
    }
    private visibleChange() {
        this.insertStatus = false;
        this.insertInfo = {
            topic: '',
            serverHost: '',
        };
        this.closeWS();
    }
    private wsInit() {
        this.closeWS();
        const ws: any = new WebSocket(`ws://${location.host}/ws/websocket`, [getCookie('token')]);
        ws.onopen = () => {
            ws.send((JSON.stringify({ topic: this.insertInfo.topic, simulation: true})));
            this.wsEle = ws;
        };
        ws.onmessage = (res: any = {}) => {
            const resData = JSON.parse(res.data);
            const key = Object.keys(resData)[0];
            for (const item of this.varList) {
                if ((item as any).name === key) {
                    return false;
                }
            }
            this.varList.push({
                name: key,
                dataType: '',
                unit: '',
                format: '',
            });
            this.$nextTick(() => {
                const container = this.$refs.var_li;
                (container as any).scrollTop = (container as any).scrollHeight;
            });
        };
        ws.onerror = () => {
            // 重连
            if (this.wsEle) {
                this.closeWS();
                if (!this.wsTimer) {
                    this.wsTimer = setTimeout(() => {
                    // 3S须连websocket
                    this.wsInit();
                    this.wsTimer = null;
                    }, 3000);
                }
            }
        };
        ws.onclose = () => {
            if (this.wsEle) {
                this.closeWS();
                if (!this.wsTimer) {
                    this.wsTimer = setTimeout(() => {
                    // 3S须连websocket
                    this.wsInit();
                    this.wsTimer = null;
                    }, 3000);
                }
            }
        };
    }
    /**
     * 开始接入，结束接入
     */
    private insertChange() {
        this.insertStatus = !this.insertStatus;
        if (this.insertStatus) {
            dictionaryApi.mockInsert().then(res => {
                this.insertInfo = {
                    topic: res.data.topic,
                    serverHost: res.data.serverHost,
                };
                if (!this.varList[0].dataType && !this.varList[0].name && !this.varList[0].unit && !this.varList[0].format) {
                    this.varList.shift();
                }
                // 开始接入
                this.wsInit();
            });
        } else {
            // 结束接入
            this.insertInfo = {
                topic: '',
                serverHost: '',
            };
            if (!this.varList.length) {
                this.varList.push({
                    name: '',
                    dataType: '',
                    unit: '',
                    format: '',
                });
            }
            this.closeWS();
        }
    }

    private getName() {
        const tabName = sessionStorage.getItem('dict_type_tab');
        if (tabName) {
            this.pageType = tabName;
        } else if (this.sensorPermission) {
            this.pageType = '传感器类型';
        } else if (this.gatewayPermission) {
            this.pageType = '网关类型';
        } else if (this.pointPermission) {
            this.pageType = '采集点类型';
        } else if (this.assetPermission) {
            this.pageType = '资产类型';
        }
    }
    private getTable(page?: number, pagesize?: number) {
        if (page) {
            this.pageIndex = page;
        }
        const {pageData, dataSouSea, limitNum} = this;
        const searName = this.searName.trim();
        const pageIndex = (page === undefined ? this.pageIndex : page);
        const pageSize = (pagesize === undefined ? this.pageSize : pagesize);
        let pageType = this.pageType;
        for (const val in pageData) {
            if (pageData[val] === pageType) {
                pageType = val;
            }
        }
        if (pageType !== 'pointType') {
            if (pageType === 'assetType') {
                const params = {
                    title: searName,
                    page: pageIndex - 1,
                    size: pageSize,
                };
                dictionaryApi.getAssetsList(params).then((res) => {
                    this.tableData = res.data.content.map( (ele: any) => {
                        ele.name = ele.title;
                        return ele;
                    });
                    this.pageTotal = res.data.totalElements;
                });
            } else {
                const params = {
                    params: `page=${pageIndex - 1}&size=${pageSize}&type=${pageType}&name=${encodeURIComponent(searName)}`,
                };
                dictionaryApi.selectType(params).then((res) => {
                    this.tableData = res.data.content;
                    this.pageTotal = res.data.totalElements;
                });
            }
        } else {
            const params = {
                params: `page=${pageIndex - 1}&size=${pageSize}&category=${(dataSouSea === 'all' ? '' : dataSouSea)}&keyword=${encodeURIComponent(searName)}&pointNumber=${limitNum}`,
            };
            dictionaryApi.collTypeList(params).then((res) => {
                this.tableData = res.data.content;
                this.pageTotal = res.data.totalElements;
            });
        }
    }
    private showToast(type: string = 'add', data: any) {
        this.isMockInsert = false;
        this.width = this.pageType === '采集点类型' ? '730px' : '520px';
        this.addFlag = true;
        if (type === 'edit') {
            this.toastTit = '编辑类型';
            this.typeNameAdd = data.name;
            this.typeRate = data.rate;
            this.brandEditId = data.id;
            this.dataSou = data.category;
            if (this.pageType === '采集点类型' && data.paramsSize > this.limitNum) {
                const params = {
                    id: data.id,
                };
                dictionaryApi.selectPoint(params).then((res: any = {}) => {
                    const pointsList = res.data.params || [];
                    this.varList = pointsList;
                });
                return;
            }
            this.varList = data.params;
        } else {
            this.typeNameAdd = '';
            this.typeRate = '';
            this.toastTit = '添加类型';
            this.brandEditId = '';
            this.dataSou = Object.keys(this.sourList)[0];
            this.varList = [
                {
                    name: '',
                    dataType: '',
                    unit: '',
                    format: '',
                },
            ];
        }
    }
    private brandSubmit() {
        const {toastTit, brandEditId, pageData, dataSou, varList, pageIndex} = this;
        // console.log(varList);
        const typeNameAdd = this.typeNameAdd.trim();
        const typeRate = this.typeRate;
        const reg = /^[a-zA-Z0-9_]{1,30}$/;
        if (typeNameAdd === '') {
            this.$Message.error('请输入类型名称');
            return;
        }
        let pageType = this.pageType;
        for (const val in pageData) {
            if (pageData[val] === pageType) {
                pageType = val;
            }
        }
        if (pageType === 'pointType') {
            if (!reg.test(typeNameAdd)) {
                this.$Message.error(`输入格式有误,支持30字符以内的英文、数字、下划线`);
                return;
            }
            for (const i of varList) {
                i.name = i.name.trim();
                if (!/^[a-zA-Z0-9_\.]{1,50}$/.test(i.name)) {
                    this.$Message.error(`${pageData.pointType} 参数名称输入格式有误,支持50字符以内的英文、数字、下划线、小数点`);
                    return;
                }
            }
        } else if (typeNameAdd.length > 50) {
            this.$Message.error('请输入50个字符以内的类型名称');
            return;
        }
        const xhrType = toastTit === '编辑类型' ? 'edit' : 'add';
        const param = {
            name: typeNameAdd,
            rate: typeRate,
            value: typeNameAdd,
            description: '',
            alias: '',
            parentId: '',
            type: pageType,
        };
        if (xhrType === 'add') {
            if (pageType === 'pointType') {
                const collParams = {
                    name: typeNameAdd,
                    rate: typeRate,
                    alias: '',
                    category: dataSou,
                    params: varList,
                };
                dictionaryApi.addCollType(collParams).then((res: any = {}) => {
                    this.$Message.info('添加成功');
                    this.addFlag = false;
                    this.getTable(1);
                });
                return;
            }
            if (pageType === 'assetType') {
                const params = {
                    title: typeNameAdd,
                };
                dictionaryApi.addAsset(params).then(() => {
                    this.$Message.info('添加成功');
                    this.addFlag = false;
                    this.getTable(1);
                });
                return;
            }
            dictionaryApi.addType(param).then((res: any = {}) => {
                this.$Message.info('添加成功');
                this.addFlag = false;
                this.getTable(1);
            });
        } else {
            if (pageType === 'pointType') {
                varList.map((ele: any, i: number) => {
                    if (!ele.pointType) {
                        ele.pointType = {
                            id: brandEditId,
                        };
                    }
                });
                const collParams = {
                    name: typeNameAdd,
                    rate: typeRate,
                    alias: '',
                    category: dataSou,
                    params: varList,
                    id: brandEditId,
                };
                dictionaryApi.EditCollType(collParams).then((res: any = {}) => {
                    this.$Message.info('修改成功');
                    this.addFlag = false;
                    this.getTable(1);
                });
                return;
            }
            if (pageType === 'assetType') {
                const params = {
                    id: this.brandEditId,
                    title: typeNameAdd,
                    rate: typeRate,
                };
                dictionaryApi.editAsset(params).then(() => {
                    this.$Message.info('修改成功');
                    this.addFlag = false;
                    this.getTable(1);
                });
                return;
            }
            const editParam: any = {...param, id: brandEditId};
            dictionaryApi.editType(editParam).then((res: any = {}) => {
                this.$Message.info('修改成功');
                this.addFlag = false;
                this.getTable(1);
            });
        }
    }
    private toDelete(data: any) {
        if (this.pageType === '资产类型') {
            if (data.status === 2) {
                this.$Message.error('已经绑定了设备，请先解绑设备后删除');
                return;
            }
        }
        this.$Modal.confirm({
            title: '删除类型',
            content: `<p>是否确定删除：${data.name}？</p>`,
            loading: true,
            onOk: () => {
                const params = {
                    id: data.id,
                };
                if (this.pageType !== '采集点类型') {
                    if (this.pageType === '资产类型') {
                        dictionaryApi.delAsset(params).then((res: any) => {
                            this.$Modal.remove();
                            this.$Message.info('删除成功');
                            this.getTable();
                        }, (res: any) => {
                            this.$Modal.remove();
                        });
                    } else {
                        dictionaryApi.deleteType(params).then((res: any) => {
                            this.$Modal.remove();
                            this.$Message.info('删除成功');
                            this.getTable();
                        }, (res: any) => {
                            this.$Modal.remove();
                        });
                    }
                } else {
                    dictionaryApi.delCollType(params).then((res: any) => {
                        this.$Modal.remove();
                        this.$Message.info('删除成功');
                        this.getTable();
                    }, (res: any) => {
                        this.$Modal.remove();
                    });
                }
            },
        });
    }
    private changePageSize(pagesize: number = 10) {
        const {pageSize} = this;
        if (pagesize !== pageSize) {
            this.pageSize = pagesize;
            this.getTable(undefined, pagesize);
        }
    }
    private changePageType(name: string = '传感器类型') {
        sessionStorage.setItem('dict_type_tab', name);
        if (name !== this.columnsData[0].title) {
            if (name === '采集点类型') {
                this.columnsData = this.columnsData2;
                this.ADDPERMISSION = 'SYS_DICT_TYPE_POINT_ADD';
            } else if (name === '资产类型') {
                this.columnsData = this.columnsData3;
                this.ADDPERMISSION = 'SYS_DICT_TYPE_ASSET_ADD';
            } else {
                this.columnsData = this.columnsData1;
                this.columnsData[0].title = name;
                this.searName = '';
                if (name === '传感器类型') {
                    this.ADDPERMISSION = 'SYS_DICT_TYPE_SENSOR_ADD';
                } else {
                    this.ADDPERMISSION = 'SYS_DICT_TYPE_GATEWAY_ADD';
                }
            }
            this.pageType = name;
            this.searName = '';
            this.getTable(1);
        }
    }
    private getDataSouType(this: any) {
        const param = {
            params: '',
        };
        dictionaryApi.dataSouList(param).then((res: any = {}) => {
            const data = res.data || [];
            this.sourList = data;
            this.dataSou = Object.keys(data)[0];
        });
    }
    private getDataFormatList(this: any) {
        const param = {
            params: '',
        };
        dictionaryApi.varDataFormatList(param).then((res: any = {}) => {
            const data = res.data || [];
            this.varData = data;
        });
    }
    private varNumberHandle(this: any, type: string, index: number) {
        if (type === 'add') {
            this.varList.splice(index + 1, 0, {name: '', dataType: ''});
        } else {
            this.varList.splice(index, 1);
        }
    }
    private showAllHandle(data: any) {
        this.showParams = true;
        const params = {
            id: data.id,
        };
        dictionaryApi.selectPoint(params).then((res: any = {}) => {
            const pointsList = res.data.params || [];
            let str = '';
            pointsList.map((ele: any, i: number) => {
                str += ele.name + ',';
            });
            this.allPointsStr = str.substring(0, str.length - 1);
        });
    }
    private ok() {
        this.showParams = false;
    }
    private cancel() {
        this.showParams = false;
    }
    private setVarName(e: any, current: any) {
        e = e || window.event;
        current.name = e.target.value;
    }
    private setVarUnit(e: any, current: any) {
        e = e || window.event;
        current.unit = e.target.value;
    }
    // private setVarRate(e: any, current: any) {
    //     e = e || window.event;
    //     current.rate = e.target.value;
    // }
}
</script>