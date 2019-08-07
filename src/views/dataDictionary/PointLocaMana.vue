<template>
  <div class="dic_wrap var_wrap">
    <div class="com_top">
        <div class="top_sear">
            <Select v-model="pointType">
                <Option value="all">全部</Option>
                <Option :value="i" v-for="(ele, i) in typeList" :key="i">{{ele}}</Option>
            </Select>
            <Input prefix="ios-search" placeholder="搜索" v-model="searName" />           
            <Button class="btn_sear" type="primary" @click="getTable(1)"> 搜 索 </Button>
        </div>
    </div>
    <div class="com_tab">
        <Table stripe :columns="columnsData" :data="tableData"></Table>
        <div class="page_box">
            <Page :total="pageTotal" @on-change="getTable" @on-page-size-change="changePageSize" show-total show-elevator show-sizer :current="pageIndex" />
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
    <!-- <div v-show="showAllPoints" :style="toolPosition" class="points_box">
        {{allPointsStr}}
    </div> -->
    <Modal
        class="dictionary_modal"
        title="采集点详情"
        v-model="showAllPoints"
        @on-ok="ok"
        @on-cancel="closeModal">
        <p style="word-wrap:break-word">{{allPointsStr}}</p>
    </Modal>
  </div>
  
</template>

<script lang="ts">
import './dataDictionary.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import {Component} from 'vue-property-decorator';
@Component
export default class PointLocaMana extends Vue {
    // data
    private pageTotal: number = 0;
    private pageIndex: number = 1;
    private pageSize: number = 10;
    private limitNum: number = 4;
    private searName: string = '';
    private pointType: string = 'all';
    private allPointsStr: string = '';
    private pointList: any[] = [];
    private tableData: any[] = [];
    private typeList: any[] = [];
    private columnsData: any[] = [
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
            title: '采集点类型',
            key: 'name',
        },
        {
            title: '采集点',
            key: 'points',
            render: (h: any, params: any) => {
                let rowStr = '';
                params.row.points = params.row.points || [];
                params.row.points.map((ele: any, i: any) => {
                    rowStr += ele.name + ',';
                });
                rowStr = rowStr.substring(0, rowStr.length - 1);
                rowStr = params.row.pointsSize > this.limitNum ? (rowStr + '...') : rowStr;
                return  h('span', {
                    on: {
                        // mouseenter: (event: any) => {
                        //     event = event || window.event;
                        //     const tagEle = event.target.getBoundingClientRect();
                        //     let x = event.pageX;
                        //     let y = event.pageY;
                        //     x = tagEle.left;
                        //     y = tagEle.top + tagEle.height;
                        //     if (!(this as any).showAllPoints && params.row.pointsSize > (this as any).limitNum) {
                        //         (this as any).showAllHandle(x, y, params.row);
                        //     }
                        // },
                        // mouseleave: (event: any) => {
                        //     event = event || window.event;
                        //     if ((this as any).showAllPoints) {
                        //         (this as any).showAllPoints = false;
                        //     }
                        // },
                        click: () => {
                            if (params.row.pointsSize > this.limitNum) {
                                this.showAllHandle(params.row);
                            }
                        },
                    },
                    style: {
                        cursor: 'pointer',
                    },
                }, rowStr);
            },
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
            title: '采集点数量',
            key: 'pointsSize',
            align: 'right',
        },
    ];
    private toolPosition: any = {
        left: '0px',
        top: '0px',
    };
    private showAllPoints: boolean = false;

    // life-cycle
    // private created() {
    //     this.getTable();
    // }

    private activated() {
        this.searName = '';
        this.getTable();
        this.getTypeList();
    }
    private deactivated() {
        this.searName = '';
    }

    // methods
    private getTable(page?: number) {
        const reg = /^[a-zA-Z0-9_]{0,20}$/;
        // if (!reg.test((this as any).searName)) {
        //     (this as any).$Message.error(`只允许使用英文、数字、下划线 (_) 且 长度为不能超过20`);
        //     return;
        // }
        const {pageSize, searName, limitNum} = this;
        const pageIndex = (page === undefined ? this.pageIndex - 1 : page - 1);
        let pointType = this.pointType;
        pointType = (pointType === 'all' ? '' : pointType);
        const params = {
            paramStr: `page=${pageIndex}&size=${pageSize}&pointNumber=${limitNum}&category=${pointType}&keyword=${encodeURIComponent(searName)}`,
        };
        dictionaryApi.selectPoints(params).then((res: any) => {
            this.tableData = res.data.content;
            this.pageTotal = res.data.totalElements;
        });
    }
    private getTypeList() {
        const param = {
            params: '',
        };
        dictionaryApi.dataSouList(param).then((res: any = {}) => {
            const data = res.data || [];
            this.typeList = data;
        });
    }
    private changePageSize(pagesize: number = 10) {
        const {pageSize}  = this;
        if (pagesize !== pageSize) {
            this.pageSize = pagesize;
            this.getTable();
        }
    }
    // showAllHandle(this: any, x: number, y: number, data: any) {
    //     this.showAllPoints = false;
    //     const params = {
    //         id: data.id,
    //     };
    //     this.toolPosition = {
    //         left: x + 'px',
    //         top: y + 5 + 'px',
    //     };
    //     dictionaryApi.selectPoint(params).then((res: any = {}) => {
    //         const pointsList = res.data.points || [];
    //         let str = '';
    //         pointsList.map((ele: any, i: number) => {
    //             str += ele.name + ',';
    //         });
    //         this.allPointsStr = str.substring(0, str.length - 1);
    //         this.showAllPoints = true;
    //     });
    // },
    private showAllHandle(this: any, data: any) {
        const params = {
            id: data.id,
        };
        dictionaryApi.selectPoint(params).then((res: any = {}) => {
            const pointsList = res.data.points || [];
            let str = '';
            pointsList.map((ele: any, i: number) => {
                str += ele.name + ',';
            });
            this.allPointsStr = str.substring(0, str.length - 1);
            this.showAllPoints = true;
        });
    }
    private ok() {
        this.showAllPoints = false;
    }
    private closeModal() {
        this.showAllPoints = false;
    }
}
</script>