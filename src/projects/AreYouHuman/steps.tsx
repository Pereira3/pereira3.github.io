import type { ReactNode } from "react";
import { Cookie } from "lucide-react";
import { ColorWordStep } from "@/projects/AreYouHuman/ColorWordStep";
import { DistortedTextStep } from "@/projects/AreYouHuman/DistortedTextStep";
import { HoldStep } from "@/projects/AreYouHuman/HoldStep";
import { ImageGridStep } from "@/projects/AreYouHuman/ImageGridStep";
import { LocalTimeStep } from "@/projects/AreYouHuman/LocalTimeStep";
import { MemoryStep } from "@/projects/AreYouHuman/MemoryStep";
import { PatienceStep } from "@/projects/AreYouHuman/PatienceStep";
import { PuzzleStep } from "@/projects/AreYouHuman/PuzzleStep";
import { QuestionStep } from "@/projects/AreYouHuman/QuestionStep";
import type { Question } from "@/projects/AreYouHuman/QuestionStep";
import { ReactionStep } from "@/projects/AreYouHuman/ReactionStep";
import { RobotCheckStep } from "@/projects/AreYouHuman/RobotCheckStep";
import { RotateStep } from "@/projects/AreYouHuman/RotateStep";
import { TypingRaceStep } from "@/projects/AreYouHuman/TypingRaceStep";
import { pick, shuffle } from "@/projects/AreYouHuman/random";
import {
	ADULT_MISCALCULATED,
	LANGUAGE_UNKNOWN,
	SCREEN_DOUBTED,
	SYSTEM_JOKES,
	teasesIn,
} from "@/projects/AreYouHuman/replies";
import {
	browserLanguage,
	localTime,
	systemName,
} from "@/projects/AreYouHuman/visitor";
import { readingMs } from "@/utils/readingMs";

export type StepProps = {
	pass: () => void;
	fail: () => void;
	// Stops the step's countdown. Used once the visitor has answered, while the step shows
	// its result before calling pass.
	pauseTimer: () => void;
	// Removes the countdown and its bar for the rest of the step, for steps whose own
	// clock is on screen from then on, so a frozen bar doesn't look like time still
	// counting (the race's bot, the shrinking circles).
	removeTimer: () => void;
};

export type Step = {
	id: string;
	seconds: number; // time limit; running out closes the site (see passesWhenTimeIsUp)
	follows?: string; // the id of a step this one always comes right after
	// true when running out of time is the goal, not a failure: the site stays open and
	// the step passes by itself once its time is up (the patience test).
	passesWhenTimeIsUp?: boolean;
	render: (props: StepProps) => ReactNode;
};

const PATIENCE_SECONDS = 15; // the patience test's whole wait, filled with begging

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

// A question's time limit, in seconds: long enough to read everything on screen and
// answer, so longer questions get more time without anyone picking a number.
//
// How it's worked out:
// 1. The text the visitor reads: the question, its description and each choice's
//    label. Yes/no button labels aren't counted: a word or two, covered by step 3.
// 2. Its reading time: a third of a second per word (see readingMs).
// 3. Plus 4 seconds to decide and press a button.
// 4. Never under 10 seconds, so even the shortest question isn't rushed.
//
// In short: max(10, words / 3 + 4). For example:
// - "Is a tomato a fruit…" with two short choices, 14 words: 8.7s, raised to 10s.
// - "What is the right order?" with the four sock orders, 21 words: 7s + 4s = 11s.
function questionSeconds({
	question,
	text = "",
	choices = [],
}: Question): number {
	const texts = [question, text, ...choices.map((choice) => choice.label)];
	return readingMs(texts.join(" "), { extra: 4000, min: 10_000 }) / 1000;
}

// A question as a step, with a time limit that fits its length.
function questionStep(id: string, question: Question, follows?: string): Step {
	return {
		id,
		follows,
		seconds: questionSeconds(question),
		render: (props) => <QuestionStep {...props} {...question} />,
	};
}

// What a question about the browser says, and how it answers a "no": one reply, or a
// function that picks one at random when the visitor answers (see QuestionStep).
type BrowserQuestion = {
	question: string;
	replyToNo: string | (() => string);
	replyLang?: string;
};

// E.g. "Is your browser set to Portuguese?". Saying no to a language the browser really
// reports gets teased in that very language. When the browser doesn't report a real
// one, it asks about English instead and apologises if that's wrong.
// The replies are in replies.ts.
function languageQuestion(): BrowserQuestion {
	const language = browserLanguage();
	if (!language)
		return {
			question: "Is your browser set to English?",
			replyToNo: LANGUAGE_UNKNOWN,
		};
	const teases = teasesIn(language.code);
	return {
		question: `Is your browser set to ${language.name}?`,
		replyToNo: () => pick(teases.texts),
		replyLang: teases.lang,
	};
}

// E.g. "Is this device running Windows?", or a safe question if the browser hid it.
// When the browser did name a system, saying no gets a suspicious look.
// The replies are in replies.ts.
function systemQuestion(): BrowserQuestion {
	const system = systemName();
	if (!system)
		return {
			question: "Are you reading this on a screen?",
			replyToNo: () => pick(SCREEN_DOUBTED),
		};
	return {
		question: `Is this device running ${system}?`,
		replyToNo: () => pick(SYSTEM_JOKES),
	};
}

