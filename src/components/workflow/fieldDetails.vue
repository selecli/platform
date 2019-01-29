<template>
  <div class="app-details">
    <div class="data-details">
      <div class="data-details-title" >
        <Button type="text" icon ="chevron-left" @click="back"></Button>
        {{detailsTitle}}
        {{dataDetail}}
      </div>
      <div></div>
      <div class="data-list">
        <Table border ref="selection"
               :columns="dataTitle"
               :data="dataDetails"
        ></Table>
      </div>
    </div>
    <div v-show="stepVal === 4 && dataDetail === '预测详情'">
       <div v-for="todo in imgUrls" :value="todo.createTime" :key="todo.createTime" style="display:inline-block; margin-top:10px; margin-left:10px;">
         <img :src="todo.iconurl" alt="" style="width:100px; height:100px;">
         <p>{{todo.type === 1 ? `预测图片${todo.pkgid}` : `相似图片${todo.pkgid}`}}</p>
       </div>
    </div>
    <div :class="[dataDetail === '预测详情' ? 'mate-details2' : 'mate-details']">
      <div class="mate-title">{{metaDetail}}</div>
      <div class="mate-list">
        <Table border ref="selection"
               :columns="mateTitle"
               :data="metaDetails"
        ></Table>
      </div>
    </div>
    <Modal
        v-model="showEditDetails"
        :width="360"
        ref="modalDetails"
        @on-visible-change = "visibleChange"
        >
        <edit v-if="showEditDetails"></edit>
        <div slot="footer">
            <Button type="primary"   @click="cancel" >新增 metaId</Button>
            <Button type="primary"   @click="ok">确定</Button>
        </div>
       
      </Modal>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import edit from './edit';

