// One list for every project.
// status "active"   -> gets its own entry in the sidebar under "Active projects"
// status "university" -> appears on the University projects page
// To archive a project, change its status. Nothing else needs to change.

export type ArchiveCategoryId = "university" | "personal";

export type ArchiveCategory = {
  id: ArchiveCategoryId; // used in the URL: #/archived/<id>
  title: string;
  description: string;
};

// The groups shown under "Archived projects". A category only appears
// in the sidebar once at least one project belongs to it.
export const archiveCategories: ArchiveCategory[] = [
  {
    id: "university",
    title: "University projects",
    description:
      "Course work and assignments from university, with links to the code.",
  },
  {
    id: "personal",
    title: "Personal projects",
    description: "Finished and paused side projects, with links to the code.",
  },
];

type ProjectDetails = {
  id: string; // used in the URL of active projects: #/projects/<id>
  title: string;
  description: string;
  repoUrl?: string;
  year?: number;
  tags?: string[];
};

// An archived project must say which category it belongs to; an active one doesn't need one.
export type Project =
  | (ProjectDetails & { status: "active" })
  | (ProjectDetails & { status: "archived"; category: ArchiveCategoryId });

export const projects: Project[] = [
  {
    id: "project_ms",
    title: "MS",
    description: "A project related with music will live inside this site.",
    status: "active",
  },
  {
    id: "epmanagement",
    title: "EPManagement",
    description:
      "Small React Application that served as an introduction to the language where is possible to manage employees and projects.",
    status: "archived",
    category: "personal",
    repoUrl: "https://github.com/Pereira3/React_EPManagement",
    year: 2026,
    tags: ["React", "TypeScript"],
  },
  {
    id: "unknown",
    title: "Unknown",
    description:
      "Game developed in Unity, where the player must explore a mysterious world and solve puzzles to uncover the truth behind the unknown.\nFinal Project for Bachelor's Degree in Software Engineering.",
    status: "archived",
    category: "university",
    repoUrl: "https://github.com/Pereira3/Unknown",
    year: 2024,
    tags: ["Unity", "C#"],
  },
  {
    id: "houdina",
    title: "Houdina",
    description:
      "Software design to manage car purchase and rentals with Google Maps integration.\nFinal Project for Mobile Device Programming.",
    status: "archived",
    category: "university",
    repoUrl: "https://github.com/MrBrodinha/Houdina",
    year: 2024,
    tags: ["Flutter", "Dart"],
  },
  {
    id: "bhschool",
    title: "BHSchool",
    description:
      "Software designed to management of school activities and students.\nFinal Project for Distributed Systems.",
    status: "archived",
    category: "university",
    repoUrl: "https://github.com/Pereira3/BHSchool",
    year: 2024,
    tags: ["Spring Boot", "Java"],
  },
  {
    id: "gemp",
    title: "Gemp",
    description:
      "Software designed for business management, where you can manage your employees, projects and statistics.\nFinal Project for Web Programming.",
    status: "archived",
    category: "university",
    repoUrl: "https://github.com/Pereira3/Gemp",
    year: 2024,
    tags: ["PHP", "CSS"],
  },
  {
    id: "wordle",
    title: "Wordle",
    description:
      "A word guessing game inspired by Wordle, built with JavaFX.\nFinal Project for Human Interaction with the Computer.",
    status: "archived",
    category: "university",
    repoUrl: "https://github.com/Pereira3/Wordle",
    year: 2024,
    tags: ["JavaFX"],
  },
];

export const activeProjects = projects.filter(
  (project) => project.status === "active",
);

export function getArchivedProjects(categoryId: ArchiveCategoryId) {
  return projects.filter(
    (project) =>
      project.status === "archived" && project.category === categoryId,
  );
}

export const archiveCategoriesInUse = archiveCategories.filter(
  (category) => getArchivedProjects(category.id).length > 0,
);
