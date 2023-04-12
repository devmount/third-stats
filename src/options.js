// init app
import { createApp } from 'vue';
import Options from '@/Options.vue';
const app = createApp(Options);

// set global properties
app.config.globalProperties.$version = APP_VERSION;

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
app.mount('#options');
