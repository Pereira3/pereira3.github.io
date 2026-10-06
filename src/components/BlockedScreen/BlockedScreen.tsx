import { useEffect, useRef } from "react";
import { RotateCcw, ShieldX } from "lucide-react";
import { pageTitle } from "@/utils/pageTitle";
import styles from "@/components/BlockedScreen/BlockedScreen.module.css";

type BlockedScreenProps = {
	onStartOver: () => void;
};

// Replaces the whole site when a visitor fails a check in Are You Human?.
export function BlockedScreen({ onStartOver }: BlockedScreenProps) {
	const headingRef = useRef<HTMLHeadingElement>(null);

	// Focus goes to the heading, so screen readers announce it. Not to the button: a check
	// answered with Enter would otherwise "press" it straight away and skip this screen.
	useEffect(() => {
		headingRef.current?.focus();
	}, []);

	return (
		<main className={styles.screen}>
			<title>{pageTitle("Access blocked")}</title>

			<ShieldX className={styles.icon} size={44} aria-hidden="true" />
			<h1 className={styles.title} ref={headingRef} tabIndex={-1}>
				Access blocked
			</h1>
			<p className={styles.message}>
				You didn't meet the requirements to access this website, so your
				access has been blocked.
			</p>

			<button
				type="button"
				className={styles.button}
				onClick={onStartOver}
			>
				<RotateCcw size={18} aria-hidden="true" />
				Start a new session
			</button>
		</main>
	);
}
