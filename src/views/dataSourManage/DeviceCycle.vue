<template>
  <div class="cycle_wrap">
    <!-- <div v-if="type == 'sensor'" class="wrap_top">
      <span class="sea_bar">
        <em>采集点类型：</em>
        <Select v-model="pointType" @on-change="getPointsList">
          <Option value="all">所有</Option>
          <Option v-for="(ele,i) in pointTypeList" :value="ele.id" :key="i">{{ele.name}}</Option>
        </Select>
      </span>
      <span class="sea_bar">
        <em>采集点：</em>
        <Select v-model="pointId">
          <Option value="all">所有</Option>
          <Option v-for="(ele,i) in pointsList" :value="ele.id" :key="i">{{ele.name}}</Option>
        </Select>
      </span>
      <Button @click="getSensorCycleData" type="primary"> 搜 索 </Button>
    </div> -->
    <div class="wrap_con">
      <div class="cycle_li">
        <span class="li_tit">工作时间：</span>
        <Input v-model="totalWorkTime" disabled />
      </div>
      <div class="cycle_li">
        <span class="li_tit">故障时长：</span>
        <Input v-model="breakDownTime" disabled />
      </div>
      <div class="cycle_li">
        <span class="li_tit">故障次数：</span>
        <Input v-model="breakTimes" disabled />
      </div>
      <!-- <div class="table_bar">
        <Table stripe :columns="columnsData" :data="tableData"></Table>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import './devicesManage.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
export default Vue.extend ({
  name: 'DeviceCycle',
  props: ['type', 'dvId'],
  created() {
    // console.log(this.type, this.type === 'sensor')
    // if (this.type === 'sensor') {
    //   console.log(this.type, this.type === 'sensor')
    //   const pointId: any = this.$route.query.pointId;
    //   const pointType: any = this.$route.query.pointType;
    //   this.pointId = pointId ? pointId : 'all';
    //   this.pointType = pointType ? pointType.id : 'all';
    //   this.getTypeList();
    // } else {
    //   this.getCycle();
    // }
    this.getCycle();
  },
  watch: {
    dvId() {
      // if (this.type === 'sensor') {
      //   const pointId: any = this.$route.query.pointId;
      //   const pointType: any = this.$route.query.pointType;
      //   this.pointId = pointId ? pointId : 'all';
      //   this.pointType = pointType ? pointType.id : 'all';
      //   this.getTypeList();
      // } else {
      //   this.getCycle();
      // }
      this.getCycle();
    },
  },
  data() {
    return {
      totalWorkTime: '0',
      breakTimes: '0',
      breakDownTime: '0',
      pointType: 'all',
      pointId: 'all',
      pointsList: [] as any,
      pointTypeList: [] as any,
      columnsData: [
        {
          title: '状态',
          key: 'status',
          align: 'center',
          render: (h: any, params: any): any => {
            // const statusTxt = params.row.status === '1' ? '正常' : '故障';
            return params.row.status === '1' ? h('span', '正常') : h('span', {style: {color: '#FF5542'}}, '故障') ;
          },
        },
        {
          title: '开始时间',
          align: 'center',
          key: 'startTime',
        },
        {
          title: '结束时间',
          align: 'center',
          key: 'endTime',
        },
        {
          title: '总共时长',
          align: 'center',
          key: 'cost',
          render: (h: any, params: any): any => {
            return h('span', params.row.cost + 'h');
          },
        },
        {
          title: '描述',
          align: 'center',
          key: 'descript',
        },
      ],
      tableData: [],
    };
  },
  methods: {
    getTypeList() {
      if (this.pointTypeList.length >= 0) {
        return ;
      }
      const params = {
          params: `page=&size=&category=collector&keyword=&pointNumber=`,
      };
      dictionaryApi.collTypeList(params).then((res: any = {}) => {
        const data = res.data || {};
        const list = data.content || [];
        this.pointTypeList = list;
        // // 采集点类型赋初值
        // if (list.length > 0) {
        //   this.pointType = list[0].id;
        //   this.getPointsList(list[0].id);
        // }
        const pointType: any = this.$route.query.pointType;
        // this.pointType = pointType ? pointType.id : 'all'; // 强哥说可能是个对象,可是他自己就没有对象
        this.pointType = pointType ? pointType : 'all';
        this.getPointsList(pointType);
       });
    },
    getPointsList(id: any) {
      id = id ? id : this.pointType;
      if (!id || id === 'all') {
        this.pointId = 'all';
        this.pointsList = [];
        this.getCycle();
        return;
      }
      const pointId: any = this.$route.query.pointId;
      const params = {
        id,
      };
      dictionaryApi.selectPoint(params).then((res: any = {}) => {
        const pointsList = res.data.points || [];
        this.pointsList = pointsList;
        if (!pointId) {
          this.pointId = pointsList[0].id;
        } else {
          this.pointId = pointId;
        }
        this.getCycle();
      });
    },
    getCycle() {
      if (this.type === 'sensor') {
        this.getSensorCycleData();
      } else {
        this.getOtherCycleData();
      }
    },
    getOtherCycleData() {
      const {dvId, type} = this;
      const params = {
        id: this.dvId,
        type: type === 'gateway' ? type : 'point',
      };
      dataSourApi.getPointCycle(params).then((res: any = {}) => {
        const data = res.data || {};
        this.setData(data);
      });
    },
    getSensorCycleData() {
      const {dvId, type, pointId, pointType} = this;
      const params = {
        sid: dvId,
        pid: pointId === 'all' ? '' : pointId,
        typeId: pointType === 'all' || pointId ? '' : pointType,
      };
      dataSourApi.getSensorCycle(params).then((res: any = {}) => {
        const data = res.data || {};
        this.setData(data);
      });
    },
    setData(data: any = {}) {
      this.totalWorkTime = data.totalWorkTime ? data.totalWorkTime + 'h' : '0';
      this.breakTimes = data.breakTimes ? data.breakTimes : '0';
      this.breakDownTime = data.breakDownTime ? data.breakDownTime + 'h' : '0';
      this.tableData = data.data || [];
    },
  },
});
</script>