export default {
  name: 'fieldDetails',
  data() {
    return {
      detailsTitle: '',  // 详情界面的title
      dataTitle: [],  // 数据详情title
      mateTitle: [],  // 匹配数据title
      prePic1: 'https://www.baidu.com/img/bd_logo1.png?where=super',
      prePic2: 'https://www.baidu.com/img/bd_logo1.png?where=super',
    };
  },
  computed: mapState([
    'dataDetails',
    'showDetails',
    'metaDetails',
    'stepVal',
    'showEditDetails',
    'showEditDetailsInfo',
    'spinShow',
    'editAppInfo',
    'editData',
    'dataDetail',
    'metaDetail',
    'imgUrls',
  ]),
  mounted() {
  },
  methods: {
    ...mapActions([
      'getAppDetails',
      'getAppDetailsFinaly',
      'getMetaIdDetails',
      'getMetaIdDetailsConfirm',
      'getMetaIdDetailsAdd',
    ]),
    ...mapMutations([
      'changeSteps',
      'updateTime',
      'changeState',
    ]),
//  返回按钮
    back() {
      this.$store.state.showDetails = false;
    },
    ok() {
      this.$store.state.showEditDetails = false;
      this.editAppInfo.newMetaId = this.showEditDetailsInfo;
      this.getMetaIdDetailsConfirm(this.editAppInfo);
      this.$store.state.spinShow = false;
    },
    cancel() {
      this.$store.state.showEditDetails = false;
      this.getMetaIdDetailsAdd(this.editAppInfo);
      this.$store.state.spinShow = false;
    //  this.showEditDetailsInfo = '';
    },
    visibleChange(val) {
      this.$store.state.showEditDetails = val;
    },
//  状态值转换
    handleState(state) {
      const states = ['新入库', 'hash错误', '名称未更改', '名称已更改', '未补全', '已补全', '人工补全', '自动合包成功', '合包失败', '人工修改'];
      return states[state - 1] === '' ? '未知' : states[state - 1];
    },
//  APP状态转换
    formatAppStatus(state) {
      const states = ['未审核', '已审核'];
      return states[state - 1] === '' ? '未知' : states[state - 1];
    },
//  平台类型转换
    formatPlatorm(platform) {
      const platforms = ['IOS', '安卓', 'IOS、安卓'];
      return platform < platforms.length + 1 ? platforms[platform - 1] : '未知';
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
//  来源商店转换
    formatSource(sourceId) {
      const sources = ['豌豆荚', '360手机助手', '应用宝', '小米应用商店', '安智'];
      return sourceId === 0 ? '未知' : sources[sourceId - 1];
    },
  },
  components: {
    edit,
  },
  watch: {
    dataDetails() {
    //  this.detailsTitle = this.dataDetails[0].appPackageName;
      const data = {
        data: this.dataDetails[0],
      };
      if (this.stepVal === 1) {
        this.detailsTitle = this.dataDetails[0].appPackageName;
        this.dataTitle = [
          {
            type: 'selection',
            width: 50,
            align: 'center',
          },
          {
            title: '包名称',
            key: 'appName',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名称',
                aaa: params,
              },
            }, [
              '包名称',
            ]),
            render: (h, params) => h('div', [
              h('span', {
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
//                      this.$store.state.spinShow = true;
                    this.$store.state.showDetails = true;
                  },
                },
              }, [
                h('Tooltip', {
                  attrs: {
                    content: params.row.appName,
                    class: 'ivu-table-cell-ellipsis',
                  },
                }, [
                  params.row.appName,
                ]),
              ]),
            ]),
            ellipsis: true,
          },
          {
            title: '包名',
            key: 'appPackageName',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名',
                aaa: params,
              },
            }, [
              '包名',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appPackageName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appPackageName,
            ]),
            ellipsis: true,
          },
          {
            title: 'Hash',
            key: 'packageHash',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'Hash',
                aaa: params,
              },
            }, [
              'Hash',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.packageHash,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.packageHash,
            ]),
            ellipsis: true,
          },
          {
            title: '名称EN',
            key: 'appNameEn',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称EN',
                aaa: params,
              },
            }, [
              '名称EN',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appNameEn,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appNameEn,
            ]),
            ellipsis: true,
          },
          {
            title: '名称PY',
            key: 'appNameSpell',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称PY',
                aaa: params,
              },
            }, [
              '名称PY',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appNameSpell,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appNameSpell,
            ]),
            ellipsis: true,
          },
          {
            title: '原始标签',
            key: 'originalTag',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '原始标签',
                aaa: params,
              },
            }, [
              '原始标签',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.originalTag,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.originalTag,
            ]),
            ellipsis: true,
          },
          {
            title: '原始分类',
            key: 'originalType',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '原始分类',
                aaa: params,
              },
            }, [
              '原始分类',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.originalType,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.originalType,
            ]),
            ellipsis: true,
          },
          {
            title: '分类',
            key: 'pkgTagName',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '分类',
                aaa: params,
              },
            }, [
              '分类',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgTagName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.pkgTagName,
            ]),
            ellipsis: true,
          },
          {
            title: '图标地址',
            key: 'iconUrl',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '图标地址',
                aaa: params,
              },
            }, [
              '图标地址',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.iconUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.iconUrl,
            ]),
            ellipsis: true,
          },
          {
            title: '来源商店',
            key: 'sourceId',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '来源商店',
                aaa: params,
              },
            }, [
              '来源商店',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatSource(params.row.sourceId),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatSource(params.row.sourceId),
            ]),
            ellipsis: true,
          },
          {
            title: '匹配数量',
            key: 'matchCount',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '匹配数量',
                aaa: params,
              },
            }, [
              '匹配数量',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.matchCount,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.matchCount,
            ]),
            ellipsis: true,
          },
          {
            title: '包状态',
            key: 'packageStatus',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包状态',
                aaa: params,
              },
            }, [
              '包状态',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.handleState(params.row.packageStatus),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.handleState(params.row.packageStatus),
            ]),
            ellipsis: true,
          },
          {
            title: '开发者',
            key: 'developer',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '开发者',
                aaa: params,
              },
            }, [
              '开发者',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.developer,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.developer,
            ]),
            ellipsis: true,
          },
          {
            title: '包获取时间',
            key: 'createTime',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包获取时间',
                aaa: params,
              },
            }, [
              '包获取时间',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.createTime),
            ]),
            ellipsis: true,
          },
          {
            title: '包更新时间',
            key: 'updateTime',
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包更新时间',
                aaa: params,
              },
            }, [
              '包更新时间',
            ]),
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            ellipsis: true,
          },
        ];
        this.mateTitle = [
          {
            title: '包名称',
            key: 'appName',
            render: (h, params) => h('div', [
              h('span', {
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
//                      this.$store.state.spinShow = true;
                    this.$store.state.showDetails = true;
                  },
                },
              }, [
                h('Tooltip', {
                  attrs: {
                    content: params.row.appName,
                    class: 'ivu-table-cell-ellipsis',
                  },
                }, [
                  params.row.appName,
                ]),
              ]),
            ]),
            ellipsis: true,
          },
          {
            title: '包名',
            key: 'pkgName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.pkgName,
            ]),
            ellipsis: true,
          },
          {
            title: 'Hash',
            key: 'pkgHash',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgHash,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.pkgHash,
            ]),
            ellipsis: true,
          },
          {
            title: '平台',
            key: 'platform',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatPlatorm(params.row.platform),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatPlatorm(params.row.platform),
            ]),
            ellipsis: true,
          },
          {
            title: '描述',
            key: 'appDes',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appDes,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appDes,
            ]),
            ellipsis: true,
          },
          {
            title: 'storeUrl',
            key: 'storeUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.storeUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.storeUrl,
            ]),
            ellipsis: true,
          },
          {
            title: '图标地址',
            key: 'imgUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.imgUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.imgUrl,
            ]),
            ellipsis: true,
          },
          {
            title: '平台',
            key: 'appStore',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appStore,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appStore,
            ]),
            ellipsis: true,
          },
          {
            title: '标签',
            key: 'tag',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.tag,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.tag,
            ]),
            ellipsis: true,
          },
          {
            title: '分类',
            key: 'parentClassName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.parentClassName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.parentClassName,
            ]),
            ellipsis: true,
          },
          {
            title: '开发者',
            key: 'developer',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.developer,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.developer,
            ]),
            ellipsis: true,
          },
          {
            title: '数据抓取日期',
            key: 'updateDateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateDateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateDateTime),
            ]),
            ellipsis: true,
          },
        ];
        this.getAppDetails(data);
      } else if (this.stepVal === 5) {
        this.detailsTitle = this.dataDetails[0].appPackageName;
        this.dataTitle = [
          {
            key: 'metaId',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaId,
              },
            }, [
              params.row.metaId,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'MetaID',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              'MetaID',
            ]),
            ellipsis: true,
          },
          {
            key: 'standardName',
            render: (h, params) => h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small',
                },
                on: {
                  click: () => {
                    this.$store.state.dataDetails = [];
                    this.$store.state.showDetails = true;
                    this.$store.state.dataDetails.push(params.row);
                  },
                },
              }, params.row.standardName),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称',
                aaa: params,
              },
            }, [
              '名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'standardNameEn',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.standardNameEn,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.standardNameEn,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称EN',
                aaa: params,
              },
            }, [
              '名称EN',
            ]),
            ellipsis: true,
          },
          {
            key: 'standardNameSpell',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.standardNameSpell,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.standardNameSpell,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称PY',
                aaa: params,
              },
            }, [
              '名称PY',
            ]),
            ellipsis: true,
          },
          {
            key: 'appTagId',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgTagName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.pkgTagName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '标签',
                aaa: params,
              },
            }, [
              '标签',
            ]),
            ellipsis: true,
          },
          {
            key: 'platform',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatPlatorm(params.row.platform),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatPlatorm(params.row.platform),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '平台',
                aaa: params,
              },
            }, [
              '平台',
            ]),
            ellipsis: true,
            width: 70,
          },
          {
            key: 'finalIconUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.finalIconUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.finalIconUrl,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '图标地址',
                aaa: params,
              },
            }, [
              '图标地址',
            ]),
            ellipsis: true,
          },
          {
            key: 'appStatus',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatAppStatus(params.row.appStatus),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatAppStatus(params.row.appStatus),
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
            key: 'developer',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.developer,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.developer,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '开发者',
                aaa: params,
              },
            }, [
              '开发者',
            ]),
            ellipsis: true,
          },
          {
            key: 'addTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.addTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.addTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '创建时间',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              '创建时间',
            ]),
            ellipsis: true,
            width: 160,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '更新时间',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              '更新时间',
            ]),
            ellipsis: true,
            width: 160,
          },
        ];
        this.mateTitle = [
          {
            title: '名称',
            key: 'appName',
            render: (h, params) => h('div', [
              h('span', {
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
//                      this.$store.state.spinShow = true;
                    this.$store.state.showDetails = true;
                  },
                },
              }, [
                h('Tooltip', {
                  attrs: {
                    content: params.row.appName,
                    class: 'ivu-table-cell-ellipsis',
                  },
                }, [
                  params.row.appName,
                ]),
              ]),
            ]),
            ellipsis: true,
          },
          {
            title: '包名',
            key: 'appPackageName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appPackageName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appPackageName,
            ]),
            ellipsis: true,
          },
          {
            title: 'Hash',
            key: 'packageHash',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.packageHash,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.packageHash,
            ]),
            ellipsis: true,
          },
          {
            title: '名称EN',
            key: 'appNameEn',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appNameEn,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appNameEn,
            ]),
            ellipsis: true,
          },
          {
            title: '名称PY',
            key: 'appNameSpell',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appNameSpell,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appNameSpell,
            ]),
            ellipsis: true,
          },
          {
            title: '标签',
            key: 'pkgTagName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgTagName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.pkgTagName,
            ]),
            ellipsis: true,
          },
          {
            title: '图标地址',
            key: 'iconUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.iconUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.iconUrl,
            ]),
            ellipsis: true,
          },
          {
            title: '匹配数量',
            key: 'matchCount',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.matchCount,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.matchCount,
            ]),
            ellipsis: true,
          },
          {
            title: '状态',
            key: 'tag',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.handleState(params.row.packageStatus),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.handleState(params.row.packageStatus),
            ]),
            ellipsis: true,
          },
          {
            title: '开发者',
            key: 'developer',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.developer,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.developer,
            ]),
            ellipsis: true,
          },
          {
            title: '包获取时间',
            key: 'updateDateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.createTime),
            ]),
            ellipsis: true,
          },
          {
            title: '包更新时间',
            key: 'updateDateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            ellipsis: true,
          },
        ];
        this.getAppDetailsFinaly(data);
      } else if (this.stepVal === 4 && this.dataDetail === '数据详情') {
        // if (this.$refs.selection.clientHeight > 200) {
        //   this.$refs.selection.attrs.height = 200;
        // }
        this.dataTitle = [
          {
            key: 'metaId',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaId,
              },
            }, [
              params.row.metaId,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'MetaID',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              'MetaID',
            ]),
            ellipsis: true,
          },
          {
            key: 'standardName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.standardName,
              },
            }, [
              params.row.standardName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名称',
                aaa: params,
              },
            }, [
              '包名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'standardNameEn',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.standardNameEn,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.standardNameEn,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称EN',
                aaa: params,
              },
            }, [
              '名称EN',
            ]),
            ellipsis: true,
          },
          {
            key: 'standardNameSpell',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.standardNameSpell,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.standardNameSpell,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称PY',
                aaa: params,
              },
            }, [
              '名称PY',
            ]),
            ellipsis: true,
          },
          {
            key: 'appTagId',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgTagName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.pkgTagName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '标签',
                aaa: params,
              },
            }, [
              '标签',
            ]),
            ellipsis: true,
          },
          {
            //  有问题
            key: 'platform',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgTagName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.pkgTagName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '分类',
                aaa: params,
              },
            }, [
              '分类',
            ]),
            ellipsis: true,
            width: 70,
          },
          {
            key: 'finalIconUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.finalIconUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.finalIconUrl,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '图标地址',
                aaa: params,
              },
            }, [
              '图标地址',
            ]),
            ellipsis: true,
          },
          {
            key: 'appStatus',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatAppStatus(params.row.appStatus),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatAppStatus(params.row.appStatus),
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
            key: 'addTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.addTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.addTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'Metaid添加日期',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              'Metaid添加日期',
            ]),
            ellipsis: true,
            width: 160,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '更新时间',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              '更新时间',
            ]),
            ellipsis: true,
            width: 160,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '版本时间',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              '版本时间',
            ]),
            ellipsis: true,
            width: 160,
          },
        ];
        this.mateTitle = [
          {
            title: '包名称',
            key: 'appName',
            render: (h, params) => h('div', [
              h('span', {
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
//                      this.$store.state.spinShow = true;
                    this.$store.state.showDetails = true;
                  },
                },
              }, [
                h('Tooltip', {
                  attrs: {
                    content: params.row.appName,
                    class: 'ivu-table-cell-ellipsis',
                  },
                }, [
                  params.row.appName,
                ]),
              ]),
            ]),
            ellipsis: true,
          },
          {
            title: '包名',
            key: 'appPackageName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appPackageName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appPackageName,
            ]),
            ellipsis: true,
          },
          {
            title: 'Hash',
            key: 'packageHash',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.packageHash,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.packageHash,
            ]),
            ellipsis: true,
          },
          {
            title: '名称EN',
            key: 'appNameEn',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appNameEn,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appNameEn,
            ]),
            ellipsis: true,
          },
          {
            title: '名称PY',
            key: 'appNameSpell',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appNameSpell,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appNameSpell,
            ]),
            ellipsis: true,
          },
          {
            title: '标签',
            key: 'pkgTagName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgTagName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.pkgTagName,
            ]),
            ellipsis: true,
          },
          {
            title: '图标地址',
            key: 'iconUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.iconUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.iconUrl,
            ]),
            ellipsis: true,
          },
          {
            title: '状态',
            key: 'tag',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.handleState(params.row.packageStatus),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.handleState(params.row.packageStatus),
            ]),
            ellipsis: true,
          },
          {
            title: '包获取时间',
            key: 'updateDateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.createTime),
            ]),
            ellipsis: true,
          },
          {
            title: '包更新时间',
            key: 'updateDateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            ellipsis: true,
            width: 160,
          },
          {
            title: '合包变更',
            render: (h, params) => h('Button', {
              props: {
                type: 'text',
                icon: 'compose',
              },
              style: {
                fontSize: '22px',
              },
              on: {
                click: () => {
                //  this.$store.state.showEditDetails = true;
                  this.$store.commit('changeState');
                  this.$store.state.editAppInfo = params.row;
                },
              },
              ellipsis: true,
            }),
          },
        ];
      } else if (this.stepVal === 4 && this.dataDetail === '预测详情') {
        this.dataTitle = [
          {
            key: 'id',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.id,
              },
            }, [
              params.row.id,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包ID',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              '包ID',
            ]),
            ellipsis: true,
          },
          {
            key: 'appPackageName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appPackageName,
              },
            }, [
              params.row.appPackageName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名',
                aaa: params,
              },
            }, [
              '包名',
            ]),
            ellipsis: true,
          },
          {
            key: 'forecast',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.forecast,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.forecast,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '预测类型',
                aaa: params,
              },
            }, [
              '预测类型',
            ]),
            ellipsis: true,
          },
          {
            key: 'metaId',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaId,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.metaId,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '预测metaId',
                aaa: params,
              },
            }, [
              '预测metaId',
            ]),
            ellipsis: true,
          },
          {
            title: '编辑',
            render: (h, params) => h('Button', {
              props: {
                type: 'text',
                icon: 'compose',
              },
              style: {
                fontSize: '22px',
              },
              on: {
                click: () => {
                  console.log(params);
                  this.$store.commit('changeState');
                },
              },
              ellipsis: true,
            }),
          },
        ];
        this.mateTitle = [
          {
            title: 'score',
            key: 'score',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.score,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.score,
            ]),
            ellipsis: true,
          },
          {
            title: 'metaId',
            key: 'metaId',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.metaid,
            ]),
            ellipsis: true,
          },
          {
            title: '名称',
            key: 'appname',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appname,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appname,
            ]),
            ellipsis: true,
          },
          {
            title: '包名',
            key: 'pkgname',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgname,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.pkgname,
            ]),
            ellipsis: true,
          },
          {
            title: '开发者',
            key: 'developer',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.developer,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.developer,
            ]),
            ellipsis: true,
          },
        ];
      }
    },
  },
};
</script>
