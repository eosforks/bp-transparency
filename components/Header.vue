<template>
  <v-toolbar fixed app>
    <v-toolbar-title v-text="accountName"></v-toolbar-title>
  </v-toolbar>
</template>

<script>
  export default {
    data () {
      return {
        accountName: process.env.eosAccountName
      }
    }
  }
</script>
