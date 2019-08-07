<template>
  <div class="third_wrap data_wrap">
    <div class="wrap_top">
      <div class="lab_bar">
        <span @click="setLab('work')" :class="labelType === 'work' ? 'lab_act': ''">工作状态</span>
        <span @click="setLab('type')" :class="labelType === 'type' ? 'lab_act': ''">采集点类型</span>
        <span @click="setLab('alarm')" :class="labelType === 'alarm' ? 'lab_act': ''">报警</span>
      </div>
      <div class="top_right">
        <Button type="primary" @click="showModel" v-has="'SYS_THIRD_POINT_ADD' || 'SYS_COLLECTOR_POINT_ADD'"> + 数据接入</Button>
      </div>
    </div>
    <ListCom dvType="thirdParty" :labType="labelType" :column="columnsData" :reshTable="reshCount" />
    <Modal
        class="third_modal"
        v-model="addFlag"
        title="数据接入"
        width="680px"
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
            <span class="label_name">上报协议：</span>
            <Select v-model="agreement">
              <Option v-for="(ele, i) in aggreList" :value="ele" :key="i">{{ele}}</Option>
            </Select>
          </div>
          <div class="add_label">
            <span class="label_name">位置：</span>
            <Select class="sel_loca" filterable @on-change="changeTree(index)" v-for="(treeLi, index) in treeValue" v-model="treeValue[index]" :key="index">
              <Option value="">请选择</Option>
              <Option v-show="checkOption(index, optLi)" v-for="(optLi, i) in selectTree[index]" :key="i" :value="optLi.id">{{optLi.title}}</Option>
            </Select>
          </div>
          <!-- <label v-show="agreeFlag" class="add_label">
            <span class="label_name">TibcoRV服务器地址：</span>
            <Input v-model="address" placeholder="TibcoRV服务器地址" />
          </label>
          <label v-show="agreeFlag" class="add_label">
            <span class="label_name">对应接口：</span>
            <Input  v-model="interfe" placeholder="对应接口" />
          </label>
          <label v-show="agreeFlag" class="add_label">
            <span class="label_name">子网掩码：</span>
            <Input v-model="subMask" placeholder="子网掩码" />
          </label>
          <label v-show="agreeFlag" class="add_label">
            <span class="label_name">主题：</span>
            <Input v-model="theme" placeholder="主题" />
          </label>
          <label v-show="agreeFlag" class="add_label">
            <span class="label_name">字符串：</span>
            <Input v-model="addStr" placeholder="字符串" />
          </label> -->
        </div>
        <div v-show="!addType">
          <div class="add_label">
            <span class="label_name">请选择文件：</span>
            <Upload action="/api/point/import/thirdParty" :format="['xlsx', 'xls']" :on-format-error="handleFormatError" :on-success="uploadSucc" :on-error="uploadError" :headers="{Authorization: token}">
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
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
import TableToast from '@/views/dataSourManage/TableToast.vue';
import ListCom from '@/views/dataSourManage/ListCom.vue';
import * as util from '../../config/utils';
import Vue from 'vue';
export default Vue.extend ({
  name: 'thirdDataSour',
  created() {
    this.getProtosData();
    this.getTypeData();
    this.getTreeData();
    this.token = `Bearer ` + util.getCookie('token');
  },
  deactivated() {
    if (this.addType) {
      this.addType = false;
    }
  },
  computed: {
    agreeFlag(): boolean {
      return this.agreement.toLowerCase() === 'tibcorv';
    },
  },
  activated() {
    this.reshCount++;
  },
  components: {
    TableToast,
    ListCom,
  },
  data() {
    return {
      addFlag: false,
      pageTotal: 0,
      addType: true,
      pageIndex: 0,
      pageSize: 10,
      token: '',
      pointType: '',
      typeList: [] as any,
      pointName: '',
      agreement: '',
      addLoading: true,
      aggreList: [],
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
                return h('span', {attrs: {title: params.row.name}}, params.row.name);
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
              render: (h: any, params: any): any => {
                return h('span', {attrs: {title: params.row.uploadProto}}, params.row.uploadProto);
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
      tableData: [],
      address: '',
      interfe: '',
      subMask: '',
      theme: '',
      addStr: '',
      treeValue: ['', '', '', ''],
      selectTree: [],
      showTable: false,
      toastCol: [],
      toastData: [],
      toastUrl: '',
      toastFile: '',
      labelType: 'type',
      reshCount: 0,
    };
  },
  methods: {
    toAdd() {
      if (this.addType) {
        this.addSig();
      } else {
        this.addFile();
      }
    },
    addSig() {
      const {pointType, pointName, agreement, treeValue, address, interfe, subMask, theme, addStr, typeList} = this;
      let typeName = '';
      typeList.map((ele: any, i: number) => {
        if (pointType === ele.id) {
          typeName = ele.name;
        }
      });
      let location = '';
      treeValue.map((ele: any, i: number) => {
        if (ele) {
          location = ele;
        }
      });
      const params = {
        pointType: {id: pointType, name: typeName},
        name: pointName.trim(),
        uploadProto: agreement,
        location,
        // topic: theme,
        // host: address,
        // tbRvInterface: interfe,
        // subnetMask: subMask,
        // connectString: addStr,
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
      if (!location) {
        this.$Message.error('位置不能为空');
        this.loadHandle();
        return;
      }
      // if (this.agreeFlag) {
      //   let messInfo = '';
      //   switch (true) {
      //     case !address.trim():
      //       messInfo = '服务器地址不能为空。';
      //       break;
      //     case !interfe.trim():
      //       messInfo = '对应接口不能为空。';
      //       break;
      //     case !subMask.trim():
      //       messInfo = '子网掩码不能为空。';
      //       break;
      //     case !theme.trim():
      //       messInfo = '主题不能为空。';
      //       break;
      //     case !addStr.trim():
      //       messInfo = '字符串不能为空。';
      //       break;
      //   }
      //   if (messInfo) {
      //     this.$Message.error(messInfo);
      //     this.loadHandle();
      //     return;
      //   }
      //   // if (!address.trim()) {
      //   //   this.$Message.error('服务器地址不能为空。');
      //   //   this.loadHandle();
      //   //   return;
      //   // } else if (!interfe.trim()) {
      //   //   this.$Message.error('对应接口不能为空。');
      //   //   this.loadHandle();
      //   //   return;
      //   // } else if (!subMask.trim()) {
      //   //   this.$Message.error('子网掩码不能为空。');
      //   //   this.loadHandle();
      //   //   return;
      //   // } else if (!theme.trim()) {
      //   //   this.$Message.error('主题不能为空。');
      //   //   this.loadHandle();
      //   //   return;
      //   // } else if (!addStr.trim()) {
      //   //   this.$Message.error('字符串不能为空。');
      //   //   this.loadHandle();
      //   //   return;
      //   // }
      // }
      dataSourApi.addPoint(params).then((res: any = {}) => {
        let content = `<p>Daemon ：${res.data.host}</p><p>Network：${res.data.netWork}</p><p>Service：${res.data.service}</p><p>Subject：${res.data.topic}</p>`;
        if (this.agreement.toLowerCase() === 'mqtt') {
          content = `<p>MQTT服务器地址：${res.data.host}</p><p>Topic：${res.data.topic}</p><p>采集点ID：${res.data.id}</p><p>Token：${res.data.token}</p>`;
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
    loadHandle() {
      this.addLoading = false;
      this.$nextTick(() => {
        this.addLoading = true;
      });
    },
    addFile() {
      return;
    },
    showModel() {
      this.getTreeData();
      this.getTypeData();
      this.addFlag = true;
      this.addType = true;
    },
    hideModel() {
      this.addFlag = false;
      this.pointName = '';
      this.pointType = (this as any).typeList[0].id || '';
      this.agreement = this.aggreList[0];
      this.treeValue = this.selectTree.map((ele: any, i: any) => {
        return '';
      });
      this.address = '';
      this.interfe = '';
      this.subMask = '';
      this.theme = '';
      this.addStr = '';
    },
    addTypeHandel(val: number) {
      if (this.addType === (!!val)) {
        return false;
      }
      this.addType = !this.addType;
      this.addLoading = !this.addLoading;
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
          params: `page=&size=&category=thirdParty&keyword=&pointNumber=`,
      };
      dictionaryApi.collTypeList(params).then((res: any = {}) => {
        const data = res.data || {};
        const list = data.content || [];
        this.typeList = list;
        // 采集点类型赋初值
        this.pointType = list.length > 0 ? list[0].id : '';
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
                // ele.title = ele.name;
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
    getTable() {
      console.log(0);
    },
    changePageSize() {
      console.log(0);
    },
    handleUpload() {
      return false;
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
    handleFormatError() {
      this.$Message.error('只支持后缀为.xlsx,.xls的格式文件');
    },
    uploadError() {
      this.$Message.error('上传失败，请重新上传');
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
          title: '上报协议',
          key: 'uploadAgree',
        },
        // {
        //   title: 'TibcoRV服务器地址',
        //   key: 'address',
        // },
        // {
        //   title: '端口',
        //   key: 'port',
        // },
        // {
        //   title: '子网掩码',
        //   key: 'subnet',
        // },
        // {
        //   title: '主题',
        //   key: 'theme',
        // },
        // {
        //   title: '字符串',
        //   key: 'strings',
        // },
        {
          title: '位置层级1',
          key: 'level1',
        },
        {
          title: '位置层级2',
          key: 'level2',
        },
        {
          title: '位置层级3',
          key: 'level3',
        },
        {
          title: '位置层级4',
          key: 'level4',
        },
        {
          title: '位置层级5',
          key: 'level5',
        },
        {
          title: '位置层级6',
          key: 'level6',
        },
      ];
      defaultData = [
        {
          number: 1,
          category: '第三方数据源',
          pointType: '类型1',
          pointName: '采集点1',
          uploadAgree: 'MQTT',
          address: '******',
          port: '******',
          subnet: '******',
          theme: '*******',
          strings: '********',
          level1: 'XXXXXX',
          level2: 'XXXXXX',
          level3: 'XXXXXX',
          level4: 'XXXXXX',
          level5: 'XXXXXX',
          level6: 'XXXXXX',
        },
        {
          number: 2,
          category: '第三方数据源',
          pointType: '类型2',
          pointName: '采集点2',
          uploadAgree: 'MQTT',
          address: '/',
          port: '/',
          subnet: '/',
          theme: '/',
          strings: '/',
          level1: 'XXXXXX',
          level2: 'XXXXXX',
          level3: 'XXXXXX',
          level4: 'XXXXXX',
          level5: 'XXXXXX',
          level6: 'XXXXXX',
        },
        {
          number: 3,
          category: '第三方数据源',
          pointType: '类型3',
          pointName: '采集点3',
          uploadAgree: 'MQTT',
          address: '/',
          port: '/',
          subnet: '/',
          theme: '/',
          strings: '/',
          level1: 'XXXXXX',
          level2: 'XXXXXX',
          level3: 'XXXXXX',
          level4: 'XXXXXX',
          level5: 'XXXXXX',
          level6: 'XXXXXX',
        },
      ];
      this.toastCol = defaultCol;
      this.toastData = defaultData;
      this.toastUrl = '';
      this.toastFile = '第三方采集点批量导入模板';
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
