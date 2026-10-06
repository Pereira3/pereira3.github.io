import { useParams } from "react-router";
import { archiveCategories, getArchivedProjects } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard/ProjectCard";
import { NotFound } from "@/pages/NotFound/NotFound";
import { pageTitle } from "@/utils/pageTitle";
import page from "@/styles/Page.module.css";
import styles from "@/pages/ArchivedProjects/ArchivedProjects.module.css";

// One page for every archive category: #/archived/university, #/archived/personal, ...
export function ArchivedProjects() {
	const { categoryId } = useParams();
	const category = archiveCategories.find((c) => c.id === categoryId);

	if (!category) return <NotFound />;

	const projects = getArchivedProjects(category.id);

	return (
		<article>
			<title>{pageTitle(category.title)}</title>

			<h1 className={page.title}>{category.title}</h1>
			<p className={page.lead}>{category.description}</p>

			{projects.length === 0 ? (
				<p className={page.empty}>
					Nothing here yet. Add a project in{" "}
					<code>src/data/projects.ts</code> with{" "}
					<code>status: "archived"</code> and{" "}
					<code>category: "{category.id}"</code>.
				</p>
			) : (
				<ul className={styles.list}>
					{projects.map((project) => (
						<li key={project.id}>
							<ProjectCard project={project} />
						</li>
					))}
				</ul>
			)}
		</article>
	);
}
