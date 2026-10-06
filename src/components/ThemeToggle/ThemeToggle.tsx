import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

// Same key as public/theme-init.js, which applies the saved theme before React starts.
const THEME_KEY = "theme";
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

// The theme on screen right now: the visitor's choice, or else the system setting.
function currentTheme(): Theme {
	const chosen = document.documentElement.dataset.theme;
	if (chosen === "light" || chosen === "dark") return chosen;
	return systemDark.matches ? "dark" : "light";
}

type ThemeToggleProps = {
	className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
	const [theme, setTheme] = useState<Theme>(currentTheme);

	// Until the visitor picks a theme, keep the icon in sync if the system setting changes.
	useEffect(() => {
		const onSystemChange = () => setTheme(currentTheme());
		systemDark.addEventListener("change", onSystemChange);
		return () => systemDark.removeEventListener("change", onSystemChange);
	}, []);

	function toggleTheme() {
		const next: Theme = theme === "dark" ? "light" : "dark";
		document.documentElement.dataset.theme = next;
		try {
			localStorage.setItem(THEME_KEY, next);
		} catch {
			// Storage unavailable: the theme still changes, it just won't be remembered.
		}
		setTheme(next);
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
