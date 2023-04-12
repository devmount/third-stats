// init app
import { createApp } from 'vue';
import Stats from '@/Stats.vue';
const app = createApp(Stats);

// set global properties
app.config.globalProperties.$version = APP_VERSION;

// reusable functionalities
app.mixin({
	methods: {
		twoDigit: n => n.toFixed(2),
		oneDigit: n => n.toFixed(1),
		round: (n,d) => Number(Math.round(n + "e+" + d) + "e-" + d),
	},
});

// internationalization
import { createI18n } from 'vue-i18n';
import { messages, pluralRules } from "@/translations.js";
const i18n = createI18n({
	locale: messenger.i18n.getUILanguage(),
	fallbackLocale: "en",
	messages,
	pluralRules,
});
app.use(i18n);

// ready? let's go!
app.mount('#stats');
