import { useState } from "react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { QuestionStep } from "@/projects/AreYouHuman/QuestionStep";
import { pick } from "@/projects/AreYouHuman/random";
import {
	TIME_CHANGED,
	TIME_JOKES,
	TIME_ZONE_HIDDEN,
} from "@/projects/AreYouHuman/replies";
import { localTime, timeZoneHidden } from "@/projects/AreYouHuman/visitor";

type LocalTimeStepProps = StepProps & {
	question: (time: string) => string; // the question for a given time (see steps.tsx)
};

// "Is it 14:32 where you are?", with the time from the visitor's own clock. Saying no
// never closes the site. If the time shown is still right when they answer, it's a joke
// and gets one back. If it may be wrong, because the minute changed while they read or
// the browser hides its time zone, it owns up to that instead. The replies are in
// replies.ts.
export function LocalTimeStep({ question, ...props }: LocalTimeStepProps) {
	const [shown] = useState(localTime); // fixed while the question is on screen

	// Worked out when the visitor answers, so it compares against that moment's time.
	function replyToNo(): string {
		if (localTime() !== shown) return TIME_CHANGED;
		if (timeZoneHidden()) return TIME_ZONE_HIDDEN;
		return pick(TIME_JOKES);
	}

	return (
		<QuestionStep
			{...props}
			question={question(shown)}
			replyToNo={replyToNo}
		/>
	);
}
