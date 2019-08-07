/**
 * 数据字典添加，删除，编辑，更新接口，设备树和layout管理；
 */
import instance from './index';

interface AddAssetParams {
  title: any;
  assetType: string;
  locationId: string;
}

interface DelAssetsParams {
  id: string;
}

interface AssetsListParam {
  params: string;
  id?: string;
  assetType?: string;
}

interface GetAssetParam {
  id: string;
}

interface GetCycleParam {
  id: string;
  params: string;
}

interface SelectTreeParam {
  assetType: string;
  title: string;
  isAsset: number;
}

interface GetTreeChildParam {
  id: string;
  isAsset: number;
}

interface AssetsListPageParam {
  page: number;
  size: number;
  locationId: string;
}

const addAsset = (params: AddAssetParams) => {
  return instance.post('/api/asset', params);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const addAssetTable = (params: AssetsListParam) => {
  return instance.get(`/api/asset/location/${params.id}/${params.assetType}`);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const delAssets = (params: DelAssetsParams) => {
  return instance.delete(`/api/asset/${params.id}`);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const asetsList = (params: AssetsListParam) => {
  return instance.get(`/api/assets?${params.params}`);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const getAsset = (params: GetAssetParam) => {
  return instance.get(`/api/asset/${params.id}`);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const getCycle = (params: GetCycleParam) => {
  return instance.get(`/api/${params.id}/lifeCycle/?${params.params}`);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const getDvAlarm = (params: GetCycleParam) => {
  return instance.get(`/api/asset/${params.id}/alarms/?${params.params}`);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const selectTree = (params: SelectTreeParam) => {
  return instance.post(`/api/asset/navigation`, params);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const getTreeChild = (params: GetTreeChildParam) => {
  return instance.post(`/api/asset/navigation/${params.id}`, params);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

interface GetAllAssetTypeParam {
  isUse: number;
}
const getAllAssetType = (param: GetAllAssetTypeParam) => {
  return instance.get(`/api/asset/type/?isUse=${param.isUse}`);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const getAllAssetTypes = () => {
  return instance.get(`/api/asset/type`);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

const assetListPage = (params: AssetsListPageParam) => {
  return instance.post(`/api/asset/locations`, params);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

interface SearAssetsParam {
  assetType: number|string;
  title: string;
  page: number;
  size: number;
}

const searAssets = (params: SearAssetsParam) => {
  return instance.post(`/api/asset/location/search`, params);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

interface EditAssetParams {
  title: any;
  assetType: string;
  locationId: string;
  assetId: string;
}
const editAsset = (params: EditAssetParams) => {
  return instance.put('/api/asset', params);
  // sync mock
  // return new Promise((resolve, reject) => {
  //   resolve({});
  // });
};

export default {
  searAssets,
  addAsset,
  addAssetTable,
  delAssets,
  asetsList,
  getAsset,
  getCycle,
  getDvAlarm,
  selectTree,
  getTreeChild,
  getAllAssetType,
  getAllAssetTypes,
  assetListPage,
  editAsset,
};
