import Cookies from 'js-cookie';
import Vue from 'vue';
import Vuex from 'vuex';
import mutations from './mutations';
import actions from './action';
import getters from './getter';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    projectName: '海纳平台',  // 项目名称及版本
    url: process.env.api_url,  // 各环境API接口配置
    projectHome: process.env.home,  // 各环境项目入口
    token: Cookies.get('token'),  // 从cookie中取用户信息
    userInfo: Cookies.get('userInfo'),  // 从cookie中取用户信息
    iamUrl: 'https://iam.tendcloud.com/login?app_id=c77bf7cf-cacb-5409-8ebc-a1e0a72397a6',
    stepVal: 0,
    isTitle: false,  //  列表展示的title变化
    listContent: [],  // 列表展示的内容
    listContentStr: [],  // 列表展示的内容的备份
    spinShow: false, // 控制加载中效果的值
    filterObj: {}, // APP筛选的条件
    lastUrl: '',  // 接口地址后半部分
    listArr: [],   // 列表选中的数组
    listTotal: 10,  // 列表的总数
    currentPage: 1,  // 列表的当前页数
    pageSize: 20,  // 列表每页的条数
    tags: [{ name: '标签体系', code: '' }, ''],  // 标签体系面包屑
    tagInfo: {
      name: '',
      description: '',
      code: '',
      nameEn: '',
    },  // 新增标签时的对象
    showDetails: false,  // 是否展示详情页面
    dataDetails: [],  // 详情页面的数据详情
    metaDetails: [],  // 详情页面匹配到的所有详情
    showEdit: false,  // 是否显示编辑组件
    showEditTag: false, // 是否显示tags页面的编辑组件
    editAppInfo: {},  // 编辑组件内的内容
    resultShowTitles: [],  // 成果查询组件展示的列表title
    isGet: '',  // 用于在进行数据操作后进行检测并在此请求数据
    sortObj: {
      sortBy: false,  // 排序的方式： true为正序，false为倒序
      orderBy: 'updateTime',  // 排序的key，以哪个值作为排序的基准
    },   // 排序的参数
    resultParams: {},   //  成果查询筛选的条件
    disabledBtn: [],   //  倒计时禁止点击效果设置
    loadingHashTagRel: '',  // 同步hashTag表按钮的控制器
    hashTagRelResult: '',  // 同步hashTag表任务的结果
    hashTagRelResultTime: '',  // 同步hashTag表任务结束的时间
    manageUserInfo: Object,  // 用户管理编辑对话框展示的信息
    showAdd: false,  // 用户管理编辑对话框的开关
    RoleInfo: Object,  // 用户管理编辑对话框的开关
    allRoles: [],  // 用户管理编辑用户角色获取到的所有角色
    manageType: 1,  // 用户管理的类型
    showJurisdiction: false,  // 角色管理组件的展示开关
    showJurisdictionInfo: false,  // 角色管理组件的展示数据
    addRoleName: '',  // 角色管理组件的新增角色的name
    viewPower: [],  // 用户页面查看的权限
    allPower: [],  // 用户申领、分发等权限
    allManageUsers: [
      { value: 1, label: 'Content 1' },
      { value: 2, label: 'Content 2' },
      { value: 3, label: 'Content 3' },
    ],  //  任务分发时，所有的作业人员
    operatorUsers: [
      { value: 1, label: 'Content1' },
    ],
    userMissionCount: 0,  // 用户申领任务的条数
    isSuperManager: 0,  // 是否是超级管理员
    hearderPower: [],  // 头部导航部分权限
    hashPower: false,  // 同步hash的权限
    detailsSearch: [], //  metaId搜索
    showEditDetails: false, //  field组件里是否显示编辑组件
    showEditDetailsInfo: '', // 人工合包搜索的metaId
    editData: {},  //  存储本条数据
    isLoading: false,  //  当前是否正在远程搜索
    itemsData: [],   //  header的头部菜单
    // noResult: function() {},   //  存储编辑组件搜索无果的方法
    progresListInfo: [],   // 地理信息的列表信息
    levelList1: [],  // 获取省市县的数据
    levelList2: [],
    levelList3: [],
    dataDetail: '数据详情',
    metaDetail: '匹配详情',
    imgUrls: [],
    switch1: true,  //  合包开关的状态
    subStatus: false,
    configName: '1', // 积木配置关系菜单name值
    jwoodTags: [{ name: '标签体系', code: '' }, ''],  // 标签体系面包屑
    jwoodTagInfo: {
      name: '',
      description: '',
      code: '',
      nameEn: '',
      userId: '',
      userName: '',
      systemId: 2,
      sid: '',
    },  // 新增标签时的对象
    systemData: [], // 保存体系数据
    tdTypeTree: [], //  保存树
    allData: [],
    mapperData: [],  // 映射体系
    otherTree: [],
    tdtypeData: {
      tdtypeId: 0,
      tdtypeVal: '',
      mapperId: 0,
      mapperVal: '',
      id: 0,
    },
    groupId: -1,
    parentcode: '',
    showConfig: false, // jwood新增体系标签...
    showUpdate: false,
    condition: {
      tdtypeVal: '',
      tdClass: '',
      filterCondition: [],
    }, // 收集高级筛选条件
    dateTime: 1,
    editRuleTime: 1, // 规则改变所用变量
    watchName: '',  // 监听名字
    ruleInfo: {   // 新建规则信息
      mapperSystemId: '',
      mapperTagId: [],
      mapJudgement: -1,
      renewCycle: 0,
      userId: 33,
      ruleArray: [],
      mapperTagName: '',
      id: -1,
    },
    allConditions: [[{ type: '', relation: '', tag: '' }]],  // 重置筛选条件
    isShow: false,
    mapperTagIds: [],
    editJwoodInfo: {},
    systemId: 0,   // 保存定制分类的体系id
    allTreeData: [], // 所有体系树
    configList: {
      metaid: '',
      tree: [],
    },
    historyType: 0, //  历史查询状态变化
    historyValue: '', // 历史查询的value
    filterParams: {},  //  筛选条件
    resultTitles: [],
    modify: false,  // 改变list的高度
    route: '',
    versionList: [],
  },
  getters,
  actions,
  mutations,
});
