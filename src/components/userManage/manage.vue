<template>
  <div class="manage-content">
    <Menu mode="horizontal" active-name="1">
      <div class="layout-assistant">
        <MenuItem name="1" @click.native="changeManageType(1)">用户管理</MenuItem>
        <MenuItem name="2" @click.native="changeManageType(2)">角色管理</MenuItem>
        <!--<MenuItem name="3" @click.native="changeManageType(3)">任务分发</MenuItem>-->
      </div>
    </Menu>
    <div class="manage-content-btns" v-show="manageType === 1">
      <Row>
        <Col span="2" offset="1">
          <Button type="primary" class="add-btn" @click="syncAllUsers">同步用户</Button>
        </Col>
        <Col span="4" class="common-float-right manage-search">
          <Input v-model="searchValue" placeholder="按用户名 / 邮箱 / 角色搜索" @on-enter="serachUser"></Input>
        </Col>
      </Row>
    </div>
    <div class="manage-content-btns" v-show="manageType === 2 && !showJurisdiction">
      <Row>
        <Col span="2" offset="1">
        <Button type="primary" class="add-btn" @click="addRole">添加</Button>
        </Col>
        <Col span="4" class="common-float-right manage-search">
        <Input v-model="searchValue" placeholder="按角色名称 / 角色权限搜索" @on-enter="serachUser"></Input>
        </Col>
      </Row>
    </div>
    <div class="manage-content-btns" v-show="manageType === 3">
      <Row>
        <Col span="2" offset="1">
        <!--<Button type="primary" class="add-btn" @click="addUser">添加</Button>-->
        </Col>
        <Col span="4" class="common-float-right manage-search">
        <Input v-model="searchValue" placeholder="请输入用户名或用户邮箱" @on-enter="serachUser"></Input>
        </Col>
      </Row>
    </div>
    <div class="manage-list" v-show="!showJurisdiction">
      <list></list>
    </div>
    <!--编辑用户的modal-->
    <Modal
      class="manage-modal"
      v-model="showAdd"
      title="编辑用户"
      @on-ok="addOk"
      @on-cancel="addCancel"
      ref="modal">
      <div class="modal-content">
        <div class="add-user-list">
          <Row>
            <Col span="5">
              <span class="add-user-name">{{manageUserInfo.displayName}}：</span>
            </Col>
            <Col span="19"><span class="add-user-name">{{manageUserInfo.email}}</span></Col>
          </Row>
          <Row>
            <Col span="5">
              <span class="add-user-name">角色:</span>
            </Col>
            <Col span="19">
            <Select
              v-model="selectedRoles"
              multiple
              filterable
              remote
              label-in-value
              ref="userRole"
              :remote-method="searchRole"
              :loading="loading2">
              <Option v-for="(option, index) in allRoles" :value="option.value" :key="index">{{option.label}}</Option>
            </Select>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
    <!--新增角色的modal-->
    <Modal
      class="add-role-modal"
      v-model="showAddRole"
      title="新增角色"
      ref="roleModal"
      ok-text="下一步"
      @on-ok="addRoleOk"
      @on-cancel="addRoleCancle">
      <Input v-model="addName" placeholder="请输入角色名称"></Input>
    </Modal>
    <!--权限管理的组件展示-->
    <jurisdiction v-show="showJurisdiction"></jurisdiction>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import list from '../workflow/list';
import jurisdiction from '../userManage/jurisdiction';

export default {
  name: 'manage',
  data() {
    return {
      searchValue: '',
      selectedRoles: [],
      loading2: false,
      showAddRole: false,
      addName: '',
    };
  },
  computed: mapState([
    'filterObj',
    'manageUserInfo',
    'showAdd',
    'allRoles',
    'listContent',
    'manageType',
    'showJurisdiction',
    'addRoleName',
  ]),
  mounted() {
    this.getUsers();
  },
  methods: {
    ...mapActions([
      'getUsers',
      'getUserManageRoles',
      'changeUserRoles',
      'getRoles',
      'syncAllUsers',
    ]),
    addRole() {
      this.showAddRole = true;
      this.$store.state.RoleInfo = {};
    },
    addRoleOk() {
      this.$store.state.addRoleName = this.addName;
      if (this.addRoleName !== '') {
        this.$store.state.showJurisdiction = true;
        this.addName = '';
      } else {
        this.showAddRole = true;
        this.$refs.roleModal.visible = true;
        this.$Message.error('请输入角色名称');
      }
    },
    addRoleCancle() {
      this.showAddRole = false;
    },
    addOk() {
      const params = {
        userId: this.manageUserInfo.userId,
        roleIds: this.manageUserInfo.roleIds,
        newRoleIds: this.selectedRoles,
      };
      this.changeUserRoles(params);
      this.$store.state.showAdd = false;
      this.selectedRoles = [];
    },
    addCancel() {
      this.getUsers();
      this.$store.state.showAdd = false;
      this.selectedRoles = [];
    },
    serachUser() {
      if (this.manageType === 1) {
        this.$store.state.filterObj.search = this.searchValue;
        this.getUsers();
      } else if (this.manageType === 2) {
        this.$store.state.filterObj.search = this.searchValue;
        this.getRoles();
      }
    },
    searchRole(query) {
      if (query !== '') {
//        利用filter方法来过滤已经选择过的角色信息
        const temp = this.allRoles.filter(item => item.label.indexOf(query) > -1);
        console.log(temp);
        if (temp.length === 0) {
          this.loading2 = true;
          const self = this;
          const params = {
            data: {
              keyword: `name=${query}`,
            },
            callback() {
              self.loading2 = false;
            },
          };
          this.getUserManageRoles(params);
        }
      } else {
        this.$store.state.allRoles = [];
      }
    },
    changeManageType(val) {
      this.$store.state.manageType = val;
    },
  },
  components: {
    list, jurisdiction,
  },
  watch: {
    manageUserInfo() {
      this.selectedRoles = [];
      this.$store.state.allRoles = [];
      this.manageUserInfo.roleDetail.forEach((item) => {
        this.$refs.userRole.selectedMultiple.push({
          label: item.name,
          value: item.id,
        });
        this.selectedRoles.push(item.id);
      });
    },
    manageType() {
      if (this.manageType === 1) {
        this.getUsers();
      } else if (this.manageType === 2) {
        this.getRoles();
      } else if (this.manageType === 3) {
        this.getUsers();
      }
    },
  },
};
</script>
