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

// Supabase client (only initializes if supabase-config.js has real values filled in)
let supabaseClient = null;
if (
  window.supabase &&
  window.SUPABASE_URL &&
  window.SUPABASE_ANON_KEY &&
  window.SUPABASE_URL.startsWith('http') &&
  !window.SUPABASE_URL.includes('PASTE_YOUR')
) {
  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

// Registration form -> saves to Supabase (if configured) + opens a pre-filled email to admin
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const planEl = document.querySelector('input[name="plan"]:checked');
    const plan = planEl ? planEl.value : 'Not specified';
    const payEl = document.querySelector('input[name="payMethod"]:checked');
    const payMethod = payEl ? payEl.value : 'Not selected';
    const reference = document.getElementById('reference').value || '';

    const submitBtn = registerForm.querySelector('.form-submit');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('mentorship_registrations').insert([{
          full_name: fullName,
          phone: phone,
          email: email,
          package: plan,
          payment_method: payMethod,
          payment_reference: reference || null
        }]);
        if (error) console.error('Supabase insert error:', error);
      } catch (err) {
        console.error('Supabase insert failed:', err);
      }
    }

    const subject = encodeURIComponent('HB Capital Registration — ' + fullName);
    const body = encodeURIComponent(
      'New registration from the HB Capital website:\n\n' +
      'Name: ' + fullName + '\n' +
      'Phone: ' + phone + '\n' +
      'Email: ' + email + '\n' +
      'Package: ' + plan + '\n' +
      'Payment Method: ' + payMethod + '\n' +
      'Payment Reference: ' + (reference || 'Not provided yet') + '\n'
    );

    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;

    window.location.href = 'mailto:trader@hbcapital.com?subject=' + subject + '&body=' + body;
  });
}
