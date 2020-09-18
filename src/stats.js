import Vue from 'vue'
import Stats from './Stats.vue'

Vue.config.productionTip = false
Vue.config.devtools = false

new Vue({
  render: h => h(Stats),
}).$mount('#stats')
