import { useId, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { Project } from "@/data/projects";
import { AiBadge } from "@/components/AiBadge/AiBadge";
import { Tag } from "@/components/Tag/Tag";
import page from "@/styles/Page.module.css";
import styles from "@/components/ProjectCard/ProjectCard.module.css";

type ProjectCardProps = {
	project: Project;
	// Pick the heading level that fits where the card is used:
	// "h2" right under a page title, "h3" inside a section that already has an h2.
	headingLevel?: "h2" | "h3";
};

// A project shown as a card, with a GitHub button and, when the project has
// details, a button that opens them inside the card.
export function ProjectCard({
	project,
	headingLevel = "h2",
}: ProjectCardProps) {
	const [open, setOpen] = useState(false);
	const panelId = useId();
	const { details } = project;

	const Heading = headingLevel;
	const SectionHeading = headingLevel === "h2" ? "h3" : "h4";

	return (
		<article className={styles.card}>
			<div className={styles.heading}>
				{/* The title with labels such as "AI Assisted" beside it, the year on the right. */}
				<div className={styles.titleRow}>
					<Heading className={styles.title}>{project.title}</Heading>
					{project.aiAssisted && <AiBadge />}
				</div>
				{project.year && (
					<span className={styles.year}>{project.year}</span>
				)}
			</div>

			{project.description && (
				<p className={styles.description}>{project.description}</p>
			)}

			<div className={styles.footer}>
				{project.tags && project.tags.length > 0 && (
					<ul className={styles.tags} aria-label="Built with">
						{project.tags.map((tag) => (
							<li key={tag}>
								<Tag className={styles.tag}>{tag}</Tag>
							</li>
						))}
					</ul>
				)}

				<div className={styles.actions}>
					{project.repoUrl && (
						<a
							className={styles.iconLink}
							href={project.repoUrl}
							target="_blank"
							rel="noreferrer"
							aria-label={`Code for ${project.title} on GitHub (opens in a new tab)`}
							title="View code on GitHub"
						>
							<FaGithub size={20} aria-hidden="true" />
						</a>
					)}
					{details && (
						<button
							type="button"
							className={styles.detailsButton}
							aria-expanded={open}
							aria-controls={panelId}
							onClick={() => setOpen(!open)}
						>
							{open ? "Hide details" : "Show details"}
							<ChevronDown
								className={styles.chevron}
								size={16}
								aria-hidden="true"
							/>
						</button>
					)}
				</div>
			</div>

			{details && (
				// inert keeps the closed panel out of the keyboard and screen-reader order.
				<div
					id={panelId}
					className={
						open
							? `${styles.panel} ${styles.panelOpen}`
							: styles.panel
					}
					inert={!open}
				>
					<div className={styles.panelClip}>
						<div className={styles.panelContent}>
							{details.about && (
								<p className={styles.about}>{details.about}</p>
							)}

							{(details.highlights || details.facts) && (
								<div className={styles.columns}>
									{details.highlights && (
										<section>
											<SectionHeading
												className={styles.sectionTitle}
											>
												What I did
											</SectionHeading>
											<ul className={styles.highlights}>
												{details.highlights.map(
													(item) => (
														<li key={item}>
															{item}
														</li>
													),
												)}
											</ul>
										</section>
									)}
									{details.facts && (
										<section>
											<SectionHeading
												className={styles.sectionTitle}
											>
												Facts
											</SectionHeading>
											<dl className={styles.facts}>
												{details.facts.map((fact) => (
													<div key={fact.label}>
														<dt>{fact.label}</dt>
														<dd>{fact.value}</dd>
													</div>
												))}
											</dl>
										</section>
									)}
								</div>
							)}

							{details.links && details.links.length > 0 && (
								<ul className={styles.links}>
									{details.links.map((link) => (
										<li key={link.url}>
											<a
												className={styles.link}
												href={link.url}
												target="_blank"
												rel="noreferrer"
											>
												<span className={page.textLink}>
													{link.label}
												</span>
												<ExternalLink
													size={15}
													aria-hidden="true"
												/>
												<span className="visually-hidden">
													{" "}
													(opens in a new tab)
												</span>
											</a>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</div>
			)}
		</article>
	);
}
