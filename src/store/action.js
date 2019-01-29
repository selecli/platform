import Cookies from 'js-cookie';
import axios from 'axios';
import { Message, Notice } from 'iview';

// request 拦截器
axios.interceptors.request.use((config) => {
  const obj = config;
  if (Cookies.get('token') !== undefined && Cookies.get('userInfo') !== undefined) {
    obj.headers.token = Cookies.get('token');
    obj.headers.userName = JSON.parse(Cookies.get('userInfo')).userName;
  }
  // obj.headers.token = 'admin';  // 本地调试
  // obj.headers.userName = 'admin';  // 本地调试
  return obj;
}, err => Promise.reject(err));

// response 拦截器
axios.interceptors.response.use((response) => {
  switch (response.data.code) {
    case 400:
      Message.destroy();
      Message.warning('登录失败');
      Cookies.remove('token');
      Cookies.remove('userInfo');
      setTimeout(() => {
        window.location.href = 'https://iam.tendcloud.com/login?app_id=c77bf7cf-cacb-5409-8ebc-a1e0a72397a6';
      }, 1000);
      break;
    case 401:
      Message.info({
        content: '对不起，你没有本系统的权限，请联系：张晓宇（xiaoyu.zhang@tendcloud.com）',
        duration: 10,
        closable: true,
      });
      break;
    default:
  }
  return response;
}, (error) => {
  console.log(error);
});


