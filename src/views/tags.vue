<template>
  <div class="tag-content">
    <div class="tag-filter">
      <!-- <div style="margin-bottom:20px;">
        <Button type="primary" @click="releaseVersionFunc">发布版本</Button>
      </div> -->
      <Row>
        <Col span="16" class="filter-left">
          <Select v-model="choosedTitles" placeholder="请选择要显示的字段" multiple @on-change="changeTitle" style="width: 200px;">
            <Option v-for="item in showTitles" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </Col>
        <Col span="8" class="filter-right">
          <Row>
            <Col span="8" >
              <DatePicker type="date" placeholder="选择日期" @on-change="chooseDate" v-show="showDatePicker"></DatePicker>
              <Input v-model="filterValue" placeholder="请输入..." @on-enter="searchBtn" v-show="!showDatePicker" ></Input>
            </Col>
            <Col span="8" style="margin-right:10px;">
              <Select v-model="filterKey" clearable @on-change="filterBtn">
                <Option v-for="item in filterList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Col>
            
            <!--<Col span="4">-->
              <!--<Button type="primary">结果导出</Button>-->
            <!--</Col>-->
          </Row>
        </Col>
      </Row>
    </div>
    <div class="tag-list">
      <list></list>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import list from '../components/workflow/list';

export default {
  name: 'workflow',
  data() {
    return {
      choosedTitles: [],
      filterKey: '',
      filterValue: '',
      showTitles: [
        {
          label: 'MetaID',
          value: 'metaid',
          isShow: true,
        },
        {
          label: '名称',
          value: 'appName',
          isShow: true,
        },
        {
          label: '名称EN',
          value: 'appNameEn',
        },
        {
          label: '包名',
          value: 'pkgName',
          isShow: true,
        },
        {
          label: 'Hash',
          value: 'pkgHash',
          isShow: true,
        },
        {
          label: '分类',
          value: 'appCategory',
          isShow: true,
        },
        {
          label: '分类En',
          value: 'appCategoryEn',
        },
        {
          label: '图标地址',
          value: 'appIconurl',
          isShow: true,
        },
        {
          label: '渠道信息',
          value: 'appChannel',
        },
        {
          label: '开发者',
          value: 'appDeveloper',
          isShow: true,
        },
        {
          label: '开发者En',
          value: 'appDeveloperEn',
        },
        {
          label: '参考网址',
          value: 'referenceUrl',
          isShow: true,
        },
        {
          label: '名称PY',
          value: 'appNameSpell',
        },
        {
          label: '公司名称',
          value: 'appIpgp',
          isShow: true,
        },
        {
          label: '公司名称EN',
          value: 'appIpgpEn',
        },
        {
          label: 'id',
          value: 'id',
        },
        {
          label: '平台',
          value: 'platform',
        },
        {
          label: '备注',
          value: 'appRemark',
        },
        {
          label: '应用版本',
          value: 'appVersion',
        },
        {
          label: '创建时间',
          value: 'createTime',
        },
        {
          label: 'metaid创建时间',
          value: 'metaidCreateTime',
        },
        {
          label: '更新时间',
          value: 'updateTime',
        },
      ],
      filterList: [],
      showDatePicker: false,
      allList: [
        {
          label: 'APP名称',
          value: 'appName',
        },
        {
          label: '包名',
          value: 'pkgName',
        },
        {
          label: 'Hash',
          value: 'pkgHash',
        },
        {
          label: '包最后更新日期',
          value: 'packageUpdateTime',
        },
        {
          label: '分类',
          value: 'appCategory',
        },
        {
          label: 'MetaID',
          value: 'metaid',
        },
      ],
    };
  },
  computed: mapState([
    'resultShowTitles',
    'resultParams',
  ]),
  mounted() {
    this.getUserPower();
    this.getResultData();
//    对所有可以展示的title进行遍历匹配需要展示的title
    this.$store.state.resultShowTitles = [];
    this.showTitles.forEach((item) => {
      if (item.isShow) {
        this.choosedTitles.push(item.value);
      }
    });
  },
  methods: {
    ...mapActions([
      'getResultData',
      'releaseVersion',
      'getUserPower',
    ]),
//    改变列表的展示
    changeTitle(value) {
      console.log(222);
      if (value.indexOf('metaid') !== -1 || value.indexOf('pkgName') !== -1) {
        const temp = [];
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
        console.log(temp);
        this.$store.state.resultShowTitles = temp;
      } else {
        this.$Notice.warning({
          title: '提示',
          desc: 'metaId和app包名必须不允许都删除',
        });
        this.choosedTitles.unshift('metaId');
      }
      const temp1 = [];
//      对筛选的select进行过滤
      this.choosedTitles.forEach((choosedTitles) => {
        this.allList.forEach((item) => {
          if (choosedTitles === item.value) {
            temp1.push(item);
          }
        });
      });
      this.filterList = temp1;
    },
//    发布版本
    releaseVersionFunc() {
      this.releaseVersion();
      this.$Message.warning('正在发版中');
    },
//    筛选功能的方法
    filterBtn(value) {
      if (value === '') {
        this.searchBtn();
      }
      if (value === 'packageAcquireTime' || value === 'packageUpdateTime' || value === 'metaidAddTime' || value === 'appUpdateTime') {
        this.showDatePicker = true;
      } else {
        this.showDatePicker = false;
      }
    },
//    日期选择的方法
    chooseDate(value) {
      this.filterValue = value;
      this.searchBtn();
    },
//    搜索框回车触发
    searchBtn() {
      const params = {};
      if (this.filterValue !== '' && this.filterKey !== '') {
        params[this.filterKey] = this.filterValue;
      }
      if (this.filterKey.substr(this.filterKey.length - 4) === 'Time') {
        params[this.filterKey] = null;
        const temp = this.filterValue.replace(/-/g, '');
        params[`${this.filterKey}1`] = `${temp}000000`;
        params[`${this.filterKey}2`] = `${temp}235959`;
      }
      this.$store.state.resultParams = params;
      this.getResultData(this.resultParams);
    },
  },
  components: {
    list,
  },
};
</script>
