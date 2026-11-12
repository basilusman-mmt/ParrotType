const themeButton = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("parrottype-theme");
if (savedTheme === "light") document.body.classList.add("light");
if (themeButton) {
    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("light");
        localStorage.setItem("parrottype-theme", document.body.classList.contains("light") ? "light" : "dark");
    });
}
