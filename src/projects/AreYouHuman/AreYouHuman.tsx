import { Fragment, useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useSiteAccess } from "@/hooks/useSiteAccess";
import { useStopwatch } from "@/hooks/useStopwatch";
import { shuffledSteps, steps } from "@/projects/AreYouHuman/steps";
import styles from "@/projects/AreYouHuman/AreYouHuman.module.css";

type Phase = "start" | "running" | "passed";

// The step's countdown: running, stopped, or gone for the rest of the step. The first
// two are named like CSS's animation-play-state, so the bar can use them as they are.
type Timer = "running" | "paused" | "removed";

// A whole verification's time, e.g. "45s" or "3m 07s".
function formatDuration(ms: number): string {
	const total = Math.round(ms / 1000);
	const minutes = Math.floor(total / 60);
	const seconds = total % 60;
	if (minutes === 0) return `${seconds}s`;
	return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

// A row of bot checks. While they run, the rest of the site is locked; a wrong answer,
// running out of time or leaving the page closes the website.
export function AreYouHuman() {
	const { pathname } = useLocation();
	const { lock, unlock, blockAccess } = useSiteAccess();
	const [phase, setPhase] = useState<Phase>("start");
	const [order, setOrder] = useState(steps); // shuffled again on every start
	const [index, setIndex] = useState(0);
	const [timer, setTimer] = useState<Timer>("running");
	// Times the whole verification, from Start to the last check. The time is only
	// shown once every check has passed. Failing or leaving the page replaces the site
	// with BlockedScreen, which removes this component and its stopwatch with it, so
	// the next attempt always starts from zero.
	const stopwatch = useStopwatch();
	const headingRef = useRef<HTMLHeadingElement>(null);
	const titleId = useId();

	// Moves keyboard and screen-reader focus to each new check.
	useEffect(() => {
		if (phase !== "start") headingRef.current?.focus();
	}, [phase, index]);

	function start() {
		lock(pathname);
		stopwatch.start();
		setOrder(shuffledSteps());
		setIndex(0);
		setTimer("running");
		setPhase("running");
	}

	function pass() {
		setTimer("running");
		if (index + 1 < order.length) {
			setIndex(index + 1);
		} else {
			unlock();
			stopwatch.stop();
			setPhase("passed");
		}
	}

	const step = order[index];

	return (
		<div className={styles.stage}>
			<section className={styles.card} aria-labelledby={titleId}>
				{phase === "start" && (
					<>
						<ShieldCheck
							className={styles.stepIcon}
							size={40}
							aria-hidden="true"
						/>
						<h2
							className={styles.heading}
							id={titleId}
							ref={headingRef}
							tabIndex={-1}
						>
							Prove you're human
						</h2>
						<p className={styles.text}>
							There are {steps.length} checks, each with a time
							limit. While you take them, the rest of the site is
							locked. Fail a check, run out of time or leave this
							page, and your access to the website is blocked.
						</p>
						<div className={styles.answers}>
							<button
								type="button"
								className={styles.primary}
								onClick={start}
							>
								Start verification
							</button>
						</div>
					</>
				)}

				{phase === "running" && (
					<>
						<div className={styles.header}>
							<h2
								className={styles.counter}
								id={titleId}
								ref={headingRef}
								tabIndex={-1}
							>
								Check {index + 1} of {order.length}
							</h2>
							{/* The bar empties over the step's time limit; when it's empty, the site
							    closes, unless the step passes when its time is up. */}
							{timer !== "removed" && (
								<div
									className={styles.timer}
									role="presentation"
								>
									<div
										key={step.id}
										className={styles.timerFill}
										style={{
											animationDuration: `${step.seconds}s`,
											animationPlayState: timer, // "running" or "paused" here
										}}
										// The site closes when the bar empties, except for a step
										// that passes by itself then (see passesWhenTimeIsUp).
										onAnimationEnd={
											step.passesWhenTimeIsUp
												? undefined
												: blockAccess
										}
									/>
								</div>
							)}
						</div>
						{/* The key gives each check a fresh start, even when two checks look alike. */}
						<Fragment key={step.id}>
							{step.render({
								pass,
								fail: blockAccess,
								pauseTimer: () => setTimer("paused"),
								removeTimer: () => setTimer("removed"),
							})}
						</Fragment>
					</>
				)}

				{phase === "passed" && (
					<>
						<BadgeCheck
							className={styles.stepIcon}
							size={40}
							aria-hidden="true"
						/>
						<h2
							className={styles.heading}
							id={titleId}
							ref={headingRef}
							tabIndex={-1}
						>
							You're human. Probably.
						</h2>
						<p className={styles.text}>
							All {steps.length} checks passed. The rest of the
							site is unlocked again.
						</p>
						<p className={styles.time}>
							Your time:{" "}
							<strong>
								{formatDuration(stopwatch.elapsedMs)}
							</strong>
						</p>
						<div className={styles.answers}>
							<button
								type="button"
								className={styles.secondary}
								onClick={start}
							>
								Verify again
							</button>
						</div>
					</>
				)}
			</section>
		</div>
	);
}
