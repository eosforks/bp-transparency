<template>
    <div class="transactions">
        <!-- <div class="alert" v-if="unformatted > 0">
            {{ unformatted }} transaction(s) had a memo that could not be parsed.
        </div> -->
        <h2>Transactions</h2>
        <pre>{{ memos }}</pre>
    </div>
</template>

<script>
import Eos from 'eosjs'
export default {
  data () {
    return {
      accountName: process.env.eosAccountName,
      eos: null,
      result: null,
      transactions: null,
      transfers: null,
      memos: null,
      unformatted: 0,
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
      let memos = []
      transfers.forEach(transfer => {
        let memo = transfer.memo;
        memo.replace(/\\\//g, "/");
        try {
          memo = JSON.parse(memo)
          memo.quantity = parseFloat(transfer.quantity.slice(0, -4))
          memos.push(memo)
        }
        catch(err) {
          vm.unformatted++
        }
      });
      vm.memos = memos

      vm.formatBarChartData(vm.memos)
    },
    formatBarChartData(memos) {
        let chunkedData = organize(memos, ['class']);
        
        let labels = []
        let data = []

        for (var key in chunkedData) {
            labels.push(key)
        }
        for (var key in chunkedData) {
            let total = 0
            chunkedData[key].forEach(memo => {
                total += memo.quantity
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
    removeEmpties(array) {
      return array.filter(a => {
        return a.length
      })
    }
  }
}
function organize(rows, groupBy) {
    var last = groupBy.length - 1;
    return rows.reduce ( (res, obj) => {
        groupBy.reduce( (res, grp, i) => 
            res[obj[grp]] || (res[obj[grp]] = i == last ? [] : {}), res).push(obj);
        return res;
    }, {});
}
</script>

<style lang="scss">
.transactions {
    flex: 1;
    max-width: 520px;
    border: 1px solid rgb(128, 128, 128);
    background: rgb(239, 239, 239);
    padding: 15px;
    font-size: 14px;
    h2 {
        margin-bottom: 20px;
    }
    .alert {
        padding: 30px;
        margin: 0 0 15px 0;
        text-align: center;
        background-color: rgb(255, 158, 158);
        border: 1px solid rgb(255, 86, 86)
    }
}
</style>
