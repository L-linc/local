<template>
  <div class="third_wrap data_wrap">
    <div class="wrap_top">
      <div>
        <span @click="barType = !barType" class="icn_trans"></span>
        <span v-show="!barType" @click="transMenu('sensor')" :class="'dv_menu ' + (menuType == 'sensor' ? 'ac_menu' : '')">sensor</span>
        <span v-show="!barType" @click="transMenu('gateway')"  :class="'dv_menu ' + (menuType == 'gateway' ? 'ac_menu' : '')">gateway</span>
        <span v-show="barType" class="point_tit">采集点管理</span>
      </div>
      <div class="add_bar">
        <Button v-show="!(!barType && menuType == 'gateway')" type="primary" @click="showModel" v-has="'SYS_THIRD_POINT_ADD' || 'SYS_COLLECTOR_POINT_ADD'"> + 数据接入</Button>
      </div>
    </div>
    <div class="wrap_con">
      <SensorManage v-if="!barType && menuType == 'sensor'" :reshTable="reshCount"> </SensorManage>
      <GwManage v-if="!barType && menuType == 'gateway'" :reshTable="reshCount"></GwManage>
      <pointManage v-if="barType" :reshTable="reshCount"></pointManage>
    </div>
    <Modal
        class="third_modal"
        v-model="addFlag"
        title="数据接入"
        width="540px"
        @on-ok="toAdd"
        :loading="addLoading"
        @on-cancel="hideModel">
        <div class="model_top">
          <span @click="addTypeHandel(1)" :class="addType ? 'add_modal_act' : ''">单个接入</span>
          <span @click="addTypeHandel(0)" :class="addType ? '' : 'add_modal_act'">批量接入</span>
        </div>       
        <div v-show="addType"> 
          <div class="add_label">
            <span class="label_name">采集点类型：</span>
            <Select v-model="pointType" filterable>
              <Option v-for="(ele, i) in typeList" :value="ele.id" :key="i">{{ele.name}}</Option>
            </Select>
          </div>
          <div class="add_label">
            <span class="label_name">采集点名称：</span>
            <Input v-model="pointName" placeholder="采集点名称" />
          </div>
          <div class="add_label">
            <span class="label_name">上报方式：</span>
            <Select v-model="reportType" @on-change="getInSensorData">
              <Option v-for="(ele, i) in reportList" :value="i" :key="i">{{ele}}</Option>
            </Select>
          </div>
          <div class="add_label">
            <span class="label_name">上报协议：</span>
            <Select v-model="agreement">
              <Option v-for="(ele, i) in aggreList" :value="ele" :key="i">{{ele}}</Option>
            </Select>
          </div>
          <div class="add_label">
            <span class="label_name">所属sensor：</span>
            <Select v-model="inSensor" filterable>
              <Option v-for="(ele, i) in sensorList" :value="ele.id" :key="i">{{ele.name}}</Option>
            </Select>
          </div>
        </div>
        <div v-show="!addType">
          <div class="add_label">
            <span class="label_name">请选择文件：</span>
            <Upload action="/api/point/import/collector" :format="['xlsx', 'xls']" :on-format-error="handleFormatError" :on-success="uploadSucc" :on-error="uploadError" :headers="{Authorization: token}">
              <Button>选择文件</Button>
            </Upload>
            <span @click="showExam" class="btn_exam">示例<Icon size="20" type="ios-alert-outline" /></span>
          </div>
        </div>
    </Modal>
    <TableToast :propColumns="toastCol" :propData="toastData" :propUrl="toastUrl" :fileName="toastFile" :isShow="showTable" v-on:hideToast="hideToast" />
  </div>
</template>

