<template>
  <v-layout>
    <v-flex class="chart" xs12 sm12 md3>
      <v-card :style="chart_height">
        <BarChart :chartData="barChartData"></BarChart>
        <BarChart :chartData="barChartData"></BarChart>
        <BarChart :chartData="barChartData"></BarChart>
      </v-card>
    </v-flex>
    <v-flex xs12 sm12 md9>
      <Transactions></Transactions>
    </v-flex>
  </v-layout>
</template>

<script>
import BarChart from '~/components/BarChart.vue'
import Transactions from '~/components/Transactions.vue'
import Eos from 'eosjs'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      chart_height: {}
    }
  },
  components: {
    BarChart,
    Transactions
  },
  computed: {
    ...mapGetters([
      'barChartData'
    ])
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener('resize', this.setChartCardHeight)

      //Init
      this.setChartCardHeight()
    })
  },
  methods: {
    setChartCardHeight(event) {
      this.chart_height = 'height: ' + (document.documentElement.clientHeight - 90) + 'px'
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setChartCardHeight);
  }
}
</script>
