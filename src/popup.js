import Vue from "vue"
import Popup from "./Popup.vue"

// vue configuration
Vue.config.productionTip = false
Vue.config.devtools = false

// internationalization
import VueI18n from "vue-i18n"
Vue.use(VueI18n)
import { messages } from "./translations"
import { pluralizationPolish } from "./utils"
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
	render: h => h(Popup),
}).$mount("#popup")
