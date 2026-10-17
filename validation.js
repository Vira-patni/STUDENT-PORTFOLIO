/**
 * SkillForge - Form Validation & UI Utility Service
 * Provides sanitization, field validation, and dynamic toast messaging.
 */

const ValidationService = {
  // Prevent Cross-Site Scripting (XSS) by escaping HTML characters
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Email format regex
  isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    return emailRegex.test(String(email).trim());
  },

  // HTTP or HTTPS URL validation
  isValidUrl(url) {
    if (!url || url.trim() === '') return true; // Optional field empty is valid
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  },

  // Non-empty string check
  isNotEmpty(val, minLen = 1) {
    return val !== undefined && val !== null && String(val).trim().length >= minLen;
  },

  // Mark an input element as valid
  setValid(inputElement) {
    if (!inputElement) return;
    inputElement.classList.remove('is-invalid');
    inputElement.classList.add('is-valid');
    const feedback = inputElement.parentElement.querySelector('.invalid-feedback');
    if (feedback) feedback.textContent = '';
  },

  // Mark an input element as invalid with a friendly message
  setInvalid(inputElement, errorMessage) {
    if (!inputElement) return;
    inputElement.classList.remove('is-valid');
    inputElement.classList.add('is-invalid');
    let feedback = inputElement.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      inputElement.parentElement.appendChild(feedback);
    }
    feedback.textContent = errorMessage;
  },

  // Clear all validation states in a container or form
  clearValidation(containerElement) {
    if (!containerElement) return;
    const inputs = containerElement.querySelectorAll('.is-valid, .is-invalid');
    inputs.forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });
  },

  // Toast Notification System
  showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast';

    let iconClass = 'bi-check-circle-fill success';
    if (type === 'error') {
      iconClass = 'bi-exclamation-triangle-fill error';
    } else if (type === 'info') {
      iconClass = 'bi-info-circle-fill info';
    } else if (type === 'warning') {
      iconClass = 'bi-exclamation-circle-fill text-warning';
    }

    toast.innerHTML = `
      <i class="bi ${iconClass} toast-icon"></i>
      <div class="toast-message">${this.escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-white ms-auto" aria-label="Close" style="font-size:0.75rem;"></button>
    `;

    const closeBtn = toast.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
      toast.classList.add('hide-toast');
      setTimeout(() => toast.remove(), 250);
    });

    container.appendChild(toast);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      if (toast.isConnected) {
        toast.classList.add('hide-toast');
        setTimeout(() => toast.remove(), 250);
      }
    }, 4000);
  }
};
