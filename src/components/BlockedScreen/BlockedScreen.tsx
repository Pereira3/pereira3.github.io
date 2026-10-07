import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { RotateCcw, ShieldX } from "lucide-react";
import { useTimeout } from "@/hooks/useTimeout";
import { pageTitle } from "@/utils/pageTitle";
import styles from "@/components/BlockedScreen/BlockedScreen.module.css";

const ESCAPES = 3; // times the button runs from the mouse before it gives up
const NEAR = 70; // how close the mouse gets, in pixels from the button's edge, before it runs
const FAR = 220; // the least distance from the mouse it runs to, from its centre
const EDGE = 16; // the least distance from the edge of the screen
const GIVE_UP_MS = 900; // after its last escape, how long until it walks back home
const SLIDE_MS = 320; // a little longer than its slide (see BlockedScreen.module.css)

type Offset = { x: number; y: number };

// home: in its place, where it can be clicked like any button.
// away: somewhere else on screen, after running from the mouse.
// returning: sliding back home after its last escape.
// Only at home can the mouse hover or click it (see BlockedScreen.module.css).
type Phase = "home" | "away" | "returning";

// How far the pointer is from the nearest edge of the rectangle; 0 inside it.
function distanceTo(rect: DOMRect, x: number, y: number): number {
	const dx = Math.max(rect.left - x, 0, x - rect.right);
	const dy = Math.max(rect.top - y, 0, y - rect.bottom);
	return Math.hypot(dx, dy);
}

// A random spot on screen for the button, away from the pointer, as an offset from
// its home (where it sits without one). Falls back to the last spot tried.
function escapeOffset(home: DOMRect, x: number, y: number): Offset {
	const maxLeft = window.innerWidth - home.width - EDGE;
	const maxTop = window.innerHeight - home.height - EDGE;
	let left = EDGE;
	let top = EDGE;
	for (let tries = 0; tries < 30; tries++) {
		left = EDGE + Math.random() * Math.max(maxLeft - EDGE, 0);
		top = EDGE + Math.random() * Math.max(maxTop - EDGE, 0);
		const centreX = left + home.width / 2;
		const centreY = top + home.height / 2;
		if (Math.hypot(centreX - x, centreY - y) > FAR) break;
	}
	return { x: left - home.left, y: top - home.top };
}

type BlockedScreenProps = {
	onStartOver: () => void;
};

// Replaces the whole site when a visitor fails a check in Are You Human?.
// One last joke: "Start a new session" runs from the mouse three times, then gives up
// and goes back to its place. Until it's back, the mouse can't hover or click it. It
// only runs from a mouse: on touch screens there's no pointer to run from, and with
// the keyboard it works as any button does.
export function BlockedScreen({ onStartOver }: BlockedScreenProps) {
	const headingRef = useRef<HTMLHeadingElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
	const [escapes, setEscapes] = useState(0);
	const [phase, setPhase] = useState<Phase>("home");
	// Where it sits at home, measured just before it first runs.
	const homeRef = useRef<DOMRect | null>(null);

	// Focus goes to the heading, so screen readers announce it. Not to the button: a check
	// answered with Enter would otherwise "press" it straight away and skip this screen.
	useEffect(() => {
		headingRef.current?.focus();
	}, []);

	function goHome() {
		setOffset({ x: 0, y: 0 });
		setPhase("returning");
	}

	// After the last escape, it waits a moment, then walks back home and stays there.
	useTimeout(
		goHome,
		phase === "away" && escapes === ESCAPES ? GIVE_UP_MS : null,
	);
	useTimeout(() => setPhase("home"), phase === "returning" ? SLIDE_MS : null);

	// Its spot away from home was worked out for the old window size, and could now be
	// off-screen, so a resize sends it home. Its escapes are kept, and home is measured
	// again before it next runs.
	useEffect(() => {
		function handleResize() {
			setOffset({ x: 0, y: 0 });
			setPhase((current) => (current === "home" ? current : "returning"));
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	function handlePointerMove(event: PointerEvent<HTMLElement>) {
		const button = buttonRef.current;
		if (event.pointerType !== "mouse" || !button || phase === "returning")
			return;
		if (phase === "home") {
			if (escapes === ESCAPES) return; // it gave up: a normal button from now on
			homeRef.current = button.getBoundingClientRect();
		}
		const home = homeRef.current;
		if (!home) return;
		// Measured where it's going, not where it is mid-slide, so the mouse can't
		// catch it on the way.
		const at = new DOMRect(
			home.left + offset.x,
			home.top + offset.y,
			home.width,
			home.height,
		);
		if (distanceTo(at, event.clientX, event.clientY) > NEAR) return;
		// The mouse caught up after the last escape: it gives up early and goes home.
		if (escapes === ESCAPES) return goHome();
		setOffset(escapeOffset(home, event.clientX, event.clientY));
		setEscapes(escapes + 1);
		setPhase("away");
	}

	return (
		<main className={styles.screen} onPointerMove={handlePointerMove}>
			<title>{pageTitle("Access blocked")}</title>

			<ShieldX className={styles.icon} size={44} aria-hidden="true" />
			<h1 className={styles.title} ref={headingRef} tabIndex={-1}>
				Access blocked
			</h1>
			<p className={styles.message}>
				You didn't meet the requirements to access this website, so your
				access has been blocked.
			</p>

			<button
				ref={buttonRef}
				type="button"
				className={styles.button}
				data-phase={phase}
				style={{ translate: `${offset.x}px ${offset.y}px` }}
				onClick={onStartOver}
			>
				<RotateCcw size={18} aria-hidden="true" />
				Start a new session
			</button>
		</main>
	);
}
