/**
 * 报警中心接口
 */
import instance from './index';

// 获取所有设备下拉框接口
const getDevice = () => {
    return instance.get('/api/alarm/device');
};

// 查查询报警记录
interface SearchAlarmParams {
    deviceId: string;
    alarmType: string|number;
    page: number;
    size: number;
    startTime: any;
    endTime: any;
    alarmStatus?: number;
}
const searchAlarm = (params: SearchAlarmParams) => {
    return instance.post('/api/alarms', params);
};

// 编辑注释接口
interface EditRemarkParams {
    remark: string;
    id: string;
}
const editRemark = (params: EditRemarkParams) => {
    return instance.put('/api/alarm', params);
};

// 报警中心统计
const alarmCenterStatistics = () => {
    return instance.get('/api/alarmcenter/count');
};

// 报警中心统计
interface GoModelParams {
    id: string;
}
const goModel = (params: GoModelParams) => {
    return instance.get(`/api/model/modelViewTool/${params.id}`);
};


// // 查询报警记录导出
// interface ExportAlarmsParams {
//     // id?: string;
//     deviceId?: string;
//     alarmType?: string|number;
//     alarmStatus?: number;
//     startTime?: any;
//     endTime?: any;
//     // remark?: string;
// }
// const exportAlarms = (params: ExportAlarmsParams) => {
//     // return instance.get(`/api/export/alarms?id=${params.id}&deviceId=${params.deviceId}&alarmType=${params.alarmType}&alarmStatus=${params.alarmStatus}&startTime=${params.startTime}&endTime=${params.endTime}&remark=${params.remark}`);
//     return instance.get(`/api/export/alarms?deviceId=${params.deviceId}&alarmType=${params.alarmType}&alarmStatus=${params.alarmStatus}&startTime=${params.startTime}&endTime=${params.endTime}`);
// };

export default{
    getDevice,
    searchAlarm,
    editRemark,
    alarmCenterStatistics,
    goModel,
    // exportAlarms,
};
