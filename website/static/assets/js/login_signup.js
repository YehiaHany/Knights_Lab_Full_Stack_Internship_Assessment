document.addEventListener('DOMContentLoaded', () => {
  // Show info alert for Cross-Site Tracking on page load
  Swal.fire({
    icon: 'info',
    title: 'Important Notice',
    html: 'Please if you <b>enable preventing Cross-Site Tracking</b> in your browser settings <b>disable it</b> (especially on iOS) to use our service properly.',
    confirmButtonText: 'Got it!',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      confirmButton: 'custom-confirm-button'
    },
    didOpen: () => {
      const confirmBtn = document.querySelector('.swal2-confirm.custom-confirm-button');
      if (confirmBtn) {
        confirmBtn.style.backgroundColor = '#56b8e6';
        confirmBtn.style.border = 'none';
        confirmBtn.style.boxShadow = '0 0 0 3px #56b8e655'; // soft highlight with same color
        confirmBtn.style.outline = 'none'; // remove default purple outline
        confirmBtn.addEventListener('mousedown', (e) => {
          e.preventDefault(); // prevents disappearance on outside click
        });
      }
    }
  });

  // Attach form submission handler to all forms
  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Extract form data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      const actionType = data['action'];
      const successMessage =
        actionType === 'login'
          ? 'Signed in successfully!'
          : 'Signed up successfully!';

      try {
        const response = await fetch('/auth_action', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.status === 'success') {
          localStorage.setItem('auth_success', successMessage);
          const redirectUrl = result.redirect || data['next'] || '/';
          window.location.href = redirectUrl;
        } else {
          showToast(result.message || 'Authentication failed.');
        }
      } catch (error) {
        console.error(error);
        showToast('Something went wrong. Please try again.');
      }
    });
  });

  // Show success toast from localStorage if exists
  const flashMessage = localStorage.getItem('auth_success');
  if (flashMessage) {
    showSuccess(flashMessage);
    localStorage.removeItem('auth_success');
  }
});

// SweetAlert2: Error toast
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

// SweetAlert2: Success toast
function showSuccess(message) {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}
