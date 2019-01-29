<template>
    <div class="independent-container">
      <div class="clearfix">
          <div style="margin:10px 15px; float:left; position:relative;">
            <Button type="primary" @click="uploadMethod">上传文件</Button>
            <!-- <Upload  :action="`${url}${uploadUrl}`" name="sourceFile"
                  multiple
                  :data="{systemId: tdtypeVal, userId: JSON.parse(userInfo).userId}"
                  :on-success="handleSuccess"
                  :before-upload="beforeUpload"
                  :show-upload-list="false">
              <Button
                type="primary"
                icon="ios-cloud-upload-outline">
                上传文件
              </Button>
            </Upload> -->
            <!-- <Button
                v-if="islived"
                style="position:absolute; left:0; top:0;"
                type="primary"
                @click="uploadType"
                icon="ios-cloud-upload-outline">
                上传文件
              </Button> -->
          </div>
          <!-- <div style="float:left; margin-top:10px;">
             <Select v-model="tdtypeVal" @on-change="changeType" placeholder="请选择定制体系" style="width:200px;">
               <Option v-for="item in systemData" :key="item.value" :value="item.value">{{item.label}}</Option>
             </Select>
             <Table :columns="exportTitle" :data="exportList" ref="table" v-show="!isHide"></Table>
             <Button type="primary" icon="ios-download-outline" style="margin-left:10px;" @click="exportCsv">示例文件</Button>
          </div> -->
        <div style="float:right; padding:10px 15px;">
          <Button type="primary" @click="remove">删除</Button>
        </div>
      </div>
        <div class="config-list">
          <list></List>
        </div>
        <Modal 
        v-model="isShow"
        title="批量上传"
        @on-ok="ok"
        @on-cancel="cancel"
        ref="modal"
        >
          <upload-info ref="info"></upload-info>  
        </Modal> 
    </div>
</template>
<script>
    import { mapState, mapActions } from 'vuex';
    import list from '../workflow/list';
    import uploadInfo from '../building/uploadInfo';
    
    export default {
      name: 'independent',
      data() {
        return {
          tokenValue: '',
          uploadUrl: '/jwood/jmAutoMakes/uploadCSV',
          islived: true,
          tdtypeVal: '',
          isHide: true,
          isShow: false,
          optionVal: '',
          options: [
            { label: '上传文件信息', value: '1' },
          ],
          exportList: [
            {
              metaid: 3,
              pkg_hash: 4070304398262397922,
              pkg_name: 'com.android.mms',
              app_name: 'CM7短信补丁',
              mapper_tag_id: 1027,
            },
          ],
          exportTitle: [
            {
              title: 'metaid',
              key: 'metaid',
            },
            {
              title: 'pkg_hash',
              key: 'pkg_hash',
            },
            {
              title: 'pkg_name',
              key: 'pkg_name',
            },
            {
              title: 'app_name',
              key: 'app_name',
            },
            {
              title: 'mapper_tag_code',
              key: 'mapper_tag_code',
            },
          ],
        };
      },
      computed: mapState([
        'url',
        'userInfo',
        'listArr',
        'systemData',
      ]),
      methods: {
        ...mapActions([
          'jmAutoMakesList',
          'jmAutoMakesRemove',
          'tdTagResult2',
        ]),
        beforeUpload() {
          this.$Message.loading({
            duration: 0,
            content: '上传中',
          });
        },
        ok() {
          if (this.$refs.info.uploadList.length) {
            this.$refs.info.upload();
          } else {
            this.$Message.error('上传文件不能为空');
            this.isShow = true;
            this.$refs.modal.visible = true;
          }
        },
        cancel() {
          console.log(111);
        },
        exportCsv() {
          this.$refs.table.exportCsv({
            filename: '自主加工示例文件',
          });
        },
        uploadMethod() {
          this.isShow = true;
        },
        changeOption(val) {
          console.log(typeof val);
        },
        handleSuccess(response) {
          this.$Message.destroy();
          if (response.code === 701) {
            this.$Notice.error({
              title: '提示',
              desc: 'hash和包名不能同时为空',
            });
          } else {
            this.$Notice.success({
              title: '提示',
              desc: '上传成功',
            });
            this.jmAutoMakesList();
          }
        },
        remove() {
          if (this.listArr > 0) {
            const arr = [];
            this.listArr.forEach((item) => {
              arr.push(item.id);
            });
            const str = JSON.stringify(arr);
            this.jmAutoMakesRemove(str);
          } else {
            this.$Message.warning('请选择要删除的数据');
          }
        },
        uploadType() {
          if (this.tdtypeVal === '') {
            this.$Message.warning('请选择要定制的体系');
          }
        },
        changeType(val) {
          if (val !== '') {
            this.islived = false;
          }
        },
      },
      mounted() {
        this.jmAutoMakesList();
        this.tdTagResult2();
      },
      components: {
        list,
        uploadInfo,
      },
    };
</script>
