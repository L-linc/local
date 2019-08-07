<template>
  <div class="attr_wrap">
    <div v-if="type != 'sensor' && type != 'gateway'">
      <div class="form_li">
        <span class="li_tit">采集点名称：</span>
        <Input v-model="pointName" disabled />
      </div>
      <div class="form_li">
        <span class="li_tit">采集点编号：</span>
        <Input v-model="pointSerial" disabled />
      </div>
      <div class="form_li">
        <span class="li_tit">状态：</span>
        <Input v-model="pointStatus" disabled />
      </div>
      <div class="form_li">
        <span class="li_tit">采集点类型：</span>
        <Select v-model="pointType" disabled>
          <Option v-for="(ele,i) in pointTypeList" :value="ele.id" :key="i">{{ele.name}}</Option>
        </Select>
      </div>
      <div class="form_li">
        <span class="li_tit">上报协议：</span>
        <Select v-model="agreement" disabled>
          <Option v-for="(ele,i) in aggreList" :value="ele" :key="i">{{ele}}</Option>
        </Select>
      </div>
      <div v-show="agreeFlag" class="form_li">
        <span class="li_tit">Daemon：</span>
        <Input v-model="host" placeholder="请输入Daemon" disabled />
      </div>
      <div v-show="agreeFlag" class="form_li">
        <span class="li_tit">Network：</span>
        <Input v-model="netWork" placeholder="请输入Network" disabled />
      </div>
      <div v-show="agreeFlag" class="form_li">
        <span class="li_tit">Service：</span>
        <Input v-model="service" placeholder="请输入Service" disabled />
      </div>
      <div v-show="agreeFlag" class="form_li">
        <span class="li_tit">Subject：</span>
        <Input v-model="topic" placeholder="请输入Subject" disabled />
      </div>
    </div>
    <div v-if="type == 'sensor'">
      <div class="form_li">
        <span class="li_tit">所属sensor名称：</span>
        <Input v-model="sensorName" placeholder="请输入所属sensor名称" />
      </div>
      <div class="form_li">
        <span class="li_tit">sensor编号：</span>
        <Input v-model="sensorSerial" disabled />
      </div>
      <div class="form_li">
        <span class="li_tit">sensor状态：</span>
        <Input v-model="sensorStatus" disabled />
      </div>
      <div class="form_li">
        <span class="li_tit">sensor类型：</span>
        <Select v-model="sensorType" filterable>
          <Option value="all">请选择类型</Option>
          <Option v-for="(ele,i) in sensorTypeList" :value="ele.id" :key="i">{{ele.name}}</Option>
        </Select>
      </div>
      <div class="form_li">
        <span class="li_tit">sensor品牌：</span>
        <Select v-model="brand" filterable>
          <Option v-for="(ele,i) in brandList" :value="ele.id" :key="i">{{ele.name}}</Option>
        </Select>
      </div>
      <div class="form_li">
        <span class="li_tit">所属网关：</span>
        <Select v-model="subGateway">
          <Option value="all">请选择网关</Option>
          <Option v-for="(ele,i) in subGatewayList" :value="ele.id" :key="i">{{ele.name}}</Option>
        </Select>
      </div>
      <div class="form_li">
        <span class="li_tit">采集点类型：</span>
        <span class="point_bar">
          <span :class="ele.flag ? 'point_act' : ''" v-for="(ele,i) in pointTypeAttrList" :key="i">{{ele.name}}</span>
        </span>
      </div>
      <div class="form_li">
        <span class="li_tit">采集点名称：</span>
        <span class="point_bar">
          <em @click="showPoint($event, ele)" :class="ele.flag ? 'point_act' : ''" v-for="(ele,i) in pointAttrList" :key="i">{{ele.name}}</em>
        </span>
      </div>
      <div class="form_li">
        <span class="li_tit">是否列入资产：</span>
        <Select v-model="isAssetSensor">
          <Option value="1">是</Option>
          <Option value="2">否</Option>
        </Select>
      </div>
    </div>
    <div  v-if="type == 'gateway'">
      <div class="form_li">
        <span class="li_tit">设备名称：</span>
        <Input v-model="dvName" placeholder="请输入设备名称" />
      </div>
      <div class="form_li">
        <span class="li_tit">设备编号：</span>
        <Input v-model="dvSerial" disabled />
      </div>
      <div class="form_li">
        <span class="li_tit">设备状态：</span>
        <Input v-model="dvStatus" disabled />
      </div>
      <div class="form_li">
        <span class="li_tit">设备类型：</span>
        <Select v-model="gwType" filterable>
          <Option v-for="(ele,i) in gwTypeList" :value="ele.id" :key="i">{{ele.name}}</Option>
        </Select>
      </div>
      <div class="form_li">
        <span class="li_tit">IP地址：</span>
        <Input v-model="ip" placeholder="请输入IP地址" />
      </div>
      <div class="form_li">
        <span class="li_tit">接入设备：</span>
        <div class="li_equip" :title="interDvList" @click="accessEquipment" >{{interDvList}}</div>
      </div>
      <div class="form_li">
        <span class="li_tit">接入设备数：</span>
        <Input v-model="interDvNumber" disabled />
      </div>
      <div class="form_li">
        <span class="li_tit">是否列入资产：</span>
        <Select v-model="isAssetGw">
          <Option value="1">是</Option>
          <Option value="2">否</Option>
        </Select>
      </div>
    </div>
    <div v-show="showLocation" class="form_li">
      <span class="li_tit">位置：</span>
      <Select filterable :disabled="type !== 'sensor' && type !== 'gateway'" class="sel_loca" @on-change="changeTree(index)" v-for="(treeLi, index) in treeValue" v-model="treeValue[index]" :key="index">
        <Option value="">请选择</Option>
        <Option v-show="checkOption(index, optLi)" v-for="(optLi, i) in selectTree[index]" :key="i" :value="optLi.id">{{optLi.title}}</Option>
      </Select>
    </div>
    <div class="form_li">
      <span class="li_tit">最近更新时间：</span>
      <Input v-model="upTime" disabled />
    </div>
    <div class="form_li">
      <span class="li_tit">最近更新操作：</span>
      <Input v-model="updater" disabled />
    </div>
    <div class="form_li" v-if="type != 'sensor' && type !== 'gateway'">
      <span class="li_tit">返回：</span>
      <ul class="li_backinfo" v-if="agreement === 'MQTT'">
        <li>
          <span>MQTT服务器地址: </span>
          <span :title="host">{{host}}</span>
        </li>
        <li>
          <span>Topic: </span>
          <span :title="topic">{{topic}}</span>
        </li>
        <li>
          <span>采集点ID: </span>
          <span :title="pointId">{{pointId}}</span>
        </li>
        <li>
          <span>Token: </span>
          <span :title="token">{{token}}</span>
        </li>
      </ul>
      <ul class="li_backinfo" v-if="agreement === 'TibcoRV'">
        <li>
          <span>Daemon: </span>
          <span :title="host">{{host}}</span>
        </li>
        <li>
          <span>Network: </span>
          <span :title="netWork">{{netWork}}</span>
        </li>
        <li>
          <span>Service: </span>
          <span :title="service">{{service}}</span>
        </li>
        <li>
          <span>Subject: </span>
          <span :title="topic">{{topic}}</span>
        </li>
      </ul>
    </div>
    <div v-show="type === 'sensor' || type === 'gateway'" class="foot_wrap">
      <Button @click='toSave' type="primary" v-has="'SYS_SENSOR_MOD' || 'SYS_THIRD_POINT_MOD' || 'SYS_COLLECTOR_POINT_MOD'">保 存</Button>
    </div>
    <Modal
        class="third_modal"
        v-model="PointModalFlag"
        :title="showPointTypeName + '/' + showPointName"
        on-ok= "clearModal"
        cancelText=""
        width="540px">     
        <div> 
          <div class="add_label">
            <span class="label_name">采集点类型：</span>
            <Select disabled :value="showPointTypeName">
              <Option :value="showPointTypeName">{{showPointTypeName}}</Option>
            </Select>
          </div>
          <div class="add_label">
            <span class="label_name">采集点名称：</span>
            <Input :value="showPointName" disabled />
          </div>
          <div class="add_label">
            <span class="label_name">上报方式：</span>
            <Select disabled :value="showPointUpType">
              <Option :value="showPointUpType">{{showPointUpType}}</Option>
            </Select>
          </div>
          <div class="add_label">
            <span class="label_name">上报协议：</span>
            <Select disabled :value="showPointUpProto">
              <Option :value="showPointUpProto">{{showPointUpProto}}</Option>
            </Select>
          </div>
          <div class="add_label" v-show="subGateway && subGateway !=='all'">
            <span class="label_name">选择网关：</span>
            <Select disabled v-model="subGateway">
              <Option v-for="(ele,i) in subGatewayList" :value="ele.id" :key="i">{{ele.name}}</Option>
            </Select>
          </div>
          <div class="add_label_backinfo">
            <span class="label_name">返回：</span>
            <ul class="li_backinfo" v-if="showPointUpProto === 'MQTT'">
              <li>
                <span>MQTT服务器地址: </span>
                <span :title="showPointHost">{{showPointHost}}</span>
              </li>
              <li>
                <span>Topic: </span>
                <span :title="showPointTopic">{{showPointTopic}}</span>
              </li>
              <li>
                <span>采集点ID: </span>
                <span :title="showPointPointId">{{showPointPointId}}</span>
              </li>
              <li>
                <span>Token: </span>
                <span :title="showPointToken">{{showPointToken}}</span>
              </li>
            </ul>
            <ul class="li_backinfo" v-if="showPointUpProto === 'TibcoRV'">
              <li>
                <span>Daemon: </span>
                <span :title="showPointHost">{{showPointHost}}</span>
              </li>
              <li>
                <span>Network: </span>
                <span :title="showPointNetWork">{{showPointNetWork}}</span>
              </li>
              <li>
                <span>Service: </span>
                <span :title="showPointService">{{showPointService}}</span>
              </li>
              <li>
                <span>Subject: </span>
                <span :title="showPointTopic">{{showPointTopic}}</span>
              </li>
            </ul>
          </div>
        </div>
    </Modal>
    <Modal
      class="equip_modal"
      v-model="changeSensorFlag"
      title="接入设备"
      @on-cancel="closeSensor"
      width="530px">
      <div class="sear_bar">
        <Input prefix="ios-search" placeholder="搜索" v-model="dvNameSea"/>
        <Button class="btn_sear" type="primary" @click="deviceSeaHandle"> 搜 索 </Button>
      </div>
      <div class="trans_bar">
        <div class="equip_list">
          <CheckboxGroup v-model="leftList">
            <div v-if="getSearSensors.length > 0">
              <div style="margin-bottom:4px" v-for="item in getSearSensors" :key="item.id">
                <Checkbox :label="item.name"></Checkbox>
              </div>
            </div>
            <div v-else>
              <span>暂无数据</span>
            </div>
          </CheckboxGroup>
        </div>
        <div class="actions">
          <Button type="primary" style="margin-bottom:6px;font-size: 14px;" @click="addToRight">添加 &gt;</Button>
          <Button style="font-size: 14px;background:#DCE5E8" @click="addToLeft">&lt; 删除</Button>
        </div>
        <div class="equip_list">
          <CheckboxGroup v-model="rightList">
            <div v-if="rightSensor.length > 0">
              <div v-for="item in rightSensor" :key="item.id">
                <Checkbox :label="item.name" :disabled="item.disabled"></Checkbox>
              </div>
            </div>
            <div v-else>
              <span>暂无数据</span>
            </div>
          </CheckboxGroup>
        </div>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" class="ok_btn" @click="chooseSensor"> 提 交 </Button>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import './devicesManage.less';
