import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BlockedScreen } from "@/components/BlockedScreen/BlockedScreen";
import { SiteAccessContext } from "@/providers/SiteAccess/SiteAccessContext";

// Lets a page lock the site to itself, and replaces the whole site with the
// "Access blocked" screen when a page blocks access.
export function SiteAccessProvider({ children }: { children: ReactNode }) {
	const [blocked, setBlocked] = useState(false);
	const [lockedPath, setLockedPath] = useState<string | null>(null);

	const blockAccess = useCallback(() => {
		setLockedPath(null);
		setBlocked(true);
	}, []);

	const value = useMemo(
		() => ({
			lockedPath,
			lock: setLockedPath,
			unlock: () => setLockedPath(null),
			blockAccess,
		}),
		[lockedPath, blockAccess],
	);

	// A new session: opens the site's address afresh (without the part after #). That counts
	// as a new arrival, not a reload, so the page starts from scratch with the welcome screen
	// and then the Introduction. Preferences saved in localStorage (theme, sidebar) are kept.
	function startOver() {
		window.location.replace(window.location.pathname);
	}

	if (blocked) return <BlockedScreen onStartOver={startOver} />;

	return <SiteAccessContext value={value}>{children}</SiteAccessContext>;
}
