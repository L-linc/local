<template>
  <div class="model-detail">
    <div  class="title-name">{{titleName}}</div>
    <div class="firstLevel set-list" style="overflow: auto">
        
        <div>
          <p>如果</p>
          <div v-for="(item,i) in condList" :key="i" style=" margin-bottom: 10px; ">
            <span :class='{ active: ele.type === "select" }' :style="'margin-left:' + (j === 0 ? (ele.type === 'select' ? ((ele.level - 1) * 180  + 10) : (ele.level * 180 + 20)) : '') + 'px'" v-for="(ele,j) in item" :key="j">
              <span style="margin-left: 10px">{{ele.value}}</span>
            </span>
          </div>
        </div>
      <!-- <Form :model="formTop" label-position="top" class="detail-top word-position">
        <FormItem label="那么">
          <div class="bool">
            输入
            <span>true</span>
          </div>
        </FormItem>
        <FormItem label="否则">
          <div class="bool">
            输出
            <span>false</span>
          </div>
        </FormItem>
      </Form> -->
    </div>
    <div class="secondLevel set-list">
      <Form
        :model="formLeft"
        label-position="left"
        :label-width="100"
        class="detail-top"
        style="width: 360px"
      >
        <div class="title-style">模型应用</div>
        <FormItem label="请选择应用：">
          <Select v-model="applicationValue" @on-change="getLogicValue">
            <Option
              v-for="item in applicationValues"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
      </Form>
    </div>
    <div class="thirdLevel set-list">
      <div class="title-style" >配置变量</div>
      <!-- 配置变量1 -->
      <div v-for="(item, index) in items" :key="index">
        <div class="config-name">{{item.name}}</div>
        <Form :model="formLeft" label-position="right" :label-width="100" class="detail-top">
          <FormItem label="采集点类型：" class="config-var">
            <Select :disabled="index !== 0" v-model="item.pointsTypeValue" @on-change="getPointsTypeValue(item.pointsTypeValue, index)">
              <Option
                v-for="item in pointsTypeValues"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="采集点：" class="config-var">
            <Select v-model="item.pointsValue" @on-change="getPointsValue(item.pointsValue, index)">
              <Option
                v-for="item in item.pointsValues"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="参数：" class="config-var">
            <Select v-model="item.paramsValue" @on-change="getParamsValue(item.paramsValue, index)">
              <Option
                v-for="item in item.paramsValues"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Form>
        <!-- <div class="config-name">value</div> -->
        <Form :model="formLeft" label-position="right" :label-width="100" class="detail-top clearfix">
          <!-- <FormItem label="变量：" class="config-var">
            <Input v-model="item.varValue" placeholder="请输入"/>
          </FormItem> -->
        </Form>
      </div>           <!-- 公式展示部分 -->
        <Form v-show="isShowFomlua" :model="formLeft" label-position="right" :label-width="100" class="detail-top clearfix">
            <FormItem  class="fomlua-content" v-for="(item, index) in items" :key="index">
              <span>{{item.name}}&nbsp;&nbsp;等于&nbsp;&nbsp;{{item.pointsTypeValueName}}_{{item.pointsValueName}}.{{item.paramsValueName}}</span>
              <br>
              <!-- <span>value&nbsp;&nbsp;等于&nbsp;&nbsp;{{item.varValue}}</span> -->
          </FormItem>
        </Form>
 
    </div>

    <!-- 配置参数结束 -->
    <div class="fourLevel set-list">
      <div class="title-style">报警设置</div>
      <Form :model="formItem" :label-width="80" label-position="left">
        <FormItem label="报警类型" style="width: 250px;">
            <RadioGroup v-model="formItem.radio" @on-change="changeRadioStatus(formItem.radio)">
                <Radio label="2">报警</Radio>
                <Radio label="1">预警</Radio>
            </RadioGroup>
        </FormItem>
        <FormItem label="报警方式" style="width: 250px;" class="check-list">
          <CheckboxGroup v-model="checkboxValue">
            <Checkbox label="微信"></Checkbox>
            <Checkbox label="KK"></Checkbox>
            <Checkbox label="邮件"></Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="报警模板" style="width: 360px;">
          <Select v-model="modelValue" @on-change="getModelValue(modelValue)">
            <Option
              v-for="item in modelValues"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
      </Form>
      <ul style=" height: 287px;" class="name-des">
        <li>
          <span>标题</span>
          <div v-if="isEidtTitle" >
            <p :title="headTitle" class="name-des-edit">{{headTitle}}</p>
            <p class="name-des-edit" @click.stop="editTitle" style="color: #3B72A8">编辑</p>
          </div>
          <Input :maxlength="200" v-model="headTitle" v-else/>
        </li>
        <li>
          <!-- 采集点类型 -->
          <span>{{element.pointType.title}}</span>
          <div>{{element.pointType.content}}</div>
        </li>
        <li>
          <!-- 采集点 , 参数点-->
          <span>{{element.point.title}}</span>
          <div>{{element.point.content}}</div>
        </li>
        <li>
          <!-- 当前时间-->
          <span>{{element.currentTime.title}}</span>
          <div>{{element.currentTime.content}}</div>
        </li>
        <li>
          <!-- 位置 -->
          <span>{{element.position.title}}</span>
          <div>{{element.position.content}}</div>
        </li>
        <li>
          <!-- 报警项目 -->
          <span>{{element.project.title}}</span>
          <div>{{element.project.content}}</div>
        </li>
        <li>
          <span>备注</span>
          <div v-if="isEditCommet" :title="remark">
              
              <p :title="remark" class="name-des-edit" >{{remark}}</p>
              <p class="name-des-edit" @click.stop="editCommet" style="color: #3B72A8">编辑</p>
          </div>
          <Input :maxlength="200" v-model="remark"  v-else />
        </li>
      </ul>

      <Button @click="submit" type="primary" style="width: 120px; height: 42px; marginLeft: 112px;marginTop: 90px;">
        <span>保存</span>
      </Button>
    </div>

  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import './appCenter.less';
