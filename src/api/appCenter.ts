/**
 * 应用中心接口
 */
import instance from './index';

// 应用列表-获取列表
interface GetAppListParams {
    page: number;
    size: number;
    name: string;
    describe: string;
    isPublish?: number;
}
const getAppList = (params: GetAppListParams) => {
    return instance.post('/api/appcenter/viewTools', params);
};

// 应用列表-删除
interface DelAppParams {
    id: string;
}
const delApp = (params: DelAppParams) => {
    return instance.delete(`/api/viewtool/${params.id}`);
};

// 应用列表-发布
interface ReleaseAppParams {
    id: string;
    push: number;
}
const releaseApp = (params: ReleaseAppParams) => {
    return instance.put(`/api/viewtool/publish/${params.id}/${params.push}`);
};

// 报表管理接口 查询全部报表或按名称模糊查询报表
interface GetChartsParams {
    page: number;
    size: number;
    name?: string;
}
const getCharts = (params: GetChartsParams) => {
    return instance.post('/api/charts', params);
};

// 根据ID查询报表 查询单个
interface GetChartParams {
    id: string;
}
const getChart = (params: GetChartParams) => {
    return instance.get(`/api/chart/${params.id}`);
};

// 新增报表
interface AddChartParams {
    url: string;
    descript: string;
    name: string;
}
const addChart = (params: AddChartParams) => {
    return instance.post('/api/chart/', params);
};

// 修改报表
interface EditChartParams {
    url: string;
    descript: string;
    name: string;
    id: string;
}
const editChart = (params: EditChartParams) => {
    return instance.put(`/api/chart/${params.id}`, params);
};

// 删除报表
interface DelChartsParams {
    ids: any;
}
const delCharts = (params: DelChartsParams) => {
    return instance.post('/api/charts/del', params.ids);
};

// 查询模型列表
interface GetModalListParams {
    name: string;
    isPublish?: number;
}
const getModelList = (params: GetModalListParams) => {
    return instance.post('/api/appcenter/models', params);
};

// 根据模型ID查询模型应用
interface GetModelAppListParams {
    id: string;
    viewToolName: string;
    modelRule: string;
    page: number;
    size: number;
}
const getModelAppList = (params: GetModelAppListParams) => {
    return instance.post(`/api/model/viewTools`, params);
};

// 删除模型应用
interface DeleteModelAppParams {
    modelToolId: string;
}
const deleteModelApp = (params: DeleteModelAppParams) => {
    return instance.delete(`/api/model/viewTool/${params.modelToolId}`);
};

// 发布模型
interface GetModelPublishParams {
    id: string;
}
const getModelPublish = (params: GetModelPublishParams) => {
    return instance.get(`/api/model/publish/${params.id}`);
};

export default{
    getAppList,
    delApp,
    releaseApp,
    getCharts,
    getChart,
    addChart,
    editChart,
    delCharts,
    getModelList,
    getModelAppList,
    deleteModelApp,
    getModelPublish,
};
