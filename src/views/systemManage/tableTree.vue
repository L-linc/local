<template>
    <div :style="{width:tableWidth}" class='autoTbale'>
        <table class="table table-bordered" id='hl-tree-table'>
            <thead>
                <tr>
                    <th v-for="(column,index) in cloneColumns" :key="index">
                        <!-- checkbox添加 -->
                        <!-- <label v-if="column.type === 'selection'">
                            <input type="checkbox" v-model="checks" @click="handleCheckAll">
                        </label> -->
                        <label>
                            {{ renderHeader(column, index) }}
                            <!-- sort排序 -->
                            <!-- <span class="ivu-table-sort" v-if="column.sortable">
                                <Icon type="md-arrow-dropup" :class="{on: column._sortType === 'asc'}" @click.native="handleSort(index, 'asc')" />
                                <Icon type="md-arrow-dropdown" :class="{on: column._sortType === 'desc'}" @click.native="handleSort(index, 'desc')" />
                            </span> -->
                        </label>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item,index) in initItems" :key="item.id" v-show="show(item)" :class="{'child-tr':item.parent}">
                    <td v-for="(column,snum) in columns" :key="column.key" :style=tdStyle(column)>
                        <!-- <label v-if="column.type === 'selection'">
                            <input type="checkbox" :value="item.id" v-model="checkGroup" @click="handleCheckClick(item,$event,index)">
                        </label> -->
                        <!-- <div class="td-button" v-if="column.type === 'action'">
                            <Button :type="action.type" size="small" @click="RowClick(item,$event,index,action.text)" v-for='action in (column.actions)' :key="action.text">{{action.text}}</Button>
                        </div> -->
                        <!-- 三级权限的操作：添加子权限 -->
                        <div class="td-button" v-if="column.type === 'action' && item.level === 3">
                            <Tooltip content="添加子权限" placement="right">
                                <icon class="tool_icon child-theme" @click="RowClick(item,$event,index,'add')"></icon>
                            </Tooltip>
                        </div>
                        <!-- 子权限：编辑，删除 -->
                        <div class="td-button" v-if="column.type === 'action' && item.level === 4">
                            <Tooltip content="编辑" placement="left">
                                <icon class="tool_icon editor" @click="RowClick(item,$event,index,'edit')"></icon>
                            </Tooltip>
                            <Tooltip content="删除" placement="right">
                                <icon class="tool_icon del" @click="RowClick(item,$event,index,'del')"></icon>
                            </Tooltip>
                        </div>
                        <label @click="toggle(index,item)" v-if="!column.type">
                            <span v-if='snum==iconRow()'>
                                <i v-html='item.spaceHtml'></i>
                                <i v-if="item.children&&item.children.length>0" class="ivu-icon" :class="{'ivu-icon-plus-circled':!item.expanded,'ivu-icon-minus-circled':item.expanded }"></i>
                                <i v-else class="ms-tree-space"></i>
                            </span> {{renderBody(item,column) }}
                        </label>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script lang="ts">