import modalManageApi from '@/api/modalManage.ts';
export default Vue.extend({
  name: 'modelManage',
  data() {
    return {
      titleName: '',
      isShowFomlua: false,
      condList1: '[[{"type":"select","value":"And","level":1},{"type":"condition","value":"0.1u","level":1},{"type":"symType","value":"","level":1},{"type":"compare","value":"大于等于","level":1},{"type":"valType","value":"1","level":1,"showInput":false},{"type":"symType","level":1}],[{"type":"select","value":"请输入条件","level":2},{"type":"condition","value":"0.1u","level":2},{"type":"symType","value":"+","level":2,"symVla":"+"},{"type":"countType","value":"3","level":2,"showInput":false},{"type":"symType","level":2},{"type":"compare","value":"大于等于","level":2},{"type":"valType","value":"2","level":2,"showInput":false},{"type":"symType","level":2}]]',
      condList: [],
      items: [
        // {
        //   name: '',
        //   pointsTypeValue: '',// '1e9720aa29f5060bc4c69e73360a9bd',
        //   pointsValue: '',
        //   paramsValue: '',
        //   varValue: '',
        // },
      ],
      isEidtTitle: true,
      isEditCommet: true,
      formItem: {
        radio: '',
        select: '',
        checkbox: [],
      },
      formLeft: {
        input1: '',
        input2: '',
        input3: '',
      },
      formRight: {
        input1: '',
        input2: '',
        input3: '',
      },
      formTop: {
        input1: '',
        input2: '',
        input3: '',
      },
      logicValue: '0',
      logicValues: [
        // 显示用label, id等隐藏数据放到value;
        {value: '0', label: 'And'},
        {value: '1', label: 'Or'},
        {value: '2', label: 'Add Condition'},
        {value: '3', label: 'Add CO-condition'},
        {value: '4', label: 'Copy condition'},
        {value: '5', label: 'Paste condition'},
        {value: '6', label: 'Detele'},
      ],
      applicationValue: '0',
      applicationValues: [
        // {value: '0', label: '氯气监测'},
        // {value: '1', label: 'HPCP'}
      ],
      pointsTypeValue: '0',
      pointsTypeValues: [
        // {value: '0', label: 'C12'},
        // {value: '1', label: 'particle'},
        // {value: '2', label: 'hpcp'}
      ],
      pointsValue: '0',
      pointsValues: [
        // {value: '0', label: 'DOD-02-STK200-03'},
      ],
      paramsValue: '0',
      paramsValues: [
        // {value: '0', label: 'C12'},
      ],
      modelValue: '',
      modelValues: [
        // {value: '0',label: '1'},
        // {value: '1',label: '2'}
      ],
      modelContent: [],
      modelAlarmContent: {},
      element: {
        pointType: {
          title: '',
          content: '',
        },
        point: {
          title: '',
          content: '',
        },
        currentTime: {
          title: '',
          content: new Date(),
        },
        position: {
          title: '',
          content: '',
        },
        project: {
          title: '',
          content: '',
        },
      },
      varValue: '',
      checkboxValue: [],
      pointCollection: [],
      headTitle: '我是标题',
      remark: '我是备注',
      varListArr: [],
      modelId: '',
      status: '',
      recordId: '',
      pointIdHub: {},
      expression: '', // 存储公式的字段
    };
  },
  computed: {
    totalParams() {
      return  {
        // logicValue: (this as any).logicValue,
        viewToolId: (this as any).applicationValue || '', // 应用id
        // pointsTypeValue: (this as any).pointsTypeValue,
        pointId: (this as any).pointsValue || '', // 采集点id
        paramsId: (this as any).paramsValue || '', // 参数id
        // varValue: (this as any).varValue, // value
        warnType: (this as any).checkboxValue || '', // 微信, kk, 邮件
        content: (this as any).element || '', // 模板内容
        warnTitle: (this as any).headTitle || '', // 标题
        warnRemark: (this as any).remark || '', // 备注
      };
    },
  },
  methods: {
    // 获取当前时间,转化为2019-01-01
    getCurrentYearMonthDay(time: any) {
      const date: any = new Date(time);
      const month: any = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
      const strDate = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      return `${date.getFullYear()}-${month}-${strDate}`;
    },
    changeRadioStatus(value: any) {
      switch (value) {
        case '1':
          (this as any).element.project.content = '预警';
          break;
        case '2':
          (this as any).element.project.content = '报警';
          break;
        default:
          (this as any).element.project.content = '';
      }
    },
    getLogicValue() {
      // console.log();
    },

    // 获取报警模板
    async getAlarmModel() {
      const result = await modalManageApi.getAlarmModel();
      const data = result && result.data || [];
      const modelValues = data.map(({id = '', title = ''}: any) => {
        return {
          value: id,
          label: title,
        };
      });
      (this as any).modelValues = modelValues;
      (this as any).modelValue = modelValues[0].value;
      (this as any).modelContent = data;
      (this as any).getModelValue((this as any).modelValue);
    },
    getModelValue(data: any) {
      if (!data) {
        return;
      }
      const element = (this as any).modelContent.find((item: any) => {
        return item.id === data;
      });
      // (this as any).modelAlarmContent = element;
      (this as any).element.pointType.title = element.pointType.title;
      (this as any).element.point.title = element.point.title;
      (this as any).element.currentTime.title = element.currentTime.title;
      (this as any).element.position.title = element.position.title;
      (this as any).element.project.title = element.project.title;

    },
    // 获取所有采集应用;
    async getAllApplication() {
      const result = await modalManageApi.getAllApplication();
      const data = result && result.data || [];
      const applicationValues = data.map(({id = '', name = ''}: any) => {
        return {
          value: id,
          label: name,
        };
      });
      (this as any).applicationValues = applicationValues;
      (this as any).applicationValues.unshift({value: '', label: '请选择'});
    },
    // 获取采集类型
    getPointsTypeValue(id1: any, key: any) {
      if (!id1) {
        return;
      }
      (this as any).isShowFomlua = true;
      (this as any).items[key].pointsValueName = '';
      (this as any).items[key].paramsValueName = '';
      (this as any).element.point.content = ''; // 将point名称设置空的
      const element = (this as any).pointCollection.find((item: any) => {
        (this as any).element.pointType.content = item.name;
        (this as any).items.forEach((item1: any, index: any) => {
          (this as any).items[index].pointsTypeValueName = item.name;
        });
        return item.id === id1;
      });
      // debugger
      // 采集点的数据
      const pointsValues: any = element.points.map(({id = '', name = ''}: any) => {
        return {
          value: id,
          label: name,
        };
      });
      // 参数的数据
      const paramsValues = element.params.map(({id = '', name = ''}: any) => {
        return {
          value: id,
          label: name,
        };
      });
      if (key === 0) {
        // for (let i = 0; i < (this as any).items.length; i++) {
        //   (this as any).items[i].pointsValues = pointsValues;
        //   (this as any).items[i].paramsValues = paramsValues;
        //   (this as any).items[i].pointsTypeValue = id1;
        // }
        for (const i of (this as any).items) {
          i.pointsValues = pointsValues;
          i.paramsValues = paramsValues;
          i.pointsTypeValue = id1;
        }
      }
    },
    // 获取采集点
    getPointsValue(id1: any, key: any) {
      const element = (this as any).items[key];
      element.pointsValues.forEach((item: any) => {
        if (item.value === id1) {
          element.pointsValueName = item.label;
        }
      });
      (this as any).setSplitModelPont_Params(key);
      // 获取采集点id
      (this as any).pointIdHub[key] = id1;
      const ids = Object.values((this as any).pointIdHub);
      const setId = new Set(ids);
      (this as any).getPointNameFromPointId([...setId]);
    },
    // 获取参数
    getParamsValue(id1: any, key: any) {
      const element = (this as any).items[key];
      element.paramsValues.forEach((item: any) => {
        if (item.value === id1) {
          element.paramsValueName = item.label;
        }
      });
      (this as any).setSplitModelPont_Params(key);
    },
    // 根据采集点id获取位置信息
    async getPointNameFromPointId(pointIdArray: any) {
      const res = await modalManageApi.getPointNameFromPointId({
        deviceIds: pointIdArray,
        locationType: 5,
      });
      (this as any).element.position.content = res.data.map((item: any) => {
        item.locationName = item.locationName.replace(/\//g, '-');
        return item.locationName;
      }).join(',');
    },
    // 获取所有采集点信息
    async getPointTypeParams() {
      const result = await modalManageApi.getPointTypeParams();
      const data = result && result.data || [];
      // 采集点类型的数据
      const pointsTypeValues = data.map(({id = '', name = ''}: any) => {
        return {
          value: id,
          label: name,
        };
      });
      (this as any).pointsTypeValues = pointsTypeValues;
      (this as any).pointCollection = data;
      if ((this as any).status === 'edit') {
        const varArrs = (this as any).varListArr; // varListArr表示增加的多个变量的字段列表
        varArrs.forEach((varArr: any, key: any) => {
          (this as any).pointCollection.forEach((item1: any) => {
            item1.points.forEach((item2: any) => {
              if (item2.id === varArr.ids.pointsValue) {
                (this as any).items[key].pointsTypeValue = item1.id;
                (this as any).items[key].pointsTypeValueName = item1.name;
                (this as any).items[key].pointsValue = varArr.ids.pointsValue;
                (this as any).items[key].paramsValue = varArr.ids.paramsValue;
                (this as any).items[key].varValue = varArr.ids.value;
                (this as any).getPointsTypeValue(item1.id, key);
                (this as any).getPointsValue(varArr.ids.pointsValue, key);
                (this as any).getParamsValue(varArr.ids.paramsValue, key);

              }
            });
          });
        });
      }

    },
    editTitle() {
      (this as any).isEidtTitle = false;
    },
    editCommet() {
      (this as any).isEditCommet = false;
    },
    // 将1, 2, 3转化为 [微信, kk, 邮件]
    transformCodeToSoft(codeString: string) {
      const codeArray: any = codeString.split(',');
      const array: any = [];
      codeArray.forEach((item: any) => {
        if (item === '1') {
          array.push('微信');
        } else if (item === '2') {
          array.push('KK');
        } else  if (item === '3') {
          array.push('邮件');
        }
      });
      return array;
    },
    transformSoftToCode(codeArray: any) {
      const stringArr: any = [];
      codeArray.forEach((item: any) => {
        if ( item === '微信') {
          stringArr.push('1');
        } else if (item === 'KK') {
          stringArr.push('2');
        } else if (item === '邮件') {
          stringArr.push('3');
        }
      });
      return stringArr.join(',');
    },
    // 一个专门用来拼接模板的函数
    setSplitModelPont_Params(key: any) {
      const pointNameList: any = (this as any).items.map((item: any) => item.pointsValueName);
      const paramsList: any = (this as any).items.map((item: any) => item.paramsValueName);
      let pointParams: any = '';

      for (let i = 0; i < pointNameList.length; i++) {
        pointParams = `${pointParams}${pointNameList[i]}.${paramsList[i]};`;
      }
      (this as any).items[key].expression = `${(this as any).items[key].pointsTypeValueName}_${(this as any).items[key].pointsValueName}.${(this as any).items[key].paramsValueName}`;
      (this as any).element.point.content = pointParams;
    },
    // 递归替换字符串
    replaceString() {
      const replaceName = '';
      const items = (this as any).items;
      items.forEach((item: any) => {
        (this as any).expression = (this as any).replaceName((this as any).expression, item.name, item.expression);
      });
      return (this as any).expression;
    },
    replaceName(repStr: string, rgExp: string, replaceText: string) {
      const str = repStr.replace(rgExp, replaceText);
      // if ( str.indexOf(rgExp) != -1 ) {
      //     str = (this as any).replaceName(str, rgExp, replaceText);
      // }
      return str;
    },

    // 初始化页面, 清空模板内容
    initClearModelContent() {
      (this as any).element.pointType.content = '';
      (this as any).element.point.content = '';
      (this as any).element.position.content = '';
      (this as any).element.project.content = '';
    },
    submit() {
      // 提交的时候要进行模型替换, 将公式里的变量全部替换为实际参数;
      // let replaceName = (this as any).replaceString();
      // return;
      const modelContent: any = [];
      const pointsValue: any = [];
      const paramsValue: any = [];
      (this as any).items.forEach((item: any) => {
        const key = item.name;
        const paramsContent: any = {};
        paramsContent[key] = `${item.pointsValueName}@${item.paramsValueName}`;
        paramsContent.ids = {
          pointsValue: item.pointsValue,
          paramsValue: item.paramsValue,
          value: item.varValue,
        };
        paramsContent.replaceName = (this as any).replaceString(); // 提交的时候要进行模型替换, 将公式里的变量全部替换为实际参数;
        pointsValue.push(item.pointsValue);
        paramsValue.push(item.paramsValue);
        modelContent.push(paramsContent);
      });
      const backendData: any = {
        modelId: (this as any).modelId, // 模型id
        viewToolId: (this as any).applicationValue, // 应用id
        pointId: pointsValue.join(','), // 采集点id
        paramId: paramsValue.join(','), // 参数id
        modelRule: JSON.stringify((this as any).condList), // 公式
        modelContent: JSON.stringify(modelContent), // 预留字段,
        warnTemplateId: (this as any).modelValue, // 模板id
        content : JSON.stringify((this as any).element), // 模板内容
        warnTitle: (this as any).headTitle, // 标题
        warnRemark: (this as any).remark, // 备注
        warn: Number((this as any).formItem.radio), // 报警方式
        warnType: (this as any).transformSoftToCode((this as any).checkboxValue), // 微信, kk
      };
      if ((this as any).status === 'jump') {
        modalManageApi.setModalApp(backendData).then(() => {
          this.$router.push('alarmCenter');
        });
        return;
      }
      if ((this as any).status === 'edit') {
        // 编辑状态有本条记录id
        backendData.id = (this as any).recordId;
      }
      const routeParmas: any = {name: 'modelManage', params: {status: (this as any).status, params: backendData}};
      this.$router.push(routeParmas);
    },
  },
  mounted() {
    // 页面被缓存, 只执行一次
    document.addEventListener('click', (e: any) => {
      if (e.target.nodeName === 'INPUT') {
        return;
      }
      (this as any).isEidtTitle = true;
      (this as any).isEditCommet = true;
    });
  },
  activated() {
    // 页面被缓存, 每次执行这个操作;
    // 获取所有应用
    (this as any).getAllApplication();
    // 获取报警模板
    (this as any).getAlarmModel();
    // 需要判断是新建还是设置状态;
    if (JSON.stringify(this.$route.params) === '{}') {
      return;
    }
    const data: any = this.$route.params;
    if (data.status === 'edit') {
      (this as any).titleName = '设置';
      (this as any).isShowFomlua = true;
      (this as any).varListArr = JSON.parse(data.params.modelContent);
      (this as any).applicationValue = data.params.viewToolId;
      (this as any).recordId = data.params.id;
      (this as any).formItem.radio = String(data.params.warn) || '0';
      (this as any).status = 'edit';
      (this as any).modelId = data.params.modelId;
      (this as any).checkboxValue = data.params.alarmSet.split(',');
      (this as any).remark = data.params.remark;
      (this as any).headTitle = data.params.headTitle;
      // 编辑状态默认给选中值;
      (this as any).changeRadioStatus((this as any).formItem.radio);
    } else if (data.status === 'add') {
      (this as any).titleName = '添加应用规则';
      (this as any).isShowFomlua = false;
      (this as any).initClearModelContent();
      // 新增进入的时候,要清空掉之前保留的字段;
      (this as any).applicationValue = '';
      (this as any).modelId = data.modelId;
      // (this as any).varListArr = JSON.parse(data.params.modelContent);
      (this as any).applicationValue = '';
      (this as any).formItem.radio = '';
      (this as any).checkboxValue = [];
      (this as any).remark = '默认';
      (this as any).headTitle = '默认';
      (this as any).status = 'add';
    } else {
      // 当从报警页面跳转过来的时候执行的操作;
      (this as any).titleName = '设置';
      (this as any).isShowFomlua = true; // 规则
      (this as any).varListArr = JSON.parse(data.params.modelContent); // 自定义内容
      (this as any).applicationValue = data.params.viewToolId; // 应用模型id
      (this as any).recordId = data.params.id; // 本条数据Id
      (this as any).formItem.radio = String(data.params.warn) || '0'; // 设置预警
      (this as any).status = 'jump';
      (this as any).modelId = data.params.modelId; // 模型id
      (this as any).checkboxValue = (this as any).transformCodeToSoft(data.params.warnType);
      (this as any).remark = data.params.warnRemark; // 备注
      (this as any).headTitle = data.params.warnTitle; // 标题
      // 编辑状态默认给选中值;
      (this as any).changeRadioStatus((this as any).formItem.radio);
    }
    (this as any).getPointTypeParams();
    modalManageApi.getModelDetailFromModelId((this as any).modelId).then((res: any) => {
      // 根据id获取字段名;
      const result: any = res && res.data || [];
      let paramsNames: any = [];
      if (!result.useField) {
        paramsNames = [];
      } else {
        const useField = JSON.parse(result.useField);
        useField.forEach((item: any) => {
          // paramsNames.push(item.name.slice(item.name.indexOf('$')));
          paramsNames.push(item.name.slice(item.name));
        });
      }
      (this as any).expression = result.content; // 公式名称;
      (this as any).condList = JSON.parse(result.formula);
      (this as any).items = [];
      paramsNames.forEach((item: any) => {
        (this as any).items.push({
          name: item, // 变量名称
          pointsTypeValue: '', // 采集点类型名称id
          pointsTypeValueName: '', // 采集点类型名称
          pointsValue: '', // 采集点id
          pointsValueName: '', // 采集点名称
          pointsValues: [], // 所有采集点id列表
          paramsValue: '', // 参数id
          paramsValueName: '', // 参数名称
          paramsValues: [], // 参数id列表
          expression: '',
          varValue: '',
        });
      });
    });
    // 生成当前时间
    (this as any).element.currentTime.content = (this as any).getCurrentYearMonthDay(new Date());
    // 生成报警项目
  },
});
</script>
<style lang="less">
.config-name {
  padding-left: 21px;
  font-size: 14px;
  background-image: url('~@/assets/images/alarmCenter/shezhi.png');
  background-repeat: no-repeat;
}
.active {
  display: inline-block;
  width: 200px;
  border:1px solid rgba(220,229,232,1)
}
.model-detail {
  text-align: left;
  margin-left: 20px;
  font-size: 14px;
  .title-name {
    font-size: 18px;
    font-family: MicrosoftYaHei;
    font-weight: 400;
    color: rgba(153,153,153,1);
    line-height: 29px;
    margin-bottom: 20px;
  }
  .set-list {
    margin-bottom: 20px;
  }
}
.clearfix:after{/*伪元素是行内元素 正常浏览器清除浮动方法*/
    content: "";
    display: block;
    height: 0;
    clear:both;
    visibility: hidden;
}
.title-style {
  font-size:16px;
  font-family:MicrosoftYaHei;
  font-weight:bold;
  color:rgba(51,51,51,1);
}
.firstLevel {
  width: 1126px;
  padding: 24px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(234, 238, 242, 1);
  border-radius: 2px 2px 0px 0px;
  .word-des {
    position: absolute;
    top: 23px;
    right: -97px;
  }
  .detail-top {
    width: 360px;
    overflow: hidden;
    .bool {
      width: 360px;
      height: 36px;
      padding: 6px 11px 0px 11px;
      display: inline-block;
      text-align: left;
      background: rgba(252, 254, 255, 1);
      border: 1px dashed rgba(220, 229, 232, 1);
      border-radius: 2px;
      span {
        font-size: 14px;
        font-family: MicrosoftYaHei;
        font-weight: 400;
        color: rgba(59, 114, 168, 1);
      }
    }
  }
  .word-position {
    .ivu-form-item-label {
      float: left;
    }
  }
}
.secondLevel {
  width: 1126px;
  padding: 24px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(234, 238, 242, 1);
  border-radius: 2px 2px 0px 0px;
}
.thirdLevel {
  width: 1126px;
  // height: 250px;
  padding: 24px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(234, 238, 242, 1);
  border-radius: 2px 2px 0px 0px;
  .config-var {
    width: 360px;
    float: left;
  }
  .fomlua-content {
    background:rgba(252,254,255,1);
    border:1px solid rgba(234,238,242,1);
    .ivu-form-item-content {
      margin-left: 20px !important;
    }
  }
  .ivu-form .ivu-form-item-label {
    padding: 10px 26px 10px 0;
  }

  .name-value {
    background:rgba(252,254,255,1);
    border:1px solid rgba(234,238,242,1);
    border-radius:2px;
    width: 800px; 
    height: 91px; 
    padding: 20px;
    .model-value {
      padding-top: 20px;
    }
  }
}
.fourLevel {
  width: 1126px;
  padding: 24px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(234, 238, 242, 1);
  border-radius: 2px 2px 0px 0px;
  .check-list {
    .ivu-form-item-content {
      margin-left: 0 !important;
    }
  }
  .name-des {
    width: 800px;
    height: 287px;
    list-style: none;
    background:rgba(252,254,255,1);
    border:1px solid rgba(234,238,242,1);
    li {
      height: 35px;
      position: relative;
      span {
        display: inline-block;
        font-size:14px;
        font-family:MicrosoftYaHei;
        font-weight:400;
        color:rgba(153,153,153,1);
        line-height:28px;
        position: absolute;
        width: 100px;
        text-align: right;
      }
      div {
        margin-left: 100px;
        line-height: 35px;
        padding-left: 30px;
      }
      p {
        display: inline-block;
      }

    }
    .name-des-edit {
      display: inline-block; 
      max-width: 200px; 
      height: 25px;
      overflow: hidden
    }
  }
}
</style>
