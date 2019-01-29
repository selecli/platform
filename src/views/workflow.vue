<template>
  <div class="workflow-main clearfix">
    <div class="workflow-sideBar" v-if="barShow">
      <div class="workflow-sideBar-title">
          <!-- <Button type="primary" class="sideBar-title">数据导航</button> -->
          <!-- <span style="color:#666; font-size:20px; font-weight:700;margin-top:24px; display:inline-block;">数据导航</span> -->
      </div>
      <div class="sideBar-button-group" v-show="buttonShow">
        <Button type="text" icon="edit" size="small"></Button>
        <Button type="text" icon="ios-plus-outline" size="small"></Button>
        <Button type="text" icon="android-sync" size="small" ></Button>
        <Button type="text" icon="ios-minus-outline" size="small"></Button>
      </div>
      <div style="height:36px;" v-show="!buttonShow"></div>
      <!-- <div style="text-align:center; position:absolute; top:72px; left:0;width:100%;" >
        <Button type="primary" size="small">增加</Button>
        <Button type="primary" size="small">删除</Button>
        <Button type="primary" size="small">修改</Button>
      </div> -->
      <Tree :data="treeData" :render="renderContent" @on-check-change="changeCheck"></Tree>  

    </div>
    <div class="workflow-content-box" :class="{widthLittle: barShow, widthMore: !barShow}">
      <div class="workflow-content-steps">
        <Steps :current="stepVal">
          <Step v-for="step in steps" :class="{'no-power' : viewPower.indexOf(step.value)  === -1}" :title="step.label" :key="step.value" @click.native="changeSteps(step.value - 1)"></Step>
        </Steps>
      </div>
      <div class="workflow-content">
        <div class="workflow-content-devider"></div>
        <div class="workflow-upload clearfix" v-show="!showDetails">
          <div class="workflow-uploadBox" v-show="stepVal === 0">
            <Upload  :action="`${url}${uploadUrl}`" width="100px" name="sourceFile"
                  :headers="{token:tokenValue,userName:JSON.parse(userInfo).userName}"
                  :on-success="handleSuccess"
                  :data="{gid:noSelect[0].id}"
                  v-if="noSelect.length"
                  :before-upload="beforeUpload"
                  :with-credentials="true"
                  :show-upload-list="false">
              <Button
                type="primary"
                icon="ios-cloud-upload-outline">
                上传文件
              </Button>
            </Upload>
            <Button
                v-if="!noSelect.length"
                class="upload-hideBtn"
                type="primary"
                icon="ios-cloud-upload-outline"
                @click="beforeUploadFunction"
                >
                上传文件
              </Button>
          </div>
          <div style="display:inline-block; margin-left:10px; " v-if="stepVal === 5">
            <Button type="primary" @click="releaseVersionFunc">发布版本</Button>
          </div>
          <div v-show="stepVal === 5 || stepVal === 2 || stepVal === 3" class="mission-btn">
            <Button v-if="missionPower === 1" type="primary" @click="taskDistribution">任务分发</Button>
            <Button v-if="missionPower === 2" type="primary" @click="taskDistribution">作业申领</Button>
          </div>
          <div v-show="stepVal === 4" class="mission-btn">
            <Button  type="primary" @click="trainMethod" :disabled="isDisabled">训练</Button>
            <i-switch v-model="switch1" @on-change="onSwitchChange" size="large">
              <span slot="open">ON</span>
              <span slot="close">OFF</span>
            </i-switch>
          </div>
          <Upload v-show="stepVal === 5" :action="`${url}${uploadUrlDitch}`" width="100px" name="file"
                  :headers="{token:token,userName:JSON.parse(userInfo).userName}"
                  :on-success="ditchSuccess"
                  :before-upload="beforeUpload"
                  :show-upload-list="false" 
                  class="ditch"
                  multiple
          >
            <Button
              type="primary"
              icon="ios-cloud-upload-outline" >
              上传渠道信息
            </Button>
          </Upload>
          <div class="workflow-upload-right">
            <Button type="primary" :disabled="disabledBtn.indexOf(button.label) !== -1" v-for="button in buttons" :key="button.label" @click="btnsMethods(button)" v-show="button.id !== 19">
              <span v-show="disabledBtn.indexOf(button.label) === -1">{{button.label}}</span>
              <span v-show="disabledBtn.indexOf(button.label) !== -1">( {{button.value}} )</span>
            </Button> 
            <Button type="primary" :disabled="disabledBtn.indexOf(button.label) !== -1" v-for="button in buttons" :key="button.label" @click="btnsMethods(button)" v-show="button.id === 19 && hashPower">
              <span v-show="disabledBtn.indexOf(button.label) === -1">{{button.label}}</span>
              <span v-show="disabledBtn.indexOf(button.label) !== -1">( {{button.value}} )</span>
            </Button>
            <!-- <span v-show="stepVal === 4 && hashTagRelResult !== ''" class="hash-tag-rel-result">hashTag表最后更新时间： {{formatDate(hashTagRelResultTime)}} - {{hashTagRelResult}}</span> -->
          </div>     
        </div>
        <div class="workflow-filter clearfix" v-show="!showDetails">
          <div class="workflow-filter-left common-float-left">
            <!--下拉进行列表展示title的筛选-->
            <!-- <Select v-show="stepVal === 1 || stepVal === 2 || stepVal === 4" v-model="choosedTitles" placeholder="请选择要显示的字段" multiple  @on-change="changeTitle" style="width:180px"> -->
            <Select v-show="stepVal === 1 || stepVal === 2 || stepVal === 3 || stepVal === 5" v-model="choosedTitles" placeholder="请选择要显示的字段" multiple  @on-change="changeTitle" style="width:120px">
              <Option v-for="item in showTitles" :value="item.value" :key="item.label">{{ item.label }}</Option>
            </Select>
            <!--下拉进行列表展示title的筛选-->
            <Select v-model="searchKey" clearable style="width:120px">
              <Option v-for="item in fieldList" :value="item.value" :key="item.label">{{ item.label }}</Option>
            </Select>
            <Input v-model="searchValue" clearable placeholder="请输入..." style="width: 120px" @on-enter="searchApp"></Input>
          </div>
          <div class="workflow-filter-right common-float-right">
            <!-- <Select v-model="dateVal" style="width:120px;" @on-change="chooseDateType">
              <Option v-for="item in datess" :value="item.value">{{item.label}}</Option>  
            </Select>
            <DatePicker type="date" placeholder="选择日期" style="width: 120px" @on-change="chooseDate"></DatePicker>   -->
            <div v-for="date in dates" :key="date" @click="chooseDateType(date)">
              <span>{{date}}</span>
              <DatePicker type="date" placeholder="选择日期" style="width: 120px" @on-change="chooseDate"></DatePicker>
            </div>
            <Select v-model="subValue" style="width:120px" @on-change="searchApp" clearable v-if="stepVal===4">
              <Option v-for="item in subList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="reasonValue" style="width:120px" @on-change="searchApp" clearable v-if="stepVal===5">
              <Option v-for="item in reasonList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="stateValue" style="width:120px" @on-change="searchApp">
              <Option v-for="item in stateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </div>
        </div>
        <!--列表展示组件-->
        <list v-show="!showDetails"></list>
        <!--详情组件-->
        <fieldDetails v-show="showDetails"></fieldDetails>
        <!--编辑组件-->
        <Modal
          v-model="showEdit"
          :title="editAppInfo.appName || editAppInfo.standardName"
          :width="stepVal === 3 ? 40 : 70"
          @on-ok="editOk"
          @on-cancel="editCancel"
          ref="modal">
        <edit></edit>
        </Modal>
        <!-- 训练确认 -->
        <Modal
          v-model="train"
          @on-ok="trainOk"
          @on-cancel="trainCancel"
        >
          <p>你确定要进行机器训练吗？</p>
        </Modal> 
        <Modal v-model="deleteGroup">
           <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>删除确认</span>
          </p>
          <div style="text-align:center">
             <p>分组数据删除后不可恢复</p>
          </div>
          <div slot="footer">
              <Button type="error" size="large" long  @click="delGroup" :loading="modal_loading">删除</Button>
          </div>
        </Modal>
        <!--任务分发modal-->
        <Modal
          v-model="showMissionMadal"
          class="mission-modal"
          :title="missionPower === 1 ? '任务分发' : '作业申领'"
          @on-ok="missionOk"
          @on-cancel="missionCancel"
          ref="missionModal">
          <Row>
            <Col span="24" v-if = "stepVal === 2 || stepVal === 3">
              <Row>
                <Col span="5">数据组:</Col>
                <Col span="16">
                  <Cascader :data="groupTree" v-model="dataGroup" change-on-select @on-change="changeGroup"></Cascader>
                </Col>
              </Row>
            </Col>
            <Col span="24" class="mission-modal-num">
              <Row>
                <Col span="5">数据状态:</Col>
                <Col span="18">
                  <CheckboxGroup v-model="checkedMission" class="mission-modal-checkbox">
                    <Checkbox v-if="index > 0" :label="item.value" v-for="(item,index) in stateList" :key="item.value">{{item.label}}</Checkbox>
                  </CheckboxGroup>
                </Col>
              </Row>
            </Col>
            <Col span="24" class="mission-modal-num" v-if="stepVal===3">
              <Row>
                <Col span="5">质检选择:</Col>
                <Col span="18">
                  <RadioGroup v-model="specifyFormat" @on-change="changeRadio">
                    <Radio label="随机" ></Radio>
                    <Radio label="指定作业员" style="margin-left:10px;">
                    </Radio>
                  </RadioGroup>
                  <Select  style="width:120px;" 
                  v-model="specifyOperator" multiple
                  v-if="specifyMan" @on-change="changeOperator">
                    <Option v-for="item in operatorUsers"
                    :value="item.value"
                    :key="item.value"
                    >{{item.label}}</Option>  
                  </Select>
                </Col>
              </Row>
            </Col>
            <Col span="24" v-show="missionPower === 1" class="mission-modal-num">
              <Row>
                <Col span="5">人员选择:</Col>
                <Col span="16">
                  <Select multiple v-model="personSelect">
                    <Option 
                    v-for="item in allManageUsers" 
                    :value="item.value"
                    :key="item.value">{{item.label}}</Option>
                  </Select>
                </Col>
              </Row>
            </Col>
            <Col span="24" class="mission-modal-num">
              <Row>
                <Col span="5">{{missionPower === 1 ? '分发条数' : '领取条数'}}：</Col>
                <Col span="6">
                  <Select v-model="selectedList" class="mission-modal-select">
                    <Option v-for="item in missionList" :value="item" :key="item">{{ item }}</Option>
                  </Select>
                </Col>
              </Row>
            </Col>
            <Col span="24" class="mission-modal-num" v-show="missionPower === 2">
              <Row>
                <Col span="5">今日领取:</Col>
                <Col span="10">{{userMissionCount}}</Col>
              </Row>
            </Col>
          </Row>
          <!-- <Row v-show="missionPower === 1">
            <Col span="16" offset="4">
              <Transfer
                :data="allManageUsers"
                :target-keys="targetKeys"
                :render-format="render1"
                :titles="['全部作业人员', '已选人员']"
                @on-change="handleChange1"></Transfer>
            </Col>
          </Row> -->
        </Modal>
      </div>
    </div>  
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import { mapState, mapMutations, mapActions } from 'vuex';
import list from '../components/workflow/list';
import fieldDetails from '../components/workflow/fieldDetails';
import edit from '../components/workflow/edit';


