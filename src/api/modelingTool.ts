/**
 * 模型工具接口
 */
import instance from './index';

// 模型列表接口
interface GetModelListParams {
    name?: string;
    describe?: string;
    id?: string;
}
const getModelList = (params: GetModelListParams) => {
    return instance.post('/api/models', params);
};

const getVariableLibrarylList = (params: GetModelListParams) => {
    return instance.post('/api/variety/librarys', params);
};

const getParameterList = (params: GetModelListParams) => {
    return instance.post('/api/constant/librarys', params);
};

const addModel = (params: GetModelListParams) => {
    return instance.post('/api/model', params);
};

const copyModel = (params: GetModelListParams) => {
    return instance.get(`/api/model/copy/${params.id}`);
};

const deleteModel = (params: GetModelListParams) => {
    return instance.delete(`/api/model/${params.id}`);
};

const reNameModel = (params: GetModelListParams) => {
    return instance.put('/api/model/rename', params);
};

const addVar = (params: GetModelListParams) => {
    return instance.post('/api/variety/library', params);
};

const copyVar = (params: GetModelListParams) => {
    return instance.get(`/api/variety/library/copy/${params.id}`);
};

const deleteVar = (params: GetModelListParams) => {
    return instance.delete(`/api/variety/library/${params.id}`);
};

const reNameVar = (params: GetModelListParams) => {
    return instance.put('/api/variety/library/rename', params);
};

const addParam = (params: GetModelListParams) => {
    return instance.post('/api/constant/library', params);
};

const copyParam = (params: GetModelListParams) => {
    return instance.get(`/api/constant/library/copy/${params.id}`);
};

const deleteParam = (params: GetModelListParams) => {
    return instance.delete(`/api/constant/library/${params.id}`);
};

const reNameParam = (params: GetModelListParams) => {
    return instance.put('/api/constant/library/rename', params);
};

const getBindVarList = (params: GetModelListParams) => {
    return instance.get(`/api/variety/library/use/${params.id}`);
};

const getBindParamList = (params: GetModelListParams) => {
    return instance.get(`/api/constant/library/use/${params.id}`);
};

interface BindVarParParams {
    modelId: string | number;
    type: number;
    libraryIds?: any[];
}
const bindVarPar = (params: BindVarParParams) => {
    return instance.post('/api/madeModel/library', params);
};

const geVarlibList = (params: BindVarParParams) => {
    return instance.get(`/api/madeModel/model/librarys/${params.modelId}/${params.type}`);
};

interface SaveModelParams {
    id: string | number;
    formula: string;
    content: string;
    useConstant: any;
    useField: any;
    describe: string;
}
const saveModel = (params: SaveModelParams) => {
    return instance.put(`/api/model`, params);
};

const publishModel = (params: GetModelListParams) => {
    return instance.get(`/api/model/publish/${params.id}`);
};

export default{
    getModelList,
    getVariableLibrarylList,
    getParameterList,
    addModel,
    addVar,
    addParam,
    reNameModel,
    reNameParam,
    reNameVar,
    copyModel,
    copyParam,
    copyVar,
    deleteModel,
    deleteParam,
    deleteVar,
    getBindVarList,
    getBindParamList,
    bindVarPar,
    geVarlibList,
    saveModel,
    publishModel,
};
