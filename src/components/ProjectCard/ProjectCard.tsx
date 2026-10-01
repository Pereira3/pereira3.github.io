import type { Project } from "src/data/projects";
import styles from "src/components/ProjectCard/ProjectCard.module.css";

type ProjectCardProps = {
  project: Project;
  // Pick the heading level that fits where the card is used:
  // "h2" right under a page title, "h3" inside a section that already has an h2.
  headingLevel?: "h2" | "h3";
};

// A project shown as a card. When the project has a repo link, the whole card opens it.
export function ProjectCard({
  project,
  headingLevel = "h2",
}: ProjectCardProps) {
  const Heading = headingLevel;

  return (
    <article className={styles.card}>
      <div className={styles.heading}>
        <Heading className={styles.title}>
          {project.repoUrl ? (
            // The title is the link; its clickable area is stretched over the whole card in CSS.
            <a
              className={styles.link}
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              {project.title}
              <span className="visually-hidden">
                {" "}
                (code on GitHub, opens in a new tab)
              </span>
            </a>
          ) : (
            project.title
          )}
        </Heading>

        <div className={styles.meta}>
          {project.year && <span>{project.year}</span>}
        </div>
      </div>

      <p className={styles.description}>{project.description}</p>

      {project.tags && project.tags.length > 0 && (
        <ul className={styles.tags} aria-label="Built with">
          {project.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