<script lang="ts">
import './devicesManage.less';
import Vue from 'vue';
import SensorManage from '@/views/dataSourManage/SensorManage.vue';
import GwManage from '@/views/dataSourManage/GwManage.vue';
import pointManage from '@/views/dataSourManage/pointManage.vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
import * as util from '../../config/utils';
import TableToast from '@/views/dataSourManage/TableToast.vue';
export default Vue.extend ({
  name: 'CollManage',
  created() {
    this.getProtosData();
    this.getTypeData();
    this.getReportData();
    this.token = `Bearer ` + util.getCookie('token');
  },
  components: {
    SensorManage,
    GwManage,
    TableToast,
    pointManage,
  },
  activated() {
    this.reshCount++;
  },
  data() {
    return {
      addFlag: false,
      addType: true,
      menuType: 'sensor',
      addLoading: true,
      pointType: '',
      typeList: [] as any,
      barType: false,
      pointName: '',
      agreement: '',
      aggreList: [] as any,
      reportType: 'direct',
      reportList: {} as any,
      inSensor: '',
      sensorList: [] as any,
      token: '',
      showTable: false,
      toastCol: [],
      toastData: [],
      toastUrl: '',
      toastFile: '',
      reshCount: 0,
    };
  },
  methods: {
    toAdd() {
      if (this.addType) {
        this.addSig();
      }
    },
    addSig() {
      const {pointType, pointName, agreement, reportType, inSensor, typeList} = this;
      let typeName = '';
      typeList.map((ele: any, i: number) => {
        if (pointType === ele.id) {
          typeName = ele.name;
        }
      });
      const params = {
        pointType: {id: pointType, name: typeName},
        name: pointName.trim(),
        sensor: {id: inSensor},
        uploadProto: agreement,
        uploadType: reportType,
      };
      if (!pointType) {
        this.$Message.error('采集点类型必须选择一项内容');
        this.loadHandle();
        return;
      }
      const reg = /^[a-zA-Z0-9_]{1,50}$/;
      if (!reg.test(pointName.trim())) {
        this.$Message.error('采集点名称只能是50位以内的数字、字母或者下划线。');
        this.loadHandle();
        return;
      }
      dataSourApi.addPoint(params).then((res: any = {}) => {
        let content = `<p>采集点ID：${res.data.id}</p><p>Token：${res.data.token}</p>`;
        if (this.agreement.toLowerCase() === 'mqtt') {
          content += `<p>MQTT服务器地址：${res.data.host}</p><p>Topic：${res.data.topic}</p>`;
        }
        this.$Modal.success({
            title: '添加成功',
            content,
        });
        this.reshCount ++;
        this.hideModel();
      }, () => {
        this.loadHandle();
      });
    },
    addFile() {
      return;
    },
    transMenu(val: string) {
      if (this.menuType !== val) {
        this.menuType = val;
      }
    },
    showModel() {
      this.addFlag = true;
      this.addType = true;
      this.getTypeData();
      this.getInSensorData('');
    },
    hideModel() {
      this.addFlag = false;
      const typeList: any = this.typeList;
      this.pointName = '';
      this.pointType = typeList[0] ? typeList[0].id : '';
      this.agreement = this.aggreList[0];
      this.reportType = 'direct';
      this.inSensor = '';
    },
    addTypeHandel(val: number) {
      if (this.addType === (!!val)) {
        return false;
      }
      this.addType = !this.addType;
      this.addLoading = !this.addLoading;
    },
    loadHandle() {
      this.addLoading = false;
      this.$nextTick(() => {
        this.addLoading = true;
      });
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
      const uploadType = type ? type : this.reportType;
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
    hideToast() {
      this.showTable = false;
    },
    uploadSucc(res: any, file: any) {
      const result = res.result || [];
      const list = result[0] || [];
      const tableHead = list[0];
      const dataList: any = [];
      const headList = tableHead.map((ele: any, i: number) => {
        const newEle = {
          title: ele,
          key: 'var' + i,
          align: 'center',
          render: (h: any, params: any): any => {
            return h('span', {attrs: {title: params.row['var' + i]}}, params.row['var' + i]);
          },
        };
        return newEle;
      });
      for (let i = 1, len = list.length; i < len; i++) {
        const newEle: any = {};
        list[i] = list[i] || [];
        list[i].map((ele: any, j: number) => {
          newEle[('var' + j)] = ele;
        });
        dataList.push(newEle);
      }
      this.hideModel();
      this.showTable = true;
      this.toastCol = headList;
      this.toastData = dataList;
      this.toastUrl = res.downUrl;
      this.toastFile = res.fileName;
      this.reshCount ++;
    },
    uploadError(res: any) {
      this.$Message.error('上传失败，请重新上传');
    },
    handleFormatError() {
      this.$Message.error('只支持后缀为.xlsx,.xls的格式文件');
    },
    showExam() {
      let defaultCol: any = [];
      let defaultData: any = [];
      defaultCol = [
        {
          title: 'No',
          key: 'number',
        },
        {
          title: '数据源类型',
          key: 'category',
        },
        {
          title: '采集点类型',
          key: 'pointType',
        },
        {
          title: '采集点名称',
          key: 'pointName',
        },
        {
          title: '上报方式',
          key: 'address',
        },
        {
          title: '上报协议',
          key: 'uploadAgree',
        },
        {
          title: '所属sensor',
          key: 'port',
        },
      ];
      defaultData = [
        {
          number: 1,
          category: '采集器数据源',
          pointType: '类型1',
          pointName: '采集点1',
          uploadAgree: 'MQTT',
          address: '网关',
          port: 'sensor1',
        },
        {
          number: 2,
          category: '采集器数据源',
          pointType: '类型2',
          pointName: '采集点2',
          uploadAgree: 'MQTT',
          address: '网关',
          port: 'sensor1',
        },
        {
          number: 3,
          category: '采集器数据源',
          pointType: '类型1',
          pointName: '采集点3',
          uploadAgree: 'MQTT',
          address: '直接上报',
          port: 'sensor1',
        },
      ];
      this.toastCol = defaultCol;
      this.toastData = defaultData;
      this.toastUrl = '';
      this.toastFile = '采集器采集点批量导入模板';
      this.showTable = true;
    },
  },
});
</script>
