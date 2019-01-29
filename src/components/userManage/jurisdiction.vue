<template>
  <div class="jurisdiction">
    <div class="jurisdiction-top">
      <Row>
        <Col span="6" class="common-float-left jurisdiction-back">
          <Button type="text" icon="chevron-left" class="jurisdiction-back-btn" @click="back"></Button>
          <span>编辑角色对应的权限</span>
          <span>{{RoleInfo.name || addRoleName}}</span>
        </Col>
        <Col span="3" class="common-float-right">
        <Button type="success" @click="save">保存</Button>
        <Button type="error" @click="cancle">取消</Button>
        </Col>
      </Row>
    </div>
    <div class="jurisdiction-list">
      <Row class="jurisdiction-list-title">
        <Col span="6">
          作业平台<br>(页面是否可见)
        </Col>
        <Col span="8">任务分派功能</Col>
        <Col span="6">其他功能</Col>
        <Col span="4">标签</Col>
      </Row>
      <Row class="jurisdiction-list-content" v-if="index !== ''" v-for="(item, index) in showJurisdictionInfo.data" :key="index">
        <Col span="6">
          <Checkbox v-model="item[0].selected = item[0].selected === null ? false : item[0].selected" @on-change="changeViewPage(item)">
            <span>{{index}}</span>
          </Checkbox>
        </Col>
        <Col span="8" v-for="(item1,index) in item" :key="index" v-if="index > 0 && index < 2">
          <RadioGroup v-for="(row,index) in item1.data" v-model="item1.selected = item1.selected === '' ? 'null' : item1.selected" :key="row.id">
            <Radio :label="row.id">
              <span>{{row.name}}</span>
            </Radio>
            <Radio :label="null" v-if="index > 0">
              <span>无</span>
            </Radio>
          </RadioGroup>
        </Col>
        <Col span="6" v-for="(item1,index) in item" :key="index" v-if="index >= 2 && index < 3">
          <Checkbox v-model="item1.selected = item1.selected === null ? false : item1.selected" @on-change="changeViewPage(item1)">
            <span>{{item1.data[0].name}}</span>
          </Checkbox>
        </Col>
        <Col span="4"></Col>
      </Row>
    </div>
  </div>
</template>

<script>

import { mapState, mapActions } from 'vuex';

export default {
  name: 'jurisdiction',
  data() {
    return {
    };
  },
  computed: mapState([
    'showJurisdiction',
    'showJurisdictionInfo',
    'RoleInfo',
    'addRoleName',
  ]),
  mounted() {
    console.log(this.showJurisdictionInfo);
  },
  methods: {
    ...mapActions([
      'getPowers',
      'changePowers',
    ]),
    changeViewPage(role) {
      if (role[0].selected) {
        role[0].selected = role[0].data[0].id;
      } else {
        role[0].selected = null;
      }
    },
    back() {
      this.$store.state.showJurisdiction = false;
    },
    save() {
      this.changePowers();
    },
    cancle() {
      this.back();
    },
  },
  components: {
  },
  watch: {
    showJurisdiction() {
      if (this.showJurisdiction) {
        this.getPowers();
      }
    },
  },
};
</script>
