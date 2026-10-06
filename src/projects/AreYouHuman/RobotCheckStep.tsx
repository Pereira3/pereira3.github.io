import { useEffect, useEffectEvent, useId, useState } from "react";
import { Check, LoaderCircle, ShieldCheck } from "lucide-react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import styles from "@/projects/AreYouHuman/RobotCheckStep.module.css";

type State = "idle" | "checking" | "checked";

// The classic "I'm not a robot" box: tick it, wait for the check, continue.
export function RobotCheckStep({ pass, pauseTimer }: StepProps) {
	const [state, setState] = useState<State>("idle");
	const onChecked = useEffectEvent(pass);
	const labelId = useId();

	useEffect(() => {
		if (state === "idle") return;
		const timer = window.setTimeout(
			() => (state === "checking" ? setState("checked") : onChecked()),
			state === "checking" ? 1400 : 700,
		);
		return () => window.clearTimeout(timer);
	}, [state]);

	return (
		<div className={styles.box}>
			<button
				type="button"
				role="checkbox"
				aria-checked={state === "checked"}
				aria-busy={state === "checking"}
				className={styles.checkbox}
				onClick={() => {
					if (state !== "idle") return;
					// The visitor has answered; the check animation shouldn't cost them the time.
					pauseTimer();
					setState("checking");
				}}
				aria-labelledby={labelId}
			>
				{state === "checking" && (
					<LoaderCircle
						className={styles.spinner}
						size={22}
						aria-hidden="true"
					/>
				)}
				{state === "checked" && (
					<Check
						className={styles.tick}
						size={24}
						strokeWidth={3}
						aria-hidden="true"
					/>
				)}
			</button>
			<span className={styles.label} id={labelId}>
				I'm not a robot
			</span>
			<span className={styles.badge} aria-hidden="true">
				<ShieldCheck size={26} />
				Bot check
			</span>
		</div>
	);
}
