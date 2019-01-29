<template>
  <div>
    <div v-if="configName === '1' || configName === '2'">
      <div v-if="jwoodTags.length === 2 && jwoodTags[0].name === '标签体系'">
        <div class="add-name common-margin-top-15">
          <span class="config-add-txt">体系名称：</span>
          <Input v-model="jwoodTagInfo.name" placeholder="请输入..." style="width: 380px;"></Input>
        </div>
        <div class="add-description common-margin-top-15">
          <span class="config-add-txt">体系描述：</span>
          <Input v-model="jwoodTagInfo.description" placeholder="请输入..." style="width: 380px;"></Input>
        </div>
      </div>
      <div v-if="jwoodTags.length === 2 && jwoodTags[0].name === 'BaseCode'">
        <div class="add-name common-margin-top-15">
          <span class="config-add-txt">体系名称：</span>
          <Input v-model="jwoodTagInfo.name" placeholder="请输入..." style="width: 380px;"></Input>
        </div>
        <div class="add-description common-margin-top-15">
          <span class="config-add-txt">体系描述：</span>
          <Input v-model="jwoodTagInfo.description" placeholder="请输入..." style="width: 380px;"></Input>
        </div>
        <div class="add-description common-margin-top-15">
          <span class="config-add-txt">映射体系：</span>
          <Select style="width: 380px;" v-model="jwoodTagInfo.systemId">
            <Option v-for="item in optionData" :key="item.id" :value="item.value">{{item.label}}</Option>
          </Select>
        </div>
      </div>
      <div  v-if="jwoodTags.length !== 2 && jwoodTags[0].name === '标签体系'">
        <div class="add-name common-margin-top-15">
          <span class="config-add-txt">标签名称：</span>
          <Input v-model="jwoodTagInfo.name" placeholder="请输入..." style="width: 380px;"></Input>
        </div>
        <div class="add-description common-margin-top-15">
          <span class="config-add-txt">标签描述：</span>
          <Input v-model="jwoodTagInfo.description" placeholder="请输入..." style="width: 380px;"></Input>
        </div>
        <div class="add-code common-margin-top-15">
          <span class="config-add-txt">标签code：</span>
          <Input v-model="jwoodTagInfo.code" placeholder="请输入..." style="width: 380px;"></Input>
        </div>
        <div class="add-code common-margin-top-15">
          <span class="config-add-txt">标签id：</span>
          <Input v-model="jwoodTagInfo.sid" placeholder="请输入..." style="width: 380px;"></Input>
        </div>
        <!-- <div class="add-code common-margin-top-15">
          <span>英文名称：</span>
          <Input v-model="jwoodTagInfo.nameEn" placeholder="请输入..." style="width: 400px;"></Input>
        </div> -->
      </div>
      <div  v-if="jwoodTags.length !== 2 && jwoodTags[0].name === 'BaseCode'">
        <Row>
          <Col span="12">
            <Row>
              <Col span="6" style="line-height:32px;">
                <span>TDtype:</span>
              </Col>
              <Col span="14">
                <Cascader :data="data1" v-model="value1" @on-change="change1" filterable change-on-select></Cascader>
              </Col>
            </Row>
          </Col>
          <Col span="12">
            <Row>
              <Col span="6" style="line-height:32px;">
                <span>TDtag:</span>
              </Col>
              <Col span="14">
                <Cascader :data="data2" v-model="value2" @on-change="change2" filterable change-on-select></Cascader>
              </Col>
            </Row>
          </Col>
        </Row> 
        <Row style="margin-top:30px; text-align:center;">
          <Col span="6" offset="2">
            <span>{{tdtypeData.tdtypeVal}}</span>
            <div class="config-devider" style="height:1px;  background:#000;"></div>
          </Col>
          <Col span="6" style="text-align:center;"><i class="iconfont icon-ni" style="font-size:24px;"></i></Col>
          <Col span="6">
            <span>{{tdtypeData.mapperVal}}</span>
            <div class="config-devider" style="height:1px;  background:#000;"></div>
          </Col>  
        </Row> 
      </div>
    </div>
    <div v-if="configName === '3' || configName === '4' || configName === '5'">
      <Row>
        <Col span="3" style="line-height:32px;">
          <span>metaid：</span>
        </Col>  
        <Col span="18">
          <Input v-model="configList.metaid" placeholder="请输入..."></Input>
        </Col>
      </Row>
      <Row class="common-margin-top-15">
        <Col span="3" style="line-height:32px;">
          <span>定制分类：</span>
        </Col>  
        <Col span="18">
          <Cascader :data="treeList" v-model="configList.tree" @on-change="changeTags" filterable change-on-select></Cascader>
        </Col>
      </Row>
      <Row class="common-margin-top-15">
        <Col>
            <div class="edit-right-tags common-float-left">
                <span v-for="tag in tagList" :key="tag.id" @click="delTag(tag.id)">
                {{tag.name}}
                <Icon type="close-circled" class="edit-right-tags-icon"></Icon>
              </span>
            </div>
        </Col>  
      </Row> 
    </div>
  </div>
