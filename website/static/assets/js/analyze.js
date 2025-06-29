document.addEventListener("DOMContentLoaded", function () {
  const results = document.getElementById("results");
  const services = document.getElementById("services");

  if (results) {
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (services) {
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

// Spinner element
const spinner = document.createElement("div");
spinner.className = "spinner-border text-info";
spinner.style.marginTop = "20px";
spinner.style.width = "2.5rem";
spinner.style.height = "2.5rem";
spinner.style.display = "none";
uploadBtn.parentNode.appendChild(spinner);

// Function to handle file submission
function handleFileUpload() {
  const previousResults = document.getElementById("results");
  if (previousResults) previousResults.remove();

  uploadBtn.style.display = "none";
  spinner.style.display = "inline-block";

  uploadForm.submit();
}

// Normal file input selection
fileInput.addEventListener("change", function () {
  if (this.files.length > 0) handleFileUpload();
});

// Enable drag-and-drop functionality
function enableDragDrop() {
  const dropArea = uploadForm;

  // Highlight on drag enter
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
      e.preventDefault();
      dropArea.style.borderColor = '#68c1ea';
      dropArea.style.backgroundColor = '#f0f8ff';
    });
  });

  // Reset styles on drag leave/drop
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
      e.preventDefault();
      dropArea.style.borderColor = '#56b8e6';
      dropArea.style.backgroundColor = '#fafafa';
    });
  });

  // Handle dropped files
  dropArea.addEventListener("drop", function (e) {
    e.preventDefault();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files; // assign dropped file
      handleFileUpload();

      // Disable drag-and-drop after successful drop
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.removeEventListener(eventName, () => {});
      });

      dropArea.style.pointerEvents = "none";
    }
  });
}

enableDragDrop();
AOS.init();
