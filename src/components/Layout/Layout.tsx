import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Loading } from "@/components/Loading/Loading";
import styles from "@/components/Layout/Layout.module.css";
import { useSiteAccess } from "@/hooks/useSiteAccess";

const COLLAPSED_KEY = "sidebar-collapsed";

// Remembers whether the visitor collapsed the sidebar last time.
function readCollapsed(): boolean {
	try {
		return localStorage.getItem(COLLAPSED_KEY) === "true";
	} catch {
		return false;
	}
}

export function Layout() {
	const [collapsed, setCollapsed] = useState(readCollapsed);
	const [mobileOpen, setMobileOpen] = useState(false);
	const { pathname } = useLocation();
	const { lockedPath, blockAccess } = useSiteAccess();
	const locked = lockedPath !== null;

	// While a page has locked the site, going anywhere else (for example with the
	// browser's Back button) blocks access to the website.
	useEffect(() => {
		if (lockedPath && pathname !== lockedPath) blockAccess();
	}, [pathname, lockedPath, blockAccess]);

	useEffect(() => {
		try {
			localStorage.setItem(COLLAPSED_KEY, String(collapsed));
		} catch {
			// Storage can be unavailable (private mode); the sidebar still works.
		}
	}, [collapsed]);

	// Start each page at the top.
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	// Escape closes the mobile menu.
	useEffect(() => {
		if (!mobileOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMobileOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [mobileOpen]);

	return (
		<div className={styles.shell}>
			<header className={styles.topBar}>
				<button
					type="button"
					className={styles.menuButton}
					onClick={() => setMobileOpen(true)}
					disabled={locked}
					aria-label="Open menu"
					aria-controls="sidebar"
					aria-expanded={mobileOpen}
				>
					<Menu size={22} aria-hidden="true" />
				</button>
			</header>

			<Sidebar
				locked={locked}
				collapsed={collapsed}
				onToggleCollapsed={() => setCollapsed((value) => !value)}
				mobileOpen={mobileOpen}
				onCloseMobile={() => setMobileOpen(false)}
			/>

			{mobileOpen && (
				<div
					className={styles.scrim}
					onClick={() => setMobileOpen(false)}
					aria-hidden="true"
				/>
			)}

			<main className={styles.main}>
				<div className={styles.content}>
					<Suspense fallback={<Loading />}>
						<Outlet />
					</Suspense>
				</div>
			</main>
		</div>
	);
}