</template>

<script>

import { mapState, mapActions, mapMutations } from 'vuex';

export default {
  name: 'add',
  data() {
    return {
      optionData: [],
      value1: [],
      value2: [],
      data1: [],
      data2: [],
      treeList: [],
      tagList: [],
      treeName: '',
    };
  },
  computed: mapState([
    'jwoodTags',
    'jwoodTagInfo',
    'systemData',
    'tdTypeTree',
    'otherTree',
    'tdtypeData',
    'configName',
    'allTreeData',
    'configList',
  ]),
  mounted() {
  },
  methods: {
    ...mapActions([
      'tdTagResult',
    ]),
    ...mapMutations([
    ]),
    fib(item) {
      if (item.children.length) {
        item.children.forEach((todo) => {
          todo.label = todo.name;
          todo.value = String(todo.id);
          this.fib(todo);
        });
      }
    },
    fib3(arr, c) {
      arr.forEach((item) => {
        if (item.value === c) {
          this.$store.state.tdtypeData.tdtypeVal = item.label;
        } else {
          this.fib3(item.children, c);
        }
      });
    },
    fib4(arr, c) {
      arr.forEach((item) => {
        if (item.value === c) {
          this.treeName = item.label;
        } else {
          this.fib4(item.children, c);
        }
      });
    },
    delTag(id) {
      this.tagList.forEach((item, index) => {
        if (item.id === id) {
          this.tagList.splice(index, 1);
        }
      });
    },
    add() {
      this.tagList = [];
      this.configList.tree = [];
      this.$store.state.jwoodTagInfo = {
        name: '',
        description: '',
        code: '',
        nameEn: '',
        userId: '',
        userName: '',
        systemId: 2,
        sid: '',
      };
    },
    changeTags(val) {
      this.fib4(this.treeList, val[val.length - 1]);
      const temp = {
        name: this.treeName,
        id: val[val.length - 1],
      };
      const arr = [];
      this.tagList.forEach((item) => {
        arr.push(item.name);
      });
      if (arr.indexOf(temp.name) === -1) {
        this.tagList.push(temp);
      } else {
        this.$Message.warning('所选标签已经存在');
      }
    },
    fib2(arr, c) {
      arr.forEach((item) => {
        if (item.value === c) {
        //  this.$store.state.mapperData.mapperVal = item.label;
          this.$store.state.tdtypeData.mapperVal = item.label;
        } else {
          this.fib2(item.children, c);
        }
      });
    },
    change1(val) {
      this.$store.state.tdtypeData.tdtypeId = val[val.length - 1];
      // this.data1.forEach((item) => {
      //   if (item.id === val[0]) {
      //     if (item.id === val[val.length - 1]) {
      //       this.$store.state.tdtypeData.tdtypeVal = item.label;
      //     } else {
      //       this.fib3(item.children, val[val.length - 1]);
      //     }
      //   }
      // });
      this.fib3(this.data1, val[val.length - 1]);
    },
    change2(val) {
      this.$store.state.tdtypeData.mapperId = val[val.length - 1];
      // this.data2.forEach((item) => {
      //   if (item.id === val[0]) {
      //     if (item.id === val[val.length - 1]) {
      //       this.$store.state.tdtypeData.mapperVal = item.label;
      //     } else {
      //       this.fib2(item.children, val[val.length - 1]);
      //     }
      //   }
      // });
      // console.log(this.mapperVal2);
      this.fib2(this.data2, val[val.length - 1]);
      console.log(this.tdtypeData.mapperVal);
    },
  },
  components: {
  },
  watch: {
    systemData() {
      this.optionData = this.systemData;
    },
    tdTypeTree() {
      this.tdTypeTree.forEach((item) => {
        item.label = item.name;
        item.value = String(item.id);
        this.fib(item);
      });
      this.data1 = this.tdTypeTree;
    },
    otherTree() {
      this.otherTree.forEach((item) => {
        item.label = item.name;
        item.value = String(item.id);
        this.fib(item);
      });
      this.data2 = this.otherTree;
    },
    allTreeData() {
      this.treeList = this.allTreeData;
      this.treeList.forEach((item) => {
        item.label = item.name;
        item.value = String(item.id);
        this.fib(item);
      });
    },
  },
};
</script>
