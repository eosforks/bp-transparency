import Vuex from 'vuex'

const store = () => {
  return new Vuex.Store({
    state: {
      transactionData: {
        transactions: null,
        columns: null
      },
      chartData: {}
    },
    getters: {
      transactionData: state => {
        return state.transactionData
      },
      chartData: state => {
        return state.chartData
      }
    },
    actions: {
      saveTransactionData(context, transactionData) {
        context.commit('saveTransactionData', transactionData)
      },
      saveChartData(context, chartData) {
        context.commit('saveChartData', chartData)
      }
    },
    mutations: {
      saveTransactionData(state, transactionData) {
        state.transactionData.transactions = transactionData.transactions
        state.transactionData.columns = transactionData.columns
      },
      saveChartData(state, chartData) {
        state.chartData = chartData
      }
    }
  })
}

export default store
