import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useTimeout } from "@/hooks/useTimeout";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { readingMs } from "@/utils/readingMs";
import styles from "@/projects/AreYouHuman/AreYouHuman.module.css";

// Time to read the reply to "no" before moving on: its reading time, plus a second,
// and never under 2.6 seconds.
function replyMs(reply: string): number {
	return readingMs(reply, { extra: 1000, min: 2600 });
}

type QuestionStepProps = StepProps & {
	question: string;
	text?: string;
	icon?: LucideIcon;
	yes?: string; // label of the button that continues
	no?: string; // label of the button that closes the site
	// When set, "no" doesn't close the site: this reply replaces the answers, then the
	// step continues. For questions about what the browser gave away, which the visitor
	// could honestly answer either way. A function is called when the visitor answers,
	// for replies that depend on that moment (see LocalTimeStep).
	replyToNo?: string | (() => string);
	replyLang?: string; // the reply's language, when it isn't English (for screen readers)
};

// A question with two answers: one continues, the other closes the site.
export function QuestionStep({
	question,
	text,
	icon: Icon,
	yes = "Yes",
	no = "No",
	replyToNo,
	replyLang,
	pass,
	fail,
	pauseTimer,
}: QuestionStepProps) {
	const [reply, setReply] = useState<string | null>(null); // the reply on screen

	// Once the reply is on screen, moves on when it's been read.
	useTimeout(pass, reply === null ? null : replyMs(reply));

	function answerNo() {
		if (!replyToNo) return fail();
		// The visitor has answered; reading the reply shouldn't cost them the time.
		pauseTimer();
		setReply(typeof replyToNo === "function" ? replyToNo() : replyToNo);
	}

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
			{reply !== null ? (
				<p className={styles.result} role="status" lang={replyLang}>
					{reply}
				</p>
			) : (
				<div className={styles.answers}>
					<button
						type="button"
						className={styles.primary}
						onClick={pass}
					>
						{yes}
					</button>
					<button
						type="button"
						className={styles.secondary}
						onClick={answerNo}
					>
						{no}
					</button>
				</div>
			)}
		</>
	);
}
