<template>
  <div class="sorts-content">
    <Menu mode="horizontal" active-name="1" @on-select="changeMenu">
    <div class="layout-assistant">
      <MenuItem name="1">标签维护</MenuItem>
      <MenuItem name="2">标签关系</MenuItem>
    </div>
  </Menu>
    <div class="layout-breadcrumb clearfix">
      <div class="layout-breadcrumb-left common-float-left">
        <Breadcrumb>
          <BreadcrumbItem v-for="tag in tags" :key="tag.id" @click.native="changeTags(tag)">{{tag.name}}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div class="layout-breadcrumb-right common-float-right">
        <div class="common-float-left"><Button type="primary" @click="deleteTags2">删除</Button></div> 
        <div class="common-float-left"><Input v-model="searchValue" placeholder="请输入检索词" @on-enter="serachTagSystem"></Input></div>
        <div class="common-float-left" v-show="addTitle !== ''"><Button type="primary" @click="showMask">{{addTitle}}</Button></div>
      </div>
    </div>
    <div class="layout-content">
      <list></list>
    </div>
    <!--新增体系及标签弹窗-->
    <Modal
      v-model="showAddMask"
      title="新增标签体系"
      @on-ok="ok"
      @on-cancel="cancel"
      ref="modal">
      <add></add>
    </Modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import list from '../components/workflow/list';
import add from '../components/sorts/add';

export default {
  name: 'sorts',
  data() {
    return {
      searchValue: '',
      showAddMask: false,  // 控制新增弹窗的变量
      addTitle: '新增体系',
      menuVal: 1,  //  导航菜单的值
    };
  },
  computed: mapState([
    'tags',
    'spinShow',
    'tagInfo',
    'listArr',
  ]),
  components: {
    list, add,
  },
  created() {
  //  this.$store.state.spinShow = true;
  },
  mounted() {
    this.getTagSystems();
    this.getUserPower();
  },
  methods: {
    ...mapActions([
      'getTagSystems',
      'selectTags',
      'addSystemInfo',
      'addTagInfo',
      'getRelationTags',
      'deleteTags',
      'deleteTypeTags',
      'getUserPower',
    ]),
//    面包屑上的方法
    changeTags(tag) {
      if (this.tags.length !== 2) {
        console.log(this.tags, tag);
      //  this.$store.state.spinShow = true;
        this.$store.state.tags.splice(this.tags.indexOf(tag) + 1, this.tags.length);
        this.$store.state.tags.push('');
      }
    },
    deleteTags2() {
      if (this.tags.length === 2) {
        let str = '';
        if (this.listArr) {
          this.listArr.forEach((item) => {
            str += `,${item.id}`;
          });
          str = str.substring(1);
          console.log(str);
          this.deleteTypeTags(str);
        }
      } else {
        let str = '';
        if (this.listArr) {
          this.listArr.forEach((item) => {
            str += `,${item.id}`;
          });
          str = str.substring(1);
          console.log(str);
          this.deleteTags(str);
        }
      }
    },
//    搜索框的方法
    serachTagSystem() {
    //  this.$store.state.spinShow = true;
      const params = {};
      if (this.tags[0].name === '标签体系') {
        if (this.searchValue !== '') {
          params.keyword = `name=${this.searchValue}`;
        } else {
          params.keyword = '';
        }
        if (this.tags.length === 2) {
          this.getTagSystems(params);
        } else {
          this.selectTags(params);
        }
      } else if (this.tags[0].name === 'BaseCode标签') {
        params.name = this.searchValue;
        this.getRelationTags(params);
      }
    },
//    新增的方法
    showMask() {
      this.showAddMask = !this.showAddMask;
    },
//    确定的方法
    ok() {
      if (this.tags.length === 2) {
        if (this.tagInfo.name === '' || this.tagInfo.description === '') {
          this.showAddMask = true;
          this.$refs.modal.visible = true;
          this.$Notice.warning({
            title: '提示',
            desc: '请填写完整数据',
          });
        } else {
          this.$Message.loading({
            content: '正在处理中...',
            duration: 0,
          });
          const self = this;
          const params = {
            data: this.tagInfo,
            callback() {
              self.$Message.destroy();
              self.$Notice.success({
                title: '提示',
                desc: '修改成功',
              });
            },
            nameError() {
              self.$Message.destroy();
              self.$Notice.error({
                title: '失败',
                desc: '名称重复',
              });
            },
          };
          delete (params.data.code);
          this.addSystemInfo(params);
        }
      } else {
        if (this.tagInfo.name === '' || this.tagInfo.code === '') {
          this.showAddMask = true;
          this.$refs.modal.visible = true;
          this.$Notice.warning({
            title: '提示',
            desc: '请填写完整数据',
            duration: 0,
          });
        }
        this.$Message.loading({
          content: '正在处理中...',
          duration: 0,
        });
        const self = this;
        const params = {
          data: this.tagInfo,
          callback() {
            self.$Message.destroy();
            self.$Notice.success({
              title: '提示',
              desc: '修改成功',
            });
          },
          nameError() {
            self.$Message.destroy();
            self.$Notice.error({
              title: '失败',
              desc: '名称重复',
            });
          },
          codeError() {
            self.$Message.destroy();
            self.$Notice.error({
              title: '失败',
              desc: 'code重复',
            });
          },
        };
        params.data.parentCode = this.tags[this.tags.length - 2].code === undefined ? '' : this.tags[this.tags.length - 2].code;
        params.data.busId = this.tags[1].id;
        params.data.level = this.tags.length - 2;
        this.addTagInfo(params);
      }
//      this.$store.state.tagInfo = {
//        name: '',
//        description: '',
//        code: '',
//      };
    },
//    取消的方法
    cancel() {
      this.$store.state.tagInfo = {
        name: '',
        description: '',
        code: '',
      };
    },
//    切换导航栏
    changeMenu(name) {
    //  this.$store.state.spinShow = true;
      this.menuVal = name;
    },
  },
  watch: {
    tags() {
      if (this.tags[0].name === '标签体系') {
        if (this.tags.length === 2) {
          this.getTagSystems();
          this.addTitle = '新增体系';
        } else {
          console.log(11);
          this.selectTags();
          this.addTitle = '新增标签';
        }
      } else if (this.tags[0].name === 'BaseCode标签') {
        this.addTitle = '';
        this.getRelationTags();
      }
    },
    menuVal() {
      if (+this.menuVal === 1) {
        this.$store.state.tags = [{ name: '标签体系', code: '' }, ''];
      } else if (+this.menuVal === 2) {
        this.$store.state.tags = [{ name: 'BaseCode标签', code: '' }, ''];
      }
    },
  },
  beforeDestroy() {
//  离开的时候还原初始状态
    this.$store.state.tags = [{ name: '标签体系', code: '' }, ''];
  },
};
</script>
