document.body.classList.add('js-ready');
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Payment method picker
const payMethods = document.querySelectorAll('input[name="payMethod"]');
if (payMethods.length) {
  payMethods.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.pay-detail-panel').forEach(p => p.classList.remove('active'));
      const target = document.getElementById(radio.dataset.target);
      if (target) target.classList.add('active');
      const nextSteps = document.getElementById('payNextSteps');
      if (nextSteps) nextSteps.classList.add('active');
    });
  });
}

// Registration form -> pre-filled email to admin (MVP until a real backend exists)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const planEl = document.querySelector('input[name="plan"]:checked');
    const plan = planEl ? planEl.value : 'Not specified';
    const payEl = document.querySelector('input[name="payMethod"]:checked');
    const payMethod = payEl ? payEl.value : 'Not selected';
    const reference = document.getElementById('reference').value || 'Not provided yet';

    const subject = encodeURIComponent('HB Capital Registration — ' + fullName);
    const body = encodeURIComponent(
      'New registration from the HB Capital website:\n\n' +
      'Name: ' + fullName + '\n' +
      'Phone: ' + phone + '\n' +
      'Email: ' + email + '\n' +
      'Package: ' + plan + '\n' +
      'Payment Method: ' + payMethod + '\n' +
      'Payment Reference: ' + reference + '\n'
    );

    window.location.href = 'mailto:trader@hbcapital.com?subject=' + subject + '&body=' + body;
  });
}
