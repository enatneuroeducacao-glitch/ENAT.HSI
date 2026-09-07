const base = process.env.VITE_BASE_PATH || "/";

export default {
  // The public ENAT HSI site uses the custom domain root. A relative base
  // ("./") breaks JavaScript/CSS asset URLs on nested SPA routes such as
  // /artigo/<id>, because the browser then requests /artigo/assets/*.
  // Keep the base absolute so every route loads the same Vite assets.
  base,
  esbuild: {
    jsx: "automatic",
  },
};
