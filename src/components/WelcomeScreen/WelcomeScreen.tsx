import { useEffect, useState } from "react";
import type { AnimationEvent, ReactNode } from "react";
import { useTimeout } from "@/hooks/useTimeout";
import styles from "@/components/WelcomeScreen/WelcomeScreen.module.css";

// A little longer than the whole animation (3.8s, see the timeline in WelcomeScreen.module.css),
// so it only matters when the fade-out never reports that it ended.
const FALLBACK_MS = 4500;

// True when the visitor has just arrived (through a link, a bookmark or the typed address),
// false when they reloaded the page or came back with Back or Forward. The browser records
// how each page load started, so nothing has to be saved to tell them apart.
function justArrived(): boolean {
	const [navigation] = performance.getEntriesByType(
		"navigation",
	) as PerformanceNavigationTiming[];
	return navigation?.type === "navigate";
}

type WelcomeScreenProps = {
	// The site, drawn underneath the welcome screen so the welcome fades straight into it.
	children: ReactNode;
};

// Shown on top of the site each time a visitor arrives: a glow spreads from the top left
// corner to the bottom right one while "Welcome" fills in white, it holds for a second,
// then everything fades away to reveal the page underneath.
export function WelcomeScreen({ children }: WelcomeScreenProps) {
	const [welcoming, setWelcoming] = useState(justArrived);
	const [fading, setFading] = useState(false);

	// The welcome covers the screen exactly, so the page behind it mustn't scroll or show
	// its scrollbar. Scrolling comes back as the fade-out starts, while the screen still
	// hides the page, so the scrollbar's return doesn't visibly shift the content.
	const scrollLocked = welcoming && !fading;
	useEffect(() => {
		if (!scrollLocked) return;
		const root = document.documentElement;
		root.style.overflow = "hidden";
		return () => {
			root.style.overflow = "";
		};
	}, [scrollLocked]);

	// Fallback: the welcome normally hides itself when its fade-out ends (below). If that never
	// happens, for example because a browser extension turns animations off, this hides it
	// anyway, so the site can't stay stuck behind the welcome screen.
	useTimeout(() => setWelcoming(false), welcoming ? FALLBACK_MS : null);

	// Only the screen's own fade-out counts, not the glow (a pseudo-element) or the word.
	function isFadeOut(event: AnimationEvent<HTMLDivElement>): boolean {
		return event.target === event.currentTarget && !event.pseudoElement;
	}

	function handleAnimationStart(event: AnimationEvent<HTMLDivElement>) {
		if (isFadeOut(event)) setFading(true);
	}

	function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
		if (isFadeOut(event)) setWelcoming(false);
	}

	// While the welcome plays, the site can't be reached with the keyboard or a screen reader.
	return (
		<>
			<div className={styles.site} inert={welcoming}>
				{children}
			</div>
			{welcoming && (
				<div
					className={styles.screen}
					onAnimationStart={handleAnimationStart}
					onAnimationEnd={handleAnimationEnd}
				>
					<p className={styles.word}>Welcome</p>
				</div>
			)}
		</>
	);
}
