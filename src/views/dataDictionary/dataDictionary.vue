<template>
  <div class="dataDictionary">
    dataDictionary / 规则配置
  </div>
</template>

<script lang="ts">
import './dataDictionary.less';
export default {
  name: 'dataDictionary',
  data() {
    return {
      treeData: [
        {
          id: 1,
          name: '1号位',
          children: [],
        },
      ],
    };
  },
};
</script>