export default {
    name: 'tableTree',
    props: {
        columns: Array,
        items: {
            type: Array,
            default: () => {
                return [];
            },
        },
    },
    data() {
        return {
            initItems: [], // 处理后数据数组
            cloneColumns: [], // 处理后的表头数据
            checkGroup: [], // 复选框数组
            checks: false, // 全选
            screenWidth: document.body.clientWidth, // 自适应宽
            tdsWidth: 0, // td总宽
            timer: false, // 控制监听时长
            dataLength: 0, // 树形数据长度
        };
    },
    computed: {
        tableWidth() {
            return (this as any).tdsWidth > (this as any).screenWidth && (this as any).screenWidth > 0 ? (this as any).screenWidth + 'px' : '100%';
        },
    },
    watch: {
        screenWidth(val: any) {
            if (!(this as any).timer) {
                (this as any).screenWidth = val;
                (this as any).timer = true;
                setTimeout(() => {
                    (this as any).timer = false;
                }, 400);
            }
        },
        items() {
            if ((this as any).items) {
                (this as any).initItems = [];
                (this as any).dataLength = (this as any).Length((this as any).items);
                (this as any).initData((this as any).deepCopy((this as any).items), 1, null);
                (this as any).checkGroup = (this as any).renderCheck((this as any).items);
                if ((this as any).checkGroup.length === (this as any).dataLength) {
                    (this as any).checks = true;
                } else {
                    (this as any).checks = false;
                }
            }
        },
        columns: {
            handler() {
                (this as any).cloneColumns = (this as any).makeColumns();
            },
            deep: true,
        },
        // checkGroup(data) {
        //     (this as any).checkAllGroupChange(data);
        // },
    },
    mounted() {
        if ((this as any).items) {
            (this as any).dataLength = (this as any).Length((this as any).items);
            (this as any).initData((this as any).deepCopy((this as any).items), 1, null);
            (this as any).cloneColumns = (this as any).makeColumns();
            (this as any).checkGroup = (this as any).renderCheck((this as any).items);
            if ((this as any).checkGroup.length === (this as any).dataLength) {
                (this as any).checks = true;
            } else {
                (this as any).checks = false;
            }
        }
        // 绑定onresize事件 监听屏幕变化设置宽
        (this as any).$nextTick(() => {
            (this as any).screenWidth = document.body.clientWidth;
        });
        window.onresize = () => {
            return (() => {
                const screenWidth = document.body.clientWidth;
                (this as any).screenWidth = screenWidth;
            })();
        };
    },
    methods: {
        // 有无多选框折叠位置优化
        iconRow() {
            for (let i = 0, len = (this as any).columns.length; i < len; i++) {
                if ((this as any).columns[i].type === 'selection') {
                    return 1;
                }
            }
            return 0;
        },
        // 设置td宽度,td的align
        tdStyle(column: any) {
            const style: any = {};
            if (column.align) {
                style['text-align'] = column.align;
            }
            if (column.width) {
                style['min-width'] = column.width + 'px';
            }
            return style;
        },
        // 排序事件
        handleSort(index: number, type: any) {
            (this as any).cloneColumns.forEach((col: any) => col._sortType = 'normal');
            if ((this as any).cloneColumns[index]._sortType === type) {
                (this as any).cloneColumns[index]._sortType = 'normal';
            } else {
                (this as any).cloneColumns[index]._sortType = type;
            }
            const key = 'key';
            const sortType = '_sortType';
            (this as any).$emit('on-sort-change', (this as any).cloneColumns[index][key], (this as any).cloneColumns[index][sortType]);
        },
        // 点击某一行事件
        // RowClick(data: any, event: any, index: number, text: string) {
        //     const result = (this as any).makeData(data);
        //     (this as any).$emit('on-row-click', result, event, index, text);
        // },
        // 点击某一行事件
        RowClick(data: any, event: any, index: number, str: string) {
            const result = (this as any).makeData(data);
            (this as any).$emit('on-row-click', result, event, index, str);
        },

        // 点击事件 返回数据处理
        makeData(data: any) {
            const t = (this as any).type(data);
            let o: any;
            if (t === 'array') {
                o = [];
            } else if (t === 'object') {
                o = {};
            } else {
                return data;
            }
            if (t === 'array') {
                for (const i of data) {
                    o.push((this as any).makeData(i));
                }
            } else if (t === 'object') {
                for (const i in data) {
                    if (i !== 'spaceHtml' && i !== 'parent' && i !== 'expanded' && i !== 'isShow' && i !== 'load') {
                        o[i] = (this as any).makeData(data[i]);
                    }
                }
            }
            return o;
        },
        // 处理表头数据
        makeColumns() {
            const columns = (this as any).deepCopy((this as any).columns);
            (this as any).tdsWidth = 0;
            columns.forEach((column: any, index: number) => {
                column._index = index;
                column._width = column.width ? column.width : '';
                column._sortType = 'normal';
                (this as any).tdsWidth += column.width ? parseFloat(column.width) : 0;
            });
            return columns;
        },
        // 数据处理 增加自定义属性监听
        initData(items: any, level: number, parent: number) {
            // (this as any).initItems = [];
            let spaceHtml = '';
            for (let i = 1; i < level; i++) {
                spaceHtml += '<i class="ms-tree-space"></i>';
            }
            items.forEach((item: any, index: number) => {
                item = Object.assign({}, item, {
                    parent,
                    level,
                    spaceHtml,
                });
                if ((typeof item.expanded) === 'undefined') {
                    item = Object.assign({}, item, {
                        expanded: true,
                    });
                }
                if ((typeof item.show) === 'undefined') {
                    item = Object.assign({}, item, {
                        isShow: true,
                    });
                }
                if ((typeof item.isChecked) === 'undefined') {
                    item = Object.assign({}, item, {
                        isChecked: false,
                    });
                }
                item = Object.assign({}, item, {
                    load: (!!item.expanded),
                });
                (this as any).initItems.push(item);
                if (item.children && item.expanded) {
                    (this as any).initData(item.children, level + 1, item);
                }
                // 3、使用splice方法更新数组数据
                items.splice(index, 1, item);
            });
        },
        //  隐藏显示
        show(item: any) {
            return ((item.level === 1) || (item.parent && item.parent.expanded && item.isShow));
        },
        toggle(index: number, item: any) {
            const level = item.level + 1;
            let spaceHtml = '';
            for (let i = 1; i < level; i++) {
                spaceHtml += '<i class="ms-tree-space"></i>';
            }
            if (item.children) {
                if (item.expanded) {
                    item.expanded = !item.expanded;
                    (this as any).close(index, item);
                } else {
                    item.expanded = !item.expanded;
                    if (item.load) {
                        (this as any).open(index, item);
                    } else {
                        item.load = true;
                        item.children.forEach((child: any, childIndex: number) => {
                            (this as any).initItems.splice((index + childIndex + 1), 0, child);
                            // 设置监听属性
                            (this as any).$set((this as any).initItems[index + childIndex + 1], 'parent', item);
                            (this as any).$set((this as any).initItems[index + childIndex + 1], 'level', level);
                            (this as any).$set((this as any).initItems[index + childIndex + 1], 'spaceHtml', spaceHtml);
                            (this as any).$set((this as any).initItems[index + childIndex + 1], 'isShow', true);
                            (this as any).$set((this as any).initItems[index + childIndex + 1], 'expanded', false);
                        });
                    }
                }
            }
        },
        open(index: number, item: any) {
            if (item.children) {
                item.children.forEach((child: any, childIndex: number) => {
                    child.isShow = true;
                    if (child.children && child.expanded) {
                        (this as any).open(index + childIndex + 1, child);
                    }
                });
            }
        },
        close(index: number, item: any) {
            if (item.children) {
                item.children.forEach((child: any, childIndex: number) => {
                    child.isShow = false;
                    child.expanded = false;
                    if (child.children) {
                        (this as any).close(index + childIndex + 1, child);
                    }
                });
            }
        },
        // 点击check勾选框,判断是否有children节点 如果有就一并勾选
        handleCheckClick(data: any, event: any, index: number) {
            data.isChecked = !data.isChecked;
            const arr = data.children;
            if (arr) {
                if (data.isChecked) {
                    (this as any).checkGroup.push(data.id);
                    for (const i of arr) {
                        (this as any).checkGroup.push(i.id);
                    }
                } else {
                    for (let i = 0; i < (this as any).checkGroup.length; i++) {
                        if ((this as any).checkGroup[i] === data.id) {
                            (this as any).checkGroup.splice(i, 1);
                        }
                        for (const j of arr) {
                            if ((this as any).checkGroup[i] === j.id) {
                                (this as any).checkGroup.splice(i, 1);
                            }
                        }
                    }
                }
            }
        },
        // checkbox 全选 选择事件
        handleCheckAll() {
            (this as any).checks = !(this as any).checks;
            if ((this as any).checks) {
                (this as any).checkGroup = (this as any).getArray((this as any).checkGroup.concat((this as any).All((this as any).items)));
            } else {
                (this as any).checkGroup = [];
            }
            // (this as any).$emit('on-selection-change', (this as any).checkGroup)
        },
        // 数组去重
        getArray(a: any) {
            const hash: any = {};
            const len = a.length;
            const result = [];
            for (let i = 0; i < len; i++) {
                if (!hash[a[i]]) {
                    hash[a[i]] = true;
                    result.push(a[i]);
                }
            }
            return result;
        },
        // checkAllGroupChange(data) {
        //     if ((this as any).dataLength > 0 && data.length === (this as any).dataLength) {
        //         (this as any).checks = true;
        //     } else {
        //         (this as any).checks = false;
        //     }
        //     (this as any).$emit('on-selection-change', (this as any).checkGroup);
        // },
        All(data: any) {
            let arr: any[] = [];
            data.forEach((item: any) => {
                arr.push(item.id);
                if (item.children && item.children.length > 0) {
                    arr = arr.concat((this as any).All(item.children));
                }
            });
            return arr;
        },
        // 返回树形数据长度
        Length(data: any) {
            let length = data.length;
            data.forEach((child: any) => {
                if (child.children) {
                    length += (this as any).Length(child.children);
                }
            });
            return length;
        },
        // 返回表头
        renderHeader(column: any, $index: number) {
            if ('renderHeader' in (this as any).columns[$index]) {
                return (this as any).columns[$index].renderHeader(column, $index);
            } else {
                return column.title || '#';
            }
        },
        // 返回内容
        renderBody(row: any, column: any, index: number) {
            return row[column.key];
        },
        // 默认选中
        renderCheck(data: any) {
            let arr: any[] = [];
            data.forEach((item: any) => {
                if (item._checked) {
                    arr.push(item.id);
                }
                if (item.children && item.children.length > 0) {
                    arr = arr.concat((this as any).renderCheck(item.children));
                }
            });
            return arr;
        },
        // 深度拷贝函数
        deepCopy(data: any) {
            const t = (this as any).type(data);
            let o: any;
            let i;
            let ni;
            if (t === 'array') {
                o = [];
            } else if (t === 'object') {
                o = {};
            } else {
                return data;
            }
            if (t === 'array') {
                for (i = 0, ni = data.length; i < ni; i++) {
                    o.push((this as any).deepCopy(data[i]));
                }
                return o;
            } else if (t === 'object') {
                for (i in data) {
                    if (1) {
                        o[i] = (this as any).deepCopy(data[i]);
                    }
                }
                return o;
            }
        },
        type(obj: any) {
            const toString: any = Object.prototype.toString;
            const map: any = {
                '[object Boolean]': 'boolean',
                '[object Number]': 'number',
                '[object String]': 'string',
                '[object Function]': 'function',
                '[object Array]': 'array',
                '[object Date]': 'date',
                '[object RegExp]': 'regExp',
                '[object Undefined]': 'undefined',
                '[object Null]': 'null',
                '[object Object]': 'object',
            };
            return map[toString.call(obj)];
        },
    },
    beforeDestroy() {
        window.onresize = null;
    },
};
</script>
<style  lang="less">
.autoTbale {
    overflow: auto;
    table {
        width: 100%;
        border-spacing: 0;
        border-collapse: collapse;
    }
    .table-bordered {
        border: 1px solid #EBEBEB;
    }
    .table>tbody>tr>td,
    .table>tbody>tr>th,
    .table>thead>tr>td,
    .table>thead>tr>th {
        border-top: 1px solid #e7eaec;
        line-height: 1.42857;
        padding: 8px;
        vertical-align: middle;
    }
    /* .table-bordered>tbody>tr>td,
    .table-bordered>tbody>tr>th,
    .table-bordered>tfoot>tr>td,
    .table-bordered>tfoot>tr>th,
    .table-bordered>thead>tr>td,
    .table-bordered>thead>tr>th {
        border: 1px solid #e7e7e7;
    } */
    .table>thead>tr>th {
        border-top: 1px solid #C5D0D4;
        border-bottom: 1px solid #C5D0D4;
        font-size: 14px;
        font-weight: 400;
        padding-left: 16px;
    }
    .table>thead>tr>th:first-child{
        border-left: 1px solid #C5D0D4;
    }
    /* 放开操作之后,取消注释 */
    /* .table>thead>tr>th:last-child{
        border-right: 1px solid #C5D0D4;
        padding-right: 40px;
        text-align: right;
    } */
    /* 屏蔽操作*/
    .table>thead>tr>th:last-child{
        border-right: 1px solid #C5D0D4;
        padding-right: 40px;
        text-align: left;
    }
    .table-bordered>thead>tr>td,
    .table-bordered>thead>tr>th {
        color: #3B72A8;
        background-color: #DEEEFE;
    }
    #hl-tree-table>tbody>tr {
        background-color: #fbfbfb;
    }
    #hl-tree-table>tbody>.child-tr {
        background-color: #fff;
    }
    label {
        margin: 0 8px;
    }
    .ms-tree-space {
        position: relative;
        top: 1px;
        display: inline-block;
        font-style: normal;
        font-weight: 400;
        line-height: 1;
        width: 14px;
        height: 14px;
    }
    .ms-tree-space::before {
        content: ''
    }
    #hl-tree-table th>label {
        margin: 0;
    }
    .ivu-icon-plus-circled{
        width: 14px;
        height: 14px;
        background: url('../../assets/images/systemManage/noexpand.png');
        background-size: 100%;
    }
    .ivu-icon-minus-circled{
        width: 14px;
        height: 14px;
        background: url('../../assets/images/systemManage/expanded.png');
        background-size: 100%;
    }
    .td-button{
        padding-right: 32px;
        float: right;
    }
    .tool_icon{
        width: 16px;
        height: 16px;
        margin-top: 4px;
        margin-bottom: 4px; 
        cursor: pointer;
    }
    .child-theme{
        width: 17px;
        height: 17px;
        background: url(../../assets/images/dataDictionary/child-theme.png);
    }
    .editor{
        margin-right: 12px;
        background: url(../../assets/images/dataDictionary/editor.png);
    }
    .del{
        background: url(../../assets/images/dataDictionary/del.png);
    }
}
</style>
