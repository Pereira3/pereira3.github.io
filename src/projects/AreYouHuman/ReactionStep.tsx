import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { randomBetween } from "@/projects/AreYouHuman/random";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/ReactionStep.module.css";

const TARGETS = 10; // circles to hit in a row
const FIRST_MS = 2000; // how long the first circle takes to shrink away
const LAST_MS = 1300; // and the last one; the ones between get steadily faster

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
export function ReactionStep({ pass, fail, pauseTimer }: StepProps) {
	const [circle, setCircle] = useState<Circle | null>(null); // null until the visitor starts
	const circleRef = useRef<HTMLButtonElement>(null);
	const onMiss = useEffectEvent(fail);

	// Each circle has its own deadline, matching its shrinking animation. The deadline is a
	// timer rather than the animation's end, so it holds even if animations are turned off.
	// Focus moves to each new circle, so it can also be hit with Space or Enter.
	useEffect(() => {
		if (!circle) return;
		circleRef.current?.focus();
		const timer = window.setTimeout(onMiss, circle.ms);
		return () => window.clearTimeout(timer);
	}, [circle]);

	// Once the game starts, each circle's deadline is the clock: the step's own countdown
	// stops, so it can't run out mid-game while the visitor is still hitting circles.
	function start() {
		pauseTimer();
		setCircle(makeCircle(0));
	}

	function hit() {
		if (!circle) return;
		if (circle.index + 1 === TARGETS) pass();
		else setCircle(makeCircle(circle.index + 1));
	}

	return (
		<>
			<p className={styles.instruction}>
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

			<p className={styles.count}>
				{circle
					? `${circle.index} of ${TARGETS} hit`
					: `${TARGETS} circles, each a little faster than the last.`}
			</p>
		</>
	);
}
