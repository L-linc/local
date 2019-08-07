import Vue from 'vue';
import axios from 'axios';
import * as utils from '@/config/utils';
import { freshToken } from '@/api/login';

const instance = axios.create({
  timeout: 10000,
});

// 存储请求的数组
const subscribesArr: any[] = [];

// 请求push到数组中
function subscribesArrRefresh(cb: any) {
  subscribesArr.push(cb);
}

// 用新token发起请求
function reloadSubscribesArr(newToken: string) {
  subscribesArr.map(cb => cb(newToken));
}

instance.defaults.headers.post['Content-Type'] = 'application/json';

// request拦截器,增加token等
instance.interceptors.request.use(
  (config: any) => {
    const token = utils.getCookie('token');
    if (token && config.url !== '/api/auth/refreshToken' && utils.isExp() === 1) {
      // token失效，刷新token
      freshToken().then((res: any): any => {
        reloadSubscribesArr(res.data.token);
      });
      const retry = new Promise((resolve, reject) => {
        subscribesArrRefresh((newToken: string) => {
          config.headers.Authorization = 'Bearer ' + newToken;
          resolve(config);
        });
      });
      return retry;
    } else if (token && config.url !== '/api/auth/refreshToken' && utils.isExp() === 2) {
      // refreshToken失效
      utils.logout();
    }
    config.headers.Authorization = `Bearer ` + token;
    return config;
  },
  (error: any) => {
    console.log(error);
    Promise.reject(error);
  },
);

// response 拦截器
instance.interceptors.response.use((response) => {
  return response;
}, (error: any) => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        Vue.prototype.$Message.error(error.response.data.message || '请求参数异常');
        break;
      case 401:
        // Vue.prototype.$Message.error('登陆已失效，请重新登陆');
        Vue.prototype.$Modal.error({
          title: '登陆已失效，请重新登陆',
          onOk: () => {
            utils.logout();
          },
        });
        break;
      case 402:
        // Vue.prototype.$Message.error('登陆已失效，请重新登陆');
        Vue.prototype.$Modal.error({
          title: '权限变动，请重新登陆',
          onOk: () => {
            utils.logout();
          },
        });
        break;
      case 403:
        Vue.prototype.$Message.error(error.response.data.message || '无访问权限，请联系管理员');
        break;
      case 423:
        // 405, 被禁用账号登录平台显示
        Vue.prototype.$Modal.error({
          title: '请联系管理员（先进制造部数字化创新科）开通权限！',
          onOk: () => {
            utils.logout();
          },
        });
        break;
      default:
        Vue.prototype.$Message.error(error.response.data.message || '服务端异常，请联系技术支持');
    }
  }
  return Promise.reject(error);
});

export default instance;