export default {
  name: 'workflow',
  data() {
    return {
      steps: [
        { label: '预处理', value: 1 },
        { label: '字段补全', value: 2 },
        { label: '人工作业', value: 3 },
        { label: '包质检', value: 7 },
        { label: '合包', value: 4 },
        { label: 'App质检', value: 5 },
      ],
      isDisabled: false,
      train: false,
      specifyFormat: '随机',
      specifyOperator: [],
      specifyMan: false,
      groupIds: [],
      tokenValue: '',
      dataList2: [
        { value: '1', label: '预处理-岁', name: '岁' },
        { value: '2', label: '预处理-岁2', name: '岁2' },
        { value: '3', label: '预处理-岁3', name: '岁3' },
        { value: '4', label: '预处理-岁4', name: '岁4' },
      ],
      personSelect: [],
      personList: [
        { label: 'wo', value: '1' },
        { label: '尼', value: '2' },
        { label: 'ta', value: '3' },
      ],
      dataGroup: [],
      groupTree: [],
      modal_loading: false,
      deleteGroup: false,
      nodeIndex: -1,
      buttonShow: true,
      deleteData: {},
      editKey: '',
      index: 0,
      noSelect: [],
      treeData: [{ title: '全部', expand: true, children: [], count: 0 }],
      data1: [
        {
          title: 'parent1',
          children: [
            {
              title: 'page1',
            },
            {
              title: 'page2',
            },
          ],
          loading: false,
        },
      ],
      barShow: true,
      current: this.stepVal,  // 控制步骤的变量
      fieldList: [
        {
          value: 'appOriginalName',
          label: '原始名称',
        },
        {
          value: 'appPackageName',
          label: '包名',
        },
        {
          value: 'packageHash',
          label: 'Hash',
        },
        {
          value: 'preAppName',
          label: '包名称',
        },
      ],
      reasonValue: 'all',
      subValue: '1',
      searchKey: 'preAppName',
      searchValue: '',
      buttons: [
        {
          label: '预处理',
          value: 10,
        }, {
          label: '删除',
          value: 10,
        }],
      stateList: [
        {
          value: 'all',
          label: '全部',
        },
        {
          value: '1',
          label: '新入库',
        },
        {
          value: '2',
          label: 'hash错误',
        },
        {
          value: '4',
          label: '名称已更改',
        },
        {
          value: '3',
          label: '名称未更改',
        },
        {
          value: '12',
          label: '数据重复',
        },
      ],
      stateValue: '1',
      dates: ['包获取日期', '包最后更新时间'],
      dateVal: '包获取日期',
      datess: [
        {
          value: '包获取日期',
          label: '包获取日期',
        },
        {
          value: '包最后更新时间',
          label: '包最后更新时间',
        },
        {
          value: '包最后',
          label: '包最后',
        },
      ],
      dateType: '',
      pkgCreatTime: '',
      pkgUpdateTime: '',
      uploadUrl: '/app/acquires/uploadCSV', // 上传文件的地址
      uploadUrlDitch: '/app/metaInfos/updateChannel',
      choosedTitles: [],  // 要展示的列表字段
      popColumns: [
        { title: 'MetaId', key: 'metaid' },
        { title: 'Channel', key: 'channel' },
      ],
      popData: [
        { metaid: 1, channel: 'c001' },
        { metaid: 2, channel: 'c002' },
      ],
      showTitles: [
        {
          label: '包名称',
          value: 'appName',
          isShow: true,
        },
        {
          label: '包名',
          value: 'appPackageName',
          isShow: true,
        },
        {
          label: 'Hash',
          value: 'packageHash',
          isShow: true,
        },
        {
          label: '分类',
          value: 'pkgTagName',
          isShow: true,
        },
        {
          label: '图标地址',
          value: 'iconUrl',
          isShow: true,
        },
        {
          label: '开发者',
          value: 'developer',
          isShow: true,
        },
        {
          label: '参考网址',
          value: 'referenceUrl',
          isShow: true,
        },
        {
          label: '匹配数量',
          value: 'matchCount',
          isShow: true,
        },
        {
          label: '包状态',
          value: 'packageStatus',
          isShow: true,
        },
        {
          label: '包获取时间',
          value: 'createTime',
          isShow: true,
        },
        {
          label: '包最后更新日期',
          value: 'updateTime',
        },
        {
          label: '英文名称',
          value: 'appNameEn',
        },
        {
          label: '名称拼音',
          value: 'appNameSpell',
        },
        {
          label: '原始标签',
          value: 'originalTag',
        },
        {
          label: '原始分类',
          value: 'originalType',
        },
        {
          label: '来源商店',
          value: 'sourceId',
        },
      ],   // 可以展示的全部字段
      hashTagRel: {},
      showMissionMadal: false,  // 任务分发弹框的变量
      targetKeys: [],
      checkedMission: [],
      selectedList: 5,
      missionList: [1, 5, 10, 20, 50, 100],
      missionPower: 1,  // 任务分发1或者任务申领2的权限
      reasonList: [
        { value: 'all', label: '全部' },
        { value: '1', label: 'url 校验失败' },
      ],
      subList: [
        { value: 'all', label: '全部' },
        { value: '1', label: '未提交' },
        { value: '2', label: '执行中' },
        { value: '3', label: '已完成' },
        { value: '4', label: '执行异常' },
      ],
    };
  },
  computed: mapState([
    'userInfo',
    'token',
    'stepVal',
    'listArr',
    'url',
    'showDetails',
    'showEdit',
    'editAppInfo',
    'listContentStr',
    'filterObj',
    'currentPage',
    'isGet',
    'disabledBtn',
    'loadingHashTagRel',
    'hashTagRelResult',
    'hashTagRelResultTime',
    'viewPower',
    'allPower',
    'allManageUsers',
    'userMissionCount',
    'hashPower',
    'noResult',
    'operatorUsers',
    'isTitle',
    'switch1',
    'subStatus',
  ]),
  components: {
    list, fieldDetails, edit,
  },
  created() {
    // 增加对stepVal的控制，从后台返回的页面查看权限中获取第一次展示的步骤
    if (this.viewPower[0] - 1 === 6) {
      this.$store.state.stepVal = 3;
    } else if (this.viewPower[0] - 1 === 3) {
      this.$store.state.stepVal = 4;
    } else if (this.viewPower[0] - 1 === 4) {
      this.$store.state.stepVal = 5;
    } else {
      this.$store.state.stepVal = this.viewPower[0] - 1;
    }
  },
  mounted() {
    this.getAPPs({
      keyword: '',
      packageStatus: this.stateValue,
      reason: this.reasonValue,
    });
    this.getNodeList();
    this.witchStatus();
    this.tokenValue = Cookies.get('token');
    const p = {
      callback: (response) => {
        console.log(response);
        if (response.data.status === false) {
          this.isDisabled = true;
        } else {
          this.isDisabled = false;
        }
      },
    };
    this.modelStatus(p);
  },
  methods: {
    ...mapActions([
      'getAPPs',
      'pretreatmentPost',
      'delListPOST',
      'completionPOST',
      'completionAllPOST',
      'copperPOST',
      'copperAllPOST',
      'saveAppsPost',
      'AppsPost',
      'changeTagsPut',
      'changeSystemPut',
      'pretreatmentAllPost',
      'saveHashTagRel',
      'getHashTagRel',
      'getManualUser',
      'taskDistribute',
      'getApplyDataNum',
      'taskApply',
      'getEditTagsFirst',
      'getEditTagsAll',
      'getList',
      'appendNode',
      'updateNode',
      'deleteNode',
      'releaseVersion',
      'callTrain',
      'operateWitch',
      'witchStatus',
      'modelStatus',
    ]),
    ...mapMutations([
      'changeSteps',
      'updateTime',
    ]),
    changeGroup(value, selectedData) {
      this.groupIds.splice(0, 1, selectedData[selectedData.length - 1].id);
    },
    changeOperator(val) {
      console.log(val);
    },
    releaseVersionFunc() {
      this.releaseVersion();
      this.$Message.warning('正在发版中');
    },
    onSwitchChange(status) {
      this.$Message.loading({
        content: '正在处理中',
        duration: 0,
      });
      const self = this;
      const p = {
        number: 1,
        callback: () => {
          self.$Message.destroy();
        },
      };
      if (status) {
        p.number = 1;
      } else {
        p.number = 0;
      }
      this.operateWitch(p);
    },
    changeRadio(val) {
    //  console.log(val);
      if (val === '指定作业员') {
        this.specifyMan = true;
      }
      if (val === '随机') {
        this.specifyMan = false;
        this.specifyOperator = [];
      }
    },
    delGroup() {
      const node = this.deleteData.node;
      const root = this.deleteData.root;
      const data = this.deleteData.data;
      this.remove(root, node, data);
    },
    renderContent(h, { root, node, data }) {
      if (this.editKey === node.nodeKey) {
        return h(
          'span',
          {
            style: {
              display: 'inline-block',
              width: '80%',
            },
          },
          [
            h('span', [
              h('Input', {
                props: {
                  value: data.title,
                  autofocus: true,
                },
                style: {
                  marginRight: '4px',
                  width: '100px',
                },
                on: {
                  input: (val) => {
                    data.title = val;
                    data.name = val;
                  },
                  'on-enter': () => {
                    this.editKey = '';
                    const self = this;
                    console.log(data);
                    const p = {
                      name: data.name,
                      id: data.id,
                      callback: (todo) => {
                        this.treeData[0].count = todo.total;
                        todo.data.forEach((item) => {
                          item.title = item.name;
                          self.fib(item);
                        });
                        this.treeData[0].children = todo.data;
                      },
                    };
                    this.updateNode(p);
                  },
                },
              }),
            ]),
          ],
        );
      }
      return h(
        'span',
        {
          style: {
            display: 'inline-block',
            width: '85%',
          },
          attrs: {
            class: 'ho',
          },
        },
        [
          h('span', {
            attrs: {
              class: this.nodeIndex === node.nodeKey ? 'ivu-tree-title-selected' : '',
            },
            on: {
              click: () => {
                this.nodeIndex = node.nodeKey;
                this.buttonShow = false;
                this.noSelect.splice(0, 1, data);
                if (data.nodeKey === 0) {
                  this.getAPPs();
                } else {
                  this.getAPPs({ gid: data.id });
                }
              },
            },
          }, [`${data.title}(${data.count || 0})`]),
          h(
            'div',
            {
              style: {
                position: 'absolute',
                top: '88px',
                left: 0,
                width: '100%',
                textAlign: 'center',
              },
              class: {
                'sideBar-show': this.nodeIndex === node.nodeKey,
                'sideBar-hide': true,
              },
            },
            [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small',
                  icon: 'edit',
                },
                style: {
                  marginRight: '0px',
                },
                on: {
                  click: () => {
                    if (data.title === '默认分组') {
                      this.$Message.warning('默认分组数据不允许修改');
                    } else {
                      this.editKey = node.nodeKey;
                    }
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small',
                  icon: 'ios-plus-outline',
                },
                style: {
                  marginRight: '0px',
                },
                on: {
                  click: () => {
                    if (data.title === '默认分组') {
                      this.$Message.warning('默认分组数据不允许添加');
                    } else {
                      this.append(data, node);
                    }
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small',
                  icon: 'android-sync',
                },
                style: {
                  marginRight: '0px',
                },
                on: {
                  click: () => {
                    this.getNodeList();
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small',
                  icon: 'ios-minus-outline',
                },
                style: {
                  marginRight: '0px',
                },
                on: {
                  click: () => {
                  //  this.buttonShow = true;
                    if (data.title === '默认分组') {
                      this.$Message.warning('默认分组数据不允许删除');
                    } else if (data.children.length || data.count) {
                      this.$Message.warning('分组下面有数据不允许删除');
                    } else {
                      this.deleteGroup = true;
                      this.deleteData.root = root;
                      this.deleteData.node = node;
                      this.deleteData.data = data;
                    //  this.remove(root, node, data);
                    }
                  },
                },
              }),
            ],
          ),
        ],
      );
    },
    changeCheck(val) {
      console.log(val);
    },
    getNodeList() {
      const self = this;
      const p = {
        callback: (d) => {
          this.treeData[0].count = d.total;
          d.data.forEach((item) => {
            item.title = item.name;
            self.fib(item);
          });
          this.treeData[0].children = d.data;
        },
      };
      this.getList(p);
    },
    fib(item) {
      if (item.children.length) {
        item.children.forEach((todo) => {
          todo.title = todo.name;
          todo.expand = true;
          this.fib(todo);
        });
      }
    },
    fib3(item) {
      if (item.children.length) {
        item.children.forEach((todo) => {
          todo.label = `${todo.name}(${todo.unCount})`;
          todo.value = todo.id;
          this.fib3(todo);
        });
      }
    },
    fib2(arr, item) {
      arr.forEach((todo) => {
        if (todo.title === item) {
          todo.render = (h, { data }) => {
            return h('Input', {
              props: {
                value: data.title,
                autofocus: true,
              },
              style: {
                width: '100px',
              },
              on: {
                input: (val) => {
                  data.title = val;
                  data.name = val;
                },
                'on-enter': () => {
                  const self = this;
                  const p = {
                    name: data.name,
                    id: data.id,
                    callback: (todo3) => {
                      this.treeData[0].count = todo3.total;
                      todo3.data.forEach((item3) => {
                        item3.title = item3.name;
                        self.fib(item3);
                      });
                      this.treeData[0].children = todo3.data;
                      this.$Message.success('添加成功');
                    },
                  };
                  this.updateNode(p);
                },
              },
            });
          };
        }
        this.fib2(todo.children, item);
      });
    },
    append(d, n) {
      const self = this;
      const children = d.children || [];
      children.push({
        title: '新建分类',
        expand: true,
        level: n.node.level + 1,
        name: '新建分类',
        parentId: n.node.id,
      });
      this.$set(d, 'children', children);
      const nodeData = d.children[d.children.length - 1];
      const p = {
        level: nodeData.level || 1,
        name: nodeData.name,
        parentId: n.node.id || 0,
        callback: (todo) => {
          this.treeData[0].count = todo.total;
          todo.data.forEach((item) => {
            item.title = item.name;
            item.expand = true;
            self.fib(item);
          });
          this.treeData[0].children = todo.data;
          this.fib2(this.treeData, nodeData.title);
        },
      };
      this.appendNode(p);
    },
    remove(root, node, data) {
      const self = this;
      // const parentKey = root.find(el => el === node).parent;
      // const parent = root.find(el => el.nodeKey === parentKey).node;
      // const index = parent.children.indexOf(data);
      // parent.children.splice(index, 1);
      const p = {
        id: data.id,
        callback: (todo) => {
          this.deleteGroup = false;
          this.modal_loading = false;
          this.treeData[0].count = todo.total;
          todo.data.forEach((item) => {
            item.title = item.name;
            item.expand = true;
            self.fib(item);
          });
          this.treeData[0].children = todo.data;
          this.$Message.success('删除成功');
        },
      };
      this.deleteNode(p);
    },
    trainMethod() {
      this.train = true;
    },
//  预处理、删除等按钮的方法集合
    btnsMethods(btn) {
      const type = btn.label;
      this.$store.state.disabledBtn.push(type);
      this.updateTime(btn);
      if (type === '预处理') {
        this.pretreatment();
      } else if (type === '删除') {
        this.delList();
      } else if (type === '补全字段') {
        this.completion();
      } else if (type === '合包') {
        // if (this.subStatus) {
        //   this.$Message.warning('已提交状态不能再次合包');
        // } else {
        //   this.copper();
        // }
        this.copper();
      //  this.$store.state.isTitle = true;
      } else if (type === '审核通过') {
        this.saveApps();
      } else if (type === '审核失败') {
        this.saveDefeat();
      } else if (type === '全部预处理') {
        this.pretreatmentAll();
      } else if (type === '补全全部字段') {
        this.completionAll();
      } else if (type === '训练') {
        this.train = true;
        this.callTrain();
      } else if (type === '更新最终列表') {
//        alert(type);
      } else if (type === '同步hashTag表') {
        this.$store.state.loadingHashTagRel = true;
        this.saveHashTagRelBtn();
      }
    },
//  筛选APP
    searchApp() {
//      筛选条件改变后将页数重置为1
      this.$store.state.currentPage = 1;
      const params = {
        keyword: '',
        packageStatus: this.stateValue,
        reason: this.reasonValue,
        substatus: this.subValue,
      };
      if (this.searchKey !== '' && this.searchValue !== '') {
        if (this.searchKey === 'merge') {
          params.merge = this.searchValue;
        } else if (this.searchKey === 'appTag') {
          params.tNames = this.searchValue;
        } else {
          params.keyword = `${this.searchKey}=${this.searchValue}`;
        }
      }
      if (this.pkgCreatTime !== '') {
        params.createTime1 = `${this.pkgCreatTime}000000`;
        params.createTime2 = `${this.pkgCreatTime}235959`;
      }
      if (this.pkgUpdateTime !== '') {
        params.updateTime1 = `${this.pkgUpdateTime}000000`;
        params.updateTime2 = `${this.pkgUpdateTime}235959`;
      }
      if (this.stepVal === 5) {
        params.appStatus = params.packageStatus;
        params.packageStatus = null;
      }
      this.$store.state.filterObj = params;
      this.getAPPs();
    },
//  日期筛选
    chooseDateType(type) {
      console.log(type);
      this.dateType = type;
    },
    sl() {
      console.log(99999);
    },
    chooseDate(date) {
      if (this.dateType === '包获取日期') {
        this.pkgCreatTime = date.replace(/-/g, '');
      } else if (this.dateType === '包最后更新时间') {
        this.pkgUpdateTime = date.replace(/-/g, '');
      }
      this.searchApp();
    },
//  上传文件相关方法
    beforeUpload() {
      this.$Message.loading({
        duration: 0,
        content: '上传中',
      });
    },
    handleSuccess(data) {
      console.log(data);
      this.$Message.destroy();
      if (data.code === 200) {
        // this.list = data.result.data.concat( this.list );
        // this.total = data.result.total;
        this.getAPPs({
          keyword: '',
          packageStatus: this.stateValue,
        });
        this.$Notice.success({
          title: '提示',
          desc: '上传成功',
        });
        this.getNodeList();
      } else if (data.code === 424) {
        this.$Notice.error({
          title: '提示',
          desc: '上传的文件格式有误',
        });
      } else if (data.code === 425) {
        this.$Notice.error({
          title: '提示',
          desc: '文件的大小超过50M',
        });
      } else if (data.code === 423) {
        this.$Notice.error({
          title: '提示',
          desc: '上传的文件内容为空',
        });
      }
    },
    ditchSuccess(data) {
      this.$Message.destroy();
      if (data.code === 200) {
        this.$Notice.success({
          title: '提示',
          desc: '上传成功',
        });
      } else {
        this.$Notice.error({
          title: '提示',
          desc: '上传失败',
        });
      }
    },
//  预处理的方法
    pretreatment() {
      if (this.listArr.length === 0) {
        this.$store.state.disabledBtn = [];
        this.$Message.warning('请选择预处理的数据...');
        return;
      }
      this.$Message.loading({
        content: '正在处理中...',
        duration: 0,
      });
      const self = this;
      const params = {
        data: self.listArr,
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '预处理成功',
          });
        },
      };
      this.pretreatmentPost(params);
    },
