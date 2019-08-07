import Vue from 'vue';
import App from './App.vue';
import router from './router/';
import store from './store/';
import iView from 'iview';
import './style/theme.less';

Vue.use(iView, {
  modal: {
    maskClosable: false,
  },
});
Vue.config.productionTip = false;

// 权限指令
Vue.directive('has', {
  inserted: (el: any, binding) => {
    if (!Vue.prototype.$_has(binding.value)) {
      el.parentNode.removeChild(el);
    }
  },
  // inserted: (el: any, binding, vnode: any) => {
  //   console.log(vnode.context.$route);
  //   let btnPermissions = vnode.context.$route.meta.btnPermissions.split(',');
  //   console.log(btnPermissions);
  //   if (!Vue.prototype.$_has(btnPermissions)) {
  //     el.parentNode.removeChild(el);
  //   }
  // },
});
// 权限检查方法
Vue.prototype.$_has = (value: any) => {
  let isExist = false;
  const buttonpermsStr = localStorage.getItem('roleAuth');
  if (buttonpermsStr === undefined || buttonpermsStr === null ) {
    return false;
  }
  const buttonperms = JSON.parse(buttonpermsStr);
  if (buttonperms.includes('ADMIN')) {
    return true;
  }
  for (const i of buttonperms) {
    if (i.indexOf(value) > -1) {
      isExist = true;
      break;
    }
  }
  return isExist;
};

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
