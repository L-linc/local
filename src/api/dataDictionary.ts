/**
 * 数据字典添加，删除，编辑，更新接口，设备树和layout管理；
 */
import instance from './index';

interface AddTypeParams {
  name: any;
  value: string;
  description: string;
  alias: string;
  parentId: string;
  type: string;
}

interface EditTypeParams {
  name: string;
  value: string;
  description: string;
  alias: string;
  parentId: string;
  type: string;
  id: number;
}

interface DeleteTypeParams {
  id: string;
}

interface SelectTypeParams {
  params: string;
}

interface SelectPointsParams {
  paramStr: string;
}

interface SelectPointParams {
  id: number;
}

interface SelectTreeParams {
  urlStr: string;
}

interface AddTreeParams {
  title: string;
  type: string;
  parent: string;
  descript: string;
}

interface EditTreeParams {
  title: string;
  parent: number;
  id: number;
  type: string;
  descript: string;
}

interface DeleteTreeParams {
  id: number;
}

interface AddLaTypeParams {
  location: string;
  name: string;
  descript: string;
  resUrl: string;
}

interface EditLaTypeParams {
  location: string;
  name: string;
  descript: string;
  resUrl: string;
  id: string;
}

interface DeleteLaTypeParams {
  id: string;
}

interface SelectLayoutParams {
  id: string;
}

interface AddLayoutParams {
  layoutType: string;
  layoutName: string;
  desc: string;
  resUrl: string;
}

interface EditLayoutParams {
  layoutType: string;
  layoutName: string;
  desc: string;
  resUrl: string;
  id: string;
}

interface DeleteLayoutParams {
  id: string;
}

interface AddCollTypeParams {
  id?: string;
  name: string;
  alias: string;
  category: string;
  params: any;
}

interface CollTypeListParams {
  params: string;
}

interface DelCollTypeParams {
  id: string;
}

interface GetTreeChildrenParams {
  id: number;
}

interface GetSearchChildrenParams {
  title: string;
}

interface CanDelChildrenParams {
  id: number;
}

const addType = (params: AddTypeParams) => {
  return instance.post('/api/dictionary', params);
};

const editType = (params: EditTypeParams) => {
  return instance.put('/api/dictionary', params);
};

const deleteType = (params: DeleteTypeParams) => {
  return instance.delete(`/api/dictionary/${params.id}`);
};

const selectType = (params: SelectTypeParams) => {
  return instance.get(`/api/dictionaries?${params.params}`);
};

const selectPoints = (params: SelectPointsParams) => {
  return instance.get(`/api/pointType/point?${params.paramStr}`);
};

const selectPoint = (params: SelectPointParams) => {
  return instance.get(`/api/pointType/${params.id}`);
};

const selectTree = (params: SelectTreeParams) => {
  return instance.get(`/api/locations/tree`);
};

const addtTree = (params: AddTreeParams) => {
  return instance.post(`/api/location`, params);
};

const editTree = (params: EditTreeParams) => {
  return instance.put(`/api/location`, params);
};

const DeleteTree = (params: DeleteTreeParams) => {
  return instance.delete(`/api/location/${params.id}`);
};

const selectLaType = () => {
  return instance.get(`/api/layoutTypes`);
};

const addLaType = (params: AddLaTypeParams) => {
  return instance.post(`/api/layoutType`, params);
};

const editLaType = (params: EditLaTypeParams) => {
  return instance.put(`/api/layoutType`, params);
};

const deletetLaType = (params: DeleteLaTypeParams) => {
  return instance.delete(`/api/layoutType/${params.id}`);
};

const selectLayout = (params: SelectLayoutParams) => {
  return instance.get(`/api/layoutType/${params.id}/layouts`);
};

const addLayout = (params: AddLayoutParams) => {
  const config = {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
  };
  return instance.post(`/api/layout`, params, config);
};

const editLayout = (params: EditLayoutParams) => {
  return instance.put(`/api/layout`, params);
};

const deleteLayout = (params: DeleteLayoutParams) => {
  return instance.delete(`/api/layout/${params.id}`);
};

const collTypeList = (params: CollTypeListParams) => {
  return instance.get(`/api/pointType/param?${params.params}`);
};

const delCollType = (params: DelCollTypeParams) => {
  return instance.delete(`/api/pointType/${params.id}`);
};

const addCollType = (params: AddCollTypeParams) => {
  return instance.post(`/api/pointType/add`, params);
};