//  预处理全部的方法
    pretreatmentAll() {
      this.$Message.loading({
        content: '正在处理中...',
        duration: 0,
      });
      const self = this;
      const params = {
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '全部预处理成功',
          });
        },
      };
      this.pretreatmentAllPost(params);
    },
//  删除的方法
    delList() {
      if (this.listArr.length === 0) {
        this.$store.state.disabledBtn = [];
        this.$Message.warning('请选择要删除的数据...');
        return;
      }
      this.$Message.loading({
        content: '正在删除中...',
        duration: 0,
      });
      this.$Notice.success({
        title: '提示',
        desc: '只会将新入库及hash错误的数据删除',
      });
      const self = this;
      const params = {
        data: self.listArr,
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '删除成功',
          });
        },
      };
      this.delListPOST(params);
    },
//  补全的方法
    completion() {
      if (this.listArr.length === 0) {
        this.$store.state.disabledBtn = [];
        this.$Message.warning('请选择要补全的数据...');
        return;
      }
      this.$Message.loading({
        content: '正在补全中...',
        duration: 0,
      });
      const self = this;
      const params = {
        data: self.listArr,
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '补全成功',
          });
        },
      };
      this.completionPOST(params);
    },
//  全部补全的方法
    completionAll() {
      this.$Message.loading({
        content: '正在补全中...',
        duration: 0,
      });
      const self = this;
      const params = {
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '全部补全成功',
          });
        },
      };
      this.completionAllPOST(params);
    },
