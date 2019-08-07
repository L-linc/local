<template>
  <div class="loadingLog">
    <div class="header">
      <Input prefix="ios-search" v-model="account" :maxlength="20" placeholder="输入账号" style="width: 280px;marginRight: 10px;" />
      <span>时间 : </span>
      <DatePicker type="datetime" :value="startDate" @on-change="changeStartDate" :options="startDateOption" placeholder="请选择起始时间" style="width: 210px"></DatePicker>
      <span> 一 </span>
      <DatePicker type="datetime" :value="endDate" @on-change="changeEndDate" :options="endDateOption" placeholder="请选择结束时间" style="width: 210px"></DatePicker>
      <Button type="primary" @click="getSearch" style="width:100px;marginLeft:20px;">搜索</Button>
    </div>
    <div style="marginTop:10px;">
      <Table ref="selection" :columns="table.columns" :data="table.list"></Table>
    </div>
   <div style="marginTop:10px;float: right;">
      <Page style="float: left;"
        show-total
        :total="table.total"
        :current="1"
        @on-change="changePageIndex"
        show-sizer
        :page-size="table.pageSize"
        :page-size-opts="[10,20,30,40,50]"
        @on-page-size-change="changePageSize"
        show-elevator
        prev-text="上一页"
        next-text="下一页"
        ></Page>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import systemManageApi from '@/api/systemManage.ts';
export default Vue.extend ({
  name: 'loadLog',
  props: {
    cardName: {
      type: String,
      default: '',
    },
  },
  watch: {
    cardName(newVal) {
      if (newVal && newVal === 'visitLog') {
        this.getSearch();
      }
    },
  },
  data() {
    return {
      account: '',
      startDate: '',
      endDate: '',
      startDateOption: {
        disabledDate: (date: any) => date > new Date(this.$data.endDate) || date > new Date(),
      },
      endDateOption: {
        disabledDate: (date: any) => date < new Date(this.$data.startDate) || date > new Date(),
      },
      table: {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        columns: [ // 账号管理的table表头
          {
            title: '账号',
            key: 'username',
            align: 'left',
          },
          {
            title: '访问时间',
            key: 'createTime',
          },
          {
            title: '访问IP',
            key: 'requestIp',
          },
          {
            title: '访问记录',
            key: 'description',
            align: 'right',
          },
        ],
        list: [] as any[],
      },
    };
  },
  methods: {
    getParams() {
      const p: any = {
        logType: 2,
        page: this.table.pageIndex - 1,
        size: this.table.pageSize,
      };
      if (this.account) {
        p.username = this.account;
      }
      if (this.startDate) {
        p.startTime = this.startDate;
      }
      if (this.endDate) {
        p.endTime = this.endDate;
      }

      return p;
    },
    getRequest() {
      systemManageApi.getLogsApi(this.getParams()).then((res: any) => {
        this.table.list = res.data.content;
        this.table.total = res.data.totalElements;
      });
    },
    getSearch() {
      this.table.pageIndex = 1;
      this.getRequest();
    },
    changePageIndex(pageIndex: any) {
      this.table.pageIndex = pageIndex;
      this.getRequest();
    },
    changePageSize(pageSize: any) {
      this.table.pageSize = pageSize;
      this.getRequest();
    },
    changeStartDate(date: any) {
      this.startDate = date;
    },
    changeEndDate(date: any) {
      this.endDate = date;
    },
  },
  mounted() {
    this.getRequest();
  },
});
</script>
