<template>
  <div>
    <Modal v-model="editModal" class="modal-frame" @on-visible-change="change">
      <div class="fake-modal">
        <!-- 根据isTip判断是否是编辑还是确认框 -->
        <Form v-if="modalContent.isTip" :model="modalContent" label-position="top" :label-width="100" inline>
          <FormItem v-for="(item, index) in varCollectList" :key="index" :label="item.label">
            <!-- input类型 -->
            <Input v-if="item.type === 'input'" v-model="item.value" style="width: 360px"/>
            <!-- dataType: 选中的数据类型 -->
            <Select v-else v-model="item.value" :placeholder="item.value" style="width:200px">
              <Option
                v-for="(item, index) in typeCollect"
                :value="item.label"
                :key="index"
              >{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Form>
        <span v-else>{{modalContent.tipWords}}</span>
      </div>
      <div slot="header">{{modalContent.title}}</div>
        <div slot="footer">
            <Button v-if="isCancel" style="width:84px;height:28px;;fontSize:14px;" @click="cancel">取消</Button>
            <Button type="primary" style="width:84px; height:28px;fontSize:14px;" @click="confirm">确认</Button>
        </div>
    </Modal>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'modal',
  props: {
      isCancel: {
          type: Boolean,
          default: true,
      },
      editModal_a: {
          type: Boolean,
          default: false,
      },
      modalContent: {
          type: Object,
          default: () => {
              return {
                  isTip: false,
                  title: '编辑',
                  tipWords: '确定删除0.1u吗',
              };
          },
      },
      varCollectList: {
          type: Array,
          default: () => [],
      },
  },
  data() {
    return {
      title: '编辑',
      dataType: 'STRING',
      typeCollect: [
        {
            id: '0',
            label: '请选择',
        },
        {
            id: '1',
            label: 'TINYINT',
        },
        {
            id: '2',
            label: 'SMALLINT',
        },
        {
            id: '3',
            label: 'INT',
        },
        {
            id: '4',
            label: 'BIGINT',
        },
        {
            id: '5',
            label: 'FLOAT',
        },
        {
            id: '6',
            label: 'DOUBLE',
        },
        {
            id: '7',
            label: 'DECIMAL',
        },
        {
            id: '8',
            label: 'VARCHAR(n)',
        },
        {
            id: '9',
            label: 'STRING',
        },
      ],
    };
  },
  computed: {
    editModal: {
        get() {
            return (this as any).editModal_a;
        },
        set(status: any) {
            (this as any).$emit('closeFrame', status);
        },
    },
  },
  methods: {
      cancel() {
          this.$emit('closeFrame', false);
      },
      confirm() {
          if ((this as any).modalContent.isTip) {
            this.$emit('confirm', (this as any).varCollectList);
          } else {
            this.$emit('confirm', false);
          }
      },
      change(status: any) {
        // if (!status) {
        //     this.$emit("closeFrame", status)
        // }
        //   this.$emit("closeFrame", status)
      },
  },
});
</script>
<style lang="less">
.modal-frame {
  width: 410px;
  .ivu-modal {
    width: 410px !important;
  }
  .fake-modal {
    border-radius: 2px;
    background: #fff;
    .ivu-form-item-label {
      text-align: left;
    }
    & > p {
      margin-bottom: 20px;
      font-size: 16px;
    }
    .accountWrapper {
      width: 360px;
      height: 32px;
      background: #fff;
      border-radius: 2px;
      overflow: auto;
      font-size: 14px;
    }
    .ivu-form-item-content {
      margin-left: 0 !important;
      .ivu-select {
        width: 360px !important;
      }
    }
  }
  .ivu-modal-header {
    height: 36px;
    line-height: 36px;
    padding: 0;
    border-radius: 4px 4px 0 0 ;
    background: linear-gradient(
      0deg,
      rgba(216, 216, 216, 1) 0%,
      rgba(228, 227, 228, 1) 100%
    );
    text-align: center;
  }
  .ivu-modal-footer {
      border: 0;
      .ivu-btn {
        padding: 0;
        &hover{
          color: #337BF7;
          border-color: #337BF7;
        }
      }
      .ivu-btn-primary {
        background: #337BF7;
      }
  }
}
</style>

