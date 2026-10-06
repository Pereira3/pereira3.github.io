// Applies the visitor's saved theme before the page is drawn, so it never
// flashes the wrong colors. Runs before React. ThemeToggle uses the same "theme" key.
try {
	const theme = localStorage.getItem("theme");
	if (theme === "light" || theme === "dark") {
		document.documentElement.dataset.theme = theme;
	}
} catch {
	// Storage unavailable: the site follows the system setting.
}
