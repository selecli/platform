<template>
    <div class="info-container">
       <div style="line-height:32px;" v-if="tdHide">
           <span style="display:inline-block;width:10px;">1.</span>
           <Select v-model="tdtypeVal" @on-change="changeType" placeholder="请选择定制体系" style="width:200px;">
               <Option v-for="item in systemData" :key="item.value" :value="item.value">{{item.label}}</Option>
            </Select>
        </div>
       <div style="line-height:32px;">
           <span style="display:inline-block;width:10px;">{{d2}}.</span>
           <span>上传文件大小上限为50M、csv、utf8格式</span>
       </div>
       <div style="line-height:32px;">
           <span style="display:inline-block;width:10px;">{{d3}}.</span>
            <a href="javascript:;" @click="exportCsv">点击下载</a>
            <span>《{{fileName}}》</span>
       </div>
       <div style="line-height:32px;">
            <span style="display:inline-block;width:10px;">{{d4}}.</span>
            <span>填写模板，并上传</span>       
       </div>
       <div style="margin-bottom:10px;">
          <p style="margin-left:10px;">字段说明：</p>
          <div style="text-indent:2em;padding-left:10px;">{{explain}}</div>
       </div>
       <div class="clearfix">
           <span style="display:inline-block;width:10px;height:30px; float:left;line-hei"></span>
            <!-- <Input style="width:200px;float:left;margin-right:20px;" v-model="name"></Input> -->
            <div style="width:300px;float:left;margin-right:20px;height:32px; line-height:32px; border:1px solid #ccc; overflow:hidden;">
                <span v-for="(item, index) in uploadList" :key="index" style="margin-left:6px;" class="fileName">{{item.name}}<i class="delete " @click="remove(item)"><Icon type="ios-close-empty" size="18" class="icon-remove" /></i></span>
            </div>
            <div style="float:left;position:relative;">
                <Upload  :action="`${url}${uploadUrl}`" name="sourceFile" ref="upload"
                    multiple
                    :data="upData"
                    :default-file-list="defaultList"
                    :on-success="handleSuccess"
                    :on-error="handleProgress"
                    :before-upload="beforeUpload"
                    :show-upload-list="false"
                    >   
                <Button>浏览文件</Button>
               </Upload>
               <Button style="position:absolute;top:0;left:0;" v-if="islived" @click="tip">浏览文件</Button>
            </div>
            
       </div>
       <tipList ref="table"></tipList>
       <!-- <p style="width:300px;text-align:center; height:30px; margin-left:10px;line-height:30px;">
           <span v-if="isSuc" style="">文件上传成功</span>
           <span v-if="isError" style="">文件上传失败</span>
        </p>   -->
    </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import tipList from './tipList';

