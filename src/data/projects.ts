// One list for every project. The status decides where it appears in the sidebar:
// "ongoing"    -> under "Ongoing projects": still being built, with its own page
// "integrated" -> under "Integrated projects": runs inside this site, on its own page
//                 (connect it to its component in src/projects/registry.ts)
// "archived"   -> under "Archived projects", on the page of its category
// To archive a project, change its status to "archived" and give it a category.

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
		description:
			"Finished and paused side projects, with links to the code.",
	},
];

// Everything shown when the visitor presses "Show details". Every part is optional.
export type ProjectDetails = {
	about?: string; // a longer description; \n starts a new line
	highlights?: string[]; // shown as "What I did"
	facts?: { label: string; value: string }[];
	links?: { label: string; url: string }[];
};

type ProjectInfo = {
	id: string; // used in the URL of ongoing and integrated projects: #/projects/<id>
	title: string;
	description?: string;
	// a side remark in small italics on the project's page, under the description,
	// such as a privacy note
	note?: string;
	repoUrl?: string;
	year?: number;
	tags?: string[];
	// true shows an "AI Assisted" label on the project's page, its card and its
	// Introduction shortcut (not in the sidebar)
	aiAssisted?: boolean;
	details?: ProjectDetails; // without it, the card has no "Show details" button
};

// Ids of the projects that run inside this site. Add the id here when a project becomes
// "integrated"; TypeScript then asks for its component in src/projects/registry.ts.
export type IntegratedProjectId = "are-you-human";

// An archived project must say which category it belongs to, and an integrated one
// must use an id from IntegratedProjectId; ongoing projects need neither.
export type Project =
	| (ProjectInfo & { status: "ongoing" })
	| (ProjectInfo & { status: "integrated"; id: IntegratedProjectId })
	| (ProjectInfo & { status: "archived"; category: ArchiveCategoryId });

