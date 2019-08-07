<template>
  <div class="home" id="home">
    <div class="home-ceiling">
      <div class="home-ceiling-left">
        <div class="left_logo">
          <i></i>
          <span>工业互联网平台</span>
        </div>
        <span class="ml14">当前在线人数 : {{online}}</span>
      </div>
      <div class="home-ceiling-right">
        <Poptip trigger="hover" @on-popper-show="getExportList" v-has="'SYS_DATA_EXPORT'">
          <a @click="goExport"><i class="export"></i>导出文件</a>
          <div slot="content">
            <div v-if="exportList.length > 0">
              <div class="export_list" v-for="item in exportList" :key="item.id" @click="goExport">
                <span class="export_left">{{item.name}}</span>
                <span v-if="item.status === 1" class="export_right">{{item.progress}}</span>
                <span v-else class="export_right">{{item.alias}}</span>
              </div>
            </div>
            <div v-else class="no_export">
              <p>当前暂无导出任务</p>
            </div>
          </div>
        </Poptip>        
        <a @click="gotoInterfaceTool" v-has="'SYS_VIEWTOOL_ALL'"><i class="interface_tool"></i>界面工具</a>
        <a @click="gotoModelTool" v-has="'SYS_MODEL_ALL'"><i class="model_tool"></i>模型工具</a>
        <!-- <a @click="gotoFront"><i class="switch_front"></i>切换至前端</a> -->
        <a @click="support">帮助与支持</a>
        <a @click="about">关于</a>
        <a @click="logout">退出</a>
        <a ><i class="personal"></i>{{curUseId}}</a>
      </div>
    </div>
    <Layout class="home_box">
      <!-- 左侧菜单栏收缩 Sider 加上 collapsible 属性 -->
      <!-- Menu 标签需要加上 :class="menuitemClasses"  -->
      <Sider :collapsed-width="64" collapsible v-model="isCollapsed" style="width:180px;min-width:64px;max-width:180px;padding-top:18px;"> 
        <Menu 
          v-if="show && !isCollapsed"
          ref="menu"
          :active-name="activeName" 
          :open-names="activeSubMenu"
          theme="dark" 
          width="auto" 
          accordion 
          @on-select="addTabs"
          :class="menuitemClasses"
        >
          <div v-for="(item, index) in menuData" :key="index">
            <MenuItem v-if="item.single" :name="item.children[0].name" :to="item.children[0].path" >
              <i class="icon" :class="item.type"></i>
              <span>{{item.children[0].secondMenu}}</span>
            </MenuItem>
            <Submenu v-else :name="item.name">
              <template slot="title">
                <i class="icon" :class="item.type"></i>
                <span>{{item.menuTitle}}</span>
              </template>
              <MenuItem
                v-for="(second,i) in item.children"
                :key="i"
                :name="second.name"
                :to="second.path"
              >
                <span>{{second.secondMenu}}</span>
              </MenuItem>
            </Submenu>
          </div>
        </Menu>
        <Menu v-show="isCollapsed" style="width: 64px">
          <div class="collapsed_menu">
            <div class="col_menu_item" v-for="(item, index) in menuData" :key="index">
              <i class="icon" :class="index === Number(activeName[0]) - 1 ? (item.type + '_W') : item.type"></i>
            </div>
          </div>
        </Menu>
      </Sider>
      <Layout class="home_content">
        <Tabs type="card" closable @on-tab-remove="handleTabRemove" @on-click="handleCurrentTab" v-model="currentTab" :before-remove='beforeRemove' :animated="false" id="tabs" @contextmenu.native="showRight($event)">
          <TabPane v-for="(tab,index) in tabs" :key="index" :label="tab.name">
          </TabPane>
        </Tabs>
        <Breadcrumb separator="/">
          当前位置&nbsp;:
          <BreadcrumbItem>{{breadTitle}}</BreadcrumbItem><BreadcrumbItem>{{breadSubTitle}}</BreadcrumbItem>
        </Breadcrumb>
        <div class="home_content_inner">
          <keep-alive>
            <router-view class="home_content_inner_layout" @props="addTabs" @prop="handleCurrentTab" :propTabs="tabs"/>
            <!-- <router-view /> -->
          </keep-alive>
        </div>
        <div class="home_bottom" id="footer_copyright">版权所有 ©华星光电科技有限公司 2018 保留一切权利</div>
      </Layout>
    </Layout>
    <div ref="conMenu" :style="conMenuStyle" v-show="showR" class="cont_menu" @contextmenu.prevent="">
      <p class="con_menu_item" v-show="showOther" @click="closeCur">关闭标签</p>
      <p class="con_menu_item" @click="closeAll">关闭其他所有标签</p>
    </div>
  </div>
