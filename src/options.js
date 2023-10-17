// init app
import { createApp } from 'vue';
import Options from '@/Options.vue';
const app = createApp(Options);

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

// init basic css with tailwind imports
import '@/assets/main.css';

// ready? let's go!
app.mount('#options');
