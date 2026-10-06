import { Route, Routes } from "react-router";
import { Layout } from "@/components/Layout/Layout";
import { WelcomeScreen } from "@/components/WelcomeScreen/WelcomeScreen";
import { Introduction } from "@/pages/Introduction/Introduction";
import { NotFound } from "@/pages/NotFound/NotFound";
import { lazyNamed } from "@/utils/lazyNamed";

// These pages download only when someone opens them. While they download,
// the Loading component shows in the right-hand panel (see Layout.tsx).
// Introduction and NotFound load right away, since visitors land on them directly.
const ProjectPage = lazyNamed(
	() => import("@/pages/ProjectPage/ProjectPage"),
	"ProjectPage",
);
const ArchivedProjects = lazyNamed(
	() => import("@/pages/ArchivedProjects/ArchivedProjects"),
	"ArchivedProjects",
);

// WelcomeScreen plays the welcome over the site when a visitor arrives.
// Every route renders inside Layout, which draws the sidebar.
// The matching page appears in the right-hand panel through <Outlet />.
export default function App() {
	return (
		<WelcomeScreen>
			<Routes>
				<Route element={<Layout />}>
					<Route index element={<Introduction />} />
					<Route
						path="projects/:projectId"
						element={<ProjectPage />}
					/>
					<Route
						path="archived/:categoryId"
						element={<ArchivedProjects />}
					/>
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</WelcomeScreen>
	);
}
