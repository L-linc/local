/**
 * 登录接口，无需权限管理，所有人都有登录权限
 */
import instance from './index';
import { getCookie, setCookie, decodeJwt } from './../config/utils';


interface LoginParams {
  username: string;
  password: string;
}

const loginApi = (params: LoginParams) => {
  return instance.post('/api/auth/login', params);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({name: params.username});
  // });
};

// 获取当前用户权限
const getAuthApi = () => {
  return instance.get(`/api/permissions/user`);
};

const freshToken = () => {
  const refreshToken = getCookie('refreshToken');
  return new Promise((resolve, reject) => {
    instance.post('/api/auth/refreshToken', {refreshToken}).then(res => {
     setCookie('token', res.data.token);
     setCookie('refreshToken', res.data.refreshToken);
     decodeJwt();
     resolve(res);
    });
  });
};

export {
  loginApi,
  getAuthApi,
  freshToken,
};
