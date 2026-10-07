import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useTimeout } from "@/hooks/useTimeout";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { readingMs } from "@/utils/readingMs";
import styles from "@/projects/AreYouHuman/AreYouHuman.module.css";

// Time to read a reply before moving on: its reading time, plus a second, and never
// under 2.6 seconds.
function replyMs(reply: string): number {
	return readingMs(reply, { extra: 1000, min: 2600 });
}

// One answer to a question with more than yes and no.
export type Choice = {
	label: string;
	// Shown in place of the answers before moving on. A function is called when the
	// visitor answers, for replies picked at random or that depend on that moment.
	reply?: string | (() => string);
	replyLang?: string; // the reply's language, when it isn't English (for screen readers)
	fails?: boolean; // closes the site, after the reply if there is one
};

// What a question says and how its answers work: everything QuestionStep needs except
// the step's own props. steps.tsx lists the questions with it.
export type Question = {
	question: string;
	text?: string;
	icon?: LucideIcon;
	yes?: string; // label of the button that continues
	no?: string; // label of the button that closes the site
	// When set, "no" doesn't close the site: this reply replaces the answers, then the
	// step continues. For questions about what the browser gave away, which the visitor
	// could honestly answer either way (see LocalTimeStep for a reply worked out when
	// the visitor answers).
	replyToNo?: string | (() => string);
	replyLang?: string; // replyToNo's language, when it isn't English
	// In place of yes and no: a list of answers, one per line, each with what it does.
	choices?: Choice[];
};

type QuestionStepProps = StepProps & Question;

// A question with two answers, one that continues and one that closes the site, or
// with a list of choices. An answer can get a reply first, read before moving on.
export function QuestionStep({
	question,
	text,
	icon: Icon,
	yes = "Yes",
	no = "No",
	replyToNo,
	replyLang,
	choices,
	pass,
	fail,
	pauseTimer,
}: QuestionStepProps) {
	// The answer given and the reply on screen, once the visitor answers one with a reply.
	const [answered, setAnswered] = useState<{
		reply: string;
		lang?: string;
		fails: boolean;
	} | null>(null);

	// Once the reply is on screen, moves on when it's been read.
	useTimeout(
		answered?.fails ? fail : pass,
		answered === null ? null : replyMs(answered.reply),
	);

	function answer({ reply, replyLang: lang, fails = false }: Choice) {
		if (reply === undefined) return fails ? fail() : pass();
		// The visitor has answered; reading the reply shouldn't cost them the time.
		pauseTimer();
		setAnswered({
			reply: typeof reply === "function" ? reply() : reply,
			lang,
			fails,
		});
	}

	const yesNo: Choice[] = [
		{ label: yes },
		{ label: no, reply: replyToNo, replyLang, fails: !replyToNo },
	];

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
			{answered !== null ? (
				<p className={styles.result} role="status" lang={answered.lang}>
					{answered.reply}
				</p>
			) : choices ? (
				<div className={styles.choices}>
					{choices.map((choice) => (
						<button
							key={choice.label}
							type="button"
							className={styles.secondary}
							onClick={() => answer(choice)}
						>
							{choice.label}
						</button>
					))}
				</div>
			) : (
				<div className={styles.answers}>
					{yesNo.map((choice, index) => (
						<button
							key={choice.label}
							type="button"
							className={
								index === 0 ? styles.primary : styles.secondary
							}
							onClick={() => answer(choice)}
						>
							{choice.label}
						</button>
					))}
				</div>
			)}
		</>
	);
}
