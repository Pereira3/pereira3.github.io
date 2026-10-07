// Every reply to a "no" that doesn't close the site (QuestionStep's replyToNo).
// QuestionStep shows them; the questions (steps.tsx, LocalTimeStep.tsx) pick which.
// The multiple-choice questions' replies are next to their choices, in steps.tsx.
//
// Most are for the questions about what the browser gave away: its language, clock and
// system. The visitor may be right to say no there, so the reply depends on whether
// the site is sure of what it asked.
// Sure: the visitor is joking, so they get a joke back, picked at random.
// Not sure: the site may have it wrong, so it says so.

// Language. Teased in the language the browser reports, since it clearly knows it:
// the joke is on the visitor. Every language has the same three, in order:
// "Ha ha, very funny", "Nice try" and "Your browser says otherwise".
// By language code (the part of the browser's tag before "-", e.g. "pt" for "pt-PT").
// A language missing here gets the English ones.
const TEASES: Record<string, string[]> = {
	en: [
		"Ha ha, very funny 😒",
		"Nice try 😏",
		"Your browser says otherwise 🤨",
	],
	pt: [
		"Ha ha, muito engraçado 😒",
		"Boa tentativa 😏",
		"O teu browser diz o contrário 🤨",
	],
	es: [
		"Ja, ja, muy gracioso 😒",
		"Buen intento 😏",
		"Tu navegador dice lo contrario 🤨",
	],
	fr: [
		"Ha ha, très drôle 😒",
		"Bien essayé 😏",
		"Ton navigateur dit le contraire 🤨",
	],
	de: [
		"Ha ha, sehr witzig 😒",
		"Netter Versuch 😏",
		"Dein Browser sieht das anders 🤨",
	],
	it: [
		"Ha ha, molto spiritoso 😒",
		"Bel tentativo 😏",
		"Il tuo browser dice il contrario 🤨",
	],
	nl: [
		"Ha ha, heel grappig 😒",
		"Leuk geprobeerd 😏",
		"Je browser zegt iets anders 🤨",
	],
	pl: [
		"Ha ha, bardzo śmieszne 😒",
		"Niezła próba 😏",
		"Twoja przeglądarka twierdzi inaczej 🤨",
	],
	sv: [
		"Ha ha, väldigt roligt 😒",
		"Snyggt försök 😏",
		"Din webbläsare säger något annat 🤨",
	],
	ru: [
		"Ха-ха, очень смешно 😒",
		"Хорошая попытка 😏",
		"Твой браузер говорит иначе 🤨",
	],
	tr: ["Ha ha, çok komik 😒", "İyi deneme 😏", "Tarayıcın öyle demiyor 🤨"],
	ja: [
		"はは、面白いね 😒",
		"残念でした 😏",
		"ブラウザはそう言ってないけど 🤨",
	],
	zh: ["哈哈，真好笑 😒", "想骗我？没门 😏", "你的浏览器可不是这么说的 🤨"],
	ko: [
		"하하, 정말 웃기네 😒",
		"어림없지 😏",
		"브라우저는 다르게 말하던데 🤨",
	],
};

// The language teases in the given language, and that language's code for the page's
// lang attribute, so screen readers read them with the right voice.
export function teasesIn(code: string): { texts: string[]; lang: string } {
	return Object.hasOwn(TEASES, code)
		? { texts: TEASES[code], lang: code }
		: { texts: TEASES.en, lang: "en" };
}

// The browser didn't report a real language, so the site asked about English.
export const LANGUAGE_UNKNOWN =
	"It seems I can't get your browser's language right, so I'm sorry for the misunderstanding 🫤";

// Time. Sure: the time shown still matches the visitor's clock.
export const TIME_JOKES = [
	"Time flies when you're lying 🙄",
	"Let me guess: you're a time traveller? 🤔",
	"You and your clock should have a little chat 😒",
];

// Not sure: the minute changed while the question was on screen.
export const TIME_CHANGED = "Ah, did you wait for the clock to tick? 🫩";

// Not sure: the browser reports plain UTC, maybe hiding its real time zone.
export const TIME_ZONE_HIDDEN =
	"It seems your browser hides its real time zone, so I may have the time wrong. Sorry for the misunderstanding 🫤";

// System. Sure: the browser named the system.
export const SYSTEM_JOKES = [
	"Either you or your system is trying to trick me, or you're not taking this seriously 🤨",
	"I can see the system you're using, you know 😏",
];

// The browser hid its system, so the site asked "Are you reading this on a screen?",
// and saying no to that has to be a joke.
export const SCREEN_DOUBTED = [
	"Then how are you reading this? 🤨",
	"Reading by telepathy, then? Impressive 🧠",
];

// Age. "Were you born on or before <18 years ago>?" right after saying they're 18 or
// older: a "no" contradicts that, so it's taken as a slip in the maths, not a minor.
export const ADULT_MISCALCULATED =
	"Hmm, do you know how to calculate your own age? 🤔 We'll assume that was a miscalculation.";