export default {
  // 验证token
  isLogin({ dispatch, commit, state }, params) {
    if (params === undefined) {
      params = {};
    }
    params.token = Cookies.get('token');
    axios({
      url: `${state.url}/userInfo/login`,
      // url: 'http://172.28.6.158:8080/userInfo/login ',
      method: 'POST',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          if (+response.data.code === 400) {
            // token不正确
            window.location.href = state.iamUrl;
          } else if (+response.data.code === 200) {
            // token正确且有系统权限
            Cookies.set('userInfo', response.data.userInfo);
            state.userInfo = JSON.stringify(response.data.userInfo);
            window.location.href = `${state.projectHome}/#/home`;
            // 登录成功后获取一次用户的权限
            dispatch('getUserPower');
          //  window.location.href = 'http://localhost:8089/#/home';  // 临时做线上跳回本地，方便调试
            state.spinShow = false;
          } else if (+response.data.code === 401) {
            // token正确但是没有系统权限
            state.spinShow = false;
            Cookies.remove('token');
            Cookies.remove('userInfo');
            if (params.callback !== undefined) {
              params.callback();
            }
          }
        }
      });
  },
  // 注销
  logout({ state }) {
    const params = {
      token: Cookies.get('token'),
      email: JSON.parse(state.userInfo).email,
    };
    axios({
      url: `${state.url}/userInfo/logout`,
      // url: 'http://172.28.6.158:8080/userInfo/logout',
      method: 'POST',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          Cookies.remove('token');
          Cookies.remove('userInfo');
          window.location.href = state.iamUrl;
        }
      });
  },
  // 获取当前用户的权限
  getUserPower({ state }, params) {
    axios({
      url: `${state.url}/userInfo/findUserPower`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        userName: JSON.parse(state.userInfo).userName,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            state.allPower = response.data.powerInfo;
            state.isSuperManager = response.data.manager;
            const workflowPower = [1, 2, 3, 7, 4, 5];
            const tagsPower = 6;
            // 在对权限进行解析之前将之前的所有权限清空
            state.hashPower = false;
            state.viewPower = [];
            state.hearderPower = [];
            response.data.powerInfo.forEach((item) => {
              if (state.viewPower.indexOf(item.view) === -1 && item.view !== 0) {
                state.viewPower.push(item.view);
              }
              if (workflowPower.indexOf(item.view) !== -1 &&
                state.hearderPower.indexOf(1) === -1) {
                state.hearderPower.push(1);
              }
              if (item.id === 19) {
                state.hashPower = true;
              }
            });
            if (state.viewPower.indexOf(tagsPower) !== -1) {
              state.hearderPower.push(2);
            }
            state.hearderPower.push(3);
            state.hearderPower.push(4);
            if (params.callback) {
              params.callback();
            }
          }
        }
      });
  },
  // 获取所有APP
  getAPPs({ commit, state }, params) {
  //  state.spinShow = true;
  //  console.log(9999);
    commit('changeUrl');
    const url = state.lastUrl;
    if (params === undefined) {
      params = state.filterObj;
    }
    params.page = state.currentPage;
    params.pageSize = state.pageSize;
    params.orderBy = state.sortObj.orderBy;
    params.sortBy = state.sortObj.sortBy;
    params.userId = JSON.parse(state.userInfo).userId;
    if (state.stepVal === 5 || state.stepVal === 4) {
      params.view = state.stepVal;
    } else if (state.stepVal === 3) {
      params.view = 7;
    } else {
      params.view = state.stepVal + 1;
    }
    const status = params.packageStatus;
    if (state.stepVal === 4) {
      params.sel = 'noSel';
    }
    if (params.packageStatus === 'all' || params.packageStatus === undefined) {
      params.packageStatusOperator = 'in';
      if (state.stepVal === 0) {
        params.packageStatus = 'pretreatment';
      } else if (state.stepVal === 1) {
        params.packageStatus = 'complete';
      } else if (state.stepVal === 2) {
        params.packageStatus = 'operation';
      } else if (state.stepVal === 3) {
        params.packageStatus = 'pkgcheck';
      } else if (state.stepVal === 4) {
        params.packageStatus = 'package';
      } else if (state.stepVal === 5) {
        params.packageStatus = null;
        params.appStatus = 'all';
      }
    } else {
      params.packageStatusOperator = null;
    }
    const p = params;
    axios({
      url: `${state.url}/app${url}`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          params.packageStatus = status;
          if (params.sel === 'noSel') {
            response.data.data.forEach((item) => {
              if (item.packageStatus === 11 || item.packageStatus === 8 || item.substatus === 2) {
                // eslint-disable-next-line
                item._disabled = true;
              }
            });
          }
          state.listContent = response.data.data;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
          // 将加载中的效果去除
      //    state.spinShow = false;
          // 将禁止的按钮激活
          state.disabledBtn = [];
        }
      });
  },
  // 预处理的请求
  pretreatmentPost({ commit, state }, params) {
    axios({
      url: `${state.url}/app/acquires/pretreatment`,
      method: 'POST',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          if (response.data.code === 200) {
            state.isGet = new Date();
            state.listArr = [];
            if (params.callback !== undefined) {
              params.callback();
            }
          }
          if (response.data.code === 402) {
            Notice.error({
              title: '提示',
              desc: '预处理失败',
            });
            Message.destroy();
          }
        }
      });
  },
  // 预处理全部的请求
  pretreatmentAllPost({ commit, state }, params) {
    axios({
      url: `${state.url}/app/acquires/preAllTreatment`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.result.data;
          state.listTotal = response.data.result.total;
          state.listArr = [];
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 删除列表的请求
  delListPOST({ commit, state }, params) {
    axios({
      url: `${state.url}/app/acquires/delete`,
      method: 'POST',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          state.isGet = new Date();
          state.listArr = [];
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 补全字段的请求
  completionPOST({ commit, state }, params) {
    axios({
      url: `${state.url}/app/acquires/completion`,
      method: 'POST',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          state.isGet = new Date();
          state.listArr = [];
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 补全全部字段的请求
  completionAllPOST({ commit, state }, params) {
    axios({
      url: `${state.url}/app/acquires/allCompletion`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.result.data;
          state.listTotal = response.data.result.total;
          state.listArr = [];
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 合包功能的请求
  copperPOST({ commit, state }, params) {
    axios({
      url: `${state.url}/app/acquires/copper`,
      method: 'POST',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          params.callback();
          if (response.data.code === 200) {
            state.isGet = new Date();
            state.listArr = [];
            Notice.success({
              title: '提示',
              desc: '合包成功',
            });
          } else if (response.data.code === 402) {
            Notice.error({
              title: '提示',
              desc: '合包异常',
            });
          } else if (response.data.code === 430) {
            Notice.error({
              title: '提示',
              desc: ' 机器学习合包失败',
            });
          } else if (response.data.code === 428) {
            Notice.error({
              title: '提示',
              desc: '模型训练中',
            });
          }
        }
      });
  },
  // 全部合包功能的请求
  copperAllPOST({ commit, state }, params) {
    axios({
      url: `${state.url}/app/acquires/allCopper`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.result.data;
          state.listTotal = response.data.result.total;
          state.listArr = [];
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 回填app质检的拼音
  getNameSpell({ commit, state }, params) {
    axios({
      url: `${state.url}/app/metaInfos/getNameSpell`,
      method: 'GET',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          state.editAppInfo.standardNameSpell = response.data.result;
        }
      });
  },
  // 获取所有标签体系
  getTagSystems({ commit, state }, params) {
    if (params === undefined) {
      params = {};
    }
    params.page = state.currentPage;
    params.pageSize = state.pageSize;
    const p = params;
    axios({
      url: `${state.url}/app/businessTypes/rows`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          // 将加载中的效果去除
        //  state.spinShow = false;
        }
      });
  },

  // 删除分类标签
  deleteTags({ dispatch, state }, p) {
    axios({
      url: `${state.url}/app/batchDelete/${p}`,
      method: 'DELETE',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
          //  dispatch('getTagSystems');
            Message.success('删除成功');
            dispatch('selectTags');
          }
          // state.listContent = response.data.data;
          // state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },

  // 删除体系
  deleteTypeTags({ dispatch, state }, p) {
    axios({
      url: `${state.url}/app/businessTypes/batchdelete/${p}`,
      method: 'DELETE',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('删除成功');
            dispatch('getTagSystems');
          }
          // state.listContent = response.data.data;
          // state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },

  // 查询标签
  selectTags({ state }, params) {
    if (params === undefined) {
      params = {};
    }
    params.busId = state.tags[1].id;
    params.page = state.currentPage;
  //  params.page = 1;
    params.pageSize = state.pageSize;
    if (state.tags.length === 3) {
      params.level = 1;
      params.parentCode = null;
    } else {
      params.level = null;
      params.parentCode = state.tags[state.tags.length - 2].code;
    }

    if (state.configName === '1') {
      params.busId = state.jwoodTags[1].id;
      if (state.jwoodTags.length === 3) {
        params.level = 1;
        params.parentCode = null;
      } else {
        params.level = null;
        params.parentCode = state.jwoodTags[state.jwoodTags.length - 2].code;
      }
    }
    const p = params;
    axios({
      url: `${state.url}/app/tagDics/rows`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },
  // 修改体系状态
  changeSystemState({ commit, state }, params) {
    axios({
      url: `${state.url}/app/businessTypes/updataStatus`,
      method: 'PUT',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // 将加载中的效果去除
          state.spinShow = false;
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 修改体系设备标签
  changeSystemModelStatus({ commit, state }, params) {
    axios({
      url: `${state.url}/app/businessTypes/updateModelStatus`,
      method: 'PUT',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // 将加载中的效果去除
          state.spinShow = false;
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 修改标签设备标签
  changeTagModelStatus({ commit, state }, params) {
    axios({
      url: `${state.url}/app/tagDics/updataModelStatus`,
      method: 'PUT',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // 将加载中的效果去除
          state.spinShow = false;
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 修改标签状态
  changeTagState({ commit, state }, params) {
    console.log(1111);
    axios({
      url: `${state.url}/app/tagDics/updataStatus`,
      method: 'PUT',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // 将加载中的效果去除
          state.spinShow = false;
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 修改体系数据
  changeSystemInfo({ commit, state }, params) {
    axios({
      url: `${state.url}/app/businessTypes/updataInfo`,
      method: 'PUT',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          if (response.data.failed === 'name') {
            params.nameError();
          } else if (response.data.failed === 'code') {
            params.codeError();
          } else {
            params.callback();
          }
        }
      });
  },
  // 修改标签数据
  changeTagInfoAction({ commit, state }, params) {
    axios({
      url: `${state.url}/app/tagDics/updataInfo`,
      method: 'PUT',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          if (response.data.failed === 'name') {
            params.nameError();
          } else if (response.data.failed === 'code') {
            params.codeError();
          } else {
            params.callback();
          }
        }
      });
  },
  // 新增体系数据
  addSystemInfo({ commit, state }, params) {
    axios({
      url: `${state.url}/app/businessTypes/createInfo`,
      method: 'POST',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // 将加载中的效果去除
          state.spinShow = false;
          if (response.data.data === undefined) {
            if (response.data.failed === 'name') {
              params.nameError();
            } else if (response.data.failed === 'code') {
              params.codeError();
            }
          } else {
            state.listContent = response.data.data;
            state.listTotal = response.data.total;
            if (params.callback !== undefined) {
              params.callback();
            }
          }
        }
      });
  },
  // 新增标签数据
  addTagInfo({ commit, state }, params) {
    axios({
      url: `${state.url}/app/tagDics/createInfo`,
      method: 'POST',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // 将加载中的效果去除
          state.spinShow = false;
          if (response.data.data === undefined) {
            if (response.data.failed === 'name') {
              params.nameError();
            } else if (response.data.failed === 'code') {
              params.codeError();
            }
          } else {
            state.listContent = response.data.data;
            state.listTotal = response.data.total;
            if (params.callback !== undefined) {
              params.callback();
            }
          }
        }
      });
  },
  // 审核保存请求AppsPost
  saveAppsPost({ commit, state }, params) {
    axios({
      url: `${state.url}/app/metaInfos/toExamineNew`,
      method: 'PUT',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          state.isGet = new Date();
          state.listArr = [];
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 包质检审核请求
  AppsPost({ commit, state }, params) {
    axios({
      url: `${state.url}/app/compleInfos/pkgToExamine`,
      method: 'PUT',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          state.isGet = new Date();
          state.listArr = [];
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },

  // 字段补全获取详情的请求
  getAppDetails({ commit, state }, params) {
    state.spinShow = true;
    axios({
      url: `${state.url}/app/compleInfos/queryDetail`,
      method: 'GET',
      dataType: 'JSON',
      params: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // 将加载中的效果去除
          state.spinShow = false;
          state.metaDetails = response.data.data;
        }
      });
  },

  // 获取是否正在机器学习的状态
  modelStatus({ commit, state }, p) {
    axios({
      url: `${state.url}/app/compleInfos/modelStatus`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          p.callback(response);
        }
      });
  },
  // 编辑组件的请求标签的方法
  getEditTags({ commit, state }, params) {
    if (params.data === undefined) {
      params.data = {
        parentCode: '',
      };
    }
    if (params.data.parentCode === undefined) {
      params.data.parentCode = '';
    }
    axios({
      url: `${state.url}/app/tagDics/findHierarchyTag`,
      method: 'GET',
      dataType: 'JSON',
      params: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          if (params.callback !== undefined) {
            params.callback(response);
          }
        }
      });
  },
  // 编辑组件的请求标签的方法
  getEditTagsFirst({ commit, state }, params) {
    axios({
      url: `${state.url}/app/businessTypes/findFirstTagsToShow`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        showType: params.data,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (params.callback !== undefined) {
            params.callback(response);
          }
        }
      });
  },
  // 编辑组件的请求标签全部数据源的方法
  getEditTagsAll({ state }, params) {
    axios({
      url: `${state.url}/app/tagDics/tagInfos`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (params.callback !== 'undefined') {
            params.callback(response);
          }
        }
      });
  },

  // 人工作业编辑界面的确定请求
  changeTagsPut({ commit, state }, params) {
    if (state.editAppInfo.pkgDetails === null) {
      state.editAppInfo.pkgDetails = [];
    }
    state.editAppInfo.pkgDetails.forEach((item) => {
      state.editAppInfo.newTagIds.push(item.tagId);
    });
    state.editAppInfo.userId = JSON.parse(state.userInfo).userId;
    state.editAppInfo.view = state.stepVal + 1;
    axios({
      url: `${state.url}/app/compleInfos/updateCompleInfo`,
      method: 'PUT',
      dataType: 'JSON',
      data: state.editAppInfo,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            if (params.callback !== undefined) {
              params.callback();
            }
            if (params.get !== undefined) {
              params.get();
            }
          } else if (response.data.code === 402) {
            if (params.get !== undefined) {
              params.get();
            }
          }
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          // if (params.callback !== undefined) {
          //   params.callback();
          // }
        }
      });
  },
  // 编辑组件获取所以体系
  getEditSystems({ commit, state }, params) {
    axios({
      url: `${state.url}/app/businessTypes/rows`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        status: 1,
        showType: params.data,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (params.callback !== undefined) {
            params.callback(response);
          //  console.log(666);
          }
        }
      });
  },
  // 质检上线编辑界面的确定请求
  changeSystemPut({ commit, state }, params) {
    state.editAppInfo.pkgDetails.forEach((item) => {
      state.editAppInfo.newTagIds.push(item.tagId);
      if (item.sourceId === 3) {
        state.editAppInfo.newBaseTagIds.push(item.tagId);
      }
    });
    state.editAppInfo.userId = JSON.parse(state.userInfo).userId;
    state.editAppInfo.view = state.stepVal + 1;
    axios({
      url: `${state.url}/app/metaInfos/updataMetaInfo`,
      method: 'PUT',
      dataType: 'JSON',
      data: state.editAppInfo,
    })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          if (response.data.code === 200) {
            if (params.callback !== undefined) {
              params.callback();
            }
            if (params.get !== undefined) {
              params.get();
            }
          } else if (response.data.code === 402) {
            Notice.error({
              title: '提示',
              desc: '修改失败',
            });
            if (params.get !== undefined) {
              params.get();
            }
          }
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          // if (params.callback !== undefined) {
          //   params.callback();
          // }
        } else if (response.code === 402) {
          console.log(402);
        }
      });
  },
  // 成果查询组件获取所有数据
  getResultData({ commit, state }, params) {
    const s = state;
    if (params === undefined) {
      params = {};
    }
    const p = params;
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    s.spinShow = true;
    p.orderBy = state.sortObj.orderBy;
    p.sortBy = state.sortObj.sortBy;
    if (p.orderBy === 'updateTime') {
      p.orderBy = 'metaId';
    }
    axios({
      url: `${state.url}/app/appResultDatas/rows`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    }).then((response) => {
      if (response.status === 200) {
        s.listContent = response.data.data;
        s.listTotal = response.data.total;
        s.spinShow = false;
        if (params.callback !== undefined) {
          params.callback();
        }
      }
    });
  },
  // 质检上线获取详情的请求
  getAppDetailsFinaly({ commit, state }, params) {
    state.spinShow = true;
    axios({
      url: `${state.url}/app/metaInfos/queryDetail`,
      method: 'POST',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          // 将加载中的效果去除
          state.spinShow = false;
          state.metaDetails = response.data.data;
        }
      });
  },
  // 获取所有标签关系
  getRelationTags({ commit, state }, params) {
    if (params === undefined) {
      params = {};
    }
    if (state.tags.length === 2) {
      params.level = 1;
    } else {
      params.level = null;
      params.parentCode = state.tags[state.tags.length - 2].code;
    }
    params.page = state.currentPage;
    params.pageSize = state.pageSize;
    const p = params;
    axios({
      url: `${state.url}/app/tagDics/findRelationTags`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },
  // 标签关系编辑界面的确定请求
  changeTagRelationPut({ commit, state }, params) {
    if (state.editAppInfo.tagDetails === null) {
      state.editAppInfo.tagDetails = [];
    }
    state.editAppInfo.tagDetails.forEach((item) => {
      state.editAppInfo.newTagIds.push(item.tagId);
    });
    axios({
      url: `${state.url}/app/tagDics/updateTagRelation`,
      method: 'PUT',
      dataType: 'JSON',
      data: state.editAppInfo,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.result.data;
          state.listTotal = response.data.result.total;
          state.isGet = new Date();
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 编辑界面的搜索
  editSearchTags({ commit, state }, params) {
    axios({
      url: `${state.url}/app/tagDics/blurSearchTags`,
      method: 'GET',
      dataType: 'JSON',
      // data: state.editAppInfo,
    })
      .then((response) => {
        if (response.status === 200) {
          if (params.callback !== undefined) {
            params.callback();
          }
        }
      });
  },
  // 用户管理界面获取用户
  getUsers({ commit, state }, p) {
    state.spinShow = true;
    if (p === undefined) {
      p = state.filterObj;
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    p.orderBy = 'status';
    p.sortBy = false;
    // p.status = 1;
    axios({
      url: `${state.url}/userInfos/rows`,
      // url: 'http://172.28.6.158:8080/userInfos/rows',
      method: 'GET',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },
  // 用户管理界面修改用户
  changeUser({ commit, state }, params) {
    axios({
      url: `${state.url}/userInfos`,
      // url: 'http://172.28.6.158:8080/userInfos',
      method: 'PUT',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          state.spinShow = false;
          params.callback();
        }
      });
  },
  // 质检上线同步hash的请求
  saveHashTagRel({ dispatch, commit, state }, p) {
    axios({
      url: `${state.url}/app/metaInfos/saveHashTagRel`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        jobId: 1,
      },
    })
      .then((response) => {
        state.disabledBtn = [];
        if (response.data.subStatus === 1) {
          p.success();
          dispatch('getHashTagRel');
        } else if (response.data.subStatus === 0) {
          p.error();
        }
      });
  },
  // 质检上线获取同步hash的请求的结果
  getHashTagRel({ dispatch, commit, state }, p) {
    if (p === undefined) {
      p = {};
    }
    p.jobId = 1;
    axios({
      url: `${state.url}/app/tasks/getStatus`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.status === 1) {
            // 任务待执行的状态
            // state.loadingHashTagRel = '';
          } else if (response.data.status === 2) {
            // 任务待执行中的状态
            setTimeout(() => {
              dispatch('getHashTagRel');
            }, 1000);
          } else if (response.data.status === 3) {
            // 任务执行成功的状态
            state.hashTagRelResult = '成功';
            state.hashTagRelResultTime = response.data.time;
            // state.loadingHashTagRel = '';
          } else if (response.data.status === 4) {
            // 任务执行失败的状态
            state.hashTagRelResult = '失败';
            state.hashTagRelResultTime = response.data.time;
          }
        }
      });
  },
  // 用户管理查询角色的请求
  getUserManageRoles({ state }, p) {
    axios({
      url: `${state.url}/roles/rows`,
      method: 'GET',
      dataType: 'JSON',
      params: p.data,
    })
      .then((response) => {
        // state.allRoles = response.data.data;
        state.allRoles = [];
        response.data.data.forEach((item) => {
          const temp = {
            label: item.name,
            value: item.id,
          };
          state.allRoles.push(temp);
        });
        p.callback();
      });
  },
  // 用户管理查询角色的请求
  changeUserRoles({ dispatch, state }, p) {
    axios({
      url: `${state.url}/userInfo/updateRole`,
      method: 'PUT',
      dataType: 'JSON',
      data: p,
    })
      .then((response) => {
        if (response.data.code === 200) {
          dispatch('getUsers');
        } else if (response.data.code === 402) {
          Message.error('修改失败');
        }
      });
  },
  // 用户管理界面获取角色
  getRoles({ commit, state }, p) {
    state.spinShow = true;
    if (p === undefined) {
      p = state.filterObj;
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    p.orderBy = 'status';
    p.sortBy = false;
    // p.status = 1;
    axios({
      url: `${state.url}/roles/rows`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },
  // 角色管理获取角色权限详情
  getPowers({ state }) {
    axios({
      url: `${state.url}/powers/formatShow`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        roleId: state.RoleInfo.id,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data.data);
          state.showJurisdictionInfo = response.data;
          const temp = Object.values(response.data.data);
          temp.forEach((item) => {
            if (item[0].selected > 0) {
              item[0].selected = true;
            }
            if (item[2] !== undefined && item[2].selected > 0) {
              item[2].selected = true;
            }
          });
        }
      });
  },
  // 修改角色权限详情
  changePowers({ dispatch, state }) {
    // 对权限详情数据进行遍历找出所有选择的id
    const val1 = Object.values(state.showJurisdictionInfo.data);
    const tempPowerIds = [];
    val1.forEach((item) => {
      const val2 = Object.values(item);
      val2.forEach((item1) => {
        if (item1.selected > 0 || item1.selected) {
          if (item1.data.length > 1) {
            tempPowerIds.push(item1.selected);
          } else {
            tempPowerIds.push(item1.data[0].id);
          }
        }
      });
    });
    const p = {
      powerIds: state.showJurisdictionInfo.powerIds,
      newPowerIds: tempPowerIds,
    };
    const temp = {};
    if (state.RoleInfo.name !== undefined) {
      p.roleId = state.RoleInfo.id;
      p.name = state.RoleInfo.name;
      temp.url = `${state.url}/roles/updateRole`;
      temp.method = 'PUT';
    } else {
      p.name = state.addRoleName;
      temp.url = `${state.url}/roles/addRole`;
      temp.method = 'POST';
    }
    axios({
      url: temp.url,
      method: temp.method,
      dataType: 'JSON',
      data: p,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 'SUCCESS') {
            Message.success('修改成功');
            state.showJurisdiction = false;
            dispatch('getRoles');
          } else if (response.data.code === 'FAILED') {
            Message.error('修改失败');
          }
        }
      });
  },
  // 角色管理删除角色
  delRole({ dispatch, state }, p) {
    axios({
      url: `${state.url}/roles/deleteRole/${p.id}`,
      method: 'DELETE',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('删除成功');
            dispatch('getRoles');
          } else if (response.data.code === 420) {
            Message.error('删除失败，此角色已有用户使用，无法删除');
          }
        }
      });
  },
  // 任务分发时获取所有作业人员
  getManualUser({ dispatch, state }, p) {
    axios({
      url: `${state.url}/app/compleInfos/basicDataLoad`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        view: p.view,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (state.stepVal === 2 || state.stepVal === 3) {
            p.callback(response.data.groupTree);
          }
          const temp = [];
          response.data.applyUsers.forEach((item) => {
            temp.push({
              label: item.displayName,
              value: item.userId,
            });
          });
          state.allManageUsers = temp;
          if (response.data.operators) {
            const temp2 = [];
            response.data.operators.forEach((item) => {
              temp2.push({
                label: item.displayName,
                value: item.userId,
              });
            });
            state.operatorUsers = temp2;
          }
        }
      });
  },

  // 任务分发的确定请求
  taskDistribute({ dispatch, state }, p) {
    p.view = state.stepVal + 1;
    if (state.stepVal === 5) {
      p.view = state.stepVal;
    } else if (state.stepVal === 3) {
      p.view = 7;
    } else {
      p.view = state.stepVal + 1;
    }
    axios({
      url: `${state.url}/app/compleInfos/taskDistribute`,
      method: 'POST',
      dataType: 'JSON',
      data: p,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('任务分发成功');
          } else if (response.data.code === 402) {
            Message.error('任务分发失败');
          } else if (response.data.code === 421) {
            Message.error('没有可分发的数据');
          }
        }
      });
  },
  // 任务申领时获取今日作业的条数
  getApplyDataNum({ state }, p) {
    // const p = {};
    // if (state.stepVal === 5) {
    //   p.view = state.stepVal;
    // } else if (state.stepVal === 3) {
    //   p.view = 7;
    // } else {
    //   p.view = state.stepVal + 1;
    // }
    // p.userId = JSON.parse(state.userInfo).userId;
    axios({
      url: `${state.url}/app/compleInfos/basicDataLoadToSelf`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        view: p.view,
        userId: p.userId,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          p.callback(response.data.groupTree);
          state.userMissionCount = response.data.count;
          console.log(response.data);
          if (response.data.operators) {
            const temp2 = [];
            response.data.operators.forEach((item) => {
              temp2.push({
                label: item.displayName,
                value: item.userId,
              });
            });
            state.operatorUsers = temp2;
          }
        }
      });
  },
  // 任务申领时的确定请求
  taskApply({ dispatch, state }, p) {
    if (state.stepVal === 5) {
      p.view = state.stepVal;
    } else if (state.stepVal === 3) {
      p.view = 7;
    } else {
      p.view = state.stepVal + 1;
    }
    p.userId = JSON.parse(state.userInfo).userId;
    axios({
      url: `${state.url}/app/compleInfos/taskApply`,
      method: 'POST',
      dataType: 'JSON',
      data: p,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('任务申领成功');
            dispatch('getAPPs');
          } else if (response.data.code === 402) {
            Message.error('任务申领失败');
          } else if (response.data.code === 421) {
            Message.error(' 没有可申领的数据');
          }
        }
      });
  },
  // 任务申领时获取今日作业的条数
  syncAllUsers({ dispatch, state }) {
    axios({
      url: `${state.url}/userInfo/sync`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('同步成功');
            dispatch('getUsers');
          } else if (response.data.code === 402) {
            Message.error('同步失败');
          }
        }
      });
  },

  // 数据合包metaId查询数据详情
  getMetaIdDetails({ state }, p) {
    state.spinShow = true;
    const d = parseInt(p.data.metaId, 10);
    axios({
      url: `${state.url}/app/compleInfos/updateMetaidDetail`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        metaId: d,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (state.dataDetails) {
            state.dataDetails.splice(0, 1, response.data.metaInfo);
          } else {
            state.dataDetails.push(response.data.metaInfo);
          }
          state.metaDetails = response.data.compleInfo;
          state.spinShow = false;
        }
      });
  },
  //  数据合包metaId详情编辑页搜索
  getMetaIdDetailsSearch({ state, commit }, params) {
    state.isLoading = true;
    axios({
      url: `${state.url}/app/metaInfos/findNormalAppDetail`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        keyword: params.p,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          params.callback(response);
          state.isLoading = false;
        }
      });
  },
  // getMetaIdDetailsSearch({ state, commit }, p) {
  //   state.isLoading = true;
  //   axios({
  //     url: `${state.url}/app/metaInfos/findMetaIdAndName`,
  //     method: 'GET',
  //     dataType: 'JSON',
  //     params: {
  //       name: p.query,
  //     },
  //   })
  //     .then((response) => {
  //       if (response.status === 200) {
  //         p.callback(response);
  //         state.isLoading = false;
  //       }
  //     });
  // },
  //  数据合包metaId详情编辑确定
  getMetaIdDetailsConfirm({ dispatch, state }, p) {
    state.spinShow = true;
    p.userId = JSON.parse(state.userInfo).userId;
    axios({
      url: `${state.url}/app/compleInfos/updateMetaID`,
      method: 'PUT',
      dataType: 'JSON',
      data: p,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('同步成功');
            dispatch('getMetaIdDetails', state.editData);
          } else if (response.data.code === 402) {
            Message.error('同步失败');
            dispatch('getMetaIdDetails', state.editData);
          }
      //    state.detailsSearch = response.data.data;
          // state.dataDetails.push(response.data.metaInfo);
          // state.metaDetails = response.data.compleInfo;
          // state.spinShow = false;
        }
      });
  },
  //  数据合包metaId详情编辑新增metaId
  getMetaIdDetailsAdd({ dispatch, state }, p) {
    state.spinShow = true;
    p.userId = JSON.parse(state.userInfo).userId;
    axios({
      url: `${state.url}/app/metaInfos/addMetaIdByManual`,
      method: 'POST',
      dataType: 'JSON',
      data: p,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('同步成功');
          } else if (response.data.code === 402) {
            Message.error('同步失败');
          }
      //    state.detailsSearch = response.data.data;
          // state.dataDetails.push(response.data.metaInfo);
          // state.metaDetails = response.data.compleInfo;
          // state.spinShow = false;
        }
      });
  },

  // 获取树的数据列表
  getList({ state }, p) {
    axios({
      url: `${state.url}/app/dataGroups/searchGroup`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          p.callback(response.data);
        }
      });
  },

  //  增加节点
  appendNode({ dispatch, state }, p) {
    axios({
      url: `${state.url}/app/dataGroups/saveNewGroup`,
      method: 'POST',
      dataType: 'JSON',
      data: {
        name: p.name,
        level: p.level,
        parentId: p.parentId,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 422) {
            Message.error('文件名重复');
            dispatch('getList', p);
          } else if (response.data.code === 200) {
            dispatch('getList', p);
          }
        }
      });
  },

  //  预处理更新数据
  updateNode({ dispatch, state }, p) {
    axios({
      url: `${state.url}/app/dataGroups/updateGroup`,
      method: 'PUT',
      dataType: 'JSON',
      data: {
        name: p.name,
        id: p.id,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 422) {
            Message.error('文件名重复');
          } else if (response.data.code === 200) {
            dispatch('getList', p);
          }
        }
      });
  },

  // 预处理删除数据

  deleteNode({ dispatch, state }, p) {
    const id = p.id;
    // console.log(id);
    axios({
      url: `${state.url}/app/dataGroups/deleteGroup/${id}`,
      method: 'DELETE',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 422) {
            Message.error('文件名重复');
          } else if (response.data.code === 200) {
            dispatch('getList', p);
          }
        }
      });
  },

  //  成果数据发布版本
  releaseVersion({ state }) {
    axios({
      url: `${state.url}/app/metaInfos/syncMiData`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success({
              content: '发版成功',
              duration: 10,
              closable: true,
            });
          }
          if (response.data.code === 402) {
            Message.error({
              content: '发版失败',
              duration: 10,
              closable: true,
            });
          }
          if (response.data.code === 427) {
            Message.warning('正在发版中,请稍候');
          }
        }
      });
  },

  //  机器学习训练
  callTrain({ state }) {
    axios({
      url: `${state.url}/app/metaInfos/callTrain`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success({
              content: '调用训练脚本成功',
              duration: 10,
              closable: true,
            });
          }
          if (response.data.code === 402) {
            Message.error({
              content: '调用训练脚本失败',
              duration: 10,
              closable: true,
            });
          }
        }
      });
  },

  //  获取是否关闭按钮状态
  witchStatus({ state }) {
    axios({
      url: `${state.url}/app/compleInfos/witchStatus`,
      method: 'GET',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.status === 1) {
            state.switch1 = true;
          } else {
            state.switch1 = false;
          }
        }
      });
  },