//  合包功能
    copper() {
      if (this.listArr.length === 0) {
        this.$store.state.disabledBtn = [];
        this.$Message.warning('请选择要合包的数据...');
        return;
      }
      const temp = [];
      const arrState5 = [];
      this.listArr.forEach((item) => {
        item.userId = JSON.parse(this.userInfo).userId;
        if (item.packageStatus !== 8 || item.packageStatus !== 11) {
          temp.push(item);
        }
        if (item.packageStatus === 5) {
//          进行未补全的过滤
          arrState5.push(item);
        }
      });
//      if (arrState5.length === this.listArr.length) {
//        this.$Notice.warning({
//          title: '提示',
//          desc: '未补全的包不允许合包',
//        });
//      } else {
      this.$Message.loading({
        content: '正在合包中...',
        duration: 0,
      });
      const self = this;
      const params = {
        data: temp,
        callback() {
          self.$Message.destroy();
        },
      };
      // this.$Notice.warning({
      //   title: '提示',
      //   desc: '合包成功的将不再合包',
      // });
      this.copperPOST(params);
//      }
    },
//  上传文件前判断是否选中
    beforeUploadFunction() {
      this.$Message.error('请选择数据分组');
    },
//  全部合包功能
    copperAll() {
      this.$Message.loading({
        content: '正在合包中...',
        duration: 0,
      });
      const self = this;
      const params = {
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '合包成功',
          });
        },
      };
      // this.$Notice.warning({
      //   title: '提示',
      //   desc: '合包成功的将不再合包',
      // });
      this.copperAllPOST(params);
    },
