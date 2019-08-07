<template>
  <div class='login'>
    <div class='u-login-header'>
      <img src='~assets/images/login/logo @3x.png' class='u-login-logo'>
      <div class='u-login-title'>
        <img src='~assets/images/login/header-title.png' class='u-login-title-word'>
      </div>
    </div>
    <div class='u-login-content'>
      <div class='login-con'>
        <login-form @on-success-valid='handleSubmit'></login-form>
      </div>
      <div class='u-introduce'>
        <img src='~assets/images/login/word-line2.png' class='u-introduce-word u-introduce-word1'>
        <img src='~assets/images/login/word-line.png' class='u-introduce-word u-introduce-word2'>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import LoginForm from './login.vue';
import * as logApi from '@/api/login';
import * as utils from '@/config/utils';
import md5 from 'js-md5';

interface FormInterface {
  username: string;
  password: string;
}

@Component({
  components: {
    LoginForm,
  },
})
export default class LoginIndex extends Vue {
  private redirectPath: string|string[] = '';
  private created() {
    const redirect: any = this.$route.query.redirect;
    this.redirectPath = redirect;
    // this.redirectPath = this.$route.query.redirect;
  }

  private handleSubmit({ username, password }: FormInterface) {
    password = md5(password);
    logApi.loginApi({ username, password }).then(res => {
      try {
        utils.setCookie('token', res.data.token);
        utils.setCookie('refreshToken', res.data.refreshToken);
        logApi.getAuthApi().then((resp: any) => {
          const NOTE = JSON.stringify(resp.data);
          localStorage.setItem('roleAuth', NOTE);
          this.$router.push('/alarmCenter');
        });
      } catch (error) {
        console.log(error);
      }
    });
  }
}
</script>
<style lang='less'>
.login {
  width: 100%;
  height: 100%;
  background-image: url('~assets/images/login/rectangle-1.png');
  background-size: cover;
  background-position: left;
  .u-login-header {
    height: 100px;
    position: relative;
    .u-login-logo {
      width: 140px;
      position: absolute;
      top: 27px;
      left: 50px;
    }
    .u-login-title {
      width: 425px;
      height: 100%;
      float: right;
      background-image: url('~assets/images/login/rectangle-2.png');
      background-size: cover;
      background-position: left;
      position: relative;
      .u-login-title-word {
        width: 280px;
        height: 35px;
        position: absolute;
        right: 54px;
        top: 34px;
      }
    }
  }
  .u-login-content {
    background-image: url('~assets/images/login/login-bg.png');
    background-size: 100% 100%;
    background-position: left;
    position: relative;
    height: calc(~'100% - 100px');
    .login-con {
      position: absolute;
      width: 400px;
      right: 13%;
      top: 23%;
      z-index: 999999;
      &-header {
        font-size: 16px;
        font-weight: 300;
        text-align: center;
        padding: 30px 0;
      }
      .ivu-form-item {
        width: 400px;
        margin-bottom: 30px;
        .ivu-form-item-content {
          font-size: 14px;
          height: 60px;
          background-color: transparent;
          opacity: 0.8;
          .ivu-input {
            height: 60px;
            font-size: 14px;
          }
          .ivu-btn {
            height: 60px;
            font-size: 24px;
            letter-spacing: 22px;
            background: #148cff;
          }
          .ivu-icon {
            color: #148cff;
          }
        }
      }
      .form-con {
        padding: 10px 0 0;
      }
      .login-tip {
        font-size: 10px;
        text-align: center;
        color: #c3c3c3;
      }
    }
    .u-introduce {
      position: absolute;
      left: 107px;
      top: 22%;
      width: 370px;
      .u-introduce-word {
        float: left;
      }
      .u-introduce-word1 {
        height: 50px;
      }
      .u-introduce-word2 {
        height: 20px;
        margin-top: 18px;
      }
    }
  }
}
</style>
