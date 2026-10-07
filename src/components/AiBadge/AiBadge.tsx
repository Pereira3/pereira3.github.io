import { Sparkles } from "lucide-react";
import { Tag } from "@/components/Tag/Tag";

// Marks a project that was built with help from AI tools (aiAssisted in projects.ts).
export function AiBadge() {
	return (
		<Tag accent icon={Sparkles} title="Built with help from AI tools">
			AI Assisted
		</Tag>
	);
}