//  关闭机器学习合包接口
  operateWitch({ state }, p) {
    axios({
      url: `${state.url}/app/compleInfos/operateWitch`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        isNotOpen: p.number,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          p.callback();
          if (response.data.code === 200) {
            Notice.success({
              title: '提示',
              desc: '修改成功',
            });
          }
          if (response.data.code === 402) {
            Notice.success({
              title: '提示',
              desc: '修改失败',
            });
          }
        }
      });
  },

  // 预测详情
  forecastDetails({ state }, p) {
    console.log(p.data);
    axios({
      url: `${state.url}/app/compleInfos/forecastDetails`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        pkgId: p.data.id,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          state.metaDetails = response.data.mergedata;
          state.imgUrls = response.data.urldata;
        }
      });
  },

  //  历史数据metaid查询
  appResultHistories({ state }, p) {
    state.spinShow = true;
    if (p === undefined) {
      p = {};
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    p.orderBy = 'status';
    p.sortBy = false;
    axios({
      url: `${state.url}/app/appResultHistories/rows`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          Message.success('查询成功');
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },

  //  历史数据包名查询
  mergeHistories({ state }, p) {
    state.spinShow = true;
    if (p === undefined) {
      p = {};
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    p.orderBy = 'status';
    p.sortBy = false;
    axios({
      url: `${state.url}/app/mergeHistories/rows`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          Message.success('查询成功');
          console.log(response.data);
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },
  //  sdk调用
  callSdkToApk({ state }) {
    axios({
      url: `${state.url}/outer/callSdkToApk`,
      method: 'POST',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          Message.success('任务提交成功');
        }
      });
  },

   //  地理信息页面API

   //  获取进度列表
  getProgressList({ state }) {
    const p = {};
    p.pageSize = state.pageSize;
    p.page = state.currentPage;
    p.status = 'all';
    axios({
      url: `${state.url}/dmap/areaTasks/rows`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listTotal = response.data.total;
          state.progresListInfo = response.data.data;
        }
      });
  },

  //  改变状态
  changeLocationState({ state }, p) {
    axios({
      url: `${state.url}/dmap/areaTasks/submitJob`,
      method: 'get',
      dataType: 'JSON',
      params: {
        jobId: p.jobId,
        status: p.status,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            p.callback();
          } else if (response.data.code === 402) {
            Message.error('任务提交失败');
          }
        }
      });
  },

  //  获取省市县
  getLocationInfo({ state }) {
    axios({
      url: `${state.url}/dmap/areaTasks/getAreaDis`,
      method: 'get',
      dataType: 'JSON',
      params: {
        level: 1,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          response.data.data.forEach((item, index, arr) => {
            arr[index] = {
              value: item.code,
              label: item.name,
            };
          });
          response.data.data.push({ label: '请选择', value: 'n' });
          state.levelList1 = response.data.data;
        }
      });
  },

  // 添加任务
  createJob({ state }, p) {
    axios({
      url: `${state.url}/dmap/areaTasks/createJob`,
      method: 'put',
      dataType: 'JSON',
      data: p,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('任务提交成功');
          }
          if (response.data.code === 402) {
            Message.error('任务提交失败');
          }
        }
      });
  },


  //  积木  源数据查询
  jwoodResult({ state }, p) {
    state.spinShow = true;
    if (p === undefined) {
      p = state.filterObj;
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    p.orderBy = 'status';
    p.sortBy = false;
    axios({
      url: `${state.url}/jwood/appResult`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          state.listContent = response.data;
          state.listContentStr = JSON.stringify(response.data);
          state.listTotal = response.data.total;
          state.spinShow = false;
        }
      });
  },

  //   标签查询
  jmTags({ commit, state, dispatch }, params) {
    state.spinShow = true;
    if (params === undefined) {
      params = {};
    }
    params.tid = state.jwoodTags[1].id;
    if (state.jwoodTags.length > 3) {
      params.parentcode = state.jwoodTags[state.jwoodTags.length - 2].code;
    } else {
      params.parentcode = null;
      params.level = 1;
    }
    params.page = state.currentPage;
  //  params.page = 1;
    params.pageSize = state.pageSize;

    axios({
      url: `${state.url}/jwood/jmTags/rows`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
          state.spinShow = false;
        }
      });
  },

  //  体系查询
  tdTagResult({ state, dispatch }, p) {
    state.spinShow = true;
    if (p === undefined) {
      p = state.filterObj;
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    p.orderBy = 'status';
    p.sortBy = false;
    axios({
      url: `${state.url}/jwood/jmSystemInfos/rows`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          response.data.data.forEach((item) => {
            item.value = item.id;
            item.label = item.name;
            item.title = item.name;
          });
          state.listContent = response.data.data;
          state.systemData = response.data.data;
          // state.systemData[0].selected = true;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
          state.spinShow = false;
        }
      });
  },

  tdTagResult2({ state, dispatch }, p) {
    if (p === undefined) {
      p = state.filterObj;
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    p.orderBy = 'status';
    p.sortBy = false;
    axios({
      url: `${state.url}/jwood/jmSystemInfos/rows`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          response.data.data.forEach((item) => {
            item.value = item.id;
            item.label = item.name;
            item.title = item.name;
          });
          state.systemData = response.data.data;
        }
      });
  },

  //  映射体系查询
  jmMapperRelationsResult({ state }, p) {
    state.spinShow = true;
    if (p === undefined) {
      p = state.filterObj;
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    p.orderBy = 'status';
    p.sortBy = false;
    axios({
      url: `${state.url}/jwood/jmMapperRelations/rows`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          response.data.data.forEach((item) => {
            item.label = item.mapppingName;
            item.value = item.id;
          });
          state.listContent = response.data.data;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
          state.mapperData = response.data.data;
          state.spinShow = false;
        }
      });
  },
  jmMapperRelationsResult2({ state }, p) {
    if (p === undefined) {
      p = state.filterObj;
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    p.orderBy = 'status';
    p.sortBy = false;
    axios({
      url: `${state.url}/jwood/jmMapperRelations/rows`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          response.data.data.forEach((item) => {
            item.label = item.mapppingName;
            item.value = item.id;
          });
          state.mapperData = response.data.data;
        }
      });
  },


  //  映射详情查询
  mapperImpl({ commit, state, dispatch }, params) {
    state.spinShow = true;
    if (params === undefined) {
      params = {};
    }
  //  params.busId = state.tags[1].id;
    params.page = state.currentPage;
  //  params.page = 1;
    params.pageSize = state.pageSize;
  //  params.tdtypeId = state.tdtypeData.tdtypeId;
  //  params.mapperId = state.tdtypeData.mapperId;
    console.log(state.jwoodTags[state.jwoodTags.length - 2]);
    params.groupId = state.jwoodTags[state.jwoodTags.length - 2].id;
    // if (this.jwoodTags.length !== 2) {
    //   params.groupId = state.jwoodTags[state.jwoodTags.length - 2].id;
    // }
    axios({
      url: `${state.url}/jwood/mapperImpl`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
          state.spinShow = false;
        }
      });
  },

   // 新增体系
  jwoodAdd({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmSystemInfos`,
      method: 'POST',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('tdTagResult');
        }
      });
  },

   // 新增映射体系
  jwoodMapperAdd({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmMapperRelations`,
      method: 'POST',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data === false) {
            Message.error('映射体系已存在');
          } else {
            dispatch('jmMapperRelationsResult');
          }
        }
      });
  },

  //  新增映射详情
  jmMapperImplsAdd({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmMapperImpls`,
      method: 'POST',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('mapperImpl');
        }
      });
  },
  //  标签增加
  jwoodjmTagsAdd({ commit, state, dispatch }, params) {
  //  console.log(params);
    axios({
      url: `${state.url}/jwood/jmTags`,
      method: 'post',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 805) {
            Notice.error({
              title: '添加失败',
              desc: 'code不能为空',
            });
          } else if (response.data.code === 809) {
            Notice.error({
              title: '添加失败',
              desc: '标签id重复',
            });
          } else if (response.data.code === 807) {
            Notice.error({
              title: '添加失败',
              desc: 'sid不能为空',
            });
          } else {
            dispatch('jmTags');
          }
        }
      });
  },

  // 体系删除
  jwoodRemove({ commit, state, dispatch }, id) {
    axios({
      url: `${state.url}/jwood/jmSystemInfos/${id}`,
      method: 'DELETE',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('删除成功');
            dispatch('tdTagResult');
          } else if (response.data.code === 703) {
            Message.error('删除失败');
          }
        }
      });
  },

  //  映射体系删除
  jwoodMapperRemove({ commit, state, dispatch }, id) {
    axios({
      url: `${state.url}/jwood/jmMapperRelations/${id}`,
      method: 'DELETE',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('jmMapperRelationsResult');
        }
      });
  },

  // 标签删除
  jwoodjmTagsRemove({ commit, state, dispatch }, id) {
    axios({
      url: `${state.url}/jwood/jmTags`,
      method: 'DELETE',
      dataType: 'JSON',
      params: {
        ids: id,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            Message.success('删除成功');
            dispatch('jmTags');
          } else if (response.data.code === 703) {
            Message.error('删除标签下面有子标签');
          } else {
            Message.error('删除失败');
          }
        }
      });
  },

  // 映射详情删除
  mapperImplRemove({ commit, state, dispatch }, id) {
    axios({
      url: `${state.url}/jwood/jmMapperImpls`,
      method: 'DELETE',
      dataType: 'JSON',
      params: {
        ids: id,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('mapperImpl');
        }
      });
  },

    //  体系修改
  jwoodUpdate({ commit, state, dispatch }, params) {
    console.log(params);
    axios({
      url: `${state.url}/jwood/jmSystemInfos`,
      method: 'put',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('tdTagResult');
        }
      });
  },

  //  映射体系修改
  jwoodMapperUpdate({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmMapperRelations`,
      method: 'put',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('jmMapperRelationsResult');
        }
      });
  },


  // 标签修改
  jwoodjmTagsUpdate({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmTags`,
      method: 'put',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('jmTags');
        }
      });
  },

   // 映射详情修改
  jmMapperImplsUpdate({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmMapperImpls`,
      method: 'PUT',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('mapperImpl');
        }
      });
  },

  // 标签树
  mapperImplTree({ state }, params) {
    // state.spinShow = true;
    axios({
      url: `${state.url}/jwood/jmMapperImpls/tree`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          // state.spinShow = false;
          if (params.systemId === -1) {
            state.tdTypeTree = response.data.tagDicsTree;
            state.allData = response.data.tagDicsTree;
          } else {
            state.otherTree = response.data.jmTags;
            state.allData = response.data.jmTags;
          }
        }
      });
  },

  // 高级筛选
  // jmHighChoose({ commit, state, dispatch }, params) {
  //   //  console.log(params);
  //   axios({
  //     url: `${state.url}/jwood/jmHighChoose`,
  //     method: 'post',
  //     dataType: 'JSON',
  //     data: params,
  //   })
  //     .then((response) => {
  //       if (response.status === 200) {
  //         state.listContent = response.data;
  //         state.listContentStr = JSON.stringify(response.data);
  //         state.listTotal = response.data.length;
  //         state.spinShow = false;
  //       }
  //     });
  // },
  //  新增规则
  jmRules({ commit, state, dispatch }, params) {
    //  console.log(params);
    axios({
      url: `${state.url}/jwood/jmRules`,
      method: 'post',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('jmRulesList');
          // state.listContent = response.data;
          // state.listContentStr = JSON.stringify(response.data);
          // state.listTotal = response.data.length;
          // state.spinShow = false;
          // if (state.isShow) {
          //   const p = params.ruleArray;
          //   dispatch('jmHighChoose', p);
          // }
        }
      });
  },

  jmRulesUpdate({ commit, state, dispatch }, params) {
    //  console.log(params);
    axios({
      url: `${state.url}/jwood/jmRules`,
      method: 'put',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('jmRulesList');
          // state.listContent = response.data;
          // state.listContentStr = JSON.stringify(response.data);
          // state.listTotal = response.data.length;
          // state.spinShow = false;
          // if (state.isShow) {
          //   const p = params.ruleArray;
          //   dispatch('jmHighChoose', p);
          // }
        }
      });
  },


  // 规则列表
  jmRulesList({ commit, state, dispatch }, params) {
    state.spinShow = true;
    if (params === undefined) {
      params = {};
    }
  //  params.busId = state.tags[1].id;
    params.page = state.currentPage;
  //  params.page = 1;
    params.pageSize = state.pageSize;
    axios({
      url: `${state.url}/jwood/jmRules/rows`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
          state.spinShow = false;
          // if (state.isShow) {
          //   const p = params.ruleArray;
          //   dispatch('jmHighChoose', p);
          // }
        }
      });
  },

  // 删除规则列表

  jmRulesRemove({ dispatch, state }, p) {
    axios({
      url: `${state.url}/jwood/jmRules/${p}`,
      method: 'DELETE',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          Message.success('删除成功');
          dispatch('jmRulesList');
          // state.listContent = response.data.data;
          // state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },

  // 定制分类详情页
  jmMiddleDatasRuleed({ commit, state, dispatch }, params) {
    state.spinShow = true;
    if (params === undefined) {
      params = {};
    }
  //  params.busId = state.tags[1].id;
    params.id = state.systemId;
    params.page = state.currentPage;
  //  params.page = 1;
    params.pageSize = state.pageSize;
    axios({
      url: `${state.url}/jwood/jmMiddleDatasRuleed/${params.id}`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data;
          state.listContentStr = JSON.stringify(response.data);
          state.listTotal = response.data.length;
          state.spinShow = false;
          // if (state.isShow) {
          //   const p = params.ruleArray;
          //   dispatch('jmHighChoose', p);
          // }
        }
      });
  },

  //  执行规则
  jmImplement({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmMiddleDatasRuleed/reuleIds`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          if (state.listArr.length === 1) {
            state.watchName = '定制分类';
            state.systemId = state.listArr[0].id;
            state.currentPage = 1;
            console.log(state.listArr);
            dispatch('groupByMetaid', { ruleId: state.listArr[0].id });
            dispatch('mapperImplTree', { systemId: state.listArr[0].mapperSystemId });
          } else {
            Notice.success({
              title: '提示',
              desc: '执行成功',
            });
          }
        }
      });
  },

  //   查询规则数据
  groupByMetaid({ commit, state, dispatch }, params) {
    if (params === undefined) {
      params = state.filterParams;
    }
    state.spinShow = true;
    params.ruleId = state.systemId;
    params.page = state.currentPage;
    params.pageSize = state.pageSize;
    axios({
      url: `${state.url}/jwood/jmMiddleDatas/groupByMetaid`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          state.spinShow = false;
        }
      });
  },

  groupByMetaid2({ commit, state, dispatch }, params) {
    if (params === undefined) {
      params = state.filterParams;
    }
    params.ruleId = params.ruleId;
    params.page = state.currentPage;
    params.pageSize = state.pageSize;
    axios({
      url: `${state.url}/jwood/jmMiddleDatas/groupByMetaid`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
        }
      });
  },

  // // 查询规则数据
  // jmImplementData({ commit, state, dispatch }, params) {
  //   if (params === undefined) {
  //     params = {};
  //   }
  //   state.spinShow = true;
  //   params.ruleId = state.systemId;
  //   params.page = state.currentPage;
  //   params.pageSize = state.pageSize;
  //   axios({
  //     url: `${state.url}/jwood/jmMiddleDatas/rows`,
  //     method: 'get',
  //     dataType: 'JSON',
  //     params,
  //   })
  //     .then((response) => {
  //       if (response.status === 200) {
  //         console.log(response.data);
  //         state.listContent = response.data.data;
  //         state.listTotal = response.data.total;
  //         state.spinShow = false;
  //       }
  //     });
  // },

  // 规则列表 查询对应体系的规则
  jmTdTypeData({ commit, state, dispatch }, params) {
    state.spinShow = true;
    params.page = state.currentPage;
    params.pageSize = state.pageSize;
    axios({
      url: `${state.url}/jwood/jmRules/rows`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          state.listContent = response.data.data;
          state.listTotal = response.data.total;
          state.spinShow = false;
        }
      });
  },

  // 删除分类标签
  jmMiddleDatas({ dispatch, state }, p) {
    axios({
      url: `${state.url}/jwood/jmMiddleDatas`,
      method: 'DELETE',
      dataType: 'JSON',
      params: {
        ids: p,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          Message.success('删除成功');
          dispatch('groupByMetaid');
          // state.listContent = response.data.data;
          // state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },

  // 修改定制分类
  jmMiddleUpdate({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmMiddleDatas`,
      method: 'PUT',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          dispatch('groupByMetaid');
        }
      });
  },

  // 高级筛选查询列表
  jmHighChooseAndSave({ commit, state, dispatch }, params) {
    state.spinShow = true;
    params.page = state.currentPage;
    params.pageSize = state.pageSize;
    axios({
      url: `${state.url}/jwood/jmHighChooseAndSave`,
      method: 'POST',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(111);
          if (state.isShow) {
            console.log(222);
            console.log(response.data.total);
            dispatch('groupByMetaid2', { ruleId: response.data.total });
            state.spinShow = false;
            state.isShow = false;
          } else {
            state.listContent = response.data.data;
            state.listContentStr = JSON.stringify(response.data);
            state.listTotal = response.data.total;
            state.spinShow = false;
          }
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
        //  dispatch('');
        }
      });
  },

  // 黑白锁定名单列表
  blackList({ state }, p) {
    state.spinShow = true;
    if (p === undefined) {
      p = {};
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    axios({
      url: `${state.url}/jwood/jmFilters/rows`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          state.listContent = response.data.data;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
          state.spinShow = false;
        }
      });
  },

  //  新增黑白锁定  名单
  blackListAdd({ commit, state, dispatch }, params) {
    //  console.log(params);
    axios({
      url: `${state.url}/jwood/jmFilters`,
      method: 'post',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('blackList', { type: params.type });
        }
      });
  },

  // 所有体系树的集合
  tdTree({ state }, p) {
    state.spinShow = true;
    if (p === undefined) {
      p = {};
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    axios({
      url: `${state.url}/jwood/jmFilters/treeTags`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          const json = response.data;
          state.spinShow = false;
          const arr = [];
          Object.keys(json).forEach((item) => {
            arr.push({ name: item.split('_')[0], id: item.split('_')[1], children: [] });
          });
          Object.values(json).forEach((item, index) => {
            arr[index].children = item.jmTags;
          });
          state.allTreeData = arr;
        }
      });
  },

  // 删除黑白锁定清单
  blackListRemove({ dispatch, state }, p) {
    console.log(p);
    axios({
      url: `${state.url}/jwood/jmFilters`,
      method: 'DELETE',
      dataType: 'JSON',
      params: {
        ids: p,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          Message.success('删除成功');
          if (state.configName === '3') {
            dispatch('blackList', { type: 4 });
          } else if (state.configName === '4') {
            dispatch('blackList', { type: 5 });
          } else if (state.configName === '5') {
            dispatch('blackList', { type: 1 });
          }
          // state.listContent = response.data.data;
          // state.listTotal = response.data.total;
          // 将加载中的效果去除
          state.spinShow = false;
        }
      });
  },

  // 获取此条数据是否是黑白锁定名单
  blackListStatus({ state }, p) {
    state.spinShow = true;
    axios({
      url: `${state.url}/jwood/jmMiddleDatas/jmFilter`,
      method: 'get',
      dataType: 'JSON',
      params: p.data,
    })
      .then((response) => {
        if (response.status === 200) {
          state.spinShow = false;
          p.callback(response);
        }
      });
  },

  // 成果数据发布
  resultListAdd({ state }) {
    console.log(state.systemId);
    axios({
      url: `${state.url}/jwood/jmResultDatas/add`,
      method: 'get',
      dataType: 'JSON',
      params: {
        ruleId: state.systemId,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          Message.success('发布成功');
        }
      });
  },

  // 获取成果数据列表
  resultList({ state }, p) {
    if (p === undefined) {
      p = state.filterParams;
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    state.spinShow = true;
    axios({
      url: `${state.url}/jwood/jmResultDatas/rows`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          state.spinShow = false;
          state.listContent = response.data.data;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
        }
      });
  },

  //  全部定制分类
  allResultList({ state }, p) {
    if (p === undefined) {
      p = state.filterParams;
    }
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    state.spinShow = true;
    axios({
      url: `${state.url}/jwood/jmResultDatas/groupByMetaid`,
      method: 'get',
      dataType: 'JSON',
      params: p,
    })
      .then((response) => {
        if (response.status === 200) {
          state.spinShow = false;
          state.listContent = response.data.data;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
        }
      });
  },

  // 更改成果数据
  resultListUpdate({ commit, state, dispatch }, params) {
    state.spinShow = true;
    axios({
      url: `${state.url}/jwood/jmResultDatas`,
      method: 'PUT',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          state.spinShow = false;
          Message.success('修改成功');
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          dispatch('allResultList', { systemId: params.systemId });
        }
      });
  },

  // 自主加工列表查询
  jmAutoMakesList({ state }) {
    state.spinShow = true;
    const params = {};
    params.page = state.currentPage;
    params.pageSize = state.pageSize;
    axios({
      url: `${state.url}/jwood/jmAutoMakes/rows`,
      method: 'get',
      dataType: 'JSON',
      params,
    })
      .then((response) => {
        if (response.status === 200) {
          state.spinShow = false;
          state.listContent = response.data.data;
          state.listContentStr = JSON.stringify(response.data.data);
          state.listTotal = response.data.total;
        }
      });
  },

  // 自主加工删除
  jmAutoMakesRemove({ dispatch, state }, p) {
    axios({
      url: `${state.url}/jwood/jmAutoMakes`,
      method: 'DELETE',
      dataType: 'JSON',
      params: {
        ids: p,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          Message.success('删除成功');
          state.spinShow = false;
          dispatch('jmAutoMakesList');
        }
      });
  },

  // 自主加工
  jmAutoMakesUpdate({ commit, state, dispatch }, params) {
    state.spinShow = true;
    axios({
      url: `${state.url}/jwood/jmAutoMakes`,
      method: 'PUT',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          state.spinShow = false;
          Message.success('修改成功');
          // state.listContent = response.data.result.data;
          // state.listTotal = response.data.result.total;
          dispatch('jmAutoMakesList');
        }
      });
  },
  //  积木原始数据
  jwResultData({ commit, state }, params) {
    const s = state;
    if (params === undefined) {
      params = {};
    }
    const p = params;
    p.page = state.currentPage;
    p.pageSize = state.pageSize;
    s.spinShow = true;
    // p.orderBy = state.sortObj.orderBy;
    // p.sortBy = state.sortObj.sortBy;
    if (p.orderBy === 'updateTime') {
      p.orderBy = 'metaId';
    }
    axios({
      url: `${state.url}/app/appResultDatas/metaid`,
      method: 'GET',
      dataType: 'JSON',
      params: p,
    }).then((response) => {
      if (response.status === 200) {
        s.listContent = response.data.data;
        s.listTotal = response.data.total;
        s.spinShow = false;
        if (params.callback !== undefined) {
          params.callback();
        }
      }
    });
  },
  // 版本记录查询
  jmVersionRecords({ state }, val) {
    console.log(val);
    axios({
      url: `${state.url}/jwood/jmVersionRecords/rows`,
      method: 'GET',
      dataType: 'JSON',
      params: {
        systemId: val,
      },
    }).then((response) => {
      if (response.status === 200) {
        state.versionList = response.data.data;
      }
    });
  },

  //  版本记录增加
  jmVersionRecordsAdd({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmVersionRecords`,
      method: 'POST',
      dataType: 'JSON',
      data: params.data,
    })
      .then((response) => {
        if (response.status === 200) {
          params.callback(response);
          dispatch('jmVersionRecords', params.systemId);
          // dispatch('jmVersionRecords', params.systemId);
        }
      });
  },
  //  版本记录更改
  jmVersionRecordsUpdate({ commit, state, dispatch }, params) {
    axios({
      url: `${state.url}/jwood/jmVersionRecords`,
      method: 'put',
      dataType: 'JSON',
      data: params,
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('jmVersionRecords', params.systemId);
        }
      });
  },
  //  版本记录删除
  jmVersionRecordsRemove({ commit, state, dispatch }, p) {
    axios({
      url: `${state.url}/jwood/jmVersionRecords/${p.id}`,
      method: 'delete',
      dataType: 'JSON',
    })
      .then((response) => {
        if (response.status === 200) {
          dispatch('jmVersionRecords', p.systemId);
        }
      });
  },
};
