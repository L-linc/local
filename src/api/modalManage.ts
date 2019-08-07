import instance from './index';

// 根据输入信息获取部门列表
interface GetOrgInfoApiParams {
    orgName: string;
}
const getOrgInfoApi = (params: GetOrgInfoApiParams) => {
    return instance.post(`/api/org`, params);
};
// 参数库列表
const getParamsModelLibrary = () => {
    return instance.post('/api/constant/librarys', {});
};
// 参数名称列表
const getParamsModelStore = (params: any) => {
    return instance.post(`/api/constants`, params);
};
// 添加参数
const addParamsToModelStore = (params: any) => {
    return instance.post(`/api/constant`, params);
};

// 修改参数库
const modifyParamsLibrary = (params: any) => {
    return instance.put(`/api/constant/library`, params);
};


// 变量列表
const getVariableList = (params: any) => {
    return instance.post(`/api/varietys`, params);
};
// 字段列表
const getFieldList = (params: any) => {
    return instance.post(`/api/fields`, params);
};
// 修改变量库
const modifyVaribaleLibrary = (params: any) => {
    return instance.put(`/api/variety/library`, params);
};
// 获取模板模板
const getAlarmModel = () => {
    return instance.get(`/api/madeModel/warnTemplates`);
};
// 请求所有应用的接口
const getAllApplication = () => {
    return instance.post(`/api/viewtools`, {isPublish: 1});
};

// 获取采集点, 采集点类型, 参数等数据接口
const getPointTypeParams = () => {
    return instance.get(`/api/pointTypes`);
};
// 根据采集点id,获取采集点位置
const getPointNameFromPointId = (params: any) => {
    return instance.post(`/api/location/locationName`, params);
};
// 查询模型列表
const getModalList = (params: any) => {
    return instance.post('/api/appcenter/models', params);
};
// 查询模型应用
const getModalAppList = (params: any) => {
    return instance.post(`/api/model/viewTools`, params);
};
// 添加模型应用
const addModalApp = (params: any) => {
    return instance.post('/api/model/viewTool', params);
};

// 设置模型应用
const setModalApp = (params: any) => {
    return instance.put('/api/model/viewTool', params);
};
// 删除模型应用
const deleteModalApp = (modelAppId: any) => {
    return instance.delete(`/api/model/viewTool/${modelAppId}`);
};

// 根据模型id查模型
const getModelDetailFromModelId = (id: any) => {
    return instance.get(`/api/model/${id}`);
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

// 获取报警方式
const getAlarmType = () => {
    return instance.get(`/api/madeModel/warnTypes`);
};

export default {
    getAlarmModel,
    getAllApplication,
    getPointTypeParams,
    // 模型应用
    getOrgInfoApi,
    getModalList,
    getModalAppList,
    addModalApp,
    setModalApp,
    deleteModalApp,
    getModelDetailFromModelId,
    getPointNameFromPointId,
    // 参数库
    getParamsModelLibrary,
    getParamsModelStore,
    addParamsToModelStore,
    modifyParamsLibrary,
    // 变量库
    getVariableList,
    getFieldList,
    modifyVaribaleLibrary,
    getAlarmType,
};
