<template>
    <div class="config">
        <Menu mode="horizontal" theme="light" active-name="1" @on-select="selectItem">
            <MenuItem name="1">体系维护</MenuItem>
            <MenuItem name="2">映射关系</MenuItem>
            <MenuItem name="3">黑名单</MenuItem>
            <MenuItem name="4">白名单</MenuItem>
            <MenuItem name="5">锁定清单</MenuItem>
        </Menu>
        <div  class="clearfix config-action">
          <div class="common-float-left" v-if="configName === '1' || configName === '2'">
            <Breadcrumb>
              <BreadcrumbItem v-for="item in jwoodTags" :key="item.code" @click.native="changeTags(item)">{{item.name || item.mapppingName}}</BreadcrumbItem>
            </Breadcrumb>
            <div v-if="configName === '1' && jwoodTags.length !== 2" style="margin-top:15px;" >
              <Select style="width:180px;" placeholder="请选择要展示的字段" v-model="titles" multiple @on-change="changeTitles" class="chooseTitle">
                 <Option v-for="item in showTitles" :key="item.value" :value="item.value">{{item.label}}</Option>
               </Select>
               <Select style="width:120px;margin-left:10px;" v-model="searchType">
                 <Option v-for="item in searchTypeList"  :key="item.value" :value="item.value">{{item.label}}</Option>
               </Select>
               <Input v-model="searchVal" placeholder="请输入" style="width:120px;" @on-enter="searchTag"></Input>
            </div>
          </div>
          <div class="common-float-left clearfix" v-if="configName === '3' || configName === '4' || configName === '5'" style="width:500px;">
            <!-- <div class="common-float-left" style="position:relative; width:100px;height:32px;">
               <Upload  :action="`${url}${blackListUrl}`" name="sourceFile"
                  :data="{type:type,systemId:tdVal, userId:JSON.parse(userInfo).userId}"
                  :on-success="handleSuccess"
                  :before-upload="beforeUpload"
                  multiple
                  :show-upload-list="false">
                <Button
                  type="primary"
                  icon="ios-cloud-upload-outline">
                  上传文件
                </Button>
              </Upload>
              <Button
                  v-if="islived"
                  style="position:absolute; left:0; top:0;"
                  type="primary"
                  @click="uploadType"
                  icon="ios-cloud-upload-outline">
                  上传文件
                </Button>
            </div>
            <Select v-model="tdVal" style="float:left; width:200px;margin-left:10px;" @on-change="changeTd">
              <Option v-for="item in systemData" :key="item.value" :value="item.value">{{item.label}}</Option>
            </Select>
            <Button type="primary" icon="ios-download-outline" style="margin-left:10px;" v-if="configName==='3' || configName === '4' || configName === '5' " @click="exportCsv">示例文件</Button> -->
            <Button type="primary" @click="uploadMethod">上传文件</Button>
          </div>
          <div class="fr">
            <div>
              <!-- :data="{groupId:groupId }" -->
              <Button type="primary"  style="margin-right:10px;" v-if="(configName==='1' || configName === '2') && jwoodTags.length !== 2" @click="uploadMethod">上传文件</Button>
              <!-- <Upload  :action="`${url}${uploadTags}`" name="sourceFile" style="margin-right:10px;"
                    v-if="configName==='1' && jwoodTags.length !== 2"
                    :on-success="handleSuccess"
                    :before-upload="beforeUpload"
                    :data="{tid:jwoodTags[1].id}"
                    multiple
                    :show-upload-list="false">
                <Button
                  type="primary"
                  icon="ios-cloud-upload-outline">
                  上传文件
                </Button>
              </Upload>
              <Upload  :action="`${url}${uploadMappers}`" name="sourceFile" style="margin-right:10px;"
                    v-if="configName==='2'&& jwoodTags.length !== 2"
                    :on-success="handleSuccess"
                    :before-upload="beforeUpload"
                    :data="{groupId:groupId}"
                    multiple
                    :show-upload-list="false">
                <Button
                  type="primary"
                  icon="ios-cloud-upload-outline">
                  上传文件
                </Button>
              </Upload> -->
              <Button type="primary" @click="showMask" style="margin-right:10px;" >{{addTitle}}</Button>
              <Button type="primary" @click="remove">删除</Button>
            </div>
          </div>    
        </div>
        <div class="config-list" :class="{configTitle: modify}">
          <list @scan="updateVersion"></list>
        </div>
        <!--新增体系及标签弹窗-->
        <Modal
          v-model="showConfig"
          :title="modalTitle"
          @on-ok="ok"
          @on-cancel="cancel"
          ref="modal">
          <configAdd ref="addList"></configAdd>
        </Modal>
        <Modal
          v-model="updateStatus"
          title="修改映射详情"
          @on-ok="okUpdate"
          @on-cancel="cancelUpdate"
          ref="modal">
          <configAdd></configAdd>
        </Modal>
        <Modal 
        v-model="isShow"
        title="批量上传"
        @on-ok="okUpload"
        @on-cancel="cancelUpload"
        ref="uploadModal"
        >
           <upload-info ref="info"></upload-info>  
        </Modal>
        <tipList ref="table"></tipList>
        <Modal
          v-model="isScan"
          width="80"
        >
          <Table border :columns="columnTitle" :data="versionData" class="version-table"></Table>   
        </Modal> 

    </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import List from '../workflow/list';
