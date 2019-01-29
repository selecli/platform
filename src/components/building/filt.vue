<template>
    <div style="margin-bottom:5px;">
        <Row>
            <Col span="5">
              <Select  v-model="filt.type" @on-change="change">
                <Option v-for="item in data1" :value="item.value" :key="item.value">{{item.label}}</Option>
              </Select>
            </Col>
            <Col span="5" offset="1">
              <Select  v-model="filt.relation" @on-change="change">
                <Option v-for="item in data2" :value="item.value" :key="item.value">{{item.label}}</Option>
              </Select>
            </Col> 
            <Col span="7" offset="1">
                <Input v-model="filt.tag" @on-keyup="change" v-if="appear"></Input>
                <Cascader :data="tdTypeTree" v-model="value5" v-if="!appear" filterable @on-change="changeTag" :render-format="format" change-on-select></Cascader>
            </Col>
            <Col span="1" style="line-height:32px;" offset="1">
                <Icon type="trash-a"  style="font-size:20px; cursor:pointer;" @click.native="remove"></Icon>
            </Col>
        </Row> 
        
    </div>
</template>


<script>
  import { mapState, mapActions } from 'vuex';
  
  export default {
    name: 'filters',
    data() {
      return {
        value1: '',
        value2: '',
        value3: '',
        isShow: false,
        appear: true,
        treeData: [],
        value5: [],
        data1: [
          { value: 'metaid', label: 'metaid' },
          { value: 'app_name', label: '名称' },
          { value: 'app_category', label: 'TDType' },
          { value: 'update_time', label: 'APP更新日期' },
        ],
        data2: [
          { value: 'include', label: '包含' },
          { value: 'exclude', label: '不包含' },
          { value: 'equal', label: '等于' },
          { value: 'unequal', label: '不等于' },
          { value: 'start', label: '开头是' },
          { value: 'end', label: '结尾是' },
          { value: 'null', label: '为空' },
          { value: 'unnull', label: '不为空' },
        ],
        condition: {},
      };
    },
    props: ['filt'],
    methods: {
      ...mapActions([
        'mapperImplTree',
      ]),
      change() {
        this.filt.tag = this.filt.tag.trim();
        this.condition = { type: this.filt.type, relation: this.filt.relation, tag: this.filt.tag };
        this.$emit('change', this.condition);
        if (this.filt.type === 'app_category') {
          this.appear = false;
          this.mapperImplTree({ systemId: -1 });
        } else {
          this.appear = true;
        }
      },
      remove() {
        this.$emit('removeComponent');
      },
      fib(arr, c) {
        arr.forEach((item) => {
          if (item.value === c) {
            this.filt.tag = item.label;
          } else {
            this.fib(item.children, c);
          }
        });
      },
      changeTag(val) {
        const v = val[val.length - 1];
        this.fib(this.tdTypeTree, v);
        this.filt.tag = this.filt.tag.trim();
        this.condition = { type: this.filt.type, relation: this.filt.relation, tag: this.filt.tag };
        this.$emit('change', this.condition);
      },
      format() {
        return this.filt.tag;
      },
    },
    computed: mapState([
      'editRuleTime',
      'tdTypeTree',
    ]),
    mounted() {
      this.condition = { a: this.value1, b: this.value2, c: this.value3 };
      if (this.filt.type === 'app_category') {
        this.appear = false;
        this.mapperImplTree({ systemId: -1 });
      } else {
        this.appear = true;
      }
    },
    watch: {
      editRuleTime() {
      //  console.log(this.filt);
      },
    },
  };
</script>

