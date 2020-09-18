import Vue from 'vue'
import Stats from './Stats.vue'

Vue.config.productionTip = false
Vue.config.devtools = false

// global mixins
Vue.mixin({
	methods: {
		twoDigit: n => n.toFixed(2),
		oneDigit: n => n.toFixed(1),
		round: (n,d) => Number(Math.round(n + "e+" + d) + "e-" + d),
	},
})

new Vue({
	render: h => h(Stats),
}).$mount('#stats')
