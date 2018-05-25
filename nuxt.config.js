module.exports = {
  /*
  ** Environment
  */
  env: {
    blockchainEndpoint: 'http://workshop.eosocal.io',
    eosAccountName: 'eosocal',
    rowsPerPage: 9,
    chartFilters: [],
    chartGroupBy: ['class']
  },
  /*
  ** CSS and SCSS
  */
  css: [
    { src: '~/assets/css/app.styl', lang: 'styl' }
  ],
  /*
  ** Headers of the page
  */
  head: {
    title: 'bpaccountability',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Project to track the accountability of block producers' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    vendor: [
      'eosjs'
    ],
    extractCSS: true
  },
  /*
  ** Watchers explicitly stated for Windows
  */
  watchers: {
    webpack: {
      poll: true
    }
  },
  /*
  ** Plugins
  */
  plugins: [
    '~/plugins/eosjs',
    '~/plugins/vuetify'
  ]
}
