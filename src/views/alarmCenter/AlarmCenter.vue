<template>
  <div class="alarmCenter" id="alarmCenter">
    <!-- <div class="alarm_notice">
      <div>
        <p class="notice_title">公告</p>
        <div class="notice_wrap">
          <p v-for="(notice, i) in noticeList" :key="i" class="notice_list">{{notice}}</p>
        </div>
      </div>
    </div> -->
    <div class="alarm_class">
      <div class="class_item" v-for="(item, i) in classItemList" :key="i" @click="go(item)">
        <div class="item_left" :class="item.icon"></div>
        <div class="item_right">
          <span style="font-size:36px;">{{item.total}}</span>
          <span style="font-size:16px;color: #999;">{{item.title}} (个)</span>
        </div>
        <!-- <div class="item_type">
          <span>{{item.title}}</span>
          <i :class="item.icon"></i>
        </div>
        <div class="item_total">
          <span style="font-size:30px;">{{item.total}}</span>
          <span>个</span>
        </div> -->
      </div>
    </div>
    <div class="re_top">
      <div class="re_select">
          <span>设备:</span>
          <Select v-model="deviceModel" style="width:160px;margin: 0 12px;" filterable>
            <Option value="">请选择</Option>
            <Option v-for="item in deviceList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
          <span>异常类型:</span>
          <Select v-model="warningModel" style="width:160px;margin: 0 12px;">
            <Option value="">全部</Option>
            <Option v-for="item in warningList" :value="item.id" :key="item.id">{{ item.label }}</Option>
          </Select>
      </div>
      <div class="re_time">
          <span>起止时间:</span>
          <DatePicker v-model="startTime" type="datetime" format="yyyy-MM-dd HH:mm" placeholder="选择开始时间" :options="startDateOption" style="width: 170px;margin-left:12px;margin-right:2px;"></DatePicker>
          <span>一</span>
          <DatePicker v-model="endTime" type="datetime" format="yyyy-MM-dd HH:mm" placeholder="选择结束时间" :options="endDateOption" style="width: 170px;margin-left:2px;margin-right:12px;"></DatePicker>
      </div>
      <div class="re_button">
          <Button type="primary" style="margin-right: 6px;" @click="search">查询</Button>
          <Button type="primary" style="margin-right: 6px;" @click="reset">重置</Button>
          <Button type="primary" @click="exportData">导出</Button>
      </div>           
    </div>
    <div class="alarm_box">
      <div class="re_contain">
          <Table :columns="columns" :data="tableData"></Table>
      </div>
      <div class="re_footer">
        <!-- <div class="footer_total">当前总记录 {{total}} 条, 每页显示<input type="text" class="footer_input" v-model="pageSize"/>条</div>
        <div class="footer_page">
          <Page @on-change="getTable" @on-page-size-change="changePageSize" prev-text="上一页" next-text="下一页" style="float:left;margin-right:12px" :total="total" :current="pageIndex"/>
          共 {{totalPage}} 页, 到第<input type="text" class="footer_input" v-model="pageSize"/>页
          <Button type="primary" @click="goPage" style="float:right;margin-left:4px;">确定</Button>
        </div> -->
        <div class="footer_page">
          <Page @on-change="getPage" @on-page-size-change="changePageSize" prev-text="上一页" next-text="下一页" style="margin-right:12px" :total="total" :current="pageIndex" show-total show-elevator show-sizer/>
          <!-- <Button type="primary" @click="goPage" style="float:right;margin-left:4px;">确定</Button> -->
        </div>
      </div>
    </div>
    <Input v-has="'SYS_ALARMCENTER_REMARK_MOD'" ref="editInput" @on-blur="ok" @on-enter="oks" v-show="showEdit" v-model="editValue" style="position: absolute;width: 164px;padding-left:2px;" :style="positionStyle"/>
  </div>
</template>
<script lang="ts">
import './alarmCenter.less';
import Vue from 'vue';
import alarmCenterApi from '@/api/alarmCenter.ts';
import * as util from '../../config/utils';
import {Component, Prop} from 'vue-property-decorator';
@Component
export default class AlarmCenter extends Vue {
  @Prop({
      type: Array,
      default: () => {
        return [];
      },
  })
  private propTabs: any;  //  props

