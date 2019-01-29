<template>
    <div class="outcome-container clearfix" style="height:100%;">
        <div class="workflow-sideBar" style="border-right:1px solid #cde2f7">
            <Tree :data="systemData"  @on-select-change="selectChange"></Tree>  
        </div>
        <div class="widthLittle outcome-list" style="float:left; padding:10px;">
          <Row style="margin-bottom:10px;">
              <Col span="3">
                  <Select v-model="type" @on-change="changeType">
                    <Option v-for="item in typeList" :key="item.value" :value="item.value">{{item.label}}</Option>
                  </Select>
              </Col>
              <Col span="3" style="margin-left:20px;">
                  <Input placeholder="请输入" icon="ios-search" @on-click="search" v-model="content" @on-enter="search"></Input>
              </Col>
          </Row> 
          <list></list>
        </div>
        
    </div>
</template>
<script>
    import { mapState, mapActions } from 'vuex';
    import list from '../workflow/list';

    export default {
      name: 'outcome',
      data() {
        return {
          isCollapsed: false,
          content: '',
          type: '',
          tree: [
            { title: 'p1', children: [{ title: 'pp1' }] },
            { title: 'p2' },
            { title: 'p3' },
          ],
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
              label: '包名',
              value: 'pkgName',
            },
            {
              label: 'hash',
              value: 'pkgHash',
            },
            {
              label: '定制分类',
              value: 'mapperTagName',
            },
            {
              label: '定制类型',
              value: 'customType',
            },
          ],
        };
      },
      computed: {
        ...mapState([
          'systemData',
          'filterParams',
        ]),
      },
      methods: {
        ...mapActions([
          'resultList',
          'tdTagResult2',
        ]),
        selectChange(val) {
          this.$store.state.currentPage = 1;
          this.resultList({ systemId: val[0].id });
          this.$store.state.systemId = val[0].id;
        },
        search() {
          if (this.type !== '' && this.content !== '') {
            const p = {};
            p[this.type] = this.content;
            this.$store.state.filterParams = p;
            this.resultList(this.filterParms);
            this.$store.state.currentPage = 1;
          }
        },
        changeType(val) {
          this.type = val;
          this.$store.state.currentPage = 1;
        },
      },
      components: {
        list,
      },
      mounted() {
        this.tdTagResult2();
        this.resultList({ systemId: null });
        console.log(this.systemData);
      //  this.resultList({systemId:});
      },
    };
</script>

