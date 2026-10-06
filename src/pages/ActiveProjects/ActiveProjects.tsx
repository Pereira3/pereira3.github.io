import { useParams } from "react-router";
import { activeProjects } from "@/data/projects";
import { NotFound } from "@/pages/NotFound/NotFound";
import { pageTitle } from "@/utils/pageTitle";
import page from "@/styles/Page.module.css";
import styles from "@/pages/ActiveProjects/ActiveProjects.module.css";

// Placeholder for active projects. Each project will get its own component later.
export function ActiveProjects() {
	const { projectId } = useParams();
	const project = activeProjects.find((p) => p.id === projectId);

	if (!project) return <NotFound />;

	return (
		<article>
			<title>{pageTitle(project.title)}</title>

			<h1 className={page.title}>{project.title}</h1>
			<p className={page.lead}>{project.description}</p>
			<p className={styles.status}>Work in progress. Check back soon.</p>
		</article>
	);
}
