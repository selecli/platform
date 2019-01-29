import iView from 'iview';
import VueClipboard from 'vue-clipboard2';
import 'iview/dist/styles/iview.css';
import Vue from 'vue';
import echarts from 'echarts';
import App from './App';
import router from './router';
import store from './store';


Vue.use(iView);
Vue.config.productionTip = false;
VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);
Vue.prototype.$echarts = echarts;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  store,
});

// Vue.http.options.emulateJSON = true;
