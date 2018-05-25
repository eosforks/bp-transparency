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
            if (action.name == "transfer") {
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
        memo.replace(/\\\//g, "/")
        // preserve newlines, etc - use valid JSON
        memo = memo.replace(/\\n/g, "\\n")
                   .replace(/\\'/g, "\\'")
                   .replace(/\\"/g, '\\"')
                   .replace(/\\&/g, "\\&")
                   .replace(/\\r/g, "\\r")
                   .replace(/\\t/g, "\\t")
                   .replace(/\\b/g, "\\b")
                   .replace(/\\f/g, "\\f");
        // remove non-printable and other non-valid JSON chars
        memo = memo.replace(/[\u0000-\u0019]+/g, "");
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

        transactions.push(memo)
      })

      this.$store.dispatch('saveTableData', {
        'transactions' : transactions,
        'columns' : columns
      })
      vm.formatChartsData(transactions)
    },
    formatChartsData(transactions) {
      let chunkedData = this.organize(transactions, process.env.chartGroupBy);

      let labels = []
      let data = []

      for (let key in chunkedData){
        labels.push(key)
      }
      for (let key in chunkedData){
        let total = 0
        chunkedData[key].forEach(transaction => {
          total += transaction.quantity
        })
        data.push(total)
      }
      let chartData = {
        labels: labels,
        datasets: [{
          label: 'Classes',
          backgroundColor: [
            '#41B883',
            '#E46651',
            '#00D8FF',
            '#DD1B16'
          ],
          data: data
        }]
      }

      this.$store.dispatch('saveChartData', chartData)
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
      return rows.reduce( (res, obj) => {
        groupBy.reduce( (res, grp, i) =>
          res[obj[grp]] || (res[obj[grp]] = i == last ? [] : {}), res).push(obj);
        return res;
      }, {});
    }
  }
}
</script>
