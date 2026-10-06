export type Profile = {
	name: string;
	websiteName: string;
	role: string;
	intro: string; // \n starts a new line, \n\n leaves an empty line
	githubUrl: string;
};

export const profile: Profile = {
	name: "Ricardo Pereira", // the heading of the Introduction page
	// Used in every browser tab title (see pageTitle). index.html has its own copy in
	// <title>, shown before React starts, so change both together.
	websiteName: "RP",
	role: "Software Engineer",
	intro: "This site is where I collect the things I build, from current experiments to finished work.\nOngoing projects are what I'm working on right now, and each one has its own page.\nArchived projects holds finished work, including my university projects, each with a short description and a link to its code on GitHub.",
	githubUrl: "https://github.com/Pereira3",
};
