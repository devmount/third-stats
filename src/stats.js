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
const messages = {
	"ca":    require("../public/_locales/ca/messages.json"),    // Catalan
	"cs":    require("../public/_locales/cs/messages.json"),    // Czech
	"de":    require("../public/_locales/de/messages.json"),    // German
	"en":    require("../public/_locales/en/messages.json"),    // English
	"es":    require("../public/_locales/es/messages.json"),    // Spanish
	"fr":    require("../public/_locales/fr/messages.json"),    // French
	"gl":    require("../public/_locales/gl/messages.json"),    // Galician
	"hi":    require("../public/_locales/hi/messages.json"),    // Hindi
	"hu":    require("../public/_locales/hu/messages.json"),    // Hungarian
	"it":    require("../public/_locales/it/messages.json"),    // Italian
	"ja":    require("../public/_locales/ja/messages.json"),    // Japanese
	"pl":    require("../public/_locales/pl/messages.json"),    // Polish
	"pt":    require("../public/_locales/pt/messages.json"),    // Portuguese
	"ru":    require("../public/_locales/ru/messages.json"),    // Russian
	"sv":    require("../public/_locales/sv/messages.json"),    // Swedish
	"th":    require("../public/_locales/th/messages.json"),    // Thai
	"tr":    require("../public/_locales/tr/messages.json"),    // Turkish
	"zh-cn": require("../public/_locales/zh-cn/messages.json"), // Simplified Chinese
	"zh-tw": require("../public/_locales/zh-tw/messages.json"), // Traditional Chinese
}
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
	render: h => h(Stats),
}).$mount("#stats")
