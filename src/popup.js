import Vue from 'vue'
import Popup from './Popup.vue'

Vue.config.productionTip = false
Vue.config.devtools = false

new Vue({
  render: h => h(Popup),
}).$mount('#popup')
