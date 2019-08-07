<template>
  <div class="dic_wrap">
    <div class="com_top">
        <div class="top_sear">
            <Input prefix="ios-search" placeholder="搜索" v-model="searName" />
            <Button class="btn_sear" @click="getTable(1)" type="primary"> 搜 索 </Button>
        </div>
        <div class="top_add">
            <Button type="primary" @click="showToast" v-has="'SYS_DICT_BRAND_ADD'"> + 添加品牌 </Button>
        </div>
    </div>
    <div class="com_tab">
        <Table stripe :columns="columnsData" :data="tableData"></Table>
        <div class="page_box">
            <Page :current="pageIndex" :total="pageTotal" @on-change="getTable" @on-page-size-change="changePageSize" show-total show-elevator show-sizer />
        </div>
    </div>
    <Modal
        class="dictionary_modal"
        v-model="addFlag"
        :title="toastTit">       
        <label class="add_label"><span class="label_name">品牌名称：</span><Input name="name" v-model="brandNameAdd" placeholder="品牌名称" /></label>
        <div slot="footer">
            <Button type="primary" size="large" @click="brandSubmit">确定</Button>
            <Button type="text" size="large" @click="closeModal">取消</Button>
        </div>
    </Modal>
  </div>
  
</template>

<script lang="ts">
import './dataDictionary.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import {Component} from 'vue-property-decorator';
@Component
export default class BranfMana extends Vue {

    // data
    private pageTotal: number = 20;
    private pageIndex: number = 1;
    private pageSize: number = 10;
    private brandNameAdd: string = '';
    private pageType: string = 'brand';
    private brandEditId: string = '';
    private searName: string = '';
    private addFlag: boolean = false;
    private toastTit: string = '添加品牌';
    private columnsData: any[] = [
        {
            title: '品牌名称',
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
            render: (h: any, params: any) => {
                return h('div', [
                            h('Icon', {
                                props: {
                                    type: 'ios-create-outline',
                                    size: '24',
                                },
                                style: {
                                    cursor: 'pointer',
                                },
                                directives: [
                                    {
                                        name: 'has',
                                        value: 'SYS_DICT_BRAND_MOD',
                                    },
                                ],
                                on: {
                                    click: () => {
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
                                directives: [
                                    {
                                        name: 'has',
                                        value: 'SYS_DICT_BRAND_DEL',
                                    },
                                ],
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
    private tableData: any[] = [];

    // life-cycle
    private created() {
        this.getTable();
    }

    // methods
    private getTable(page?: number) {
        const {pageSize, searName, pageType} = this;
        const pageIndex = (page === undefined ? this.pageIndex : page);
        this.pageIndex = pageIndex;
        const paramStr = {
            params: '',
        };
        interface ParamInter {
            page: any;
            size: any;
            type: any;
            name: any;
            [propName: string]: any;
        }
        const param: ParamInter = {
            page: pageIndex - 1,
            size: pageSize,
            type: pageType,
            name: encodeURIComponent (searName),
        };
        let returnStr = '';
        for (const ele in param) {
            if (true) {
                returnStr += (ele + '=' + param[ele] + '&');
            }
        }
        paramStr.params = returnStr.substring(0, returnStr.length - 1);
        dictionaryApi.selectType(paramStr).then((res) => {
            this.tableData = res.data.content;
            this.pageTotal = res.data.totalElements;
        });
    }
    private showToast(type: string = 'add', data: any) {
        this.addFlag = true;
        if (type === 'edit') {
            this.toastTit = '编辑品牌';
            this.brandNameAdd = data.name;
            this.brandEditId = data.id;
        } else {
            this.brandNameAdd = '';
            this.brandEditId = '';
            this.toastTit = '添加品牌';
        }
    }
    private closeModal() {
        this.addFlag = false;
    }
    private brandSubmit() {
        const {toastTit, brandEditId, pageType} = this;
        const brandNameAdd = this.brandNameAdd.trim() || '';
        if (!brandNameAdd || brandNameAdd.length > 50) {
            this.$Message.error(`品牌名称不能为空，且不能超过50个字`);
            return;
        }
        const xhrType = toastTit === '编辑品牌' ? 'edit' : 'add';
        const param: any = {
            name: brandNameAdd,
            value: brandNameAdd,
            description: '',
            alias: '',
            parentId: '',
            type: pageType,
        };
        if (xhrType === 'add') {
            dictionaryApi.addType(param).then((res) => {
                this.$Message.info('添加成功');
                this.getTable();
                this.addFlag = false;
            });
        } else {
            const editParam = {...param, id: brandEditId};
            dictionaryApi.editType(editParam).then((res) => {
                this.$Message.info('修改成功');
                this.getTable();
                this.addFlag = false;
            });
        }
    }
    private toDelete(data: any) {
        this.$Modal.confirm({
            title: '删除品牌',
            content: `<p>是否确定删除：${data.name}？</p>`,
            loading: true,
            onOk: () => {
                const params = {
                    id: data.id,
                };
                (this as any).$Spin.show();
                dictionaryApi.deleteType(params).then((res: any) => {
                    (this as any).$Spin.hide();
                    this.$Modal.remove();
                    this.$Message.info('删除成功');
                    this.getTable();
                }, (res: any) => {
                    (this as any).$Spin.hide();
                });
            },
        });
    }
    private changePageSize(pagesize: number) {
        const {pageSize}  = this;
        if (pagesize !== pageSize) {
            this.pageSize = pagesize;
            this.getTable(1);
        }
    }
}
</script>