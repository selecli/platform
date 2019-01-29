<template>
    <div>
        <div style="margin-bottom:10px;">筛选条件：</div>
        <filter-box v-for="(item, index) in conditions" :key="index" @add="add" @remove="remove(index)" @change="change($event, index)" ref="reset" :edit="item"></filter-Box>
        <div style="height:0; border-bottom:1px dashed #ccc; margin-top:5px; margin-bottom:10px;"></div>
        <Row>
          <Col span="5" style="line-height:32px;">
              <Checkbox v-model="single" @on-change="ruleMethods">保存为规则</Checkbox>
          </Col>
          <Col span="7" v-if="isShow">
              <Select v-model="ruleInfo.mapperSystemId" @on-change="changeTree">
                <Option v-for="item in systemData" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
          </Col>  
          <Col span="7" offset="1" v-if="isShow">
              <Cascader :data="treeData" filterable @on-change="changeTags" :render-format="format2" ></Cascader>
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
</template>


<script>
  import { mapState, mapMutations, mapActions } from 'vuex';
  import filterBox from './filterBox';

  export default {
    name: 'customEdit',
    data() {
      return {
        conditions: [[{ type: '', relation: '', tag: '' }]],
        single: false,
        systemVal: '',
        customVal: '',
        treeData: [],
        tagList: [],
        aa: [],
        data: [{
          value: 'beijing',
          label: '北京',
          children: [
            {
              value: 'gugong',
              label: '故宫',
            },
            {
              value: 'tiantan',
              label: '天坛',
            },
            {
              value: 'wangfujing',
              label: '王府井',
            },
          ],
        }],
      };
    },
    computed: mapState([
      'condition',
      'ruleInfo',
      'systemData',
      'allData',
      'isShow',
      'editJwoodInfo',
    ]),
    mounted() {
    },
    methods: {
      ...mapActions([
        'mapperImplTree',
        'tdTagResult2',
      ]),
      ...mapMutations([
        'changeCondition',
      ]),
      add() {
        this.conditions.push([{ type: '', relation: '', tag: '' }]);
      },
      format2() {
        return '';
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
      change() {
      //  this.changeCondition(this.conditions);
        this.condition.filterCondition = this.conditions;
        console.log(this.condition);
      },
      reset() {
        this.conditions = [[{ type: '', relation: '', tag: '' }]];
        this.ruleInfo.mapperSystemId = '';
        this.ruleInfo.mapperTagId = [];
        this.tagList = [];
      },
      ruleMethods(val) {
        this.$store.state.isShow = val;
        this.tdTagResult2();
      },
      tags() {
        // if (this.ruleInfo.mapperTagId.length === 0) {
        //   return false;
        // }
        // return true;
        if (!this.editJwoodInfo.mapperTagId) {
          return false;
        }
        return true;
      },
      type() {
        this.condition.tdtypeVal = this.systemVal;
        this.codition.tdClass = this.customVal;
      },
      changeTree() {
        // const id = this.ruleInfo.mapperSystemId === 1 ? -1 : this.ruleInfo.mapperSystemId;
        const id = this.ruleInfo.mapperSystemId;
        if (id !== '') {
          this.mapperImplTree({ systemId: id });
        }
        this.ruleInfo.mapperTagId = [];
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
      searchTag(val, data) {
        console.log(val, data);
      //  this.ruleInfo.mapperTagId = val;
      },
    },
    components: {
      filterBox,
    },
    watch: {
      allData() {
        const arr = this.allData;
        if (arr.length) {
          arr.forEach((item) => {
            item.label = item.name;
            item.value = String(item.id);
            this.fib(item);
          });
        }
        this.treeData = arr;
      },
      isShow() {
        this.single = this.isShow;
      },
    },
  };
</script>

