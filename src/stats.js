// init app
import { createApp } from 'vue';
import Stats from '@/Stats.vue';
const app = createApp(Stats);

// provide global properties
app.provide('version', APP_VERSION);

// internationalization
import { createI18n } from 'vue-i18n';
import { messages, pluralRules } from "@/translations.js";
const i18n = createI18n({
	legacy: false,
	globalInjection: true,
	locale: messenger.i18n.getUILanguage(),
	fallbackLocale: "en",
	messages,
	pluralRules,
});
app.use(i18n);

// ready? let's go!
app.mount('#stats');
