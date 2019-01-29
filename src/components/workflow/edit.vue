<template>
  <div class="edit">
    <Row>
      <Col :span="stepVal === 4 ? 24 : 14" >
        <div v-if="this.$router.currentRoute.name === 'workflow'">
          <Row v-if="stepVal === 2">
            <Col span="22" class="edit-app-info">
              <Row>
                <Col span="5" class ="edit-text-right">
                  <span>包名：</span>
                </Col>
                <Col span="15">
                  <span>{{tagInfo.appPackageName}}</span>  
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>包名称：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.appName" placeholder="请输入..." ></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>开发者：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.developer" placeholder="请输入..." ></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>应用版本：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.version" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>版本更新时间：</span>
                </Col>
                <Col span="14">
                  <DatePicker type="date" placeholder="选择日期" v-model="tagInfo.finalOnlineTime" style="width:100%;"></DatePicker>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>搜索状态：</span>
                </Col>
                <Col span="14">
                  <Select v-model="tagInfo.packageStatus"  clearable ref="noResult">
                      <Option v-for="item in appResultData" :value="item.value" :key="item.value" :disabled="item.disabled">{{item.label}}</Option>
                  </Select>  
                </Col>
              </Row>
            </Col>
            <Col span="22" class="edit-app-info">
              <Row>
                <Col span="5" class ="edit-text-right">
                  <span>平台：</span>
                </Col>
                <Col span="14" style="width: 160px">
                  <CheckboxGroup v-model="platform" @on-change="platChange">
                    <Checkbox label="1">ios</Checkbox>
                    <Checkbox label="2">Android</Checkbox>
                  </CheckboxGroup>
                </Col>
              </Row>
            </Col>
            <Col span="22" class="edit-app-info">
              <Row>
                <Col span="5" class ="edit-text-right">
                  <span>图标地址：</span>
                </Col>
                <Col span="15" >
                    <Input v-model="tagInfo.iconUrl"></Input>
                </Col>
                <Col span="3" offset="1">
                  <a :href="tagInfo.iconUrl" target="_blank">
                    <Button type="primary" long>跳转</Button>
                  </a>
                </Col>
              </Row>
            </Col>
            <Col span="22" class="edit-app-info">
              <Row>
                <Col span="5" class ="edit-text-right">
                  <span>参考网址：</span>
                </Col>
                <Col span="15" >
                  <Input v-model="tagInfo.referenceUrl"></Input>
                </Col>
                <Col span="3" offset="1">
                  <a :href="tagInfo.referenceUrl" target="_blank">
                    <Button type="primary" long>跳转</Button>
                  </a>
                </Col>
              </Row>
            </Col>
            <Col span="22" class="edit-app-info">
              <Row>
                <Col span="5" class ="edit-text-right">
                  <span>人工备注：</span>
                </Col>
                <Col span="19" >
                    <Input v-model="tagInfo.remark" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row v-if="stepVal === 4">
            <Col span="6" class="edit-detail-info" style="margin-right:5px;">
              <!-- <span>{{ dataDetail === '数据详情' ? '变更MetaId为：' : '合包查询：'}}</span> -->
              <Select v-model="changeTitle">
                 <Option value="name">名称</Option>
                 <Option value="metaid">metaId</Option>
              </Select>
            </Col>
            <Col span="15" class="edit-detail-info">
              <Select
                v-model="metaId" filterable remote 
                :remote-method="remoteMethod" 
                @on-change="resultItems"
                :loading="loading" >
                <Option v-for="(option, index) in metaIdData" :value="option.value" :key="index">
                    <span>{{option.value}}</span>
                    <span>{{option.label}}</span>
                </Option>
            </Select>
            <!-- <Input v-model="val3" placeholder="请输入" clearable  @on-enter="metaIdSearch"></Input>
            <div class="ivu-select-dropdown" v-if="metaIdData.length && load">
              <ul  class="ivu-select-dropdown-list">
                 <li v-for="(option,index) in metaIdData" :value="option.value" :key="index" @click="resultItems(option)" class="ivu-select-item">
                   <span>{{option.value}}</span>
                   <span>{{option.label}}</span>
                 </li>
              </ul>
            </div>   -->
            </Col>
          </Row>  


          <Row v-if="stepVal === 5">
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>名称：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.standardName" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>名称PY：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.standardNameSpell" placeholder="请输入..." @on-click="getSpell" icon="help-buoy"></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>名称EN：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.standardNameEn" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>开发者：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.developer" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>开发者EN：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.developerEn" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>公司名称：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.ipgp" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>公司名称EN：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.ipgpEn" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>渠道：</span>
                </Col>
                <Col span="14">
                  <Input v-model="tagInfo.channel" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
            <Col span="11" class="edit-app-info">
              <Row>
                <Col span="10" class ="edit-text-right">
                  <span>审核状态：</span>
                </Col>
                <Col span="14">
                  <Select v-model="tagInfo.appStatus">
                      <Option v-for="item in appStatusData" :value="item.value" :key="item.value">{{item.label}}</Option>
                  </Select>  
                </Col>
              </Row>
            </Col>  
            <Col span="22" class="edit-app-info">
              <Row>
                <Col span="5" class ="edit-text-right">
                  <span>平台：</span>
                </Col>
                <Col span="14" style="width: 160px">
                  <CheckboxGroup v-model="platform" @on-change="platChange">
                    <Checkbox label="1">ios</Checkbox>
                    <Checkbox label="2">Android</Checkbox>
                  </CheckboxGroup>
                </Col>
              </Row>
            </Col>
            <Col span="22" class="edit-app-info">
              <Row>
                <Col span="5" class ="edit-text-right">
                  <span>图标地址：</span>
                </Col>
                <Col span="15">
                  <Input v-model="tagInfo.finalIconUrl" placeholder="请输入..."></Input>
                </Col>
                <Col span="3" offset="1">
                    <a :href="tagInfo.finalIconUrl" target="_blank"><Button type="primary" long>跳转</Button></a>  
                 </Col> 
              </Row>
            </Col>
            <Col span="22" class="edit-app-info">
              <Row>
                <Col span="5" class ="edit-text-right">
                  <span>参考网址：</span>
                </Col>
                <Col span="15" >
                    <Input v-model="tagInfo.referenceUrl" placeholder="请输入..."></Input>
                </Col>
                 <Col span="3" offset="1">
                    <a :href="tagInfo.referenceUrl" target="_blank"><Button type="primary" long>跳转</Button></a>  
                 </Col> 
              </Row>
            </Col>
            <Col span="22" class="edit-app-info">
              <Row>
                <Col span="5" class ="edit-text-right">
                  <span>备注：</span>
                </Col>
                <Col span="19" >
                    <Input v-model="tagInfo.remark" placeholder="请输入..."></Input>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <!-- <Col span="24" v-if="stepVal !== 3" >
          
        </Col> -->
      </Col>
      <Col span="10" class="scroll" v-if="stepVal === 2 || stepVal === 5 || this.$router.currentRoute.name === 'sorts'">
        <Row class="edit-position">
          <Col span="4" class="edit-line-height">
            编辑标签：
          </Col>
          <Col span="16">
            <Cascader
            filterable
            ref="CascaderComp"
            :data="tagsData"
            :clearable="true"
            :render-format="showContent"
            @on-change="changeTag"
            v-model="value3"
          ></Cascader>
          </Col>
        </Row>  
        <div class="edit-right" v-for="system in tagsData" :key="system.value">
          <Col span="24" class="edit-right-title">
            <span class="common-float-left">{{system.label}}：</span>
          </Col>
          <Col span="24" class="edit-right-content">
            <div class="edit-right-tags common-float-left">
              <span v-for="tag in appTags" :key="tag.tagId" @click="delTag(tag.tagId)" v-if="tag.sourceId === system.busId">
              {{tag.pkgName || tag.tagName}}<Icon type="link" class="edit-mapper" v-if="tag.mapperStatus === 1"></Icon>
              <Icon type="close-circled" class="edit-right-tags-icon"></Icon>
            </span>
            </div>
          </Col>
          <Col span="24">
          </Col>
        </div>
      </Col>
    </Row>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import * as _ from 'lodash';

