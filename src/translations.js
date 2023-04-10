import { pluralPolish, pluralUkrainian } from "@/utils.js";

import ca   from '../public/_locales/ca/messages.json'         // Catalan
import cs   from '../public/_locales/cs/messages.json'         // Czech
import de   from '../public/_locales/de/messages.json'         // German
import en   from '../public/_locales/en/messages.json'         // English
import es   from '../public/_locales/es/messages.json'         // Spanish
import fr   from '../public/_locales/fr/messages.json'         // French
import gl   from '../public/_locales/gl/messages.json'         // Galician
import hi   from '../public/_locales/hi/messages.json'         // Hindi
import hu   from '../public/_locales/hu/messages.json'         // Hungarian
import id   from '../public/_locales/id/messages.json'         // Indonesian
import it   from '../public/_locales/it/messages.json'         // Italian
import nl   from '../public/_locales/nl/messages.json'         // Dutch
import ja   from '../public/_locales/ja/messages.json'         // Japanese
import pl   from '../public/_locales/pl/messages.json'         // Polish
import pt   from '../public/_locales/pt/messages.json'         // Portuguese
import ptbr from '../public/_locales/pt-BR/messages.json'      // Brazilian Portuguese
import ru   from '../public/_locales/ru/messages.json'         // Russian
import sk   from '../public/_locales/sk/messages.json'         // Slovak
import sv   from '../public/_locales/sv/messages.json'         // Swedish
import th   from '../public/_locales/th/messages.json'         // Thai
import tr   from '../public/_locales/tr/messages.json'         // Turkish
import uk   from '../public/_locales/uk/messages.json'         // Ukrainian
import zhcn from '../public/_locales/zh-Hans-CN/messages.json' // Chinese (China, Simplified)
import zhtw from '../public/_locales/zh-Hant-TW/messages.json' // Chinese (Taiwan, Traditional)

export const messages = {
	ca,
	cs,
	de,
	en,
	es,
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
	zhcn,
	zhtw,
}

export const pluralRules = {
	"pl": pluralPolish,
	"uk": pluralUkrainian,
}
