import Vue from 'vue'
import Popup from './Popup.vue'

// vue configuration
Vue.config.productionTip = false
Vue.config.devtools = false

// internationalization
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
let messages = {
	cs: require('../public/_locales/cs/messages.json'),
	de: require('../public/_locales/de/messages.json'),
	en: require('../public/_locales/en/messages.json'),
	fr: require('../public/_locales/fr/messages.json'),
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
