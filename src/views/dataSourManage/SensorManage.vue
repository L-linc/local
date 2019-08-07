<template>
  <div class="third_wrap dv_wrap">
    <div class="wrap_top">
      <span @click="setLab('work')" :class="labelType === 'work' ? 'lab_act': ''">工作状态</span>
      <span @click="setLab('type')" :class="labelType === 'type' ? 'lab_act': ''">sensor类型</span>
      <!-- <span @click="setLab('alarm')" :class="labelType === 'alarm' ? 'lab_act': ''">报警</span> -->
    </div>
    <div class="wrap_con">
      <ListCom dvType="sensor" :labType="labelType" :column="columnsData" addName="sensor录入" @showModel="showModel" :reshTable="reshCount" />
    </div>
    <Modal
        class="third_modal"
        v-model="addFlag"
        :loading="addLoading"
        title="SENSOR录入"
        width="680px"
        @on-ok="toAdd"
        @on-cancel="hideModel">
        <div class="model_top">
          <span @click="addTypeHandel(1)" :class="addType ? 'add_modal_act' : ''">单个录入</span>
          <span @click="addTypeHandel(0)" :class="addType ? '' : 'add_modal_act'">批量录入</span>
        </div>       
        <div v-show="addType"> 
          <div class="add_label">
            <span class="label_name">设备名称：</span>
            <Input v-model="dvName" placeholder="设备名称" />
          </div>
          <div v-show="showLocation" class="add_label">
            <span class="label_name">所属位置：</span>
            <Select class="sel_loca" filterable @on-change="changeTree(index)" v-for="(treeLi, index) in treeValue" v-model="treeValue[index]" :key="index">
              <Option value="">请选择</Option>
              <Option v-show="checkOption(index, optLi)" v-for="(optLi, i) in selectTree[index]" :key="i" :value="optLi.id">{{optLi.title}}</Option>
            </Select>
          </div>
          <div class="add_label">
            <span class="label_name">选择网关：</span>
            <Select v-model="gwId" filterable>
              <Option value="all">请选择网关</Option>
              <Option v-for="(ele, i) in gwList" :value="ele.id" :key="i">{{ele.name}}</Option>
            </Select>
          </div>
          <div class="add_label">
            <span class="label_name">是否列入资产：</span>
            <Select v-model="hasAsset">
              <Option value="1">是</Option>
              <Option value="2">否</Option>
            </Select>
          </div>
        </div>
        <div v-show="!addType">
          <div class="add_label">
            <span class="label_name">请选择文件：</span>
            <Upload action="/api/sensor/import" :format="['xlsx', 'xls']" :on-format-error="handleFormatError" :on-success="uploadSucc" :on-error="uploadError" :headers="{Authorization: token}">
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
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
import * as util from '../../config/utils';
import TableToast from '@/views/dataSourManage/TableToast.vue';
import ListCom from '@/views/dataSourManage/ListCom.vue';
export default Vue.extend ({
  name: 'SensorManage',
  created() {
    this.getTreeData();
    this.getGwData();
    this.token = `Bearer ` + util.getCookie('token');
  },
  deactivated() {
    if (this.addType) {
      this.addType = false;
    }
  },
  props: ['reshTable'],
  components: {
    TableToast,
    ListCom,
  },
  watch: {
    reshTable() {
      this.reshCount ++;
    },
  },
  computed: {
    showLocation(): boolean {
      return (this.gwId && this.gwId !== 'all') ? false : true;
    },
  },
  data() {
    return {
      addFlag: false,
      pageTotal: 0,
      addType: true,
      pageIndex: 0,
      pageSize: 10,
      dvName: '',
      gwId: 'all',
      labelType: 'type',
      token: '',
      addLoading: true,
      gwList: [] as any,
      hasAsset: '1',
      columnsData: [
        {
            title: '设备名称',
            key: 'name',
            align: 'center',
            render: (h: any, params: any): any => {
              return h('span', {attrs: {title: params.row.name}}, params.row.name);
            },
        },
        {
            title: '设备编号',
            key: 'serialNumber',
            align: 'center',
            render: (h: any, params: any): any => {
              return h('span', {attrs: {title: params.row.serialNumber}}, params.row.serialNumber);
            },
        },
        {
            title: '所属网关',
            key: 'sensorType',
            align: 'center',
            render: (h: any, params: any): any => {
              const name = params.row.gateway ? params.row.gateway.name : '--';
              return h('span', {attrs: {title: name}}, name);
            },
        },
        {
            title: '位置',
            key: 'location',
            align: 'center',
            render: (h: any, params: any) => {
              return h('div', {attrs: {title: params.row.locations.locationName}},  params.row.locations.locationName);
            },
        },
        {
            title: '设备状态',
            align: 'center',
            key: 'status',
            render: (h: any, params: any): any => {
              let statusText = '在线';
              switch (params.row.status) {
                case '1':
                  statusText = '预警';
                  break;
                case '2':
                  statusText = '报警';
                  break;
                case '3':
                  statusText = '异常';
                  break;
                case '4':
                  statusText = '未工作';
                  break;
              }
              if ((this as any).labelType === 'work' && params.row.status !== '3' && params.row.status !== '4') {
                statusText = '在线';
              }
              return h('span', {attrs: {title: statusText}}, statusText);
            },
        },
        {
            title: '类型',
            key: 'gateway',
            align: 'center',
            render: (h: any, params: any): any => {
              const name = params.row.sensorType ? params.row.sensorType.name : '--';
              return h('span', {attrs: {title: name}}, name);
            },
        },
      ],
      tableData: [],
      treeValue: ['1', '', '', '', ''],
      selectTree: [],
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
      const {dvName, treeValue, gwId, hasAsset} = this;
      // const reg = /^[a-zA-Z0-9_]{1,50}$/;
      if (dvName.trim().length > 50) {
        this.$Message.error('设备名称最多只能输入50位');
        this.loadHandle();
        return;
      }
      let location: any = null;
      treeValue.map((ele: any, i: number) => {
        if (ele) {
          location = ele;
        }
      });
      const gateway =  gwId === 'all' || !gwId  ? null : gwId;
      location = gateway ? null : location;
      const params = {
        name: dvName.trim(),
        gateway,
        isAsset: hasAsset,
        location,
      };
      dataSourApi.AddSensor(params).then((res: any = {}) => {
        this.$Message.success('添加成功');
        this.hideModel();
        this.reshCount ++;
      }, () => {
        this.loadHandle();
      });
    },
    loadHandle() {
      this.addLoading = false;
      this.$nextTick(() => {
        this.addLoading = true;
      });
    },
    showModel() {
      this.addFlag = true;
      this.addType = true;
      this.getGwData();
    },
    hideModel() {
      this.addFlag = false;
      // const gwEle = this.gwList[0] || {id: ''};
      this.dvName = '';
      // this.gwId = gwEle.id;
      this.gwId = 'all';
      this.hasAsset = '1';
      this.treeValue.map((ele: any, i: any) => {
        const list = this.selectTree[i] || {id: ''};
        ele = list.id;
      });
    },
    addTypeHandel(val: number) {
      if (this.addType === (!!val)) {
        return false;
      }
      this.addType = !this.addType;
      this.addLoading = !this.addLoading;
    },
    getGwData() {
      dataSourApi.getAllGateway().then((res: any = {}) => {
        const list = res.data || [];
        this.gwList = list;
        // 协议赋初值
        // this.gwId = list.length > 0 ? list[0].id : '';
      });
    },
    changeTree(index: number) {
        // select改变设备树更新，触发改变的当前select之后的select都会根据当前的变化value默认选择关联父级的子级第一项；
        // event = event || window.event;
        const valLen = (this as any).treeValue.length;
        const currVal = (this as any).treeValue[index];
        const listData = (this as any).selectTree[index + 1];
        let nexVal = '';
        if (index + 1 >= valLen) {
            // 最后一层终止
            return;
        }
        // (this as any).selectTree[index + 1].map((ele: any, i: number) => {
        //     // nexVal = ele.parent === currVal ? ele.id : '';
        //     if (!nexVal && ele.parent === currVal) {
        //         nexVal = ele.id;
        //     }
        // });
        if (currVal) {
            // 上一层值为空，后面的select值都为空减少循环；
            for (const ele of listData) {
                // 改成for循环查询到了可以及时终止；
                // console.log(currVal, ele.parent);
                if (!nexVal && ele.parent === currVal) {
                    nexVal = ele.id;
                    break;
                }
            }
        }
        (this as any).treeValue[index + 1] = nexVal;
        if (index + 1 < valLen - 1) {
            // 改变非第一层的设备树值，递归循环改变后面的数值；
            (this as any).changeTree(index + 1);
        }
    },
    checkOption(index: number, data: any) {
        if (index === 0 || data.parent === (this as any).treeValue[index - 1]) {
            // index为0是第一层设备树不需要过滤，其他层的父级ID === 上一层v-model双向绑定的值才显示；
            return true;
        }
        return false;
    },
    getParent(index: number, id: string) {
        // 递归从最后一层往回找父节点
        if (index < 0  || !id) {
            // 第一层开始终止
            return;
        }
        const newArry: string[] = [];
        for (index; index >= 0; index --) {
            let getNode: boolean = false;
            (this as any).selectTree[index].map((ele: any, i: number) => {
                if (id === ele.id) {
                    newArry.unshift(id);
                    id = ele.parent;
                    getNode = true;
                }
            });
            if (!getNode) {
                // 设备树节点不完整，后面的value都是空；
                newArry.unshift('');
            }
        }
        (this as any).treeValue = newArry;
    },
    getTreeData() {
        const params = {urlStr: ''};
        dictionaryApi.selectTree(params).then((res: any) => {
            const data = res.data || [];
            (this as any).dataTransTree(data);
        });
    },
    dataTransTree(treeList: any[]) {
        if (treeList.length <= 0) {
            return ;
        }
        const selectData: any[] = [];
        for (const ele of treeList) {
            if (ele.level) {
                selectData[ele.level] = selectData[ele.level] || [];
                selectData[ele.level].push(ele);
            }
        }
        const treeSelData: any[] = [];
        // 去除数组empty元素；
        selectData.map((ele: any, i: any) => {
            if (ele) {
                treeSelData.push(ele);
            }
        });
        let  transList: any[] = [];
        const leveLen = treeSelData.length;
        transList = [...treeSelData[leveLen - 1]];
        const valueList: any = [''];
        for (let i = leveLen - 2; i >= 0; i--) {
          let treeData: any[] = [];
          treeData = [...treeSelData[i]];
          treeData.map((selLi: any, j: number) => {
              selLi.children = [];
              transList.map((traLi: any, k: number) => {
                  if (traLi.parent === selLi.id) {
                      selLi.children.push(traLi);
                  }
              });
          });
          transList = treeData;
          valueList.push('');
        }
        this.treeValue = valueList;
        (this as any).selectTree = treeSelData;
        // (this as any).treeData = transList;
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
          title: 'sensor名称',
          key: 'category',
        },
        {
          title: '网关',
          key: 'pointType',
        },
        {
          title: '是否列入资产',
          key: 'pointName',
        },
        {
          title: '位置层级1',
          key: 'address1',
        },
        {
          title: '位置层级2',
          key: 'address2',
        },
        {
          title: '位置层级3',
          key: 'address3',
        },
        {
          title: '位置层级4',
          key: 'address4',
        },
        {
          title: '位置层级5',
          key: 'address5',
        },
        {
          title: '位置层级6',
          key: 'address6',
        },
      ];
      defaultData = [
        {
          number: 1,
          category: 'sensor1',
          pointType: 'xxx',
          pointName: '是',
          address1: 'xxx',
          address2: 'xxx',
          address3: 'xxx',
          address4: 'xxx',
          address5: 'xxx',
          address6: 'xxx',
        },
        {
          number: 2,
          category: 'sensor1',
          pointType: 'xxx',
          pointName: '是',
          address1: 'xxx',
          address2: 'xxx',
          address3: 'xxx',
          address4: 'xxx',
          address5: 'xxx',
          address6: 'xxx',
        },
        {
          number: 3,
          category: 'sensor1',
          pointType: 'xxx',
          pointName: '是',
          address1: 'xxx',
          address2: 'xxx',
          address3: 'xxx',
          address4: 'xxx',
          address5: 'xxx',
          address6: 'xxx',
        },
      ];
      this.toastCol = defaultCol;
      this.toastData = defaultData;
      this.toastUrl = '';
      this.toastFile = 'sensor批量导入模板';
      this.showTable = true;
    },
    setLab(val: string) {
      if (val === this.labelType) {
        return;
      }
      this.labelType = val;
    },
  },
});
</script>