import dataSourApi from '@/api/dataSourManage.ts';
import dictionaryApi from '@/api/dataDictionary.ts';
import Vue from 'vue';
export default Vue.extend ({
  name: 'DeviceAttr',
  props: ['type', 'dvId'],
  created() {
    // this.initData();
    this.initData();
    // this.getAttrData(this.type);
    this.getTreeData();
  },
  watch: {
    dvId(newValue: any, oldValue: any) {
      this.initData();
      this.getAttrData(this.type);
    },
  },
  activated() {
    this.initData();
    this.getAttrData(this.type);
  },
  computed: {
    agreeFlag(): boolean {
      const agreeMent = this.agreement || '';
      return this.agreement.toLowerCase() === 'tibcorv';
    },
    showLocation(): boolean {
      return this.type === 'sensor' && this.subGateway && this.subGateway !== 'all' ? false : true;
    },
    getSearSensors(): any[] {
      const arry: any[] = [];
      this.leftSensors.map((ele: any) => {
        if (!ele.display) {
          arry.push(ele);
        }
      });
      return arry;
    },
  },
  data() {
    return {
      pointName: '',
      pointSerial: '',
      pointStatus: '',
      pointType: '',
      pointTypeList: [] as any,
      aggreList: [],
      agreement: '',
      host: '',
      netWork: '',
      token: '',
      pointId: '',
      service: '',
      topic: '',
      sensorName: '',
      sensorSerial: '',
      sensorStatus: '',
      sensorType: 'all',
      sensorTypeList: [] as any,
      brand: '',
      brandList: [] as any,
      dvName: '',
      dvSerial: '',
      dvStatus: '',
      ip: '',
      subGatewayList: [] as any,
      subGateway: 'all',
      gwTypeList: [] as any,
      gwType: '',
      interDvList: '',
      interDvNumber: 0,
      isAssetGw: '1',
      isAssetSensor: '1',
      treeValue: ['0', '0', '0', '0', '0'],
      selectTree: [],
      upTime: '',
      updater: '',
      pointTypeAttrList: [] as any,
      pointAttrList: [] as any,
      PointModalFlag: false,
      showPointTypeName: '',
      showPointName: '',
      showPointUpType: '',
      showPointUpProto: '',
      showPointHost: '',
      showPointNetWork: '',
      showPointService: '',
      showPointTopic: '',
      showPointToken: '',
      showPointPointId: '',
      changeSensorFlag: false,
      leftList: [] as any, // 左边sensor列表中间数据,点击checkbox的时候会存入
      rightList: [] as any, // 右边sensor列表中间数据,点击checkbox的时候会存入
      leftSensors: [] as any, // 左边去掉右边之后的sensor列表
      rightSensors: [] as any, // 保存当前拥有的sensor
      rightSensor: [] as any, // 右边选中之后的sensor列表
      allSensors: [] as any, // 全部sensor列表
      dvNameSea: '',  // 搜索设备名称
    };
  },
  methods: {
    closeSensor() {
      this.changeSensorFlag = false;
      this.leftSensors = [];
      this.rightSensor = this.rightSensors;
      this.leftList = [];
      this.rightList = [];
      this.dvNameSea = '';
    },
    accessEquipment() {
      this.changeSensorFlag = true;
      const params = {
        isPaged: false,
      };
      dataSourApi.getAllSensors(params).then((res: any) => {
        this.allSensors = res.data.content;
        const left = JSON.parse(JSON.stringify(this.allSensors));
        for (const i of this.rightSensor) {
          for (let j = left.length - 1; j >= 0; j--) {
            if (i.id === left[j].id) {
              left.splice(j, 1);
              continue;
            }
          }
        }
        this.leftSensors = left;
      });
    },
    addToRight() {
      const left = JSON.parse(JSON.stringify(this.leftSensors));
      const right = JSON.parse(JSON.stringify(this.rightSensor));
      for (const i of this.leftList) {
        for (let j = left.length - 1; j >= 0; j--) {
          if (i === left[j].name) {
            right.push(left[j]);
            left.splice(j, 1);
            continue;
          }
        }
      }
      this.leftSensors = left;
      this.rightSensor = right;
      this.leftList = [];
      this.rightList = [];
    },
    addToLeft() {
      const left = JSON.parse(JSON.stringify(this.leftSensors));
      const right = JSON.parse(JSON.stringify(this.rightSensor));
      for (const i of this.rightList) {
        for (let j = right.length - 1; j >= 0; j--) {
          if (i === right[j].name) {
            left.push(right[j]);
            right.splice(j, 1);
            continue;
          }
        }
      }
      this.leftSensors = left;
      this.rightSensor = right;
      this.leftList = [];
      this.rightList = [];
    },
    chooseSensor() {
      let flag = false;
      if (this.rightSensor.length > 0) {
        for (const i of this.rightSensor) {
          if (!i.disabled) {
            flag = true;
          }
        }
        if (!flag) {
          this.$Message.error('当前网关sensor未做修改!');
          return;
        }
      } else {
        this.$Message.error('请选择sensor');
        return;
      }
      const sensorIds: string[] = [];
      for (const i of this.rightSensor) {
        sensorIds.push(i.id);
      }
      const params = {
        id: this.dvId,
        sensorIds,
      };
      dataSourApi.changeSensors(params).then((res: any) => {
        this.$Message.success('修改sensor成功!');
        this.initData();
        this.getTreeData();
        this.closeSensor();
      });
    },
    initData() {
      const {type, dvId} = this;
      switch (type) {
        case 'sensor':
          this.getSensorData(type);
          if (this.subGatewayList.length === 0) {
            this.getGwData();
          }
          if (this.brandList.length === 0) {
            this.getBrand();
          }
          break;
        case 'gateway':
          this.getSensorData(type);
          break;
        default:
          if (this.aggreList.length === 0) {
             this.getProtosData();
          }
          // this.getTypeData();
          break;
      }
    },
    getSensorData(type: string = 'sensor') {
      const params = {
          params: `page=&size=&type=${type}Type&name=`,
      };
      dictionaryApi.selectType(params).then((res: any = {}) => {
        const list = res.data.content || [];
        if (type === 'sensor') {
          this.sensorTypeList = list;
        } else {
          this.gwTypeList = list;
        }
      });
    },
    getBrand() {
      dataSourApi.getAllBrand().then((res: any = {}) => {
        const list = res.data || [];
        this.brandList = list;
        // 所属网关赋初值
        // this.subGateway = list.length > 0 ? list[0].id : '';
      });
    },
    getGwData() {
      dataSourApi.getAllGateway().then((res: any = {}) => {
        const list = res.data || [];
        this.subGatewayList = list;
      });
    },
    getTypeData(type?: string) {
      type = type || 'thirdParty';
      const params = {
          params: `page=&size=&category=${type}&keyword=&pointNumber=`,
      };
      dictionaryApi.collTypeList(params).then((res: any = {}) => {
        const data = res.data || {};
        const list = data.content || [];
        this.pointTypeList = list;
        // 采集点类型赋初值
        // this.pointType = list.length > 0 ? list[0].id : '';
      });
    },
    getProtosData() {
      dataSourApi.getProtos().then((res: any = {}) => {
        const list = res.data || [];
        this.aggreList = list;
        // 协议赋初值
        // this.agreement = list.length > 0 ? list[0] : '';
      });
    },
    changeTree(index: number) {
        // select改变设备树更新，触发改变的当前select之后的select都会根据当前的变化value默认选择关联父级的子级第一项；
        // event = event || window.event;
        const valLen = this.treeValue.length;
        const currVal = this.treeValue[index];
        const listData: any[] = this.selectTree[index + 1];
        let nexVal = '';
        if (index + 1 >= valLen) {
            // 最后一层终止
            return;
        }
        // this.selectTree[index + 1].map((ele: any, i: number) => {
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
        this.treeValue[index + 1] = nexVal;
        if (index + 1 < valLen - 1) {
            // 改变非第一层的设备树值，递归循环改变后面的数值；
            this.changeTree(index + 1);
        }
    },
    checkOption(index: number, data: any) {
        if (index === 0 || data.parent === this.treeValue[index - 1]) {
            // index为0是第一层设备树不需要过滤，其他层的父级ID === 上一层v-model双向绑定的值才显示；
            return true;
        }
        return false;
    },
    getParent(index: number, id: string) {
      // 递归从最后一层往回找父节点
      if (index < 0 || !id) {
          // 第一层开始终止
          return;
      }
      const newArry: string[] = [];
      const selectTree: any[] = this.selectTree;
      for (index; index >= 0; index --) {
          let getNode: boolean = false;
          selectTree[index].map((ele: any, i: number) => {
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
      this.treeValue = newArry;
    },
    getTreeData() {
        const params = {urlStr: ''};
        dictionaryApi.selectTree(params).then((res: any) => {
            const data = res.data || [];
            this.dataTransTree(data);
            this.getAttrData(this.type);
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
        const treeSelData: any = [];
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
        this.selectTree = treeSelData;
        // (this as any).treeData = transList;
    },
    showPoint(e: any, data: any) {
      // if (!data.flag) {
      //   return;
      // }
      const params = {
        type: 'point',
        id: data.id,
      };
      dataSourApi.getDvDetail(params).then((res: any = {}) => {
        const listData = res.data || {};
        console.log(listData);
        this.PointModalFlag = true;
        this.showPointName = listData.name;
        this.showPointTypeName = listData.pointType ? listData.pointType.name : '';
        this.showPointUpType = listData.uploadType;
        this.showPointUpProto = listData.uploadProto;
        // 返回内容
        this.showPointHost = listData.host;
        this.showPointNetWork = listData.netWork;
        this.showPointService = listData.service;
        this.showPointTopic = listData.topic;
        this.showPointToken = listData.token;
        this.showPointPointId = listData.id;
      });
    },
    clearModal() {
      this.showPointTypeName = '';
      this.showPointName = '';
      this.showPointUpType = '';
      this.showPointUpProto = '';
    },
    getAttrData(type: string) {
      type = type === 'thirdParty' ? 'point' : type;
      const params = {
        type,
        id: this.dvId,
      };
      dataSourApi.getDvDetail(params).then((res: any = {}) => {
        const data = res.data || {};
        switch (type) {
          case 'sensor':
            this.sensorName = data.name;
            this.sensorSerial = data.serialNumber;
            this.sensorStatus = this.transStatus(data.status);
            this.sensorType = data.sensorType ? data.sensorType.id : 'all';
            this.brand = data.brand;
            this.subGateway = data.gateway ? data.gateway.id : 'all';
            this.isAssetSensor = data.isAsset + '';
            const pointList: any = [];
            const pointTypeList: any = [];
            data.points = data.points ? data.points : [];
            data.points.map((ele: any) => {
              const pointFlag = ele.id === this.$route.query.pointId ? true : false;
              pointList.push({...ele, flag: pointFlag});
              let flag = false;
              pointTypeList.map((typeEle: any) => {
                if (typeEle.id === ele.pointType.id) {
                  flag = true;
                }
                typeEle.flag = typeEle.id === this.$route.query.pointType ? true : false;
              });
              if (!flag) {
                pointTypeList.push(ele.pointType);
              }
            });
            this.pointTypeAttrList = pointTypeList;
            this.pointAttrList = pointList;
            break;
          case 'gateway':
            let sensorStr = '';
            if (data.sensors) {
              data.sensors.map((ele: any, i: any) => {
                sensorStr += (ele.name + ',');
              });
            }
            this.dvName = data.name;
            this.dvSerial = data.serialNumber;
            this.dvStatus = this.transStatus(data.status);
            this.ip = data.ip;
            this.gwType = data.gatewayType ? data.gatewayType.id : '';
            this.rightSensor = data.sensors;
            for (const i of this.rightSensor) {
              i.disabled = true; // true代表后台获取的时候就是有的
            }
            this.rightSensors = data.sensors;
            for (const i of this.rightSensors) {
              i.disabled = true; // true代表后台获取的时候就是有的
            }
            this.interDvList = sensorStr.substring(0, sensorStr.length - 1);
            this.interDvNumber = data.countOfSensor;
            this.isAssetGw = data.isAsset + '';
            break;
          default:
            if (data.pointType && data.pointType.category) {
              this.getTypeData(data.pointType.category);
              if (data.pointType.category === 'collector') {
                data.location = data.locations.parent;
              }
            }
            this.pointName = data.name,
            this.pointSerial = data.serialNumber;
            this.pointStatus = this.transStatus(data.status);
            this.pointType = data.pointType ? data.pointType.id : '';
            this.agreement = data.uploadProto;
            this.host = data.host;
            this.netWork = data.netWork;
            this.service = data.service;
            this.topic = data.topic;
            this.token = data.token;
            this.pointId = data.id;
            break;
        }
        this.upTime = data.updateTime;
        this.updater = data.updateBy;
        this.getParent(this.treeValue.length - 1, data.location);
      });
    },
    toSave() {
      const {pointName, type, dvId, pointSerial, pointStatus, pointType, agreement, isAssetGw, host, service, netWork, topic, sensorName, sensorSerial, sensorStatus, sensorType, brand, dvName, dvSerial, dvStatus, ip, subGateway, gwType, isAssetSensor, treeValue, upTime, updater} = this;
      let params: any = {};
      // type = type === 'thirdParty' ? 'point' : type;
      let location = '';
      treeValue.map((ele: any) => {
        if (ele) {
          location = ele;
        }
      });
      if (type === 'sensor') {
        params = {
          id: dvId,
          name: sensorName,
          sensorType: sensorType === 'all' ? null : sensorType,
          brand: brand ? brand : null,
          gateway: subGateway === 'all' ? null : subGateway,
          location: subGateway && subGateway !== 'all' ? null : location,
          type,
          isAsset: isAssetSensor,
        };
        if (sensorName.trim().length > 50) {
          this.$Message.error('设备名称最多只能输入50位');
          return;
        }
        if (!subGateway && !location) {
          this.$Message.error('请至少选择网关或者所在位置');
          return;
        }
      } else if (type === 'gateway') {
        params = {
          id: dvId,
          name: dvName,
          ip,
          gatewayType: gwType,
          location,
          type,
          isAsset: isAssetGw,
        };
        if (dvName.trim().length > 50) {
          this.$Message.error('设备名称最多只能输入50位');
          return;
        }
        if (!location) {
          this.$Message.error('位置不能为空');
          return;
        }
      } else {
        params = {
          type: 'point',
          id: dvId,
          name: pointName,
          location,
        };
        if (pointName.trim().length > 50) {
          this.$Message.error('设备名称最多只能输入50位');
          return;
        }
        if (!location) {
          this.$Message.error('位置不能为空');
          return;
        }
      }
      dataSourApi.editDevice(params).then((res: any = {}) => {
        this.$Message.success('编辑成功');
      });
    },
    transStatus(status: string|number) {
      let txt = '';
      switch (status) {
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
        default:
          txt = '正常';
          break;
      }
      return txt;
    },
    deviceSeaHandle() {
      const name = this.dvNameSea.trim();
      this.leftList = [];
      const newArry = this.leftSensors.map((ele: any) => {
        ele.display = ele.name.indexOf(name) === -1 ? true : false;
        return ele;
      });
      this.leftSensors = [...newArry];
    },
  },
});
</script>
