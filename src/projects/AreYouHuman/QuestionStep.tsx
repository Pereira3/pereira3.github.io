import type { LucideIcon } from "lucide-react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import styles from "@/projects/AreYouHuman/AreYouHuman.module.css";

type QuestionStepProps = StepProps & {
	question: string;
	text?: string;
	icon?: LucideIcon;
	yes?: string; // label of the button that continues
	no?: string; // label of the button that closes the site
};

// A question with two answers: one continues, the other closes the site.
export function QuestionStep({
	question,
	text,
	icon: Icon,
	yes = "Yes",
	no = "No",
	pass,
	fail,
}: QuestionStepProps) {
	return (
		<>
			{Icon && (
				<Icon
					className={styles.stepIcon}
					size={40}
					aria-hidden="true"
				/>
			)}
			<p className={styles.question}>{question}</p>
			{text && <p className={styles.text}>{text}</p>}
			<div className={styles.answers}>
				<button type="button" className={styles.primary} onClick={pass}>
					{yes}
				</button>
				<button
					type="button"
					className={styles.secondary}
					onClick={fail}
				>
					{no}
				</button>
			</div>
		</>
	);
}
