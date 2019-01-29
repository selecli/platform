<template>
    <div class="location">
      <div v-show="isShow">
        <div class="cityBox">
          <div class="selectBox">
            <!-- <Select v-model="model1" class="selectItem" label-in-value @on-change="changeCity">
               <Option v-for="item in cityList1" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="model2" class="selectItem">
              <Option v-for="item in cityList2" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="model3" class="selectItem">
              <Option v-for="item in cityList3" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select> -->
            <Cascader :data="cityList" class="selectItem" change-on-select @on-change="changeCity"></Cascader>
            <Table :columns="columns1" :data="data1"  size="small" border class="selectedList"></Table>
          </div>
          <Button type="primary" @click="add">添加</Button>
          <Button type="primary" @click="ok">任务提交</Button>
          <Button type="primary" @click="progressList">进度查询</Button>  
        </div>
         <div class="mapBox">
            <div id="allMap"></div>
            <Input v-model="searchVal" icon="search" placeholder="请输入" style="width: 200px" class="searchVal" @on-enter="search"></Input>
         </div>
      </div>
      <div v-show="!isShow" class="location-details">
        <div class="clearfix">
          <Button type="text" icon ="chevron-left" @click="back" class="backBtn"></Button>
          <Select style="width:140px;" v-model="model4">

          </Select>
          <Input style="width:140px;"></Input>
          <Select class="fr location-state" v-model="model5" >
            <Option v-for="item in stateList" :value="item.value" :key="item.value">{{item.label}}</Option> 
          </Select>
        </div>
        <div class="progress-list">
          <Table border :columns="columnsTit" :data="dataList" class="list"></Table> 
        </div>
        <Page 
          :total="listTotal"
          :current="currentPage" 
          show-sizer 
          show-elevator 
          show-total
          :page-size="pageSize"
          :page-size-opts="pageSizeArr"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          placement="top"
        ></Page>  
      </div>  
    </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import city from '../store/city';