//  审核通过
    saveApps() {
      if (this.listArr.length === 0) {
        this.$store.state.disabledBtn = [];
        this.$Message.warning('请选择要审核的数据...');
        return;
      }
      this.$Message.loading({
        content: '正在审核中...',
        duration: 0,
      });
      const temp = [];
      const temp1 = [];
      this.listArr.forEach((item) => {
        temp.push(item.metaId);
        temp1.push(item.id);
      });
      const self = this;
      if (this.stepVal === 3) {
        const params = {
          data: {
            ids: temp1,
            status: 14,
            userId: JSON.parse(this.userInfo).userId,
          },
          callback() {
            self.$Message.destroy();
            self.$Notice.success({
              title: '提示',
              desc: '操作成功',
            });
          },
        };
        this.AppsPost(params);
      } else {
        const params = {
          data: {
            metaids: temp,
            status: 2,
            userId: JSON.parse(this.userInfo).userId,
          },
          callback() {
            self.$Message.destroy();
            self.$Notice.success({
              title: '提示',
              desc: '操作成功',
            });
          },
        };
        this.saveAppsPost(params);
      }
    },
//  审核失败
    saveDefeat() {
      if (this.listArr.length === 0) {
        this.$store.state.disabledBtn = [];
        this.$Message.warning('请选择要审核的数据...');
        return;
      }
      const temp = [];
      const temp1 = [];
      this.listArr.forEach((item) => {
        temp.push(item.metaId);
        temp1.push(item.id);
      });
      const self = this;
      if (this.stepVal === 3) {
        const params = {
          data: {
            ids: temp1,
            status: 15,
          },
          callback() {
            self.$Message.destroy();
            self.$Notice.success({
              title: '提示',
              desc: '操作成功',
            });
          },
        };
        this.AppsPost(params);
      } else {
        const params = {
          data: {
            metaids: temp,
            status: 4,
          },
          callback() {
            self.$Message.destroy();
            self.$Notice.success({
              title: '提示',
              desc: '操作已完成',
            });
          },
        };
        this.saveAppsPost(params);
      }
    },
