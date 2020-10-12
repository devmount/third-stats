import Vue from 'vue'
import Popup from './Popup.vue'

// vue configuration
Vue.config.productionTip = false
Vue.config.devtools = false

// internationalization
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
let messages = {
	'ca':    require('../public/_locales/ca/messages.json'),    // Catalan
	'cs':    require('../public/_locales/cs/messages.json'),    // Czech
	'de':    require('../public/_locales/de/messages.json'),    // German
	'en':    require('../public/_locales/en/messages.json'),    // English
	'es':    require('../public/_locales/es/messages.json'),    // Spanish
	'fr':    require('../public/_locales/fr/messages.json'),    // French
	'gl':    require('../public/_locales/gl/messages.json'),    // Galician
	'hi':    require('../public/_locales/hi/messages.json'),    // Hindi
	'it':    require('../public/_locales/it/messages.json'),    // Italian
	'pl':    require('../public/_locales/pl/messages.json'),    // Polish
	'pt':    require('../public/_locales/pt/messages.json'),    // Portuguese
	'ru':    require('../public/_locales/ru/messages.json'),    // Russian
	'th':    require('../public/_locales/th/messages.json'),    // Thai
	'zh-tw': require('../public/_locales/zh-tw/messages.json'), // Traditional Chinese
}
const i18n = new VueI18n({
	locale: messenger.i18n.getUILanguage(),
	fallbackLocale: 'en',
	messages,
})

new Vue({
	i18n,
	render: h => h(Popup),
}).$mount('#popup')