</template>

<script lang="ts">
import './index.less';
import Vue from 'vue';
import * as utils from '@/config/utils';
import exportDataApi from '@/api/exportData.ts';
import version from '@/config/version';
// import instance from '@/api/index';
export default Vue.extend ({
  name: 'home',
  data() {
    return {
      show: true,
      tabs: [
        {
          path: '/alarmCenter',
          name: '控制中心',
          current: '',
          status: '',
        },
      ], // tabs页面
      currentTab: 0, // 当前tab页
      online: '1', // 在线人数
      isCollapsed: false,
      activeName: '1-1', // 左侧菜单当前展开
      activeSubMenu: ['1'], // 左侧菜单当前显示
      menuData: [
        {
          name: '1',
          type: 'icon_alarmCenter',
          menuTitle: '控制中心',
          single: true,
          children: [
            {
              name: '1-1',
              path: '/alarmCenter',
              secondMenu: '控制中心',
            },
          ],
        },
      ],
      menuDatas: [
        {
          name: '2',
          type: 'icon_assetsMana',
          menuTitle: '资产管理',
          single: true,
          children: [
            {
              name: '2-1',
              path: '/assetsTable',
              secondMenu: '资产管理',
              permission: 'SYS_ASSET_LIST',
            },
          ],
        },
        {
          name: '3',
          type: 'icon_dataSoucMana',
          menuTitle: '数据源管理',
          children: [
            {
              name: '3-1',
              path: '/thirdDataSour',
              secondMenu: '第三方数据源',
              permission: 'SYS_THIRD_POINT_LIST',
            },
            {
              name: '3-2',
              path: '/collManage',
              secondMenu: '采集器管理',
              permission: 'SYS_COLLECTOR_LIST',
            },
          ],
        },
        {
          name: '4',
          type: 'icon_appCenter',
          menuTitle: '应用中心',
          children: [
            {
              name: '4-1',
              path: '/modelManage',
              secondMenu: '模型管理',
              permission: 'SYS_MODEL_LIST',
            },
            {
              name: '4-2',
              path: '/reportMana',
              secondMenu: '报表管理',
              permission: 'SYS_REPORT_LIST',
            },
            {
              name: '4-3',
              path: '/appMana',
              secondMenu: '应用管理',
              permission: 'SYS_APP_LIST',
            },
          ],
        },
        {
          name: '5',
          type: 'icon_sysMana',
          menuTitle: '系统管理',
          children: [
            {
              name: '5-1',
              path: '/systemManage/accountManage',
              secondMenu: '账号管理',
              permission: 'SYS_ACCOUNT_LIST',
            },
            // {
            //   name: '6-2',
            //   path: '/systemManage/organization',
            //   secondMenu: '组织机构',
            // },
            {
              name: '5-3',
              path: '/systemManage/roleManage',
              secondMenu: '角色管理',
              permission: 'SYS_ROLE_LIST',
            },
            {
              name: '5-4',
              path: '/systemManage/authManage',
              secondMenu: '权限管理',
              permission: 'SYS_PERMISSION_LIST',
            },
            {
              name: '5-5',
              path: '/systemManage/logManage',
              secondMenu: '日志管理',
              permission: 'SYS_LOG_ALL',
            },
          ],
        },
        {
          name: '6',
          type: 'icon_dataDictionary',
          menuTitle: '数据字典',
          children: [
            {
              name: '6-1',
              path: '/BrandMana',
              secondMenu: '品牌管理',
              permission: 'SYS_DICT_BRAND_LIST',
            },
            {
              name: '6-2',
              path: '/DeviceTreeMana',
              secondMenu: '设备树管理',
              permission: 'SYS_DICT_LOCATION_LIST',
            },
            {
              name: '6-3',
              path: '/PointLocaMana',
              secondMenu: '采集点列表',
              permission: 'SYS_DICT_POINT_LIST',
            },
            {
              name: '6-5',
              path: '/TypeMana',
              secondMenu: '类型管理',
              permission: 'SYS_DICT_TYPE_ALL',
            },
            {
              name: '6-6',
              path: '/LayoutTypeMana',
              secondMenu: 'Layout管理',
              permission: 'SYS_DICT_TYPE_LAYOUT_LIST',
            },
          ],
        },
      ], // 左侧菜单所有资料
      breadTitle: '控制中心', // 面包屑一级,默认首次进入页面
      breadSubTitle: '控制中心', // 面包屑二级
      wsEle: null as any,
      wsTimer: null as any,
      exportList: [] as any,
      curUseId: '',
      showR: false,
      showOther: true, // 控制中心不能关闭
      conMenuStyle: { // 右键菜单显示位置
        top: '0px',
        left: '0px',
      } as any,
      curTabName: '',
    };
  },
  computed: { // 左侧菜单栏收缩方法,当前需求不需要,需要的时候再取消注释
    menuitemClasses(): any {
      return [
        'menu-item',
        this.isCollapsed ? 'collapsed-menu' : '',
      ];
    },
  },
  destroyed() {
    this.closeWS();
    if (this.wsTimer) {
      clearTimeout(this.wsTimer);
      this.wsTimer = null;
    }
  },
  // deactivated() {
  //   this.closeWS();
  //   if (this.wsTimer) {
  //     clearTimeout(this.wsTimer);
  //     this.wsTimer = null;
  //   }
  // },
  methods: {
    // tab右键菜单
    showRight(e: any) {
      if (!e.target.classList.contains('ivu-tabs-tab') && !e.target.classList.contains('ivu-tabs-close')) {
        if (this.showR) {
          this.showR = false;
        }
        return;
      }
      e.preventDefault();
      const top = e.clientY	+ 'px';
      const left = e.clientX + 'px';
      this.conMenuStyle = {
        top,
        left,
      };
      this.showR = true;
      this.curTabName = e.target.innerText.trim();
      // 右键刚好在X的地方点中的时候,e.target.innerText为空,此时获取其上一节点的value并去掉空格
      if (this.curTabName === '') {
        this.curTabName = e.target.previousSibling.nodeValue.trim();
      }
      this.showOther = this.curTabName === '控制中心' ? false : true;
      const a: any = sessionStorage.getItem('oldTab');
      const b: any = JSON.parse(a);
      for (let i = 0; i < b.length; i++) {
        if (this.curTabName === b[i].name) {
          this.handleCurrentTab(i);
          return;
        }
      }
    },
    // 关闭当前标签页(非选中的当前标签页)
    // closeCur() {
    //   const a: any = sessionStorage.getItem('oldTab');
    //   const b: any = JSON.parse(a);
    //   for (let i = 0; i < b.length; i++) {
    //     if (this.curTabName === b[i].name) {
    //       this.handleTabRemove(i);
    //       return;
    //     }
    //   }
    // },
    // 关闭当前标签页(选中的当前标签页)
    closeCur() {
      this.handleTabRemove(this.currentTab);
    },
    // 关闭所有
    closeAll() {
      const a: any = sessionStorage.getItem('oldTab');
      const b: any = JSON.parse(a);
      const c: any = Number(sessionStorage.getItem('tabIndex'));
      const d: any = [
        {
          path: '/alarmCenter',
          name: '控制中心',
          current: '',
          status: '',
        },
      ];
      for (const i of b) {
        if (this.curTabName === i.name && this.curTabName !== '控制中心') {
          d.push(i);
          break;
        }
      }
      this.tabs = d;
      d.length === 2 ? this.currentTab = 1 : this.currentTab = 0;
      // 重新存取当前标签及下标
      sessionStorage.setItem('oldTab', JSON.stringify(d));
      d.length === 2 ? sessionStorage.setItem('tabIndex', '1') : sessionStorage.setItem('tabIndex', '0');
    },
    goExport() {
      this.$router.push('/exportData');
    },
    // 导出显示
    getExportList() {
      const param = {
          name: '',
          statuses: [],
          page: 0,
          size: 10,
      };
      exportDataApi.getFileList(param).then((res: any) => {
        this.exportList = res.data.content.map((ele: any) => {
            ele.alias = this.transName(ele.status);
            if (ele.progress) {
              ele.progress = ele.progress.substring(0, ele.progress.indexOf('/')) + '%';
            }
            return ele;
        });
      });
    },
    transName(status: number) {
        let txt = '';
        const btnTxt = '';
        switch (status) {
            case 1:
                txt = '导出中';
                break;
            case 2:
                txt = '成功';
                break;
            case 3:
                txt = '失败';
                break;
            case -1:
                txt = '已下载';
                break;
        }
        return txt;
    },
    // gotoFront() {
    //   // utils.setCookie('token', '', -1); // 切换回前端之后再切换回后台时需要重新登录吗?
    //   // window.location.href = 'https://www.baidu.com';
    // },
    gotoInterfaceTool() {
      const href = `/interface/`;
      window.open(href, '_blank');
    },
    gotoModelTool() {
      // const href = `${location.protocol}//${location.hostname}:8666/modelingTool`; // 测试环境地址
      const href = `${location.protocol}//${location.hostname}:${location.port}/modelingTool`;
      window.open(href, '_blank');
    },
    support() {
      // window.location.href = 'https://www.baidu.com';
    },
    // changeIcon(name: any) { // 点击改变左侧菜单图标
    //   for (const i of this.menuData) {
    //     if (i.name === name[0]) {
    //       i.type = 'md-arrow-dropdown';
    //     } else {
    //       i.type = 'md-arrow-dropright';
    //     }
    //   }
    // },
    logout(): void {
      this.closeWS();
      utils.logout();
      sessionStorage.clear();
      // 单点登录退出
      window.location.href = 'http://siam.csot.tcl.com/logout?service=http://iotmgt.csot.tcl.com/logout';
    },
    handleCurrentTab(name: any) {
      this.currentTab = name; // 保存当前页面下标
      // 存入当前页签下标
      sessionStorage.setItem('tabIndex', (this as any).currentTab);
      const x: any = sessionStorage.getItem('oldTab');
      const y: any = JSON.parse(x);
      if (!y[name].current) {
        this.$router.push(this.tabs[name].path); // 如果current没有值,则跳转到默认页面
      }
      for (const i of this.menuData) { // 右边tab页面改变的时候,左侧菜单栏也要响应改变
        // i.type = 'md-arrow-dropright'; // 图标切换
        for (const j of i.children) {
          if (j.secondMenu === this.tabs[name].name) {
            const str = this.activeSubMenu[0];
            this.activeSubMenu[0] = j.name.substring(0, 1);
            this.activeName = j.name;
            // i.type = 'md-arrow-dropdown'; // 图标切换
            this.breadTitle = i.menuTitle; // 面包屑标题切换
            this.breadSubTitle = j.secondMenu; // 面包屑二级标题切换
            const a: any = sessionStorage.getItem('oldTab');
            const b: any = JSON.parse(a);
            if (b[name].current) {
              if (b[name].path === '/modelManage') {
                // const c = JSON.parse(b[name].current).modelId;
                const d = JSON.parse(b[name].current).id;
                b[name].status === 'add' ? this.$router.push({name: 'modelManageDetail', query: {status: 'add', ojbk: d}}) : this.$router.push({name: 'modelManageDetail', query: { status: 'edit', ojbk: d}});
              }
              if (b[name].path === '/thirdDataSour') {
                const c = JSON.parse(b[name].current);
                this.$router.push({name: 'deviceDetails', query: c});
              }
              if (b[name].path === '/collManage') {
                const c = JSON.parse(b[name].current);
                this.$router.push({name: 'deviceDetails', query: c});
              }
              if (b[name].path === '/assetsTable') {
                const c = JSON.parse(b[name].current);
                (this as any).$router.push({name: 'assetsDetails', query: c});
              }
            }
            this.show = false;
            this.$nextTick(() => {
              this.show = true;
            });
          }
        }
      }
    },
    beforeRemove() { // 必须要有一个tab页面,不能全部关闭
      if (this.tabs.length === 1) {
        this.$Message.error('当前页面不可关闭');
        return new Promise( (resolve, reject) => {
          // iview tabs 组件关闭前的函数，必须返回 Promise 才可阻止标签关闭
          // reject('不删除'); // 这里是传递一个错误，可以不写，同样不删除
        });
      }
    },
    handleTabRemove(name: any) {
      const arrCopy: any = []; // 直接调用splice,会因为下标问题导致关闭时关闭两个页签
      for (const i of this.tabs) { // 此处数组深拷贝,先用一个数组存储
        arrCopy.push(i);
      }
      const removeTab = arrCopy.splice(name, 1); // splice
      const removePath = removeTab[0].path;
      switch (removePath) {
        case '/systemManage/logManage':
          sessionStorage.removeItem('log_tab');
          break;
        case '/TypeMana':
          sessionStorage.removeItem('dict_type_tab');
          break;
        default:
          break;
      }
      this.tabs = []; // 清空this.tabs
      this.$nextTick(() => { // $nextTick重新渲染
        for (const j of arrCopy) {
          this.tabs.push(j);
        }
        if (name <= this.currentTab) {
          this.currentTab = this.currentTab - 1;
        }
        sessionStorage.setItem('oldTab', JSON.stringify(arrCopy));
        sessionStorage.setItem('tabIndex', (this as any).currentTab);
        this.$router.push(this.tabs[this.currentTab].path); // 关闭的时候跳转
        this.handleCurrentTab(this.currentTab); // 传入当前tab页面下标
      });
    },
    // 点击左侧栏导航的时候,触发右边tab页面以及当前sessionStorage修改,将保存的id等信息清空
    addTabs(name: any) {
      for (const i of this.menuData) {
        if (i.children.length > 0) {
          const arr = i.children;
          for (const j of arr) {
            if (j.name === name ) {
              const curTab = {
                name: j.secondMenu,
                path: j.path,
                current: '',
                status: '',
              };
              this.breadTitle = i.menuTitle; // 面包屑标题切换
              this.breadSubTitle = j.secondMenu; // 面包屑二级标题切换
              this.activeSubMenu[0] = i.name; // 新增的时候,存储当前打开的子菜单name
              for (let k = 0; k < this.tabs.length; k++) { // 如果已经打开过，跳转回打开过的页面
                if (this.tabs[k].name === j.secondMenu) {
                  this.currentTab = k;
                  // 清空保存信息
                  this.tabs[k].current = '';
                  this.tabs[k].status = '';
                  // 重新保存清空后的tab信息
                  const NOTES = JSON.stringify(this.tabs);
                  sessionStorage.setItem('oldTab', NOTES);
                  sessionStorage.setItem('tabIndex', (this as any).currentTab);
                  this.activeName = j.name;
                  return;
                }
              }
              // 如果没有打开过,新增保存信息
              this.tabs.push(curTab);
              this.currentTab = this.tabs.length - 1; // 新增tabs直接显示最后一个tab
              // 存入sessionStorage
              const NOTE = JSON.stringify(this.tabs);
              sessionStorage.setItem('oldTab', NOTE);
              sessionStorage.setItem('tabIndex', (this as any).currentTab);
            }
          }
        }
      }
    },
    about() {
      this.$Modal.info({
        title: '当前版本及更新时间',
        content: `<p>版本: ${version.version}</p>
                  <p>最近更新时间: ${version.time}</p>`,
      });
    },
    // 获取在线人数 - websocket
    wsInit() {
      const ws: any = new WebSocket(`ws://${location.host}/ws/websocket/onlineusers`, [utils.getCookie('token')]);
      ws.onopen = () => {
        this.wsEle = ws;
        // this.$Message.success('连接websocket成功');
      };
      ws.onmessage = (res: any) => {
        if (parseInt(res.data, 10)) {
          this.online = res.data;
        }
      };
      ws.onerror = (e: any) => {
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
      ws.onclose = (e: any) => {
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
    closeWS() {
      if (this.wsEle) {
        this.wsEle.close();
        this.wsEle = null;
      }
    },
  },
  created() {
    const role: any = localStorage.getItem('roleAuth');
    const auth = JSON.parse(role);
    const getNewMenu = (menuData: any, authList: any) => {
      if (authList.includes('ADMIN') || authList.includes('VIEW')) {
        return menuData;
      } else {
        const newMenuList = menuData.reduce((item: any, val: any) => {
          const arr = val.children.filter((menu: any) => {
            return authList.includes(menu.permission);
          });
          val.children = [].concat(arr);
          if (arr.length) {
            item.push(val);
          }
          return item;
        }, []);
        return newMenuList;
      }
    };
    // 控制中心所有权限可看
    const newMenu = getNewMenu(this.menuDatas, auth);
    this.menuData = this.menuData.concat(newMenu);
    const newVal: any = sessionStorage.getItem('oldTab'); // 刷新页面
    const nowTab: any = sessionStorage.getItem('tabIndex'); // 保存当前页面下标
    // 刷新页面时,需要判断是否有current属性
    if (newVal) {
      this.tabs = JSON.parse(newVal);
      this.handleCurrentTab(Number(nowTab));
    }
    // 获取在线人数 - websocket
    // this.wsInit();
    // 解析token的身份
    this.curUseId = utils.getUserId().userName + ' ' + utils.getUserId().CODE;
  },
  mounted() {
    // 点击其他区域,邮件菜单消失
    document.addEventListener('click', (e: any) => {
      if (this.showR) {
        this.showR = false;
      }
    });
  },
});
</script>
