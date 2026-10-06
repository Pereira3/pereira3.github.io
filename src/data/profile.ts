export type Profile = {
	name: string;
	websiteName: string;
	role: string;
	intro: string; // \n starts a new line, \n\n leaves an empty line
	githubUrl: string;
};

export const profile: Profile = {
	// The name here is linked to the title of the page (in index.html)
	name: "Ricardo Pereira",
	websiteName: "RP",
	role: "Software Engineer",
	intro: "This site is where I collect the things I build, from current experiments to finished work.\nOngoing projects are what I'm working on right now, and each one has its own page.\nArchived projects holds finished work, including my university projects, each with a short description and a link to its code on GitHub.",
	githubUrl: "https://github.com/Pereira3",
};
