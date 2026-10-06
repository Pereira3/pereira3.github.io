import { createContext } from "react";

export type SiteAccess = {
	// The page the site is locked to, or null when the visitor can move freely.
	lockedPath: string | null;
	lock: (path: string) => void;
	unlock: () => void;
	// Ends the visit: replaces the site with the "Access blocked" screen.
	blockAccess: () => void;
};

// Provided by SiteAccessProvider; read it with the useSiteAccess hook.
export const SiteAccessContext = createContext<SiteAccess | null>(null);
