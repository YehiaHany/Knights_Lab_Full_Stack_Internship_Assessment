document.addEventListener("DOMContentLoaded", function () {
  const results = document.getElementById("results");
  const services = document.getElementById("services");

  if (results) {
    // Scroll to results block normally
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (services) {
    // Scroll to middle of #services section
    const targetY = services.getBoundingClientRect().top + window.scrollY;
    const offset = targetY - window.innerHeight / 2 + services.offsetHeight / 2;

    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  }
});

const fileInput = document.getElementById("fileInput");
const uploadForm = document.getElementById("uploadForm");
const uploadBtn = uploadForm.querySelector("button");

const spinner = document.createElement("div");
spinner.className = "spinner-border text-info";
spinner.style.marginTop = "20px";
spinner.style.width = "2.5rem";
spinner.style.height = "2.5rem";
spinner.style.display = "none";

uploadBtn.parentNode.appendChild(spinner);

fileInput.addEventListener("change", function () {
  if (this.files.length > 0) {
    const previousResults = document.getElementById("results");
    if (previousResults) {
      previousResults.remove();
    }

    uploadBtn.style.display = "none";
    spinner.style.display = "inline-block";

    uploadForm.submit();
  }
});

AOS.init();
// Auto-submit when image is selected
document.getElementById("fileInput").addEventListener("change", function () {
  if (this.files.length > 0) {
    document.getElementById("uploadForm").submit();
  }
});
