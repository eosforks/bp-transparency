import Vuex from 'vuex'

const store = () => {
  return new Vuex.Store({
    state: {
      tableData: {
        transactions: null,
        columns: null
      },
      barChartData: {},
      pieChartData: {}
    },
    getters: {
      tableData: state => {
        return state.tableData
      },
      barChartData: state => {
        return state.barChartData
      },
      pieChartData: state => {
        return state.pieChartData
      }
    },
    actions: {
      saveTableData(context, tableData) {
        context.commit('saveTableData', tableData)
      },
      saveBarChartData(context, barChartData) {
        context.commit('saveBarChartData', barChartData)
      },
      savePieChartData(context, pieChartData) {
        context.commit('savePieChartData', pieChartData)
      }
    },
    mutations: {
      saveTableData(state, tableData) {
        state.tableData.transactions = tableData.transactions
        state.tableData.columns = tableData.columns
      },
      saveBarChartData(state, barChartData) {
        state.barChartData = barChartData
      },
      savePieChartData(state, pieChartData) {
        state.pieChartData = pieChartData
      }
    }
  })
}

export default store
