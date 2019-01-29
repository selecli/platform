import { Message } from 'iview';
import {
  changeSteps,
  changeUrl,
  changeState,
  changeName,
  changeConfigTags,
  changeShowConfig,
  changeCondition,
  dateTime,

} from './mutations-type';

export default {
  [changeSteps](state, val) {
    // 增加判断用户是否有该步骤的权限
    console.log(val);
    if (state.viewPower.indexOf(val + 1) !== -1) {
      if (val === 6) {
      //  state.spinShow = true;
        state.stepVal = 3;
      } else if (val === 3) {
        state.stepVal = 4;
      } else if (val === 4) {
        state.stepVal = 5;
      } else {
        state.stepVal = val;
      }
    } else {
      Message.error('对不起，您没有该页面的权限');
    }
  },
// 根据step的值改变请求的接口
  [changeUrl](state) {
    switch (state.stepVal) {
      case 0:
        state.lastUrl = '/acquires/rows';
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        state.lastUrl = '/compleInfos/rows';
        break;
      case 5:
        state.lastUrl = '/metaInfos/rows';
        break;
      default:
        break;
    }
  },
  [changeName](state, p) {
    state.configName = p;
  },
  [changeState](state) {
    state.showEditDetails = true;
  },
  [changeConfigTags](state, p) {
    state.jwoodTags = p;
  },
  [changeShowConfig](state, p) {
    state.showConfig = p;
  },
  [changeCondition](state, p) {
    state.condition = p;
  },
  [dateTime](state, p) {
    state.dateTime = p;
  },
  // [changeTdtypeData](state, p) {
  //   state.tdtypeData = p;
  // },
  // [changeMapperData](state, p) {
  //   state.mapperData = p;
  // },
  editDataMethods(state, p) {
    state.editData = { ...state.editData, data: p.data };
  },
  searchData(state, p) {
    state.detailsSearch = p;
  },
};
