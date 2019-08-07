<template>
  <div class="transfer" :style="{ width, height }">
    <!-- 左侧穿梭框 原料框 -->
    <div class="transfer-left">
      <!-- 内容区 -->
      <div class="transfer-main">
        <Tree
          ref="from-tree"
          :data="selfFromData"
          @on-check-change="fromCheckChange"
          show-checkbox
          multiple
        ></Tree>
      </div>
    </div>
    <!-- 穿梭区 按钮框 -->
    <div class="transfer-center">
      <div class="transfer-center-item">
        <Button type="primary" size="small" @click="addToAims(true)" :disabled="fromDisabled">
          添加
          <Icon type="ios-arrow-forward"/>
        </Button>
      </div>
      <div class="transfer-center-item">
        <Button size="small" @click="removeToSource" :disabled="toDisabled">
          <Icon type="ios-arrow-back"/>移除
        </Button>
      </div>
    </div>
    <!-- 右侧穿梭框 目标框 -->
    <div class="transfer-right">
      <!-- 内容区 -->
      <div class="transfer-main">
        <Tree
          ref="to-tree"
          :data="selfToData"
          @on-check-change="toCheckChange"
          show-checkbox
          multiple
        ></Tree>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      allData: [],
      selfFromData: [], // 左侧 tree
      selfToData: [], // 右侧 tree
      fromKeys: new Set(), // 左侧 key 集合
      toKeys: new Set(), // 右侧 key 集合
      fromDisabled: true, // 添加按钮是否禁用
      toDisabled: true, // 移除按钮是否禁用
      tansferKeys: new Set(),  // 穿梭到右侧的 key
    };
  },
  props: {
    // 宽度
    width: {
      type: String,
      default: '100%',
    },
    // 高度
    height: {
      type: String,
      default: '320px',
    },
    // 源数据
    fromData: {
      type: Array,
      default: () => [],
    },
    // 目标数据
    toData: {
      type: Array,
      default: () => [],
    },
    // 默认穿梭 key 列表
    defaultTansferKeys: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    // 添加按钮
    addToAims(isEmit) {
      // 选中
      const checkedNodes = this.$refs['from-tree'].getCheckedNodes();
      const checkedKeys = checkedNodes.map(d => {
        this.tansferKeys.add(d.id);
        return d.id;
      });
      // 半选 & 选中
      const checkedAndIndeterminateNodes = this.$refs[
        'from-tree'
      ].getCheckedAndIndeterminateNodes();
      const checkedAndIndeterminateKeys = checkedAndIndeterminateNodes.map(
        d => d.id,
      );

      // 源树 - 除去（选中的 + 之前除去的）
      checkedKeys.forEach(d => {
        this.fromKeys.delete(d);
      });
      const newFromData = this.allData.filter(d => this.fromKeys.has(d.id));
      this.selfFromData = this.arrayToTree(newFromData);

      // 目标树 - 半选 & 选中 + 右侧之前已存在的
      checkedAndIndeterminateKeys.forEach(d => {
        this.toKeys.add(d);
      });
      const newToData = this.allData.filter(d => this.toKeys.has(d.id));
      this.selfToData = this.arrayToTree(newToData);

      this.fromDisabled = true;
      this.toDisabled = true;

      // 传递信息给父组件
      if (isEmit) {
        this.$emit(
          'addEvent',
          Array.from(this.tansferKeys),
          {
            from: newFromData,
            to: newToData,
          },
        );
      }
    },
    // 移除按钮
    removeToSource() {
      // 选中
      const checkedNodes = this.$refs['to-tree'].getCheckedNodes();
      const checkedKeys = checkedNodes.map(d => {
        this.tansferKeys.delete(d.id);
        return d.id;
      });
      // 半选 & 选中
      const checkedAndIndeterminateNodes = this.$refs[
        'to-tree'
      ].getCheckedAndIndeterminateNodes();
      const checkedAndIndeterminateKeys = checkedAndIndeterminateNodes.map(
        d => {
          this.tansferKeys.delete(d.id);
          return d.id;
        },
      );

      // 目标树 - 除去选中的
      checkedKeys.forEach(d => {
        this.toKeys.delete(d);
      });
      const newToData = this.allData.filter(d => this.toKeys.has(d.id));
      this.selfToData = this.arrayToTree(newToData);

      // 源树 - 半选 & 选中 + 左侧之前已存在的
      checkedAndIndeterminateKeys.forEach(d => {
        this.fromKeys.add(d);
      });
      const newFromData = this.allData.filter(d => this.fromKeys.has(d.id));
      this.selfFromData = this.arrayToTree(newFromData);

      this.fromDisabled = true;
      this.toDisabled = true;

      // 传递信息给父组件
      this.$emit(
        'removeEvent',
        Array.from(this.tansferKeys),
        {
          from: newFromData,
          to: newToData,
        },
      );
    },
    // 源树选中事件
    fromCheckChange(treeObj, nodeObj) {
      this.fromDisabled = treeObj.length === 0;
    },
    // 目标树选中事件
    toCheckChange(treeObj, nodeObj) {
      this.toDisabled = treeObj.length === 0;
    },
    // 将数组转成 tree
    arrayToTree(data, isOpenAll = true) {
      const cloneData = JSON.parse(JSON.stringify(data));
      const parentsData = cloneData.filter(
        value => value.pid === 'undefined' || value.pid === null,
      );
      const childrenData = cloneData.filter(
        value => value.pid !== 'undefined' && value.pid !== null,
      );
      const translator = (parents, children) => {
        parents.forEach(parent => {
          if (isOpenAll) {
            parent.expand = true;
          }
          children.forEach((current, index) => {
            if (current.pid === parent.id) {
              const temp = JSON.parse(JSON.stringify(children));
              temp.splice(index, 1);
              translator([current], temp);
              typeof parent.children !== 'undefined'
                ? parent.children.push(current)
                : (parent.children = [current]);
            }
          });
        });
      };
      translator(parentsData, childrenData);
      return parentsData;
    },
    // 根据传进来 fromData 和 defaultTansferKeys 生成带默认选中的总树
    getAllData(fromData, defaultTansferKeys) {
      const allData = [];
      fromData.forEach(d => {
        if (!defaultTansferKeys.includes(d.id)) {
          this.fromKeys.add(d.id);
        } else {
          d.checked = true;
          this.toKeys.add(d.id);
        }
        allData.push(d);
      });
      return allData;
    },
  },
  watch: {
    fromData(newVal) {
      if (newVal) {
        this.allData = this.getAllData(newVal, this.defaultTansferKeys);
        this.selfFromData = this.arrayToTree(this.allData);
      }
    },
    // 监视默认选中
    defaultTansferKeys(newVal) {
      if (newVal) {
        if (newVal.length === 0) {
          this.selfToData = [];
          this.tansferKeys.clear();
          this.toKeys.clear();
        } else {
          this.allData = this.getAllData(this.fromData, newVal);
          this.selfFromData = this.arrayToTree(this.allData);
          newVal.forEach(d => {
            this.tansferKeys.add(d);
          });
          this.$nextTick(() => {
            this.addToAims();
            this.$nextTick(() => {
              // 半选 & 选中
              const toNodes = this.$refs[
                'to-tree'
              ].getCheckedAndIndeterminateNodes();
              toNodes.map(d => {
                d.checked = false;
                d.indeterminate = false;
                return d;
              });
              this.allData.map(d => {
                d.checked = false;
                return d;
              });
            });
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.transfer {
  position: relative;
  overflow: hidden;
}

.transfer-left {
  position: absolute;
  top: 0;
  left: 0;
}

.transfer-right {
  position: absolute;
  top: 0;
  right: 0;
}

.transfer-main {
  padding: 10px;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
}

.transfer-left,
.transfer-right {
  border: 1px solid #ebeef5;
  width: 40%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 5px;
}

.transfer-center {
  position: absolute;
  top: 50%;
  left: 40%;
  width: 20%;
  transform: translateY(-50%);
  text-align: center;
}

.transfer-center-item {
  padding: 10px;
  overflow: hidden;
}
</style>