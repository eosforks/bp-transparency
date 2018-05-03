<template>
  <section class="container">
      <div class="charts">
        <BarChart :chartData="barChartData"></BarChart>
      </div>
      <Transactions></Transactions>
  </section>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'
import BarChart from '~/components/BarChart.vue'
import Transactions from '~/components/Transactions.vue'
import Eos from 'eosjs'
import { mapGetters } from 'vuex'

export default {
  components: {
    AppLogo,
    BarChart,
    Transactions
  },
  computed: {
    ...mapGetters([
      'barChartData'
    ])
  }
}
</script>

<style lang="scss">
.charts {
  flex: 2;
  display: flex;
  flex-wrap: wrap;
  .chart {
    max-width: 400px;
  }
}
</style>