<template>
  <div class="details_wrap">
      <div class="sear_wrap">
          <Select v-model="assType">
              <Option value="0">所有</Option>
              <Option v-for="(ele, i) in assetTypeList" :key="i" :value="ele.assetType">{{ele.title}}</Option>
          </Select>
          <div class="sear_bar">
              <Input prefix="ios-search" placeholder="搜索" v-model="searName" />
              <Button class="btn_sear" @click="treeSelectHandle" type="primary"> 搜 索 </Button>
          </div>
          <div class="tree_bar">
              <Tree ref="deviceTree" :data="treeData" @on-select-change="selTree"></Tree>
          </div>
      </div>
      <div class="con_wrap">
        <div class="con_menu">
          <span v-show="pageType != 'gateway'" :class="menuType === 'data' ? 'menu_act' : ''" @click="setMenu('data')">数据</span>
          <span :class="menuType === 'attr' ? 'menu_act' : ''" @click="setMenu('attr')">属性</span>
          <span :class="menuType === 'cycle' ? 'menu_act' : ''" @click="setMenu('cycle')">生命周期</span>
          <span v-show="pageType != 'gateway'" :class="menuType === 'alarm' ? 'menu_act' : ''" @click="setMenu('alarm')">报警</span>
        </div>
        <div class="con_bar">
          <DeviceAlarm :type="pageType" :dvId="dvId" v-if="menuType === 'alarm'"></DeviceAlarm>
          <DeviceAttr :type="pageType" :dvId="dvId" v-if="menuType === 'attr'"></DeviceAttr>
          <DeviceCycle :type="pageType" :dvId="dvId" v-if="menuType === 'cycle'"></DeviceCycle>
          <DeviceData :type="pageType" :dvId="dvId" v-if="menuType === 'data'"></DeviceData>
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import './devicesManage.less';
import Vue from 'vue';
import DeviceAlarm from '@/views/dataSourManage/DeviceAlarm.vue';
import DeviceAttr from '@/views/dataSourManage/DeviceAttr.vue';
import DeviceCycle from '@/views/dataSourManage/DeviceCycle.vue';
import DeviceData from '@/views/dataSourManage/DeviceData.vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
import assetsApi from '@/api/assetsManage.ts';
export default Vue.extend ({
  name: 'DeviceDetails',
  created() {
    const {type, id} = this.$route.query;
    (this as any).pageType = type ? type : 'sensor';
    (this as any).dvId = id;
    this.getProtosData();
    this.getTypeData();
    this.getReportData();
    this.getAssetTypeData();
    this.getTreeList();
  },
  activated() {
    const {type, id} = this.$route.query;
    (this as any).pageType = type ? type : 'sensor';
    (this as any).dvId = id;
    type === 'gateway' ? this.setMenu('attr') : this.setMenu('data');
    this.treeData = [...this.treeData];
    this.setTreeNode(this.dvId);
  },
  watch: {
    $route() {
      const {type, id} = this.$route.query;
      if (id) {
        (this as any).pageType = type ? type : 'sensor';
        (this as any).dvId = id;
        type === 'gateway' ? this.setMenu('attr') : this.setMenu('data');
      }
    },
  },
  components: {
    DeviceAlarm,
    DeviceAttr,
    DeviceCycle,
    DeviceData,
  },
  data() {
    return {
      searName: '',
      assType: '0',
      assetTypeList: [] as any,
      pageType: 'sensor',
      addType: true,
      menuType: 'attr',
      pointType: '',
      typeList: [],
      barType: false,
      pointName: '',
      agreement: '',
      aggreList: [],
      reportType: 'direct',
      reportList: {},
      inSensor: '',
      sensorList: [],
      dvId: '',
      treeData: [
        // {
        //   title: 'root',
        //   id: '0',
        //   parent: '',
        //   isLocation: '',
        //   hasChildren: '',
        //   loading: false,
        // },
      ] as any,
    };
  },
  methods: {
    setMenu(val: string) {
      if (this.menuType !== val) {
        this.menuType = val;
      }
    },
    getProtosData() {
      dataSourApi.getProtos().then((res: any = {}) => {
        const list = res.data || [];
        this.aggreList = list;
        // 协议赋初值
        this.agreement = list.length > 0 ? list[0] : '';
      });
    },
    getTypeData() {
      const params = {
          params: `page=&size=&category=collector&keyword=&pointNumber=`,
      };
      dictionaryApi.collTypeList(params).then((res: any = {}) => {
        const data = res.data || {};
        const list = data.content || [];
        this.typeList = list;
        // 采集点类型赋初值
        this.pointType = list.length > 0 ? list[0].id : '';
      });
    },
    getReportData() {
      dataSourApi.getReports().then((res: any = {}) => {
        const list = res.data || {};
        this.reportList = list;
        // 协议赋初值
        // const reportType = list.length > 0 ? list[0] : '';
        this.reportType = 'direct';
        this.getInSensorData('direct');
      });
    },
    getInSensorData(type: string) {
      const uploadType = type ? this.reportType : type;
      const params = {
        uploadType,
      };
      dataSourApi.getInSensorList(params).then((res: any = {}) => {
        const data = res.data || [];
        this.sensorList = data;
        // 采集点类型赋初值
        this.inSensor = data.length > 0 ? data[0].id : '';
      });
    },
    getAssetTypeData() {
      const allParam = {
        isUse: 1,
      };
      assetsApi.getAllAssetType(allParam).then((res: any = {}) => {
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
        const data = res.data || {};
        this.treeData = [data];
        this.setTreeNode(this.dvId);
      });
    },
    selTree(a: any, data: any) {
      // (this as any).pageType = type ? type : 'sensor';
      // (this as any).dvId = id;
      // console.log(a);
      let type = 'gateway';
      switch (data.isLocation) {
        case 1:
          this.pageType = 'gateway';
          this.dvId = data.childId;
          if (this.menuType !== 'attr' && this.menuType !== 'cycle') {
            this.menuType = 'attr';
          }
          break;
        case 2:
          this.pageType = 'sensor';
          type = 'sensor';
          this.menuType = 'data';
          this.dvId = data.childId;
          break;
        case 5:
          this.pageType = 'point';
          type = 'point';
          this.menuType = 'data';
          this.dvId = data.childId;
          break;
      }
      if (data.id) {
        // 缓存数据源详情地址
        const e: any = sessionStorage.getItem('oldTab');
        const b: any = sessionStorage.getItem('tabIndex');
        const c: any = `{"id":"${data.childId}","type":"${type}"}`;
        const d: any = JSON.parse(e);
        d[b].current = c;
        sessionStorage.setItem('oldTab', JSON.stringify(d));
        // const param = {
        //   id: data.childId,
        //   type,
        // };
        // this.$router.push({name: 'deviceDetails', query: param});
      }
    },
    treeSelectHandle() {
      const {assType, searName, treeData} = this;
      // this.tabSelect(assType, searName, treeData[0], null);
      searName ? this.tabSelect(assType, searName, treeData[0], null) : this.getTreeList();
    },
    setTreeNode(id: string, data?: any) {
      // 设置选中的树节点
      if (!id) {
        return;
      }
      data = data || this.treeData;
      data.map((ele: any, i: any) => {
        if (ele.childId === id) {
          if (!ele.selected) {
            this.$nextTick(() => {
              (this as any).$refs.deviceTree.handleSelect(ele.nodeKey);
            });
          }
        } else if (ele.children && ele.children.length > 0) {
          this.setTreeNode(id, ele.children);
        }
      });
    },
    tabSelect(type: string, searName: any, data: any, parent: any): void {
      data.expand = false;
      if (data.children && data.children.length > 0) {
        // let isExpand: boolean = false;
        data.children.map((ele: any) => {
          // if (!isExpand) {
          //   isExpand = this.tabSelect(type, searName, ele);
          // } else {
            this.tabSelect(type, searName, ele, data);
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
                  (this as any).$refs.deviceTree.handleSelect(node.nodeKey); // 手动选择树节点
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
