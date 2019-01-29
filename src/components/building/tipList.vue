<template>
    <Table :columns="exportTitle" :data="exportList"  v-show="false" ref="tab"></Table>
</template>
<script>
  import { mapState } from 'vuex';

  export default {
    name: 'tipList',
    data() {
      return {
        exportTitle: [],
        exportList: [],
        name: '示例文件',
      };
    },
    computed: mapState([
      'configName',
      'route',
    ]),
    methods: {
      export() {
        this.$refs.tab.exportCsv({
          filename: this.name,
        });
      },
    },
    mounted() {
    },
    watch: {
      route() {
        if (this.$router.currentRoute.name === 'independent') {
          this.exportTitle = [
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
          ];
          this.exportList = [
            {
              metaid: 3,
              pkg_hash: 4070304398262397922,
              pkg_name: 'com.android.mms',
              app_name: 'CM7短信补丁',
              mapper_tag_id: 1027,
            },
          ];
          this.name = '自主加工模板';
        } else if (this.$router.currentRoute.name === 'config') {
          if (this.configName === '1') {
            this.exportTitle = [
              { title: 'sid', key: 'sid' },
              { title: 'spid', key: 'spid' },
              { title: 'name', key: 'name' },
              { title: 'code', key: 'code' },
              { title: 'parentcode', key: 'parentcode' },
              { title: 'description', key: 'description' },
            ];
            this.exportList = [
              {
                sid: 13,
                spid: 23,
                name: 'yang游戏',
                code: 101010,
                parentcode: 10101,
                description: '玩游戏',
              },
            ];
            this.name = '标签模板';
          }
        }
      },
      configName() {
        if (this.configName === '1') {
          this.exportTitle = [
            { title: 'sid', key: 'sid' },
            { title: 'spid', key: 'spid' },
            { title: 'name', key: 'name' },
            { title: 'code', key: 'code' },
            { title: 'parentcode', key: 'parentcode' },
            { title: 'description', key: 'description' },
          ];
          this.exportList = [
            {
              sid: 13,
              spid: 23,
              name: 'yang游戏',
              code: 101010,
              parentcode: 10101,
              description: '玩游戏',
            },
          ];
          this.name = '标签模板';
        } else if (this.configName === '2') {
          this.exportTitle = [
            { title: 'TDTypeCode', key: 'TDTypeCode' },
            { title: 'TDTypeName', key: 'TDTypeName' },
            { title: 'mapperCode', key: 'mapperCode' },
            { title: 'mapperName', key: 'mapperName' },
          ];
          this.exportList = [
            {
              TDTypeCode: 'T101000',
              TDTypeName: '系统工具',
              mapperCode: '0101',
              mapperName: '游戏偏好',
            },
          ];
          this.name = '映射模板';
        } else if (this.configName === '3' || this.configName === '4' || this.configName === '5') {
          this.exportTitle = [
            { title: 'metaid', key: 'metaid' },
            { title: 'app_name', key: 'app_name' },
            { title: 'mapperTagName', key: 'mapperTagName' },
            { title: 'mapperTagCode', key: 'mapperTagCode' },
          ];
          this.exportList = [
            {
              metaid: 27,
              app_name: '微信',
              mapperTagName: '切东西',
              mapperTagCode: 1036,
            },
          ];
          if (this.configName === '3') {
            this.name = '黑名单模板';
          } else if (this.configName === '4') {
            this.name = '白名单模板';
          } else if (this.configName === '5') {
            this.name = '锁定清单模板';
          }
        }
      },
    },
  };
</script>

