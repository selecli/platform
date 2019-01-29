<template>
  <div>
    <div v-if="tags.length === 2">
      <div class="add-name common-margin-top-15">
        <span>体系名称：</span>
        <Input v-model="tagInfo.name" placeholder="请输入..." style="width: 400px;"></Input>
    </div>
      <div class="add-description common-margin-top-15">
        <span>体系描述：</span>
        <Input v-model="tagInfo.description" placeholder="请输入..." style="width: 400px;"></Input>
    </div>
    </div>
    <div  v-if="tags.length !== 2">
      <div class="add-name common-margin-top-15">
        <span>标签名称：</span>
        <Input v-model="tagInfo.name" placeholder="请输入..." style="width: 400px;"></Input>
      </div>
      <div class="add-description common-margin-top-15">
        <span>标签描述：</span>
        <Input v-model="tagInfo.description" placeholder="请输入..." style="width: 400px;"></Input>
      </div>
      <div class="add-code common-margin-top-15">
        <span>标签code：</span>
        <Input v-model="tagInfo.code" placeholder="请输入..." style="width: 400px;"></Input>
      </div>
      <div class="add-code common-margin-top-15">
        <span>英文名称：</span>
        <Input v-model="tagInfo.nameEn" placeholder="请输入..." style="width: 400px;"></Input>
      </div>
    </div>
  </div>
</template>

<script>

import { mapState } from 'vuex';

export default {
  name: 'add',
  data() {
    return {
    };
  },
  computed: mapState([
    'tags',
    'tagInfo',
  ]),
  mounted() {
  },
  methods: {
  },
  components: {
  },
};
</script>
