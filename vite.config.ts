import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base "/" is right for a repo named <username>.github.io.
// If you deploy from another repo name, change it to "/<repo-name>/".
export default defineConfig({
	plugins: [react()],
	base: "/",
	resolve: {
		tsconfigPaths: true,
	},
});
