// Shown in the right-hand panel while a page's code is still downloading.
// Its styles live in src/styles/loading.css, shared with the screen in index.html.
export function Loading() {
	return (
		<div className="loading" role="status">
			<span className="loading-text">Loading…</span>
		</div>
	);
}
