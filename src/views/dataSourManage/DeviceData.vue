<template>
  <div class="dvdata_wrap">
    <div class="export_wrap" v-has="'SYS_DATA_EXPORT'">
      <span>起止时间 : </span>
      <DatePicker v-model="startT" type="datetime" placeholder="请选择开始时间" style="width: 200px" :options="startDateOption"></DatePicker>
      <span> 一 </span>
      <DatePicker v-model="endT" type="datetime" placeholder="请选择结束时间" style="width: 200px;margin-right: 12px;" :options="endDateOption"></DatePicker>
      <Button type="primary" @click="() => exportFile(1)" class="export_btn">导出</Button>
      <Button type="primary" @click="() => exportFile(2)" class="export_btn export_btn_async">后台下载</Button>
    </div>
    <div class="wrap_top">
      <div class="tit_bar">
        <span class="tit_name">{{dvName}}</span>
        <Select filterable v-if="type === 'sensor'" v-model="pointId" @on-change="changePoint()" style="width: 200px;margin-right: 12px">
          <Option v-for="(ele,i) in pointsList" :value="ele.id" :key="i">{{ele.pointType.name}} - {{ele.name}}</Option>
        </Select>
        <Select filterable v-model="paramId" @on-change="changeParam" v-show="varList.length > 0">
          <Option v-for="(ele,i) in varList" :value="ele.name" :key="i">{{ele.name}}</Option>
        </Select>
        <span class="update_time">
          刷新时间：
          <Select v-model="wsInter" @on-change="changeUpRate">
            <Option value="3">3</Option>
            <Option value="5">5</Option>
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="30">30</Option>
          </Select>
        </span>
      </div>
      <!-- 多选才用下面的样式 -->
      <!-- <div v-if="varList && varList.length > 1" class="var_bar">
        <Checkbox
          :value="checkAll"
          @click.prevent.native="handleCheckAll">全选
        </Checkbox>
        <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
          <Checkbox v-for="(ele,i) in varList" :key="i" :label="ele.name">{{ele.name}}</Checkbox>
        </CheckboxGroup> 
      </div> -->
    </div>
    <!-- <div @click="closeWS">skskskkk</div> -->
    <div class="wrap_chart">
      <!-- <div v-if="varList.length > 1">
        <div :id="'chart' + i" v-for="(ele,i) in checkAllGroup" class="chart_bar" :key="i"></div>
      </div> -->
      <div>
        <div id='chart0' class="chart_bar chart_sig" ></div>
      </div>
    </div>
    <div class="wrap_table">
      <div class="wrap_title">时间: {{timestamps}}</div>
      <Table :columns="pointData" :data="fakeTable"></Table>
      <Table :columns="pointData" :data="pointTable" border :show-header="false" disabled-hover></Table>
    </div>
    <!-- <div class="wrap_con">
      <Table stripe :columns="columnsData" :data="tableData"></Table>
    </div> -->
  </div>
</template>

