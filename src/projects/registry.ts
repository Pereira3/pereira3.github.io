import type { ComponentType, LazyExoticComponent } from "react";
import type { IntegratedProjectId } from "@/data/projects";
import { lazyNamed } from "@/utils/lazyNamed";

// The component of each integrated project, by its id in projects.ts.
// It runs on the project's page, below its title and description.
// Keyed by IntegratedProjectId, so TypeScript reports a missing or misspelled entry.
export const projectPages: Record<
	IntegratedProjectId,
	LazyExoticComponent<ComponentType>
> = {
	"are-you-human": lazyNamed(
		() => import("@/projects/AreYouHuman/AreYouHuman"),
		"AreYouHuman",
	),
};
