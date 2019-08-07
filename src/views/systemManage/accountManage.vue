<template>
  <div class="accountManage">
    <!-- 需要同步数据 -->
    <div class="account-manage-oa" v-if="syncinfo">
      <div class="ivu-tabpane-middle">
        <p>无账号，同步失败</p>

        <div class="ivu-oa-syncinfo" @click="syncDataFromOA">
          <p>同步账号</p>
        </div>
      </div>
    </div>
    <!-- 不需要同步数据，请求有数据11 -->
    <div class="account-manage-content">
      <!-- 左侧列表 -->
      <div class="ivu-tabpane-left" v-show="tabpane">
        <div class="tabpane-left-header">
          <div style="marginBottom:10px;">
            <Select v-model="selectModel" @on-change="closeNodes">
              <Option
                v-for="item in selectData"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </div>
          <div style="display:flex;">
            <Input v-model="searchData" prefix="ios-search" placeholder="搜索"/>
            <Button type="primary" size="small" @click="getOrgOrRoleList">搜索</Button>
          </div>
        </div>
        <!-- 机构列表显示 -->
        <div class="orgPart" v-if="selectModel=='org'">
          <ul>
            <li v-for="(org,index) in allOrgs" :key="org.id">
              <span
                @click="searchClickItem(org, index, $event)"
                :class="{'selectedSpan': index === active}"
              >{{org.label}}</span>
            </li>
          </ul>
        </div>
        <!-- 角色列表显示 -->
        <div class="rolePart" v-if="selectModel=='roleType'">
          <ul>
            <li v-for="(role,index) in allRoles" :key="role.id">
              <span
                @click="searchClickItem(role, index, $event)"
                :class="{'selectedSpan': index === active}"
              >{{role.label}}</span>
            </li>
          </ul>
        </div>
        <!-- 开启，禁用开关 -->
        <div class="treeNode" id="treeNode" :style="treeNodePosition" v-if="showTreeNode" v-has="'SYS_ACCOUNT_ORG_AUTH'">
          <p @click="tabAuth">授权</p>
          <!-- <template v-if="isForbid">
            <p @click="setForbid">禁用</p>
            <p @click="tabAuth">授权</p>
          </template>
          <template v-else>
            <p @click="setStart">开启</p>
          </template> -->
        </div>
      </div>
      <!-- 右侧列表   中间内容 -->
      <div class="ivu-tabpane-right" v-show="tabpane">
        <!-- 上部内容表单 -->
        <Table ref="selection" @on-selection-change="changeSelect" :columns="columns1" :data="data1"></Table>
        <!-- 下部控制项 -->
        <div style="margin: 10px;overflow: hidden; marginBottom: 0;">
          <!-- 控制功能 -->
          <div style="float: left;">
            <Checkbox v-model="checkAll" @on-change="checkedAll" class="selectAll">全选</Checkbox>
            <Button class="start-btn" @click="() => start()" v-if="showStart" v-has="'SYS_ACCOUNT_MOD'">启用</Button>
            <Button class="forbidden-btn" @click="() => stop()" v-if="showButton" v-has="'SYS_ACCOUNT_MOD'">禁用</Button>
            <Button class="auth-btn" @click="showAuth" v-if="showButton" v-has="'SYS_ACCOUNT_AUTH'">授权</Button>
          </div>
          <!-- 分页条 -->
          <div style="float: right;">
            <Page
              style="float: left;"
              :total="totalNumber"
              :current.sync="currentPage"
              @on-change="changePageIndex"
              @on-page-size-change="changePageSize"
              show-elevator
              show-sizer
              prev-text="上一页"
              next-text="下一页"
            ></Page>
            <div style="float: right;marginLeft:10px;">
              <!-- <Button type="primary" @click="goElevatorPage">确定</Button> -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 是否弹框显示 -->
    <Modal width="360" v-model="modal1" class-name="vertical-center-modal" :closable="false">
      <div>
        <p class="title-line">{{modalTxt}}</p>
      </div>
      <div slot="footer" style="border-top: none">
        <Button class="ensureButton" type="primary" width="84" @click="comfirmStop">是</Button>
        <Button class="ensureButton" width="84" @click="closeAllModal">否</Button>
      </div>
    </Modal>
    <!-- 显示是否全部选中 -->
    <Modal width="360" v-model="modal2" class-name="vertical-center-modal" :closable="false">
      <div>
        <p class="title-line">{{modalTxt}}</p>
      </div>
      <div slot="footer">
        <Button class="ensureButton" type="primary" width="84" @click="comfirmStart">是</Button>
        <Button class="ensureButton" width="84" @click="closeAllModal">否</Button>
      </div>
    </Modal>

    <!-- 单个以及批量角色授权 -->
    <Modal v-model="accountAuth" class-name="vertical-center-modal">
      <div class="fake-modal">
        <p>账号授权</p>
        <!-- 单个更新角色 -->
        <Form
          :model="singleFormAuth"
          label-position="right"
          :label-width="100"
          inline
          v-if="authNum === 1"
        >
          <FormItem label="账号: ">
            <Input v-model="singleFormAuth.account" style="width: 360px" disabled/>
          </FormItem>
          <FormItem label="姓名: ">
            <Input v-model="singleFormAuth.name" style="width: 360px" disabled/>
          </FormItem>
          <FormItem label="邮件: ">
            <Input v-model="singleFormAuth.email" style="width: 360px" disabled/>
          </FormItem>
          <FormItem label="手机号码: ">
            <Input v-model="singleFormAuth.phoneNumber" style="width: 360px" disabled/>
          </FormItem>
          <FormItem label="工号: ">
            <Input v-model="singleFormAuth.employee" style="width: 360px" disabled/>
          </FormItem>
          <FormItem label="所属部门: ">
            <Input v-model="singleFormAuth.department" style="width: 360px" disabled/>
          </FormItem>
          <FormItem label="选择角色: ">
            <Select v-model="rolesName" style="width:200px" @on-change="selectSingleRole">
              <Option
                v-for="(item, index) in allRoles"
                :value="item.id"
                :key="index"
              >{{ item.label }}</Option>
            </Select>
            <span v-if="isSelectedRole" style="color: #FF5542; display: block;">请选择角色</span>
          </FormItem>
        </Form>
        <!-- 批量更新角色 -->
        <Form
          :model="singleFormAuth"
          label-position="right"
          :label-width="100"
          v-if="authNum > 1"
        >
          <FormItem label="批量账号: ">
            <div class="accountWrapper accout-clearfix">
              <div v-for="(d,i) in singleAuth" :key="i" style="float:left;">
                <span>{{d.name}}</span>
                <span>( {{d.account}} ) ;&nbsp;&nbsp;</span>
              </div>
            </div>
          </FormItem>
          <FormItem label="选择角色: ">
            <Select v-model="rolesName" style="width:200px" @on-change="selectSingleRole">
              <Option
                v-for="(item, index) in allRoles"
                :value="item.id"
                :key="index"
              >{{ item.label }}</Option>
            </Select>
            <span v-if="isSelectedRole" style="color: #FF5542; display: block;">请选择角色</span>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button
          type="primary"
          style="width:120px;marginTop:20px;marginLeft:50px;fontSize:18px;"
          @click="setAuthorizeSingle"
        >授权</Button>
        <Button style="width:120px;marginTop:20px;marginLeft:48px;fontSize:18px;" @click="cancel">解绑</Button>
      </div>
    </Modal>

    <!-- 部门， 角色授权，选择（左侧列表控制选项) -->
    <Modal v-model="tabpaneAuth" class-name="vertical-center-modal">
      <div class="fake-modal">
        <p v-if="selectModel === 'org'">部门授权</p>
        <p v-if="selectModel === 'roleType'">角色授权</p>
        <Form
          :model="departmentFormAuth"
          label-position="right"
          :label-width="100"
          v-if="selectModel === 'org'"
        >
          <FormItem label="批量部门: ">
            <Input v-model="departmentAuth" style="width: 360px" disabled/>
          </FormItem>
          <FormItem label="选择角色: ">
            <Select v-model="rolesName" style="width:200px" @on-change="selectSingleRole">
              <Option
                v-for="(item, index) in allRoles"
                :value="item.id"
                :key="index"
              >{{ item.label }}</Option>
            </Select>
            <span v-if="isSelectedRole" style="color: #FF5542; display: block;">请选择角色</span>
          </FormItem>
        </Form>
        <Form
          :model="roleTypeFormAuth"
          label-position="right"
          :label-width="100"
          v-if="selectModel === 'roleType'"
        >
          <FormItem label="角色名称: ">
            <Input v-model="roleTypeAuth" style="width: 360px" disabled/>
          </FormItem>
          <FormItem label="选择部门: ">
            <!-- <Input prefix="ios-search" style="width: 296px" placeholder="搜索"/> -->
            <Select
              ref="roleAuthSelectRef"
              style="width: 280px; margin-right: 7px"
              v-model="roleAuth.depart"
              filterable
              remote
              :remote-method="remoteGetSearchInput"
            >
              <Option
                v-for="(option) in roleAuth.departList"
                :value="option.id"
                :key="option.id"
              >{{option.orgName}}</Option>
            </Select>
            <Button type="primary" @click="getOrgOrRoleList" style="width: 72px;">搜索</Button>
            <!-- <span v-if="true" style="color: #FF5542; display: block;">字符长度不超过 20</span> -->
            <span v-if="isSelectedOrg" style="color: #FF5542; display: block;">请搜索部门</span>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button
          type="primary"
          style="width:120px;marginTop:20px;marginLeft:50px;fontSize:18px;"
          @click="setAuthorizeMany"
        >授权</Button>
        <Button
          style="width:120px;marginTop:20px;marginLeft:48px;fontSize:18px;"
          @click="cancel1"
        >解绑</Button>
      </div>
    </Modal>

    <Modal
      width="360"
      v-model="showSyncReason"
      class-name="vertical-center-modal"
      :closable="true"
    >
      <div>
        <p class="title-line">同步失败，原因......</p>
      </div>
      <div slot="footer" style="border-top: none">
        <Button
          class="ensureButton"
          type="primary"
          width="84"
         
          @click="syncDataFromOA"
        >同步</Button>
      </div>
    </Modal>

    <Modal width="360" v-model="showSyncPane" class-name="vertical-center-modal" :closable="false">
      <div>
        <p class="title-line">同步中......</p>
      </div>
      <div slot="footer" style="border-top: none; ">
        <Progress :percent="dataRecievedPercent"/>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import './systemManage.less';
