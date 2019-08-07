<template>
  <div class="dic_wrap layout_wrap">
    <div class="com_none" v-if="!addLayouts">
        <div class="none_add">
            <Button type="primary" @click="showToast"> + 添加layout相册 </Button>
        </div>
    </div>
    <div class="com_top">
        <div class="top_add" v-show="addLayouts">
            <Button type="primary" @click="showToast" v-has="'SYS_DICT_TYPE_LAYOUT_ADD'"> + 添加layout相册 </Button>
        </div>
    </div>
    <div class="com_tab" v-show="addLayouts">
        <div v-for="(tabLi, index) in tabData" :key="index" class="com_li">
            <div class="li_con">
                <div class="li_img" @click="showLayout(tabLi)">
                    <!-- <img :src="'http://' + tabLi.resUrl" /> -->
                    <!-- <img v-if="tabLi.cover !== null" :src="'http://' + tabLi.cover" /> -->
                    <img v-if="tabLi.cover !== null && tabLi.cover !== ''" :src=" imgLoc + tabLi.cover" />
                    <img v-else src="../../assets/images/dataDictionary/Picture.png" />
                </div>
                <div class="li_opear">
                    <span class="li_name">
                        {{tabLi.name}}
                    </span>
                    <div class="li_btn">
                        <Upload 
                            action="/api/layout" 
                            :show-upload-list='false' 
                            :on-success="uploadSucc" 
                            :data="{layoutTypeId: tabLi.id}" 
                            :headers="{Authorization: token}" 
                            :format="['jpg', 'jpeg', 'png', 'gif']"
                            :max-size="2048"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :on-error="uploadErr"
                            :before-upload="handleBeforeUpload"
                            >
                            <i class="ivu-icon photo_upload" v-has="'SYS_DICT_TYPE_LAYOUT_ADD'"></i> 
                        </Upload>
                        <i @click="showToast('edit', tabLi)" class="ivu-icon photo_edit" v-has="'SYS_DICT_TYPE_LAYOUT_MOD'"></i>
                        <i @click="toDelete(tabLi)" class="ivu-icon photo_del" v-has="'SYS_DICT_TYPE_LAYOUT_DEL'"></i>
                    </div>
                </div>
            </div>
            <div class="li_foot">
                <p class="li_des" v-if="tabLi.descript.length < 22">{{tabLi.descript}}</p>
                <Tooltip :content="tabLi.descript" max-width="360" placement="bottom" v-else>
                    <p class="li_des">{{tabLi.descript}}</p>
                </Tooltip>
            </div>
        </div>
    </div>
    <div class="fake_modal" v-show="showProgress">
        <div class="fake_progress">
            <p style="">图片上传中...</p>
            <Progress :percent="percent" :status="progressStatus"/>
        </div>
    </div>
    <Modal
        class="dictionary_modal"
        v-model="addFlag"
        :title="toastTit"
        width="600px">       
        <div class="add_label"><span class="label_name">相册名称：</span>
            <Select class="sel_loca" @on-change="changeTree(index)" v-for="(treeLi, index) in treeValue" v-model="treeValue[index]" :key="index">
                <Option value="">请选择</Option>
                <Option v-show="checkOption(index, optLi)" v-for="(optLi, i) in treeData[index]" :key="i" :value="optLi.id">{{optLi.title}}</Option>
            </Select>
        </div>
        <label class="add_label"><span class="label_name">描述：</span><Input v-model="layoutDes" placeholder="描述" /></label>
        <div slot="footer">
            <Button @click="closeModal">取消</Button>
            <Button type="primary" @click="brandSubmit">确定</Button>
        </div>
    </Modal>
  </div>
  
</template>

<script lang="ts">
import './dataDictionary.less';
import dictionaryApi from '@/api/dataDictionary.ts';
import * as util from '../../config/utils';
import Vue from 'vue';
import {Component} from 'vue-property-decorator';
@Component
export default class LayoutTypeMana extends Vue {

    // data
    private pageTotal: number = 20;
    private pageIndex: number = 1;
    private pageSize: number = 10;
    private currentLocation: number = -1;
    private layoutDes: string = '';
    private editId: string = '';
    private imgLoc: string = '';
    private toastTit: string = '添加Layout类别';
    private addFlag: boolean = false;
    private addLayouts: boolean = true;
    private tabData: any[] = [];
    private treeAll: any[] = [];
    private treeData: any[] = [];
    private treeValue: any[] = [0, 0, 0, 0, 0];
    private timer: any = null;
    private percent: number = 0;
    private progressStatus: string = 'active';
    private showProgress: boolean = false;
    private token: string = '';
    // private uploadData: any = null;

