import Vue from "vue"
import Stats from "./Stats.vue"

// vue local configuration
Vue.config.productionTip = false
Vue.config.devtools = false

// vue global properties
Vue.prototype.$version = process.env.VUE_APP_VERSION

// global mixins
Vue.mixin({
	methods: {
		twoDigit: n => n.toFixed(2),
		oneDigit: n => n.toFixed(1),
		round: (n,d) => Number(Math.round(n + "e+" + d) + "e-" + d),
	},
})

// internationalization
import VueI18n from "vue-i18n"
Vue.use(VueI18n)
import { pluralizationPolish } from "./utils"
import { messages } from "./translations"
const i18n = new VueI18n({
	locale: messenger.i18n.getUILanguage(),
	fallbackLocale: "en",
	messages,
	pluralizationRules: {
		"pl": (choice) => pluralizationPolish(choice)
	}
})

new Vue({
	i18n,
	render: h => h(Stats),
}).$mount("#stats")
