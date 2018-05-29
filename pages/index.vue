<template>
  <v-layout>
    <v-flex class="charts" xs12 sm12 md4>
      <Charts></Charts>
    </v-flex>
    <v-flex xs12 sm12 md8>
      <Table></Table>
    </v-flex>
  </v-layout>
</template>

<script>
import Charts from '~/components/Charts.vue'
import Table from '~/components/Table.vue'
import Eos from 'eosjs'

export default {
  components: {
    Charts,
    Table
  },
  created() {
    this.connect()
  },
  methods: {
    connect() {
      let config = {
        keyProvider: [''], // WIF string or array of keys..
        httpEndpoint: process.env.blockchainEndpoint,
        mockTransactions: () => 'pass', // or 'fail'
        transactionHeaders: (expireInSeconds, callback) => {
          callback(null/*error*/, headers)
        },
        expireInSeconds: 60,
        broadcast: true,
        debug: false,
        sign: true
      }
      this.getTransactions(Eos.Localnet(config))
    },
    getTransactions(eos) {
      eos.getTransactions(process.env.eosAccountName).then(data => {
        this.parseTransactionsForTransfers(eos, data)
      })
    },
    parseTransactionsForTransfers(eos, data) {
      let vm = this;
      let promises = data['transactions'].map(transaction => {
        return eos.getTransaction(transaction.transaction_id).then(result => {
          return result
        })
      })
      Promise.all(promises).then(function(results) {
        let transfers = [];

        // Only grab transfers
        results.forEach(result => {
          transfers.push(result.transaction.transaction.actions.filter(action => {
            if (action.name == 'transfer') {
              return action
            }
          }));
        })

        vm.formatTransfers(vm.removeEmpties(transfers))
      })
    },
    formatTransfers (transfers) {
      let data = []
      transfers.forEach(transfer => {
        transfer.forEach(trans => {
          data.push(trans.data);
        });
      });

      this.parseMemos(data)
    },
    parseMemos (transfers) {
      let vm = this
      let transactions = []
      let columns = [
        { text: 'QTY', value: 'quantity' },
        { text: 'From', value: 'from' },
        { text: 'To', value: 'to' }
      ]
      transfers.forEach(transfer => {
        let memo = transfer.memo
        memo.replace(/\\\//g, '/')
        // preserve newlines, etc - use valid JSON
        memo = memo.replace(/\\n/g, '\\n')
                   .replace(/\\'/g, "\\'")
                   .replace(/\\"/g, '\\"')
                   .replace(/\\&/g, '\\&')
                   .replace(/\\r/g, '\\r')
                   .replace(/\\t/g, '\\t')
                   .replace(/\\b/g, '\\b')
                   .replace(/\\f/g, '\\f');
        // remove non-printable and other non-valid JSON chars
        memo = memo.replace(/[\u0000-\u0019]+/g, '');
        if (memo.search('{"') != -1) {
          memo = memo.slice(memo.search('{"'))
          try {
            memo = JSON.parse(memo)
            Object.keys(memo).forEach(key => {
              let new_column = {
                text: key.charAt(0).toUpperCase() + key.slice(1),
                value: key
              }
              if (!vm.containsColumn(new_column, columns)) {
                columns.push(new_column);
              }
            })
          }
          catch(err) {
            memo = {}
          }
        } else {
          memo = {}
        }
        memo.quantity = parseFloat(transfer.quantity.slice(0, -4))
        memo.from = transfer.from
        memo.to = transfer.to
        memo.raw_memo = transfer.memo

        transactions.push(memo)
      })

      columns.push({
        text: 'Raw Memo',
        value: 'raw_memo'
      })

      this.$store.dispatch('saveTableData', {
        'transactions' : transactions,
        'columns' : columns
      })
      vm.formatChartsData(transactions)
    },
    formatChartsData(transactions) {
      let config = process.env.charts
      for (let i = 0; i < config.length; i++) {
        let filteredData = []
        let filters = config[i].filters
        let flag = 0
        if (filters == null || filters.length == 0 || typeof filters['operation'] == 'undefined') {
          filteredData = transactions
        } else if (filters['operation'] == 'AND') {
          transactions.filter(transaction => {
            flag = 0
            for (let key in filters)
            {
              if (key != 'operation') {
                if (transaction[key] != filters[key]) {
                  flag = 1
                }
              }
            }
            if (flag == 0) {
              filteredData.push(transaction)
            }
          })
        } else if (filters['operation'] == 'OR') {
          transactions.filter(transaction => {
            flag = 0
            for (let key in filters)
            {
              if (key != 'operation') {
                if (transaction[key] == filters[key]) {
                  flag = 1
                }
              }
            }
            if (flag == 1) {
              filteredData.push(transaction)
            }
          })
        }

        let chunkedData = {}
        if (config[i].groupBy == null || config[i].groupBy.length == 0) {
          chunkedData['total'] = filteredData;
        } else {
          chunkedData = this.organize(filteredData, config[i].groupBy);
        }

        let labels = []
        let data = []
        for (let key in chunkedData){
          if (key == 'undefined'){
            if (config[i]['showUndefined']){
              let total = 0
              labels.push(key)
              chunkedData[key].forEach(transaction => {
                total += transaction.quantity
              })
              data.push(total)
            }
          } else {
            let total = 0
            labels.push(key)
            chunkedData[key].forEach(transaction => {
              total += transaction.quantity
            })
            data.push(total)
          }
        }

        let chartData
        if (config[i].type == 'bar')
        {
          let label
          if (config[i].groupBy == null || config[i].groupBy.length == 0) {
            label = 'total'
          } else {
            label = config[i].groupBy[0]
          }
          chartData = {
            labels: labels,
            datasets: [{
              label: label,
              backgroundColor: 'rgb(255, 153, 0)',
              data: data
            }]
          }
        } else {
          let colors = []
          for (let i = 0; i < data.length; i++) {
            colors.push('#' + (Math.random() * 0xFFFFFF << 0).toString(16))
          }
          chartData = {
            labels: labels,
            datasets: [{
              backgroundColor: colors,
              data: data
            }]
          }
        }

        this.$store.dispatch('save' + config[i].type.charAt(0).toUpperCase() + config[i].type.slice(1) + 'ChartData', chartData)
      }
    },
    containsColumn(new_column, columns) {
      for (let i = 0; i < columns.length; i++){
        if (columns[i].value == new_column.value) {
          return true;
        }
      }

      return false;
    },
    removeEmpties(array) {
      return array.filter(a => {
        return a.length
      })
    },
    organize(rows, groupBy) {
      let last = groupBy.length - 1;
      return rows.reduce((res, obj) => {
        groupBy.reduce((res, grp, i) =>
          res[obj[grp]] || (res[obj[grp]] = i == last ? [] : {}), res).push(obj);
        return res;
      }, {});
    }
  }
}
</script>
