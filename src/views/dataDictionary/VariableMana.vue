<template>
  <div class="dic_wrap var_wrap">
    <div class="com_top">
        <div class="top_sear">
            <Select v-model="pointType">
                <Option value="">全部</Option>
            </Select>
            <Input prefix="ios-search" placeholder="搜索" v-model="searName" />           
            <Button class="btn_sear" type="primary"> 搜 索 </Button>
        </div>
    </div>
    <div class="com_tab">
        <Table stripe :columns="columnsData" :data="tableData"></Table>
        <div class="page_box">
            <Page :total="pageTotal" @on-change="getTable" @on-page-size-change="changePageSize" show-total show-elevator show-sizer />
        </div>
    </div>
    <!-- <Modal
        v-model="addFlag"
        :title="toastTit"
        width="420px"
        @on-ok="brandSubmit"
        @on-cancel="closeModal">       
        <label class="add_label"><span class="label_name">品牌名称：</span><Input name="name" v-model="brandNameAdd" placeholder="品牌名称" /></label>
    </Modal> -->
  </div>
  
</template>

<script lang="ts">
import './dataDictionary.less';
import dictionaryApi from '@/api/dataDictionary.ts';
import Vue from 'vue';
import {Component} from 'vue-property-decorator';
@Component
export default class VariableMana extends Vue {
    // data
    private pageTotal: number = 20;
    private pageIndex: number = 1;
    private pageSize: number = 10;
    private limitNum: number = 8;
    // private brandNameAdd: string = '';
    // private brandEditId: string = '';
    private searName: string = '';
    private pointType: string = '';
    // private toastTit: string = '添加品牌';
    // private addFlag: boolean = false;
    private columnsData: boolean = false;
    private addFlag: any[] = [
        {
            title: '采集点类型',
            key: 'name',
        },
        {
            title: '变量',
            key: 'points',
            align: 'right',
            render: (h: any, params: any) => {
                let rowStr = params.row.points.join(',');
                rowStr = params.row.count > this.limitNum ? (rowStr + '...') : rowStr;
                return  h('span', rowStr, {
                    on: {
                        mouseover: (event: any) => {
                            event = event || window.event;
                            console.log(event);
                        },
                    },
                    data: rowStr,
                });
            },
        },
    ];
    private tableData: any[] = [
        {
            id: '1',
            name: 'PARTICLE',
            value: 'PARTICLE',
            count: 200,
            points: [
                'particle01',
                'particle02',
                'particle03',
            ],
        },
        {
            id: '1',
            name: 'PARTICLE',
            value: 'PARTICLE',
            count: 3,
            points: [
                'particle01',
                'particle02',
                'particle03',
            ],
        },
        {
            id: '1',
            name: 'PARTICLE',
            value: 'PARTICLE',
            count: 3,
            points: [
                'particle01',
                'particle02',
                'particle03',
            ],
        },
        {
            id: '1',
            name: 'PARTICLE',
            value: 'PARTICLE',
            count: 3,
            points: [
                'particle01',
                'particle02',
                'particle03',
            ],
        },
    ];

    // methods
    private getTable() {
        const {pageIndex, pageSize, searName, limitNum, pointType} = this;
        const param = {
            page: pageIndex,
            size: pageSize,
            pointNumber: limitNum,
            pointType,
            name: searName,
        };
       // dictionaryApi.selectPoints(param);
    }
    // private showToast(type: string = 'add') {
    //     this.addFlag = true;
    //     if (type === 'edit') {
    //         this.toastTit = '编辑品牌';
    //     }
    // },
    // private closeModal() {
    //     this.addFlag = false;
    // },
    // private brandSubmit() {
    //     const {brandNameAdd, toastTit, brandEditId} = this;
    //     const xhrType = toastTit === '编辑品牌' ? 'edit' : 'add';
    //     const param = {
    //         name: brandNameAdd,
    //         value: brandNameAdd,
    //         description: '',
    //         alias: '',
    //         parentId: '',
    //         typeId: '',
    //         sort: 1,
    //     };
    //     if (xhrType === 'add') {
    //         dictionaryApi.addType(param);
    //     } else {
    //         const editParam: any = {...param, id: brandEditId};
    //         dictionaryApi.editType(editParam);
    //     }
    // },
    // private toDelete(data: any) {
    //     this.$Modal.confirm({
    //         title: '删除品牌',
    //         content: `<p>是否确定删除：${data.name}？</p>`,
    //         loading: true,
    //         onOk: () => {
    //             const params = {
    //                 id: data.id,
    //             };
    //             (this as any).$Spin.show();
    //             dictionaryApi.deleteType(params).then((res: any) => {
    //                 (this as any).$Spin.hide();
    //                 this.$Modal.remove();
    //             }, (res: any) => {
    //                 (this as any).$Spin.hide();
    //             });
    //         },
    //     });
    // },
    private changePageSize(pagesize: number = 10) {
        const {pageSize}  = this;
        if (pagesize !== pageSize) {
            this.pageSize = pagesize;
            this.getTable();
        }
    }
}
</script>