<template>
  <div class="login">
    <!-- <Row :gutter="16">
      <Col span="4" offset="10" class="login-content">
        <div class="login-title">
          <div class="login-title-logo common-float-left"></div>
          <span class="login-title-text common-float-left">海纳平台</span>
        </div>
        <Form ref="formInfo" :model="formInfo" :rules="ruleInline">
          <FormItem prop="user">
            <Input type="text" v-model="formInfo.user" placeholder="Username">
            <Icon type="ios-person-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="password">
            <Input type="password" v-model="formInfo.password" placeholder="Password">
            <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem class="login-btn">
            <Button type="primary" @click="handleSubmit('formInfo')">Sign In</Button>
          </FormItem>
        </Form>
      </Col>
    </Row> -->
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'login',
  data() {
    return {
      formInfo: {
        user: '',
        password: '',
      },
      ruleInline: {
        user: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { type: 'string', min: 6, message: '密码不能少于6位', trigger: 'blur' },
        ],
      },
    };
  },
  computed: mapState([
    'spinShow',
    'iamUrl',
  ]),
  mounted() {
    this.$store.state.spinShow = true;
    const temp = window.location.hash.substring(14) || Cookies.get('token');
    if (temp !== '' && temp !== undefined) {
      Cookies.set('token', temp);
    }
    if (temp !== undefined && temp !== undefined) {
      const self = this;
      const params = {
        callback() {
          self.$Message.info({
            content: '对不起，你没有本系统的权限，请联系：张晓宇（xiaoyu.zhang@tendcloud.com）',
            duration: 10,
            closable: true,
          });
        },
      };
      this.isLogin(params);
    } else {
      window.location.href = this.iamUrl;
    }
  },
  methods: {
    ...mapActions([
      'isLogin',
    ]),
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        // valid 简单的前端验证
        if (valid) {
          // 在这里写登录的请求
          this.$Message.success('登录成功!');
          this.$router.push('./home');
        } else {
          this.$Message.error('请输入正确的用户名或密码!');
        }
      });
    },
  },
  components: {
  },
};
</script>
