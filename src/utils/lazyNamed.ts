import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

// React's lazy() only accepts a module's default export. This loads a named export
// instead, so components keep the named exports used everywhere else, e.g.
// lazyNamed(() => import("@/pages/ProjectPage/ProjectPage"), "ProjectPage").
// Meant for pages and integrated projects, which take no props.
export function lazyNamed<
	Name extends string,
	Module extends Record<Name, ComponentType>,
>(load: () => Promise<Module>, name: Name): LazyExoticComponent<ComponentType> {
	return lazy(() => load().then((module) => ({ default: module[name] })));
}
