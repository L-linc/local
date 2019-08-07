<template>
  <div :class="'toast_wrap ' + (isShow ? '' : 'hide')">
    <div class="toast_con">
      <div class="con_top">
        <Icon @click="hideToast" size="16" type="md-close" />
      </div>
      <p class="con_tit">{{showType ? '接入返回' : '示例'}}</p>
      <div class="con_table">
        <!-- <div :class="showType ? 'exm_table' : ''"> -->
        <!-- 导入之后返回显示列表给最小宽度 -->
        <div class="exm_table">
          <Table :columns="columnsData" :data="tablesData"></Table>
        </div>
      </div>
      <div class="foot_btn">
        <a :href="downUlr" target="_blank">{{showType ? '保存' : '下载'}}</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import './devicesManage.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
import * as util from '../../config/utils';
export default Vue.extend ({
  name: 'tableToast',
  props: ['propColumns', 'propData', 'propUrl', 'fileName', 'isShow'],
  created() {
    const str = this.showType ? 'callback' : 'default';
    this.token = `Bearer ` + util.getCookie('token');
    this.showTable(str);
  },
  watch: {
    propData() {
      this.showTable('callback');
    },
  },
  computed: {
    showType(): boolean {
      return !!this.propUrl;
    },
    downUlr(): string {
      const {propUrl, fileName, token} = this;
      const str = `/api/point/download?downUrl=${propUrl}&fileName=${encodeURIComponent(fileName)}&token=${token}`;
      return str;
    },
  },
  data() {
    return {
      columnsData: [],
      tablesData: [],
      defaultColumn: [
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
          title: '上报协议',
          key: 'uploadAgree',
        },
        {
          title: 'TibcoRVF服务器地址',
          key: 'address',
        },
        {
          title: '端口',
          key: 'port',
        },
      ],
      tableData: [
        {
          number: 1,
          category: '第三方数据源',
          pointType: '类型1',
          pointName: '采集点1',
          uploadAgree: 'MQTT',
          address: 'XXX',
          port: 'XXXX',
        },
        {
          number: 2,
          category: '第三方数据源',
          pointType: '类型2',
          pointName: '采集点2',
          uploadAgree: 'MQTT',
          address: '/',
          port: '/',
        },
        {
          number: 3,
          category: '第三方数据源',
          pointType: '类型1',
          pointName: '采集点3',
          uploadAgree: 'MQTT',
          address: '/',
          port: '/',
        },
      ],
      token: '',
    };
  },
  methods: {
    showTable(type: string = 'default') {
      if (type === 'default') {
        const {defaultColumn, tableData} = this;
        (this as any).columnsData = defaultColumn;
        (this as any).tablesData = tableData;
      } else {
        (this as any).columnsData = this.propColumns;
        (this as any).tablesData = this.propData;
      }
    },
    hideToast() {
      this.$emit('hideToast');
    },
    dwloadHandle() {
      // const {downUlr, fileName, token} = this;
      // const param = {
      //   str: `downUrl=${downUlr}&fileName=${fileName}&token=${token}`,
      // };
      // dataSourApi.DownLoad(param).then((res: any = {}) => {
      //   console.log(res);
      //   const blob = new Blob([res.data], {type: 'application/vnd.ms-excel;charset=utf-8'});
      //   const fileName = this.fileName + '.xls'; // 下载后文件名
      //   if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      //     window.navigator.msSaveOrOpenBlob(blob, fileName);
      //   } else {
      //     const downloadElement = document.createElement('a');
      //     const href = window.URL.createObjectURL(blob); // 创建下载的链接
      //     downloadElement.href = href;
      //     downloadElement.download = fileName;
      //     document.body.appendChild(downloadElement);
      //     downloadElement.click(); // 点击下载
      //     document.body.removeChild(downloadElement); // 下载完成移除元素
      //     window.URL.revokeObjectURL(href); // 释放掉blob对象
      //   }
      // });
    },
  },
});
</script>
