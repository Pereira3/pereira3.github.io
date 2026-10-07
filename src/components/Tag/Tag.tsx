import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import styles from "@/components/Tag/Tag.module.css";

type TagProps = {
	children: ReactNode;
	icon?: LucideIcon;
	accent?: boolean; // an accent border, for labels that should stand apart, like AiBadge
	title?: string;
	className?: string; // for the places that restyle it, like a project card on hover
};

// A small pill with a word or two: a project's technologies, or a label like "AI Assisted".
export function Tag({
	children,
	icon: Icon,
	accent = false,
	title,
	className,
}: TagProps) {
	const classes = [styles.tag, accent && styles.accent, className]
		.filter(Boolean)
		.join(" ");
	return (
		<span className={classes} title={title}>
			{Icon && (
				<Icon className={styles.icon} size={14} aria-hidden="true" />
			)}
			{children}
		</span>
	);
}
