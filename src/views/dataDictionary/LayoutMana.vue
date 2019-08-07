<template>
  <div class="dic_wrap layout_wrap">
    <div class="com_none" v-show="!addLayout">
        <div class="none_add">
            <Upload 
                action="/api/layout" 
                :show-upload-list='false' 
                :on-success="uploadSucc" 
                :headers="{Authorization: token}" 
                :data="uploadData" 
                :format="['jpg', 'jpeg', 'png', 'gif']"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                :on-error="uploadErr"
                :before-upload="handleBeforeUpload"
                >
                <Button type="primary" v-has="'SYS_DICT_TYPE_LAYOUT_ADD'"> + 上传layout </Button>
            </Upload>
        </div>
    </div>
    <div class="com_top" v-show="addLayout">
        <div class="top_add">
            <Upload 
                action="/api/layout" 
                :show-upload-list='false' 
                :on-success="uploadSucc" 
                :headers="{Authorization: token}" 
                :data="uploadData" 
                :format="['jpg', 'jpeg', 'png', 'gif']"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                :on-error="uploadErr"
                :before-upload="handleBeforeUpload"
                >
                <Button type="primary" v-has="'SYS_DICT_TYPE_LAYOUT_ADD'"> + 上传layout </Button>
            </Upload>
        </div>
    </div>
    <div class="com_tab" v-show="addLayout">
        <div v-for="(tabLi, index) in tabData" :key="index" class="com_li">
            <div class="li_con">
                <div class="li_img" @click="showPicture(tabLi.layout)">
                    <!-- <img :src="'http://' + tabLi.resUrl" /> -->
                    <!-- <img :src="'http://' + tabLi.layout" /> -->
                    <img :src=" imgLoc + tabLi.layout" />
                </div>
                <div class="li_opear">
                    <span class="li_name">
                        {{tabLi.layoutName}}
                    </span>
                    <span class="li_btn">
                        <!-- <i @click="setLayout(tabLi)" class="ivu-icon photo_upload" v-if="!tabLi.isCover"></i> -->
                        <i @click="showToast(tabLi)" class="ivu-icon photo_edit" v-has="'SYS_DICT_TYPE_LAYOUT_MOD'"></i>
                        <i @click="toDelete(tabLi)" class="ivu-icon photo_del" v-has="'SYS_DICT_TYPE_LAYOUT_DEL'"></i>
                    </span>
                </div>
            </div>
        </div>
    </div>
    <div class="fake_modal" v-show="preview" @click="closePreview" style="background: rgba(0,0,0,0.7);">
        <img :src=" imgLoc + previewData" />
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
        title="编辑Layout">       
        <div class="add_label"><span class="label_name">Layout名称：</span><Input v-model="layoutName" placeholder="Layout名称" /></div>
        <div slot="footer">
            <Button @click="closeModal">取消</Button>
            <Button type="primary" @click="brandSubmit">确定</Button>
        </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import './dataDictionary.less';
import Vue from 'vue';
import dictionaryApi from '@/api/dataDictionary.ts';
import * as util from '../../config/utils';
import {Component} from 'vue-property-decorator';
@Component
export default class LayoutMana extends Vue {

    // data
    private pageTotal: number = 20;
    private pageIndex: number = 1;
    private pageSize: number = 10;
    private percent: number = 0;
    private urlParam: any = null;
    private uploadData: any = null;
    private selLayout: any = null;
    private timer: any = null;
    private tabData: any[] = [];
    private token: string = '';
    private layoutName: string = '';
    private editId: string = '';
    private imgLoc: string = '';
    private progressStatus: string = 'active';
    private addFlag: boolean = false;
    private addLayout: boolean = true;
    private showProgress: boolean = false;
    private preview: boolean = false;
    private previewData: boolean = false;

    // life-cycle
    private created() {
        this.getImgLocation();
        this.uploadData = {layoutTypeId: this.$route.query.id};
        this.token = `Bearer ` + util.getCookie('token');
    }
    private activated() {
        this.getDetailTable();
        this.uploadData = {layoutTypeId: this.$route.query.id};
    }
    private deactivated() {
        this.tabData = [];
        this.addLayout = true;
    }

    // methods
    private uploadSucc() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.percent = 100;
        this.progressStatus = 'success';
        this.$Message.info('上传成功');
        setTimeout ( () => {
            this.showProgress = false;
            this.progressStatus = 'normal';
            this.percent = 0;
            this.getDetailTable();
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
    private getDetailTable(id?: string) {
        const queryId: any = this.$route.query.id;
        const param = {
            id: (id ? id : queryId),
        };
        dictionaryApi.getLayoutTypeDetail(param).then((res: any) => {
            this.tabData = res.data.layouts;
            this.addLayout = this.tabData.length === 0 ? false : true;
        });
    }
    private showToast(data: any) {
        this.addFlag = true;
        this.editId = data.id;
        this.layoutName = data.layoutName;
        this.selLayout = data;
    }
    private closeModal() {
        this.addFlag = false;
    }
    private setLayout(data: any) {
        const queryId: any = this.$route.query.id;
        const param = {
            id: queryId,
            layoutId: data.id,
        };
        dictionaryApi.setCover(param).then((res: any) => {
            this.$Message.info('设置默认图成功');
            this.getDetailTable();
        });
    }
    private brandSubmit() {
        const {selLayout, layoutName} = this;
        if (this.layoutName === '') {
            this.$Message.error('图片名称不能为空, 请输入图片名称');
            return;
        }
        if (this.layoutName.length > 50) {
            this.$Message.error('图片名称格式错误，请输入50个字符以内的图片名称');
            return;
        }
        for (let i = 0; i < this.tabData.length; i++) {
            if (selLayout.layoutName === this.layoutName) {
                this.$Message.info('当前图片名称未修改');
                return;
            }
            if (this.tabData[i].layoutName === this.layoutName) {
                this.$Message.error(`此图片名称与第 ${i + 1} 张图片名称重复,请重新输入`);
                return;
            }
        }
        const params = {
            layoutName,
            id: selLayout.id,
            descript: selLayout.descript,
        };
        dictionaryApi.editedLayout(params).then((res: any) => {
            this.$Message.info('修改成功');
            this.getDetailTable();
            this.addFlag = false;
        });
    }
    private toDelete(data: any) {
        let str = '';
        if (data.isCover) {
            str = '此图片为封面,';
        }
        this.$Modal.confirm({
            width: 536,
            title: '删除Layout',
            content: `  <div style="display:flex;">
                            <img style="width:90px;height:60px;padding: 10px 0;margin-right:12px;" src="${this.imgLoc}${data.layout}" />
                            <div style="margin-top:10px;">
                                <p style="width:354px;text-overflow:ellipsis;">${str} 确定删除该layout：${data.layoutName}？</p>
                                <p style="color: red;">删除后不可恢复!</p>
                            </div>
                        </div>`,
            loading: true,
            onOk: () => {
                const params = {
                    id: data.id,
                };
                (this as any).$Spin.show();
                dictionaryApi.deletedLayout(params).then((res: any) => {
                    (this as any).$Spin.hide();
                    this.$Modal.remove();
                    this.$Message.info('删除成功');
                    this.getDetailTable();
                }, (res: any) => {
                    (this as any).$Spin.hide();
                });
            },
        });
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
    private getImgLocation() {
        dictionaryApi.getImgLoc().then((res) => {
            this.imgLoc = res.data.host + '/';
        });
    }
    private showPicture(data: any) {
        this.preview = true;
        this.previewData = data;
    }
    private closePreview() {
        this.preview = false;
    }
}
</script>