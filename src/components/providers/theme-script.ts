export const THEME_STORAGE_KEY = "theme";

/** Runs before first paint so `.dark` / color-scheme match stored preference. */
export const themeInitScript = `(function(){
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    var resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  } catch (e) {}
})();`;
