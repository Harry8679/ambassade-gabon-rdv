import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT pour GitHub Pages :
// Remplacez "ambassade-gabon-rdv" par le NOM EXACT de votre dépôt GitHub.
// Exemple : si votre dépôt est https://github.com/harry/rdv-passeport
//           alors mettez  base: "/rdv-passeport/"
export default defineConfig({
  base: "/ambassade-gabon-rdv/",
  plugins: [react()],
});
