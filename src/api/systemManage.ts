/**
 * 系统管理模块相关接口
 */
import instance from './index';
// 根据输入信息获取部门列表
interface GetOrgInfoApiParams {
  orgName: string;
}
// const getOrgInfoApi = (params: GetOrgInfoApiParams) => {
//   return instance.post(`/api/org`, params);
// };
interface OrgName {
  orgName: string;
}
const allOrgsApi = (params: OrgName) => {
  return instance.post('/api/org', params); // 返回全部组织机构,无请求参数
};

const getUsersInfoList = (params: string) => { // 返回用于数据
  return instance.get(`/api/users?${params}`);
};
interface PartOrgsTreeParams {
  pid: string;
}
const partOrgsTreeApi = (params: PartOrgsTreeParams) => { // 根据组织机构ID查询其下一级组织机构列表
  // return instance.get('/api/org/' + params.pid + '/items');
  return instance.get(`/api/org/${params.pid}/child`); // ES6写法
};
interface SetSingRoleToUserParams {
  userId: string;
  roleId: string;
}
const setSingRoleToUser = (params: SetSingRoleToUserParams) => { // 单个用户添加角色
  return instance.post('/api/role/user', params);
};
interface SetManyUserRoleParams {
  ids: any[];
  roleId: string;
}
const setManyUserRole = (params: SetManyUserRoleParams) => { // 多个用户添加角色
  return instance.post('/api/users/role', params);
};
interface SetRoleToOrgParams {
  roleId: string;
  orgId: string;
}
const setRoleToOrg = (params: SetRoleToOrgParams) => {// 赋予角色给部门
  return instance.post('/api/role/org', params);
};
interface ModifyUserStatusParams {
  ids: any[];
  status: string;
}
// 修改账户状态（开启，禁用）；
const modifyUserStatus = (params: ModifyUserStatusParams) => {
  return instance.post('/api/users/status', params);
};
// 修改部门状态（开启， 禁用）；
const modifyOrgStatus = (params: any) => {
  return instance.post('/api/org/status', params);
};
// 修改角色状态（开启， 禁用）；
const modifyRoleStatus = (params: any) => {
  return instance.post('/api/role/status', params);
};
// 同步oa数据
const syncDataFromOA = () => {
  return instance.get('/api/user/userSync');
};
interface OrgsUsersParams {
  id: string;
  pageSize: number;
  pageNum: number;
}
const orgsUsersApi = (params: OrgsUsersParams) => { // 根据组织机构ID返回用户列表
  // return instance.get('/api/org/' + params.id + '/users');
  return instance.get(`/api/org/${params.id}/users`); // ES6写法
};

interface RolesUsersParams {
  id: string;
  pageSize: number;
  pageNum: number;
}
const rolesUsersApi = (params: RolesUsersParams) => { // 根据角色ID返回用户列表
  // return instance.get('/api/role/' + params.id + '/users');
  return instance.get(`/api/role/${params.id}/users`); // ES6写法
};

interface OrgRoleModifyParams {
  id: string;
  roles: any[];
}
const orgRoleModifyApi = (params: OrgRoleModifyParams) => { // 修改组织机构的角色（增删角色ID关联，重复）
  // return instance.post('/api/org/' + params.id + '/roles', params);
  return instance.post(`/api/org/${params.id}/roles`, params); // ES6写法
};

interface RolesModifyParams {
  userIds: any[];
  roleIds: any[];
}
const rolesModifyApi = (params: RolesModifyParams) => { // 批量修改用户角色
  return instance.post(`/api/users/roles`, params);
};

// interface AllRolesParams {
//   page: string;
//   size: string;
//   sort: string;
// }
const allRolesApi = () => { // 查询所有角色
  return instance.get(`/api/roles/tree`);
  // return instance.get('/api/role/search');
};

// const allPermissionsApi = () => { // 查询所有角色
//   return instance.get(`/api/permissions`);
// };

const getPermission = () => { // 获取权限信息
  return instance.get(`/api/permissions`);
};

interface GetChildPermissionParams {
  id: number;
}
const getChildPermission = (params: GetChildPermissionParams) => { // 根据父权限获取子权限信息
  return instance.get(`/api/permissions/${params.id}/child`);
};

interface OpenChildPermissionParams {
  id: number;
  name: string;
  alias: string;
  pid: number;
  status: string;
}
const openChildPermission = (params: OpenChildPermissionParams) => { // 根据父权限获取子权限信息(qiyong )
  return instance.post(`/api/permission/status`, params);
};

