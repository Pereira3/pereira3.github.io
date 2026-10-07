import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Hand } from "lucide-react";
import { useTimeout } from "@/hooks/useTimeout";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/HoldStep.module.css";

const TARGET_MS = 3000;
const MARGIN_MS = 500; // letting go between 2.5 and 3.5 seconds passes
const MAX_MISSES = 3; // wrong holds allowed; the next one blocks access
const PASSED_MS = 1200; // time to see the result before the next check

// In seconds with one decimal, e.g. "2.4s".
function seconds(ms: number): string {
	return `${(ms / 1000).toFixed(1)}s`;
}

// Hold the button for exactly 3 seconds, with nothing on screen counting them. Only
// after letting go does it say how long that was, so the next try can do better.
export function HoldStep({ pass, fail, pauseTimer }: StepProps) {
	const [holding, setHolding] = useState(false);
	const [last, setLast] = useState<number | null>(null); // the last hold, in ms
	const [misses, setMisses] = useState(0);
	const [passed, setPassed] = useState(false);
	const startedAt = useRef(0);

	useTimeout(pass, passed ? PASSED_MS : null);

	function press() {
		if (holding || passed) return;
		startedAt.current = performance.now();
		setHolding(true);
	}

	function release() {
		if (!holding) return;
		const held = performance.now() - startedAt.current;
		setHolding(false);
		setLast(held);
		if (Math.abs(held - TARGET_MS) <= MARGIN_MS) {
			// The visitor has answered; seeing the result shouldn't cost them the time.
			pauseTimer();
			setPassed(true);
		} else if (misses >= MAX_MISSES) {
			fail();
		} else {
			setMisses(misses + 1);
		}
	}

	// Only the main button holds (a finger or pen counts as one), not a right or middle
	// click. The pointer is captured, so letting go outside the button still counts.
	function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
		if (event.button !== 0) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		press();
	}

	// Space or Enter work as well, held down like the button. Keys repeat while held,
	// so only the first press counts.
	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key !== " " && event.key !== "Enter") return;
		event.preventDefault();
		if (!event.repeat) press();
	}

	function handleKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key === " " || event.key === "Enter") release();
	}

	function result() {
		if (passed) return `${seconds(last ?? 0)}. Spot on 🎯`;
		if (last === null) return "";
		const how = last < TARGET_MS ? "Too short" : "Too long";
		return `${how}: ${seconds(last)}. ${misses} of ${MAX_MISSES} misses used.`;
	}

	return (
		<>
			<p className={shared.instruction}>
				Hold the button for exactly 3 seconds.
			</p>

			<button
				type="button"
				className={styles.button}
				data-holding={holding}
				disabled={passed}
				onPointerDown={handlePointerDown}
				onPointerUp={release}
				onPointerCancel={release}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				onBlur={release}
				// A long press on a phone would otherwise open a menu.
				onContextMenu={(event) => event.preventDefault()}
			>
				<Hand size={36} aria-hidden="true" />
				{holding ? "Holding…" : "Hold me"}
			</button>

			<p className={shared.counter} role="status">
				{result()}
			</p>
		</>
	);
}
