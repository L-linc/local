<template>
    <div class="ass_wrap">
        <div class="com_top">
            <div class="top_add">
                <Button @click="goAdd" v-has="'SYS_ASSET_ADD'" > + 添加资产 </Button>
            </div>
        </div>
        <div class="com_tab">
            <div class="tab_sear">
                <Select v-model="assType">
                    <Option value="0">所有</Option>
                    <Option v-for="(ele, i) in assetTypeList" :key="i" :value="ele.assetType">{{ele.title}}</Option>
                </Select>
                <div class="sear_cols">
                    <Input prefix="ios-search" placeholder="搜索" v-model="searName" />
                    <Button class="btn_sear" @click="treeSelectHandle" type="primary"> 搜 索 </Button>
                </div>
                <div class="">
                    <Tree ref="treeWrap" @on-select-change="selTree" :data="treeData"></Tree>
                </div>
            </div>
            <div class="tab_con">
                <Table stripe :columns="columnsData" :data="tableData" :row-key="true"></Table>
                <div class="page_box">
                    <Page :total="pageTotal" @on-change="getTable" @on-page-size-change="changePageSize" show-total show-elevator show-sizer />
                </div>
            </div>
        </div>
        <Modal
            class="add_assets"
            v-model="addAssets"
            >
            <p slot="header" style="font-size: 18px;font-weight:normal;">
                <span>{{addTit}}</span>
            </p>
            <Form ref="formValidate"  :model="formValidate" :rules="ruleValidate" :label-width="80">
                <FormItem label="资产名称 : " prop="name">
                    <Input v-model="formValidate.name" placeholder="请输入资产名称" />
                </FormItem>
                <FormItem label="资产类型 : " prop="type">
                    <Select v-model="formValidate.type" filterable placeholder="请选择资产类型" >
                        <Option v-for="(ele, i) in allAssetTypeList" :key="i" :value="ele.assetType">{{ele.title}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="选择资产 : " prop="assets">
                    <Input v-model="formValidate.assets" placeholder="搜索" style="width: 298px"/>
                    <Button type="primary" class="sear_btn" @click="searAssets"> 搜 索 </Button>
                    <div class="assets_tree_border">
                        <Tree ref="assetsTree" @on-select-change="selectTree" :data="assetsTree"></Tree>
                    </div>
                </FormItem>
            </Form>
            <div slot="footer" style="text-align: center">
                <Button type="primary" class="ok_btn" @click="handleSubmit"> 提 交 </Button>
            </div>
        </Modal>
    </div>
</template>

<script lang="ts">
import './assetsManage.less';
import assetsApi from '@/api/assetsManage.ts';
import dictionaryApi from '@/api/dataDictionary.ts';
import Vue from 'vue';
export default Vue.extend ({
  name: 'AssetsTable',
  activated() {
    this.getTable();
    this.getTreeList();
    this.getAssetTypeData();
    this.getAssetsTree();
  },
  data() {
    return {
        pageTotal: 20,
        pageIndex: 0,
        pageSize: 10,
        brandNameAdd: '',
        assType: '0',
        pageType: 'brand',
        brandEditId: '1',
        searName: '',
        addFlag: false,
        toastTit: '添加品牌',
        columnsData: [
            {
                title: '资产名称',
                key: 'name',
                align: 'left',
                render: (h: any, params: any): any => {
                    return h('span', {attrs: {title: params.row.name}}, params.row.name);
                },
            },
            {
                title: '资产编号',
                key: 'serialNumber',
                align: 'center',
                render: (h: any, params: any): any => {
                    return h('span', {attrs: {title: params.row.serialNumber}}, params.row.serialNumber);
                },
            },
            {
                title: '类别',
                key: 'name',
                align: 'center',
                render: (h: any, params: any) => {
                    let txt = '';
                    for (const i of (this as any).allAssetTypeList) {
                        if (params.row.assetType === i.assetType) {
                            txt = i.title;
                        }
                    }
                    return h('span', {attrs: {title: txt}}, txt);
                },
            },
            {
                title: '操作',
                key: 'id',
                align: 'right',
                width: 150,
                render: (h: any, params: any) => {
                return h('div', [
                    h('icon', {
                        class: ['app_icon', 'app_icon_search'],
                        on: {
                            click: () => {
                                (this as any).goDetails(params.row);
                            },
                        },
                        directives: [{
                            name: 'has',
                            value: 'SYS_ASSET_DETAIL',
                        }],
                    }),
                        h('icon', {
                        class: ['app_icon', 'app_icon_edit'],
                        on: {
                            click: () => {
                                (this as any).goEdit(params.row);
                            },
                        },
                        directives: [{
                            name: 'has',
                            value: 'SYS_ASSET_MOD',
                        }],
                    }),
                    h('icon', {
                        class: ['app_icon', 'app_icon_del'],
                        on: {
                            click: () => {
                                (this as any).toDelete(params.row);
                            },
                        },
                        directives: [{
                            name: 'has',
                            value: 'SYS_ASSET_DEL',
                        }],
                    }),
                ]);
                // 凡是看到这条注释者,请注意不要删除下面的代码.因为随时可能要你重新写回来,美滋滋~
                    // const a: any = localStorage.getItem('roleAuth');
                    // const b = JSON.parse(a);
                    // const sensor = b.includes('SYS_SENSOR_DETAIL') && params.row.assetType === 2;
                    // const gateway = b.includes('SYS_GATEWAY_DETAIL') && params.row.assetType === 1;
                    // if (sensor && gateway) {
                    //     return h('div', [
                    //             h('icon', {
                    //                 class: ['app_icon', 'app_icon_search'],
                    //                 on: {
                    //                     click: () => {
                    //                         (this as any).goDetails(params.row);
                    //                     },
                    //                 },
                    //             }),
                    //              h('icon', {
                    //                 class: ['app_icon', 'app_icon_edit'],
                    //                 on: {
                    //                     click: () => {
                    //                         (this as any).goEdit(params.row);
                    //                     },
                    //                 },
                    //                 directives: [{
                    //                     name: 'has',
                    //                     value: 'SYS_ASSET_MOD',
                    //                 }],
                    //             }),
                    //             h('icon', {
                    //                 class: ['app_icon', 'app_icon_del'],
                    //                 on: {
                    //                     click: () => {
                    //                         (this as any).toDelete(params.row);
                    //                     },
                    //                 },
                    //                 directives: [{
                    //                     name: 'has',
                    //                     value: 'SYS_ASSET_DEL',
                    //                 }],
                    //             }),
                    //         ]);
                    // } else {
                    //     return h('div', [
                    //             h('icon', {
                    //                 class: ['app_icon', 'app_icon_search'],
                    //                 on: {
                    //                     click: () => {
                    //                         (this as any).goDetails(params.row);
                    //                     },
                    //                 },
                    //                 directives: [{
                    //                     name: 'has',
                    //                     value: sensor ? 'SYS_SENSOR_DETAIL' : (gateway ? 'SYS_GATEWAY_DETAIL' : 'none'),
                    //                 }],
                    //             }),
                    //              h('icon', {
                    //                 class: ['app_icon', 'app_icon_edit'],
                    //                 on: {
                    //                     click: () => {
                    //                         (this as any).goEdit(params.row);
                    //                     },
                    //                 },
                    //                 directives: [{
                    //                     name: 'has',
                    //                     value: 'SYS_ASSET_MOD',
                    //                 }],
                    //             }),
                    //             h('icon', {
                    //                 class: ['app_icon', 'app_icon_del'],
                    //                 on: {
                    //                     click: () => {
                    //                         (this as any).toDelete(params.row);
                    //                     },
                    //                 },
                    //                 directives: [{
                    //                     name: 'has',
                    //                     value: 'SYS_ASSET_DEL',
                    //                 }],
                    //             }),
                    //         ]);
                    // }
                },
            },
        ],
        tableData: [],
        treeData: [],
        assetTypeList: [] as any,
        allAssetTypeList: [],
        addAssets: false,
        addTit: '添加资产',
        formValidate: {
            name: '',
            type: '',
            assets: '',
        },
        ruleValidate: {
            name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }, { pattern: /^[0-9a-zA-Z]{1,50}$/, message: '资产名称为长度不大于50的数字或字母', trigger: 'blur' }],
            type: [{ required: true, message: '请选择资产类型'}],
            assets: [{ required: true, message: '请选择资产'}],
        },
        assetsTree: [] as any,
        locationId: '',
        assetId: '',
    };
  },
  methods: {
    goEdit(data: any) {
        this.addTit = '编辑资产';
        this.formValidate.type = data.locationType;
        this.formValidate.name = data.name;
        const loop = (arr: any) => {
            for (const i of arr) {
                let child: any[] = [];
                if (i.children && i.children.length > 0) {
                    child = i.children;
                }
                if (i.id === data.locationId) {
                    this.formValidate.assets = i.title;
                    return;
                } else {
                    loop(child);
                }
            }
        };
        loop(this.assetsTree);
        this.assetId = data.id;
        this.searAssets();
        this.addAssets = true;
    },
    searAssets() {
        const search = this.formValidate.assets;
        const treeData = this.assetsTree[0];
        const addTree = 'laji';
        this.tabSelect(this.assType, search, treeData, null, addTree);
    },
    selectTree(data: any) {
        this.locationId = data[0].id;
        this.formValidate.assets = data[0].title;
    },
    handleSubmit() {
        let flag = false;
        const loop = (arr: any) => {
            for (const i of arr) {
                let child: any[] = [];
                if (i.children && i.children.length > 0) {
                    child = i.children;
                }
                if (i.title === this.formValidate.assets) {
                    this.locationId = i.id;
                    flag = true;
                    return;
                } else {
                    loop(child);
                }
            }
        };
        loop(this.assetsTree);
        if (!flag) {
            this.locationId = '';
        }
        (this as any).$refs.formValidate.validate((valid: any) => {
            if (valid) {
                if (!this.locationId) {
                    this.$Message.info('当前传感器不存在,请重新选择传感器');
                    return;
                }
                if (this.addTit === '编辑资产') {
                    const param = {
                        title: this.formValidate.name,
                        locationId: this.locationId,
                        assetType: this.formValidate.type,
                        assetId: this.assetId,
                    };
                    assetsApi.editAsset(param).then((res: any) => {
                        this.locationId = '';
                        this.$Message.info('修改成功');
                        this.addAssets = false;
                        this.getAssetTypeData();
                        this.getTable(1);
                    });
                } else {
                    const param = {
                        title: this.formValidate.name,
                        locationId: this.locationId,
                        assetType: this.formValidate.type,
                    };
                    assetsApi.addAsset(param).then((res: any) => {
                        this.locationId = '';
                        this.$Message.info('添加成功');
                        this.addAssets = false;
                        this.getAssetTypeData();
                        this.getTable(1);
                    });
                }
            }
        });
    },
    getAssetsTree() {
        const params = {
            assetType: '0',
            title: '',
            isAsset:  2,
        };
        assetsApi.selectTree(params).then((res: any) => {
            const data: any = res.data || {};
            const list: any = [data];
            this.assetsTree = list;
        });
    },
    getTable(page?: number) {
        const {pageSize, assType, brandEditId} = this;
        const pageIndex = (page === undefined ? this.pageIndex : page - 1);
        const paramStr = {
            page: pageIndex,
            locationId: brandEditId,
            size: pageSize,
        };
        assetsApi.assetListPage(paramStr).then((res: any = {}) => {
            const data = res.data || {};
            this.tableData = data.content || [];
            this.pageTotal = data.totalElements;
        });
    },
    getAssetTypeData() {
        assetsApi.getAllAssetTypes().then((res: any = {}) => {
            const data = res.data || [];
            this.allAssetTypeList = data;
        });
        const param = {
            isUse: 1,
        };
        assetsApi.getAllAssetType(param).then((res: any = {}) => {
            const data = res.data || [];
            this.assetTypeList = data;
        });
    },
    getTreeList() {
        const {assType, searName} = this;
        const params = {
            assetType: assType,
            title: searName,
            isAsset:  2,
        };
        assetsApi.selectTree(params).then((res: any) => {
            const data: any = res.data || {};
            const list: any = [data];
            this.treeData = list;
        });
    },
    // getAssetData() {
    //     const paramStr = {
    //         params: `&assetstatus=&assetSearch=&typeId=`,
    //     };
    //     assetsApi.asetsList(paramStr).then((res: any = {}) => {
    //         const data = res.data || {};
    //         const assetData = data.content || [];
    //         assetData.map((ele: any, i: number) => {
    //             // 默认展开所有树节点
    //             ele.expand = true;
    //             ele.title = ele.name;
    //         });
    //         this.getTree(assetData);
    //     });
    // },
    // getTree(assetList: any[]) {
    //     const params = {urlStr: ''};
    //     dictionaryApi.selectTree(params).then((res: any = {}) => {
    //         const data = res.data || [];
    //         this.dataTransTree(data, assetList);
    //     });
    // },
    // dataTransTree(treeList: any[], assetList: any[]) {
    //     const selectData: any[] = [];
    //     for (const ele of treeList) {
    //         selectData[ele.level] = selectData[ele.level] || [];
    //         selectData[ele.level].push(ele);
    //         ele.title = ele.name;
    //         ele.expand = true; // 默认展开所有树节点
    //     }
    //     const treeSelData: any[] = [];
    //     selectData.map((ele: any, i: any) => {
    //         if (ele) {
    //             treeSelData.push(ele);
    //         }
    //     });
    //     let  transList: any[] = [];
    //     const leveLen = treeSelData.length;
    //     transList = [...treeSelData[leveLen - 1]];
    //     transList.map((treeLi: any, i: number) => {
    //         // 把资产挂到设备树最后一级
    //         treeLi.children = [];
    //         assetList.map((assetLi: any, j: number) => {
    //             if (assetLi.locationId === treeLi.id) {
    //                 treeLi.children.push(assetLi);
    //             }
    //         });
    //     });
    //     for (let i = leveLen - 2; i >= 0; i--) {
    //         let treeData: any[] = [];
    //         treeData = [...treeSelData[i]];
    //         treeData.map((selLi: any, j: number) => {
    //             selLi.children = [];
    //             transList.map((traLi: any, k: number) => {
    //                 if (traLi.parent === selLi.id) {
    //                     selLi.children.push(traLi);
    //                 }
    //             });
    //         });
    //         transList = treeData;
    //     }
    //     this.treeData = transList;
    // },
    selTree(data: any = [], liData: any) {
        if (data.length > 0) {
            this.brandEditId = liData.id;
        } else {
            this.brandEditId = '1';
        }
        this.getTable(1);
    },
    // 添加资产,页面时候跳转
    // goAdd() {
    //     this.$router.push({name: 'addAssets', query: {pageType: this.assType}});
    // },
    // 添加资产,模态框形式
    goAdd() {
        if ((this as any).$refs.formValidate) {
            (this as any).$refs.formValidate.resetFields();
        }
        this.addTit = '添加资产';
        this.formValidate = {
            name: '',
            type: '',
            assets: '',
        };
        this.getAssetsTree();
        this.addAssets = true;
    },
    goDetails(data: any) {
        const queryPar = {...data, type: (data.locationType === 2 ? 'sensor' : 'gateway'), id: data.deviceId};
        (this as any).$router.push({name: 'assetsDetails', query: queryPar});
        const a: any = sessionStorage.getItem('oldTab');
        const b: any = sessionStorage.getItem('tabIndex');
        const c: any = JSON.stringify(queryPar);
        const d: any = JSON.parse(a);
        d[b].current = c;
        sessionStorage.setItem('oldTab', JSON.stringify(d));
        console.log(d);
    },
    toDelete(data: any) {
        this.$Modal.confirm({
            title: '删除资产',
            content: `<p>是否确定删除：${data.name}？</p>`,
            loading: true,
            onOk: () => {
                const params = {
                    id: data.id,
                };
                assetsApi.delAssets(params).then((res: any) => {
                    this.$Modal.remove();
                    this.$Message.info('删除成功');
                    this.getTable();
                }, (res: any) => {
                    this.$Modal.remove();
                });
            },
        });
    },
    changePageSize(pagesize: number = 10) {
        const {pageSize}  = this;
        if (pagesize !== pageSize) {
            this.pageSize = pagesize;
            this.getTable();
        }
    },
    treeSelectHandle() {
        const {assType, treeData, pageSize} = this;
        const searName = this.searName.trim();
        const param: any = {
            assetType: assType,
            title: searName,
            page: 0,
            size: pageSize,
        };
        this.pageIndex = 1;
        assetsApi.searAssets(param).then((res: any = {}) => {
            const data = res.data || {};
            this.tableData = data.content || [];
            this.pageTotal = data.totalElements;
        });
        searName ? this.tabSelect(assType, searName, treeData[0], null, '') : this.getTreeList();
    },
    tabSelect(type: string, searName: any, data: any, parent: any, addTree: string): void {
      data.expand = false;
      if (data.children && data.children.length > 0) {
        // let isExpand: boolean = false;
        data.children.map((ele: any) => {
          // if (!isExpand) {
          //   isExpand = this.tabSelect(type, searName, ele);
          // } else {
            this.tabSelect(type, searName, ele, data, addTree);
            if (ele.expand && !data.expand) {
              data.expand = true;
            }
          // }
        });
        // if (!data.expand && isExpand) {
        //   data.expand = true;
        // }
      }
      if ((type === '0' || parseInt(type, 0) === data.isLocation) && data.title.indexOf(searName) !== -1) {
        this.$set(data, 'render', (h: any, { root, node, otherData }: any) => {
          return h('span', {
            class: node.node.selected ? 'ivu-tree-title ivu-tree-title-selected' : 'ivu-tree-title',
            style: {
                color: 'red',
            },
            on: {
              click: (e: any) => {
                if (!node.node.selected) {
                  if (!addTree) {
                    (this as any).$refs.treeWrap.handleSelect(node.nodeKey); // 手动选择树节点
                  } else {
                    (this as any).$refs.assetsTree.handleSelect(node.nodeKey); // 手动选择树节点
                  }
                  //  this.selTree('', data);
                }
              },
            },
          }, data.title);
        });
        if (parent && !parent.expand) {
          parent.expand = true;
        }
      } else {
        if (data.render) {
          data.render = '';
        }
      }
    },
  },
});
</script>