export default {
  name: 'location',
  data() {
    return {
      isShow: true,
      model1: '',
      model2: '',
      model3: '',
      model4: '',
      model5: 'all',
      searchVal: '',
      dataList: [],
      pageSizeArr: [20, 40, 60],
      stateList: [
        {
          value: 'all',
          label: '全部',
        },
        {
          value: '1',
          label: '上传中',
        },
        {
          value: '2',
          label: '上传完成',
        },
        {
          value: '3',
          label: '正在编辑',
        },
        {
          value: '4',
          label: '作业完成',
        },
      ],
      treeData: [
        { name: '北京市', code: 1 },
        { name: '东城区', code: 11, parentId: 1 },
        { name: '通州区', code: 12, parentId: 1 },
        { name: '永顺', code: 121, parentId: 12 },
        { name: '河北', code: 2 },
        { name: '石家庄', code: 21, parentId: 2 },
        { name: '石家庄井陉县', code: 211, parentId: 21 },
        { name: '邯郸', code: 22, parentId: 2 },
        { name: '磁县', code: 221, parentId: 22 },
      ],
      columns1: [
        {
          title: '省',
          key: 'province',
          ellipsis: true,
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.province,
            },
          }, [
            params.row.province,
          ]),
        },
        {
          title: '市',
          key: 'city',
        },
        {
          title: '县',
          key: 'county',
        },
        {
          title: '操作',
          key: 'operation',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'primary',
                size: 'small',
              },
              on: {
                click: () => {
                  console.log(params);
                  this.remove(params.index);
                },
              },
            }, ['删除']);
          },
        },
      ],
      data1: [],
      cityList: [],
      cityList1: [
        // { label: '', value: 'n' },
        // { label: 'p', value: '1' },
        // { label: 'p2', value: '2' },
        // { label: 'p3', value: '3' },
      ],
      cityList2: [
        // { label: '请选择', value: 'n' },
        // { label: 'p', value: '11' },
        // { label: 'p2', value: '22' },
        // { label: 'p3', value: '33' },
      ],
      cityList3: [
        // { label: '请选择', value: 'n' },
        // { label: 'p', value: '111' },
        // { label: 'p2', value: '222' },
        // { label: 'p3', value: '333' },
      ],
      d: 3,
      columnsTit: [],
      cityData: [],
      codes: [],
      ids: [],
    };
  },
  computed: mapState([
    'progresListInfo',
    'listTotal',
    'currentPage',
    'pageSize',
    'levelList1',
    'userInfo',

  ]),
  mounted() {
    /* eslint-disable */
      const map = new BMap.Map('allMap');
      map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
      map.addControl(new BMap.MapTypeControl({
        mapTypes: [
          BMAP_NORMAL_MAP,
          BMAP_HYBRID_MAP,
        ] }));
      map.setCurrentCity('北京');
      map.enableScrollWheelZoom(true);
      /* eslint-enable */
    this.getLocationInfo();
    this.cityList = this.toTree(city);
  },
  watch: {
    progresListInfo() {
      this.dataList = this.progresListInfo;
    },
    levelList1() {
      this.cityList1 = this.levelList1;
    },
  },
  methods: {
    ...mapActions([
      'getProgressList',
      'changeLocationState',
      'getLocationInfo',
      'createJob',
    ]),
    toTree(data) {
      const json = {};
      const res = [];
      data.forEach((item) => {
        if (item.id) {
          json[item.id] = item;
        }
      });
      data.forEach((item) => {
        if (item.pid) {
          if (json[item.pid].children) {
            const op = json[item.pid].children.every(todo => todo !== item);
            if (op) {
              json[item.pid].children.push(item);
            }
          } else {
            json[item.pid].children = [item];
          }
        }
      });
      data.forEach((item) => {
        if (!item.pid) {
          res.push(item);
        }
      });
      return res;
    },
    changeCity(val, selectedData) {
      this.cityData = selectedData;
    },
    handleState(state) {
      const states = ['上传中', '上传完成', '正在编辑', '作业完成'];
      return states[state - 1] === '' ? '未知' : states[state - 1];
    },
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
    map() {
      /* eslint-disable */
      const map = new BMap.Map('allMap');
      map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
      map.addControl(new BMap.MapTypeControl({
        mapTypes: [
          BMAP_NORMAL_MAP,
          BMAP_HYBRID_MAP,
        ] }));
      map.setCurrentCity('北京');
      map.enableScrollWheelZoom(true);
      const local = new BMap.LocalSearch(map, {      
          renderOptions:{map: map}      
      });
      local.search(this.searchVal);
      /* eslint-enable */
    },
    search() {
      this.map();
    },
    changePage(page) {
      this.$store.state.currentPage = page;
      this.getProgressList();
    },
    changePageSize(pageSize) {
      this.$store.state.pageSize = pageSize;
      this.getProgressList();
    },
    back() {
      this.isShow = !this.isShow;
    },
    remove(index) {
      this.data1.splice(index, 1);
      this.codes.splice(index, 1);
      this.ids.splice(index, 1);
    },
    progressList() {
      this.isShow = !this.isShow;
      this.getProgressList();
      this.columnsTit = [
        {
          key: 'jobId',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.jobId,
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row.jobId,
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '作业编号',
              aaa: params,
            },
          }, [
            '作业编号',
          ]),
          ellipsis: true,
        },
        {
          key: 'areaName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.areaName,
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row.areaName,
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '编辑区域',
              aaa: params,
            },
          }, [
            '编辑区域',
          ]),
          ellipsis: true,
        },
        {
          key: 'userName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.userName,
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row.userName,
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '作业员',
              aaa: params,
            },
          }, [
            '作业员',
          ]),
          ellipsis: true,
        },
        {
          key: 'status',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.handleState(params.row.status),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.handleState(params.row.status),
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '状态',
              aaa: params,
            },
          }, [
            '状态',
          ]),
          ellipsis: true,
        },
        {
          key: 'startTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.startTime),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatDate(params.row.startTime),
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '提交时间',
              aaa: params,
            },
          }, [
            '提交时间',
          ]),
          ellipsis: true,
        },
        {
          key: 'endTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.endTime),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatDate(params.row.endTime),
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '完成时间',
              aaa: params,
            },
          }, [
            '完成时间',
          ]),
          ellipsis: true,
        },
        {
          title: '操作',
          key: 'operate',
          render: (h, params) => {
            if (params.row.status === 1 || params.row.status === 4) {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'large',
                    disabled: true,
                  },
                }, '跳转'),
              ]);
            }
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'large',
                },
                on: {
                  click: () => {
                    const id = params.row.jobId;
                    const path = params.row.outPath;
                    const status = params.row.status;
                    const p = {
                      jobId: id,
                      status,
                      callback() {
                      //  window.open(`https://dmap.tendcloud.com/#/dataSet?jobId=${id}&path=${path}`);
                        window.open(`http://dmap.talkingdata.com/#/dataSet?jobId=${id}&path=${path}`);
                      },
                    };
                    this.changeLocationState(p);

                  //  window.open(`https://www.baidu.com?jobId=${id}&path=${path}`);
                  },
                },
              }, '跳转'),
            ]);
          },
        },
      ];
      // this.dataList = [
      //   { status: 1, jobId: 'ddd01' },
      //   { status: 2, jobId: 'ddd02' },
      // ];
    },
    add() {
      const op = this.ids.every(item => item !== this.cityData[this.cityData.length - 1].id);
      if (op) {
        this.data1.push({
          province: this.cityData[0].label,
          city: this.cityData[1] ? this.cityData[1].label : '',
          county: this.cityData[2] ? this.cityData[2].label : '',
        });
        this.codes.push(this.cityData[this.cityData.length - 1].code);
        this.ids.push(this.cityData[this.cityData.length - 1].id);
      } else {
        this.$Message.warning('你已经添加过本条数据了');
      }
    },
    ok() {
      const p = {
        ids: this.ids,
        codes: this.codes,
        userId: JSON.parse(this.userInfo).userId,
      };
      this.createJob(p);
      this.codes = [];
      this.ids = [];
    },
    url() {
      window.open('https://dmap.tendcloud.com/#/dataSet?jobId=AD000002&path=hn_test02');
    },
  },
};
</script>

