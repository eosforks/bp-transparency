<template>
  <v-app dark>
    <navbar></navbar>
    <v-content>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Navbar from '~/components/Header.vue'

export default {
  components: {
    Navbar
  }
}
</script>
