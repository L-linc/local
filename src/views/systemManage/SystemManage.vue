<template>
  <div class="home">
    <Layout>
      <Content>
        <Breadcrumb separator=">">
          当前位置&nbsp;:
          <BreadcrumbItem>系统管理</BreadcrumbItem>
          <BreadcrumbItem>{{bread}}</BreadcrumbItem>
        </Breadcrumb>
        <Tabs type="card" @on-click="setBread">
          <TabPane label="账号管理" name="账号管理">
            <account-manage></account-manage>
          </TabPane>
          <TabPane label="组织机构" name="组织机构">
            <organization></organization>
          </TabPane>
          <TabPane label="角色管理" name="角色管理">
            <role-manage></role-manage>
          </TabPane>
          <TabPane label="权限管理" name="权限管理">
            <auth-manage></auth-manage>
          </TabPane>
          <TabPane label="日志管理" name="日志管理">
            <log-manage></log-manage>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  </div>
</template>

<script lang="ts">
import './systemManage.less';
import accountManage from './accountManage.vue';
import organization from './organization.vue';
import roleManage from './roleManage.vue';
import authManage from './authManage.vue';
import logManage from './logManage.vue';
export default {
  name: 'SystemManage',
  data() {
    return {
      bread: '账号管理', // 面包屑
    };
  },
  components: {
    accountManage,
    organization,
    roleManage,
    authManage,
    logManage,
  },
  methods: {
    setBread(label: string) {
      (this as any).bread = label;
    },
  },
};
</script>
