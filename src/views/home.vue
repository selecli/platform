<template>
  <div class="home">
    <Row>
      <Col span="6" offset="2" class="home-apps">
        <div @click="changType('app')">
          <Icon type="wrench"></Icon>
          <span>App标准化</span>
        </div>
      </Col>
      <Col span="6" offset="1" class="home-apps">
        <div @click="changType('phone')">
          <Icon type="iphone" class=""></Icon>
          <span>机型标准化</span>
        </div>
      </Col>
      <Col span="6" offset="1" class="home-apps">
        <div @click="changType('location')">
          <Icon type="location" class=""></Icon>
          <span>地理信息</span>
        </div>
      </Col>
      <Col span="6" offset="2" class="home-apps">
        <div @click="changType('building')">
          <Icon type="cube" class=""></Icon>
          <span>积木</span>
        </div>
      </Col>
      <Col span="6" offset="1" class="home-apps">
        <div @click="changType('monitor')">
          <Icon type="android-camera" class=""></Icon>
          <span>监控</span>
        </div>
      </Col>
    </Row>
    <!-- <Sorts /> -->
  </div>
</template>

<script>

import { mapState, mapActions } from 'vuex';
//  import Sorts from '../compoents/sorts/sorts.vue';

export default {
  name: 'home',
  data() {
    return {
    };
  },
  computed: mapState([
    'projectName',
    'filterObj',
    'itemsData',
  ]),
  mounted() {
    // this.$store.state.projectName = '海纳平台';
    // this.$store.state.filterObj = {};
  },
  methods: {
    ...mapActions([
      'isLogin',
    ]),
    changType(type) {
      if (type === 'app') {
        this.$store.state.projectName = '海纳平台';
        const header = this.$store.state.hearderPower;
        if (header.indexOf(2) !== -1 && header.indexOf(1) === -1) {
          this.$router.push('./tags');
        } else {
          this.$router.push('./workflow');
        }
        this.$store.state.itemsData = [
          { label: '作业平台', value: 'workflow', name: 1, id: 1 },
          { label: '成果查询', value: 'tags', name: 2, id: 2 },
          { label: '标签维护', value: 'sorts', name: 3, id: 3 },
          { label: '历史查询', value: 'history', name: 4, id: 4 },
        ];
      } else if (type === 'location') {
        this.$router.push('./location');
        this.$store.state.itemsData = [
          // { label: '标准化作业', value: 'location', name: 1 },
        ];
      } else if (type === 'building') {
        this.$router.push('./building');
        this.$store.state.itemsData = [
          { label: '定制加工', value: 'building', name: 1, id: 1 },
          { label: '自主加工', value: 'independent', name: 2, id: 2 },
          { label: '配置关系', value: 'config', name: 3, id: 3 },
          { label: '成果数据', value: 'outcome', name: 1, id: 4 },
        ];
      } else if (type === 'phone') {
//         To do ...
//        this.$router.push('./phone');
      } else if (type === 'monitor') {
        this.$router.push('./monitor');
      }
    },
// 验证token
    login() {
      this.isLogin();
    },
  },
  components: {
  },
  watch: {
    $route() {
      if (this.$router.currentRoute.name === 'independent') {
        this.$store.state.route = 2;
        console.log(7777);
      }
    },
  },
};
</script>
