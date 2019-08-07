<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="username">
      <Input v-model="form.username" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="24" type="md-mail"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input type="password" v-model="form.password" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="24" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" type="primary" long class="u-login-btn">登录</Button>
    </FormItem>
  </Form>
</template>
<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
interface FormInterface {
  username: string;
  password: string;
}

@Component
export default class LoginForm extends Vue {
  @Prop({
    type: Array,
    default: () => {
      return [{ required: true, message: '账号不能为空', trigger: 'blur' }];
    },
  })
  private usernameRules: any;

  @Prop({
    type: Array,
    default: () => {
      return [{ required: true, message: '密码不能为空', trigger: 'blur' }];
    },
  })
  private passwordRules: any;

  private form: FormInterface = {
    username: '',
    password: '',
  };

  get rules() {
    return {
      username: this.usernameRules,
      password: this.passwordRules,
    };
  }
  private handleSubmit() {
    (this.$refs.loginForm as any).validate((valid: boolean) => {
      if (valid) {
        this.$emit('on-success-valid', {
          username: this.form.username,
          password: this.form.password,
        });
      }
    });
  }
}
</script>