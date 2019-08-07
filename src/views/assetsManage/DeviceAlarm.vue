<template>
  <div class="alarm_wrap">
    <div class="sear_alarm_wrap">
      <span v-if="type === 'sensor'" class="sear_li">
        <em class="li_tit">采集点类型：</em>
        <Select v-model="typeId" @on-change="changePtype">
          <Option value="all" >所有</Option>
          <Option v-for="(ele,i) in pointTypeList" :value="ele.id" :key="i">{{ele.name}}</Option>
        </Select>
      </span>
      <span v-if="type === 'sensor'" class="sear_li">
        <em class="li_tit">采集点：</em>
        <Select v-model="pid">
          <Option value="all" >所有</Option>
          <Option v-for="(ele,i) in pointsList" :value="ele.id" :key="i">{{ele.name}}</Option>
        </Select>
      </span>
      <span class="sear_li">
        <em class="li_tit">异常类型：</em>
        <Select v-model="status">
          <Option value="all" >所有</Option>
          <Option value="1" >预警</Option>
          <Option value="2" >报警</Option>
          <Option value="3" >异常</Option>
        </Select>
      </span>
      <span class="sear_li">
        <em class="li_tit">起止时间：</em>
        <DatePicker v-model="dateRang" @on-change="changeDate" type="datetimerange" placement="bottom-end" placeholder="Select date" style="width: 310px"></DatePicker>
      </span>
      <Button @click="getTable" type="primary"> 查 询 </Button>
      <Button @click="resetSear" type="primary"> 重 置 </Button>
    </div>
    <div class="table_wrap">
      <Table stripe :columns="columnsData" :data="tableData"></Table>
      <div class="page_box">
          <Page :total="pageTotal" @on-change="changePageIndex" @on-page-size-change="changePageSize" show-total show-elevator show-sizer />
      </div>
    </div>
    <Input ref="editInput" @on-blur="ok" @on-enter="ok" v-show="showEdit" v-model="editValue" style="position: absolute;margin-left:8px;" :style="positionStyle"/>
  </div>
</template>