import systemManageApi from '@/api/systemManage.ts';
import Vue from 'vue';
export default Vue.extend({
  name: 'accountManage',
  data() {
    return {
      isSelectedRole: false,
      isSelectedOrg: false,
      dataRecievedPercent: 0,
      syncinfo: false,
      showSyncReason: false,
      showSyncPane: false,
      roleAuth: {
        depart: '',
        departList: [],
        searchInput: '',
      },
      totalNumber: 0,
      value2: '',
      data2: [
        // {item: "a"},
        // {item: "b"},
        // {item: "c"}
      ],
      rolesName: '',
      selectModel: 'All', // 下拉框默认选中组织机构
      searchData: '', // 搜索框
      currentOrg: {} as any, // 当前选中的部门
      currentRoles: {} as any, // 当前选中的角色
      selectData: [
        // 下拉框数据切换
        {
          value: 'All',
          label: '工号/姓名',
        },
        {
          value: 'org',
          label: '组织机构',
        },
        {
          value: 'roleType',
          label: '角色类型',
        },
      ],
      allRoles: [], // 左面板所有角色
      allOrgs: [],
      columns1: [
        // 账号管理的table表头
        {
          type: 'selection',
          width: 60,
          align: 'center',
        },
        {
          title: '账号',
          key: 'account',
          render: (h: any, params: any): any => {
            return h('div', [
              h('span', {
                  attrs: {
                    title: params.row.account,
                  },
              }, params.row.account),
            ]);
          },
        },
        {
          title: '工号',
          key: 'employee',
        },
        {
          title: '姓名',
          render: (h: any, params: any): any => {
            return h('div', [
              h('span', {
                attrs: {
                  title: params.row.name,
                },
              }, params.row.name),
            ]);
          },
        },
        {
          title: '电子邮件',
          key: 'email',
        },
        {
          title: '部门',
          key: 'department',
        },
        {
          title: '角色',
          key: 'role',
        },
        {
          title: '最后登录时间',
          key: 'lastlogin',
          render: (h: any, params: any): any => {
           return h('span', {attrs: {title: params.row.lastlogin}}, params.row.lastlogin);
          },
        },
        {
          title: '操作',
          key: 'action',
          align: 'right',
          width: 80,
          render: (h: any, params: any): any => {
            if (params.row.start) {
              return h('div', [
                h(
                  'span',
                  {
                    class: ['icon-bg', 'icon-role-auth'],
                    attrs: {
                      title: '授权',
                    },
                    style: {
                      cursor: 'pointer',
                    },
                    directives: [{
                      name: 'has',
                      value: 'SYS_ACCOUNT_AUTH',
                    }],
                    on: {
                      click: () => {
                        (this as any).show(params.row);
                      },
                    },
                  },
                  '',
                ),
                h(
                  'span',
                  {
                    class: ['icon-bg', 'icon-role-forbidden'],
                    attrs: {
                      title: '禁用',
                    },
                    style: {
                      cursor: 'pointer',
                    },
                    directives: [{
                      name: 'has',
                      value: 'SYS_ACCOUNT_MOD',
                    }],
                    on: {
                      click: () => {
                        // 禁用操作
                        (this as any).stop(params.row);
                      },
                    },
                  },
                  '',
                ),
              ]);
            } else {
              return h('div', [
                h(
                  'span',
                  {
                    class: ['icon-bg', 'icon-role-start'],
                    attrs: {
                      title: '开启',
                    },
                    style: {
                      cursor: 'pointer',
                    },
                    directives: [{
                      name: 'has',
                      value: 'SYS_ACCOUNT_MOD',
                    }],
                    on: {
                      click: () => {
                        // 开启操作
                        (this as any).start(params.row);
                      },
                    },
                  },
                  '',
                ),
              ]);
            }
          },
        },
      ],
      pageSize: 10,
      currentPage: 1,
      data1: [] as any[], // 账号管理的table数据
      checkAll: false, // 是否全选
      singleFormAuth: {}, // 单个授权弹框
      singleAuth: [] as any[], // 选中的角色授权数组
      operateList: [] as any[], // 用来操作的数组，单个操作和多个操作
      authNum: 0, // 授权的数量
      roles: [] as any[], // 右面板穿梭器所有角色
      targetKeys: [], // 目标角色
      listStyle: { height: '170px' },
      showTreeNode: false,
      treeNodePosition: {
        top: '0px',
        left: '0px',
      },
      active: -1, // 没有选择前不选中任何一个
      tabpane: true, // 展示页面的面板显示
      modal1: false, // 启用模态框
      modal2: false, // 禁用模态框
      accountAuth: false, // 账号管理table授权模态框
      tabpaneAuth: false, // 左侧面板授权模态框
      modalTxt: '',
      showStart: false, // 当前所有角色都启用的状况下,只显示禁用按钮
      showButton: false, // 当前所有角色都未启用的状况下,只显示启用按钮
      departmentAuth: '', // 部门授权
      departmentAuthId: '', // 部门授权Id
      roleTypeAuth: '', // 角色授权
      roleTypeAuthId: '', // 角色授权Id
      departmentFormAuth: {}, // 部门授权表单
      roleTypeFormAuth: {}, // 角色授权表单
      changeRoleOrgData: {}, // 用于存放更改角色，部门数据的参数
      roleOrgStatusObj: {}, // 存放角色，部门状态对象
      isForbid: true, // 表示是开启还会禁止模式
      timer: null, // 定时器存储变量
      allRolesOrigin: [], // 角色的所有数据
    };
  },
  mounted() {
    // 点击其他区域,授权及解绑消失
    document.addEventListener('click', (e: any) => {
      this.showTreeNode = false;
    });
    // (this as any).buttonShow();
    (this as any).getAllRolesApi({});
    // (this as any).isNeedSyncData();
    this.isNeedSyncData();
  },
  computed: {},
  methods: {
    /**
     * 判断是否需要同步操作
     */
    async isNeedSyncData() {
      await this.getRequest();
      if (!this.data1.length) {
        this.syncinfo = true;
        this.tabpane = false;
        return;
      }
      this.syncinfo = false;
      this.tabpane = true;
    },

    /**
     * 同步数据依据是否有数据，有数据直接请求，没有数据需要手动同步过来， 同步数据失败后，需要再次进行数据同步
     */
    syncDataFromOA() {
      this.dataRecievedPercent = 0;
      this.showSyncReason = false;
      // 请求数据
      let timer: any = setInterval(() => {
        this.dataRecievedPercent =
          this.dataRecievedPercent > 98
            ? 99
            : this.dataRecievedPercent + 1;
      }, 1000);
      this.showSyncPane = true;
      systemManageApi
        .syncDataFromOA()
        .then(() => {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
          this.showSyncPane = false;
          this.dataRecievedPercent = 100;
          this.syncinfo = false;
          this.tabpane = true;
        })
        .catch(error => {
          this.dataRecievedPercent = 0;
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
          this.showSyncPane = false;
          this.showSyncReason = true;
          this.syncinfo = true;
          this.tabpane = false;
        });
      // this.showSyncPane = false;
      // this.tabpane = true;
      // this.syncinfo = false;
    },

    // 左侧单元开启
    setStart() {
      // 判断是角色模式还是机构部门模式
      if (this.selectModel === 'org') {
        (this as any).allOrgs[(this as any).roleOrgStatusObj.index].status =
          '1';
        systemManageApi
          .modifyOrgStatus({
            id: (this as any).roleOrgStatusObj.id,
            status: '1',
          })
          .then(() => {
            return;
          });
      }
      if (this.selectModel === 'roleType') {
        (this as any).allRoles[(this as any).roleOrgStatusObj.index].status =
          '1';
        systemManageApi
          .modifyRoleStatus({
            id: (this as any).roleOrgStatusObj.id,
            status: '1',
          })
          .then(() => {
            return;
          });
      }
      this.isForbid = false;
    },
    // 左侧单元禁止
    setForbid() {
      // 判断是角色模式还是机构部门模式
      if (this.selectModel === 'org') {
        (this as any).allOrgs[(this as any).roleOrgStatusObj.index].status =
          '2';
        systemManageApi
          .modifyOrgStatus({
            id: (this as any).roleOrgStatusObj.id,
            status: '2',
          })
          .then(() => {
            return;
          });
      }
      if (this.selectModel === 'roleType') {
        (this as any).allRoles[(this as any).roleOrgStatusObj.index].status =
          '2';
        systemManageApi
          .modifyRoleStatus({
            id: (this as any).roleOrgStatusObj.id,
            status: '2',
          })
          .then(() => {
            return;
          });
      }
      this.isForbid = true;
    },
    getRoleAuthDepartList() {
      // 获取部门列表
      const p = {
        orgName: this.roleAuth.searchInput,
      };
      systemManageApi.allOrgsApi(p).then((res: any) => {
        this.roleAuth.departList = res.data;
      });
    },
    remoteGetSearchInput(query: any) {
      this.roleAuth.searchInput = query;
      const timer = setTimeout(() => {
        this.getRoleAuthDepartList();
      }, 200);
    },
    selectSingleRole(id: any) {
      (this.changeRoleOrgData as any).roleId = id;
    },
    // 请求部门数据
    getOrgApi() {
      // 返回全部组织机构,无请求参数
      systemManageApi
        .allOrgsApi({ orgName: this.searchData })
        .then((res: any) => {
          const roleArray = res.data.map(
            ({ id = '', orgName = '', status = '' }: any) => {
              return {
                id,
                label: orgName,
                status,
              };
            },
          );
          this.allOrgs = roleArray;
        });
    },
    // 获取所有角色数据
    async getAllRolesApi(params: any) {
      // 返回全部的角色,无请求参数
      await systemManageApi.allRolesApi().then((res: any) => {
        const roleArray = res.data.content.map(
          ({ id = '', name = '', status = '', createTime = '' }: any) => {
            return {
              id,
              label: name,
              status: status || 2,
              createTime,
            };
          },
        );
        const defalutRoles = roleArray.filter((item: any) => {
          return item.status === '0';
        });
        const otherRoles = roleArray.filter((item: any) => {
          return item.status === '1';
        }).sort((a: any, b: any) => {
          const time1: any = new Date(a.createTime);
          const time2: any = new Date(b.createTime);
          if (time1 - time2 > 0) {
            return 1;
          } else {
            return -1;
          }
        });
        // 添加一个all数据
        (this as any).allRolesOrigin = [...defalutRoles, ...otherRoles];
        this.allRoles = this.allRolesOrigin;
      });
    },
    // 搜索  左侧面板列表
    getOrgOrRoleList() {
      if (this.selectModel === 'All') {
        this.getRequest(this.searchData);
      } else if (this.selectModel === 'org') {
        if (this.searchData) {
          const param = this.toQueryString({ org: this.searchData });
          this.getOrgApi();
        }
      } else if (this.selectModel === 'roleType') {
        const param = this.toQueryString({
          roleType: this.searchData,
        });
        // 前端进行模糊搜索
        (this as any).allRoles = this.roleMatch(this.searchData);
      }
    },
    // 角色模糊匹配
    roleMatch(keywork: any) {
      const list = (this as any).allRolesOrigin;
      const arr: any[] = [];
      for (const i of list) {
          if (i.label.indexOf(keywork) > -1) {
            arr.push(i);
          }
      }
      return arr;
    },
    searchClickItem(obj: any, index: number, event: any) {
      // 点击左侧列表的某个角色或部门
      event.stopPropagation();
      this.roleOrgStatusObj = { ...obj, index };
      this.isForbid = obj.status === '1' ? true : false;
      this.$nextTick(() => {
        this.currentPage = 1; // 重置分页
      });
      this.active = index;

      if (this.selectModel === 'org') {
        // this.showTreeNode = false;
        this.showTreeNode = true;
        // 重置table请求参数
        this.currentOrg = obj;
        this.departmentAuth = (this as any).allOrgs[index].label;
        this.departmentAuthId = (this as any).allOrgs[index].id;
        // 获取点击以后部门id
        (this.changeRoleOrgData as any).userId = (this as any).allOrgs[
          index
        ].id;
      } else if (this.selectModel === 'roleType') {
        if (obj.label === 'all') {
          this.showTreeNode = false;
        } else {
          this.showTreeNode = true;
        }
        this.roleTypeAuth = (this as any).allRoles[index].label;
        this.roleTypeAuthId = (this as any).allRoles[index].id;
        // 获取点击以后角色id
        (this.changeRoleOrgData as any).roleId = (this as any).allRoles[
          index
        ].id;
        if (obj.label === 'all') {
          this.currentRoles = null;
        } else {
          this.currentRoles = obj;
        }
      }
      this.getSearch(); // 重新获取table数据
      this.handleNodes();
    },
    // 点击出现授权,禁用操作
    handleNodes() {
      // this.showTreeNode = false;
      const event: any = window.event;
      const currEle = event.target;
      if (!currEle) {
        return;
      }
      const eleWidth = currEle.offsetWidth;
      const eleHeight = currEle.offsetHeight;
      const eleTop = currEle.offsetTop;
      const eleLeft = currEle.offsetLeft;
      const treeNodeTop = eleTop;
      const treeNodeLeft = eleLeft + eleWidth + 6; // 6是设计图和数组件相距的距离；
      this.treeNodePosition = {
        left: treeNodeLeft + 'px',
        top: treeNodeTop + 'px',
      };
      // this.showTreeNode = true;
    },
    closeNodes() {
      // if (this.selectModel === 'org') {
      //   this.showTreeNode = true;
      // }
      // this.showTreeNode = true;
      // 每次切换， 清楚输入框内容， 并将机构部门的数据清空
      this.searchData = '';
      this.allOrgs = [];
      // 切换下拉款时重置
      this.$nextTick(() => {
        this.currentPage = 1; // 重置分页
      });
      this.active = -1;
    },
    getParams() {
      const p: any = {
        page: this.currentPage - 1,
        size: this.pageSize,
      };
      if (this.selectModel === 'org' && this.currentOrg) {
        p.orgId = this.currentOrg.id;
      } else if (
        this.selectModel === 'roleType' &&
        this.currentRoles
      ) {
        p.roleId = this.currentRoles.id;
      }

      return p;
    },
    getRequest(keyword: string = '') {
      const params = this.getParams();
      params.keyword = encodeURIComponent(keyword);
      const param = this.toQueryString(params);
      this.singleAuth = [];
      this.checkAll = false;
      return new Promise(resolve => {
        systemManageApi.getUsersInfoList(param).then(res => {
          const resArray = res.data.content.map((item: any) => {
            // id, 用户账号（username）， 工号(code)， 真实姓名(realName)， 邮箱(email)， 禁用与否 (enabled)
            let roles = item.roles;
            if (roles.length === 0 || roles === null) {
              roles = [{ name: '' }];
            }
            return {
              id: item.id,
              account: item.username,
              employee: item.code || '',
              name: item.realName || '',
              phoneNumber: item.phone || '',
              email: item.email,
              department: item.org && item.org.orgName || '',
              role: roles[0].name || '',
              lastlogin: item.lastLoginTime || '',
              checked: false,
              start: item.enabled === 1 ? true : false, // 状态 1启用 2禁用
            };
          });
          this.totalNumber = res.data.totalElements;
          // 强制修改一个状态为true
          this.data1 = resArray;
          this.buttonShow();
          resolve(resArray);
        });
      });
    },
    getSearch() {
      this.currentPage = 1;
      this.getRequest();
    },
    changePageIndex(pageIndex: any) {
      this.currentPage = pageIndex;
      this.getRequest();
    },
    changePageSize(pageSize: any) {
      this.pageSize = pageSize;
      this.getRequest();
    },
    buttonShow() {
      const obj = {
        enabled: 0,
        disabled: 0,
      };
      // 启用等按钮的显示
      for (const account of this.data1) {
        account.start ? obj.enabled++ : obj.disabled++;
      }
      this.showStart = true;
      this.showButton = true;
      if (obj.enabled === this.data1.length) {
        // 全部启用
        this.showStart = false;
      } else if (obj.disabled === this.data1.length) {
        // 全部禁用
        this.showButton = false;
      }

    },
    checkedAll() {
      // 点击全选
      (this.$refs.selection as any).selectAll(this.checkAll);
    },
    // 账户单个赋予角色
    async show(info: any) {
      this.authNum = 1;
      await this.getAllRolesApi({});
      this.clearModalSelectContent();
      // 表格内单个授权图标
      // 收集单个账户的id给changeRoleOrgData数据存放；
      (this.changeRoleOrgData as any).userId = [info.id];
      for (const i of (this.allRoles as any)) {
        if (i.label === info.role) {
          this.rolesName = i.id;
          break;
        }
      }
      this.singleFormAuth = info;
      this.getTargetKeys();
      this.accountAuth = true;
    },
    // 批量授权    账户批量赋予角色
    async showAuth() {
      // 表格外授权按钮
      this.clearModalSelectContent();
      for (const account of this.singleAuth) {
        if (!account.start) {
          this.$Message.error(
            '当前选中账号 '  + account.account +  ' 为禁用账号,请启用后再授权',
          );
          return;
        }
      }
      this.authNum = this.singleAuth.length;
      if (this.singleAuth.length === 0) {
        // 未选择
        this.$Message.error('请至少选择一项授权');
        return;
      } else if (this.singleAuth.length === 1) {
        // 只选择一个
        this.singleFormAuth = this.singleAuth[0];
      } else {
        // 选择多个
        this.singleFormAuth = {};
      }
      await this.getAllRolesApi({});
      this.accountAuth = true;
      ((this.changeRoleOrgData as any) as any).userId = this.singleAuth.map(
        (item: any) => item.id,
      );
      this.getTargetKeys();
    },
    // 点击授权执行操作(只进行单一操作，给用户赋予角色)
    setAuthorizeSingle() {
      if (!this.rolesName) {
        this.isSelectedRole = true;
        return;
      }
      this.isSelectedRole = false;
      let params: object;
      const userIds = [];
      const roleIds = this.targetKeys;
      for (const i of this.singleAuth) {
        userIds.push(i.id);
      }
      params = {
        userIds,
        roleIds,
      };
      this.accountAuth = false;
      this.tabpane = true;
        // 赋予角色多个用户
      const info: any = {
        ids: (this.changeRoleOrgData as any).userId,
        roleId: (this.changeRoleOrgData as any).roleId,
      };

      systemManageApi.setManyUserRole(info).then(() => {
        this.$Message.info('授权成功');
        this.getRequest();
      });
      this.clearModalSelectContent();
    },
    // 关闭模态框
    closeAllModal() {
      if (this.accountAuth) {
        this.accountAuth = false;
        this.tabpane = true;
      }
      if (this.modal1) {
        this.modal1 = false;
      }
      if (this.modal2) {
        this.modal2 = false;
      }
    },
    cancel() {
      // 关闭模态框
      this.closeAllModal();
      // 解绑操作
      if (this.singleAuth.length === 1) {
        const temValue: any = (this.changeRoleOrgData as any).userId;
        const info: any = {
          userId: Array.isArray(temValue) ? temValue.join('') : temValue,
          roleId: '',
        };

        // 解绑角色给单个用户
        systemManageApi.setSingRoleToUser(info).then(() => {
          this.$Message.info('解绑成功');
          this.getRequest();
          this.clearModalSelectContent();
          return;
        }).catch(() => {
          this.$Message.error('解绑失败');
        });
      } else {
        // 解绑角色多个用户
        const info: any = {
          ids: (this.changeRoleOrgData as any).userId,
          roleId: '',
        };

        systemManageApi.setManyUserRole(info).then(() => {
          this.$Message.info('解绑成功');
          this.getRequest();
          this.clearModalSelectContent();
          return;
        }).catch(() => {
          this.$Message.error('解绑失败');
        });
      }
    },
    clearModalSelectContent() {
      this.isSelectedOrg = false;
      this.isSelectedRole = false;
      this.rolesName = '';
      this.roleAuth.depart = '';
    },
    getMockData() {
      // 源列表数据
      const mockData = [];
      const arr: any[] = [];
      for (const i of arr) {
        mockData.push({
          key: i.id,
          label: i.label,
        });
      }
      return mockData;
    },
    render(item: any) {
      return item.label;
    },
    handleChange(newTargetKeys: any, direction: any, moveKeys: any) {
      this.targetKeys = newTargetKeys;
    },
    getTargetKeys() {
      this.targetKeys = [];
      return ((this as any).targetKeys = this
        .getMockData() // 目标角色列表赋值
        .filter((item: any) => item.label === (this.singleFormAuth as any).role)
        .map((item: any) => item.key));
    },
    // 修改选中行
    changeSelect(selection: any[]) {
      this.singleAuth = selection;
      // 设置全选框选中状态
      this.checkAll = selection.length === this.data1.length ? true : false;
    },
    // 启用
    async start(info: any) {
      let txt = '';
      if (info) {
        this.operateList = [info];
      } else {
        this.operateList = [...this.singleAuth];
      }
      if (!this.operateList.length) {
        // 未选择
        this.$Message.error('请至少选择一项启用');
        return;
      }
      txt = this.operateList.length === 1 ? '' : ' ' + this.operateList.length +  ' 个';
      this.modal2 = true;
      if (this.operateList.length === 1) {
        this.modalTxt = '确定启用此账号吗？';
      } else {
        this.modalTxt =
          '已经启用账户，当前角色为' +
          this.operateList[0].role +
          '，现在更新角色';
      }
    },
    // 禁用
    stop(info: any) {
      let txt = '';
      if (info) {
        this.operateList = [info];
      } else {
        this.operateList = [...this.singleAuth];
      }
      if (!this.operateList.length) {
        // 未选择
        this.$Message.error('请至少选择一项禁用');
        return;
      }
      txt = this.operateList.length === 1 ? '此' : '这' + this.operateList.length + '个';
      this.modal1 = true;
      this.modalTxt = '确定禁用' + txt + '账号吗?';
    },
    // 禁用
    async comfirmStop() {
      // 发送请求，修改数据的状态为禁用；
      const ids = this.operateList.map((item: any) => {
        return item.id;
      });
      const params = {
        ids,
        status: '2',
      };
      systemManageApi.modifyUserStatus(params).then(() => {
        this.closeAllModal();
        this.getRequest();
        this.$Message.info('禁用成功');
      }).catch(() => {
        this.$Message.error('禁用失败');
      });
    },
    // 开启
    async comfirmStart() {
      const ids = this.operateList.map((item: any) => {
        return item.id;
      });
      // 发送请求，修改数据的状态为开启；
      const params: any = {
        ids,
        status: '1',
      };
      systemManageApi.modifyUserStatus(params).then(() => {
        this.getRequest();
        this.modal2 = false;
        this.$Message.info('启用成功');
      }).catch(() => {
        this.$Message.error('启用失败');
      });
    },
    getChosenNodes(data: any) {
      // 组织树结构选中当前节点
      this.$nextTick(() => {
        this.currentPage = 1; // 重置分页
      });
      const arr = (this.$refs.nodesTree as any).getSelectedNodes();
      let params: any;
      if (arr.length === 0) {
        this.showTreeNode = false;
      } else {
        this.showTreeNode = true;
        params = {
          id: arr[0].id,
          pageSize: this.pageSize,
          currentPage: this.currentPage - 1,
        };
        this.getOrgTable(params);
      }
      if (arr.length > 0 && data.length > 0) {
        this.departmentAuth = data[0].title;
      }
      this.handleNodes();
    },
    getOrgTable(params: any) {
      // 通过树节点获取到的表格数据
    },
    async tabAuth() {
      this.clearModalSelectContent();
      await this.getAllRolesApi({});
      this.tabpaneAuth = true;
    },
    // 部门 和角色 批量授权
    setAuthorizeMany() {
      if (this.selectModel === 'roleType') {
        if (!this.roleAuth.depart) {
          this.isSelectedOrg = true;
          return;
        }
        this.isSelectedOrg = false;
        ((this.changeRoleOrgData as any) as any).userId = this.roleAuth.depart;
        systemManageApi
          .setRoleToOrg({
            orgId: ((this.changeRoleOrgData as any) as any).userId,
            roleId: ((this.changeRoleOrgData as any) as any).roleId,
          })
          .then(() => {
            this.$Message.info('授权成功');
            this.getRequest();
          }).catch(() => {
            this.$Message.error('授权失败');
          });
      }
      if (this.selectModel === 'org') {
        if (!this.rolesName) {
          this.isSelectedRole = true;
          return;
        }
        this.isSelectedRole = false;

        systemManageApi
          .setRoleToOrg({
            orgId: (this.changeRoleOrgData as any).userId,
            roleId: (this.changeRoleOrgData as any).roleId,
          })
          .then(value => {
            this.$Message.info('授权成功');
            this.getRequest();
          }).catch(() => {
          this.$Message.error('授权失败');
        });
      }
      this.tabpaneAuth = false;
      this.tabpane = true;
      this.clearModalSelectContent();
      const target = [];
      for (const i of this.targetKeys) {
        const a = {
          id: '',
        };
        a.id = i;
        target.push(a);
      }
      // this.$Message.info('Clicked ok');
    },
    cancel1() {
      if (this.selectModel === 'roleType') {
        if (!this.roleAuth.depart) {
          this.isSelectedOrg = true;
          return;
        }
        this.isSelectedOrg = false;
        (this.changeRoleOrgData as any).userId = this.roleAuth.depart;
        systemManageApi
          .setRoleToOrg({
            orgId: (this.changeRoleOrgData as any).userId,
            roleId: (this.changeRoleOrgData as any).roleId,
          })
          .then(() => {
            this.$Message.info('解绑成功');
            this.getRequest();
          }).catch(() => {
            this.$Message.error('解绑失败');
          });
      }
      if (this.selectModel === 'org') {
        systemManageApi
          .setRoleToOrg({
            orgId: (this.changeRoleOrgData as any).userId,
            roleId: '',
          })
          .then(value => {
            this.$Message.info('解绑成功');
            this.getRequest();
          }).catch(() => {
             this.$Message.error('解绑失败');
          });
      }
      this.tabpaneAuth = false;
      this.tabpane = true;
      this.departmentAuth = '';
      this.departmentFormAuth = {};
      this.clearModalSelectContent();
    },
    cleanArray(actual: any) {
      const newArray = [];
      for (const i of actual) {
        if (i) {
          newArray.push(i);
        }
      }
      return newArray;
    },
    toQueryString(obj: any) {
      // 将一个对象转成QueryString
      if (!obj) {
        return '';
      }
      return this.cleanArray(
        Object.keys(obj).map((key: any) => {
          if (obj[key] === undefined) {
            return '';
          }
          // return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
          return key + '=' + obj[key];
        }),
      ).join('&');
    },
  },
});
</script>
<style lang="less">
.accountManage {
  .ivu-checkbox-inner, .ivu-checkbox-input {
    width: 16px;
    height: 16px;
  }
  .ivu-checkbox-inner {
    &::after {
      top: 2px;
      left: 5px;
    }
  }
  .ivu-tabpane-right {
    .selectAll {
      font-size: 14px;
    }
  }
}
.ivu-modal-content {
  background: rgba(247,251,252,1);
}
.accout-clearfix {
  width: 318px;
  height: 180px;
  overflow: auto;
  background: white;
  border:1px solid rgba(220,229,232,1);
}
.accout-clearfix:after{
  display:block;
  clear:both;
  content:"";
  visibility:hidden;
  height:0
}
.ivu-modal-footer {
  & > div {
    text-align: center;
  }
}
.ivu-modal-body {
  > div {
    .title-line {
      text-align: center;
      font-size: 16px;
      margin-top: 30px;
    }
  }
}
.ivu-input {
  padding: 4px 0 4px 23px;
}
.ivu-modal-footer {
  border: 0px;
  .ensureButton {
    width: 84px;
    height: 36px;
    margin: 0 30px;
  }
}


label {
  position: relative;
  cursor: pointer;

  input {
    cursor: pointer;
  }

  input:checked + .show-box {
    background: rgb(59, 114, 168);
  }

  .show-box {
    position: absolute;
    top: -3px;
    left: 0;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: 1px solid #d8d8d8;
    background: white; // 这里取个巧，与下面颜色一样而已

    &:before { // 使用了 absolute 所以无所谓是 before 还是 after
      content: ''; // 空白内容占位，当做盒模型处理，见下面
      position: absolute;
      top: 2px;
      left: 6px;
      width: 3px; // 勾的短边
      height: 8px; // 勾的长边
      border: solid white; // 勾的颜色
      border-width: 0 2px 2px 0; // 勾的宽度
      transform: rotate(45deg); // 定制宽高加上旋转可以伪装内部的白色勾
    }
  }
}
</style>

