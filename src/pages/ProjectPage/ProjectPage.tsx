import { useParams } from "react-router";
import { FaGithub } from "react-icons/fa6";
import { projects } from "@/data/projects";
import { NotFound } from "@/pages/NotFound/NotFound";
import { pageTitle } from "@/utils/pageTitle";
import page from "@/styles/Page.module.css";
import styles from "@/pages/ProjectPage/ProjectPage.module.css";

// The page of an ongoing or integrated project: its title, description and status,
// with a link to its code when it has one.
export function ProjectPage() {
	const { projectId } = useParams();
	const project = projects.find(
		(p) => p.id === projectId && p.status !== "archived",
	);

	if (!project) return <NotFound />;

	return (
		<article>
			<title>{pageTitle(project.title)}</title>

			<h1 className={page.title}>{project.title}</h1>
			<p className={page.lead}>{project.description}</p>
			<p className={styles.status}>Work in progress. Check back soon.</p>

			{project.repoUrl && (
				<a
					className={styles.repo}
					href={project.repoUrl}
					target="_blank"
					rel="noreferrer"
					aria-label={`Code for ${project.title} on GitHub (opens in a new tab)`}
				>
					<FaGithub size={20} aria-hidden="true" />
					<span className={page.textLink}>Project Repo</span>
				</a>
			)}
		</article>
	);
}
