<template>
    <div>
      <div v-if="this.$router.currentRoute.name === 'building'">
        <div v-if="this.watchName === '规则列表' || this.watchName === '默认'" >
          <div style="margin-bottom:10px;">
              <span>规则名称：</span>
              <span>(体系 -  名称)</span>
          </div>
          <Row style="margin-bottom:10px;">
            <Col span="5">
              <Select v-model="ruleInfo.mapperSystemId" @on-change="changeTree">
                <Option v-for="item in systemData" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </Col>
            <Col span="13" offset="1">
              <Cascader :data="treeData"  filterable  @on-change="changeTags" :render-format="format2"></Cascader>
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
          <div style="margin-bottom:10px;">筛选条件：</div>
          <filter-box v-for="(item, index) in conditions" :key="index" @add="add" @remove="remove(index)" @change="change($event, index)" ref="reset" :edit="item"></filter-Box>
          <div style="height:0; border-bottom:1px dashed #ccc; margin-top:5px; margin-bottom:10px;"></div>
          <Row>
            <Col span="5" style="line-height:32px;">请选择映射表:</Col>
            <Col span="7">
              <Select v-model="ruleInfo.mapJudgement">
                  <Option :value="-1">无</Option>
                  <Option v-for="item in mapperList" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </Col>
            <Col span="2" offset="2" style="line-height:32px;">定时：</Col>
            <Col span="5">
              <Select v-model="ruleInfo.renewCycle">
                  <Option :value="0">无</Option>
                  <Option :value="1">日更新</Option>
                  <Option :value="2">周更新</Option>
                  <Option :value="3">月更新</Option>
              </Select>
            </Col>   
          </Row> 
        </div>
        <div v-if="this.watchName === '定制分类' || this.watchName === 'result' || this.watchName === '高级筛选'"> 
          <Row style="margin-bottom:10px; line-height:32px;">
            <Col span="3">
              <span>TDtype:</span>
            </Col>
            <Col span="19">
              <span>{{editJwoodInfo.appCategory}}</span>
            </Col>
            <!-- <Col span="7">
              <span>参考网址:</span>
              <span>{{editJwoodInfo.referenceUrl}}</span>
              <a :href="editJwoodInfo.referenceUrl" target="_blank">
                <Button type="primary">跳转</Button>
              </a>
            </Col>   -->
          </Row>
          <Row style="margin-bottom:10px; line-height:32px;" v-if="editJwoodInfo.referenceUrl !== ''">
            <Col span="3">
              <span>参考网址:</span>
            </Col>
            <Col span="15" >
              <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                <span>{{editJwoodInfo.referenceUrl}}</span>
              </div> 
            </Col>
            <Col span="3">
              <a :href="editJwoodInfo.referenceUrl" target="_blank">
                <Button type="primary">跳转</Button>
              </a>
            </Col>
          </Row> 
          <Row style="line-height:32px;">
            <Col span="3">
              <span>定制分类:</span>
            </Col>
            <Col span="10">
              <Cascader :data="treeData" @on-change="changeTags" filterable :render-format="format2" ></Cascader>
            </Col>  <!-- <Input v-model="editJwoodInfo.appCategory" style="width:200px;"></Input> -->
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
          <Row class="common-margin-top-15">
            <Col span="24">
              <RadioGroup v-model="animal" @on-change="changeStatus">
                <Radio :label="-1" style="margin-right:30px;">无</Radio>
                <Radio :label="4" style="margin-right:30px;">加入黑名单</Radio>
                <Radio :label="5" style="margin-right:30px;">加入白名单</Radio>
                <Radio :label="1" style="margin-right:30px;">锁定清单</Radio>
              </RadioGroup>
            </Col>
          </Row>
        </div>
      </div>
      <div v-if="this.$router.currentRoute.name === 'independent'">
        <Row  class="common-margin-top-15">
          <Col span="3">包名:</Col>  
          <Col span="20">{{editJwoodInfo.pkgName}}</Col>
        </Row>
        <Row  class="common-margin-top-15">
          <Col span="3">hash:</Col>  
          <Col span="20">{{editJwoodInfo.pkgHash}}</Col>
        </Row>
        <Row style="line-height:32px;" class="common-margin-top-15">
          <Col span="3">名称:</Col>  
          <Col span="15">
            <Input v-model="editJwoodInfo.appName"></Input> 
          </Col>
        </Row>
        <Row style="line-height:32px;" class="common-margin-top-15">
          <Col span="3">参考网址:</Col>  
          <Col span="15">
            <Input v-model="editJwoodInfo.referenceUrl"></Input> 
          </Col>
          <Col span="4" offset="2"><Button type="primary">跳转</Button></Col>
        </Row>
        <Row class="common-margin-top-15" style="line-height:32px;">
          <Col span="3">
            <span>TDtag:</span>
          </Col>
          <Col span="15">
             <Cascader :data="treeData" @on-change="changeTags" :render-format="format2"></Cascader>
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
  import filterBox from './filterBox';

  export default {
    name: 'customEdit',
    data() {
      return {
        isShow: false,
        conditions: [[{ type: '', relation: '', tag: '' }]],
        single: false,
        systemVal: '',
        customVal: '',
        optionData: [],
        n: 1,
        treeData: [],
        treeValue: [],
        mapperValue: -1,
        mapperList: [],
        updateVal: -1,
        animal: '',
        tagList: [],
        treeList: [],
        treeName: '',
      };
    },
    computed: mapState([
      'condition',
      'systemData',
      'allData',
      'mapperData',
      'ruleInfo',
      'mapperTagIds',
      'watchName',
      'editJwoodInfo',
      'allTreeData',
      'editRuleTime',
      'allConditions',
    ]),
    mounted() {
      if (this.$router.currentRoute.name === 'building') {
        this.tdTagResult2();
        // this.mapperImplTree({ systemId: 2 });
        this.jmMapperRelationsResult2();
      //  this.getResultData();
      } else if (this.$router.currentRoute.name === 'independent') {
        this.tdTree();
      }
    },
    methods: {
      ...mapActions([
        'tdTagResult2',
        'mapperImplTree',
        'jmMapperRelationsResult2',
        'getResultData',
        'tdTree',
        'jwResultData',
      ]),
      ...mapMutations([
        'changeCondition',
      ]),
      add() {
        this.conditions.push([{ type: '', relation: '', tag: '' }]);
      },
      changeStatus(val) {
        // if (this.watchName === '定制分类') {
        //   this.editJwoodInfo.customType = val;
        // } else if (this.watchName === 'result') {
        //   this.editJwoodInfo.s = val;
        // }
        this.editJwoodInfo.customType = val;
      },
      fib2(data, todo) {
        const that = this;
        data.forEach((item) => {
          if (todo === item.value) {
            that.treeName = item.name;
          } else {
            that.fib2(item.children, todo);
          }
        });
      },
      tags() {
        if (!this.editJwoodInfo.mapperTagId) {
          return false;
        }
        return true;
      },
      changeTags(val) {
        const v = val[val.length - 1];
        console.log(this.treeData, v);
        this.fib2(this.treeData, v);
        this.$emit('changeTags', v);
        console.log(val);
        const temp = {
          name: this.treeName,
          id: v,
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
        let nameStr = '';
        let idStr = '';
        this.tagList.forEach((item) => {
          nameStr += `${item.name},`;
          idStr += `${item.id},`;
        });
        console.log(nameStr, idStr);
        this.editJwoodInfo.mapperTagName = nameStr.substring(0, nameStr.length - 1);
        this.editJwoodInfo.mapperTagId = idStr.substring(0, idStr.length - 1);
        console.log(this.editJwoodInfo);
      },
      delTag(id) {
        this.tagList.forEach((item, index) => {
          if (item.id === id) {
            this.tagList.splice(index, 1);
          }
        });
        let nameStr = '';
        let idStr = '';
        this.tagList.forEach((item) => {
          nameStr += `${item.name},`;
          idStr += `${item.id},`;
        });
        console.log(nameStr, idStr);
        this.editJwoodInfo.mapperTagName = nameStr.substring(0, nameStr.length - 1);
        this.editJwoodInfo.mapperTagId = idStr.substring(0, idStr.length - 1);
      },
      remove(index) {
        this.conditions.splice(index + 1);
      //  this.changeCondition(this.conditions);
        this.condition.filterCondition = this.conditions;
      },
      changeTree() {
        // const id = this.ruleInfo.mapperSystemId === 1 ? -1 : this.ruleInfo.mapperSystemId;
        console.log(this.ruleInfo.mapperSystemId);
        const id = this.ruleInfo.mapperSystemId;
        if (id !== '') {
          this.mapperImplTree({ systemId: id });
        }
        this.ruleInfo.mapperTagId = [];
      },
      change() {
        this.condition.filterCondition = this.conditions;
      },
      reset() {
        this.conditions = [[{ type: '', relation: '', tag: '' }]];
        this.ruleInfo.mapperSystemId = '';
        this.ruleInfo.mapperTagId = [];
        this.tagList = [];
        this.editJwoodInfo.mapperTagId = '';
        this.ruleInfo.mapJudgement = '';
        this.ruleInfo.renewCycle = '';
      },
      // format(val) {
      //   if (this.ruleInfo.mapperTagName !== '') {
      //     return this.ruleInfo.mapperTagName;
      //   }
      //   return val.join('/');
      // },
      format2() {
        return '';
      },
      ruleMethods(val) {
        this.isShow = val;
      },
      type() {
        this.condition.tdtypeVal = this.systemVal;
        this.codition.tdClass = this.customVal;
      },
      fib(item) {
        if (item.children.length) {
          item.children.forEach((todo) => {
            todo.label = todo.name;
            todo.value = String(todo.id);
            this.fib(todo);
          });
        }
      },
    },
    components: {
      filterBox,
    },
    watch: {
      allData() {
        this.treeData = this.allData;
        this.treeData.forEach((item) => {
          item.label = item.name;
          item.value = String(item.id);
          this.fib(item);
        });
      },
      editRuleTime() {
        this.conditions = this.condition.filterCondition;
      },
      allTreeData() {
        this.treeList = this.allTreeData;
        this.treeList.forEach((item) => {
          item.label = item.name;
          item.value = String(item.id);
          this.fib(item);
        });
      },
      mapperData() {
        this.mapperList = this.mapperData;
      //  this.getResultData();
      },
      allConditions() {
        this.conditions = [[{ type: '', relation: '', tag: '' }]];
      },
      editJwoodInfo() {
        const name = this.editJwoodInfo.mapperTagName;
        const id = this.editJwoodInfo.mapperTagId;
      //  const type = this.editJwoodInfo.customType;
        if (this.watchName === '定制分类') {
          this.animal = this.editJwoodInfo.filterId;
        } else if (this.watchName === 'result') {
          // if (type === 5 || type === 6 || type === 7 || type === 4) {
          //   this.animal = -1;
          // } else {
          //   this.animal = type;
          // }
          this.animal = this.editJwoodInfo.filterId;
        }
        this.animal = this.editJwoodInfo.filterId;
        const result = [];
        console.log(id, typeof id);
        if (id === '' || id === null) {
          this.tagList = [];
        } else if (id.indexOf(',') !== -1) {
          name.split(',').forEach((item) => {
            result.push({ name: item, id: 0 });
          });
          id.split(',').forEach((item, index) => {
            result[index].id = item;
          });
          console.log(this.tagList);
          this.tagList = result;
        } else {
          this.tagList = [{
            name: this.editJwoodInfo.mapperTagName,
            id: this.editJwoodInfo.mapperTagId,
          }];
        }
      },
    },
  };
</script>