  // data
  private deviceModel: string = '';
  private warningModel: string|number = '';
  private alarmId: string = '';
  private startTime: any = '';
  private endTime: any = '';
  private deviceList: any[] = [];
  private warningList: any[] = [
    {id: 1, label: '预警'},
    {id: 2, label: '报警'},
    {id: 3, label: '异常'},
  ];
  private type: number = 1;
  private alarmStatus: number = 1;
  private editValue: string = '';
  private showEdit: boolean = false;
  private columns: any[] = [];
  private tableData: any[] = [];
  private total: number = 0; // 总条数
  private pageSize: number = 10; // 默认每页条数
  private pageIndex: number = 1; // 当前页码
  private totalPage: number = 1; // 总页数
  private startDateOption: any = {};
  private endDateOption: any =  {};
  private edit: boolean = false;
  private positionStyle: any = {};
  private noticeList: any[] = [
    '公告......（滚动，显示Alarm，新建建模信息，新上监控点位，软件更新，维护）',
    '公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容',
    '公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容!',
    '公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容!',
    '公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容!',
    '公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容!',
    '公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容!',
    '公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容!',
    '公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容!',
    '公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容!',
  ];
  private classItemList: any[] = [
    {
      title: '采集点',
      icon: 'alarm_point',
      total: '0',
      change: '6-3',
      changeTab: '采集点列表',
    },
    {
      title: '应用',
      icon: 'alarm_app',
      total: '0',
      change: '4-3',
      changeTab: '应用管理',
    },
    {
      title: '报警',
      icon: 'alarm_alarm',
      total: '0',
    },
    {
      title: '异常',
      icon: 'alarm_abnormal',
      total: '0',
    },
  ];

