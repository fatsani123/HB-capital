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

// The 9 clusters, grouped by level — used to create a client's initial cluster rows on signup.
const CLUSTERS_BY_LEVEL = {
  'Foundation': [1, 2, 3],
  'Intermediate': [4, 5, 6],
  'Professional': [7, 8, 9],
  'Full Program': [1, 2, 3, 4, 5, 6, 7, 8, 9]
};

// Nav: swap "Sign In" for "Dashboard" if already signed in, and make the
// dashboard callout link either open the real dashboard (if enrollment is
// active) or scroll to the registration section (if not signed in / not yet approved).
async function initAuthAwareUI() {
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  const navAuthLink = document.getElementById('navAuthLink');
  const dashCalloutLink = document.getElementById('dashCalloutLink');

  if (!client) return;

  const { data: { session } } = await client.auth.getSession();

  if (session) {
    if (navAuthLink) {
      navAuthLink.textContent = 'Dashboard';
      navAuthLink.href = (session.user.email === (window.ADMIN_EMAIL || 'fatsaninkhono01@gmail.com')) ? 'admin.html' : 'dashboard.html';
    }

    if (dashCalloutLink) {
      const { data: enrollment } = await client
        .from('enrollments')
        .select('status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (enrollment && enrollment.status === 'active') {
        dashCalloutLink.href = 'https://marketpulser01.vercel.app';
        dashCalloutLink.target = '_blank';
        dashCalloutLink.rel = 'noopener';
        dashCalloutLink.textContent = 'Open Dashboard →';
      } else {
        dashCalloutLink.href = 'dashboard.html';
        dashCalloutLink.textContent = 'View Your Status →';
      }
    }
  } else if (dashCalloutLink) {
    // Not signed in — clicking scrolls to the registration section instead of navigating away.
    dashCalloutLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('join').scrollIntoView({ behavior: 'smooth' });
    });
  }
}
initAuthAwareUI();

// Registration form -> creates a real account (Supabase Auth), an enrollment,
// and the client's initial cluster rows, then signs them straight into the dashboard.
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const planEl = document.querySelector('input[name="plan"]:checked');
    const planRaw = planEl ? planEl.value : '';
    const plan = planRaw.split(' —')[0]; // "Foundation", "Full Program", etc.
    const payEl = document.querySelector('input[name="payMethod"]:checked');
    const payMethod = payEl ? payEl.value : null;
    const reference = document.getElementById('reference').value || null;

    const errorNote = document.getElementById('registerError') || (() => {
      const div = document.createElement('div');
      div.id = 'registerError';
      div.className = 'auth-error';
      registerForm.prepend(div);
      return div;
    })();
    errorNote.classList.remove('active');

    if (password !== confirmPassword) {
      errorNote.textContent = "Passwords don't match.";
      errorNote.classList.add('active');
      return;
    }

    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) {
      errorNote.textContent = 'The site is not yet connected to its account system. Please contact Trader Fatsa directly.';
      errorNote.classList.add('active');
      return;
    }

    const submitBtn = registerForm.querySelector('.form-submit');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;

    // 1. Create the account
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone } }
    });

    if (signUpError) {
      errorNote.textContent = signUpError.message;
      errorNote.classList.add('active');
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
      return;
    }

    const userId = signUpData.user ? signUpData.user.id : null;

    if (userId) {
      // 2. Create the enrollment record (status starts as 'pending' until admin approves)
      const { error: enrollError } = await client.from('enrollments').insert([{
        user_id: userId,
        plan: plan,
        status: 'pending',
        payment_method: payMethod,
        payment_reference: reference
      }]);
      if (enrollError) console.error('Enrollment insert error:', enrollError);

      // 3. Create the client's cluster rows for their chosen plan (all locked until admin approves enrollment)
      const clusterIds = CLUSTERS_BY_LEVEL[plan] || CLUSTERS_BY_LEVEL['Foundation'];
      const clusterRows = clusterIds.map(id => ({ user_id: userId, cluster_id: id, status: 'locked' }));
      const { error: clustersError } = await client.from('client_clusters').insert(clusterRows);
      if (clustersError) console.error('Cluster rows insert error:', clustersError);
    }

    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;

    // If email confirmation is required, there's no session yet — let the person know to check their inbox.
    if (!signUpData.session) {
      errorNote.classList.remove('active');
      registerForm.innerHTML = '<div class="join-note" style="text-align:center;font-size:14px;">Account created! Please check your email to confirm your address, then <a href="login.html" style="color:#2456DB;font-weight:700;">sign in</a> to see your dashboard.</div>';
      return;
    }

    window.location.href = 'dashboard.html';
  });
}
