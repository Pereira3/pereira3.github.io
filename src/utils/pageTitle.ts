import { profile } from "@/data/profile";

// One place decides how browser tab titles look, e.g. "RP - University projects".
export function pageTitle(page?: string): string {
	return page ? `${profile.websiteName} - ${page}` : profile.websiteName;
}