//  同步hash的方法
    saveHashTagRelBtn() {
      const self = this;
      const params = {
        success() {
          self.$Notice.success({
            title: '提示',
            desc: '任务提交成功,请耐心等待执行结果',
          });
        },
        error() {
          self.$Notice.error({
            title: '提示',
            desc: '任务提交失败',
          });
        },
      };
      this.saveHashTagRel(params);
    },
//  查看是否有同步hashTag表的任务
    getHashTagRelMethod() {
      this.getHashTagRel();
    },
//  用来验证url地址格式的方法
    CheckUrl(url) {
      const strRegex = '(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]';
      const re = new RegExp(strRegex);
      if (re.test(url)) {
        return true;
      }
      return false;
    },
//  训练确认
    trainOk() {
      this.callTrain();
      this.train = false;
    },
    trainCancel() {
      this.train = false;
    },
//  编辑弹窗的确定按钮
    editOk() {
      const isUrl = this.CheckUrl(this.editAppInfo.iconUrl || this.editAppInfo.finalIconUrl);
      // console.log(this.noResult);
      if (this.editAppInfo.appName !== '' && this.editAppInfo.standardName !== '' && this.editAppInfo.packageStatus !== 13) {
        if (isUrl) {
          const self = this;
          const params = {
            callback() {
              self.$Message.destroy();
              self.$Notice.success({
                title: '提示',
                desc: '修改成功',
              });
            },
            get() {
              self.searchApp();
            },
          };
          this.$refs.modal.visible = false;
          this.$store.state.showEdit = false;
          this.$Message.loading({
            content: '正在修改中...',
            duration: 0,
          });
          if (this.stepVal === 5) {
            this.changeSystemPut(params);
          } else {
            this.changeTagsPut(params);
          }
        } else {
          this.$store.state.showEdit = true;
          this.$refs.modal.visible = true;
          this.$Message.warning('请输入正确的网址...');
        }
      } else if (this.editAppInfo.packageStatus === 13) {
        const self = this;
        const params = {
          callback() {
            self.$Message.destroy();
            self.$Notice.success({
              title: '提示',
              desc: '修改成功',
            });
          },
          get() {
            self.searchApp();
          },
        };
        this.$refs.modal.visible = false;
        this.$store.state.showEdit = false;
        this.$Message.loading({
          content: '正在修改中...',
          duration: 0,
        });
        if (this.stepVal === 5) {
          this.changeSystemPut(params);
        } else {
          this.changeTagsPut(params);
        }
      } else {
        this.$store.state.showEdit = true;
        this.$refs.modal.visible = true;
        this.$Message.warning('APP名称不能为空');
      }
    },
//  编辑弹窗的取消按钮
    editCancel() {
//      this.$store.state.listContent = JSON.parse(this.listContentStr);
      this.getAPPs();
      this.$store.state.showEdit = false;
    },
//  改变列表的展示
    changeTitle() {
      const temp = [];
      console.log(1111);
      this.choosedTitles.forEach((choosedTitles) => {
        this.showTitles.forEach((allTitles) => {
          if (choosedTitles === allTitles.value) {
            temp.push({
              label: allTitles.label,
              value: allTitles.value,
            });
          }
        });
      });
      this.$store.state.resultShowTitles = temp;
    },
