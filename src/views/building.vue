<template>
  <div class="building-container clearfix" :style="{padding: barShow ? '0' : '10px 15px'}">
    <div class="workflow-sideBar" style="border-right:1px solid #cde2f7" v-if="barShow">
        <Tree :data="systemData"  @on-select-change="selectChange"></Tree>  
    </div>
    <div style="float:left; padding:10px; height:100%;" :class="{widthLittle: barShow, widthMore: !barShow}">
      <div v-if="watchName === '默认'" class="clearfix">
          <div class="building-header" style="float:left;">
            <span @click="screen" class="pt">高级筛选</span>
            <span class="building-header-line"></span>
            <Poptip v-model="visible" trigger="hover" placement="right-start">
                <span class="pt">定制规则</span>
                <div slot="title" @click="exist" class="pt">已有规则</div>
                <div slot="content" @click="create" class="pt">
                  新建规则
                </div>
            </Poptip>
          </div>
          <div class="" style="float:right;">
            <Button type="primary" @click="scan" >查看全部</Button>
          </div>
      </div>
      <div v-if="watchName === 'result'" class="clearfix">
          <!-- <Button type="primary" @click="back">上传</Button> -->
          <!-- <div class="" style="float:right; margin-bottom:10px;">
            <Button type="primary" @click="back">返回</Button>
          </div> -->
          <div>
            <Row style="float:left; width:500px;">
              <Col span="6">
                  <Select v-model="type" placeholder="请选择查询字段" >
                    <Option v-for="item in typeList" :key="item.value" :value="item.value">{{item.label}}</Option>
                  </Select>
              </Col>
              <Col span="6" style="margin-left:20px;">
                  <Input placeholder="请输入" icon="ios-search" @on-click="search" v-model="content" @on-enter="search"></Input>
              </Col>
            </Row>
            <div class="" style="float:right; margin-bottom:10px;">
              <Button type="primary" @click="back">返回</Button>
            </div>
          </div>
      </div>
      
      
      <div v-if="watchName === '高级筛选'" class="data-details-title">
          <Button type="text" icon="chevron-left" @click="back"></Button>
          <!-- <Icon  type="chevron-left" style="font-size:30px;"></Icon> -->
          高级筛选
      </div>
      <div v-if="watchName === '定制分类'" class="clearfix">
          <div class="data-details-title" style="margin-top:0;">
            <Button type="text" icon="chevron-left" @click="backRuleList"></Button>
            <!-- <Icon  type="chevron-left" style="font-size:30px;"></Icon> -->
            定制分类详情页
          </div>
          <div class="clearfix" style="margin-bottom:10px;">
            <Row style="float:left; width:500px;">
              <Col span="6">
                  <Select v-model="type" placeholder="请选择查询字段" key="name1">
                    <Option v-for="item in typeList" :key="item.value" :value="item.value">{{item.label}}</Option>
                  </Select>
              </Col>
              <Col span="6" style="margin-left:20px;">
                  <Input placeholder="请输入" icon="ios-search" @on-click="search" v-model="content" @on-enter="search" key="name11"></Input>
              </Col>
            </Row>
             <div style="float:right;">
                <Button type="primary"  @click="remove2" style="margin-right:20px;">删除</Button>
                <Button type="primary"  @click="result" :disabled="disabledBtn.indexOf('发布') !== -1">
                  <span v-show="disabledBtn.indexOf('发布') === -1">发布</span>
                  <span v-show="disabledBtn.indexOf('发布') !== -1">({{num}})</span>
                </Button>
              </div> 
          </div>
         
      </div>
      <div v-if="watchName === '规则列表'" class="clearfix">
        <div  class="data-details-title" style="margin-top:0;">
          <Button type="text" icon="chevron-left" @click="back"></Button>
          <!-- <Icon  type="chevron-left" style="font-size:30px;"></Icon> -->
          规则详情
        </div>
        <div class="clearfix">
          <Button type="primary" style="margin:0 10px 15px 0" @click="createRule">新建</Button>
          <Button type="primary" class="common-float-right" @click="perform" :disabled="disabledBtn.indexOf('执行') !== -1">
              <span v-show="disabledBtn.indexOf('执行') === -1">执行</span>
              <span v-show="disabledBtn.indexOf('执行') !== -1">({{num}})</span>
          </Button>
        </div>
      </div>
      
      
      <div class="building-list">
        <List ref="list"></List>
      </div>
    </div>
    
    <Modal
        v-model="modal"
        :title="title"
        @on-ok="ok"
        @on-cancel="cancel"
        scrollable
        ref="modal"
    >
        <component :is="currentComponent" ref="reset"></component> 
        <!-- <CustomEdit ref="reset"></CustomEdit> -->
    </Modal> 
  </div>