export default {
  name: 'edit',
  data() {
    return {
      tagsData: [],
      tagInfo: {},
      appTags: [],
      metaIdData: [],
      isShow: false,
      metaId: '',
      metaIdValue: '',
      loading: false,
      appStatusData: [
        { value: 1, label: '未审核' },
        { value: 2, label: '审核通过' },
        { value: 4, label: '审核失败' },
      ],
      appResultData: [],
      platform: [],
      value3: [],
      tempLabel: '',
      changeTitle: 'metaid',
    };
  },
  computed: mapState([
    'editAppInfo',
    'stepVal',
    'tags',
    'detailsSearch',
    'spinShow',
    'isLoading',
    'noResult',
    'dataDetail',
  ]),
  created() {
    this.debouncedGetAnswer = _.debounce(this.getMetaIdResult, 500);
  },
  mounted() {
    const self = this;
    if (this.stepVal === 2 || this.stepVal === 5) {
      this.getEditSystems({
        callback: (response) => {
          const temp = [];
          response.data.data.forEach((item, index) => {
            temp[index] = {};
            temp[index].label = response.data.data[index].name;
            temp[index].value = response.data.data[index].id;
            temp[index].children = [];
            temp[index].id = response.data.data[index].id;
            temp[index].busId = response.data.data[index].id;
            if (response.data.data[index].childrenSize !== 0) {
              temp[index].loading = false;
            }
          });
          const p = {
            callback: (res) => {
              res.data.data.forEach((item, index) => {
                item.forEach((todo) => {
                  todo.label = todo.name;
                  todo.value = todo.id;
                  self.fib(todo);
                });
                temp[index].children = item;
                self.tagsData = temp;
              });
            },
          };
          self.getEditTagsAll(p);
        },
      });
    }
  },
  methods: {
    ...mapActions([
      'getEditTags',
      'getEditSystems',
      'getEditTagsFirst',
      'getMetaIdDetailsSearch',
      'getEditTagsAll',
      'getNameSpell',
    ]),
    aaa() {
      this.$refs.aa.clearSingleSelect();
    },
    fib(item) {
      if (item.children.length) {
        item.children.forEach((todo) => {
          todo.label = todo.name;
          todo.value = todo.id;
          this.fib(todo);
        });
      }
    },
    getSpell() {
      this.getNameSpell({ name: this.tagInfo.standardName });
    },
  //  递归查出对应的 valueId
    fib3(arr, c) {
      arr.forEach((item) => {
        if (item.id === c) {
          this.tempLabel += `${item.label}/`;
        } else {
          this.fib3(item.children, c);
        }
      });
    },
  //  搜索结果下拉框change方法
    changeStatus(value) {
      console.log(value);
    },
    loadData(item, callback) {
      const t = item;
      t.loading = true;
      const params = {
        data: {
          busId: t.busId,
          parentCode: t.code,
        },
        callback: (response) => {
          const temp = [];
//          console.log(response);
          response.data.data.forEach((tags, index) => {
            temp[index] = {};
            temp[index].label = tags.name;
            temp[index].value = tags.id;
            temp[index].busId = tags.busId;
            temp[index].code = tags.code;
            temp[index].children = tags.children;
            if (tags.childrenSize !== 0) {
              temp[index].loading = false;
            }
          });
          t.children = temp;
          t.loading = false;
          callback();
        },
      };
//      console.log(params);
      this.getEditTags(params);
    },
    platChange(arr) {
      if (arr.length === 2) {
        this.editAppInfo.platform = 3;
      } else if (arr[0] === '1') {
        this.editAppInfo.platform = 1;
      } else if (arr[0] === '2') {
        this.editAppInfo.platform = 2;
      }
    },
    resultItems(item) {
      this.$store.state.showEditDetailsInfo = item;
    },
    metaIdSearch() {
      this.load = true;
      const query = this.val3;
      // this.metaIdData = [];
      const params = {
        p: `${this.changeTitle}=${query}`,
        callback: (response) => {
          response.data.data.forEach((item, index, arr) => {
            arr[index] = {
              value: item.metaId,
              label: item.appName,
            };
          });
          this.metaIdData = response.data.data;
        },
      };
      this.getMetaIdDetailsSearch(params);
    },
//    级联菜单选中后的方法
    changeTag(value) {
      this.tempLabel = '';
      value.forEach((item) => {
        this.fib3(this.tagsData, parseInt(item, 10));
      });
      this.tempLabel = this.tempLabel.substring(0, this.tempLabel.length - 1);
      console.log(this.tempLabel);
      const temp = {
        pkgName: this.tempLabel,
        tagId: parseInt(value[value.length - 1], 10),
        sourceId: parseInt(value[0], 10),
      };
      const tagsArr = [];
      this.appTags.forEach((item) => {
        tagsArr.push(item.pkgName || item.tagName);
      });
      if (tagsArr.indexOf(temp.pkgName) === -1) {
        this.appTags.push(temp);
      } else {
        this.$Message.error('所选标签已经存在');
      }
      console.log(this.appTags);
      //  清空级联组件的上次选择结果
      this.$refs.CascaderComp.currentValue = [];
//      this.$refs.CascaderComp.visible = false
    },
//    改变级联菜单的展示内容为空
    showContent() {
      return '';
    },
//    删除标签的方法
    delTag(tagId) {
      this.appTags.forEach((item, index) => {
        if (item.tagId === tagId) {
          this.appTags.splice(index, 1);
        }
      });
    },
    getMetaIdResult() {
      if (this.metaIdValue !== '') {
        this.loading = true;
        this.metaIdData = [];
        const params = {
          p: `${this.changeTitle}=${this.metaIdValue}`,
          callback: (response) => {
            console.log(response);
            this.loading = false;
            if (response.data.data.length) {
              response.data.data.forEach((item, index, arr) => {
                arr[index] = {
                  value: item.metaId,
                  label: item.appName,
                };
              });
              this.metaIdData = response.data.data;
            }
          },
        };
        this.getMetaIdDetailsSearch(params);
      } else {
        this.metaIdData = [];
      }
    },
//    远程搜索的方法
    remoteMethod(query) {
      this.metaIdValue = query;
    },
  },

  watch: {
    metaIdValue() {
      this.debouncedGetAnswer();
    },
    editAppInfo() {
      this.tagInfo = this.editAppInfo;
      // this.a = this.editAppInfo.packageStatus;
    //  const a = this.tagInfo.packageStatus;
      this.appResultData = [
        { label: '搜索无果', value: 13, disabled: false },
        { label: '未补全', value: 5, disabled: false },
        { label: '已补全', value: 6, disabled: true },
        { label: '人工补全', value: 7, disabled: true },
        { label: '人工修改', value: 10, disabled: true },
        { label: '包审核成功', value: 14, disabled: true },
        { label: '包审核失败', value: 15, disabled: true },
        { label: '质检修改', value: 16, disabled: true },
      ];
      if (this.tagInfo.platform === 1) {
        this.platform = ['1'];
      } else if (this.tagInfo.platform === 2) {
        this.platform = ['2'];
      } else if (this.tagInfo.platform === 3) {
        this.platform = ['1', '2'];
      } else {
        this.platform = [];
      }
      if (this.tags[0].name === 'BaseCode标签') {
        this.appTags = this.tagInfo.tagDetails;
      } else {
        this.appTags = this.tagInfo.pkgDetails;
      }
    },
    stepVal() {
      const self = this;
      if (this.stepVal === 5 || this.stepVal === 2) {
        this.getEditSystems({
          callback: (response) => {
            const temp = [];
            response.data.data.forEach((item, index) => {
              temp[index] = {};
              temp[index].label = response.data.data[index].name;
              temp[index].value = response.data.data[index].id;
              temp[index].id = response.data.data[index].id;
              temp[index].children = [];
              temp[index].busId = response.data.data[index].id;
              if (response.data.data[index].childrenSize !== 0) {
                temp[index].loading = false;
              }
            });
            const p = {
              callback: (res) => {
                res.data.data.forEach((item, index) => {
                  item.forEach((todo) => {
                    todo.label = todo.name;
                    todo.value = todo.id;
                    this.fib(todo);
                  });
                  temp[index].children = item;
                  this.tagsData = temp;
                });
              },
            };
            self.getEditTagsAll(p);
          },
        });
      }
    },
    tags() {
      if (this.tags[0].name === 'BaseCode标签') {
        console.log(8888);
        this.getEditSystems({
          data: 0,
          callback: (response) => {
            const temp = [];
            response.data.data.forEach((item, index) => {
              temp[index] = {};
              temp[index].label = response.data.data[index].name;
              temp[index].value = response.data.data[index].id;
              temp[index].children = [];
              temp[index].busId = response.data.data[index].id;
              if (response.data.data[index].childrenSize !== 0) {
                temp[index].loading = false;
              }
            });
            this.tagsData = temp;
          },
        });
      }
    },
  },
};
</script>

<style scoped>
    .ivu-btn-text{
      color:#fff;
      background-color:#2d8cf0;
      border-color:#2d8cf0;
    }
</style>

