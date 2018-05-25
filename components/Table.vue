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
            :headers="tableData.columns"
            :items="tableData.transactions"
            :search="search"
            :disable-initial-sort="true"
            :pagination.sync="pagination"
            hide-actions
            class="elevation-1"
            v-if="tableData.columns != null"
        >
            <template slot="headerCell" slot-scope="props">
                <v-tooltip bottom>
                    <span slot="activator">
                        {{ props.header.text }}
                    </span>
                    <span>
                        {{ props.header.text }}
                    </span>
                </v-tooltip>
            </template>
            <template slot="items" slot-scope="props">
                <td v-for="column in tableData.columns" :key="column.value">{{ props.item[column.value] }}</td>
            </template>
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results.
            </v-alert>
        </v-data-table>
        <div class="text-xs-center pt-2">
            <v-pagination v-model="pagination.page" :length="pages"></v-pagination>
        </div>
    </v-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      search: '',
      pagination: {}
    }
  },
  created() {
    this.pagination.rowsPerPage = process.env.rowsPerPage
  },
  computed: {
    ...mapGetters([
      'tableData'
    ]),
    pages() {
      if (this.pagination.rowsPerPage == null || this.pagination.totalItems == null)
        return 0
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    }
  }
}
</script>
