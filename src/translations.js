import { pluralPolish, pluralUkrainian } from '@/utils.js';

import ca from '../public/_locales/ca/messages.json'; // Catalan
import cs from '../public/_locales/cs/messages.json'; // Czech
import de from '../public/_locales/de/messages.json'; // German
import en from '../public/_locales/en/messages.json'; // English
import es from '../public/_locales/es/messages.json'; // Spanish
import fi from '../public/_locales/fi/messages.json'; // Finish
import fr from '../public/_locales/fr/messages.json'; // French
import gl from '../public/_locales/gl/messages.json'; // Galician
import hi from '../public/_locales/hi/messages.json'; // Hindi
import hu from '../public/_locales/hu/messages.json'; // Hungarian
import id from '../public/_locales/id/messages.json'; // Indonesian
import it from '../public/_locales/it/messages.json'; // Italian
import nl from '../public/_locales/nl/messages.json'; // Dutch
import ja from '../public/_locales/ja/messages.json'; // Japanese
import pl from '../public/_locales/pl/messages.json'; // Polish
import pt from '../public/_locales/pt/messages.json'; // Portuguese
import ptbr from '../public/_locales/pt-BR/messages.json'; // Brazilian Portuguese
import ru from '../public/_locales/ru/messages.json'; // Russian
import sk from '../public/_locales/sk/messages.json'; // Slovak
import sv from '../public/_locales/sv/messages.json'; // Swedish
import th from '../public/_locales/th/messages.json'; // Thai
import tr from '../public/_locales/tr/messages.json'; // Turkish
import uk from '../public/_locales/uk/messages.json'; // Ukrainian
import uz from '../public/_locales/uz/messages.json'; // Uzbek
import zhcn from '../public/_locales/zh-Hans-CN/messages.json'; // Chinese (China, Simplified)
import zhtw from '../public/_locales/zh-Hant-TW/messages.json'; // Chinese (Taiwan, Traditional)

export const messages = {
	ca,
	cs,
	de,
	en,
	es,
	fi,
	fr,
	gl,
	hi,
	hu,
	id,
	it,
	nl,
	ja,
	pl,
	pt,
	ptbr,
	ru,
	sk,
	sv,
	th,
	tr,
	uk,
	uz,
	zhcn,
	zhtw,
};

export const pluralRules = {
	pl: pluralPolish,
	uk: pluralUkrainian,
};

export const getDateFnsLocale = async (lang) => {
	switch (lang) {
		case 'ca':
			return (await import('date-fns/locale/ca')).default;
		case 'cs':
			return (await import('date-fns/locale/cs')).default;
		case 'de':
			return (await import('date-fns/locale/de')).default;
		case 'en':
			return (await import('date-fns/locale/en-GB')).default;
		case 'es':
			return (await import('date-fns/locale/es')).default;
		case 'fi':
			return (await import('date-fns/locale/fi')).default;
		case 'fr':
			return (await import('date-fns/locale/fr')).default;
		case 'gl':
			return (await import('date-fns/locale/gl')).default;
		case 'hi':
			return (await import('date-fns/locale/hi')).default;
		case 'hu':
			return (await import('date-fns/locale/hu')).default;
		case 'id':
			return (await import('date-fns/locale/id')).default;
		case 'it':
			return (await import('date-fns/locale/it')).default;
		case 'nl':
			return (await import('date-fns/locale/nl')).default;
		case 'ja':
			return (await import('date-fns/locale/ja')).default;
		case 'pl':
			return (await import('date-fns/locale/pl')).default;
		case 'pt':
			return (await import('date-fns/locale/pt')).default;
		case 'pt-BR':
			return (await import('date-fns/locale/pt-BR')).default;
		case 'ru':
			return (await import('date-fns/locale/ru')).default;
		case 'sk':
			return (await import('date-fns/locale/sk')).default;
		case 'sv':
			return (await import('date-fns/locale/sv')).default;
		case 'th':
			return (await import('date-fns/locale/th')).default;
		case 'tr':
			return (await import('date-fns/locale/tr')).default;
		case 'uk':
			return (await import('date-fns/locale/uk')).default;
		case 'uz':
			return (await import('date-fns/locale/uz')).default;
		case 'zh-CN':
			return (await import('date-fns/locale/zh-CN')).default;
		case 'zh-TW':
			return (await import('date-fns/locale/zh-TW')).default;
		default:
			return (await import('date-fns/locale/en-US')).default;
	}
};