  // life-cycle
  private created() {
    this.positionStyle = {
      top: '0',
      left: '0',
    };
    this.columns = [
      {
        title: '报警初始时间',
        key: 'startTime',
        align: 'center',
        width: '190px',
        render: (h: any, params: any): any => {
          return h('div', [
            params.row.children && params.row.children.length > 0 && h('icon', {
              style: {
                width: '16px',
                height: '16px',
                cursor: 'pointer',
              },
              class: (params.row.showChild ? ['alarm_less'] : ['alarm_more']),
              on: {
                click: () => {
                  this.showChildren(params.index);
                },
              },
            }),
            h('span', {
              style: {
                'display': 'inline-block',
                'vertical-align': 'middle',
                'width': 'calc(100% - 24px)',
                'padding-left': params.row.level > 1 ? (params.row.level * 8) + 'px' : '0px',
              },
            }, params.row.startTime),
          ]);
        },
      },
      {
        title: '报警结束时间',
        key: 'endTime',
        align: 'center',
        width: '160px',
        render: (h: any, params: any): any => {
          return params.row.alarmStatus === 1 ?  h('span', {attrs: {title: '----'}}, '----') : h('span', {attrs: {title: params.row.endTime}}, params.row.endTime);
        },
      },
      {
        title: '设备',
        key: 'deviceName',
        align: 'center',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.deviceName}}, params.row.deviceName);
        },
      },
      {
        title: '采集点类型',
        key: 'pointType',
        align: 'center',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.pointType}}, params.row.pointType);
        },
      },
      {
        title: '采集点',
        key: 'pointName',
        align: 'center',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.pointName}}, params.row.pointName);
        },
      },
      {
        title: '参数',
        key: 'paramName',
        align: 'center',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.paramName}}, params.row.paramName);
        },
      },
      {
        title: '实际值',
        key: 'value',
        align: 'center',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.value}}, params.row.value);
        },
      },
      {
        title: '公式',
        key: 'formula',
        align: 'center',
        render: (h: any, params: any): any => {
          return h('span', {attrs: {title: params.row.formula}}, params.row.formula);
        },
      },
      {
        title: '事件内容',
        key: 'event',
        align: 'center',
        width: '126px',
        render: (h: any, params: any): any => {
          let txt = '';
          for (const i of this.warningList) {
            if (i.id === params.row.alarmType) {
              txt = params.row.pointName + ' - ' + i.label;
            }
          }
          return h('div', [
            h('span', {attrs: {title: txt}}, txt),
          ]);
        },
      },
      {
        title: '注释',
        key: 'remark',
        align: 'center',
        width: '126px',
        render: (h: any, params: any): any => {
          // return h('Tooltip', // IE不支持
          return h('div',
            {
              attrs: {
                content: params.row.remark,
                // offset: -30, // 设置偏移量
                placement: 'bottom-end',
              },
            },
            [h('p', {
                attrs: {title: params.row.remark},
                class: ['re_remark'],
                style: {
                  cursor: 'pointer',
                },
                on: {
                  dblclick: (event: any) => {
                    this.showEdit = true;
                    this.alarmId = params.row.id;
                    const position = event.target.getBoundingClientRect();
                    this.editValue = params.row.remark;
                    const alarmCenter: any = document.getElementsByClassName('home_content_inner')[0];
                    const slider: any = document.getElementsByClassName('ivu-layout-sider-children')[0];
                    const len = slider.offsetWidth;
                    // document.documentElement.scrollTop: 页面滚动高度
                    // alarmCenter.scrollTop: 当前定位元素滚动高度
                    this.positionStyle = {
                      top: position.top - 127 + document.documentElement.scrollTop + alarmCenter.scrollTop + 'px', // 定位要减去头部,居中等共132
                      left: position.left - len + document.documentElement.scrollTop + alarmCenter.scrollLeft + 'px', // 定位要减去左侧栏 200
                    };
                    this.$nextTick(() => {
                      (this.$refs.editInput as any).focus();
                    });
                  },
                },
              }, params.row.remark,
            ),
          ]);
        },
      },
      {
        title: '操作',
        key: 'actions',
        align: 'right',
        width: '50px',
        render: (h: any, params: any): any => {
          if (params.row.alarmType === 3) {
            return h('span', '');
          } else {
             return h('div', [
              h('icon', {
                  class: ['re_setting'],
                  style: {
                    cursor: 'pointer',
                  },
                  on: {
                    click: () => {
                      this.setting(params.row);
                    },
                  },
                  directives: [{
                    name: 'has',
                    value: 'SYS_ALARMCENTER_APPMODEL_DETAIL',
                  }],
                },
              ),
            ]);
          }
        },
      },
    ];
    this.startDateOption = {
      disabledDate: (date: any) => date > new Date(this.$data.endTime) || date > new Date(),
    };
    this.endDateOption =  {
      disabledDate: (date: any) => date < new Date(this.$data.startTime) || date > new Date(),
    };
    this.getDeviceList();
    this.getTable();
  }

  private activated() {
    this.getTotal();
  }

  // methods

  // 获取面板统计接口
  private getTotal() {
    alarmCenterApi.alarmCenterStatistics().then((res: any) => {
      this.classItemList[0].total = !res.data.point ? 0 : res.data.point;
      this.classItemList[1].total = !res.data.app ? 0 : res.data.app;
      this.classItemList[2].total = !res.data.alarm ? 0 : res.data.alarm;
      this.classItemList[3].total = !res.data.offline ? 0 : res.data.offline;
    });
  }
  // 跳转,页面以及页签联动方法
  private go(c: any) {
    if (c.change) {
      this.$emit('props', c.change);
      let tab = 0;
      for (let i = 0; i < this.propTabs.length; i++) {
        if (this.propTabs[i].name === c.changeTab) {
          tab = i;
          break;
        }
      }
      this.$emit('prop', tab);
    } else {
      // 后面两个是刷新表格
      this.deviceModel = '';
      this.warningModel = '';
      this.startTime = '';
      this.endTime = '';
      this.pageIndex = 1;
      this.type = c.title === '报警' ? 2 : 3;
      this.getTable(this.type);
      this.getTotal();
    }
  }

  // 获取所有设备
  private getDeviceList() {
    alarmCenterApi.getDevice().then( (res: any) => {
      this.deviceList = res.data;
    });
  }

  // 获取报警记录列表
  private getTable(num?: number) {
    let params: any = {
      deviceId: this.deviceModel,
      alarmType: this.warningModel,
      page: this.pageIndex - 1,
      size: this.pageSize,
      startTime: this.startTime,
      endTime: this.endTime,
    };
    if (this.startTime !== '') {
      params.startTime = new Date(this.startTime).getTime();
    }
    if (this.endTime !== '') {
      params.endTime = new Date(this.endTime).getTime();
    }
    if (num) {
      params = {
        deviceId: this.deviceModel,
        alarmType: num,
        page: this.pageIndex - 1,
        size: this.pageSize,
        startTime: this.startTime,
        endTime: this.endTime,
        alarmStatus: this.alarmStatus,
      };
    }
    alarmCenterApi.searchAlarm(params).then( (res: any) => {
      const list = res.data.content || [];
      const tableData: any[] = [];
      list.map((ele: any, j: number) => {
        if (ele.data && ele.data.length > 0) {
          ele.data.map((parEle: any, i: number) => {
            const listLi: any = {
              startTime: ele.startTime,
              endTime: ele.endTime,
              pointType: ele.pointType,
              deviceName: ele.deviceName,
              pointName: ele.pointName,
              paramName: parEle.paramName,
              value: parEle.value,
              formula: ele.formula,
              // event: parEle.event,
              remark: ele.remark, // 显示点位的注释
              showChild: false,
              level: i === 0 ? 1 : 2,
              id: ele.id,
              useModelId: ele.useModelId,
              alarmType: ele.alarmType,
              alarmStatus: ele.alarmStatus,
            };
            if (i === 0) {
              listLi.children = [];
              tableData.push(listLi);
            } else {
              tableData[j].children.push(listLi);
            }
          });
        } else {
          tableData.push(ele);
        }
      });
      for (const i of tableData) {
        if (!i.remark) {
          i.remark = '请输入注释';
        } else {
          if (i.children && i.children.length > 0) {
            for (const j of i.children) {
              j.remark = '';
            }
          }
        }
      }
      this.tableData = tableData;
      this.total = res.data.totalElements;
    });
  }

  // 点击展开
  private showChildren(index: number) {
    if (!this.tableData[index].showChild) {
      this.tableData.splice(index + 1, 0 , ...this.tableData[index].children);
    } else {
      this.tableData.splice(index + 1, this.tableData[index].children.length);
    }
    this.tableData[index].showChild = !this.tableData[index].showChild;
  }

  // 点击设置
  private setting(data: any) {
    const param = {
      id: data.useModelId,
    };
    alarmCenterApi.goModel(param).then((res: any) => {
      const model = {
        change: '5-1',
        changeTab: '模型管理',
      };
      this.go(model);
      this.$router.push({name: 'modelManageDetail', query: { status: 'edit', ojbk: res.data}});
      const a: any = sessionStorage.getItem('oldTab');
      const b: any = sessionStorage.getItem('tabIndex');
      const c: any = JSON.stringify(res.data);
      const d: any = JSON.parse(a);
      d[b].current = c;
      sessionStorage.setItem('oldTab', JSON.stringify(d));
    });
  }

  // 失焦,enter事件
  private ok() {
    if (this.editValue.trim().length > 200) {
      this.$Message.success('只允许200个字符以内');
      return;
    }
    const param = {
      remark: this.editValue,
      id: this.alarmId,
    };
    alarmCenterApi.editRemark(param).then( (res: any) => {
      this.$Message.success('修改成功');
      this.getTable();
    });
    this.showEdit = false;
  }

  // enter事件
  private oks() {
    (this as any).$refs.editInput.blur();
  }

  // 搜索按钮
  private search() {
    this.pageIndex = 1;
    this.type = 1;
    this.getTable();
  }

  // 重置按钮
  private reset() {
    this.deviceModel = '';
    this.warningModel = '';
    this.startTime = '';
    this.endTime = '';
    this.pageIndex = 1;
    this.getTable();
  }

  // 切换页码
  private getPage(page: number) {
    this.pageIndex = page;
    (this.type === 2 || this.type === 3) ? this.getTable(this.type) : this.getTable();
  }

  // 切换条数
  private changePageSize(pagesize: number) {
    this.pageSize = pagesize;
    this.pageIndex = 1;
    (this.type === 2 || this.type === 3) ? this.getTable(this.type) : this.getTable();
  }

  // 导出数据
  private exportData() {
    let deviceId = this.deviceModel;
    let alarmType = this.warningModel;
    if (deviceId === undefined) {
      deviceId = '';
    }
    if (alarmType === undefined) {
      alarmType = '';
    }
    const startTime = this.startTime ? this.startTime.getTime() : '';
    const endTime = this.endTime ? this.endTime.getTime() : '';
    const token = `Bearer ` + util.getCookie('token');
    const link = `deviceId=${deviceId}&alarmType=${alarmType}&startTime=${startTime}&endTime=${endTime}`;
    let alink: any = document.createElement('a');
    alink.setAttribute('href', `/api/export/alarms?${link}&token=${token}`);
    document.body.appendChild(alink);
    alink.click();
    document.body.removeChild(alink);
    alink = null;
  }
}
</script>
