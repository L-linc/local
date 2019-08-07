<template>
  <div class="logManage">
    <Tabs type="card" :animated="false" v-model="cardName" @on-click="changeCard">
      <TabPane label="登录日志" name="loadLog" v-if="logPermission">
        <load-log :cardName="cardName"></load-log>
      </TabPane>
      <TabPane label="操作日志" name="handleLog" v-if="handlePermission">
        <handle-log :cardName="cardName"></handle-log>
      </TabPane>
      <!-- <TabPane label="访问日志" name="visitLog">
        <visit-log :cardName="cardName"></visit-log>
      </TabPane> -->
    </Tabs>
  </div>
</template>

<script lang="ts">
import './systemManage.less';
import loadLog from './loadLog.vue';
import handleLog from './handleLog.vue';
import visitLog from './visitLog.vue';
import Vue from 'vue';
import {Component} from 'vue-property-decorator';
@Component({
  components: {
    loadLog,
    handleLog,
    visitLog,
  },
})
export default class LogManage extends Vue {
  private cardName: string = 'loadLog';
  private handlePermission: boolean = true;
  private logPermission: boolean = true;
  private created() {
    this.handlePermission = Vue.prototype.$_has('SYS_LOG_OP');
    this.logPermission = Vue.prototype.$_has('SYS_LOG_LOGIN');
  }

  private deactivated() {
    this.cardName = sessionStorage.getItem('log_tab') || (this.logPermission ?  'loadLog' : 'handleLog');
  }

  private activated() {
    this.cardName = sessionStorage.getItem('log_tab') || (this.logPermission ?  'loadLog' : 'handleLog');
  }

  private changeCard(name: string) {
    sessionStorage.setItem('log_tab', name);
  }
}
</script>
