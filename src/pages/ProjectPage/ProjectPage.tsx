import { Suspense } from "react";
import { useParams } from "react-router";
import { FaGithub } from "react-icons/fa6";
import { projects } from "@/data/projects";
import { projectPages } from "@/projects/registry";
import { AiBadge } from "@/components/AiBadge/AiBadge";
import { Loading } from "@/components/Loading/Loading";
import { NotFound } from "@/pages/NotFound/NotFound";
import { pageTitle } from "@/utils/pageTitle";
import page from "@/styles/Page.module.css";
import styles from "@/pages/ProjectPage/ProjectPage.module.css";

// The page of an ongoing or integrated project: its title and description, then the
// project itself when it runs inside the site, or a "Work in progress" message,
// and a link to its code when it has one.
export function ProjectPage() {
	const { projectId } = useParams();
	const project = projects.find(
		(p) => p.id === projectId && p.status !== "archived",
	);

	if (!project) return <NotFound />;

	const IntegratedProject =
		project.status === "integrated" ? projectPages[project.id] : undefined;

	return (
		<article>
			<title>{pageTitle(project.title)}</title>

			<h1 className={page.title}>{project.title}</h1>
			{project.aiAssisted && (
				<p className={styles.labels}>
					<AiBadge />
				</p>
			)}
			{project.description && (
				<p className={page.lead}>{project.description}</p>
			)}

			{/* Its own Suspense keeps the title and description on screen
			    while the project downloads. */}
			{IntegratedProject ? (
				<Suspense fallback={<Loading />}>
					<IntegratedProject />
				</Suspense>
			) : (
				<p className={styles.status}>
					Work in progress. Check back soon.
				</p>
			)}

			{project.repoUrl && (
				<a
					className={styles.repo}
					href={project.repoUrl}
					target="_blank"
					rel="noreferrer"
					// Starts with the visible text, so voice control finds it by what it says.
					aria-label={`Project Repo: code for ${project.title} on GitHub (opens in a new tab)`}
				>
					<FaGithub size={20} aria-hidden="true" />
					<span className={page.textLink}>Project Repo</span>
				</a>
			)}
		</article>
	);
}