export default {
  name: 'info',
  data() {
    return {
      isShow: false,
      title: '上传文件信息',
      tdtypeVal: '',
      tdHide: true,
      isHide: true,
      islived: true,
      exportTitle: [],
      exportList: [],
      uploadUrl: '',
      file: null,
      name: '',
      defaultList: [],
      uploadList: [],
      isSuc: false,
      isError: false,
      upData: {},
      type: 0,
      d2: 2,
      d3: 3,
      d4: 4,
      fileName: '自主加工模板',
      explain: '',
    };
  },
  computed: mapState([
    'systemData',
    'url',
    'userInfo',
    'configName',
    'groupId',
    'jwoodTags',
    'route',
  ]),
  components: {
    tipList,
  },
  methods: {
    ...mapActions([
      'mapperImpl',
      'blackList',
    ]),
    changeType(val) {
      if (val !== '') {
        this.islived = false;
      }
      console.log(typeof this.tdtypeVal);
    },
    remove(file) {
    //   const fileList = this.$refs.upload.fileList;
    //   this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
      this.uploadList.splice(this.uploadList.indexOf(file), 1);
    },
    handleSuccess(response) {
      console.log(111);
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
            desc: response.msg,
            duration: 0,
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
    beforeUpload(file) {
      this.uploadList.push(file);
      if (this.$router.currentRoute.name === 'independent') {
        this.upData = {
          systemId: this.tdtypeVal,
          userId: JSON.parse(this.userInfo).userId,
        };
      } else if (this.$router.currentRoute.name === 'config') {
        if (this.configName === '1') {
          this.upData = {
            tid: this.jwoodTags[1].id,
          };
        } else if (this.configName === '2') {
          this.upData = {
            groupId: this.groupId,
          };
        } else if (this.configName === '3' || this.configName === '4' || this.configName === '5') {
          this.upData = {
            type: this.type,
            systemId: this.tdtypeVal,
            userId: JSON.parse(this.userInfo).userId,
          };
        }
      }
      return false;
    },
    handleProgress() {
    },
    exportCsv() {
      this.$refs.table.export();
    },
    upload() {
      this.uploadList.forEach((item) => {
        this.$refs.upload.post(item);
      });
    },
    tip() {
      this.$Message.warning('请选择体系');
    },
  },
  mounted() {
    if (this.$router.currentRoute.name === 'independent') {
      this.tdHide = true;
      this.fileName = '自主加工模板';
      this.uploadUrl = '/jwood/jmAutoMakes/uploadCSV';
      this.upData = {
        systemId: this.tdtypeVal,
        userId: JSON.parse(this.userInfo).userId,
      };
      this.explain = 'metaid(metaid)，pkg_hash(hash)，pkg_name(包名)，app_name(app名称),mapper_tag_code(TDtag) ，其中hash与包名任一不为空即可。';
      this.d2 = 2;
      this.d3 = 3;
      this.d4 = 4;
    } else if (this.$router.currentRoute.name === 'config') {
      if (this.configName === '1') {
        this.tdHide = false;
        this.fileName = '标签模板';
        this.islived = false;
        this.uploadUrl = '/jwood/jmTags/uploadCSV';
        this.upData = {
          tid: this.jwoodTags[1].id,
        };
        this.explain = 'sid(定制分类id)，spid(定制分类父id)，name(定制分类名称必选)，code(定制分类code)，parentcode(定制分类父code)，description(分类描述)，其中name,code，parentcode必选。';
        this.d2 = 1;
        this.d3 = 2;
        this.d4 = 3;
      } else if (this.configName === '2') {
        this.tdHide = false;
        this.fileName = '映射模板';
        this.islived = false;
        this.uploadUrl = '/jwood/jmMapperImpls/uploadCSV';
        this.upData = {
          groupId: this.groupId,
        };
        this.explain = 'TDTypeCode(TD分类code)，TDTypeName(Td分类名称)，mapperCode(定制分类code)，mapperName(定制分类名称)，其中TDTypeCode和mapperCode为必选。';
        this.d2 = 1;
        this.d3 = 2;
        this.d4 = 3;
      } else if (this.configName === '3' || this.configName === '4' || this.configName === '5') {
        this.tdHide = true;
        if (this.configName === '3') {
          this.type = 4;
          this.fileName = '黑名单模板';
          this.explain = 'metaid(metaid)，app_name(应用名称)，mapperTagName(黑名单标签)，mapperTagCode(标签code)，其中metaid,mapperTagCode为必选。';
        } else if (this.configName === '4') {
          this.type = 5;
          this.fileName = '白名单模板';
          this.explain = 'metaid(metaid)，app_name(应用名称)，mapperTagName(白名单标签)，mapperTagCode(标签code)，其中metaid，mapperTagCode为必选。';
        } else if (this.configName === '5') {
          this.type = 1;
          this.fileName = '锁定清单模板';
          this.explain = 'metaid(metaid)，app_name(应用名称)，mapperTagName(锁定清单标签)，mapperTagCode(标签code)，其中metaid，mapperTagCode为必选。';
        }
        this.islived = true;
        this.uploadUrl = '/jwood/jmFilters/uploadCSV';
        this.upData = {
          type: this.type,
          systemId: this.tdtypeVal,
          userId: JSON.parse(this.userInfo).userId,
        };
        this.d2 = 2;
        this.d3 = 3;
        this.d4 = 4;
      }
    }
  },
  watch: {
    route() {
      this.tdtypeVal = '';
      this.file = null;
      if (this.$router.currentRoute.name === 'independent') {
        this.tdHide = true;
        this.uploadUrl = '/jwood/jmAutoMakes/uploadCSV';
        this.fileName = '自主加工模板';
        this.explain = 'metaid(metaid)，pkg_hash(hash)，pkg_name(包名)，app_name(app名称),mapper_tag_code(TDtag) ，其中hash与包名任一不为空即可。';
      } else if (this.$router.currentRoute.name === 'config') {
        if (this.configName === '1') {
          this.explain = 'sid(定制分类id)，spid(定制分类父id)，name(定制分类名称必选)，code(定制分类code)，parentcode(定制分类父code)，description(分类描述)，其中name,code，parentcode必选。';
          this.tdHide = false;
          this.fileName = '标签模板';
          this.islived = false;
          this.uploadUrl = '/jwood/jmTags/uploadCSV';
          this.d2 = 1;
          this.d3 = 2;
          this.d4 = 3;
        }
      }
    },
    configName() {
      this.tdtypeVal = '';
      this.file = null;
      if (this.configName === '1') {
        this.tdHide = false;
        this.fileName = '标签模板';
        this.islived = false;
        this.uploadUrl = '/jwood/jmTags/uploadCSV';
        this.explain = 'sid(定制分类id)，spid(定制分类父id)，name(定制分类名称必选)，code(定制分类code)，parentcode(定制分类父code)，description(分类描述)，其中name,code，parentcode必选。';
        this.d2 = 1;
        this.d3 = 2;
        this.d4 = 3;
      } else if (this.configName === '2') {
        this.tdHide = false;
        this.fileName = '映射模板';
        this.islived = false;
        this.uploadUrl = '/jwood/jmMapperImpls/uploadCSV';
        this.explain = 'TDTypeCode(TD分类code)，TDTypeName(Td分类名称)，mapperCode(定制分类code)，mapperName(定制分类名称)，其中TDTypeCode和mapperCode为必选。';
        this.d2 = 1;
        this.d3 = 2;
        this.d4 = 3;
      } else if (this.configName === '3' || this.configName === '4' || this.configName === '5') {
        this.tdHide = true;
        if (this.configName === '3') {
          this.type = 4;
          this.fileName = '黑名单模板';
          this.explain = 'metaid(metaid)，app_name(应用名称)，mapperTagName(黑名单标签)，mapperTagCode(标签code)，其中metaid,mapperTagCode为必选。';
        } else if (this.configName === '4') {
          this.type = 5;
          this.fileName = '白名单模板';
          this.explain = 'metaid(metaid)，app_name(应用名称)，mapperTagName(白名单标签)，mapperTagCode(标签code)，其中metaid，mapperTagCode为必选。';
        } else if (this.configName === '5') {
          this.type = 1;
          this.fileName = '锁定清单模板';
          this.explain = 'metaid(metaid)，app_name(应用名称)，mapperTagName(锁定清单标签)，mapperTagCode(标签code)，其中metaid，mapperTagCode为必选。';
        }
        this.islived = true;
        this.uploadUrl = '/jwood/jmFilters/uploadCSV';
        this.upData = {
          type: this.type,
          systemId: this.tdtypeVal,
          userId: JSON.parse(this.userInfo).userId,
        };
        this.d2 = 2;
        this.d3 = 3;
        this.d4 = 4;
      }
    },
    jwoodTags() {
      if (this.configName === '1') {
        this.upData = {
          tid: this.jwoodTags[1].id,
        };
      } else if (this.configName === '2') {
        this.upData = {
          groupId: this.groupId,
        };
      }
    },
  },
};
</script>

