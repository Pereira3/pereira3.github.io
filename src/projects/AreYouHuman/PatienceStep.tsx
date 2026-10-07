import { useState } from "react";
import { useTimeout } from "@/hooks/useTimeout";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { readingMs } from "@/utils/readingMs";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/PatienceStep.module.css";

const PASSED_MS = 1600; // time to read the result before the next check

// The button's label, more and more insistent while the visitor waits.
const BEGGING = [
	"Click me!",
	"Click me! 👀",
	"Pleeease click me 🥺",
	"Just once? 🙏",
	"OK man, look, if you don't press me, you will lose 🤡",
	"Like, seriously, what is wrong with you? Look at the time 😠",
	"As you wish 😁",
];

// Each label's share of the wait, by how long it takes to read, so the longer pleas
// stay up longer. They add up to 1.
const READING = BEGGING.map((beg) => readingMs(beg, { min: 1000 }));
const SHARES = READING.map((ms) => ms / READING.reduce((a, b) => a + b));

type PatienceStepProps = StepProps & {
	ms: number; // the whole wait: the step's time limit, so it ends as the bar empties
};

// A tempting "Click me!" button, and the only way to pass is not to click it. Its pleas
// fill the step's whole countdown, getting more insistent, and when the bar runs out
// the check passes (see passesWhenTimeIsUp in steps.tsx). Clicking fails.
export function PatienceStep({ ms, pass, fail }: PatienceStepProps) {
	const [begs, setBegs] = useState(0);
	const [passed, setPassed] = useState(false);

	// Each label stays for its share of the wait, then the next one. After the last one
	// the time is up, and only then does the visitor see they passed.
	useTimeout(
		() => {
			if (begs + 1 < BEGGING.length) setBegs(begs + 1);
			else setPassed(true);
		},
		passed ? null : ms * SHARES[begs],
		begs,
	);

	useTimeout(pass, passed ? PASSED_MS : null);

	return (
		<>
			<p className={shared.instruction}>Wait for it…</p>

			<div className={styles.area}>
				{passed ? (
					<p className={shared.result} role="status">
						Patience is a virtue 😌
					</p>
				) : (
					<button
						type="button"
						className={styles.button}
						onClick={fail}
					>
						{BEGGING[begs]}
					</button>
				)}
			</div>
		</>
	);
}
