<template>
    <v-card>
        <v-card-title>
            <h3>TRANSACTIONS</h3>
            <v-spacer></v-spacer>
            <v-text-field
                v-model="search"
                append-icon="search"
                label="Search"
                single-line
                hide-details
            ></v-text-field>
        </v-card-title>
        <v-data-table
            :headers="keys"
            :items="transaction_data"
            :search="search"
            :disable-initial-sort="true"
            v-if="transaction_data != null"
        >
            <template slot="items" slot-scope="props">
                <td v-for="key in keys" :key="key.value">{{ props.item[key.value] }}</td>
            </template>
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results.
            </v-alert>
        </v-data-table>
    </v-card>
</template>

<script>
import Eos from 'eosjs'
export default {
  data() {
    return {
      keys: [
        { text: 'QTY', value: 'quantity' },
        { text: 'From', value: 'from' },
        { text: 'To', value: 'to' }
      ],
      accountName: process.env.eosAccountName,
      eos: null,
      result: null,
      transactions: null,
      transaction_data: null,
      transfers: null,
      search: '',
      chartData: null
    }
  },
  created() {
    let vm = this
    vm.connect()
    vm.getTransactions()
  },
  methods: {
    connect () {
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
      this.eos = Eos.Localnet(config);
    },
    getTransactions () {
      let vm = this;
      vm.eos.getTransactions(vm.accountName).then(result => {
        vm.transactions = result['transactions']
        vm.parseTransactionsForTransfers(result)
      })
    },
    parseTransactionsForTransfers (transactions) {
      let vm = this;
      let promises = transactions['transactions'].map(transaction => {
        return vm.eos.getTransaction(transaction.transaction_id).then(result => {
          return result
        })
      })
      Promise.all(promises).then(function(results) {
          let transfers = [];

          // Only grab transfers
          results.forEach(result => {
            transfers.push(result.transaction.transaction.actions.filter(action => {
              if(action.name == "transfer") {
                return action
              }
            }));
          })

          // Remove empties
          transfers = vm.removeEmpties(transfers);

          // Set
          vm.transfers = transfers

          // Format
          vm.formatTransfers()
      })
    },
    formatTransfers () {
      let vm = this
      let transfers = []
      vm.transfers.forEach(transfer => {
        transfer.forEach(data => {
          transfers.push(data.data);
        });
      });

      vm.transfers = transfers
      vm.parseMemos(vm.transfers)
    },
    parseMemos (transfers) {
      let vm = this
      let transaction_data = []
      let keys = vm.keys
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
        memo = memo.replace(/[\u0000-\u0019]+/g,"");
        if (memo.search('{"') != -1) {
            memo = memo.slice(memo.search('{"'))
            try {
                memo = JSON.parse(memo)
                Object.keys(memo).forEach(key => {
                    let newkey = {
                        text: key.charAt(0).toUpperCase() + key.slice(1),
                        value: key
                    }
                    if (!vm.containsKey(newkey, keys)) {
                        keys.push(newkey);
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

        transaction_data.push(memo)
      });

      vm.transaction_data = transaction_data
      vm.keys = keys
      vm.formatBarChartData(vm.transaction_data)
    },
    formatBarChartData(transaction_data) {
        let chunkedData = this.organize(transaction_data, ['class']);

        let labels = []
        let data = []

        for (let key in chunkedData) {
            labels.push(key)
        }
        for (let key in chunkedData) {
            let total = 0
            chunkedData[key].forEach(transaction_data => {
                total += transaction_data.quantity
            })
            data.push(total)
        }
        let chartData = {
            labels: labels,
            datasets: [{
                label: 'Classes',
                backgroundColor: 'rgb(255, 153, 0)',
                data: data
            }]
        }

        this.chartData = chartData;
        this.$store.dispatch('changeBarChartData', chartData)
    },
    organize(rows, groupBy) {
        let last = groupBy.length - 1;
        return rows.reduce ( (res, obj) => {
            groupBy.reduce( (res, grp, i) =>
            res[obj[grp]] || (res[obj[grp]] = i == last ? [] : {}), res).push(obj);
            return res;
        }, {});
    },
    containsKey(obj, list) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].value == obj.value) {
                return true;
            }
        }

        return false;
    },
    removeEmpties(array) {
      return array.filter(a => {
        return a.length
      })
    }
  }
}
</script>
