/**
 * CRM - Authentication & Registration JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  Auth.checkAuth(true);

  // Tab elements
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const demoBanner = document.getElementById('demo-banner');
  const authSubtitle = document.getElementById('auth-subtitle');
  const alertContainer = document.getElementById('alert-container');

  // Login form elements
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  const toggleIcon = document.getElementById('toggle-icon');
  const rememberCheckbox = document.getElementById('remember-me');
  const demoFillBtn = document.getElementById('demo-fill-btn');
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  const switchToRegister = document.getElementById('switch-to-register');

  // Register form elements
  const regNameInput = document.getElementById('reg-name');
  const regEmailInput = document.getElementById('reg-email');
  const regPasswordInput = document.getElementById('reg-password');
  const regConfirmPasswordInput = document.getElementById('reg-confirm-password');
  const regTogglePasswordBtn = document.getElementById('reg-toggle-password-btn');
  const regToggleIcon = document.getElementById('reg-toggle-icon');
  const regSubmitBtn = document.getElementById('reg-submit-btn');
  const switchToLogin = document.getElementById('switch-to-login');

  // --- Tab Switcher Logic ---
  function showLoginTab() {
    clearAlert();
    CRMValidator.clearFormErrors(loginForm);
    CRMValidator.clearFormErrors(registerForm);
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    if (demoBanner) demoBanner.style.display = 'flex';
    authSubtitle.textContent = 'Login to continue';
  }

  function showRegisterTab() {
    clearAlert();
    CRMValidator.clearFormErrors(loginForm);
    CRMValidator.clearFormErrors(registerForm);
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    if (demoBanner) demoBanner.style.display = 'none';
    authSubtitle.textContent = 'Create a new CRM account to get started';
  }

  if (tabLoginBtn) tabLoginBtn.addEventListener('click', showLoginTab);
  if (tabRegisterBtn) tabRegisterBtn.addEventListener('click', showRegisterTab);
  if (switchToRegister) switchToRegister.addEventListener('click', showRegisterTab);
  if (switchToLogin) switchToLogin.addEventListener('click', showLoginTab);

  // Toggle password visibility (Login)
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      toggleIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }

  // Toggle password visibility (Register)
  if (regTogglePasswordBtn) {
    regTogglePasswordBtn.addEventListener('click', () => {
      const isPassword = regPasswordInput.getAttribute('type') === 'password';
      regPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
      regToggleIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }

  // Quick fill demo credentials
  if (demoFillBtn) {
    demoFillBtn.addEventListener('click', (e) => {
      e.preventDefault();
      emailInput.value = 'admin@nexora.com';
      passwordInput.value = 'admin123';
      clearAlert();
    });
  }

  // Forgot password tip
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showAlert('Demo mode: Use <strong>admin@nexora.com</strong> and password <strong>admin123</strong> to login.', 'info');
    });
  }

  function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
      <div class="alert-box alert-${type}">
        <i class="fa-solid fa-${type === 'danger' ? 'circle-exclamation' : 'circle-check'}"></i>
        <div>${message}</div>
      </div>
    `;
    const card = document.querySelector('.login-card');
    if (type === 'danger' && card) {
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
  }

  function clearAlert() {
    alertContainer.innerHTML = '';
  }

  // --- Helper to get registered users ---
  function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem('crm_registered_users') || '[]');
  }

  function saveRegisteredUsers(users) {
    localStorage.setItem('crm_registered_users', JSON.stringify(users));
  }

  // --- Validation Schemas ---
  const loginSchema = [
    { selector: emailInput, validate: (val) => CRMValidator.validateEmail(val, true) },
    { selector: passwordInput, validate: (val) => CRMValidator.validateRequired(val, 'Password') }
  ];

  const registerSchema = [
    { selector: regNameInput, validate: (val) => CRMValidator.validateName(val, 'Full Name') },
    { selector: regEmailInput, validate: (val) => CRMValidator.validateEmail(val, true) },
    { selector: regPasswordInput, validate: (val) => CRMValidator.validatePassword(val, 6) },
    { selector: regConfirmPasswordInput, validate: (val) => CRMValidator.validateConfirmPassword(val, regPasswordInput.value) }
  ];

  CRMValidator.setupForm(loginForm, loginSchema);
  CRMValidator.setupForm(registerForm, registerSchema);

  // --- Handle Login Submit ---
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlert();

    if (!CRMValidator.validateForm(loginForm, loginSchema)) {
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';

    setTimeout(() => {
      const emailLower = email.toLowerCase();
      const isDefaultAdmin = (emailLower === 'admin@nexora.com' || emailLower === 'admin@crm.com') && password === 'admin123';
      const registeredUsers = getRegisteredUsers();
      const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (isDefaultAdmin || matchedUser) {
        const remember = rememberCheckbox.checked;
        Auth.login(remember);

        const userName = matchedUser ? matchedUser.name : 'Admin';
        localStorage.setItem('crm_current_user_name', userName);

        showAlert('Login successful! Redirecting to Dashboard...', 'success');

        CRMData.addActivity(`${userName} logged in to NEXORA dashboard`, 'customer');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 600);
      } else {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.innerHTML = 'Login <i class="fa-solid fa-arrow-right"></i>';
        showAlert('Invalid credentials! Please use <strong>admin@crm.com</strong> and <strong>admin123</strong> or register a new account.', 'danger');
      }
    }, 500);
  });

  // --- Handle Register Submit ---
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlert();

    if (!CRMValidator.validateForm(registerForm, registerSchema)) {
      return;
    }

    const name = regNameInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value.trim();

    // Check if email already exists
    const users = getRegisteredUsers();
    if (email.toLowerCase() === 'admin@crm.com' || email.toLowerCase() === 'admin@nexora.com' || users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      CRMValidator.showError(regEmailInput, 'This email address is already registered.');
      showAlert('This email address is already registered. Please login.', 'danger');
      return;
    }

    regSubmitBtn.disabled = true;
    regSubmitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating account...';

    setTimeout(() => {
      // Save new user
      users.push({
        id: 'usr-' + Date.now(),
        name,
        email,
        password,
        registeredAt: new Date().toISOString()
      });
      saveRegisteredUsers(users);

      regSubmitBtn.disabled = false;
      regSubmitBtn.innerHTML = 'Register <i class="fa-solid fa-user-plus"></i>';
      registerForm.reset();

      // Switch to login tab and prefill email
      showLoginTab();
      emailInput.value = email;
      passwordInput.value = '';
      passwordInput.focus();

      showAlert('Account registered successfully! Please login with your password.', 'success');

      CRMData.addActivity(`New user registered: ${name} (${email})`, 'customer');
    }, 600);
  });
});
