<template>
    <div class="history-container">
        <div style="margin-top:30px; margin-left:25px;">
            <Row>
                <Col span="3">
                    <Select v-model="type" @on-change="changeType">
                      <Option v-for="item in typeList" :key="item.value" :value="item.value">{{item.label}}</Option>
                    </Select>
                </Col>
                <Col span="3" style="margin-left:20px;">
                    <Input :placeholder="place" icon="ios-search" @on-click="search" v-model="content" @on-enter="search"></Input>
                </Col>
                <Col span="3" style="margin-left:20px;">
                  <Button type="primary" @click="sub">sdk</Button>
                </Col>
            </Row> 
        </div>
        <div class="history-list">
            <list></list>
        </div>
    </div>
</template>
<script>
    import { mapActions, mapState } from 'vuex';
    import list from '../components/workflow/list';

    export default {
      name: 'history',
      data() {
        return {
          type: 1,
          place: '请输入metaid',
          typeList: [
            {
              label: 'Metaid详情查询：',
              value: 1,
            },
            {
              label: '合包查询：',
              value: 2,
            },
          ],
          content: '',
        };
      },
      computed: mapState([
        'historyValue',
      ]),
      methods: {
        ...mapActions([
          'getResultData',
          'appResultHistories',
          'mergeHistories',
          'getUserPower',
          'callSdkToApk',
        ]),
        changeType(val) {
          this.content = '';
          if (val === 1) {
            this.place = '请输入metaid';
          } else {
            this.place = '请输入包名';
          }
        },
        search() {
          this.$store.state.historyType = this.type;
          this.$store.state.historyValue = this.content !== '' ? this.content : null;
          if (this.type === 1) {
            this.appResultHistories({ metaid: this.content !== '' ? this.content : null });
          } else if (this.type === 2) {
            this.mergeHistories({ pkgName: this.content !== '' ? this.content : null });
          }
          this.$store.state.currentPage = 1;
        },
        sub() {
          this.callSdkToApk();
        },
      },
      components: {
        list,
      },
      mounted() {
        this.getResultData();
        this.getUserPower();
      },
    };
</script>

