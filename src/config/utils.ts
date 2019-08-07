import Vue from 'vue';
import { freshToken } from '@/api/login';
import { getAuthApi } from '@/api/login';

const jwt: any = require('jsonwebtoken');
// import jwt from '@types/jsonwebtoken';
/**
 * 需要优化按需引入，只需要引入$Message
 */
// import iView from 'iview';
// Vue.use(iView);

// http错误处理
const catchError = (error: any) => {
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
            logout();
          },
        });
        break;
      case 403:
        Vue.prototype.$Message.error(error.response.data.message || '无访问权限，请联系管理员');
        break;
      default:
        Vue.prototype.$Message.error(error.response.data.message || '服务端异常，请联系技术支持');
    }
  }
  return Promise.reject(error);
};

// 获取一级域名
const getDomain = () => {
  let host = location.hostname;
  const ip = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
  if (ip.test(host) === true || host === 'localhost') {return host; }
  const regex = /([^]*).*/;
  const match = host.match(regex);
  if (typeof match !== 'undefined' && null !== match) {host = match[1]; }
  if (typeof host !== 'undefined' && null !== host) {
    const strAry = host.split('.');
    if (strAry.length > 1) {
      host = strAry[strAry.length - 2] + '.' + strAry[strAry.length - 1];
    }
  }
  return '.' + host;
};

// 获取cookie
const getCookie = (cname: string) => {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (let c of ca) {
    while (c.charAt(0) === ' ') {c = c.substring(1); }
    if (c.indexOf(name) !== -1) {return c.substring(name.length, c.length); }
  }
  return '';
};

// cookie设置
const setCookie = (cname: string, value: string, expiredays: any = null) => {
  const exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = cname + '=' + escape(value) + ((expiredays == null) ? '' : ';expires=' + exdate.toUTCString()) + ';domain=' + getDomain() + ';path=/;';
};

/**
 * 刷新权限
 */
const refreshPermission = () => {
  return new Promise((reslove, reject) => {
    getAuthApi().then((resp: any) => {
      const NOTE = JSON.stringify(resp.data);
      localStorage.setItem('roleAuth', NOTE);
      reslove();
    });
  });
 };

/**
 * 登录退出
 */
const logout = () => {
  setCookie('token', '', -1);
  setCookie('refreshToken', '', -1);
  sessionStorage.clear();
  localStorage.clear();
  // 单点登录退出
  window.location.href = 'http://siam.csot.tcl.com/logout?service=http://iotmgt.csot.tcl.com/logout';
};

// 解析jwt，获取用户信息和权限内容
interface TOKEN {
  CODE: string;
  email: string;
  enabled: boolean;
  exp: number;
  iat: number;
  realName: string;
  sub: string;
  userId: string;
  userName: string;
}

interface REFRESHTOKEN {
  exp: number;
  iat: number;
  sub: string;
}

/**
 * 判断是否过期
 * @returns {number}  1:token过期；2：refreshToken过期
 */
const isExp = () => {
  const tokenData: TOKEN = jwt.decode(getCookie('token'));
  const refreshToken: REFRESHTOKEN = jwt.decode(getCookie('refreshToken'));
  const now = new Date().valueOf();
  if (now > tokenData.exp * 1000 && now < refreshToken.exp * 1000) {
    return 1;
  } else  if (now > refreshToken.exp * 1000) {
    return 2;
  }
  return null;
};

/**
 * 解析token,获取身份信息
 */
const getUserId = () => {
  return jwt.decode(getCookie('token'));
};

/**
 * 解析token
 */
const decodeJwt = () => {
  const expFlag = isExp();
  if (expFlag === 1) {
    // 刷新token
    freshToken();
  } else if (expFlag === 2) {
    // refreshToken过期，退出登录
    logout();
  }
};

/**
 * 将时间格式化成标准时间对象，兼容IE
 * @param {string} str ex: '2018-10-1 20:54:33.274';
 * @return {Date} 返回标准格式的时间对象
 */
function formatDate(str: string): Date  {
  const day: any[] = str.split(' ');
  const days: any[] = day[0].split('-');
  const mi: any[] = day[day.length - 1].split(':');
  const date: Date  = new Date();
  date.setUTCFullYear(days[0], days[1] - 1, days[2]);
  date.setUTCHours(mi[0] - 8, mi[1], mi[2]);
  return date;
}

function timeFormate(time?: number | string) {
  time = time || new Date().getTime();
  const timeEle = new Date(time);
  const year = timeEle.getFullYear();
  const month = timeEle.getMonth() + 1;
  const day = timeEle.getDate();
  const hours = timeEle.getHours();
  const minute = timeEle.getMinutes();
  const second = timeEle.getSeconds();
  return `${year}/${month > 9 ? month : '0' + month}/${day > 9 ? day : '0' + day} ${hours > 9 ? hours : '0' + hours}:${minute > 9 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`;
}

export {
  catchError,
  getCookie,
  getDomain,
  setCookie,
  decodeJwt,
  formatDate,
  timeFormate,
  logout,
  isExp,
  refreshPermission,
  getUserId,
};
