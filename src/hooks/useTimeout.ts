import { useEffect, useEffectEvent } from "react";

// Calls `callback` once, `ms` milliseconds after the timer starts.
//
// callback: what to do when the time is up, e.g. pass, fail or nextRound. It's often
//   a new function on every render (an inline arrow, or one declared in the component),
//   so it's wrapped in useEffectEvent: the timer always calls the latest version, with
//   the latest state, but a new version doesn't restart the timer. Without that, every
//   re-render, like each key typed in the race, would set the timer back to zero.
// ms: when to call it. null means no timer, so a condition can turn it on and off:
//   useTimeout(pass, solved ? 600 : null).
// restartKey: optional. When it changes, the timer starts over from zero, even if
//   `ms` is the same as before.
//
// The timer starts when `ms` stops being null, starts over when `ms` or `restartKey`
// changes, and is cancelled when `ms` goes back to null or the component goes away, so
// it never fires for something no longer on screen. Nothing else stops it: if none of
// that happens in time, the callback runs.
//
// Example: ReactionStep's useTimeout(fail, circle ? circle.ms : null, circle).
// - Before Start there's no circle, so `ms` is null: no timer.
// - Each circle starts a timer for its own lifetime. Hitting it sets a new circle, so
//   `restartKey` changes: the old timer is cancelled before it fires, and the new
//   circle gets a fresh one.
// - A circle nobody hits is never replaced, so nothing cancels its timer. When it runs
//   out, the browser calls the callback, fail, and the site closes.
//
// Where fail comes from in that example: SiteAccessProvider creates blockAccess and
// shares it through context. AreYouHuman passes it to each step as fail
// (step.render({ fail: blockAccess, ... })), steps.tsx passes the props on to
// ReactionStep, and ReactionStep hands it to this hook. Calling it sets the provider's
// blocked state, and the provider then shows BlockedScreen in place of the whole site.
// That unmounts the step, and the cleanup below cancels whatever timers were left.
export function useTimeout(
	callback: () => void,
	ms: number | null,
	restartKey?: unknown,
) {
	const onTimeout = useEffectEvent(callback);

	useEffect(() => {
		if (ms === null) return;
		const timer = window.setTimeout(onTimeout, ms);
		// Runs before the effect runs again (ms or restartKey changed) and when the
		// component goes away: the old timer is cancelled before it can fire.
		return () => window.clearTimeout(timer);
	}, [ms, restartKey]);
}
