<template>
    <v-card :style="height">
        <BarChart :chartData="barChartData"></BarChart>
        <PieChart :chartData="pieChartData"></PieChart>
    </v-card>
</template>

<script>
import BarChart from '~/components/charts/BarChart.vue'
import PieChart from '~/components/charts/PieChart.vue'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      height: {}
    }
  },
  components: {
    BarChart,
    PieChart
  },
  computed: {
    ...mapGetters([
      'barChartData',
      'pieChartData'
    ])
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener('resize', this.setHeight)

      //Init
      this.setHeight()
    })
  },
  methods: {
    setHeight(event) {
      this.height = 'height: ' + (document.documentElement.clientHeight - 100) + 'px'
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setHeight);
  }
}
</script>