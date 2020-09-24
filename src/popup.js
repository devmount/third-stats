import Vue from 'vue'
import Popup from './Popup.vue'

// vue configuration
Vue.config.productionTip = false
Vue.config.devtools = false

// internationalization
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
let messages = {
	en: require('../public/_locales/en/messages.json'),
	de: require('../public/_locales/de/messages.json'),
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
