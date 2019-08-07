<template>
  <div class="third_wrap point_wrap">
    <div class="wrap_top">
      <div class="lab_bar">
        <span @click="setLab('work')" :class="labelType === 'work' ? 'lab_act': ''">工作状态</span>
        <span @click="setLab('type')" :class="labelType === 'type' ? 'lab_act': ''">采集点类型</span>
        <span @click="setLab('alarm')" :class="labelType === 'alarm' ? 'lab_act': ''">报警</span>
      </div>
    </div>
    <ListCom dvType="collector" :labType="labelType" :column="columnsData" :reshTable="reshCount" />
  </div>
</template>

<script lang="ts">
import './devicesManage.less';
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
import ListCom from '@/views/dataSourManage/ListCom.vue';
import Vue from 'vue';
export default Vue.extend ({
  name: 'pointManage',
  components: {
    ListCom,
  },
  props: ['reshTable'],
  watch: {
    reshTable() {
      this.reshCount ++;
    },
  },
  data() {
    return {
      labelType: 'type',
      columnsData: [
          {
              title: '采集点类型',
              key: 'name',
              align: 'center',
              render: (h: any, params: any): any => {
                return h('div', {attrs: {title: params.row.pointType.name}}, params.row.pointType.name);
              },
          },
          {
              title: '采集点名称',
              key: 'name',
              align: 'center',
              render: (h: any, params: any): any => {
                return h('div', {attrs: {title: params.row.name}}, params.row.name);
              },
          },
          {
              title: '位置',
              key: 'location',
              align: 'center',
              render: (h: any, params: any) => {
                return h('div', {attrs: {title: params.row.locations.locationName}}, params.row.locations.locationName);
              },
          },
          {
              title: '上报协议',
              key: 'uploadProto',
              align: 'center',
              render: (h: any, params: any) => {
                return h('div', {attrs: {title: params.row.uploadProto}}, params.row.uploadProto);
              },
          },
          {
              title: '状态',
              key: 'name',
              align: 'center',
              render: (h: any, params: any): any => {
                let txt = '在线';
                switch (params.row.status) {
                  case '1':
                    txt = '预警';
                    break;
                  case '2':
                    txt = '报警';
                    break;
                  case '3':
                    txt = '异常';
                    break;
                  case '4':
                    txt = '未工作';
                    break;
                }
                if ((this as any).labelType === 'work' && params.row.status !== '3' && params.row.status !== '4') {
                  txt = '在线';
                }
                return h('div', {attrs: {title: txt}}, txt);
              },
          },
        ],
      reshCount: 0,
    };
  },
  methods: {
    setLab(val: string) {
      if (val === this.labelType) {
        return;
      }
      this.labelType = val;
    },
  },
});
</script>
