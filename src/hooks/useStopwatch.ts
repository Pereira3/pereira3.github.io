import { useRef, useState } from "react";

// Times something from start() to stop(). elapsedMs is 0 until stop() is first called,
// then the time between the last start() and stop(). Nothing re-renders while it runs:
// only stop() updates the time on screen.
export function useStopwatch() {
	const startedAt = useRef(0); // on the performance.now() clock
	const [elapsedMs, setElapsedMs] = useState(0);

	return {
		start: () => {
			startedAt.current = performance.now();
		},
		stop: () => {
			setElapsedMs(performance.now() - startedAt.current);
		},
		elapsedMs,
	};
}
