<template>
  <div class="model-detail">
    <p class="detail_tit">{{pageActTit}}</p>
    <div class="detail_box">
      <p class="cond_tit">如果</p>
      <div class="cond_wrap">
         <div class="model_li" v-for="(item,i) in ifConList" :key="i">
              <span v-if="ele.type !== 'symType' || (ele.type === 'symType' && ele.symVla)" :style="'margin-left:' + (j === 0 ? (ele.type === 'select' ? ((ele.level - 1) * 180  + 10) : (ele.level * 180 + 10)) : '') + 'px'" v-for="(ele,j) in item" :key="j">
                  <span v-if="ele.type === 'select'" class="condi_bar">
                      <Select disabled :value="ele.value">
                        <Option :value="ele.value">{{ele.value}}</Option>
                      </Select>
                      <span class="inter_line"></span>
                  </span>                       
                  <span v-else class="var_bar">
                      <em v-if="ele.type === 'leftBra'">(</em>
                      <span v-if="ele.type !== 'symType' && ele.type !== 'rightBra' && ele.type !== 'leftBra'" class="other_tit">{{ele.value}}</span>
                      <span class="btn_sym" v-if="ele.type === 'symType'">{{ele.symVla}}</span>
                      <em v-if="ele.type === 'rightBra'"  @click.stop="">)</em>
                  </span>                        
              </span>  
          </div>
      </div>
    </div>
    <div class="detail_box">
      <p class="det_tit">模型应用</p>
      <div class="cond_wrap">
        <span class="li_tit">
          请选择应用：
        </span>
        <Select v-model="appId" filterable>
          <Option value="">请选择应用</Option>
          <Option v-for="(item, itemI) in appList" :key="itemI" :value="item.id">{{item.name}}</Option>
        </Select>
      </div>
    </div>
    <div class="detail_box">
      <p class="det_tit">配置变量as </p>
      <div class="cond_wrap">
        <div class="var_li" v-for="(ele,i) in useVarList" :key="i">
          <p>
            <icon class="icon_conf"></icon>
            {{ele.valArr.slice(1).join('.')}}
          </p>
          <div class="li_row">
            <span class="li_tit">
              采集点类型：
            </span>
            <Select v-model="pointType" @on-change="changePointType" :disabled="i > 0 ? true : false">
              <Option value="">请选择类型</Option>
              <Option v-for="(item, itemI) in pTypeList" :key="itemI" :value="item.id">{{item.name}}</Option>
            </Select>
            <span class="li_tit">
              采集点：
            </span>
            <Select @on-change="getLocation" v-model="pointId" :disabled="i > 0 ? true : false">
              <Option value="">请选择采集点</Option>
              <Option v-for="(item, itemI) in pointList" :key="itemI" :value="item.id">{{item.name}}</Option>
            </Select>
          </div>
          <div class="li_row">
            <span class="li_tit">
              参数：
            </span>
            <Select
                v-model="selParam[i]"
                filterable
                remote
                :remote-method="filterParam"
                :loading="paramLoad">
                <Option v-for="(item, itemI) in paramList" :value="item.id" :key="itemI">{{item.name}}</Option>
            </Select>
          </div>
        </div>
        <div class="rule_wrap">
          <div class="rule_li" v-for="(item, index) in configRuleArray" :key="index" >
            <span v-show="item">{{useVarList[index].valArr.slice(1).join('.')}}</span>
            <span class="comp_con" v-show="item">等于</span>
            <span v-show="item">{{item}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="detail_box alarm_box">
      <p class="det_tit">报警设置</p>
      <div class="cond_wrap">
        <div class="alarm_li">
          <span class="li_tit">
              报警类型：
            </span>
            <RadioGroup v-model="alarmType">
              <Radio label='1'>预警</Radio>
              <Radio label='2'>报警</Radio>
            </RadioGroup>
        </div>
        <div class="alarm_li">
          <span class="li_tit">
              报警方式：
            </span>
            <CheckboxGroup v-model="alarmPat">
              <Checkbox v-for="item in alarmTypes" :key="item.id" :label="item.id">{{item.warnType}}</Checkbox>
            </CheckboxGroup>
        </div>
        <div class="alarm_li">
          <span class="li_tit">
            报警模板：
          </span>
          <Select v-model="alarmTem">
            <Option v-for="(item, itemI) in temList" :key="itemI" :value="item.id">{{item.title}}</Option>
          </Select>
          <span v-if="eventName" class="li_tit event_name">
            Event name：
          </span>
          <span v-if="eventName" class="event_name_detail over-text" :title="eventName">{{eventName}}</span>
        </div>
        <div class="alarm_form">
          <div class="form_li">
            <span class="li_tit">
              标题：
            </span>
            <span class="li_con">
              <span class="alarm_tit" v-show="showAlarmTit">{{alarmTemInfo.alarmTit}}</span>
              <span @click="showEdit('tit')" class="btn_edit" v-show="showAlarmTit">编辑</span>
              <Input ref="titDom" @on-blur="inputChange('tit')" @on-enter="inputChange('tit')" v-show="!showAlarmTit" placeholder="请输入标题" v-model="alarmTemInfo.alarmTit" />
            </span>
          </div>
          <div class="form_li">
            <span class="li_tit">
              采集点类型：
            </span>
            <span class="li_con">
              {{alarmTemInfo.pointTypeName}}
            </span>
          </div>
          <div class="form_li">
            <span class="li_tit">
              采集点.参数：
            </span>
            <span class="li_con">
              {{pointParam}}
            </span>
          </div>
          <div class="form_li">
            <span class="li_tit">
              时间：
            </span>
            <span class="li_con">
              {{alarmTemInfo.currTime}}
            </span>
          </div>
          <div class="form_li">
            <span class="li_tit">
              位置：
            </span>
            <span class="li_con">
              {{alarmTemInfo.locationName}}
            </span>
          </div>
          <div class="form_li">
            <span class="li_tit">
              报警项目：
            </span>
            <span class="li_con">
              {{alarmProject}}
            </span>
          </div>
          <div class="form_li">
            <span class="li_tit">
              备注：
            </span>
            <span class="li_con">
              <span v-show="showMark">{{alarmTemInfo.alarmMark}}</span>
              <span @click="showEdit('mark')" class="btn_edit" v-show="showMark">编辑</span>
              <Input ref="markDom" @on-blur="inputChange('mark')" @on-enter="inputChange('mark')" v-show="!showMark" placeholder="请输入备注" v-model="alarmTemInfo.alarmMark" />
            </span>
          </div>
        </div>
      </div>
      <div class="wrap_foot">
        <Button type="primary" @click="saveModelAPP">保存</Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import './appCenter.less';
import modalManageApi from '@/api/modalManage.ts';
import alarmCenterApi from '@/api/alarmCenter.ts';
import {Component, Prop, Watch} from 'vue-property-decorator';
@Component
export default class ModelManageDetail extends Vue {
    // props

    // data

  private pageActTit: string = '添加模型应用';  // 页面主题
  private pointType: string|number = '';  // 采集点类型id;
  private pTypeList: any[] = [];  // 采集点类型list;
  private pointId: string|number = '';  // 采集点id;
  private pointList: any[] = [];  // 采集点list;
  private appId: string|number = '';  // 应用id;
  private appList: any[] = [];  // 应用list;
  private paramList: any[] = [];  // 参数list;
  private paramLoad: boolean = false;
  private filterParamList: any[] = [];  // 过滤;
  private selParam: any[] = []; // 选中的参数List;
  private modelFormula: string = ''; // 存储模型公式;
  private ifConList: any[] = []; // if条件回显list;
  private elseConList: any[] = []; // else条件回显list;
  private otherConList: any[] = []; // other条件回显list;
  private useVarList: any[] = []; // 使用的变量List;
  private temList: any[] = []; // 模板list;
  private alarmTem: string|number = ''; // 当前模板Id;
  private alarmPat: any[] = []; // 报警方式;
  private alarmType: string|number = '1'; // 报警类型;
  private showMark: boolean = true; // 显示报警备注;
  private showAlarmTit: boolean = true; // 显示报警标题;
  private modelId: string|number = ''; // 模型Id;
  private EditId: string|number = ''; // 编辑Id;
  private linkTimer: any = null; // 定时器timer;
  private eventName: string|null = null; // eventName
  private alarmTemInfo: any = {
    pointTypeName: '',
    locationName: '',
    alarmTit: '报警',
    alarmMark: '备注',
    currTime: this.getCurrentYearMonthDay(new Date()),
  }; // 报警模板内容
  private alarmTypes: any[] = [];

  get pointParam(): string {
    let paramstr = '';
    let pointName = '';
    this.pointList.map((ele: any) => {
      if (ele.id === this.pointId) {
        pointName = ele.name;
      }
    });
    this.selParam.map((ele: any) => {
      const paramName = '';
      if (ele) {
        this.paramList.map((paramLi: any) => {
          if (paramLi.id === ele) {
            paramstr += (pointName + '.' + paramLi.name + '；');
          }
        });
      }
    });
    return paramstr.substring(0, paramstr.length - 1);
  }

  get alarmProject(): string {
    const {useVarList, modelFormula, pointParam, alarmType} = this;
    let projectStr = modelFormula || '';
    const paramArry: any = pointParam.split('；');
    useVarList.map((ele: any, i: number) => {
      if (paramArry[i]) {
        projectStr = this.transStr(projectStr, ele.name, paramArry[i]);
      }
    });
    return projectStr + '，' + (alarmType === '1' ? '预警' : '报警');
  }

  get configRuleArray(): any[] {
    let ruleArr: any[] = [];
    if (this.useVarList.length  === 0) {
      return [];
    }
    const strArr = this.pointParam.split('；');
    let arrIndex = 0;
    ruleArr = this.selParam.map((ele: any) => {
      if (ele) {
        return this.alarmTemInfo.pointTypeName + '_' + strArr[arrIndex ++];
      } else {
        return '';
      }
    });
    return ruleArr;
  }
    // cycle
  private activated() {
    this.getAppList();
    this.getTemList();
    this.getPointTypeList();
    this.getAlarmTypes();
  }

  private deactivated() {
    this.modelFormula = '';
    this.alarmType = '1';
    this.pointType = '';
    this.ifConList = [];
    this.pointId = '';
    this.appId = '';
    this.alarmTem = '';
    this.alarmPat = [];
    this.selParam = [];
    this.useVarList = [];
    this.EditId = '';
    this.alarmTemInfo = {
      pointTypeName: '',
      locationName: '',
      alarmTit: '报警',
      alarmMark: '备注',
      currTime: this.getCurrentYearMonthDay(new Date()),
    };
    this.modelId = '';
    this.showMark = true;
    this.showAlarmTit = true;
    if (this.linkTimer) {
      clearTimeout(this.linkTimer);
      this.linkTimer = null;
    }
  }

  // methods
  // 获取报警方式
  private getAlarmTypes() {
    modalManageApi.getAlarmType().then((res: any) => {
      this.alarmTypes = res.data;
    });
  }

  private filterParam(query: string) {
    const paramsList = (this as any).paramList;
    if (!query) {
      this.filterParamList = [].concat(paramsList);
    } else {
      this.paramLoad = true;
      setTimeout(() => {
        this.paramLoad = false;
        this.filterParamList = paramsList.filter((val: any) => {
          return val.name.indexOf(query) > -1;
        });
      }, 200);
    }
  }

  private getAppList() {
    modalManageApi.getAllApplication().then((res: any = {}) => {
      const list: any[] = res.data || [];
      this.appList = list;
      // if (list[0] && this.pageActTit !== '设置') {
      //   this.appId = list[0].id;
      // }
    });
  }

  private getTemList() {
    modalManageApi.getAlarmModel().then((res: any = {}) => {
      const list: any[] = res.data || [];
      this.temList = list;
      if (list[0] && this.pageActTit !== '设置') {
        this.alarmTem = list[0].id;
        this.alarmTemInfo.alarmTit = list[0].title;
        this.alarmTemInfo.alarmMark = list[0].comment;
      }
    });
  }

  private async getModelInfo() {
    const modelInfo: any = this.$route.query;
    let data: any = modelInfo.ojbk || {};
    let modelId: string|number = '';
    if (typeof(data) === 'string') {
      if (modelInfo.status === 'add') {
        await modalManageApi.getModelDetailFromModelId(data).then((res: any = {}) => {
          data = res.data;
        });
      } else {
        const param = {
          id: data,
        };
        await alarmCenterApi.goModel(param).then((res: any) => {
          data = res.data;
        });
      }
    }
    // console.log(modelInfo);
    if (modelInfo.status === 'add') {
      this.pageActTit = '添加模型应用';
      this.useVarList = JSON.parse(data.useField) || [];
      // // console.log(this.useVarList);
      // this.ifConList = JSON.parse(data.formula) || [];
      // this.modelFormula = data.content;
      // console.log(data.useField);
      const selParam: any[] = [];
      this.useVarList.map((ele: any) => {
        selParam.push('');
      });
      this.selParam = [...selParam];
      this.modelId = data.id;
      modelId = data.id;
    } else {
      // console.log(modelInfo);
      this.pageActTit = '设置';
      modelId = data.modelId;
      this.modelId = data.modelId;
      this.ifConList = data.modelRule ? JSON.parse(data.modelRule) : [];
      this.EditId = data.id;
      const alarmTemInfo = data.content ? JSON.parse(data.content) : {};
      this.alarmType = data.warn + '';
      this.alarmPat = data.warnType.split(',');
      this.alarmTem = data.warnTemplateId;
      this.appId = data.viewToolId;
      this.eventName = data.eventName;
      this.alarmTemInfo = {
        pointTypeName: alarmTemInfo.pointType.content,
        locationName: alarmTemInfo.position.content,
        alarmTit: data.warnTitle,
        alarmMark: data.warnRemark,
        currTime: (alarmTemInfo.currentTime.content || this.getCurrentYearMonthDay(new Date())),
      };
      const pTypeName = this.alarmTemInfo.pointTypeName;
      this.pTypeList.map((ele: any) => {
        if (ele.name === pTypeName) {
          this.pointType = ele.id;
          this.pointList = ele.points || [];
          this.paramList = ele.params || [];
        }
      });
      this.pointId = data.pointId;
      this.selParam = data.paramId.split(',');
    }
    modalManageApi.getModelDetailFromModelId(modelId).then((res: any = {}) => {
      const resList = res.data || {};
      this.useVarList = resList.useField ? JSON.parse(resList.useField) : [];
      this.ifConList = resList.formula ? JSON.parse(resList.formula) : [];
      this.modelFormula = resList.content;
    });
  }

  private getPointTypeList() {
    modalManageApi.getPointTypeParams().then((res: any = {}) => {
      const list: any[] = res.data || [];
      this.pTypeList = list;
      if (list[0]) {
        this.pointList = list[0].points || [];
        this.paramList = list[0].params || [];
        // if (list[0].points[0]) {
        //   this.pointId = list[0].points[0].id;
        // }
        this.pointType = list[0] ? list[0].id : '';
        this.alarmTemInfo.pointTypeName = list[0] ? list[0].name : '';
        // if (list[0] && list[0].params) {
        //   const selParam: any[] = [];
        //   list[0].params.map((ele: any, i: number) => {
        //     selParam.push('');
        //   });
        //   this.selParam = selParam;
        // }
      }
      this.getModelInfo();
    });
  }

  private showEdit(type: string) {
    if (type === 'tit') {
      this.showAlarmTit = false;
      this.$nextTick(() => {
        (this as any).$refs.titDom.focus();
      });
    } else {
      this.showMark = false;
      this.$nextTick(() => {
        (this as any).$refs.markDom.focus();
      });
    }
  }

  private inputChange(type: string) {
    if (type === 'tit') {
      this.showAlarmTit = true;
    } else {
      this.showMark = true;
    }
  }

  private changePointType(val: string|number) {
    this.selParam = this.selParam.map((param: any) => {
      return param = '';
    });
    if (!val) {
      this.pointList = [];
      this.paramList = [];
      this.alarmTemInfo.pointTypeName = '';
      return;
    }
    this.pTypeList.map((ele: any) => {
      if (val === ele.id) {
        this.pointList = ele.points || [];
        this.paramList = ele.params || [];
        this.alarmTemInfo.pointTypeName = ele.name;
      }
    });
  }

  private getLocation(val: any) {
    if (!val) {
      this.alarmTemInfo.locationName = '';
      return;
    }
    const params = {
      deviceIds: [val],
      locationType: 5,
    };
    modalManageApi.getPointNameFromPointId(params).then((res: any = {}) => {
      const data = res.data || [];
      this.alarmTemInfo.locationName = data[0].locationName;
    });
  }

  private getCurrentYearMonthDay(time: any) {
    const date: any = new Date(time);
    const month: any = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const strDate = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return `${date.getFullYear()}-${month}-${strDate}`;
  }

  // private changeParam() {

  // }

  private saveModelAPP() {
    console.log(this.selParam);
    const {pointType, pointId, modelId, appId, selParam, alarmTem, alarmTemInfo, alarmPat, alarmType, ifConList, modelFormula, useVarList, pointParam} = this;
    let pointName: string = '';
    const paramNameArr: any[] = [];
    this.pointList.map((ele: any) => {
      if (pointId === ele.id) {
        pointName = ele.name;
      }
    });
    if (!pointId) {
      this.$Message.error('未选择采集点,无法提交;');
      return;
    }
    if (!alarmTem) {
      this.$Message.error('未选择报警模板;');
      return;
    }
    if (!alarmTemInfo.alarmTit) {
      this.$Message.error('模板标题内容不能为空');
      return;
    }
    if (alarmTemInfo.alarmTit.length > 200) {
      this.$Message.error('模板标题内容不能超过200');
      return;
    }
    // if (!alarmTemInfo.alarmMark) {
    //   this.$Message.error('模板备注内容不能为空');
    //   return;
    // }
    if (alarmTemInfo.alarmMark.length > 200) {
      this.$Message.error('模板备注内容不能超过200');
      return;
    }
    const paramArry: any[] = [];
    for (let i = 0, len = selParam.length; i < len; i ++) {
      if (!selParam[i]) {
        this.$Message.error('参数未选择完整,无法提交;');
        return;
      }
      let paramName = '';
      this.paramList.map((ele: any) => {
        if (ele.id === selParam[i]) {
          paramName = ele.name;
          paramNameArr.push(ele.name);
        }
      });
      const str = alarmTemInfo.pointTypeName + '_' + pointName + '_' + paramName;
      paramArry.push(str);
    }
    let formula = modelFormula;
    let modelContent: any[] = [];
    modelContent = useVarList.map((ele: any, i: number) => {
      const contentLi: any = {};
      formula = this.transStr(formula, ele.name, paramArry[i]);
      contentLi[ele.name] = pointName + '@' + paramNameArr[i];
      contentLi.ids = {
        pointsValue: pointId,
        paramsValue: selParam[i],
      };
      contentLi.replaceName = '';
      return contentLi;
    });
    modelContent.map((ele: any) => {
      ele.replaceName = formula;
    });
    const content = {
      pointType: {
        title: '采集点类型',
        content: alarmTemInfo.pointTypeName,
      },
      point: {
        title: '采集点.参数',
        content: pointParam,
      },
      currentTime: {
        title: '当前时间',
        content: alarmTemInfo.currTime,
      },
      position: {
        title: '位置',
        content: alarmTemInfo.locationName,
      },
      project: {
        title: '报警项目',
        content: alarmType === '1' ? '预警' : '报警',
      },
      title: alarmTemInfo.alarmTit,
      comment: alarmTemInfo.alarmMark,
    };
    const backendData: any = {
      modelId, // 模型id
      viewToolId: appId, // 应用id
      pointId, // 采集点id
      paramId: selParam.join(','), // 参数id
      modelRule: JSON.stringify(ifConList), // 公式
      modelContent: JSON.stringify(modelContent), // 预留字段,
      warnTemplateId: alarmTem, // 模板id
      content : JSON.stringify(content), // 模板内容
      warnTitle: alarmTemInfo.alarmTit, // 标题
      warnRemark: alarmTemInfo.alarmMark, // 备注
      warn: alarmType, // 报警方式
      warnType: alarmPat.join(','), // 微信, kk
      pointTypeId:  pointType, // 采集点类型id
    };
    if (this.pageActTit === '设置') {
      backendData.id = this.EditId;
      modalManageApi.setModalApp(backendData).then(() => {
        this.$Message.success('保存成功');
        this.linkTimer = setTimeout(() => {
          history.back();
          this.linkTimer = null;
        }, 2000);
      });
      return;
    }
    modalManageApi.addModalApp(backendData).then(() => {
      this.$Message.success('保存成功');
      this.linkTimer = setTimeout(() => {
        this.$router.push('modelManage');
        this.linkTimer = null;
      }, 2000);
    });
  }

  private transStr(str: any, index: string , newStr: string): string {
    let returnStr = str;
    if (str.indexOf(index) !== -1) {
      returnStr =  str.replace(index, newStr);
    }
    if (returnStr.indexOf(index) !== -1) {
      return this.transStr(returnStr, index, newStr);
    }
    return returnStr;
  }
}
</script>
