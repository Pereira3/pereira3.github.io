import { profile } from "@/data/profile";

// One place decides how browser tab titles look, e.g. "University projects - RP".
// The page name comes first so it stays visible when tabs are narrow.
export function pageTitle(page?: string): string {
	return page ? `${profile.websiteName} - ${page}` : profile.websiteName;
}
