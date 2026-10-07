// What the browser tells every website about the visitor, without asking them.
// The checks turn it into questions, to show how much a page knows from the start.
// They only ask about what the browser reports, never what it suggests about the
// person: a browser set to Portuguese doesn't make its user Portuguese.

export type Language = {
	code: string; // e.g. "pt"
	name: string; // in English, e.g. "Portuguese"
};

// The browser's preferred language, e.g. { code: "pt", name: "Portuguese" } for "pt-PT".
// null when it isn't a language the browser can name: missing, made up ("klingon"),
// or not even shaped like a language code ("<img …>", which makes .of() throw).
// So only real language names ever reach the page.
export function browserLanguage(): Language | null {
	try {
		const code = navigator.language.split("-")[0].toLowerCase();
		const names = new Intl.DisplayNames(["en"], {
			type: "language",
			fallback: "none", // undefined for unknown codes, instead of the code itself
		});
		const name = names.of(code);
		return name ? { code, name } : null;
	} catch {
		return null;
	}
}

// The visitor's local time, e.g. "14:32".
export function localTime(): string {
	return new Date().toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

// True when the browser may be hiding its real time zone, so the local time can't be
// trusted: Tor Browser and Firefox's fingerprinting protection report plain UTC
// wherever the visitor is. Real places have named zones, like "Europe/London".
export function timeZoneHidden(): boolean {
	const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	return !zone || zone === "UTC" || zone === "Etc/UTC" || zone === "Etc/GMT";
}

// The operating system's name, from the user agent the browser sends with every request.
// Unlike the browser's own name (Brave, for one, says it's Chrome), browsers rarely hide it.
// Order matters: iPhones also say "Mac OS X", and Android also says "Linux".
export function systemName(): string | null {
	const agent = navigator.userAgent;
	if (/iPhone|iPod/.test(agent)) return "iOS";
	// iPads say "Macintosh", like a Mac, but unlike a Mac they have a touch screen.
	if (
		agent.includes("iPad") ||
		(agent.includes("Macintosh") && navigator.maxTouchPoints > 1)
	)
		return "iPadOS";
	if (agent.includes("Android")) return "Android";
	if (agent.includes("CrOS")) return "ChromeOS";
	if (agent.includes("Windows")) return "Windows";
	if (agent.includes("Macintosh")) return "macOS";
	if (agent.includes("Linux")) return "Linux";
	return null;
}