//  展示默认勾选的title的方法
    addDefaultTitle() {
//    对所有可以展示的title进行遍历匹配需要展示的title
      this.choosedTitles = [];
      this.$store.state.resultShowTitles = [];
      this.showTitles.forEach((item) => {
        if (item.isShow) {
          this.choosedTitles.push(item.value);
        }
      });
    },
    // 更新倒计时时间
    updateTime(btn) {
      clearInterval();
      const time = setInterval(() => {
        if (btn.value > 0) {
          btn.value -= 1;
        } else {
          clearInterval(time);
          this.$store.state.disabledBtn.splice(this.disabledBtn.indexOf(btn.label), 1);
          btn.value = 10;
        }
      }, 1000);
    },
    //  转换日期格式
    formatDate(date) {
      const time = new Date(date);
      const Y = time.getFullYear();
      const M = time.getMonth() + 1 >= 10 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`;
      const D = time.getDate() >= 10 ? time.getDate() : `0${time.getDate()}`;
      const H = time.getHours() >= 10 ? time.getHours() : `0${time.getHours()}`;
      const m = time.getMinutes() >= 10 ? time.getMinutes() : `0${time.getMinutes()}`;
      const S = time.getSeconds() >= 10 ? time.getSeconds() : `0${time.getSeconds()}`;
      return `${Y}-${M}-${D} ${H}:${m}:${S}`;
    },
    // 任务分发按钮
    taskDistribution() {
      this.showMissionMadal = true;
    },
    // 穿梭框的相关方法
    render1(item) {
      return item.label;
    },
    handleChange1(newTargetKeys) {
      this.targetKeys = newTargetKeys;
    },
//    任务分发确定
    missionOk() {
      if (this.dataGroup.length !== 0 || this.stepVal === 5) {
        if (this.checkedMission.length !== 0) {
          const params = {};
          if (this.missionPower === 1) {
            if (this.personSelect.length === 0) {
              this.$refs.missionModal.visible = true;
              this.showMissionMadal = true;
              this.$Message.error('请选择作业人员');
            } else {
              this.$refs.missionModal.visible = false;
              this.showMissionMadal = false;
              params.dataStatus = this.checkedMission;
              params.dataNum = this.selectedList;
              params.acceptUserIds = this.personSelect;
              params.groupIds = this.groupIds;
              params.sourceUserIds = this.specifyOperator || null;
              // 任务分发
              this.taskDistribute(params);
              this.targetKeys = [];
              this.checkedMission = [];
            }
          } else if (this.missionPower === 2) {
            // 任务申领
            params.dataStatus = this.checkedMission;
            params.dataNum = this.selectedList;
            params.groupIds = this.groupIds;
            params.sourceUserIds = this.specifyOperator || null;
            params.userId = JSON.parse(this.userInfo).id;
            this.taskApply(params);
          }
        } else {
          this.$refs.missionModal.visible = true;
          this.showMissionMadal = true;
          this.$Message.error('请先选择数据状态');
        }
      } else {
        this.$refs.missionModal.visible = true;
        this.showMissionMadal = true;
        this.$Message.error('请先选择数据组');
      }
    },
//    任务分发取消
    missionCancel() {
      this.showMissionMadal = false;
    },
  },
  watch: {
    stepVal() {
      const self = this;
      this.current = this.stepVal;
//      进行步骤切换的时候默认显示状态值为全部
//      this.stateValue = 'all';
//      进行步骤跳转时将详情界面的值还原
      this.$store.state.showDetails = false;
//      切换步骤时，将搜索的value重置
      this.searchValue = '';
      this.allPower.forEach((item) => {
        if (self.stepVal === 5) {
          if (item.view === (this.stepVal + 1) && item.operator !== 0 && item.operator < 3) {
            this.missionPower = item.operator;
          }
        }
        if (self.stepVal === 3) {
          if (item.view === 7 && item.operator !== 0 && item.operator < 3) {
            this.missionPower = item.operator;
          }
        }
        if (item.view === (this.stepVal + 1) && item.operator !== 0 && item.operator < 3) {
          this.missionPower = item.operator;
        }
      });
//      进行筛选条件的动态渲染
      if (this.stepVal === 0) {
        this.tokenValue = Cookies.get('token');
        this.barShow = true;
        this.stateValue = '1';
        this.buttons = [
          {
            label: '预处理',
            value: 10,
          }, {
            label: '删除',
            value: 10,
          }];
        this.fieldList = [
          {
            value: 'appOriginalName',
            label: '原始名称',
          },
          {
            value: 'appPackageName',
            label: '包名',
          },
          {
            value: 'packageHash',
            label: 'Hash',
          },
          {
            value: 'preAppName',
            label: '包名称',
          },
        ];
        this.stateList = [
          {
            value: 'all',
            label: '全部',
          },
          {
            value: '1',
            label: '新入库',
          },
          {
            value: '2',
            label: 'hash错误',
          },
          {
            value: '4',
            label: '名称已改',
          },
          {
            value: '3',
            label: '名称未改',
          },
          {
            value: '12',
            label: '数据重复',
          },
        ];
        this.searchKey = 'preAppName';
      } else if (this.stepVal === 1) {
        this.barShow = false;
        this.stateValue = '3';
        this.buttons = [{
          label: '补全字段',
          value: 10,
        }];
        this.fieldList = [
          {
            value: 'appName',
            label: '包名称',
          },
          {
            value: 'appPackageName',
            label: '包名',
          },
          {
            value: 'packageHash',
            label: 'Hash',
          },
          // {
          //   value: 'appNameEn',
          //   label: '英文名称',
          // },
          // {
          //   value: 'appNameSpell',
          //   label: '名称拼音',
          // },
        ];
        this.stateList = [
          {
            value: 'all',
            label: '全部',
          },
          {
            value: '4',
            label: '名称已改',
          },
          {
            value: '3',
            label: '名称未改',
          },
          {
            value: '5',
            label: '未补全',
          },
          {
            value: '6',
            label: '已补全',
          },
        ];
        this.searchKey = 'appName';
        this.showTitles = [
          {
            label: '包名称',
            value: 'appName',
            isShow: true,
          },
          {
            label: '包名',
            value: 'appPackageName',
            isShow: true,
          },
          {
            label: 'Hash',
            value: 'packageHash',
            isShow: true,
          },
          {
            label: '分类',
            value: 'pkgTagName',
            isShow: true,
          },
          {
            label: '图标地址',
            value: 'iconUrl',
            isShow: true,
          },
          {
            label: '开发者',
            value: 'developer',
            isShow: true,
          },
          {
            label: '参考网址',
            value: 'referenceUrl',
            isShow: true,
          },
          {
            label: '匹配数量',
            value: 'matchCount',
            isShow: true,
          },
          {
            label: '包状态',
            value: 'packageStatus',
            isShow: true,
          },
          {
            label: '包获取时间',
            value: 'createTime',
            isShow: true,
          },
          {
            label: '英文名称',
            value: 'appNameEn',
          },
          {
            label: '名称拼音',
            value: 'appNameSpell',
          },
          {
            label: '原始标签',
            value: 'originalTag',
          },
          {
            label: '原始分类',
            value: 'originalType',
          },
          {
            label: '来源商店',
            value: 'sourceId',
          },
          {
            label: '包最后更新日期',
            value: 'updateTime',
          },
        ];
        this.addDefaultTitle();
        this.getList();
      } else if (this.stepVal === 2) {
        this.barShow = false;
        this.stateValue = '5';
        this.buttons = [];
        this.fieldList = [
          {
            value: 'appName',
            label: '包名称',
          },
          {
            value: 'appPackageName',
            label: '包名',
          },
          {
            value: 'packageHash',
            label: 'Hash',
          },
          {
            value: 'userName',
            label: '作业员',
          },
          {
            value: 'checkUser',
            label: '质检员',
          },
          {
            value: 'appTag',
            label: '分类',
          },
        ];
        this.stateList = [
          {
            value: 'all',
            label: '全部',
          },
          {
            value: '5',
            label: '未补全',
          },
          {
            value: '6',
            label: '已补全',
          },
          {
            value: '7',
            label: '人工补全',
          },
          {
            value: '10',
            label: '人工修改',
          },
          {
            value: '14',
            label: '包审核成功',
          },
          {
            value: '15',
            label: '包审核失败',
          },
          {
            value: '13',
            label: '搜索无果',
          },
          {
            value: '16',
            label: '质检修改',
          },
        ];
        this.showTitles = [
          {
            label: '包名称',
            value: 'appName',
            isShow: true,
          },
          {
            label: '包名',
            value: 'appPackageName',
            isShow: true,
          },
          {
            label: 'Hash',
            value: 'packageHash',
            isShow: true,
          },
          {
            label: '分类',
            value: 'pkgTagName',
            isShow: true,
          },
          {
            label: '图标地址',
            value: 'iconUrl',
            isShow: true,
          },
          {
            label: '开发者',
            value: 'developer',
            isShow: true,
          },
          {
            label: '参考网址',
            value: 'referenceUrl',
            isShow: true,
          },
          {
            label: '匹配数量',
            value: 'matchCount',
            isShow: true,
          },
          {
            label: '包状态',
            value: 'packageStatus',
            isShow: true,
          },
          {
            label: '作业员',
            value: 'userName',
            isShow: true,
          },
          {
            label: '质检员',
            value: 'checkUser',
            isShow: true,
          },
          {
            label: '包获取日期',
            value: 'createTime',
          },
          {
            label: '包最后更新日期',
            value: 'updateTime',
          },
          {
            label: '英文名称',
            value: 'appNameEn',
          },
          {
            label: '名称拼音',
            value: 'appNameSpell',
          },
          {
            label: '原始标签',
            value: 'originalTag',
          },
          {
            label: '原始分类',
            value: 'originalType',
          },
          {
            label: '来源商店',
            value: 'sourceId',
          },
          {
            label: 'MetaId',
            value: 'metaId',
          },
          {
            label: '公司简称',
            value: 'ipgp',
          },
          {
            label: '公司英文简称',
            value: 'ipgpEn',
          },
        ];
        this.searchKey = 'appName';
        this.addDefaultTitle();
      } else if (this.stepVal === 3) {
        this.barShow = false;
        this.stateValue = '7';
        this.buttons = [
          {
            label: '审核通过',
            value: 14,
          },
          {
            label: '审核失败',
            value: 15,
          },
        ];
        this.fieldList = [
          {
            value: 'appName',
            label: '包名称',
          },
          {
            value: 'appPackageName',
            label: '包名',
          },
          {
            value: 'packageHash',
            label: 'Hash',
          },
          {
            value: 'appTag',
            label: '分类',
          },
          {
            value: 'developer',
            label: '开发者',
          },
          {
            value: 'userName',
            label: '作业员',
          },
          {
            value: 'checkUser',
            label: '质检员',
          },
        ];
        this.stateList = [
          {
            value: 'all',
            label: '全部',
          },
          {
            value: '7',
            label: '人工补全',
          },
          {
            value: '10',
            label: '人工修改',
          },
          {
            value: '14',
            label: '包审核成功',
          },
          {
            value: '15',
            label: '包审核失败',
          },
          {
            value: '16',
            label: '质检修改',
          },
        ];
        this.showTitles = [
          {
            label: '包名称',
            value: 'appName',
            isShow: true,
          },
          {
            label: '包名',
            value: 'appPackageName',
            isShow: true,
          },
          {
            label: 'Hash',
            value: 'packageHash',
            isShow: true,
          },
          {
            label: '分类',
            value: 'pkgTagName',
            isShow: true,
          },
          {
            label: '图标地址',
            value: 'iconUrl',
            isShow: true,
          },
          {
            label: '开发者',
            value: 'developer',
            isShow: true,
          },
          {
            label: '参考网址',
            value: 'referenceUrl',
            isShow: true,
          },
          {
            label: '包状态',
            value: 'packageStatus',
            isShow: true,
          },
          {
            label: '作业员',
            value: 'userName',
            isShow: true,
          },
          {
            label: '质检员',
            value: 'checkUser',
            isShow: true,
          },
          {
            label: '平台',
            value: 'platform',
          },
          {
            label: '应用版本',
            value: 'version',
          },
          {
            label: '版本时间',
            value: 'finalOnlineTime',
          },
          {
            label: '匹配数量',
            value: 'matchCount',
          },
          {
            label: '包获取时间',
            value: 'createTime',
          },
          {
            label: '包更新时间',
            value: 'updateTime',
          },
          {
            label: '备注',
            value: 'remark',
          },
        ];
        this.searchKey = 'appName';
        this.addDefaultTitle();
      } else if (this.stepVal === 4) {
        this.witchStatus();
        this.barShow = false;
        this.stateValue = '14';
        this.buttons = [
          {
            label: '合包',
            value: 10,
          },
        ];
        this.fieldList = [
          {
            value: 'metaId',
            label: 'metaId',
          },
          {
            value: 'appName',
            label: '包名称',
          },
          {
            value: 'appPackageName',
            label: '包名',
          },
          {
            value: 'packageHash',
            label: 'Hash',
          },
          {
            value: 'userName',
            label: '作业员',
          },
        ];
        this.stateList = [
          {
            value: 'all',
            label: '全部',
          },
          {
            value: '8',
            label: '自动合包成功',
          },
          {
            value: '11',
            label: '人工合包成功',
          },
          {
            value: '14',
            label: '包审核成功',
          },
          {
            value: '9',
            label: '合包失败',
          },
        ];
        this.searchKey = 'appName';
      } else if (this.stepVal === 5) {
        this.barShow = false;
        this.stateValue = '1';
        this.reasonValue = 'all';
        this.buttons = [{
          label: '审核通过',
          value: 10,
        },
        {
          label: '审核失败',
          value: 10,
        },
        ];
        this.reasonList = [
          { value: 'all', label: '全部' },
          { value: '1', label: 'url 校验失败' },
        ];
        this.fieldList = [
          {
            value: 'metaId',
            label: 'metaId',
          },
          {
            value: 'standardName',
            label: '名称',
          },
          {
            value: 'appTag',
            label: '分类',
          },
          {
            value: 'userName',
            label: '作业员',
          },
        ];
        this.stateList = [
          {
            value: 'all',
            label: '全部',
          },
          {
            value: '1',
            label: '未审核',
          },
          {
            value: '2',
            label: '审核成功',
          },
          {
            value: '4',
            label: '审核失败',
          },
        ];
        this.showTitles = [
          {
            label: 'MetaId',
            value: 'metaId',
            isShow: true,
          },
          {
            label: '名称',
            value: 'standardName',
            isShow: true,
          },
          // {
          //   label: '包名',
          //   value: 'appName',
          //   isShow: true,
          // },
          // {
          //   label: 'Hash',
          //   value: 'packageHash',
          //   isShow: true,
          // },
          {
            label: '分类',
            value: 'pkgTagName',
            isShow: true,
          },
          {
            label: '图标地址',
            value: 'finalIconUrl',
            isShow: true,
          },
          {
            label: '开发者',
            value: 'developer',
            isShow: true,
          },
          {
            label: '参考网址',
            value: 'referenceUrl',
            isShow: true,
          },
          {
            label: '名称PY',
            value: 'standardNameSpell',
            isShow: true,
          },
          {
            label: '名称EN',
            value: 'standardNameEn',
            isShow: true,
          },
          {
            label: '状态',
            value: 'appStatus',
            isShow: true,
          },
          {
            label: '开发者EN',
            value: 'developerEn',
            isShow: true,
          },
          {
            label: '公司名称',
            value: 'ipgp',
            isShow: true,
          },
          {
            label: '公司名称EN',
            value: 'ipgnEn',
            isShow: true,
          },
          {
            label: '质检员',
            value: 'userName',
            isShow: true,
          },
          {
            label: '平台',
            value: 'platform',
          },
          {
            label: '渠道id',
            value: 'channel',
          },
          {
            label: '应用版本',
            value: 'version',
          },
          {
            label: '版本时间',
            value: 'finalOnlineTime',
          },
          {
            label: '创建时间',
            value: 'addTime',
          },
          {
            label: '更新时间',
            value: 'updateTime',
          },
          {
            label: '合包数量',
            value: 'merge',
          },
          {
            label: '备注',
            value: 'remark',
          },
        ];
        this.searchKey = 'standardName';
        this.addDefaultTitle();
      }
      this.searchApp();
      // if (this.stepVal === 5) {
      //   this.getAPPs({
      //     keyword: '',
      //     appStatus: this.stateValue,
      //     packageStatus: null,
      //   });
      // } else {
      //   this.getAPPs({
      //     keyword: '',
      //     packageStatus: this.stateValue,
      //   });
      // }
    },
    isGet() {
      console.log(666);
      this.getAPPs();
    },
    showMissionMadal() {
      if (this.showMissionMadal) {
        let p;
        if (this.stepVal === 5) {
          p = this.stepVal;
        } else if (this.stepVal === 3) {
          p = 7;
        } else {
          p = this.stepVal + 1;
        }
        const params = {
          view: p,
          callback: (res) => {
            res.forEach((item) => {
              item.label = `${item.name}(${item.unCount})`;
              item.value = item.id;
              this.fib3(item);
            });
            this.groupTree = res;
          },
        };
        if (this.missionPower === 1) {
          // 任务分发
          this.getManualUser(params);
          this.dataGroup = [];
          this.personSelect = [];
        } else if (this.missionPower === 2) {
          params.userId = JSON.parse(this.userInfo).userId;
          this.getApplyDataNum(params);
          this.dataGroup = [];
          this.personSelect = [];
        }
      }
    },
  },
  beforeDestroy() {
//  离开的时候还原初始状态
    this.$store.state.stepVal = 0;
    this.$store.state.showDetails = false;
  },
};
</script>
