<template>
  <div>
    <div class="layout">
      <Row>
        <Col span="21">
          <Menu mode="horizontal" theme="dark" :active-name="n">
            <div class="layout-logo" @click="backHome"></div>
            <span class="logo-name">{{projectName}}</span>
            <div class="layout-nav clearfix" v-show="showTab">
              <MenuItem :name="tag.name"
                        @click.native="changeTag(tag)"
                        v-if="isMenu"
                        v-for="tag in tags"
                        :key="tag.name"
                        :class="{'no-power': hearderPower.indexOf(tag.name) === -1}">
                {{tag.label}}
              </MenuItem>
              <MenuItem :name="tag.name"
                        v-if="!isMenu"
                        @click.native="changeBuilding(tag)"
                        v-for="tag in buildings"
                        :key="tag.name"
                        >
                {{tag.label}}
              </MenuItem>
            </div>
          </Menu>
        </Col>
        <Col span="3">
        <div class="user-info">
          <span @click="settingBtn" v-show="!showTab">
            <Icon type="android-settings"></Icon>
          </span>
          <span class="user-name">{{user.displayName}}</span>
          <span @click="closeBtn" class="login-out">
            <!--<Icon type="power"></Icon>-->
            <Button type="ghost">退出</Button>
          </span>
        </div>
        </Col>
      </Row>
    </div>
    <Modal
      class="logout-modal"
      v-model="showModel"
      title="提示"
      @on-ok="ok"
      @on-cancel="cancel">
      <p>是否确定登出？</p>
    </Modal>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'workflow',
  data() {
    return {
      showModel: false,
      user: {},
      isMenu: true,
      showTab: false,
      buildings: [],
      n: '1',
      tags: [
      ], // name的值为与后台人员商议的唯一代表值，需根据后台返回的权限列表进行权限控制 ， 暂定为1的是因为现阶段还没有对其进行权限控制
    };
  },
  computed: mapState([
    'projectName',
    'userInfo',
    'iamUrl',
    'hearderPower',
    'isSuperManager',
    'itemsData',
    'dateTime',
  ]),
  mounted() {
    if (Cookies.get('userInfo') !== undefined) {
      this.user = JSON.parse(Cookies.get('userInfo'));
    }
    if (Cookies.get('token') === '') {
      window.location.href = this.iamUrl;
    }
    this.tags = [
      { label: '作业平台', value: 'workflow', name: 1 },
      { label: '成果查询', value: 'tags', name: 2 },
      { label: '标签维护', value: 'sorts', name: 3 },
      { label: '历史查询', value: 'history', name: 4 },
    ];
    this.buildings = [
      { label: '定制加工', value: 'building', name: 1 },
      { label: '自主加工', value: 'independent', name: 2 },
      { label: '配置关系', value: 'config', name: 3 },
      { label: '成果数据', value: 'outcome', name: 4 },
    ];
  },
  methods: {
    ...mapActions([
      'logout',
    ]),
    changeTag(type) {
      if (this.hearderPower.indexOf(type.name) !== -1) {
        this.$router.push(`./${type.value}`);
      } else {
        this.$Message.error('对不起，您没有权限');
      }
    },
    changeBuilding(type) {
      this.$router.push(`./${type.value}`);
      this.isMenu = false;
    },
    backHome() {
      this.$router.push('./home');
    },
    ok() {
      this.logout();
    },
    cancel() {},
    settingBtn() {
      this.$router.push('./manage');
    },
    closeBtn() {
      this.showModel = !this.showModel;
    },
  },
  components: {
  },
  watch: {
    userInfo() {
      if (this.userInfo !== '') {
        this.user = JSON.parse(this.userInfo);
      }
    },
    $route() {
      this.$store.state.route = new Date();
      if (this.$router.currentRoute.name === 'home' || this.$router.currentRoute.name === 'manage') {
        this.showTab = false;
      } else {
        this.showTab = true;
      }
      this.n = 1;
      if (this.$router.currentRoute.name === 'building' || this.$router.currentRoute.name === 'config' || this.$router.currentRoute.name === 'independent' || this.$router.currentRoute.name === 'outcome') {
        this.isMenu = false;
      } else {
        this.isMenu = true;
      }
    },
    itemsData() {
      console.log(1111);
      this.tags = this.itemsData;
    },
  },
};
</script>
