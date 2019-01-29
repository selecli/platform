import Cookies from 'js-cookie';
import { Message } from 'iview';
import Vue from 'vue';
import Router from 'vue-router';
import store from '../store';

// import index from '../views/index.vue'

Vue.use(Router);
console.log(Cookies);

const router = new Router({
  routes: [
    {
      path: '/',
      name: '',
      redirect() {
        // 方法接收 目标路由 作为参数
        // return 重定向的 字符串路径/路径对象
        return '/login';
      },
    },
    {
      path: '/login',
      name: 'login',
      component: (resolve) => {
        require.ensure(['../views/login.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../views/login.vue'));
        });
      },
    },
    {
      path: '/home',
      name: 'home',
      component: (resolve) => {
        require.ensure(['../views/home.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../views/home.vue'));
        });
      },
    },
    {
      path: '/workflow',
      name: 'workflow',
      component: (resolve) => {
        require.ensure(['../views/workflow.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../views/workflow.vue'));
        });
      },
      beforeEnter: (to, from, next) => {
        const params = {
          callback() {
            if (store.state.allPower.length !== 0) {
              next();
            } else {
              Message.error('对不起，您没有权限');
            }
          },
        };
        store.dispatch('getUserPower', params);
      },
    },
    {
      path: '/tags',
      name: 'tags',
      component: (resolve) => {
        require.ensure(['../views/tags.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../views/tags.vue'));
        });
      },
      beforeEnter: (to, from, next) => {
        // 根据用户查看页面的权限进行路由限制,7 为后台定义的成果查询页面查看的权限
        const params = {
          callback() {
            if (store.state.allPower.length !== 0 && store.state.viewPower.indexOf(6) !== -1) {
              next();
            } else {
              Message.error('对不起，您没有权限');
            }
          },
        };
        store.dispatch('getUserPower', params);
      },
    },
    {
      path: '/sorts',
      name: 'sorts',
      component: (resolve) => {
        require.ensure(['../views/sorts.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../views/sorts.vue'));
        });
      },
    },
    {
      path: '/manage',
      name: 'manage',
      component: (resolve) => {
        require.ensure(['../components/userManage/manage.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../components/userManage/manage.vue'));
        });
      },
      beforeEnter: (to, from, next) => {
        const params = {
          callback() {
            if (store.state.isSuperManager === 1) {
              next();
            } else {
              Message.error('对不起，您没有权限');
            }
          },
        };
        store.dispatch('getUserPower', params);
      },
    },
    {
      path: '/location',
      name: 'location',
      component: (resolve) => {
        require.ensure(['../views/location.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../views/location.vue'));
        });
      },
    },
    {
      path: '/building',
      name: 'building',
      component: (resolve) => {
        require.ensure(['../views/building.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../views/building.vue'));
        });
      },
    },
    {
      path: '/independent',
      name: 'independent',
      component: (resolve) => {
        require.ensure(['../components/building/independent.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../components/building/independent.vue'));
        });
      },
    },
    {
      path: '/config',
      name: 'config',
      component: (resolve) => {
        require.ensure(['../components/building/config.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../components/building/config.vue'));
        });
      },
    },
    {
      path: '/outcome',
      name: 'outcome',
      component: (resolve) => {
        require.ensure(['../components/building/outcome.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../components/building/outcome.vue'));
        });
      },
    },
    {
      path: '/search',
      name: 'search',
      component: (resolve) => {
        require.ensure(['../components/building/search.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../components/building/search.vue'));
        });
      },
    },
    {
      path: '/custom',
      name: 'custom',
      component: (resolve) => {
        require.ensure(['../components/building/custom.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../components/building/custom.vue'));
        });
      },
    },
    {
      path: '/history',
      name: 'history',
      component: (resolve) => {
        require.ensure(['../views/history.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../views/history.vue'));
        });
      },
    },
    {
      path: '/monitor',
      name: 'monintor',
      component: (resolve) => {
        require.ensure(['../views/monitor.vue'], () => {
          // eslint-disable-next-line
          resolve(require('../views/monitor.vue'));
        });
      },
    },
  ],
});
// router.beforeEach((to, from, next) => {
//   const token = Cookies.get('token');
//   console.log(token);
//   if (!token && to.name !== 'login') {
//     next({ name: 'login' });
//   } else if (!token && to.name === 'login') {
//     next();
//   } else {
//     next();
//   }
// });
export default router;
