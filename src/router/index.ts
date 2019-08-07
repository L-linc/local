import Vue from 'vue';
import Router from 'vue-router';
import { getCookie } from '@/config/utils';
import * as utils from '@/config/utils';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/Home.vue'),
      children: [
        {
          path: '/propertyManage',
          name: 'propertyManage',
          component: (resolve) => {
            require(['@/views/propertyManage/PropertyManage.vue'], resolve);
          },
        },
        {
          path: '/devicesManage',
          name: 'devicesManage',
          component: () => import(/* webpackChunkName: "about" */ '@/views/dataSourManage/DevicesManage.vue'),
        },
        {
          path: '/thirdDataSour',
          name: 'thirdDataSour',
          component: () => import(/* webpackChunkName: "about" */ '@/views/dataSourManage/ThirdDataSour.vue'),
        },
        {
          path: '/collManage',
          name: 'collManage',
          component: () => import(/* webpackChunkName: "about" */ '@/views/dataSourManage/CollManage.vue'),
        },
        {
          path: '/sensorManage',
          name: 'sensorManage',
          component: () => import(/* webpackChunkName: "about" */ '@/views/dataSourManage/SensorManage.vue'),
        },
        {
          path: '/deviceDetails',
          name: 'deviceDetails',
          component: () => import(/* webpackChunkName: "about" */ '@/views/dataSourManage/DeviceDetails.vue'),
          meta: {
            keepAlive: false,
          },
        },
        {
          path: '/interfaceTool',
          name: 'interfaceTool',
          component: (resolve) => {
            require(['@/views/interfaceTool/InterfaceTool.vue'], resolve);
          },
        },
        {
          path: '/appCenter',
          name: 'appCenter',
          component: (resolve) => {
            require(['@/views/appCenter/AppCenter.vue'], resolve);
          },
        },
        { // 应用中心-应用管理
          path: '/appMana',
          name: 'appMana',
          component: (resolve) => {
            require(['@/views/appCenter/AppMana.vue'], resolve);
          },
        },
        { // 应用中心-报表管理
          path: '/reportMana',
          name: 'reportMana',
          component: (resolve) => {
            require(['@/views/appCenter/ReportMana.vue'], resolve);
          },
        },
        { // 报警中心
          path: '/alarmCenter',
          name: 'alarmCenter',
          component: (resolve) => {
            require(['@/views/alarmCenter/AlarmCenter.vue'], resolve);
          },
        },
        { // 系统管理=》账号管理
          path: '/systemManage/accountManage',
          name: 'accountManage',
          component: (resolve) => {
            require(['@/views/systemManage/accountManage.vue'], resolve);
          },
        },
        {
          path: '/exportData',
          name: 'exportData',
          // component: () => import('@/views/login/index.vue'),
          component: (resolve) => {
            require(['@/views/home/ExportData.vue'], resolve);
          },
        },
        // { // 系统管理=》组织机构
        //   path: '/systemManage/organization',
        //   name: 'organization',
        //   component: (resolve) => {
        //     require(['@/views/systemManage/organization.vue'], resolve);
        //   },
        // },
        { // 系统管理=》角色管理
          path: '/systemManage/roleManage',
          name: 'roleManage',
          component: (resolve) => {
            require(['@/views/systemManage/roleManage.vue'], resolve);
          },
        },
        { // 系统管理=》权限管理
          path: '/systemManage/authManage',
          name: 'authManage',
          component: (resolve) => {
            require(['@/views/systemManage/authManage.vue'], resolve);
          },
        },
        { // 系统管理=》日志管理
          path: '/systemManage/logManage',
          name: 'logManage',
          component: (resolve) => {
            require(['@/views/systemManage/logManage.vue'], resolve);
          },
        },
        {
          path: '/brandMana',
          name: 'brandMana',
          component: () => import('@/views/dataDictionary/BrandMana.vue'),
        },
        {
          path: '/variableMana',
          name: 'variableMana',
          component: () => import('@/views/dataDictionary/VariableMana.vue'),
        },
        {
          path: '/pointLocaMana',
          name: 'pointLocaMana',
          component: () => import('@/views/dataDictionary/PointLocaMana.vue'),
        },
        {
          path: '/typeMana',
          name: 'typeMana',
          component: () => import('@/views/dataDictionary/TypeMana.vue'),
        },
        {
          path: '/deviceTreeMana',
          name: 'deviceTreeMana',
          component: () => import('@/views/dataDictionary/DeviceTreeMana.vue'),
        },
        {
          path: '/layoutTypeMana',
          name: 'layoutTypeMana',
          component: () => import('@/views/dataDictionary/LayoutTypeMana.vue'),
        },
        {
          path: '/layoutMana',
          name: 'layoutMana',
          component: () => import('@/views/dataDictionary/LayoutMana.vue'),
        },
        {
          path: '/assetsTable',
          name: 'assetsTable',
          component: () => import(/* webpackChunkName: "about" */ '@/views/assetsManage/AssetsTable.vue'),
        },
        {
          path: '/addAssets',
          name: 'addAssets',
          component: () => import(/* webpackChunkName: "about" */ '@/views/assetsManage/AddAssets.vue'),
        },
        {
          path: '/assetsDetails',
          name: 'assetsDetails',
          component: () => import(/* webpackChunkName: "about" */ '@/views/assetsManage/DeviceDetails.vue'),
        },
        {
          path: '/modelManage',
          name: 'modelManage',
          component: () => import(/* webpackChunkName: "about" */ '@/views/appCenter/modelManage.vue'),
        },
        {
          path: '/modelManageDetail',
          name: 'modelManageDetail',
          component: () => import(/* webpackChunkName: "about" */ '@/views/appCenter/modelManageDetail.vue'),
        },
      ],
    },
    {
      path: '/getechLogin',
      name: 'login',
      // component: () => import('@/views/login/index.vue'),
      component: (resolve) => {
        require(['@/views/login/index.vue'], resolve);
      },
    },
    {
      path: '/modelingTool',
      name: 'modelingTool',
      component: (resolve) => {
        require(['@/views/modelingTool/ModelingTool.vue'], resolve);
      },
      children: [
        {
          path: '/modelParams',
          name: 'modelParams',
          component:  () => import(/* webpackChunkName: "about" */ '@/views/modelingTool/modelParams.vue'),
        },
        {
          path: '/modelVariable',
          name: 'modelVariable',
          component:  () => import(/* webpackChunkName: "about" */ '@/views/modelingTool/modelVariable.vue'),
        },
      ],
    },
    {
      path: '/*',
      redirect: '/',
    },
  ],
});

router.beforeEach((to: any, from: any, next: any) => {
  const token = getCookie('token');
  if (!token && to.path !== '/getechLogin') {
    // -------单点登录--------
    window.location.href = 'http://siam.csot.tcl.com/login?service=http://iotmgt.csot.tcl.com/ssologin';
    return;
  }
  if (!token && to.path === '/getechLogin') {
    // 公共账号登录
    next();
  } else if (token && (to.path === '/' || to.path === '/getechLogin' || to.matched.length === 0)) {
    if (!localStorage.getItem('roleAuth')) {
      utils.refreshPermission().then(() => {
        next('/alarmCenter');
      });
    } else {
      next('/alarmCenter');
    }
  } else {
    if (token) {
      utils.decodeJwt();
    }
    if (!localStorage.getItem('roleAuth')) {
      utils.refreshPermission().then(() => {
        next();
      });
    } else {
      next();
    }
  }
});

export default router;