<script lang="ts">
import '../dataSourManage/devicesManage.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
import exportDataApi from '@/api/exportData.ts';
import * as util from '../../config/utils';
import echarts from 'echarts';
export default Vue.extend ({
  name: 'DeviceData',
  props: ['type', 'dvId'],
  created() {
    // this.chartInit(0, this.paramsList[0]);
    this.getPointList();
    this.changeType();
    // this.wsInit();
  },
  mounted() {
    // this.chartInit(0, this.paramsList[0]);
  },
  destroyed() {
    this.closeWS();
    if (this.wsTimer) {
      clearTimeout(this.wsTimer);
      this.wsTimer = null;
    }
    this.closeWST();
    if (this.wsTimers) {
      clearTimeout(this.wsTimers);
      this.wsTimers = null;
    }
  },
  deactivated() {
    this.closeWS();
    if (this.wsTimer) {
      clearTimeout(this.wsTimer);
      this.wsTimer = null;
    }
    this.closeWST();
    if (this.wsTimers) {
      clearTimeout(this.wsTimers);
      this.wsTimers = null;
    }
  },
  watch: {
    checkAllGroup(newValue) {
      this.getDataList();
      this.paramsList = [];
    },
    dvId() {
      this.varList = [];
      this.paramId = '';
      this.getPointList();
      // this.checkAll = false;
    },
    type() {
      this.changeType();
    },
  },
  data() {
    return {
      dvName: '',
      pointsList: [] as any,
      pointId: '',
      pointType: '',
      columnsData: [
        {
          title: '日期',
          key: 'address',
        },
        {
          title: '时间',
          key: 'address',
        },
        {
          title: '参数名',
          key: 'address',
        },
        {
          title: '实际值',
          key: 'address',
        },
        {
          title: '阈值1',
          key: 'address',
        },
        {
          title: '阈值2',
          key: 'address',
        },
      ],
      tableData: [],
      varList: [] as any,
      checkAll: false,
      checkAllGroup: [] as string[],
      paramsList: [] as any,
      wsEle: null as any,
      wsTimer: null as any,
      startT: '' as any,
      endT: '' as any,
      wsInter: '3',
      dataRate: '1',
      // startDateOption: {
      //   disabledDate: (date: any) => date > new Date(this.$data.endT) || date > new Date(),
      // },
      // endDateOption: {
      //   disabledDate: (date: any) => date < new Date(this.$data.startT) || date > new Date(),
      // },
      // 只允许选择两天内的数据进行导出
      startDateOption: {
        disabledDate: (date: any) => {
          if (this.$data.endT !== '') {
            const a = new Date(this.$data.endT).getTime() - 2 * 86400000;
            return date > new Date(this.$data.endT) || date < new Date(a);
          } else {
            return date > new Date();
          }
        },
      },
      endDateOption: {
        disabledDate: (date: any) => {
          if (this.$data.startT !== '') {
            const a = new Date(this.$data.startT).getTime() + 2 * 86400000;
            return date < new Date(this.$data.startT) || date > new Date(a);
          } else {
            return date > new Date();
          }
        },
      },
      paramId: '',
      pointData: [
        // {
        //   title: '采集点名称',
        //   key: 'name',
        //   align: 'left',
        //   render: (h: any, params: any): any => {
        //     if (params.row.fake) {
        //       return h('Input', {
        //           attrs: {
        //             placeholder: '搜索采集点',
        //             suffix: 'ios-search',
        //           },
        //           on: {
        //             'on-blur': (event: any) => {
        //               (this as any).pointSearchValue = event.target.value;
        //               (this as any).searchPoint();
        //             },
        //             'on-enter': (event: any) => {
        //               const ele = event.target;
        //               ele.blur();
        //             },
        //           },
        //         },
        //       );
        //     } else {
        //       return h('span', {
        //         style: {padding: '0 18px'},
        //         attrs: {title: params.row.name},
        //       }, params.row.name);
        //     }
        //   },
        // },
        // {
        //   title: '参数名',
        //   key: 'list',
        //   align: 'left',
        //   render: (h: any, params: any): any => {
        //     if (params.row.fake) {
        //       return h('Input', {
        //           attrs: {
        //             placeholder: '搜索参数',
        //             suffix: 'ios-search',
        //           },
        //           on: {
        //             'on-blur': (event: any) => {
        //               (this as any).paramSearchValue = event.target.value;
        //               (this as any).searchParam();
        //             },
        //             'on-enter': (event: any) => {
        //               const ele = event.target;
        //               ele.blur();
        //             },
        //           },
        //         },
        //       );
        //     } else {
        //       if (params.row.list.length > 0) {
        //         return h('div', [
        //           h('ul', params.row.list.map((item: any) => {
        //               if (item.show) {
        //                 return h('li', {
        //                   class: ['col_li'],
        //                 }, item.name);
        //               }
        //           })),
        //         ]);
        //       } else {
        //         return h('div', [h('span', '----')]);
        //       }
        //     }
        //   },
        // },
        // {
        //   title: '实际值',
        //   key: 'list',
        //   align: 'left',
        //   render: (h: any, params: any): any => {
        //     if (params.row.fake) {
        //       return h('span', '');
        //     } else {
        //       if (params.row.list.length > 0) {
        //         return h('div', [
        //           h('ul', params.row.list.map((item: any) => {
        //             if (!item.value) {
        //               item.value = '----';
        //             }
        //             if (item.show) {
        //               return h('li', {
        //                 class: ['col_li'],
        //               }, item.value);
        //             }
        //           })),
        //         ]);
        //       } else {
        //         return h('div', [h('span', '----')]);
        //       }
        //     }
        //   },
        // },
      ] as any,
      fakeTable: [
        {
          fake: true,
        },
      ],
      pointTable: [] as any,
      pointsTable: [] as any, // 保存table原始数据
      pointSearchValue: '',
      paramSearchValue: '',
      wsT: null as any,
      timestamps: '' as any,
      wsTimers: null as any,
    };
  },
  methods: {
    /**
     * 导出数据
     * @param{number} 1:直接导出，2：后台导出
     */
    exportFile(type: number = 1) {
      if (!this.pointId) {
        this.$Message.error('点位不存在,请重新选择');
        return;
      }
      if (this.checkAllGroup.length === 0) {
        this.$Message.error('请选择参数');
        return;
      }
      let pointName = '';
      for (const i of this.pointsList) {
        if (i.id === this.pointId) {
          pointName = i.name;
          break;
        }
      }
      const startT = new Date(this.startT).getTime();
      const endT = new Date(this.endT).getTime();
      if (!startT) {
        this.$Message.error('请选择起始时间');
        return;
      }
      if (!endT) {
        this.$Message.error('请选择结束时间');
        return;
      }
      let paramsList = '';
      for (const i of this.checkAllGroup) {
        paramsList += i + ',';
      }
      const param = {
        name: this.dvName,
        queryStart: startT,
        queryEnd: endT,
        pointId: this.pointId,
        pointName,
        paramsList: paramsList.substring(0, paramsList.length - 1),
      };
      if (type === 1) {
        // const token = `Bearer ` + util.getCookie('token');
        // const link = `name=${param.name}&paramsList=${param.paramsList}&pointId=${param.pointId}&pointName=${param.pointName}&queryEnd=${param.queryEnd}&queryStart=${param.queryStart}`;
        // const alink = document.createElement('a');
        // alink.setAttribute('href', `/api/export/task/sync/start?${link}&token=${token}`);
        // alink.click();
        // (alink as any) = null;
        exportDataApi.exportFileSync(param);
      } else {
        exportDataApi.exportFileAsync(param).then(() => {
          this.$Message.info('数据正在导出中,请稍候查看导出文件');
        });
      }
    },
    // 切换类型时,websocket列表也要切换
    changeType() {
      if (this.type !== 'sensor') {
        this.pointData = [
          {
            title: '参数名',
            key: 'list',
            align: 'left',
            render: (h: any, params: any): any => {
              if (params.row.fake) {
                return h('Input', {
                    attrs: {
                      placeholder: '搜索参数',
                      suffix: 'ios-search',
                    },
                    on: {
                      'on-blur': (event: any) => {
                        (this as any).paramSearchValue = event.target.value;
                        (this as any).searchParam();
                      },
                      'on-enter': (event: any) => {
                        const ele = event.target;
                        ele.blur();
                      },
                    },
                  },
                );
              } else {
                if (params.row.list.length > 0) {
                  return h('div', [
                    h('ul', params.row.list.map((item: any) => {
                        if (item.show) {
                          return h('li', {
                            class: ['col_li'],
                          }, item.name);
                        }
                    })),
                  ]);
                } else {
                  return h('div', [h('span', '----')]);
                }
              }
            },
          },
          {
            title: '实际值',
            key: 'list',
            align: 'left',
            render: (h: any, params: any): any => {
              if (params.row.fake) {
                return h('span', '');
              } else {
                if (params.row.list.length > 0) {
                  return h('div', [
                    h('ul', params.row.list.map((item: any) => {
                      if (!item.value) {
                        item.value = '----';
                      }
                      if (item.show) {
                        return h('li', {
                          class: ['col_li'],
                        }, item.value);
                      }
                    })),
                  ]);
                } else {
                  return h('div', [h('span', '----')]);
                }
              }
            },
          },
        ];
      } else {
        this.pointData = [
          {
            title: '采集点名称',
            key: 'name',
            align: 'left',
            render: (h: any, params: any): any => {
              if (params.row.fake) {
                return h('Input', {
                    attrs: {
                      placeholder: '搜索采集点',
                      suffix: 'ios-search',
                    },
                    on: {
                      'on-blur': (event: any) => {
                        (this as any).pointSearchValue = event.target.value;
                        (this as any).searchPoint();
                      },
                      'on-enter': (event: any) => {
                        const ele = event.target;
                        ele.blur();
                      },
                    },
                  },
                );
              } else {
                return h('span', {
                  style: {padding: '0 18px'},
                  attrs: {title: params.row.name},
                }, params.row.name);
              }
            },
          },
          {
            title: '参数名',
            key: 'list',
            align: 'left',
            render: (h: any, params: any): any => {
              if (params.row.fake) {
                return h('Input', {
                    attrs: {
                      placeholder: '搜索参数',
                      suffix: 'ios-search',
                    },
                    on: {
                      'on-blur': (event: any) => {
                        (this as any).paramSearchValue = event.target.value;
                        (this as any).searchParam();
                      },
                      'on-enter': (event: any) => {
                        const ele = event.target;
                        ele.blur();
                      },
                    },
                  },
                );
              } else {
                if (params.row.list.length > 0) {
                  return h('div', [
                    h('ul', params.row.list.map((item: any) => {
                        if (item.show) {
                          return h('li', {
                            class: ['col_li'],
                          }, item.name);
                        }
                    })),
                  ]);
                } else {
                  return h('div', [h('span', '----')]);
                }
              }
            },
          },
          {
            title: '实际值',
            key: 'list',
            align: 'left',
            render: (h: any, params: any): any => {
              if (params.row.fake) {
                return h('span', '');
              } else {
                if (params.row.list.length > 0) {
                  return h('div', [
                    h('ul', params.row.list.map((item: any) => {
                      if (!item.value) {
                        item.value = '----';
                      }
                      if (item.show) {
                        return h('li', {
                          class: ['col_li'],
                        }, item.value);
                      }
                    })),
                  ]);
                } else {
                  return h('div', [h('span', '----')]);
                }
              }
            },
          },
        ];
      }
    },
    getPointList() {
      const {type, dvId} = this;
      console.log(type);
      const params = {
        type: type === 'thirdParty' ? 'point' : type,
        id: dvId,
      };
      const pointId: any = this.$route.query.pointId || '';
      const pointType: any = this.$route.query.pointType || '';
      dataSourApi.getDvDetail(params).then((res: any = {}) => {
        const data = res.data || {};
        if (type === 'sensor') {
          this.dvName = data.name;
          const pointsList = data.points || [];
          this.pointTable = [];
          this.pointTable = [];
          if (data.pointDtos && data.pointDtos.length > 0) {
            for (const i of data.pointDtos) {
              const param: any = {};
              param.name = i.name;
              param.id = i.id;
              const p: any = [];
              i.pointTypeDTO.params.map((ele: any) => {
                const j: any = {};
                j.name = ele.name;
                j.show = true;
                j.value = '';
                p.push(j);
              });
              param.list = p;
              this.pointTable.push(param);
            }
          }
          this.pointsList = pointsList;
          this.pointId = pointId; // 返显选中的采集点
          // this.pointId = pointsList[0] ? pointsList[0].id : '';
          if (!pointId && pointsList[0]) {
            this.pointId = pointsList[0].id;
          }
          // this.pointId = pointsList[0] ? pointsList[0].id : '';
          this.pointType = pointType;
          if (!pointType &&  pointsList[0]) {
             this.pointType = pointsList[0].pointType.id;
          }
          this.pointType = pointType;
          if (!pointType &&  pointsList[0]) {
             this.pointType = pointsList[0].pointType.id;
          }
        } else {
          this.dvName = data.pointTypeDTO.name + '(类型) - ' + data.name;
          this.pointType = data.pointTypeDTO ? data.pointTypeDTO.id : '';
          this.pointId = dvId;
          this.pointTable = [];
          if (data.pointTypeDTO && data.pointTypeDTO.params.length > 0) {
            const p: any = [];
            data.pointTypeDTO.params.map((ele: any) => {
              const j: any = {};
              j.name = ele.name;
              j.show = true;
              j.value = '';
              p.push(j);
            });
            const param = {
              name: data.name,
              id: data.id,
              list: p,
            };
            this.pointTable.push(param);
          }
        }
        this.pointsTable = JSON.parse(JSON.stringify(this.pointTable));
        this.getParamData();
      });
    },
    changePoint(val: any, data: any) {
      const {pointId, pointType} = this;
      this.pointsList.map((ele: any) => {
        if (pointId === ele.id) {
          this.pointType = ele.pointType.id;
        }
      });
      this.getParamData();
    },
    getParamData() {
      const {pointId, pointType} = this;
      const params = {
        id: pointId,
        typeId: pointType,
      };
      if (!pointType) {
        return;
      }
      dataSourApi.getAllParams(params).then((res: any = {}) => {
        const data: any = res.data || [];
        this.varList = data || [];
        // console.log(data);
        if (data[0]) {
          this.paramId = data[0].name;
          this.checkAllGroup = [this.paramId];
          this.dataRate = data[0].pointType.rate;
        }
        this.getDataList();
        this.wsTable();
      });
    },
    getDataList() {
      const {type, dvId, pointId, checkAllGroup} = this;
      const timeInter = (21 - parseInt(this.dataRate, 0) > 0 ? (21 - parseInt(this.dataRate, 0)) : 1) * 3 * 60 * 1000;
      const endTs = new Date().getTime();
      const startTs = endTs - timeInter;
      let params: any = {
        type: type !== 'sensor' ? 'point' : type,
        pointId: dvId,
        paramNames: checkAllGroup,
        startTs,
        endTs,
      };
      if (type === 'sensor') {
        params = {...params, pointId, sid: dvId};
      }
      const paramsList: any = [];
      dataSourApi.getDataList(params).then((res: any = {}) => {
        const list = res.data;
        list.map((ele: any) => {
          const tableData: any = [];
          ele.data = ele.data || [];
          ele.data.map((valEle: any) => {
            tableData.push(
              {
                paramName: ele.paramName,
                ...valEle,
              },
            );
          });
          if (tableData.length > 0) {
            paramsList.push(tableData);
          }
        });
        this.paramsList = paramsList;
        this.checkAllGroup.map((ele: any, i: number) => {
          this.chartInit(i);
        });
        const wsParams = {
          // pointId: '434343432323',
          // params: 'p1,p2',
          pointId: this.pointId,
          params: this.checkAllGroup.join(','),
          pushRate: parseInt(this.wsInter, 0) * 1000,
        };
        if (this.wsEle) {
          this.wsEle.send(JSON.stringify(wsParams));
        } else {
          if (this.wsTimer) {
            clearTimeout(this.wsTimer);
            this.wsTimer = null;
          }
          this.wsInit();
        }
      });
    },
    checkAllGroupChange(data: any) {
      if (data.length === this.varList.length) {
        this.checkAll = true;
      } else {
        this.checkAll = false;
      }
    },
    handleCheckAll() {
      let checkList: any = [];
      if (!this.checkAll) {
        checkList = this.varList.map((ele: any, i: any) => {
          return ele.name;
        });
        this.checkAllGroup = checkList;
      } else {
        this.checkAllGroup = [];
      }
      this.checkAll = !this.checkAll;
    },
    wsInit() {
      const ws: any = new WebSocket(`ws://${location.host}/ws/websocket`, [util.getCookie('token')]);
      ws.onopen = () => {
        this.wsEle = ws;
        // this.$Message.success('连接websocket成功');
        const wsParams = {
          pointId: this.pointId,
          params: this.checkAllGroup.join(','),
          // pointId: '434343432323',
          // params: 'p1,p2',
          pushRate: parseInt(this.wsInter, 0) * 1000,
        };
        this.wsEle.send(JSON.stringify(wsParams));
      };
      ws.onmessage = (res: any = {}) => {
        let list: any = JSON.parse(res.data) || [];
        if (!list.length) {
          list = [];
        }
        const pushList: any = [];
        list.map((item: any) => {
          for (const val in item) {
            if (val !== 'timestamp' && val !== 'code' && val !== 'msg' && val !== 'pointId') {
              const listLi = {
                paramName: val,
                value: item[val],
                timestamp: item.timestamp,
              };
              pushList.push([listLi]);
            }
          }
        });
        pushList.map((ele: any, i: number) => {
          let pushFlag: boolean = false;
          this.paramsList.map((paramEle: any) => {
            if (paramEle && paramEle[0] && paramEle[0].paramName === ele[0].paramName) {
              if (paramEle.length > 100) {
                paramEle.shift();
              }
              paramEle.push(ele[0]);
              pushFlag = true;
            }
          });
          if (!pushFlag) {
            this.paramsList.push(ele);
          }
        });
        // this.paramsList.push();
        this.checkAllGroup.map((ele: any, i: number) => {
          this.chartInit(i);
        });
        // 动态加载数据;
        // myChart.addData([
        //     [
        //         0,        // 系列索引
        //         {
        //             value:Math.round(Math.random() * 1000), // 新增数据
        //         },
        //         true,     // 新增数据是否从队列头部插入
        //         false     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
        //     ],
        // ]);
      };
      ws.onerror = () => {
        // 重连
        if (this.wsEle) {
          // this.$Message.error('连接websocket发生错误已断开');
          this.closeWS();
          if (!this.wsTimer) {
            this.wsTimer = setTimeout(() => {
              // 3S须连websocket
              this.wsInit();
              this.wsTimer = null;
            }, 5000);
          }
        }
      };
      ws.onclose = () => {
        if (this.wsEle) {
          // this.$Message.error('websocket已关闭');
          this.closeWS();
          if (!this.wsTimer) {
            this.wsTimer = setTimeout(() => {
              // 3S须连websocket
              this.wsInit();
              this.wsTimer = null;
            }, 5000);
          }
        }
      };
    },
    chartInit(index: number) {
      const idName = 'chart' + index;
      const chartELe: any = document.getElementById(idName);
      const myChart = echarts.init(chartELe);
      const valList: any = [];
      const thresUpList: any = [];
      const timeList: any = [];
      const thresDownList: any = [];
      const data: any = this.paramsList[index] || [];
      const checkList: any = this.checkAllGroup;
      const paramName: string = checkList[index];
      let chartsUnit = '';
      for (let i = 0, len = this.varList.length; i < len; i ++) {
        if (this.varList[i].name === paramName) {
          chartsUnit = this.varList[i].unit || '';
          break;
        }
      }
      const rate: number | string = 21 - parseInt(this.dataRate, 0) > 0 ? (21 - parseInt(this.dataRate, 0)) : 1;
      data.map((ele: any, i: number) => {
        if (ele.value !== 'off') {
          valList.push(ele.value);
          timeList.push(ele.timestamp);
        }
      });
      const option: any = {
        tooltip : {
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          name: `${rate * 3}(Time/分)`,
          data: timeList,
          axisLine: {
            symbol: ['none', 'arrow'],
            symbolSize: [5, 5],
          },
          // axisLabel: {
          //   formatter(value: any, i: any) {
          //     // 格式化成月/日，只在第一个刻度显示年份
          //     return util.timeFormate(value - 0);
          //   },
          // },
        },
        dataZoom: [
          {
            type: 'inside',
            realtime: true,
            start: 0,
            end: 100,
          },
        ],
        yAxis: {
          type: 'value',
          name: paramName + '/' + chartsUnit,
          axisLine: {
            symbol: ['none', 'arrow'],
            symbolSize: [5, 5],
          },
        },
        grid: {
          left: '18%',
          top: '11%',
          width: '60%',
          height: '70%',
        },
        series: [
          {
            name: paramName,
            data: valList,
            type: 'line',
            color: ['#4DD67F'],
          },
        ],
      };
      myChart.setOption(option);
    },
    closeWS() {
      if (this.wsEle) {
        this.wsEle.close();
        this.wsEle = null;
      }
    },
    changeUpRate() {
      const wsParams = {
        // pointId: '434343432323',
        // params: 'p1,p2',
        pointId: this.pointId,
        params: this.checkAllGroup.join(','),
        pushRate: parseInt(this.wsInter, 0) * 1000,
      };
      if (this.wsEle) {
        this.wsEle.send(JSON.stringify(wsParams));
      }
    },
    changeParam(val: any) {
      this.checkAllGroup = [val];
    },
    wsTable() {
      const ws: any = new WebSocket(`ws://${location.host}/ws/websocket`, [util.getCookie('token')]);
      ws.onopen = () => {
        this.wsT = ws;
        // this.$Message.success('连接websocket成功');
        const wsParams: any = [];
        for (const i of this.pointsTable) {
          const param: any = {};
          param.pointId = i.id;
          const a: any = [];
          for (const j of i.list) {
            a.push(j.name);
          }
          param.params = a.join(',');
          param.pushRate = 3000;
          wsParams.push(param);
        }
        // const param: any = {};
        // param.pointId = '434343432323';
        // param.params = 'p1,p2,p3';
        // param.pushRate = 3000;    
        // console.log(wsParams);
        this.wsT.send(JSON.stringify(wsParams));
      };
      ws.onmessage = (res: any) => {
        let list: any = JSON.parse(res.data) || [];
        if (!list.length) {
          list = [];
        }
        // this.pointTable = [
        //   {
        //     id: '434343432323',
        //     name: 'xxx',
        //     list: [
        //       {
        //         name: 'p1',
        //         show: true,
        //         value: '',
        //       },
        //       {
        //         name: 'p2',
        //         show: true,
        //         value: '',
        //       },
        //       {
        //         name: 'p3',
        //         show: true,
        //         value: '',
        //       },
        //     ],
        //   }
        // ];
        this.timestamps = list[0].timestamp;
        for (const i of list) {
          for (const j of this.pointTable) {
            if (i.pointId === j.id) {
              for (const z in i) {
                if (1) {
                  for (const k of j.list) {
                    if (z === k.name) {
                      k.value = i[z];
                    }
                  }
                }
              }
            }
          }
        }
        this.pointsTable = JSON.parse(JSON.stringify(this.pointTable));
      };
      ws.onerror = () => {
        // 重连
        if (this.wsT) {
          // this.$Message.error('连接websocket发生错误已断开');
          this.closeWST();
          if (!this.wsTimers) {
            this.wsTimers = setTimeout(() => {
              // 3S须连websocket
              this.wsInit();
              this.wsTimers = null;
            }, 5000);
          }
        }
      };
      ws.onclose = () => {
        if (this.wsT) {
          // this.$Message.error('websocket已关闭');
          this.closeWST();
          if (!this.wsTimers) {
            this.wsTimers = setTimeout(() => {
              // 3S须连websocket
              this.wsInit();
              this.wsTimers = null;
            }, 5000);
          }
        }
      };
    },
    closeWST() {
      if (this.wsT) {
        this.wsT.close();
        this.wsT = null;
      }
    },
    // table搜索采集点名称
    searchPoint() {
      this.pointTable = JSON.parse(JSON.stringify(this.pointsTable));
      if (this.pointSearchValue.trim() === '') {
        return;
      }
      const arr: any = [];
      this.pointTable.map((ele: any) => {
        if (ele.name.indexOf(this.pointSearchValue) !== -1) {
          arr.push(ele);
        }
      });
      this.pointTable = arr;
    },
    // table搜索参数
    searchParam() {
      this.pointTable = JSON.parse(JSON.stringify(this.pointsTable));
      if (this.paramSearchValue.trim() === '') {
        return;
      }
      const arr: any = [];
      this.pointTable.map((ele: any) => {
        arr.push(...ele.list);
      });
      arr.map((ele: any) => {
        if (ele.name.indexOf(this.paramSearchValue) === -1) {
          ele.show = false;
        }
      });
    },
  },
});
</script>
