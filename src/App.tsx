import { lazy } from "react";
import { Route, Routes } from "react-router";
import { Layout } from "src/components/Layout/Layout";
import { Introduction } from "src/pages/Introduction/Introduction";
import { NotFound } from "src/pages/NotFound/NotFound";

// These pages download only when someone opens them. While they download,
// the Loading component shows in the right-hand panel (see Layout.tsx).
// Introduction and NotFound load right away, since visitors land on them directly.
const ActiveProjects = lazy(() =>
	import("src/pages/ActiveProjects/ActiveProjects").then((m) => ({
		default: m.ActiveProjects,
	})),
);
const ArchivedProjects = lazy(() =>
	import("src/pages/ArchivedProjects/ArchivedProjects").then((m) => ({
		default: m.ArchivedProjects,
	})),
);

// Every route renders inside Layout, which draws the sidebar.
// The matching page appears in the right-hand panel through <Outlet />.
export default function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route index element={<Introduction />} />
				<Route
					path="projects/:projectId"
					element={<ActiveProjects />}
				/>
				<Route
					path="archived/:categoryId"
					element={<ArchivedProjects />}
				/>
				<Route path="*" element={<NotFound />} />
			</Route>
		</Routes>
	);
}
