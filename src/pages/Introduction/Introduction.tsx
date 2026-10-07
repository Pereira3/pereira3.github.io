import { useId } from "react";
import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import { AppWindow, ArrowRight, FolderGit2 } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { profile } from "@/data/profile";
import {
	archiveCategoriesInUse,
	getArchivedProjects,
	integratedProjects,
	ongoingProjects,
} from "@/data/projects";
import { categoryIcons } from "@/data/categoryIcons";
import { AiBadge } from "@/components/AiBadge/AiBadge";
import { pageTitle } from "@/utils/pageTitle";
import styles from "@/pages/Introduction/Introduction.module.css";

type Shortcut = {
	to: string;
	title: string;
	summary?: string; // a line under the title; integrated projects have none
	icon: LucideIcon;
	aiAssisted?: boolean; // shows the "AI Assisted" label beside the title
};

// A status, followed by the first line of the description when the project has one.
function summarize(status: string, description?: string): string {
	return description ? `${status} ${description.split("\n")[0]}` : status;
}

// One shortcut per ongoing and integrated project and per archive category, built from
// projects.ts, so this page stays up to date when projects are added or archived.
const shortcuts: Shortcut[] = [
	...integratedProjects.map((project) => ({
		to: `/projects/${project.id}`,
		title: project.title,
		icon: AppWindow,
		aiAssisted: project.aiAssisted,
	})),
	...ongoingProjects.map((project) => ({
		to: `/projects/${project.id}`,
		title: project.title,
		summary: summarize("In progress.", project.description),
		icon: FolderGit2,
		aiAssisted: project.aiAssisted,
	})),
	...archiveCategoriesInUse.map((category) => {
		const projects = getArchivedProjects(category.id);
		const count =
			projects.length === 1 ? "1 project" : `${projects.length} projects`;
		return {
			to: `/archived/${category.id}`,
			title: category.title,
			summary: `${count}: ${projects.map((project) => project.title).join(", ")}`,
			icon: categoryIcons[category.id],
		};
	}),
];

export function Introduction() {
	const exploreId = useId();
	return (
		<article>
			<title>{pageTitle()}</title>

			<h1 className={styles.name}>{profile.name}</h1>
			<p className={styles.role}>{profile.role}</p>

			<p className={styles.intro}>{profile.intro}</p>

			<a
				className={styles.github}
				href={profile.githubUrl}
				target="_blank"
				rel="noreferrer"
				aria-label="GitHub (opens in a new tab)"
				title="GitHub"
			>
				<FaGithub size={22} aria-hidden="true" />
			</a>

			<section className={styles.section} aria-labelledby={exploreId}>
				<h2 className={styles.sectionTitle} id={exploreId}>
					Explore
				</h2>
				<ul className={styles.shortcuts}>
					{shortcuts.map(
						({ to, title, summary, icon: Icon, aiAssisted }) => (
							<li key={to}>
								<Link className={styles.shortcut} to={to}>
									<Icon
										className={styles.shortcutIcon}
										size={22}
										aria-hidden="true"
									/>
									<span className={styles.shortcutText}>
										<span
											className={styles.shortcutHeading}
										>
											<span
												className={styles.shortcutTitle}
											>
												{title}
											</span>
											{aiAssisted && <AiBadge />}
										</span>
										{summary && (
											<span
												className={
													styles.shortcutSummary
												}
											>
												{summary}
											</span>
										)}
									</span>
									<ArrowRight
										className={styles.shortcutArrow}
										size={18}
										aria-hidden="true"
									/>
								</Link>
							</li>
						),
					)}
				</ul>
			</section>
		</article>
	);
}
