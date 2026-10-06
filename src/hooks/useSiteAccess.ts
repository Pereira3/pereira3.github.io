import { use } from "react";
import type { SiteAccess } from "@/providers/SiteAccess/SiteAccessContext";
import { SiteAccessContext } from "@/providers/SiteAccess/SiteAccessContext";

// Gives any page inside SiteAccessProvider access to the lock and the block.
export function useSiteAccess(): SiteAccess {
	const access = use(SiteAccessContext);
	if (!access)
		throw new Error("useSiteAccess must be used inside SiteAccessProvider");
	return access;
}
