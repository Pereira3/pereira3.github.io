import { Sparkles } from "lucide-react";
import styles from "@/components/AiBadge/AiBadge.module.css";

// Marks a project that was built with help from AI tools (aiAssisted in projects.ts).
export function AiBadge() {
	return (
		<span className={styles.badge} title="Built with help from AI tools">
			<Sparkles className={styles.icon} size={14} aria-hidden="true" />
			AI assisted
		</span>
	);
}
