<template>
  <div class="third_wrap dv_wrap">
    <div class="wrap_top">
      <span @click="setLab('work')" :class="labelType === 'work' ? 'lab_act': ''">工作状态</span>
      <span @click="setLab('type')" :class="labelType === 'type' ? 'lab_act': ''">网关类型</span>
      <!-- <span @click="setLab('alarm')" :class="labelType === 'alarm' ? 'lab_act': ''">报警</span> -->
    </div>
    <div class="wrap_con">
      <ListCom dvType="gateway" :labType="labelType" :column="columnsData" addName="添加网关" @showModel="showModel" :reshTable="reshCount" />
    </div>
    <Modal
        class="third_modal"
        v-model="addFlag"
        :loading="addLoading"
        title="添加网关"
        width="680px"
        @on-ok="toAdd"
        @on-cancel="hideModel">     
        <label class="add_label">
          <span class="label_name">设备名称：</span>
          <Input v-model="dvName" placeholder="设备名称" />
        </label>
        <div class="add_label">
          <span class="label_name">设备类型：</span>
          <Select v-model="gwId" filterable>
            <Option v-for="(ele, i) in gwList" :value="ele.id" :key="i">{{ele.name}}</Option>
          </Select>
        </div>
        <div class="add_label">
          <span class="label_name">位置：</span>
          <Select class="sel_loca" filterable @on-change="changeTree(index)" v-for="(treeLi, index) in treeValue" v-model="treeValue[index]" :key="index">
            <Option value="">请选择</Option>
            <Option v-show="checkOption(index, optLi)" v-for="(optLi, i) in selectTree[index]" :key="i" :value="optLi.id">{{optLi.title}}</Option>
          </Select>
        </div>
        <div class="add_label">
          <span class="label_name">IP地址：</span>
          <Input v-model="ipAddress" placeholder="IP地址" />
        </div>
        <div class="add_label">
          <span class="label_name">是否列入资产：</span>
          <Select v-model="hasAsset">
            <Option value="1">是</Option>
            <Option value="2">否</Option>
          </Select>
        </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import './devicesManage.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
import ListCom from '@/views/dataSourManage/ListCom.vue';
export default Vue.extend ({
  name: 'gwManage',
  created() {
    this.getTreeData();
    this.getGwData();
  },
  props: ['reshTable'],
  watch: {
    reshTable() {
      this.reshCount ++;
    },
  },
  components: {
    ListCom,
  },
  data() {
    return {
      addFlag: false,
      pageTotal: 0,
      pageIndex: 0,
      pageSize: 10,
      addLoading: true,
      dvName: '',
      gwId: '',
      gwList: [] as any,
      hasAsset: '1',
      labelType: 'type',
      ipAddress: '',
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
                title: 'IP端口',
                key: 'ip',
                align: 'center',
                render: (h: any, params: any): any => {
                  return h('span', {attrs: {title: params.row.ip}}, params.row.ip);
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
                title: '设备状态',
                key: 'status',
                align: 'center',
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
                title: '设备类型',
                key: 'gatewayType',
                align: 'center',
                render: (h: any, params: any): any => {
                  if (!params.row.gatewayType) {
                    return h('span', {attrs: {title: params.row.gatewayType}}, params.row.gatewayType);
                  } else {
                    return h('span', {attrs: {title: params.row.gatewayType.name}}, params.row.gatewayType.name);
                  }
                },
            },
            {
                title: '设备更新时间',
                key: 'updateTime',
                align: 'center',
                render: (h: any, params: any): any => {
                  return h('span', {attrs: {title: params.row.updateTime}}, params.row.updateTime);
                },
            },
            {
                title: '设备数',
                key: 'countOfSensor',
                align: 'center',
                render: (h: any, params: any): any => {
                  return h('span', {attrs: {title: params.row.countOfSensor}}, params.row.countOfSensor);
                },
            },
        ],
      tableData: [],
      treeValue: ['', '', '', ''],
      selectTree: [],
      reshCount: 0,
    };
  },
  methods: {
    toAdd() {
        this.addSig();
    },
    addSig() {
      const {dvName, treeValue, gwId, hasAsset, ipAddress} = this;
      const reg = /^[a-zA-Z0-9_]{1,50}$/;
      if (!reg.test(dvName.trim())) {
        this.$Message.error('设备名称只能是50位以内的数字、字母或者下划线。');
        this.loadHandle();
        return;
      }
      let location = '';
      treeValue.map((ele: any, i: number) => {
        if (ele) {
          location = ele;
        }
      });
      if (!location) {
        this.$Message.error('位置不能为空');
        this.loadHandle();
        return;
      }
      const params = {
        name: dvName.trim(),
        gatewayType: gwId,
        isAsset: hasAsset,
        ip: ipAddress,
        location,
      };
      dataSourApi.AddGateway(params).then((res: any = {}) => {
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
      this.getGwData();
    },
    hideModel() {
      this.addFlag = false;
      this.dvName = '';
      this.gwId = '';
      this.hasAsset = '1';
      this.ipAddress = '';
      this.treeValue.map((ele: any, i: any) => {
        const list = this.selectTree[i] || {id: ''};
        ele = list.id;
      });
    },
    getGwData() {
      const params = {
          params: `page=&size=&type=gatewayType&name=`,
      };
      dictionaryApi.selectType(params).then((res: any = {}) => {
        const data = res.data || {};
        const list = data.content || [];
        this.gwList = list;
        // 协议赋初值
        this.gwId = list.length > 0 ? list[0].id : '';
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
        if (index < 0 ) {
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
    setLab(val: string) {
      if (val === this.labelType) {
        return;
      }
      this.labelType = val;
    },
  },
});
</script>
