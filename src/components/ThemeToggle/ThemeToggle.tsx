import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

// Same key as public/theme-init.js, which applies the saved theme before React starts.
const THEME_KEY = "theme";
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

// The theme on screen right now: the visitor's choice, or else the system setting.
// The data-theme attribute on <html> is the one place the choice is kept.
function currentTheme(): Theme {
	const chosen = document.documentElement.dataset.theme;
	if (chosen === "light" || chosen === "dark") return chosen;
	return systemDark.matches ? "dark" : "light";
}

// Tells React when the theme on screen may have changed: when data-theme changes
// (from any toggle) or when the system setting changes.
function subscribe(onChange: () => void) {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});
	systemDark.addEventListener("change", onChange);
	return () => {
		observer.disconnect();
		systemDark.removeEventListener("change", onChange);
	};
}

type ThemeToggleProps = {
	className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
	const theme = useSyncExternalStore(subscribe, currentTheme);

	function toggleTheme() {
		const next: Theme = theme === "dark" ? "light" : "dark";
		document.documentElement.dataset.theme = next;
		try {
			localStorage.setItem(THEME_KEY, next);
		} catch {
			// Storage unavailable: the theme still changes, it just won't be remembered.
		}
	}

	const label =
		theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
	const Icon = theme === "dark" ? Sun : Moon;

	return (
		<button
			type="button"
			className={className}
			onClick={toggleTheme}
			aria-label={label}
			title={label}
		>
			<Icon size={20} aria-hidden="true" />
		</button>
	);
}
