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

// Payment method tabs
const payTabs = document.querySelectorAll('.pay-tab-btn');
if (payTabs.length) {
  payTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      payTabs.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pay-detail').forEach(d => d.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('pay-' + btn.dataset.pay).classList.add('active');
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
    const payMethod = document.querySelector('.pay-tab-btn.active').textContent.trim();
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
