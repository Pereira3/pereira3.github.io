import { Link } from "react-router";
import { pageTitle } from "@/utils/pageTitle";
import page from "@/styles/Page.module.css";

export function NotFound() {
	return (
		<article>
			<title>{pageTitle("Page not found")}</title>

			<h1 className={page.title}>Page not found</h1>
			<p className={page.lead}>
				The page you are looking for does not exist.
			</p>
			<p className={page.actions}>
				<Link className={page.textLink} to="/">
					Go to the Introduction
				</Link>
			</p>
		</article>
	);
}