export const projects: Project[] = [
	{
		id: "are-you-human",
		title: "Are You Human?",
		note: "No data is collected. The only information used is what your browser already gives away to every website, like its language, clock and system. It's never saved, not even in your browser's storage: it's used for the questions, then thrown away.",
		status: "integrated",
		aiAssisted: true,
	},
	{
		id: "personal-website",
		title: "Personal Website",
		description:
			"The site you're on now: a portfolio built with React and TypeScript, published on GitHub Pages.\nIt keeps growing with new pages and integrated projects.",
		status: "ongoing",
		repoUrl: "https://github.com/Pereira3/pereira3.github.io",
		year: 2026,
		tags: ["React", "TypeScript", "Vite", "GitHub Pages"],
		aiAssisted: true,
	},
	{
		id: "ep-management",
		title: "EP Management",
		description:
			"Web app to manage a company's employees and projects, and how much of each employee's time goes to each project.\nBuilt with Next.js, React and TypeScript, with unit and end-to-end tests.",
		status: "archived",
		category: "personal",
		repoUrl: "https://github.com/Pereira3/React_EPManagement",
		year: 2026,
		tags: ["React", "TypeScript"],
		details: {
			about: "The app has two views, Employees and Projects.\nEach employee has a name, start date, role and team.\nEach project lists the employees working on it and the share of their time they give it.",
			highlights: [
				"Add, edit and delete employees and projects, with a confirmation before deleting",
				"Assign employees to projects by percentage, without letting anyone go over 100% in total",
				"Validation on every field: name lengths, known roles and teams, and realistic start dates",
				'Duplicate checks that ignore letter case but keep spacing, so "Davide Silva" and "Davi de Silva" stay different people',
				"Shared app state managed with Zustand",
				"43 Jest unit tests for the validation logic and 11 Cypress end-to-end tests",
				"Linting and type checks before every commit, using Husky",
			],
			facts: [
				{ label: "Framework", value: "Next.js" },
				{ label: "Language", value: "TypeScript" },
				{ label: "Interface", value: "Material UI" },
				{ label: "State", value: "Zustand" },
				{ label: "Testing", value: "Jest, Cypress" },
			],
		},
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
		details: {
			about: "Unknown follows a former army commander in the 1600s who is betrayed by people who want his position. He is arrested, exiled to the poorest part of the kingdom, and dies without anyone knowing his name.\nAfter his death he has lost his memory, and the game takes him back through the places where he spent most of his life, mixing nostalgia with uncertainty.",
			highlights: [
				"Built the 2D platformer movement, taught step by step in an interactive tutorial",
				"Designed five levels whose exit doors open only after collecting enough diamonds",
				"Added levers and locked doors that move the player between rooms",
				"Told the commander's story through memories the player triggers along the way",
				"Added hazards and a game-over screen",
			],
			facts: [
				{ label: "Engine", value: "Unity" },
				{ label: "Genre", value: "2D platformer" },
				{ label: "Levels", value: "Tutorial and 5 levels" },
				{ label: "Controls", value: "Keyboard and mouse" },
			],
			links: [
				{
					label: "Download on itch.io",
					url: "https://pereira3.itch.io/unknown",
				},
			],
		},
	},
	{
		id: "houdina",
		title: "Houdina",
		description:
			"Mobile app for buying and renting cars, with Google Maps integration.\nBuilt with Flutter and Firebase.",
		status: "archived",
		category: "university",
		repoUrl: "https://github.com/MrBrodinha/Houdina",
		year: 2024,
		tags: ["Flutter", "Dart"],
		details: {
			about: "Users create an account, browse the available cars, and choose to buy or rent one. A map shows where each car is and draws the route from the user's location. Accounts, cars and bookings are stored in Firebase.",
			highlights: [
				"Sign-up and login with Firebase Authentication, checking that usernames aren't already taken",
				"Screens to browse cars and to rent or schedule one, with a list of the user's rentals",
				"A map with the user's location and the route to the car, using Google Maps",
				"An account page with profile options and file uploads to Firebase Storage",
			],
			facts: [
				{ label: "Platform", value: "Android" },
				{ label: "Framework", value: "Flutter" },
				{ label: "Language", value: "Dart" },
				{
					label: "Backend",
					value: "Firebase: Auth, Firestore, Storage",
				},
			],
		},
	},
	{
		id: "bhschool",
		title: "BHSchool",
		description:
			"School management web app where admins, teachers and students each get their own pages.\nBuilt with Spring Boot and MySQL.",
		status: "archived",
		category: "university",
		repoUrl: "https://github.com/Pereira3/BHSchool",
		year: 2024,
		tags: ["Spring Boot", "Java", "MySQL"],
		details: {
			about: "Admins manage courses, teachers and students. Teachers grade the students in their courses, and students follow their own courses and grades. The app enforces the school's rules, such as refusing to delete a course that still has people in it.",
			highlights: [
				"Three roles, admin, teacher and student, each with their own pages",
				"Blocked users from opening another role's pages by changing the address",
				"Admin tools for courses and users, with rules such as unique emails and a minimum age",
				"Refused to delete a course that still has teachers or students in it",
				"Grading for teachers, where the average automatically updates the student's registration status",
			],
			facts: [
				{ label: "Framework", value: "Spring Boot" },
				{ label: "Language", value: "Java" },
				{ label: "Database", value: "MySQL with Spring Data JPA" },
			],
		},
	},
	{
		id: "gemp",
		title: "Gemp",
		description:
			"Web app for companies to manage their projects and employees, with an admin overview that exports to PDF.\nBuilt with PHP and MySQL.",
		status: "archived",
		category: "university",
		repoUrl: "https://github.com/Pereira3/Gemp",
		year: 2024,
		tags: ["PHP", "MySQL"],
		details: {
			about: "Each company signs up and manages its own projects, with their cost and theme, and its employees, with their age, role and working hours. The admin sees every company in one overview, can remove companies, and can download the overview as a PDF.",
			highlights: [
				"Sign-up and login with separate company and admin profiles",
				"Forms to add, view and remove projects and employees, sent to a PHP API with jQuery",
				"An admin overview of every company, project and employee",
				"One-click PDF export of the overview with html2pdf.js",
			],
			facts: [
				{ label: "Language", value: "PHP" },
				{ label: "Database", value: "MySQL" },
			],
		},
	},
	{
		id: "wordle",
		title: "Wordle",
		description:
			"Desktop version of the word game Wordle, playable in Portuguese, English or French.\nBuilt with Java and JavaFX.",
		status: "archived",
		category: "university",
		repoUrl: "https://github.com/Pereira3/Wordle",
		year: 2023,
		tags: ["Java", "JavaFX"],
		details: {
			about: "Players sign in, choose a language and a word length from 3 to 7 letters, and try to guess the hidden word. A guessed word is worth 100 points, when the word isn't found, each yellow or green letter still earns 10. Accounts are saved to a file between sessions.",
			highlights: [
				"Sign-in and sign-up screens, with accounts saved to a file",
				"A settings screen to choose the language and the word length",
				"Colour feedback for every letter, as in the original game",
				"Scoring of 100 points per word, or 10 per yellow or green letter",
				"A help screen that explains the rules",
			],
			facts: [
				{ label: "Language", value: "Java" },
				{ label: "Interface", value: "JavaFX" },
				{
					label: "Game languages",
					value: "Portuguese, English, French",
				},
				{ label: "Word length", value: "3 to 7 letters" },
			],
		},
	},
];

export const ongoingProjects = projects.filter(
	(project) => project.status === "ongoing",
);
export const integratedProjects = projects.filter(
	(project) => project.status === "integrated",
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
