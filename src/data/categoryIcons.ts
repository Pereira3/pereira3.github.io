import type { LucideIcon } from "lucide-react";
import { Archive, GraduationCap } from "lucide-react";
import type { ArchiveCategoryId } from "@/data/projects";

// Icon shown for each archive category, in the sidebar and on the Introduction page.
export const categoryIcons: Record<ArchiveCategoryId, LucideIcon> = {
	university: GraduationCap,
	personal: Archive,
};
