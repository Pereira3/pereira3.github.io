import { useEffect, useRef, useState } from "react";
import { useTimeout } from "@/hooks/useTimeout";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { randomBetween } from "@/projects/AreYouHuman/random";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/ReactionStep.module.css";

const TARGETS = 10; // circles to hit in a row
const FIRST_MS = 2600; // how long the first circle takes to shrink away
const LAST_MS = 1800; // and the last one; the ones between get steadily faster

type Circle = {
	index: number;
	x: number; // position in the play area, in percent, so it stays inside at any size
	y: number;
	ms: number; // time to hit it before it's gone
};

function makeCircle(index: number): Circle {
	return {
		index,
		x: randomBetween(12, 88),
		y: randomBetween(18, 82),
		ms: FIRST_MS - ((FIRST_MS - LAST_MS) * index) / (TARGETS - 1),
	};
}

// A reaction test in the spirit of osu!: circles appear one at a time and shrink away.
// Hit each one before it disappears, ten in a row. Missing one fails.
export function ReactionStep({ pass, fail, removeTimer }: StepProps) {
	const [circle, setCircle] = useState<Circle | null>(null); // null until the visitor starts
	const circleRef = useRef<HTMLButtonElement>(null);

	// Each circle has its own deadline, matching its shrinking animation, and a new circle
	// starts it over. The deadline is a timer rather than the animation's end, so it holds
	// even if animations are turned off.
	useTimeout(fail, circle ? circle.ms : null, circle);

	// Focus moves to each new circle, so it can also be hit with Space or Enter.
	useEffect(() => {
		circleRef.current?.focus();
	}, [circle]);

	// Once the game starts, each circle's deadline is the clock: the step's countdown and
	// its bar are removed, so it can't run out mid-game while the visitor is still hitting
	// circles, and the shrinking circle is the only time on screen.
	function start() {
		removeTimer();
		setCircle(makeCircle(0));
	}

	function hit() {
		if (!circle) return;
		if (circle.index + 1 === TARGETS) pass();
		else setCircle(makeCircle(circle.index + 1));
	}

	return (
		<>
			<p className={shared.instruction}>
				Hit each circle before it disappears.
			</p>

			<div className={styles.area}>
				{circle ? (
					<button
						key={circle.index}
						ref={circleRef}
						type="button"
						className={styles.circle}
						style={{
							left: `${circle.x}%`,
							top: `${circle.y}%`,
							animationDuration: `${circle.ms}ms`,
						}}
						aria-label={`Circle ${circle.index + 1} of ${TARGETS}`}
						onClick={hit}
					/>
				) : (
					<button
						type="button"
						className={shared.primary}
						onClick={start}
					>
						Start
					</button>
				)}
			</div>

			<p className={shared.counter}>
				{circle
					? `${circle.index} of ${TARGETS} hit`
					: `${TARGETS} circles, each a little faster than the last.`}
			</p>
		</>
	);
}