import configAdd from '../building/configAdd';
import tipList from './tipList';
import uploadInfo from './uploadInfo';

export default {
  name: 'config',
  data() {
    return {
      isScan: false,
      showAddMask: false,
      lastid: '',
      menuVal: '1',
      addTitle: '新增体系',
      modalTitle: '新增体系',
      uploadUrl: '',
      uploadMappers: '/jwood/jmMapperImpls/uploadCSV',
      uploadTags: '/jwood/jmTags/uploadCSV',
      blackListUrl: '/jwood/jmFilters/uploadCSV',
      tdVal: '',
      type: 0,
      isShow: false,
      islived: true,
      updateStatus: false,
      versionKey: '',
      searchVal: '',
      searchType: '',
      titles: [],
      d: '',
      tdId: '',
      searchTypeList: [
        { label: 'id', value: 'sid' },
        { label: 'name', value: 'name' },
      ],
      showTitles: [
        { label: '标签id', value: 'sid', isShow: true },
        { label: '标签', value: 'name', isShow: true },
        { label: '标签code', value: 'code', isShow: true },
        { label: '标签描述', value: 'description', isShow: true },
        { label: '创建时间', value: 'createtime', isShow: true },
        { label: '更新时间', value: 'updatetime', isShow: true },
        { label: '标签父级id', value: 'spid' },
        { label: '父级code', value: 'parentcode' },
        { label: '是否为子标签', value: 'isLeaf' },
        { label: '标签级别', value: 'level' },
        { label: '标签路径', value: 'path' },
        { label: '应用规则', value: 'rule' },
        { label: '状态', value: 'status' },
        { label: '有效期开始时间', value: 'startdate' },
        { label: '有效期结束时间', value: 'enddate' },
      ],
      columnTitle: [],
      versionData: [],
    };
  },
  computed: mapState([
    'configName',
    'listArr',
    'jwoodTags',
    'userInfo',
    'jwoodTagInfo',
    'tdtypeData',
    'groupId',
    'parentcode',
    'showConfig',
    'configList',
    'url',
    'systemData',
    'showUpdate',
    'modify',
    'versionList',
  ]),
  mounted() {
    this.tdTagResult();
    this.mapperImplTree({ systemId: -1 });
    this.tdTree();
    this.$store.state.configName = '1';
    if (this.configName === '1') {
      this.$store.state.jwoodTags = [{ name: '标签体系', code: '' }, ''];
    } else if (this.configName === '2') {
      this.$store.state.jwoodTags = [{ name: 'BaseCode', code: '' }, ''];
    }
    this.columnTitle = [
      {
        title: '版本号',
        key: 'version',
        render: (h, params) => {
          if (this.versionKey === params.row.id) {
            return h('div', [
              h('Input', {
                props: {
                  value: params.row.version,
                  autofocus: true,
                },
                on: {
                  input: (val) => {
                    params.row.version = val;
                  },
                },
              }),
            ]);
          }
          return h('Tooltip', {
            props: {
              content: params.row.version,
              aaa: params,
            },
          }, [params.row.version]);
        },
        ellipsis: true,
      },
      {
        title: '变更前',
        key: 'beforeChange',
        render: (h, params) => {
          if (this.versionKey === params.row.id) {
            return h('div', [
              h('Input', {
                props: {
                  value: params.row.beforeChange,
                },
                on: {
                  input: (val) => {
                    params.row.beforeChange = val;
                  },
                },
              }),
            ]);
          }
          return h('Tooltip', {
            props: {
              content: params.row.beforeChange,
              aaa: params,
            },
          }, [params.row.beforeChange]);
        },
        ellipsis: true,
      },
      {
        title: '变更后',
        key: 'afterChange',
        render: (h, params) => {
          if (this.versionKey === params.row.id) {
            return h('div', [
              h('Input', {
                props: {
                  value: params.row.afterChange,
                },
                on: {
                  input: (val) => {
                    params.row.afterChange = val;
                  },
                },
              }),
            ]);
          }
          return h('Tooltip', {
            props: {
              content: params.row.afterChange,
              aaa: params,
            },
          }, [params.row.afterChange]);
        },
        ellipsis: true,
      },
      {
        title: '变更原因',
        key: 'causeChange',
        render: (h, params) => {
          if (this.versionKey === params.row.id) {
            return h('div', [
              h('Input', {
                props: {
                  value: params.row.causeChange,
                },
                on: {
                  input: (val) => {
                    params.row.causeChange = val;
                  },
                },
              }),
            ]);
          }
          return h('Tooltip', {
            props: {
              content: params.row.causeChange,
              aaa: params,
            },
          }, [params.row.causeChange]);
        },
        ellipsis: true,
      },
      {
        title: '需求方',
        key: 'needPeople',
        render: (h, params) => {
          if (this.versionKey === params.row.id) {
            return h('div', [
              h('Input', {
                props: {
                  value: params.row.needPeople,
                },
                on: {
                  input: (val) => {
                    params.row.needPeople = val;
                  },
                },
              }),
            ]);
          }
          return h('Tooltip', {
            props: {
              content: params.row.needPeople,
              aaa: params,
            },
          }, [params.row.needPeople]);
        },
        ellipsis: true,
      },
      {
        title: '修订人',
        key: 'userName',
        render: (h, params) => {
          // if (this.versionKey === params.row.id) {
          //   return h('div', [
          //     h('Input', {
          //       props: {
          //         value: params.row.userName,
          //       },
          //       on: {
          //         input: (val) => {
          //           params.row.userName = val;
          //         },
          //       },
          //     }),
          //   ]);
          // }
          return h('Tooltip', {
            props: {
              content: params.row.userName,
              aaa: params,
            },
          }, [params.row.userName]);
        },
        ellipsis: true,
      },
      {
        title: '变更时间',
        key: 'updateTime',
        render: (h, params) => {
          if (this.versionKey === params.row.id) {
            return h('div', [
              h('DatePicker', {
                props: {
                  type: 'date',
                  value: params.row.updateTime,
                },
                on: {
                  'on-change': (val) => {
                    params.row.updateTime = val;
                  },
                },
              }),
            ]);
          }
          return h('Tooltip', {
            props: {
              content: this.formatDate2(params.row.updateTime),
              aaa: params,
            },
          }, [this.formatDate2(params.row.updateTime)]);
        },
        ellipsis: true,
      },
      {
        key: '',
        renderHeader: h => h('div', [
          h('Button', {
            props: {
              type: 'text',
              icon: 'ios-plus-outline',
            },
            style: {
              fontSize: '20px',
            },
            on: {
              click: () => {
                const item = { version: '', beforeChange: '', afterChange: '', causeChange: '', needPeople: '', systemId: this.tdId, userId: JSON.parse(this.userInfo).userId };
                const params = {
                  systemId: this.tdId,
                  data: item,
                  callback: (response) => {
                    this.versionKey = response.data.id;
                  },
                };
                this.jmVersionRecordsAdd(params);
              },
            },
          }),
        ]),
        ellipsis: true,
        render: (h, params) => {
          if (this.versionKey === params.row.id) {
            return h('div', [
              h('span', {
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                    this.versionKey = '';
                    console.log(params.row);
                    this.jmVersionRecordsUpdate(params.row);
                  },
                },
              }, ['确定']),
              h('span', {
                style: {
                  marginLeft: '10px',
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                    this.versionKey = '';
                  },
                },
              }, ['取消']),
            ]);
          }
          return h('div', [
            h('Button', {
              props: {
                type: 'text',
                icon: 'compose',
              },
              style: {
                fontSize: '20px',
              },
              on: {
                click: () => {
                  this.versionKey = params.row.id;
                },
              },
            }),
            h('Button', {
              props: {
                type: 'text',
                icon: 'trash-a',
              },
              style: {
                fontSize: '20px',
                marginLeft: '10px',
              },
              on: {
                click: () => {
                  const p = {
                    id: params.row.id,
                    systemId: params.row.systemId,
                  };
                  this.jmVersionRecordsRemove(p);
                },
              },
            }),
            // h('Button', {
            //   props: {
            //     type: 'text',
            //     icon: 'ios-plus',
            //   },
            //   class: this.lastid === params.row.id ? 'versionShow' : 'versionHide',
            //   style: {
            //     fontSize: '20px',
            //     marginLeft: '10px',
            //   },
            //   on: {
            //     click: () => {
            //       this.versionKey = params.row.id + 1;
            //       this.d = new Date();
            //     },
            //   },
            // }),
          ]);
        },
      },
    ];
  },
  methods: {
    ...mapActions([
      'tdTagResult',
      'jwoodAdd',
      'jwoodRemove',
      'jmMapperRelationsResult',
      'jwoodMapperAdd',
      'jwoodMapperRemove',
      'jwoodjmTagsRemove',
      'selectTags',
      'jmTags',
      'mapperImpl',
      'mapperImplTree',
      'jmMapperImplsAdd',
      'jmMapperImplsUpdate',
      'jwoodjmTagsAdd',
      'mapperImplRemove',
      'blackList',
      'blackListAdd',
      'tdTree',
      'blackListRemove',
      'jmVersionRecords',
      'jmVersionRecordsAdd',
      'jmVersionRecordsUpdate',
      'jmVersionRecordsRemove',
    ]),
    ...mapMutations([
      'changeName',
      'changeConfigTags',
      'changeShowConfig',
    ]),
    selectItem(name) {
      this.menuVal = name;
      this.changeName(name);
      // if (name === '1') {
      //   this.tdTagResult();
      // } else if (name === '2') {
      //   this.jmMapperRelationsResult();
      // }
    },
    changeTd() {
      this.islived = false;
    },
    updateVersion(val) {
      this.tdId = val;
      this.jmVersionRecords(val);
      this.isScan = true;
    },
    formatDate2(date) {
      const time = new Date(date);
      const Y = time.getFullYear();
      const M = time.getMonth() + 1 >= 10 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`;
      const D = time.getDate() >= 10 ? time.getDate() : `0${time.getDate()}`;
      return `${Y}-${M}-${D}`;
    },
    uploadMethod() {
      this.isShow = true;
    },
    uploadType() {
      if (this.tdVal === '') {
        this.$Message.warning('请先选择体系');
      }
    },
    searchTag() {
      const params = {};
      params[this.searchType] = this.searchVal;
      this.jmTags(params);
    },
    exportCsv() {
      this.$refs.table.export();
    },
    okUpdate() {
      const p = {};
      p.tdtypeId = this.tdtypeData.tdtypeId;
      p.mapperId = this.tdtypeData.mapperId;
      p.id = this.tdtypeData.id;
      p.groupId = this.jwoodTags[this.jwoodTags.length - 2].id;
      this.jmMapperImplsUpdate(p);
    },
    cancelUpdate() {
      console.log(11);
    },
    okUpload() {
      if (this.$refs.info.uploadList.length) {
        this.$refs.info.upload();
      } else {
        this.$Message.error('上传文件不能为空');
        this.isShow = true;
        this.$refs.uploadModal.visible = true;
      }
    },
    cancelUpload() {
    },
    beforeUpload() {
      this.$Message.loading({
        duration: 0,
        content: '上传中',
      });
    },
    changeTitles() {
      const temp = [];
      this.titles.forEach((title) => {
        this.showTitles.forEach((item) => {
          if (title === item.value) {
            temp.push({
              label: item.label,
              value: item.value,
            });
          }
        });
      });
      this.$store.state.resultTitles = temp;
    },
    handleSuccess(response) {
      this.$Message.destroy();
      if (response.code === 200) {
        this.$Notice.success({
          title: '提示',
          desc: '上传成功',
        });
      }
      if (this.configName === '1') {
        if (response.code === 801) {
          this.$Notice.error({
            title: '提示',
            desc: 'name、code、parentCode都不允许为空',
          });
        } else if (response.code === 803) {
          this.$Notice.error({
            title: '提示',
            desc: 'sid、spid都不允许为空',
          });
        }
      } else if (this.configName === '2') {
        if (response.code === 601) {
          this.$Notice.error({
            title: '提示',
            desc: '上传code匹配不上',
          });
        } else if (response.code === 602) {
          this.$Notice.error({
            title: '提示',
            desc: '上传code 和名字不匹配',
          });
        } else {
          this.mapperImpl();
        }
      } else if (this.configName === '3') {
        if (response.code === 901) {
          this.$Notice.error({
            title: '提示',
            desc: 'metaid或mapperTagCode不符合要求',
          });
        } else if (response.code === 902) {
          this.$Notice.error({
            title: '提示',
            desc: 'appName与metaid不匹配或mapperTagName与mapperTagCode不匹配',
          });
        } else {
          this.blackList({ type: 4 });
        }
      } else if (this.configName === '4') {
        if (response.code === 901) {
          this.$Notice.error({
            title: '提示',
            desc: 'metaid或mapperTagCode不符合要求',
          });
        } else if (response.code === 902) {
          this.$Notice.error({
            title: '提示',
            desc: 'appName与metaid不匹配或mapperTagName与mapperTagCode不匹配',
          });
        } else {
          this.blackList({ type: 5 });
        }
      } else if (this.configName === '5') {
        if (response.code === 901) {
          this.$Notice.error({
            title: '提示',
            desc: 'metaid或mapperTagCode不符合要求',
          });
        } else if (response.code === 902) {
          this.$Notice.error({
            title: '提示',
            desc: 'appName与metaid不匹配或mapperTagName与mapperTagCode不匹配',
          });
        } else {
          this.blackList({ type: 1 });
        }
      }
    },
    aa() {
      this.jmMapperImplsUpdate({ id: 1, tdtypeId: 97, mapperId: 1029 });
    },
    addDefaultTitle() {
//    对所有可以展示的title进行遍历匹配需要展示的title
      this.titles = [];
      const arr = [];
      this.$store.state.resultTitles = [];
      this.showTitles.forEach((item) => {
        if (item.isShow) {
          this.titles.push(item.value);
          arr.push({ label: item.label, value: item.value });
        }
      });
      this.$store.state.resultTitles = arr;
    },
    showMask() {
    //  this.showAddMask = true;
      this.$refs.addList.add();
      this.$store.state.showConfig = true;
    },
    ok() {
      const userInfo = JSON.parse(this.userInfo);
      this.$store.state.showConfig = false;
      this.jwoodTagInfo.userId = userInfo.userId;
      this.jwoodTagInfo.userName = userInfo.displayName;
      this.jwoodTagInfo.tid = this.jwoodTags[1].id;
      const params = this.jwoodTagInfo;
      params.sid = params.sid === '' ? '' : Number(params.sid);
      if (this.configName === '1') {
        if (this.jwoodTags.length !== 2) {
          if (this.jwoodTags.length > 3) {
            params.parentcode = this.jwoodTags[this.jwoodTags.length - 2].code;
            params.spid = this.groupId;
          } else {
            params.spid = 1;
            params.parentcode = null;
            params.level = 1;
          }
          this.jwoodjmTagsAdd(params);
        } else {
          this.jwoodAdd(params);
        }
      } else if (this.configName === '2') {
        params.mapppingName = params.name;
        params.mapppingDescribe = params.description;
        params.mappingStates = 0;
        console.log(params);
        if (this.jwoodTags.length === 2) {
          this.jwoodMapperAdd(params);
        } else {
          const p = {};
          p.tdtypeId = this.tdtypeData.tdtypeId;
          p.mapperId = this.tdtypeData.mapperId;
          p.groupId = this.jwoodTags[this.jwoodTags.length - 2].id;
          this.jmMapperImplsAdd(p);
        }
      } else if (this.configName === '3') {
        const p = {
          metaid: Number(this.configList.metaid),
          userId: userInfo.userId,
          type: 4,
          mapperTagIds: String(this.configList.tree[this.configList.tree.length - 1]),
          systemId: Number(this.configList.tree[0]),
        };
        this.blackListAdd(p);
      } else if (this.configName === '4') {
        const p = {
          metaid: Number(this.configList.metaid),
          userId: userInfo.userId,
          type: 5,
          mapperTagIds: String(this.configList.tree[this.configList.tree.length - 1]),
          systemId: Number(this.configList.tree[0]),
        };
        console.log(p);
        this.blackListAdd(p);
      } else if (this.configName === '5') {
        const p = {
          metaid: Number(this.configList.metaid),
          userId: userInfo.userId,
          type: 1,
          mapperTagIds: String(this.configList.tree[this.configList.tree.length - 1]),
          systemId: Number(this.configList.tree[0]),
        };
        this.blackListAdd(p);
      }
    },
    cancel() {
      this.$store.state.showConfig = false;
    },
    remove() {
      if (this.listArr.length) {
        if (this.configName === '1') {
          if (this.jwoodTags.length === 2) {
            if (this.listArr.length > 1) {
              this.$Message.warning('体系不能批量删除');
            } else if (this.listArr.length === 1) {
              this.jwoodRemove(this.listArr[0].id);
            }
          } else {
            const arr = [];
            this.listArr.forEach((item) => {
              arr.push(item.id);
            });
            const str = JSON.stringify(arr);
            this.jwoodjmTagsRemove(str);
          }
        } else if (this.configName === '2') {
          if (this.jwoodTags.length === 2) {
            if (this.listArr.length > 1) {
              this.$Message.warning('映射体系不能批量删除');
            } else if (this.listArr.length === 1) {
              this.jwoodMapperRemove(this.listArr[0].id);
            }
          } else {
            const arr = [];
            this.listArr.forEach((item) => {
              arr.push(item.id);
            });
            const str = JSON.stringify(arr);
            this.mapperImplRemove(str);
          }
        } else if (this.configName === '3' || this.configName === '4' || this.configName === '5') {
          const arr = [];
          this.listArr.forEach((item) => {
            arr.push(item.id);
          });
          const str = JSON.stringify(arr);
          this.blackListRemove(str);
        }
      } else {
        this.$Message.warning('请选择要处理的数据...');
      }
    },
    changeTags(tag) {
      if (this.jwoodTags !== 2) {
        this.jwoodTags.splice(this.jwoodTags.indexOf(tag) + 1, this.jwoodTags.length);
        this.jwoodTags.push('');
      }
    },
  },
  components: {
    List,
    configAdd,
    tipList,
    uploadInfo,
  },
  watch: {
    showConfig() {
      this.showAddMask = this.showConfig;
    },
    d() {
      const item = { version: '', before_change: '', after_change: '', cause_change: '', need_people: '', userName: '', update_time: '', id: this.lastid + 1 };
      this.versionData.push(item);
    },
    versionList() {
      this.versionData = this.versionList;
      if (this.versionList.length > 0) {
        this.lastid = this.versionData[this.versionData.length - 1].id;
      }
    },
    showUpdate() {
      this.updateStatus = true;
    },
    configName() {
      if (this.configName === '1') {
        this.$store.state.jwoodTags = [{ name: '标签体系', code: '' }, ''];
      } else if (this.configName === '2') {
        this.$store.state.jwoodTags = [{ name: 'BaseCode', code: '' }, ''];
      } else if (this.configName === '3') {
        this.addTitle = '新增黑名单';
        this.modalTitle = '新增黑名单';
        this.type = 4;
        this.blackList({ type: 4 });
      } else if (this.configName === '4') {
        this.addTitle = '新增白名单';
        this.modalTitle = '新增白名单';
        this.type = 5;
        this.blackList({ type: 5 });
      } else if (this.configName === '5') {
        this.addTitle = '新增锁定清单';
        this.modalTitle = '新增锁定清单';
        this.type = 1;
        this.blackList({ type: 1 });
      }
    },
    jwoodTags() {
      // const op = this.jwoodTags.some(item => item.id === 1);
      if (this.jwoodTags[0].name === '标签体系') {
        // if (this.jwoodTags.length === 3) {
        //   const params = {};
        //   this.jmTags(params);
        //   this.addTitle = '新增标签';
        //   this.modalTitle = '新增标签';
        //   this.addDefaultTitle();
        // } else
        if (this.jwoodTags.length !== 2) {
          const params = {};
          this.jmTags(params);
          this.addTitle = '新增标签';
          this.modalTitle = '新增标签';
          // this.showTitles = [
          //   { label: '标签id', value: 'sid', isShow: true },
          //   { label: '标签', value: 'name', isShow: true },
          //   { label: '标签code', value: 'code', isShow: true },
          //   { label: '标签描述', value: 'description', isShow: true },
          //   { label: '创建时间', value: 'createTime', isShow: true },
          //   { label: '更新时间', value: 'updateTime', isShow: true },
          // ];
          this.addDefaultTitle();
        } else {
          this.tdTagResult();
          this.addTitle = '新增体系';
          this.modalTitle = '新增体系';
        }
      } else if (this.jwoodTags[0].name === 'BaseCode') {
        if (this.jwoodTags.length !== 2) {
          const params = {};
          params.groupId = this.jwoodTags[this.jwoodTags.length - 2].id;
          this.mapperImpl(params);
          this.addTitle = '新增映射详情';
          this.modalTitle = '新增映射详情';
        } else {
          this.jmMapperRelationsResult();
          this.addTitle = '新增映射体系';
          this.modalTitle = '新增映射体系';
        }
      }
    },
    menuVal() {
      if (this.menuVal === '1') {
        const tags = [{ name: '标签体系', code: '' }, ''];
        this.changeConfigTags(tags);
      } else if (this.menuVal === '2') {
        const tags = [{ name: 'BaseCode', code: '' }, ''];
        this.changeConfigTags(tags);
      }
    },
  },
};
</script>