</template>

<script>

import { mapState, mapActions } from 'vuex';
import List from '../components/workflow/list';
import CustomEdit from '../components/building/customEdit';
import edit from '../components/building/edit';

export default {
  name: 'home',
  data() {
    return {
      visible: false,
      modal: false,
      title: '',
      aa: false,
      componentName: 'CustomEdit',
      content: '',
      name: '',
      type: '',
      barShow: false,
      typeList: [
        {
          label: 'metaid',
          value: 'metaid',
        },
        {
          label: '名称',
          value: 'appName',
        },
        {
          label: 'TDtype',
          value: 'appCategory',
        },
        {
          label: '定制分类',
          value: 'mapperTagName',
        },
      ],
      num: 5,
    };
  },
  computed: {
    ...mapState([
      'projectName',
      'filterObj',
      'itemsData',
      'condition',
      'dateTime',
      'watchName',
      'ruleInfo',
      'userInfo',
      'isShow',
      'mapperTagIds',
      'listArr',
      'systemData',
      'filterParams',
      'disabledBtn',
      'editJwoodInfo',
    ]),
    currentComponent() {
      return this.componentName;
    },
  },
  mounted() {
    // this.$store.state.projectName = '海纳平台';
    // this.$store.state.filterObj = {};
    this.$store.state.watchName = '默认';
    this.jwResultData();
    this.tdTagResult2();
  },
  methods: {
    ...mapActions([
      'isLogin',
      'getResultData',
      'mapperImplTree',
      'jmHighChoose',
      'jmRules',
      'jmRulesList',
      'jmMiddleDatasRuleed',
      'jmRulesRemove',
      'jmHighChooseAndSave',
      'jmMiddleDatas',
      'resultListAdd',
      'resultList',
      'tdTagResult2',
      'jmImplement',
      'groupByMetaid',
      'allResultList',
      'jwResultData',
    ]),
    screen() {
      this.modal = true;
      this.title = '高级筛选';
      this.componentName = 'CustomEdit';
      this.name = '高级筛选';
      this.$refs.reset.reset();
    },
    selectChange(val) {
      this.$store.state.currentPage = 1;
      this.$store.state.filterParams.systemId = val[0].id;
      this.allResultList({ systemId: val[0].id });
    },
    scan() {
      this.$store.state.currentPage = 1;
      this.barShow = true;
      this.$store.state.watchName = 'result';
      this.allResultList({ systemId: null });
    },
    perform() {
      if (this.listArr.length) {
        const arr = [];
        this.listArr.forEach((item) => {
          arr.push(item.id);
        });
        const p = JSON.stringify(arr);
        this.jmImplement({ ruleIds: p });
        if (this.listArr.length > 1) {
          this.$refs.list.perform();
        }
        this.disabledBtn.push('执行');
        this.updateTime('执行');
      } else {
        this.$Message.warning('请选择要执行的规则');
      }
    },
    updateTime(name) {
      clearInterval();
      const time = setInterval(() => {
        if (this.num > 0) {
          this.num -= 1;
        } else {
          clearInterval(time);
          const index = this.disabledBtn.indexOf(name);
          this.$store.state.disabledBtn.splice(index, 1);
        }
      }, 1000);
    },
    remove2() {
      if (this.listArr.length > 0) {
        const arr = [];
        this.listArr.forEach((item) => {
          arr.push(item.id);
        });
        const str = JSON.stringify(arr);
        this.jmMiddleDatas(str);
      } else {
        this.$Message.warning('请选择要删除的数据');
      }
    },
    result() {
      this.resultListAdd();
      this.disabledBtn.push('发布');
      this.updateTime('发布');
    },
    search() {
      if (this.type !== '' && this.content !== '') {
      //  const str = { this.type: this.content };
      //  this.$store.state.filterParams = eval('('+str+')');
        this.$store.state.currentPage = 1;
        const p = {};
        p[this.type] = this.content;
        this.$store.state.filterParams = p;
        if (this.watchName === '定制分类') {
          this.groupByMetaid(this.filterParams);
        } else if (this.watchName === 'result') {
          this.allResultList(this.filterParams);
        }
      //  this.type = '';
      //  this.content = '';
      }
    },
    aaa() {
      // const p = {
      //   mapperSystemId: 1,
      //   mapperTagId: 0,
      //   mapJudgement: -1,
      //   renewCycle: 0,
      //   userId: 33,
      //   ruleArray: '',
      // };
      this.jmMiddleDatasRuleed();
    },
    rule() {
      console.log(2);
    },
    exist() {
      this.visible = false;
      this.name = '规则列表';
      this.$store.state.watchName = '规则列表';
      this.$store.state.currentPage = 1;
      this.jmRulesList();
    },
    create() {
      this.$refs.reset.reset();
      this.$store.state.allConditions = [[{ type: '1', relation: '2', tag: '3' }]];
      this.$store.state.ruleInfo = {
        mapperSystemId: '',
        mapperTagId: [],
        mapJudgement: -1,
        renewCycle: 0,
        userId: 33,
        ruleArray: [],
        mapperTagName: '',
        id: -1,
      };
      // this.visible = false;
      this.componentName = 'edit';
      this.modal = true;
      this.title = '新建规则';
      this.name = '规则列表';
      this.$store.state.watchName = '默认';
    },
    createRule() {
      this.$refs.reset.reset();
      this.$store.state.allConditions = [[{ type: '1', relation: '2', tag: '3' }]];
      this.$store.state.ruleInfo = {
        mapperSystemId: '',
        mapperTagId: [],
        mapJudgement: -1,
        renewCycle: 0,
        userId: 33,
        ruleArray: [],
        mapperTagName: '',
        id: -1,
      };
      this.componentName = 'edit';
      this.modal = true;
      this.title = '新建规则';
      this.name = '规则列表';
    },
    ok() {
      this.$store.state.currentPage = 1;
      const userInfo = JSON.parse(this.userInfo);
    //  this.$refs.reset.reset();
      this.$store.state.dateTime = 2;
    //  this.$store.state.watchName = '高级筛选';
      if (this.name === '高级筛选') {
        if (this.isShow) {
          if (this.$refs.reset.tags()) {
            const params = {};
            params.userId = userInfo.userId;
            params.ruleArray = JSON.stringify(this.condition.filterCondition);
            params.mapperTagId = this.editJwoodInfo.mapperTagId;
            params.mapperSystemId = this.ruleInfo.mapperSystemId;
            console.log(params.mapperSystemId);
            params.mapJudgement = this.ruleInfo.mapJudgement;
            params.renewCycle = this.ruleInfo.renewCycle;
            this.jmHighChooseAndSave(params);
            // this.$refs.reset.reset();
          } else {
            this.modal = true;
            this.$refs.modal.visible = true;
            this.$Message.error('请选择标签');
          }
        } else {
          this.jmHighChooseAndSave({ ruleArray: JSON.stringify(this.condition.filterCondition) });
        }
        this.$store.state.watchName = '高级筛选';
      } else if (this.name === '规则列表') {
        if (this.$refs.reset.tags()) {
          this.$store.state.watchName = '规则列表';
          const params = {};
          params.userId = Number(userInfo.userId);
          params.ruleArray = JSON.stringify(this.condition.filterCondition);
          params.mapperTagId = this.editJwoodInfo.mapperTagId;
          params.renewCycle = Number(this.ruleInfo.renewCycle);
          params.mapperSystemId = this.ruleInfo.mapperSystemId;
          params.mapJudgement = this.ruleInfo.mapJudgement;
          this.jmRules(params);
          // this.$refs.reset.reset();
        } else {
          this.modal = true;
          this.$refs.modal.visible = true;
          this.$Message.error('请选择标签');
        }
      }
    //  this.$store.state.isShow = false;
    },
    cancel() {
      this.$store.state.isShow = false;
      this.$store.state.dateTime = 2;
      this.$refs.reset.reset();
    },
    change() {
      this.aa = true;
    },
    back() {
      this.$store.state.currentPage = 1;
      this.$store.state.watchName = '默认';
      this.barShow = false;
      this.jwResultData();
      //  this.$refs.reset.reset();
    },
    backRuleList() {
      this.$store.state.watchName = '规则列表';
      this.jmRulesList();
    },
  },
  components: {
    List,
    CustomEdit,
    edit,
  },
  watch: {
    dateTime() {
      console.log(666);
    },
    watchName() {
      this.type = '';
      this.content = '';
      this.$store.state.filterParams = {};
    },
    route() {
      console.log(66666);
    },
  },
};
</script>