// E.g. "Is it 14:32 where you are?", with the visitor's own time (see LocalTimeStep).
function timeQuestion(time: string): string {
	return `Is it ${time} where you are?`;
}

// The verifications. Each attempt plays them in a new random order (see shuffledSteps).
export const steps: Step[] = [
	questionStep("want-to-verify", {
		question: "Do you want to verify yourself and access the website?",
		yes: "Yes, verify me",
	}),
	questionStep("adult", {
		question: "Are you 18 years old or older?",
		text: "Maybe a click isn't the best way to be sure you're an adult, but we'll let it slide 😪",
	}),
	questionStep(
		"adult-again",
		{
			question: `Just to be sure: were you born on or before ${eighteenYearsAgo()}?`,
			replyToNo: ADULT_MISCALCULATED,
		},
		"adult",
	),
	questionStep(
		"verify-again",
		{
			question: "Are you sure you want to do this? 😬",
			text: "Your mom probably warned you about strangers. But we're just a website, so you can trust us, right? 😁",
			yes: "Yes, I'm sure",
		},
		"want-to-verify",
	),
	questionStep("cookies", {
		question: "This website uses cookies.",
		text: "We use cookies to make sure you're a human, and we surely won't steal all your data 😇 Do you accept the use of cookies?",
		yes: "Accept all",
		no: "Reject all",
	}),
	questionStep(
		"cookies-eaten",
		{
			icon: Cookie,
			question: "Sorry, all the cookies were eaten.",
			text: "Someone got hungry while you were reading 😨 Do you still want to access the site?",
			yes: "Yes, without cookies",
			no: "No, I wanted cookies",
		},
		"cookies",
	),
	questionStep("language", languageQuestion()),
	{
		id: "local-time",
		// The time shown changes, but the question's length doesn't.
		seconds: questionSeconds({ question: timeQuestion(localTime()) }),
		render: (props) => <LocalTimeStep {...props} question={timeQuestion} />,
	},
	questionStep("system", systemQuestion()),
	questionStep("ever-a-robot", {
		question: "Have you ever been a robot? Even just a little bit?",
		choices: [{ label: "No" }, { label: "Maybe 🤓", fails: true }],
	}),
	questionStep("tomato", {
		question: "Botanically speaking, is a tomato a fruit or a vegetable?",
		choices: [{ label: "A fruit" }, { label: "A vegetable", fails: true }],
	}),
	questionStep("socks-and-shoes", {
		question: "What is the right order?",
		choices: [
			{ label: "Sock, sock, shoe, shoe", reply: "Correct 😌" },
			{
				label: "Sock, shoe, sock, shoe",
				reply: "You should reconsider your life choices 🤨",
			},
			{ label: "Shoe, shoe, sock, sock", fails: true },
			{ label: "Shoe, sock, shoe, sock", fails: true },
		],
	}),
	questionStep("cereal", {
		question: "Milk before cereal, or cereal before milk?",
		choices: [
			{
				label: "Milk first 🥛",
				reply: "Correct, I'm glad we agree 😋",
			},
			{ label: "Cereal first 🥣", reply: "You're just a weirdo 🤧" },
		],
	}),
	questionStep("toothpaste", {
		question: "What is the right order?",
		choices: [
			{
				label: "Toothpaste on the brush, then water",
				reply: "I'll let it slide, but you still have a lot to learn",
			},
			{
				label: "Water on the brush, then toothpaste",
				reply: "Not ideal, but better than the other way around",
			},
			{
				label: "Water on the brush, then toothpaste, then water",
				reply: "I see you take this business seriously 😌",
			},
			{
				label: "Toothpaste on the brush, then water, then toothpaste",
				fails: true,
			},
		],
	}),
	questionStep("pineapple", {
		question: "Pizza with or without pineapple?",
		choices: [
			{
				label: "With pineapple 🍍",
				reply: "Nice to see I'm not alone 🥹",
			},
			{
				label: "Without pineapple 🍕",
				reply: "I'll turn a blind eye this time, but I'm almost certain your life is bland 😐",
			},
		],
	}),
	{
		id: "not-a-robot",
		seconds: 10,
		render: (props) => <RobotCheckStep {...props} />,
	},
	{
		id: "puzzle",
		seconds: 70, // three puzzles: one piece, then two, then three
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
		id: "hold",
		seconds: 30, // up to four holds of about 3 seconds, and time to read between them
		render: (props) => <HoldStep {...props} />,
	},
	{
		id: "rotate",
		seconds: 30, // three animals
		render: (props) => <RotateStep {...props} />,
	},
	{
		id: "patience",
		seconds: PATIENCE_SECONDS,
		passesWhenTimeIsUp: true,
		render: (props) => (
			<PatienceStep {...props} ms={PATIENCE_SECONDS * 1000} />
		),
	},
	{
		id: "memory",
		seconds: 50, // watching the three sequences takes about 10 of them
		render: (props) => <MemoryStep {...props} />,
	},
	{
		id: "typing-race",
		seconds: 25, // to read and start typing; once the race starts, the bot is the clock
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