    // life-cycle
    private created() {
        this.token = `Bearer ` + util.getCookie('token');
        // this.uploadData = {layoutTypeId: this.$route.query.id};
        this.getTreeData();
        this.getImgLocation();
        // this.getTable();
    }
    private activated() {
        // this.uploadData = {layoutTypeId: this.$route.query.id};
        this.getTreeData();
        this.getTable();
    }
    private deactivated() {
        this.tabData = [];
    }

    // methods
    private getTable() {
        const params = {
            page: 0,
            size: 2147483647,
        };
        dictionaryApi.getAllLayoutType(params).then((res) => {
            this.tabData = res.data.content;
            this.addLayouts = this.tabData.length === 0 ? false : true;
        });
    }
    private showToast(type: string = 'add', data: any) {
        this.addFlag = true;
        if (type === 'edit') {
            this.toastTit = '编辑Layout类别';
            this.editId = data.id;
            this.layoutDes = data.descript;
            this.currentLocation = data.location;
            this.getParent(this.treeValue.length - 1, data.location);
        } else {
            this.toastTit = '添加Layout类别';
            this.layoutDes = '';
            this.editId = '';
            this.treeValue = this.treeValue.map((ele: any) => {
                return ele = '';
            });
        }
    }
    private closeModal() {
        this.addFlag = false;
    }
    private brandSubmit() {
        const {layoutDes, toastTit, treeValue, treeData, editId} = this;
        if (this.layoutDes.length > 100) {
            this.$Message.error('描述最长为100个字符,请修改');
            return;
        }
        const xhrType = toastTit === '编辑Layout类别' ? 'edit' : 'add';
        let name = '';
        const valLen = treeValue.length;
        let location = 0;
        for (let i = 0; i < valLen; i++) {
            treeData[i] = treeData[i] || [];
            treeData[i].map((ele: any, index: number) => {
                if (treeValue[i]) {
                    location = treeValue[i];
                    if (ele.id === treeValue[i]) {
                        name += ele.title + '-';
                    }
                }
            });
        }
        name = name.substring(0, name.length - 1);
        const param = {
            location,
            descript: layoutDes,
        };
        if (name.length <= 0) {
            this.$Message.error('当前相册名称不能为空');
            return;
        }
        if (xhrType === 'add') {
            for (const i of this.tabData) {
                if (i.location === param.location) {
                    this.$Message.error('当前相册名称已经添加,请重新选择');
                    return;
                }
            }
            dictionaryApi.addLayoutType(param).then((res) => {
                this.$Message.info('添加成功');
                this.getTable();
                this.addFlag = false;
            });
        } else {
            for (const i of this.tabData) {
                if (location === this.currentLocation) {
                    // this.$Message.info('当前名称未修改');
                    break;
                } else {
                    if (i.location === param.location) {
                        this.$Message.error('当前相册名称已经添加,请重新选择');
                        return;
                    }
                }
            }
            const editParam = {...param, id: editId};
            dictionaryApi.editLayoutType(editParam).then((res: any) => {
                this.$Message.info('修改成功');
                this.getTable();
                this.addFlag = false;
            });
        }
    }
    private toDelete(data: any) {
        const src = data.cover ? (this.imgLoc + data.cover) : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUgAAACpCAYAAABJe6SgAAAN00lEQVR4Xu2di27bSAwA1w/ZSdr//9K7+CHJPtCt216aWFybu+RaI+CAA0qT1FAarCPJWuz64ZzYIAABCEDgLwILBMlRAQEIQOBzAgiSIwMCEIDAFwQQJIcGBCAAAQTJMQABCEAgjwAryDxeREMAAjMigCBnNGx2FQIQyCOAIPN4EQ0BCMyIAIKc0bDZVQhAII8AgszjRTQEIDAjAghyRsNmVyEAgTwCCDKPF9EQgMCMCCDIGQ2bXYUABPIIIMg8XkRDAAIzIoAgZzRsdhUCEMgjgCDzeBENAQjMiACCnNGw2VUIQCCPAILM40U0BCAwIwIIckbDZlchAIE8AggyjxfREIDAjAggyBkNm12FAATyCCDIPF5EQwACMyKAIGc0bHYVAhDII4Ag83gRDQEIzIgAgpzRsNlVCEAgjwCCzONFNAQgMCMCCHJGw2ZXIQCBPAIIMo8X0RCAwIwIIMgZDZtdhQAE8gggyDxeVaLHcUzDMKbxdEqn06lKTYr4EFgul2m1XKb1epVWq5VPE1T9kgCCDHRwiBgPx2M6nc6BuqKVWgSWy0XabjaIshZwRR0EqYBUI+Rw7FPf9zVKUSM4ga7r0nbTBe9yHu0hyABz3h+OaRiGAJ3QQhQC6/U6vWw3UdqZbR8I0nn0rBydBxC4PCtJ/+EgSMcZyN8cd/uDYweUjk7g9WXL3yQdh4QgHeG/7/ZcpXbk30Jpucr99vrSQqtP2SOCdBorq0cn8A2WZRXpNzQE6cT+cDimngszTvTbKtut12nLBRuXoSFIF+wpab9ey83DchPxwqlPypYhIHe6Xh4GGMfJAnzNnkRULABBFkN7O/E//75PVhY5ytcrtuclIBfpNJL8/u3teSEE3jME6TQcjSDla5V8vWJ7XgJ9P1yenpraEOQUoTL/jiDLcJ3MqhHky3Z7+XrN9rwE5AEBeVBgakOQU4TK/DuCLMN1MiuCnEQ0iwAEGXvMCNJpPgjSCXywsggy2EA+tIMgneaDIJ3AByuLIIMNBEHGGAiCjDEH7y4QpPcEbtdnBek0HwTpBD5YWQQZbCCsIGMMxEOQ5/M5nc7ndL78IK/8t0iLRUpyI/JC/oetOgEEWR15VkFWkFm47IJrCVKkKE9syIkor3D4ahNByi1Fct+lCJOtDgEEWYfzvVUQ5L3kHvxcDUHKTcjH/pjOmW9wEEluNh2rygdnrPk4gtRQ8otBkE7sSwpSVo1y87HmEbZbK0r5RWteJFX2AEGQZfk+mh1BPkrwzs+XEqS8BVGe7xVJWmwiSfn5f7YyBBBkGa5WWRGkFcnMPCUEKVKUXwmykuN1l3jkMXO4GeEIMgOWQyiCdIAuJUsIUvvLMPfssvyqNRdv7iF3+zMI0p6pZUYEaUkzI5e1ILW/CpPR4v9CV6tlen3hp//v5ffV5xCkNVHbfAjSlqc6m6Ugf3y13mVfrVY3+zOQr9q5xKbjEeQ0I88IBOlE31KQpVePV0SsIu0PFgRpz9QyI4K0pJmRy1KQu93+5k3gGW1Nhn57e+X+yElK+gAEqWflEYkgPagbXqSRr9f/vu+q7QW3/diiRpC2PK2zIUhrosp8VitIue9Rbu2ptW06ecpmU6vcw3WuN8tHveEdQT484qIJEGRRvF8ntxLkMI5pvz9U2wt5Xlsu1rSw/fnu8ajvlkaQsY8kBOk0HzNBDmPaHyoKcrVKLw28afFPOV5HHFGSCNLpBFSWRZBKUNZhzQqygRXkZ3KMKkkEaX1m2eZDkLY81dmsBDmO8ux1vb9Bdt06bQP/DfKWHCNKEkGqTxmXQATpgt3uUcPaV7FFjiLJiJtGjtEkiSAjHkm/e0KQTvOxWkFK++/vu8svhdfYoj6TnSPHSJJEkDWO2vtrIMj72T30SUtBHo7HJE/TlN6Wi0V6e3stXSY7/z1yjCJJBJk97qofQJBVcf8uZinIWvdCyq+Mb7rOidjnZR+RYwRJIshQh9NfzSBIp/lYClJ24XA4pn4ot4qUd9bI1+tIL/eykKO3JBGk0wmoLIsglaCsw6wFWerHcq/7He0RQ0s5ekoSQVqfWbb5EKQtT3U2a0FK4RLSkLzyEq/tNs7jhaX2U/a19s3kCFJ9yrgEIkgX7Ha3+XxsX3vCaXc72qOFJeXosZLUzuv7tzftyIgzJIAgDWHmpCqxgrzWl/dgWzx+OKeV48fZ1VpJIsics6Z+LIKsz/xSsaQgJb9c2Zbbf+RJm9xNLsRsN12otxnWWDl6SBJB5h6ddeMRZF3ev6qVFuSv1eQ4pr7vVaKU+xzX3fryN8dnvVqdO+7SK0kEmTuRuvEIsi7v6oK8FpSr3LIKO53O6XQ+pSQP3izSRYTLxTLJ6xQivrXQY+VYcyWJIJ1OQGVZBKkEZR1WawVp3XfNfBHkeN3fUitJBFnziMqvhSDzmZl8AkHexhhJjiUliSBNTqdiSRBkMbS3EyPIr/lElGMpSSJIpxNQWRZBKkFZhyHIz4lGlmMJSSJI6zPLNh+CtOWpzoYg/0bVghytJYkg1aeMSyCCdMFe/j5Ip926u2xLcrSUJIK8+5Cp8kEEWQXz30VYQf5m0qIcrSSJIJ1OQGVZBKkEZR2GIH8QbVmOFpJEkNZnlm0+BGnLU50NQT6HHB+VJIJUnzIugQjSBXsbf4M8HvsLHfklcevtGVaOH5ncczM5grQ+smzzIUhbnups0VeQIsdj/1OQXWcqyWeU470rSQSpPmVcAhGkC/bYK8g/5XjFI++isVhJPrMc75EkgnQ6AZVlEaQSlHVY1BXkZ3K0kuQc5JgrSQRpfWbZ5kOQtjzV2SIK8pYcH5XknOR4ZaV5hziCVJ8yLoEI0gV7vK/YGjneK8k5ylFYvWy3SV5ZcWtDkE4noLIsglSCsg6LtILMkWOuJOcqRwRpfcb45EOQPtyLv3JBu1v3yFEryTnLEUFqj8DYcQjSaT4RVpCPyHFKknOXI4J0OrGMyyJIY6DadN6CtJDjV5JEjj/I8DdI7dkQNw5BOs3GU5CWcvwoSeT4+4BCkE4nl2FZBGkIMyeVlyBLyPG633LFVt7JzcYK8lmOAQTpNEkPQZaUoxPG0GVZQYYej6o5BKnCZB9UW5DI0X6GUxkR5BSh+P+OIJ1mVFOQyNFnyAjSh7tlVQRpSTMjVy1BIseMoRiHIkhjoA7pEKQDdClZQ5DI0Wm4P8siSF/+FtURpAXFO3KUFiRyvGMoxh9BkMZAHdIhSAfopVeQyNFpqB/KIsgYc3ikCwT5CL0HPltqBYkcHxiK8UcRpDFQh3QI0gF6qRUkcnQa5hdlEWSsedzTDYK8h5rBZ6xXkMjRYCjGKRCkMVCHdAjSAbr1ChI5Og1xoiyCjDmXnK4QZA4tw1irFeQwjmm/Pxh2RiorAgjSiqRfHgTpxN5MkMOY9gcE6TTGm2URZMSp5PWEIPN4mUUjSDOUYRMhyLCjUTeGINWobAMRpC3PiNkQZMSp5PWEIPN4mUUjSDOUYRMhyLCjUTeGINWobAMRpC3PiNkQZMSp5PWEIPN4mUUjSDOUYRMhyLCjUTeGINWobAMRpC3PiNkQZMSp5PWEIPN4mUUjSDOUYRMhyLCjUTeGINWobAMRpC3PiNkQZMSp5PWEIPN4mUUjSDOUYRMhyLCjUTeGINWobAMRpC3PiNkQZMSp5PWEIPN4mUUjSDOUYRMhyLCjUTeGINWobAMRpC3PiNkQZMSp5PWEIPN4mUVbCfJ0OqfTaTTri0R2BJbLVVouFzcTDsOQ9ofjZNHv394mYwiwJ4Ag7ZmqMloJUlWMoLAEEGTY0VwaQ5BO80GQTuCDlUWQwQbyoR0E6TQfBOkEPlhZBBlsIAgyxkAQZIw5eHeBIL0ncLs+K0in+SBIJ/DByiLIYANhBRljIAgyxhy8u0CQ3hNgBRlyAhpBbreb1K3XIfunKRsCfT+kw5HbfGxo2mfhK7Y9U1VGjSBXq1V6fdmq8hHUJoHd/pDGcfo+Vu6D9JkvgvThnt53+3Q6nSariyTX61W6fbvxZBoCghE4p5SGYVTJcblcprfXl2B7MI92EKTTnA+HY+qHwak6ZVsiIH9mkT+3sNUngCDrM79UlK9V8vWKDQJTBOTPLPJNgq0+AQRZn/mvitqv2Y4tUtqZAF+vfQeAIB35s4p0hN9IaVaPvoNCkL780+HYp77vnbugfEQCXdel7aaL2NpsekKQAUYtP3clNwyzQeBKYL1epxcuzLgfEAjSfQQ/GmAlGWQQAdpg5RhgCD9bQJBxZnG5si1PVciP4LLNj4D8uO52s+GKdaDRI8hAw7i2IqLsh/FyI7nmZvKAu0BLSgJylVr+69YrxKhkVjMMQdakTS0IQKApAgiyqXHRLAQgUJMAgqxJm1oQgEBTBBBkU+OiWQhAoCYBBFmTNrUgAIGmCCDIpsZFsxCAQE0CCLImbWpBAAJNEUCQTY2LZiEAgZoEEGRN2tSCAASaIoAgmxoXzUIAAjUJIMiatKkFAQg0RQBBNjUumoUABGoSQJA1aVMLAhBoigCCbGpcNAsBCNQkgCBr0qYWBCDQFAEE2dS4aBYCEKhJAEHWpE0tCECgKQIIsqlx0SwEIFCTAIKsSZtaEIBAUwQQZFPjolkIQKAmAQRZkza1IACBpgggyKbGRbMQgEBNAgiyJm1qQQACTRFAkE2Ni2YhAIGaBBBkTdrUggAEmiKAIJsaF81CAAI1CSDImrSpBQEINEUAQTY1LpqFAARqEvgPurEApii1r2IAAAAASUVORK5CYII=';
        this.$Modal.confirm({
            title: '删除Layout类别',
            content: `  <div style="display:flex;">
                            <img style="width:90px;height:60px;padding: 10px 0;margin-right:12px;" src="${src}" />
                            <div style="margin-top:10px;">
                                <p style="width:354px;text-overflow:ellipsis;">此相册中有 ${data.layoutCount} 张layout,</p>
                                <p style="color: red;">此相册的layout也将删除!</p>
                            </div>
                        </div>`,
            loading: true,
            onOk: () => {
                const params = {
                    id: data.id,
                };
                dictionaryApi.delLayoutType(params).then((res: any) => {
                    (this as any).$Spin.hide();
                    this.$Modal.remove();
                    this.$Message.info('删除成功');
                    this.getTable();
                });
            },
        });
    }
    private showLayout(data: any) {
        this.$router.push({name: 'layoutMana', query: data});
        const a: any = sessionStorage.getItem('oldTab');
        const b: any = sessionStorage.getItem('tabIndex');
        const c: any = JSON.stringify(data);
        const d: any = JSON.parse(a);
        d[b].current = c;
        sessionStorage.setItem('oldTab', JSON.stringify(d));
    }
    private changeTree(index: number) {
        // select改变设备树更新，触发改变的当前select之后的select都会根据当前的变化value默认选择关联父级的子级第一项；
        // event = event || window.event;
        const valLen = this.treeValue.length;
        const currVal = this.treeValue[index];
        const listData = this.treeData[index + 1];
        let nexVal = '';
        if (index + 1 >= valLen) {
            // 最后一层终止
            return;
        }
        // this.treeData[index + 1].map((ele: any, i: number) => {
        //     // nexVal = ele.parent === currVal ? ele.id : '';
        //     if (!nexVal && ele.parent === currVal) {
        //         nexVal = ele.id;
        //     }
        // });
        if (currVal) {
            // 上一层值为空，后面的select值都为空减少循环；
            for (const ele of listData) {
                // 改成for循环查询到了可以及时终止；
                // console.log(currVal, ele.parent);
                if (!nexVal && ele.parent === currVal) {
                    nexVal = ele.id;
                    break;
                }
            }
        }
        this.treeValue[index + 1] = nexVal;
        if (index + 1 < valLen - 1) {
            // 改变非第一层的设备树值，递归循环改变后面的数值；
            this.changeTree(index + 1);
        }
    }
    private checkOption(index: number, data: any) {
        if (index === 0 || data.parent === this.treeValue[index - 1]) {
            // index为0是第一层设备树不需要过滤，其他层的父级ID === 上一层v-model双向绑定的值才显示；
            return true;
        }
        return false;
    }
    private getParent(index: number, id: string) {
        // 递归从最后一层往回找父节点
        if (index < 0 ) {
            // 第一层开始终止
            return;
        }
        const newArry: string[] = [];
        for (index; index >= 0; index --) {
            let getNode: boolean = false;
            this.treeData[index].map((ele: any, i: number) => {
                if (id === ele.id) {
                    newArry.unshift(id);
                    id = ele.parent;
                    getNode = true;
                }
            });
            if (!getNode) {
                // 设备树节点不完整，后面的value都是空；
                newArry.unshift('');
            }
        }
        this.treeValue = newArry;
    }
    private getTreeData() {
        const params = {urlStr: ''};
        dictionaryApi.selectTree(params).then((res: any) => {
            const data = res.data || [];
            this.dataTransTree(data);
        });
    }
    private dataTransTree(treeList: any[]) {
        if (treeList.length <= 0) {
            return ;
        }
        const selectData: any[] = [];
        for (const ele of treeList) {
            if (ele.level) {
                selectData[ele.level] = selectData[ele.level] || [];
                selectData[ele.level].push(ele);
            }
        }
        const treeSelData: any[] = [];
        // 去除数组empty元素；
        selectData.map((ele: any, i: any) => {
            if (ele) {
                treeSelData.push(ele);
            }
        });
        let  transList: any[] = [];
        const leveLen = treeSelData.length;
        transList = [...treeSelData[leveLen - 1]];
        const valueList: any = [''];
        for (let i = leveLen - 2; i >= 0; i--) {
          let treeData: any[] = [];
          treeData = [...treeSelData[i]];
          treeData.map((selLi: any, j: number) => {
              selLi.children = [];
              transList.map((traLi: any, k: number) => {
                  if (traLi.parent === selLi.id) {
                      selLi.children.push(traLi);
                  }
              });
          });
          transList = treeData;
          valueList.push('');
        }
        this.treeValue = valueList;
        this.treeData = treeSelData;
        // this.treeData = transList;
    }
    private getImgLocation() {
        dictionaryApi.getImgLoc().then((res) => {
            this.imgLoc = res.data.host + '/';
        });
    }
    private uploadSucc() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.percent = 100;
        this.progressStatus = 'success';
        this.$Message.info('上传成功');
        this.getTable();
        setTimeout ( () => {
            this.showProgress = false;
            this.progressStatus = 'normal';
            this.percent = 0;
        }, 500);
    }
    private handleFormatError() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        setTimeout ( () => {
            this.showProgress = false;
            this.progressStatus = 'normal';
            this.percent = 0;
            this.$Message.error('图片格式不符合要求,只允许上传后缀名为"jpg", "jpeg", "png", "gif"的图片');
        }, 1000);
    }
    private handleMaxSize() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        setTimeout ( () => {
            this.showProgress = false;
            this.progressStatus = 'normal';
            this.percent = 0;
            this.$Message.error('图片大小不符合要求,每个文件大小不超过 2M(2048kb)');
        }, 1000);
    }
    private uploadErr() {
        setTimeout ( () => {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.percent = 98;
            this.progressStatus = 'wrong';
            this.$Message.info('上传失败');
            setTimeout ( () => {
                this.showProgress = false;
                this.progressStatus = 'normal';
                this.percent = 0;
            }, 1000);
        }, 5000);
    }
    private handleBeforeUpload() {
        this.showProgress = true;
        let i = 0;
        this.timer = setInterval( () => {
            console.log(i);
            if (i >= 0 && i < 50) {
                i += Math.floor(Math.random() * 10);
                this.percent = i;
            } else if (i >= 50 && i < 75) {
                i += Math.floor(Math.random() * 6);
                this.percent = i;
            } else if (i >= 75 && i < 95) {
                i += Math.ceil(Math.random() * 1.2);
                this.percent = i;
            } else {
                i = 96;
                this.percent = i;
                return;
            }
        }, Math.floor(Math.random() * 10 + 300));
    }

}
</script>