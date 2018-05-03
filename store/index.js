import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: {
        barChartData: {}
    },
    getters: {
        barChartData: state => {
            return state.barChartData
        }
    },
    mutations: {
      changeBarChartData (state, payload) {
        state.barChartData = payload
      }
    },
    actions: {
        changeBarChartData (context, payload) {
            context.commit('changeBarChartData', payload)
        }
    },
  })
}

export default createStore