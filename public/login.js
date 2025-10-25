const resolveApiBase = () => {
  const { origin, protocol, hostname, port } = window.location;
  if (origin && origin.startsWith('http') && (port === '' || port === '4000')) {
    return origin;
  }
  if (hostname === '127.0.0.1' || hostname === 'localhost') {
    return `${protocol}//${hostname}:4000`;
  }
  return 'http://localhost:4000';
};

const API_BASE = resolveApiBase();
const isFileProtocol = window.location.protocol === 'file:';

const authForm = document.getElementById('auth-form');
const nameFieldWrapper = document.getElementById('name-field');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authSubmitBtn = document.getElementById('auth-submit');
const toggleModeBtn = document.getElementById('toggle-mode');
const switchText = document.getElementById('switch-text');
const authMessageEl = document.getElementById('auth-message');
const fileWarningEl = document.getElementById('file-warning');

let mode = 'login';

const showFileWarning = () => {
  if (!fileWarningEl) return;
  fileWarningEl.textContent =
    'Zwiggato must be opened via http://localhost:4000/login.html (run `npm start` inside /server). Authentication will fail when the page is opened directly from the file system.';
  fileWarningEl.dataset.type = 'error';
  fileWarningEl.classList.remove('hidden');
};

const request = async (path, options = {}) => {
  const headers = options.headers ? { ...options.headers } : {};
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (isFileProtocol) {
    showFileWarning();
  }
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers,
    });
    return response;
  } catch (error) {
    console.error('Network error:', error);
    setMessage('Cannot reach server. Make sure `npm start` is running in /server.', 'error');
    throw error;
  }
};

const setMessage = (text, type = 'info') => {
  authMessageEl.textContent = text;
  authMessageEl.dataset.type = type;
};

const updateModeUI = () => {
  if (mode === 'signup') {
    nameFieldWrapper.classList.remove('hidden');
    authSubmitBtn.textContent = 'Create Account';
    switchText.textContent = 'Already have an account?';
    toggleModeBtn.textContent = 'Back to login';
    passwordInput.setAttribute('autocomplete', 'new-password');
  } else {
    nameFieldWrapper.classList.add('hidden');
    authSubmitBtn.textContent = 'Log In';
    switchText.textContent = 'New to Zwiggato?';
    toggleModeBtn.textContent = 'Create account';
    passwordInput.setAttribute('autocomplete', 'current-password');
  }
  setMessage('');
};

toggleModeBtn.addEventListener('click', () => {
  mode = mode === 'login' ? 'signup' : 'login';
  updateModeUI();
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };

  if (mode === 'signup') {
    payload.name = nameInput.value.trim();
    if (!payload.name) {
      setMessage('Please enter your name.', 'error');
      return;
    }
  }

  if (!payload.email || !payload.password) {
    setMessage('Email and password are required.', 'error');
    return;
  }

  setMessage(mode === 'login' ? 'Signing you in...' : 'Creating your account...');

  try {
    const res = await request(`/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Unable to process request');
    }
    setMessage(mode === 'login' ? 'Welcome back! Redirecting...' : 'Account created! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  } catch (error) {
    console.error(error);
    setMessage(error.message || 'Something went wrong', 'error');
  }
});

const checkSession = async () => {
  try {
    const res = await request('/auth/me');
    if (res.ok) {
      window.location.href = 'index.html';
    }
  } catch (error) {
    // ignore - user is likely not authenticated
  }
};

document.addEventListener('DOMContentLoaded', () => {
  updateModeUI();
  if (isFileProtocol) {
    showFileWarning();
  }
  checkSession();
});