const EditCollType = (params: AddCollTypeParams) => {
  return instance.put(`/api/pointType`, params);
};

const dataSouList = (params: CollTypeListParams) => {
  return instance.get(`/api/category`);
};

const varDataFormatList = (params: CollTypeListParams) => {
  return instance.get(`/api/dataType`);
};

const getTreeChildren = (params: GetTreeChildrenParams) => {
  return instance.get(` /api/locations/children?id=${params.id}`);
};

const getSearchChildren = (params: GetSearchChildrenParams) => {
  return instance.get(` /api/locations/search?title=${params.title}`);
};

const canDelChildren = (params: CanDelChildrenParams) => {
  return instance.get(` /api/location/check/${params.id}`);
};

// 查询全部layoutType
interface GetAllLayoutTypeParams {
  page: number;
  size: number;
}
const getAllLayoutType = (params: GetAllLayoutTypeParams) => {
  return instance.post('/api/layoutTypes', params);
};

// 	查询layout相册详情
interface GetLayoutTypeDetailParams {
  id: string;
}
const getLayoutTypeDetail = (params: GetLayoutTypeDetailParams) => {
  return instance.get(`/api/layoutType/${params.id}`);
};

// 添加layout相册
interface AddLayoutTypeParams {
  location: number;
  descript: string;
}
const addLayoutType = (params: AddLayoutTypeParams) => {
  return instance.post(`/api/layoutType`, params);
};

// 删除layout相册
interface DelLayoutTypeParams {
  id: number;
}
const delLayoutType = (params: DelLayoutTypeParams) => {
  return instance.delete(`/api/layoutType/${params.id}`);
};

// 修改layout相册
interface EditLayoutTypeParams {
  location: number;
  descript: string;
  id: string;
}
const editLayoutType = (params: EditLayoutTypeParams) => {
  return instance.put(`/api/layoutType`, params);
};

// 设置layout相册封面
interface SetCoverParams {
  id: number;
  layoutId: number;
}
const setCover = (params: SetCoverParams) => {
  return instance.put(`/api/layoutType/cover`, params);
};

// 修改layout
interface EditedLayoutParams {
  id: number;
  layoutName: string;
  descript: string;
}
const editedLayout = (params: EditedLayoutParams) => {
  return instance.put(`/api/layout/`, params);
};

// 删除layout
interface DeletedLayoutParams {
  id: number;
}
const deletedLayout = (params: DeletedLayoutParams) => {
  return instance.delete(`/api/layout/${params.id}`);
};

// 获取图片服务器地址
const getImgLoc = () => {
  return instance.get(`/api/image/host`);
};

// 资产类型列表
interface GetAssetsListParams {
  title: string;
  page: number;
  size: number;
}
const getAssetsList = (params: GetAssetsListParams) => {
  return instance.post(`/api/assertTypes`, params);
};

// 资产类型添加
interface AddAssetsParams {
  title: string;
}
const addAsset = (params: AddAssetsParams) => {
  return instance.post(`/api/assertType`, params);
};

// 资产类型修改
interface EditAssetsParams {
  id: string;
  title: string;
}
const editAsset = (params: EditAssetsParams) => {
  return instance.put(`/api/assertType`, params);
};

// 资产类型删除
interface DelAssetsParams {
  id: string;
}
const delAsset = (params: DelAssetsParams) => {
  return instance.delete(`/api/assertType/${params.id}`);
};

// 模拟接入
const mockInsert = () => {
  return instance.get(`/api/someParams`);
};

export default {
  addType,
  editType,
  deleteType,
  selectType,
  selectPoints,
  selectPoint,
  selectTree,
  addtTree,
  editTree,
  DeleteTree,
  selectLaType,
  addLaType,
  editLaType,
  deletetLaType,
  selectLayout,
  addLayout,
  editLayout,
  deleteLayout,
  collTypeList,
  delCollType,
  EditCollType,
  dataSouList,
  varDataFormatList,
  addCollType,
  getTreeChildren,
  getSearchChildren,
  canDelChildren,
  getAllLayoutType,
  getLayoutTypeDetail,
  editedLayout,
  deletedLayout,
  addLayoutType,
  editLayoutType,
  delLayoutType,
  setCover,
  getImgLoc,
  getAssetsList,
  addAsset,
  editAsset,
  delAsset,
  mockInsert,
};
