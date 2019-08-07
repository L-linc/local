<template>
  <div class="list_wrap">
    <div class="map_bar" v-if="labType !== 'type'">
      <div class="map_info">
        <span>
          <em class="map_icon"></em>
          <em>{{labType === 'alarm' ? '正常' : '在线'}}：{{getStatusList[0]}}%</em>
        </span>
        <span v-show="labType === 'alarm'">
          <em class="map_icon1"></em>
          <em>预警：{{getStatusList[1]}}%</em>
        </span>
        <span v-show="labType === 'alarm'">
          <em class="map_icon3"></em>
          <em>报警：{{getStatusList[2]}}%</em>
        </span>
        <span>
          <em class="map_icon2"></em>
          <em>异常：{{getStatusList[3]}}%</em>
        </span>
        <span>
          <em class="map_icon4"></em>
          <em>未工作：{{getStatusList[4]}}%</em>
        </span>
      </div>
      <div class="map_pross">
        <span :class="searStatus === '0' ? 'pross_act' : ''" @click="csStatus('0')" :style="`width:${getStatusList[0]}%`"></span>
        <span :class="searStatus === '1' ? 'pross_act' : ''"  @click="csStatus('1')" :style="`width:${getStatusList[1]}%`"></span>
        <span :class="searStatus === '2' ? 'pross_act' : ''"  @click="csStatus('2')" :style="`width:${getStatusList[2]}%`"></span>
        <span :class="searStatus === '3' ? 'pross_act' : ''"  @click="csStatus('3')" :style="`width:${getStatusList[3]}%`"></span>
        <span :class="searStatus === '4' ? 'pross_act' : ''"  @click="csStatus('4')" :style="`width:${getStatusList[4]}%`"></span>
      </div>
    </div>
    <div class="type_bar" v-else>
      <div :class="ele.flag ? 'type_act' : ''" v-for="(ele,i) in typeList" :key="i" @click="csType($event, ele)">
        <span class="type_icon"></span>
        <span class="type_name">{{ele.typeName}}</span>
        <span class="type_num">{{ele.count}}</span>
      </div>
    </div>
    <div class="sear_bar">
      <div class="sear_left">
        <Select v-model="typeId" filterable>
          <Option value="all">所有类型</Option>
          <Option v-for="(ele,i) in typeList" :key="i" :value="ele.typeId">{{ele.typeName}}</Option>
        </Select>
        <Input v-model="searName" />
        <Button type="primary" @click="getTable">搜索</Button>
      </div>
      <!-- <Button type="">导出</Button> -->
      <div v-show="addName" class="sear_right">
        <Button @click="toAdd" v-has="'SYS_SENSOR_ADD' || 'SYS_GATEWAY_ADD'"> + {{addName}}</Button>
      </div>
    </div>
    <div class="tab_bar">
      <Table stripe :columns="columnsData" :data="tableData"></Table>
      <div class="page_box">
          <Page :total="pageTotal" @on-change="changePageIndex" @on-page-size-change="changePageSize" show-total show-elevator show-sizer />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import './devicesManage.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