interface EditChildPermissionParams {
  id: number;
  name: string;
  alias: string;
  pid: number;
  status: string;
}
const editChildPermission = (params: EditChildPermissionParams) => { // 根据父权限获取子权限信息(qiyong )
  return instance.post(`/api/permissions`, params);
};

interface DelChildPermissionParams {
  id: number;
}

const canDelChildPermission = (params: DelChildPermissionParams) => { // 删除子权限信息
  return instance.get(`/api/permissions/${params.id}/validate`);
};

const delChildPermission = (params: DelChildPermissionParams) => { // 删除子权限信息
  return instance.delete(`/api/permissions/${params.id}`);
};


/**
 * 日志管理
 */
interface GetLogsApiParams {
  logType: number;
  userName: string;
  page: string;
  size: string;
  startTime: string;
  endTime: string;
}
const getLogsApi = (params: GetLogsApiParams) => {
  return instance.post(`/api/operationlog/search`, params);
};

/**
 * 角色
 * @param actual
 */

// 角色列表
interface GetRoleListApiParams {
  page: string;
  size: string;
  name: string;
}
const getRoleListApi = (params: GetRoleListApiParams) => {
  return instance.get(`/api/role/search?${toQueryString(params)}`);
};

// 新增和编辑角色
interface AddRoleApiParams {
  name: string;
  remark: string;
  permissions: any;
  id: string;
}
const addRoleApi = (params: AddRoleApiParams, type: any) => {
  if (type === 'edit') {
    return instance.put(`/api/roles`, params);
  } else {
    return instance.post(`/api/roles`, params);
  }
};
// 获取权限列表
const getAllPermissionApi = () => {
  return instance.get(`/api/permissions`);
};

// 删除角色
interface DeleteRoleApiParams {
  id: any;
}
const deleteRoleApi = (params: DeleteRoleApiParams) => {
  return instance.delete(`/api/roles/${params.id}`);
};
// 获取角色是否可删除
interface GetRoleIfCanDelParams {
  id: any;
}
const getRoleIfCanDelApi = (params: GetRoleIfCanDelParams) => {
  return instance.get(`/api/role/check/${params.id}`);
};

// 角色对员工授权
interface AddRoleToUserApiParams {
  userId: string;
  roleId: string;
}
const addRoleToUserApi = (params: AddRoleToUserApiParams) => {
  return instance.post(`/api/role/user`, params);
};
// 根据员工信息获取员工ID
interface GetUserInfoApiParams {
  keyword: string;
}
const getUserInfoApi = (params: GetUserInfoApiParams) => {
  return instance.get(`/api/users?${toQueryString(params)}`);
};
// 根据工号精确匹配
interface GetUserInfoByCodeParams {
  code: string;
}
const getUserInfoByCode = (params: GetUserInfoByCodeParams) => {
  return instance.post(`/api/users/fullmatch?`, params);
};


// 角色对部门授权
interface AddRoleToOrgApiParams {
  orgId: string;
  roleId: string;
}
const addRoleToOrgApi = (params: AddRoleToOrgApiParams) => {
  return instance.post(`/api/role/org`, params);
};
// 根据输入信息获取部门列表
interface GetOrgInfoApiParams {
  orgName: string;
}
const getOrgInfoApi = (params: GetOrgInfoApiParams) => {
  return instance.post(`/api/org`, params);
};

const cleanArray = (actual: any) => {
  const newArray = [];
  for (const i of actual) {
    if (i) {
      newArray.push(i);
    }
  }
  return newArray;
};
const toQueryString = (obj: any) => { // 将一个对象转成QueryString
  if (!obj) { return ''; }
  return cleanArray(
    Object.keys(obj).map(key => {
      if (obj[key] === undefined) { return ''; }
        // return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
      return key + '=' + obj[key];
    }),
  ).join('&');
};

export default {
  allOrgsApi,
  partOrgsTreeApi,
  orgsUsersApi,
  rolesUsersApi,
  orgRoleModifyApi,
  rolesModifyApi,
  allRolesApi,
  // allPermissionsApi,
  getPermission,
  getLogsApi,
  getUsersInfoList,
  setSingRoleToUser,
  setManyUserRole,
  modifyUserStatus,
  setRoleToOrg,
  getOrgInfoApi,
  modifyOrgStatus,
  modifyRoleStatus,
  syncDataFromOA,
  getChildPermission,
  openChildPermission,
  editChildPermission,
  canDelChildPermission,
  delChildPermission,
  getRoleListApi,
  addRoleApi,
  deleteRoleApi,
  getRoleIfCanDelApi,
  addRoleToUserApi,
  getUserInfoApi,
  getUserInfoByCode,
  addRoleToOrgApi,
  getAllPermissionApi,
};
