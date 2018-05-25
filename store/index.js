import Vuex from 'vuex'

const store = () => {
  return new Vuex.Store({
    state: {
      tableData: {
        transactions: null,
        columns: null
      },
      chartData: {}
    },
    getters: {
      tableData: state => {
        return state.tableData
      },
      chartData: state => {
        return state.chartData
      }
    },
    actions: {
      saveTableData(context, tableData) {
        context.commit('saveTableData', tableData)
      },
      saveChartData(context, chartData) {
        context.commit('saveChartData', chartData)
      }
    },
    mutations: {
      saveTableData(state, tableData) {
        state.tableData.transactions = tableData.transactions
        state.tableData.columns = tableData.columns
      },
      saveChartData(state, chartData) {
        state.chartData = chartData
      }
    }
  })
}

export default store