// import * as util from '../../config/utils';
export default Vue.extend ({
  name: 'listCom',
  props: ['dvType', 'labType', 'addName', 'column', 'reshTable'],
  created() {
    this.initData();
    this.transCol();
  },
  watch: {
    labType() {
      this.searStatus = '';
      this.typeId = 'all';
      switch (this.labType) {
        case 'work':
          this.getWorkList();
          break;
        case 'type':
          this.getTypeList();
          break;
        case 'alarm':
          this.getWorkList();
          break;
      }
    },
    reshTable() {
      switch (this.labType) {
        case 'work':
          this.getWorkList();
          break;
        case 'type':
          this.getTypeList();
          break;
        case 'alarm':
          this.getWorkList();
          break;
      }
      this.getTable();
    },
  },
  computed: {
    getStatusList() {
      const statusTotal: any = this.statusTotal;
      const statusList: any[] = this.statusList.map((ele: any, i: number) => {
        if (statusTotal === 0) {
          return 0;
        }
        return (ele / statusTotal * 100).toFixed(2);
      });
      if (this.labType === 'work') {
        // console.log(statusTotal, [(statusTotal ? (100 - statusList[3] - statusList[4]) : 0), 0, 0, statusList[3], statusList[4]]);
        return [(statusTotal ? (100 - statusList[3] - statusList[4]).toFixed(2) : 0), 0, 0, statusList[3], statusList[4]];
      } else {
        return statusList;
      }
    },
  },
  data() {
    return {
      typeId: 'all',
      typeList: [] as any,
      pageTotal: 0,
      pageIndex: 1,
      pageSize: 10,
      addLoading: true,
      columnsData: this.column,
      statusList: ['0', '0', '0', '0', '0'],
      statusTotal: 1,
      searStatus: '',
      tableData: [],
      searName: '',
    };
  },
  methods: {
    initData() {
      // this.getWorkList();
      this.getTypeList();
      this.getTable();
    },
    getTypeList() {
      const type = this.dvType ? this.dvType : 'sensor';
      const params = {
        type,
      };
      if (type === 'sensor' || type === 'gateway') {
        dataSourApi.getDtypeList(params).then((res: any = {}) => {
          const data = res.data || [];
          this.typeList = data;
        });
      } else {
        dataSourApi.getPtypeList(params).then((res: any = {}) => {
          const data = res.data || [];
          this.typeList = data;
        });
      }
    },
    getWorkList() {
      const type: string = this.dvType ? this.dvType : 'sensor';
      let params: any = {
        type,
      };
      if (type !== 'sensor' && type !== 'gateway') {
        params = {
          type: 'points',
          category: type,
        };
      }
      dataSourApi.getStatusList(params).then((res: any = {}) => {
        const data = res.data || [];
        const countList: string[] = ['0', '0', '0', '0', '0'];
        let total: number = 0;
        // let data = [{count: 1, status: "0"}, {count: 1, status: "2"}];
        data.map((ele: any = {}, i: number) => {
          countList[ele.status] = ele.count;
          total += parseInt(ele.count, 0);
        });
        this.statusList = countList;
        this.statusTotal = total;
      });
    },
    getTable() {
      const {pageSize, pageIndex, typeId, searName, dvType} = this;
      let searStatus = this.searStatus;
      let url = '';
      if (dvType === 'sensor' || dvType === 'gateway') {
        url = dvType + 's';
      } else {
        url = `points/${dvType}`;
        if (searStatus === '0' && this.labType !== 'alarm') {
          searStatus = '0,1,2';
        }
      }
      const params = {
        keyword: searName ? searName : null,
        typeId: typeId === 'all' ? null : typeId,
        page: pageIndex - 1,
        size: pageSize,
        url,
        status: searStatus ? searStatus : null,
      };
      dataSourApi.getTableData(params).then((res: any = {}) => {
        const data = res.data || {};
        const content = data.content || [];
        this.tableData = content;
        this.pageTotal = data.totalElements;
      });
    },
    changePageIndex(page: number) {
      this.pageIndex = page;
      this.getTable();
    },
    changePageSize(pageSize: number) {
      if (pageSize !== this.pageSize) {
        this.pageSize = pageSize;
        this.getTable();
      }
    },
    // searchHandle() {
    //   this.getTable();
    // },
    csType(event: any, data: any = {}) {
      if (data.flag) {
        data.flag = false;
        this.typeId = '';
      } else {
        this.typeList.map((ele: any, i: number) => {
          ele.flag = false;
        });
        data.flag = true;
        this.typeId = data.typeId;
      }
      this.pageIndex = 1;
      this.getTable();
    },
    csStatus(val: string) {
      this.searStatus = this.searStatus  === val ? '' : val;
      this.getTable();
    },
    toAdd() {
      this.$emit('showModel');
    },
    toDelete(data: any) {
      const text = this.dvType === 'sensor' || this.dvType === 'gateway' ? '设备' : '采集点';
      (this as any).$Modal.confirm({
        title: `删除${text}`,
        content: `<p>是否确定删除：${data.name}？</p>`,
        loading: true,
        onOk: () => {
          let type = this.dvType;
          type = (type !== 'sensor' && type !== 'gateway' ? 'point' : type);
          const params = {
              id: data.id,
              type,
          };
          dataSourApi.deLeteDevice(params).then((res: any) => {
            (this as any).$Modal.remove();
            (this as any).$Message.info('删除成功');
            (this as any).getTable();
            switch (this.labType) {
              case 'work':
                this.getWorkList();
                break;
              case 'type':
                this.getTypeList();
                break;
              case 'alarm':
                this.getWorkList();
                break;
            }
          }, (res: any) => {
            (this as any).$Modal.remove();
          });
        },
      });
    },
    transCol() {
      let opearFlag = false;
      this.column.map((ele: any) => {
        if (ele.key === 'opear') {
          opearFlag = true;
        }
      });
      if (this.column && !opearFlag) {
        let searchAuth = '';
        switch (this.dvType) {
          case 'sensor':
            searchAuth = 'SYS_SENSOR_DETAIL';
            break;
          case 'gateway':
            searchAuth = 'SYS_GATEWAY_DETAIL';
            break;
          case 'collector':
            searchAuth = 'SYS_COLLECTOR_POINT_DETAIL';
            break;
          case 'thirdParty':
            searchAuth = 'SYS_THIRD_POINT_DETAIL';
            break;
        }
        let delAuth = '';
        switch (this.dvType) {
          case 'sensor':
            delAuth = 'SYS_SENSOR_DEL';
            break;
          case 'gateway':
            delAuth = 'SYS_GATEWAY_DEL';
            break;
          case 'collector':
            delAuth = 'SYS_COLLECTOR_POINT_DEL';
            break;
          case 'thirdParty':
            delAuth = 'SYS_THIRD_POINT_DEL';
            break;
        }
        this.column.push({
          title: '操作',
          key: 'opear',
          align: 'right',
          render: (h: any, params: any): any => {
            return h('div', [
                        h('icon', {
                            class: ['app_icon', 'app_icon_search'],
                            style: {
                              cursor: 'pointer',
                            },
                            on: {
                                click: () => {
                                  let type = this.dvType;
                                  if (type  === 'collector' && !params.row.sensorId) {
                                    this.$Message.error('选中的采集点未绑定所属的sensor');
                                    return;
                                  }
                                  let queryPar: any = {...params.row, type};
                                  queryPar.pointType = params.row.pointType ? params.row.pointType.id : '';
                                  if (type === 'collector') {
                                    type = 'sensor';
                                    queryPar = {...queryPar, id: params.row.sensorId, type, pointId: params.row.id};
                                  }
                                  (this as any).$router.push({name: 'deviceDetails', query: queryPar});
                                  const a: any = sessionStorage.getItem('oldTab');
                                  const b: any = sessionStorage.getItem('tabIndex');
                                  const c: any = JSON.stringify(queryPar);
                                  const d: any = JSON.parse(a);
                                  d[b].current = c;
                                  sessionStorage.setItem('oldTab', JSON.stringify(d));
                                },
                            },
                            directives: [{
                              name: 'has',
                              value: searchAuth,
                            }],
                        }),
                        h('icon', {
                            class: ['app_icon', 'app_icon_del'],
                            style: {
                              cursor: 'pointer',
                            },
                            on: {
                                click: () => {
                                    (this as any).toDelete(params.row);
                                },
                            },
                            directives: [{
                              name: 'has',
                              value: delAuth,
                            }],
                        }),
                    ]);
          }});
      }
    },
  },
});
</script>
