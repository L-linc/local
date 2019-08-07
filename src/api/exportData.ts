/**
 * 导出文件接口
 */
import instance from './index';
import qs from 'qs';

// 导出文件列表
interface GetFileListParams {
    name: string;
    statuses: any;
    page: number;
    size: number;
}
const getFileList = (param: GetFileListParams) => {
    return instance.post('/api/export/task/list', param);
};

interface ExportFileParams {
    name: string;
    queryStart: number;
    queryEnd: number;
    pointId: string;
    pointName: string;
    paramsList: string;
}
// 后台导出
const exportFileAsync = (param: ExportFileParams) => {
    return instance.post(`/api/export/task/start`, param);
};
// 直接导出
const exportFileSync = (param: ExportFileParams) => {
    return new Promise((resolve, reject) => {
        const form = document.createElement('form');
        form.style.display = 'none';
        form.setAttribute('action', '/api/export/task/sync/start');
        form.setAttribute('method', 'POST');
        document.body.appendChild(form);
        for (const key of Object.keys(param)) {
          const inp = document.createElement('input');
          inp.setAttribute('name', key);
          inp.setAttribute('value', (param as any)[key]);
          form.appendChild(inp);
        }
        form.submit();
        document.body.removeChild(form);
    });
};

// 重新导出
interface ReExportFileParams {
    id: number;
}
const reExportFile = (param: ReExportFileParams) => {
    return instance.post(`/api/export/task/restart`, param);
};

// 取消导出
interface StopExportFileParams {
    id: number;
}
const stopExportFile = (param: StopExportFileParams) => {
    return instance.post(`/api/export/task/stop`, param);
};

// 移除
interface RemoveExportFileParams {
    id: number;
}
const removeExportFile = (param: RemoveExportFileParams) => {
    return instance.post(`/api/export/task/remove`, param);
};

// 下载
interface DowmExportFileParams {
    id: number;
}
const downExportFile = (param: DowmExportFileParams) => {
    return instance.get(`/api/export/download/${param.id}`);
};

export default{
    getFileList,
    exportFileSync,
    exportFileAsync,
    reExportFile,
    stopExportFile,
    removeExportFile,
    downExportFile,
};
