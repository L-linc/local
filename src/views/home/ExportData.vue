<template>
    <div class="export_wrap">
        <div class="export_top">
            <Input v-model="searName" prefix="ios-search" placeholder="搜索" style="width: 280px;margin-right:12px;" />
            <Button type="primary" @click="initList">搜 索</Button>
        </div>
        <div v-if="exportList.length > 0">
            <div class="export_list" v-for="item in exportList" :key="item.id">
                <div class="export_wrap">
                    <i v-if="item.status !== 1" class="export_close" @click="remove(item.id)"></i>
                    <div class="export_title">
                        <p class="export_name">{{item.name}}</p>
                        <p v-if="item.status === 1" class="export_result">{{item.progress}}</p>
                        <p v-else class="export_result">{{item.alias}}</p>
                    </div>
                    <Button v-show="item.status === 1" type="primary" style="width: 80px;" @click="stop(item.id)">{{item.btnAlias}}</Button>
                    <Button v-show="item.status === 3" type="primary" style="width: 80px;" @click="exportFile(item.id)">{{item.btnAlias}}</Button>
                    <Button v-show="item.status === 2" type="primary" style="width: 80px;" @click="downFile(item)">{{item.btnAlias}}</Button>
                    <Button v-show="item.status === -1" type="primary" style="width: 80px;" @click="downFile(item)">{{item.btnAlias}}</Button>
                </div>
            </div>
        </div>
        <div v-else class="no_export">
            <p>当前暂无导出任务</p>
        </div>
        <div style="height: 34px;float:right;">
            <Page @on-change="getPage" @on-page-size-change="changePageSize" prev-text="上一页" next-text="下一页" style="float:left;margin-right:12px" :total="total" :current="pageIndex" show-total show-elevator show-sizer/>
        </div>
    </div>
</template>

<script lang="ts">
import './export.less';
import Vue from 'vue';
import exportDataApi from '@/api/exportData.ts';
import * as util from '../../config/utils';
import {Component} from 'vue-property-decorator';
@Component
export default class ExportData extends Vue {

    // data
    private searName: string = '';
    private statuses: any[] = [];
    private exportList: any[] = [];
    private total: number = 0; // 总条数
    private pageSize: number = 10; // 每页条数
    private pageIndex: number = 1; // 当前页码
    private totalPage: number = 1; // 总页数
    private token: string = '';

    // life-cycle
    private activated() {
        this.token = `Bearer ` + util.getCookie('token');
        this.initList();
    }

    // methods
    private initList() {
        const param = {
            name: this.searName,
            statuses: this.statuses,
            page: this.pageIndex - 1,
            size: this.pageSize,
        };
        exportDataApi.getFileList(param).then((res: any) => {
            this.exportList = res.data.content.map((ele: any) => {
                ele.alias = this.transName(ele.status).txt;
                ele.btnAlias = this.transName(ele.status).btnTxt;
                if (ele.progress) {
                    ele.progress = ele.progress.substring(0, ele.progress.indexOf('/')) + '%';
                }
                return ele;
            });
            this.total = res.data.total;
        });
    }

    private transName(status: number) {
        let txt = '';
        let btnTxt = '';
        switch (status) {
            case 1:
                txt = '导出中';
                btnTxt = '取消';
                break;
            case 2:
                txt = '成功';
                btnTxt = '下载';
                break;
            case 3:
                txt = '失败';
                btnTxt = '重新导出';
                break;
            case -1:
                txt = '已下载';
                btnTxt = '重新下载';
                break;
        }
        return {txt, btnTxt};
    }

    private downFile(item: any) {
        // const param = {
        //     id: item.id,
        // };
        // window.open(`${item.exportUrl}`, '_blank');
        // exportDataApi.downExportFile(param).then(() => {
        //     this.initList();
        // });
        //  const param = {
        //     id: 61,
        // };
        window.open(`/api/export/download/${item.id}?&token=${this.token}`, '_blank');
        this.initList();
        // exportDataApi.downExportFile(param).then(() => {
        //     this.initList();
        // });
    }

    private exportFile(id: number) {
        const param = {
            id,
        };
        exportDataApi.reExportFile(param).then((res: any) => {
            if (res.data.code === 1) {
                this.$Message.info('正在执行重新导出,一次只能执行一条重新导出');
                return;
            } else {
                this.$Message.info('数据重新导出中,请稍候查看导出文件');
                this.initList();
            }
        });
    }

    private remove(id: number) {
        const param = {
            id,
        };
        exportDataApi.removeExportFile(param).then(() => {
            this.$Message.info('删除成功');
            this.initList();
        });
    }

     private stop(id: number) {
        const param = {
            id,
        };
        exportDataApi.stopExportFile(param).then(() => {
            this.$Message.info('取消导出');
            this.initList();
        });
    }
     // 切换页码
    private getPage(page: number) {
        this.pageIndex = page;
        this.initList();
    }

    // 切换条数
    private changePageSize(pagesize: number) {
        this.pageSize = pagesize;
        this.pageIndex = 1;
        this.initList();
    }

}
</script>
