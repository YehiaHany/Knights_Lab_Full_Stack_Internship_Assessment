const container = document.getElementById('container');

// Toggle between sign-in and sign-up modes
function toggle() {
  container.classList.toggle('sign-in');
  container.classList.toggle('sign-up');
}

// Default to sign-in view on load
setTimeout(() => {
  container.classList.add('sign-in');
}, 200);

// Attach submit handler to all forms (sign-in and sign-up)
document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    const actionType = data['action']; // login or signup
    const successMessage =
      actionType === 'login' ? 'Signed in successfully!' : 'Signed up successfully!';

    try {
      const response = await fetch('/auth_action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === 'success') {
        localStorage.setItem('auth_success', successMessage);

        // Redirect to either server-provided redirect or fallback
        const redirectUrl = result.redirect || data['next'] || '/';
        console.log("Redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
      } else {
        showToast(result.message);
      }
    } catch (err) {
      showToast("Something went wrong. Please try again.");
      console.error(err);
    }
  });
});

// Show error toast using SweetAlert2
function showToast(message) {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
}
