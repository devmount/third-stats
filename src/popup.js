import Vue from 'vue'
import Popup from './Popup.vue'

// vue configuration
Vue.config.productionTip = false
Vue.config.devtools = false

// internationalization
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
let messages = {
	ca: require('../public/_locales/ca/messages.json'),
	cs: require('../public/_locales/cs/messages.json'),
	de: require('../public/_locales/de/messages.json'),
	en: require('../public/_locales/en/messages.json'),
	es: require('../public/_locales/es/messages.json'),
	fr: require('../public/_locales/fr/messages.json'),
	gl: require('../public/_locales/gl/messages.json'),
	ru: require('../public/_locales/ru/messages.json'),
	hi: require('../public/_locales/hi/messages.json'),
	it: require('../public/_locales/it/messages.json'),
	pl: require('../public/_locales/pl/messages.json'),
	pt: require('../public/_locales/pt/messages.json'),
	ru: require('../public/_locales/ru/messages.json'),
	th: require('../public/_locales/th/messages.json'),
}
const i18n = new VueI18n({
	locale: browser.i18n.getUILanguage(),
	fallbackLocale: 'en',
	messages,
})

new Vue({
	i18n,
	render: h => h(Popup),
}).$mount('#popup')
