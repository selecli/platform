<template>
   <div :id="id" style="width: 600px;height:400px;"></div>
</template>
<script>
  export default {
    name: 'chart',
    data() {
      return {
      };
    },
    props: ['option', 'id'],
    mounted() {
      this.init();
    },
    methods: {
      init() {
        const myChart = this.$echarts.init(document.getElementById(this.id));
        const option = this.option;
        myChart.setOption(option);
      },
    },
    watch: {
      option: {
        handler() {
          this.init();
        },
      },
    },
  };
</script>
