<template>
    <div>
        <filt v-for="(item, index) in edit" :key="index" @change="change($event,index)" @removeComponent="removeComponent(index)" :filt="item"></filt>
        <Button type="text" @click="add" icon="plus" style="color:#2d8cf0;">添加筛选条件</Button>
        <Button type="text" @click="addor" :disabled="isDisabled" icon="plus" :style="{color: isDisabled ? '#ccc' : '#2d8cf0'}">or</Button>
        <div v-show="isShow" @click="remove" style="margin-bottom:10px; cursor:pointer;">
            <Row>
                <Col span="11">
                    <div style="height:0; border-top:1px dashed #ccc; margin-top:9px;"></div>
                </Col>
                <Col span="2" style="text-align:center;">OR</Col>
                <Col span="11">
                    <div style="height:0; border-top:1px dashed #ccc; margin-top:9px;"></div>
                </Col>
            </Row>
        </div>
        
        
    </div>
</template>


<script>
  import { mapState } from 'vuex';
  import filt from './filt';

  export default {
    name: 'customEdit',
    data() {
      return {
        count: [0], //  filter组件数量
        conditions: [], // 合并条件
        isShow: false,
        isDisabled: false,
      };
    },
    props: ['edit'],
    computed: mapState([
      'dateTime',
      'editRuleTime',
    ]),
    mounted() {
    },
    methods: {
      add() {
        this.edit.push({ type: '', relation: '', tag: '' });
        console.log(111);
      },
      change(val, index) {
      //  this.conditions[index] = val;
        this.edit[index] = val;
        console.log(this.edit);
      //  this.$emit('change', this.conditions);
        this.$emit('change');
      },
      addor() {
        this.isShow = true;
        this.isDisabled = true;
        this.$emit('add');
      },
      //  删除分割线
      remove() {
        this.isShow = false;
        this.isDisabled = false;
        this.$emit('remove');
      },
      removeComponent(index) {
        this.edit.splice(index, 1);
      },
      reset() {
        this.count = [0];
      },
    },
    components: {
      filt,
    },
    watch: {
      dateTime() {
        this.count = [0];
        this.isDisabled = false;
        this.isShow = false;
      },
      editRuleTime() {
        this.count = this.edit;
      },
    },
  };
</script>

