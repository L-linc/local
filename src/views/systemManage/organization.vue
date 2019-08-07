<template>
  <div class="organization">
    <div class="header">
      <div v-for="i in 5" :key="i">
        <Select v-model="select[i-1]" style="width:180px" @on-change="selected(i)">
          <Option v-for="item in selectData" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span v-if="i<5">&nbsp;一&nbsp;</span>
      </div>
      <Button type="primary" @click="add" style="width:100px;marginLeft:20px;">add</Button>
    </div>
    <div class="content">
      <Tree :data="treeData"></Tree>
    </div>
  </div>
</template>

<script lang="ts">
import './systemManage.less';
export default {
  name: 'organization',
  data() {
    return {
      select: [
        'a',
        'b',
        'c',
        'd',
        'e',
      ],
      selectData: [ // 下拉框数据切换
        {
          value: 'a',
          label: '一级组织',
        },
        {
          value: 'b',
          label: '二级组织',
        },
        {
          value: 'c',
          label: '三级组织',
        },
        {
          value: 'd',
          label: '四级组织',
        },
        {
          value: 'e',
          label: '五级组织',
        },
      ],
      selectedData: '',
      treeData: [ // 树组件数据
        {
          title: '一级组织',
          expand: true,
          children: [
            {
              title: '二级组织',
              expand: true,
              children: [
                {
                  title: '三级组织',
                  expand: true,
                  children: [
                    {
                      title: '四级组织',
                      expand: true,
                      children: [
                        {
                          title: '五级组织',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              title: '二级组织',
            },
            {
              title: '二级组织',
              expand: true,
              children: [
                {
                  title: '三级组织',
                  expand: true,
                  children: [
                    {
                      title: '四级组织',
                    },
                  ],
                },
                {
                  title: '三级组织',
                  expand: true,
                  children: [
                    {
                      title: '四级组织',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  },
  methods: {
    selected(i: any) {
      for (const j of (this as any).selectData) {
        if (j.value === (this as any).select[i - 1]) {
          (this as any).selectedData = j.label;
        }
      }
      // console.log(i);
      // console.log((this as any).select[i - 1]);
      // console.log((this as any).selectedData);
    },
    add() {
      console.log('add');
    },
  },
};
</script>
