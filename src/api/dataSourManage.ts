/**
 * 数据字典添加，删除，编辑，更新接口，设备树和layout管理；
 */
import instance from './index';

interface AddPointParams {
  name: string;
  uploadType?: string;
  uploadProto: string;
  pointType: any;
  location?: string;
  topic?: string;
  host?: string;
  tbRvInterface?: string;
  subnetMask?: string;
  connectString?: string;
  isAsset?: string;
  sensor?: any;
}

interface DeleteTypeParams {
  id: string;
}

interface GetInSensorListParams {
  uploadType: string;
}

interface AddSensorParams {
  name: string;
  gateway?: any;
  isAsset: string;
  location: any;
  gatewayType?: string;
  ip?: string;
}

interface DownLoadParams {
  str: string;
}


interface SelectPointsParams {
  paramStr: string;
}

interface SelectPointParams {
  id: number;
  type?: string;
}

interface GetPtypeListParams {
  type: string;
}

interface GetStatusListParams {
  type: string;
  category?: string;
}

interface GetTableDataParams {
  page: number;
  size: number;
  keyword: any;
  typeId: any;
  url: string;
  status: any;
}

interface GetSensorCycleParams {
  sid: string;
  typeId: string;
  pid: string;
}

interface GetPointALarmParams {
  page: number;
  size: number;
  type: string;
  status: string;
  startTime: any;
  endTime: any;
  sid?: any;
  id?: string;
  typeId?: string;
  pid?: string;
}

interface GetDataListParams {
  pointId: string;
  paramNames: any;
  sid?: string;
  type: string;
  startTs: number;
  endTs: number;
}

interface GetAllParamsParams {
  id: string;
  typeId: string;
}

interface EditDeviceParams {
  type: string;
  id: string;
  name: string;
  ip?: string;
  location: string;
  gatewayType?: string;
  sensorType?: string;
  brand?: string;
  gateway?: string;
}

const addPoint = (params: AddPointParams) => {
  return instance.post('/api/point', params);
};

const getProtos = () => {
  return instance.get('/api/point/protos');
};

const getReports = () => {
  return instance.get('/api/point/uploadType');
};

const getInSensorList = (params: GetInSensorListParams) => {
  return instance.get(`/api/sensor/uploadType/${params.uploadType}`);
};

const AddSensor = (params: AddSensorParams) => {
  return instance.post(`/api/sensor`, params);
};

const AddGateway = (params: AddSensorParams) => {
  return instance.post(`/api/gateway`, params);
};

const DownLoad = (params: DownLoadParams) => {
  return instance.get(`/api/point/download?${params.str}`);
};

const deleteType = (params: DeleteTypeParams) => {
  return instance.delete(`/api/dictionary/${params.id}`);
};

const getAllGateway = () => {
  return instance.get(`/api/gateway`);
};

const selectPoints = (params: SelectPointsParams) => {
  return instance.get(`/api/pointType/point?${params.paramStr}`);
};

const selectPoint = (params: SelectPointParams) => {
  return instance.get(`/api/pointType/point?pointTypeId=${params.id}`);
};

const getPtypeList = (params: GetPtypeListParams) => {
  return instance.get(`/api/points/category/count?category=${params.type}`);
};

const getDtypeList = (params: GetPtypeListParams) => {
  return instance.get(`/api/${params.type}/type/count`);
};

const getStatusList = (params: GetStatusListParams) => {
  if (params.category) {
    // 采集点类型
    return instance.get(`/api/points/status/count?category=${params.category}`);
  } else {
    // 设备类型
    return instance.get(`/api/${params.type}/status/count`);
  }
};

const getTableData = (params: GetTableDataParams) => {
  return instance.post(`/api/${params.url}`, params);
};

const getPointCycle = (params: SelectPointParams) => {
  return instance.get(`/api/${params.type}/lifecircle/${params.id}`);
};

const getSensorCycle = (params: GetSensorCycleParams) => {
  return instance.post(`/api/sensor/lifecircle`, params);
};

const getPointAlarm = (params: GetPointALarmParams) => {
  return instance.post(`/api/${params.type}/alarm`, params);
};

const getDvDetail = (params: SelectPointParams) => {
  return instance.get(`/api/${params.type}/${params.id}`);
};

const deLeteDevice = (params: SelectPointParams) => {
  return instance.delete(`/api/${params.type}/${params.id}`);
};

const getDataList = (params: GetDataListParams) => {
  return instance.post(`/api/${params.type}/param/data`, params);
};

const getAllParams = (params: GetAllParamsParams) => {
  return instance.get(`/api/point/params?id=${params.id}&typeId=${params.typeId}`);
};

const editDevice = (params: EditDeviceParams) => {
  return instance.put(`/api/${params.type}`, params);
};

// 获取所有sensor;
interface GetAllSensorsParams {
  isPaged: boolean;
}
const getAllSensors = (params: GetAllSensorsParams) => {
  return instance.post(`/api/sensors`, params);
};

// 网关新增绑定sensor
interface ChangeSensorsParams {
  id: boolean;
  sensorIds: string[];
}
const changeSensors = (params: ChangeSensorsParams) => {
  return instance.put(`/api/gateway/sensors`, params);
};

const getAllBrand = () => {
  return instance.get(`/api/brands`);
};

export default {
  addPoint,
  getProtos,
  getReports,
  getInSensorList,
  AddSensor,
  AddGateway,
  getAllGateway,
  DownLoad,
  selectPoints,
  selectPoint,
  getPtypeList,
  getDtypeList,
  getStatusList,
  getTableData,
  getPointCycle,
  getSensorCycle,
  getPointAlarm,
  getDvDetail,
  deLeteDevice,
  getDataList,
  getAllParams,
  editDevice,
  getAllSensors,
  changeSensors,
  getAllBrand,
};
