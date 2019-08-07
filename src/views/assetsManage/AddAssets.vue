<template>
  <div class="add_wrap">
    <p class="add_top">
        添加资产
    </p>
    <div class="add_form">
        <div class="add_li">
            <span class="li_tit">资产名称：</span>
            <Input placeholder="资产名称" v-model="assName" />
        </div>
        <div class="add_li">
            <span class="li_tit">资产类型：</span>
            <Select v-model="assType">
                <!-- <Option value="jitai">机台</Option> -->
                <Option value="1">网关</Option>
                <Option value="2">传感器</Option>
            </Select>
        </div>
        <!-- <label v-if="assType == 'jitai'" class="add_li">
            <span class="li_tit">选择应用：</span>
            <Select v-model="assApp">
                <Option value="jitai">机台</Option>
                <Option value="gateway">网关</Option>
                <Option value="sensor">传感器</Option>
            </Select>
        </label>
        <label v-if="assType == 'jitai'" class="add_li">
            <span class="li_tit">选择机台：</span>
            <Input placeholder="资产名称" v-model="assName" />
        </label> -->
        <!-- <label v-if="assType == '2'" class="add_li">
            <span class="li_tit">传感器类型：</span>
            <Select v-model="ssType">
                <Option v-for="(ele, i) in ssList" :value="ele.id" :key="i">{{ele.value}}</Option>
            </Select>
        </label>
        <label v-if="assType == '1'" class="add_li">
            <span class="li_tit">网关类型：</span>
            <Select v-model="gwType">
                <Option v-for="(ele, i) in gwList" :value="ele.id" :key="i">{{ele.value}}</Option>
            </Select>
        </label> -->
        <div v-if="assType == '1' || assType == '2'"  class="add_li">
            <span class="li_tit">选择{{assType == 'gateway' ? '网关' : '传感器'}}：</span>
            <Input disabled v-model="assNode" />
        </div>
        <div v-if="assType == '1' || assType == '2'"  class="add_li">
            <span class="li_tit"> </span>
            <Tree ref="treeWrap" @on-select-change="selTree" :data="treeData"></Tree>
        </div>
    </div>
    <div class="add_foot">
        <Button type="primary" @click="toAdd" >提交</Button>
        <Button @click="goBack">取消</Button>
    </div>
  </div>
</template>

<script lang="ts">
import './assetsManage.less';
import assetsApi from '@/api/assetsManage.ts';
import dictionaryApi from '@/api/dataDictionary.ts';
import Vue from 'vue';
import {Component} from 'vue-property-decorator';
@Component
export default class AddAssets extends Vue {

    // data
    private assName: string = '';
    private assType: string = '';
    private assApp: string = '';
    private ssType: string = '';
    private gwType: string = '';
    private assNode: string = '';
    private assNodeId: string = '';
    private gwList: any[] = [];
    private ssList: any[] = [];
    private tableData: any[] = [];
    private treeData: any[] = [];

    // life-cycle
    private created() {
        let assType: any = this.$route.query.pageType;
        // 默认是添加机台
        assType = (assType === '0' || !assType) ? '2' : assType;
        this.assType = assType;
        // this.getTree();
        this.getTreeList();
    }
    private deactivated() {
        let assType: any = this.$route.query.pageType;
        assType = (assType === '0' || !assType) ? '2' : assType;
        this.assType = assType;
        this.assName = '';
        this.assNode = '';
        this.assNodeId = '';
    }

    // methods

    // private getTree() {
    //     const params = {urlStr: ''};
    //     dictionaryApi.selectTree(params).then((res: any) => {
    //         const data = res.data || [];
    //         this.dataTransTree(data);
    //     });
    // },
    // private dataTransTree(treeList: any[]) {
    //     const selectData: any[] = [];
    //     for (const ele of treeList) {
    //         selectData[ele.level] = selectData[ele.level] || [];
    //         selectData[ele.level].push(ele);
    //         ele.title = ele.name;
    //     }
    //     const treeSelData: any[] = [];
    //     selectData.map((ele: any, i: any) => {
    //         if (ele) {
    //             treeSelData.push(ele);
    //         }
    //     });
    //     let  transList: any[] = [];
    //     const leveLen = treeSelData.length;
    //     transList = [...treeSelData[leveLen - 1]];
    //     for (let i = leveLen - 2; i >= 0; i--) {
    //         let treeData: any[] = [];
    //         treeData = [...treeSelData[i]];
    //         treeData.map((selLi: any, j: number) => {
    //             selLi.children = [];
    //             transList.map((traLi: any, k: number) => {
    //                 if (traLi.parent === selLi.id) {
    //                     selLi.children.push(traLi);
    //                 }
    //             });
    //         });
    //         transList = treeData;
    //     }
    //     this.treeData = transList;
    // },
    private selTree(data: any = [], liData: any) {
        console.log(liData.isLocation, parseInt(this.assType, 0));
        if (data.length > 0 && liData.isLocation === parseInt(this.assType, 0)) {
            this.assNode = liData.title;
            this.assNodeId = liData.id;
        } else {
            this.assNode = '';
            this.assNodeId = '';
        }
        console.log(liData.id);
    }
    private getTreeList() {
        const params = {
            assetType: '0',
            title: '',
            isAsset:  2,
        };
        assetsApi.selectTree(params).then((res: any) => {
            const data: any = res.data || {};
            const list: any = [data];
            this.treeData = list;
        });
    }
    private toAdd() {
        const {assName, assNodeId, assType} = this;
        const param = {
            title: assName,
            locationId: assNodeId,
            assetType: assType,
        };
        if (!assNodeId) {
            this.$Message.info('请选择传感器');
            return;
        }
        assetsApi.addAsset(param).then((res: any) => {
            this.$Message.info('添加成功');
        });
    }
    private goBack() {
        history.back();
    }
}
</script>