<script lang="ts">
import '../dataSourManage/devicesManage.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import dataSourApi from '@/api/dataSourManage.ts';
import alarmCenterApi from '@/api/alarmCenter.ts';
export default Vue.extend ({
  name: 'DeviceAlarm',
  props: ['type', 'dvId'],
  created() {
    if (this.type === 'sensor') {
      // const pointId: any = this.$route.query.pointId || '';
      // const pointType: any = this.$route.query.pointType || '';
      // this.pid = pointId;
      // this.typeId = pointType;
      this.getSensorInfo();
    }
    // this.getTypeList();
    // this.upColumn();
    this.getTable();
  },
  watch: {
    type() {
      // this.upColumn();
    },
    dvId() {
      if (this.type === 'sensor') {
        // const pointId: any = this.$route.query.pointId || '';
        // const pointType: any = this.$route.query.pointType || '';
        // this.pid = pointId;
        // this.typeId = pointType;
        this.getSensorInfo();
      }
      this.getTable();
    },
  },
  data() {
    return {
      pointTypeList: [] as any,
      pointsList: [] as any,
      pid: 'all',
      typeId: 'all',
      status: 'all',
      dateRang: ['', ''] as any,
      columnsData: [
        {
          title: '报警初始时间',
          key: 'startTime',
          align: 'center',
          width: 190,
          render: (h: any, params: any): any => {
            return h('div', [
                      params.row.children && params.row.children.length > 0 && h('Icon', {
                        props: {
                          type: (params.row.showChild ? 'md-remove-circle' : 'md-add-circle'),
                          size: '24',
                        },
                        style: {
                          cursor: 'pointer',
                          color: '#386ca0',
                        },
                        on: {
                          click: () => {
                            if (!params.row.showChild) {
                              (this as any).tableData.splice(params.index + 1, 0 , ...params.row.children);
                            } else {
                              (this as any).tableData.splice(params.index + 1, params.row.children.length);
                            }
                            (this as any).tableData[params.index].showChild = !params.row.showChild;
                          },
                        },
                      }),
                      h('span', {
                        style: {
                          'display': 'inline-block',
                          'vertical-align': 'middle',
                          'width': 'calc(100% - 24px)',
                          'padding-left': params.row.level > 1 ? (params.row.level * 10) + 'px' : 0,
                        },
                        attrs: {title: params.row.startTime},
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
            return h('span', {attrs: {title: params.row.endTime}}, params.row.endTime);
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
            const warningList: any = [
              {id: 1, label: '预警'},
              {id: 2, label: '报警'},
              {id: 3, label: '异常'},
            ];
            for (const i of warningList) {
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
          render: (h: any, params: any): any => {
            // return h('Tooltip',
            return h('div',
              {
                attrs: {
                  content: params.row.remark,
                  placement: 'bottom-end',
                },
              },
              [h('p', {
                  style: {
                    width: '100px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    wordBreak: 'break-all',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  },
                  attrs: {title: params.row.remark},
                  on: {
                    dblclick: (event: any) => {
                      (this as any).showEdit = true;
                      (this as any).alarmId = params.row.id;
                      const position = event.target.getBoundingClientRect();
                      (this as any).editValue = params.row.remark;
                      (this as any).positionStyle = {
                        width: position.width + 'px',
                        top: position.top - 130 + 'px', // 定位要减去头部,居中等共132
                        left: position.left - 230 + 'px', // 定位要减去左侧栏 200
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
      ] as any [],
      tableData: [] as any,
      pageTotal: 0 as number,
      pageIndex: 1 as number,
      pageSize: 10 as number,
      showEdit: false,
      alarmId: '',
      editValue: '',
      positionStyle: {
        width: '0px',
        top: '0',
        left: '0',
      },
    };
  },
  methods: {
    getTable() {
      const {pageIndex, pageSize, dvId, type, dateRang} = this;
      let {status, pid, typeId} = this;
      status = status === 'all' ? '' : status;
      pid = pid === 'all' ? '' : pid;
      typeId = typeId === 'all' ? '' : typeId;
      const startTime = dateRang[0] ? new Date(dateRang[0]).getTime() : '';
      const endTime = dateRang[1] ? new Date(dateRang[1]).getTime() : new Date().getTime();
      let params: any = {
        type: (type !== 'sensor' ? 'point' : type),
        page: pageIndex - 1,
        size: pageSize,
        status,
        startTime,
        endTime,
        id: dvId,
      };
      if (type === 'sensor') {
        params = {
          type: (type !== 'sensor' ? 'point' : type),
          page: pageIndex - 1,
          size: pageSize,
          status,
          startTime,
          endTime,
          sid: dvId,
          typeId,
          pid,
        };
      }
      // const sensorStr = `page=${pageIndex - 1}&size=${pageSize}&status=${status}&startTime=${startTime}&endTime=${endTime}&sid=${dvId}&typeId=${typeId}&pid=${pid}`;
      dataSourApi.getPointAlarm(params).then((res: any = {}) => {
        const data = res.data || {};
        const list = data.content || [];
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
                event: parEle.event,
                remark: ele.remark, // 显示点位的注释
                showChild: false,
                level: i === 0 ? 1 : 2,
                id: ele.id,
                alarmType: ele.alarmType,
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
        this.pageTotal = data.totalElements;
      });
    },
    getSensorInfo() {
      const params = {
        type: 'sensor',
        id: this.dvId,
      };
      dataSourApi.getDvDetail(params).then((res: any = {}) => {
        const data = res.data || {};
        const pointsList = data.points || [];
        const pTypeList: any[] = [];
        pointsList.map((item: any) => {
          let flag = false;
          pTypeList.map((tLi: any) => {
            if (tLi.name === item.pointType.name) {
              tLi.children.push(item);
              flag = true;
            }
          });
          if (!flag) {
            pTypeList.push({children: [item], ...item.pointType});
          }
        });
        this.pointTypeList = pTypeList;
      });
    },
    changePtype(val: any) {
      this.pid = 'all';
      if (!val || val === 'all') {
        this.pointsList = [];
        this.pid = 'all';
        return;
      }
      this.pointTypeList.map((ele: any) => {
        if (ele.id === val) {
          this.pointsList = [...ele.children];
        }
      });
    },
    getTypeList() {
      const params = {
          params: `page=&size=&category=collector&keyword=&pointNumber=`,
      };
      dictionaryApi.collTypeList(params).then((res: any = {}) => {
        const data = res.data || {};
        const list = data.content || [];
        this.pointTypeList = list;
        let typeId = this.typeId;
        // // 采集点类型赋初值
        if (list.length > 0 && !typeId) {
          typeId = list[0].id;
          this.typeId = list[0].id;
        }
        this.getPointsList(typeId);
        // }
       });
    },
    getPointsList(id: any) {
      id = id ? id : this.typeId;
      if (!id || id === 'all') {
        this.pid = 'all';
        this.pointsList = [];
        return;
      }
      const params = {
          id,
      };
      dictionaryApi.selectPoint(params).then((res: any = {}) => {
          const pointsList = res.data.points || [];
          this.pointsList = pointsList;
          this.pid = pointsList[0].id;
      });
    },
    resetSear() {
      this.status = 'all';
      this.dateRang = ['', ''];
      if (this.type === 'sensor') {
        this.pid = 'all';
        this.typeId = 'all';
      }
    },
    changeDate(date: any, other: any) {
      console.log(date, other);
      console.log(new Date(this.dateRang[0]));
    },
    changePageIndex(page: number) {
      this.pageIndex = page;
      this.getTable();
    },
    changePageSize(size: number) {
      if (this.pageSize !== size) {
        this.pageSize = size;
        this.getTable();
      }
    },
    upColumn() {
      if (this.type === 'sensor') {
        if (this.columnsData[2].title !== '采集点类型') {
          this.columnsData.splice(1, 0, {
            title: '采集点类型',
            key: 'pointType',
            align: 'center',
          },
          {
            title: '采集点',
            key: 'pointName',
            align: 'center',
          });
        }
      } else {
        if (this.columnsData[2].title === '采集点类型') {
          this.columnsData.splice(2, 2);
        }
      }
    },
    // 失焦,enter事件
    ok() {
      const param = {
        remark: this.editValue,
        id: this.alarmId,
      };
      alarmCenterApi.editRemark(param).then( (res: any) => {
        this.$Message.success('修改成功');
        this.getTable();
      });
      this.showEdit = false;
    },
  },
});
</script>
