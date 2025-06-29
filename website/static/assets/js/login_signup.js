let container = document.getElementById('container');

toggle = () => {
  container.classList.toggle('sign-in');
  container.classList.toggle('sign-up');
};

setTimeout(() => {
  container.classList.add('sign-in');
}, 200);

// Handle form submissions
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => { data[key] = value });

    const actionType = data['action']; // 'login' or 'signup'
    const successMessage = actionType === 'login' 
      ? 'Signed in successfully!' 
      : 'Signed up successfully!';

    const response = await fetch('/auth_action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.status === 'success') {
      localStorage.setItem('auth_success', successMessage);
      window.location.href = result.redirect;
    } else {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: result.message,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });
    }
  });
});
