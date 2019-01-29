<template>
  <div id="app">
    <!--头部导航部分-->
    <headerNav v-show="this.$router.currentRoute.name !== 'login'"></headerNav>
    <router-view></router-view>
    <Spin fix v-if="spinShow">
      <Icon type="load-c" size=22 class="demo-spin-icon-load"></Icon>
      <div style="font-size:12px;">Loading</div>
    </Spin>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import headerNav from './views/headerNav';

export default {
  name: 'app',
  computed: mapState([
    'spinShow',
  ]),
  components: {
    headerNav,
  },
  methods: {
    ...mapActions([
      'getUserPower',
    ]),
  },
};
</script>

<style>
  @import "styles/index.css";
</style>
