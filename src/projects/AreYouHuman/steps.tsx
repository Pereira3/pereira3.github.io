import type { ReactNode } from "react";
import { Cookie } from "lucide-react";
import { ColorWordStep } from "@/projects/AreYouHuman/ColorWordStep";
import { DistortedTextStep } from "@/projects/AreYouHuman/DistortedTextStep";
import { ImageGridStep } from "@/projects/AreYouHuman/ImageGridStep";
import { PuzzleStep } from "@/projects/AreYouHuman/PuzzleStep";
import { QuestionStep } from "@/projects/AreYouHuman/QuestionStep";
import { ReactionStep } from "@/projects/AreYouHuman/ReactionStep";
import { RobotCheckStep } from "@/projects/AreYouHuman/RobotCheckStep";
import { TypingRaceStep } from "@/projects/AreYouHuman/TypingRaceStep";
import { shuffle } from "@/projects/AreYouHuman/random";

export type StepProps = {
	pass: () => void;
	fail: () => void;
	// Stops the step's countdown. Used once the visitor has answered, while the step shows
	// its result before calling pass, and by steps that keep their own clock (the race).
	pauseTimer: () => void;
};

export type Step = {
	id: string;
	seconds: number; // time limit; when it runs out, the site closes
	follows?: string; // the id of a step this one always comes right after
	render: (props: StepProps) => ReactNode;
};

// The date exactly 18 years ago, written out, e.g. "6 October 2008".
function eighteenYearsAgo(): string {
	const date = new Date();
	date.setFullYear(date.getFullYear() - 18);
	return date.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

// The verifications. Each attempt plays them in a new random order (see shuffledSteps).
export const steps: Step[] = [
	{
		id: "want-to-verify",
		seconds: 10,
		render: (props) => (
			<QuestionStep
				{...props}
				question="Do you want to verify yourself and access the website?"
				yes="Yes, verify me"
			/>
		),
	},
	{
		id: "adult",
		seconds: 10,
		render: (props) => (
			<QuestionStep
				{...props}
				question="Are you 18 years old or older?"
			/>
		),
	},
	{
		id: "adult-again",
		seconds: 10,
		follows: "adult",
		render: (props) => (
			<QuestionStep
				{...props}
				question={`Just to be sure: were you born on or before ${eighteenYearsAgo()}?`}
			/>
		),
	},
	{
		id: "verify-again",
		seconds: 10,
		follows: "want-to-verify",
		render: (props) => (
			<QuestionStep
				{...props}
				question="Do you want to verify yourself again?"
				text="We know you just did. It's for your own safety."
				yes="Yes, verify me again"
			/>
		),
	},
	{
		id: "cookies",
		seconds: 12,
		render: (props) => (
			<QuestionStep
				{...props}
				question="This website uses cookies."
				text="We use cookies to make sure you're a human. Do you accept the use of cookies?"
				yes="Accept all"
				no="Reject all"
			/>
		),
	},
	{
		id: "cookies-eaten",
		seconds: 12,
		follows: "cookies",
		render: (props) => (
			<QuestionStep
				{...props}
				icon={Cookie}
				question="Sorry, all the cookies were eaten."
				text="Someone got hungry while you were reading. Do you still want to access the site?"
				yes="Yes, without cookies"
				no="No, I wanted cookies"
			/>
		),
	},
	{
		id: "not-a-robot",
		seconds: 10,
		render: (props) => <RobotCheckStep {...props} />,
	},
	{
		id: "puzzle",
		seconds: 25,
		render: (props) => <PuzzleStep {...props} />,
	},
	{
		id: "image-grid",
		seconds: 20,
		render: (props) => <ImageGridStep {...props} />,
	},
	{
		id: "color-words",
		seconds: 20,
		render: (props) => <ColorWordStep {...props} />,
	},
	{
		id: "reaction",
		seconds: 15, // to read and press Start; once it starts, each circle has its own deadline
		render: (props) => <ReactionStep {...props} />,
	},
	{
		id: "distorted-text",
		seconds: 25,
		render: (props) => <DistortedTextStep {...props} />,
	},
	{
		id: "typing-race",
		seconds: 25, // to read and press Start; once the race starts, the bot is the clock
		render: (props) => <TypingRaceStep {...props} />,
	},
];

// A step followed by the steps that follow it, and by the ones that follow those.
function withFollowers(step: Step): Step[] {
	return [
		step,
		...steps
			.filter((other) => other.follows === step.id)
			.flatMap(withFollowers),
	];
}

// A new random order of all the steps. A step with "follows" moves together with the
// step it follows, always right after it, so they're shuffled as one block.
// Example: cookies-eaten follows cookies, so the first filter leaves it out and
// withFollowers(cookies) adds it, giving the block [cookies, cookies-eaten].
export function shuffledSteps(): Step[] {
	const blocks = steps.filter((step) => !step.follows).map(withFollowers);
	return shuffle(blocks).flat();
}
