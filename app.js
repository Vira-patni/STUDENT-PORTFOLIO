/**
 * SkillForge - Main Application Controller
 * Manages view routing, theme toggling, profile management, certs/achievements CRUD, and dashboard aggregation.
 */

const App = {
  currentView: 'dashboard',
  editingCertId: null,
  editingAchId: null,

  async init() {
    // Initialize storage with demo data if first load
    StorageService.init();

    // Apply saved theme
    this.initTheme();

    // Setup navigation and shell event listeners
    this.setupNavigation();
    this.setupProfileForm();
    this.setupCertifications();
    this.setupAchievements();
    this.setupGlobalActions();

    // Initialize submodules
    await SkillsModule.init();
    await ProjectsModule.init();
    AnalyticsModule.init();
    PortfolioModule.init();

    // Render dashboard stats
    this.updateDashboard();
  },

  // --- Theme Management ---
  initTheme() {
    const savedTheme = StorageService.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeToggleIcon(savedTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        StorageService.saveTheme(nextTheme);
        this.updateThemeToggleIcon(nextTheme);
        AnalyticsModule.updateCharts();
      });
    }
  },

  updateThemeToggleIcon(theme) {
    const icon = document.getElementById('themeToggleIcon');
    if (icon) {
      if (theme === 'light') {
        icon.className = 'bi bi-moon-stars-fill text-warning';
      } else {
        icon.className = 'bi bi-sun-fill text-warning';
      }
    }
  },

  // --- View Routing & Navigation ---
  setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav-link, [data-view-target]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view') || link.getAttribute('data-view-target');
        if (targetView) {
          this.switchView(targetView);

          // Close mobile sidebar if open
          const sidebar = document.getElementById('appSidebar');
          if (sidebar) sidebar.classList.remove('show-sidebar');
        }
      });
    });

    // Mobile nav toggle button
    const mobileToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.getElementById('appSidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show-sidebar');
      });
    }
  },

  switchView(viewId) {
    this.currentView = viewId;

    // Toggle view section visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });
    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update active nav link
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update page header title
    const pageTitleEl = document.getElementById('topbarPageTitle');
    if (pageTitleEl) {
      const titles = {
        dashboard: 'Dashboard Overview',
        profile: 'Profile Management',
        skills: 'Technical Skills Manager',
        projects: 'Projects Showcase',
        certifications: 'Certifications & Credentials',
        achievements: 'Honors & Achievements',
        analytics: 'Skill Analytics & Visualization',
        portfolio: 'Live Portfolio Preview'
      };
      pageTitleEl.textContent = titles[viewId] || 'SkillForge';
    }

    // Trigger specific views refresh
    if (viewId === 'analytics') {
      AnalyticsModule.updateCharts();
    } else if (viewId === 'portfolio') {
      PortfolioModule.render();
    } else if (viewId === 'dashboard') {
      this.updateDashboard();
    }
  },

  // --- Dashboard Data Synchronization ---
  updateDashboard() {
    const profile = StorageService.getProfile();
    const skills = StorageService.getSkills();
    const projects = StorageService.getProjects();
    const certs = StorageService.getCertifications();
    const achievements = StorageService.getAchievements();

    // 1. Welcome Message & Sidebar Profile
    const welcomeName = document.getElementById('dashboardWelcomeName');
    if (welcomeName) {
      welcomeName.textContent = profile.fullName ? profile.fullName.split(' ')[0] : 'Student';
    }

    const sidebarName = document.getElementById('sidebarStudentName');
    const sidebarRole = document.getElementById('sidebarStudentRole');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    if (sidebarName) sidebarName.textContent = profile.fullName || 'Student Name';
    if (sidebarRole) sidebarRole.textContent = profile.headline || 'Student';
    if (sidebarAvatar) sidebarAvatar.src = profile.avatarUrl || defaultAvatar;

    // 2. Statistics Counter
    const statSkills = document.getElementById('statTotalSkills');
    const statProjects = document.getElementById('statTotalProjects');
    const statCerts = document.getElementById('statTotalCerts');
    const statAchievements = document.getElementById('statTotalAchievements');

    if (statSkills) statSkills.textContent = skills.length;
    if (statProjects) statProjects.textContent = projects.length;
    if (statCerts) statCerts.textContent = certs.length;
    if (statAchievements) statAchievements.textContent = achievements.length;

    // 3. Portfolio Completion Meter & Checklist
    const completion = StorageService.calculateCompletion();
    const compPct = document.getElementById('portfolioCompletionPct');
    const compBar = document.getElementById('portfolioCompletionBar');
    const compList = document.getElementById('portfolioCompletionChecklist');

    if (compPct) compPct.textContent = `${completion.percentage}%`;
    if (compBar) compBar.style.width = `${completion.percentage}%`;

    if (compList) {
      let listHtml = '';
      completion.breakdown.forEach(item => {
        const icon = item.done ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted';
        listHtml += `
          <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-secondary border-opacity-10 small">
            <span><i class="bi ${icon} me-2"></i> ${ValidationService.escapeHtml(item.label)}</span>
            <span class="badge ${item.done ? 'badge-soft-emerald' : 'badge-soft-purple'}">${item.points}%</span>
          </div>
        `;
      });
      compList.innerHTML = listHtml;
    }

    // 4. Recent Projects Widget
    const recentProjectsContainer = document.getElementById('dashboardRecentProjects');
    if (recentProjectsContainer) {
      if (!projects.length) {
        recentProjectsContainer.innerHTML = '<div class="text-muted small py-3 text-center">No projects added yet. Click "+ Add Project" above!</div>';
      } else {
        const recent = projects.slice(0, 3);
        let rHtml = '';
        recent.forEach(p => {
          let statusBadge = 'badge-soft-emerald';
          if (p.status === 'In Progress') statusBadge = 'badge-soft-amber';
          if (p.status === 'Planned') statusBadge = 'badge-soft-blue';

          rHtml += `
            <div class="glass-card p-3 mb-2">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="fw-bold mb-1 text-white">${ValidationService.escapeHtml(p.title)}</h6>
                  <p class="text-secondary small mb-1 text-truncate" style="max-width: 320px;">${ValidationService.escapeHtml(p.description)}</p>
                </div>
                <span class="badge ${statusBadge}">${ValidationService.escapeHtml(p.status)}</span>
              </div>
            </div>
          `;
        });
        recentProjectsContainer.innerHTML = rHtml;
      }
    }

    // 5. Top Skills Glance Widget
    const recentSkillsContainer = document.getElementById('dashboardRecentSkills');
    if (recentSkillsContainer) {
      if (!skills.length) {
        recentSkillsContainer.innerHTML = '<div class="text-muted small py-3 text-center">No skills added yet. Click "+ Add Skill" above!</div>';
      } else {
        const topSkills = skills.slice(0, 5);
        let sHtml = '';
        topSkills.forEach(s => {
          let width = '50%';
          const prof = (s.proficiency || 'Intermediate').toLowerCase();
          if (prof === 'beginner') width = '25%';
          if (prof === 'intermediate') width = '50%';
          if (prof === 'advanced') width = '75%';
          if (prof === 'expert') width = '100%';

          sHtml += `
            <div class="mb-2">
              <div class="d-flex justify-content-between small mb-1">
                <span class="fw-semibold text-white">${ValidationService.escapeHtml(s.name)}</span>
                <span class="text-muted">${ValidationService.escapeHtml(s.proficiency)}</span>
              </div>
              <div class="proficiency-bar">
                <div class="proficiency-fill ${prof}" style="width: ${width};"></div>
              </div>
            </div>
          `;
        });
        recentSkillsContainer.innerHTML = sHtml;
      }
    }

    // Mini chart on dashboard
    AnalyticsModule.updateCharts();
  },

  // --- Profile Management ---
  setupProfileForm() {
    const form = document.getElementById('profileForm');
    const avatarInput = document.getElementById('profileAvatarInput');
    const avatarPreview = document.getElementById('profileAvatarPreview');

    // Populate profile inputs
    this.loadProfileIntoForm();

    // Live avatar preview listener
    if (avatarInput && avatarPreview) {
      avatarInput.addEventListener('input', () => {
        const val = avatarInput.value.trim();
        avatarPreview.src = val || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProfileSubmit();
      });
    }
  },

  loadProfileIntoForm() {
    const profile = StorageService.getProfile();
    const map = {
      profileNameInput: profile.fullName,
      profileHeadlineInput: profile.headline,
      profileEmailInput: profile.email,
      profileCollegeInput: profile.college,
      profileCourseInput: profile.course,
      profileYearInput: profile.year,
      profileBioInput: profile.bio,
      profileGithubInput: profile.github,
      profileLinkedinInput: profile.linkedin,
      profileAvatarInput: profile.avatarUrl
    };

    for (const [id, val] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    }

    const avatarPreview = document.getElementById('profileAvatarPreview');
    if (avatarPreview) {
      avatarPreview.src = profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    }
  },

  handleProfileSubmit() {
    const form = document.getElementById('profileForm');
    const nameEl = document.getElementById('profileNameInput');
    const headlineEl = document.getElementById('profileHeadlineInput');
    const emailEl = document.getElementById('profileEmailInput');
    const collegeEl = document.getElementById('profileCollegeInput');
    const courseEl = document.getElementById('profileCourseInput');
    const yearEl = document.getElementById('profileYearInput');
    const bioEl = document.getElementById('profileBioInput');
    const githubEl = document.getElementById('profileGithubInput');
    const linkedinEl = document.getElementById('profileLinkedinInput');
    const avatarEl = document.getElementById('profileAvatarInput');

    ValidationService.clearValidation(form);
    let isValid = true;

    // Full Name: required min 2
    if (!ValidationService.isNotEmpty(nameEl.value, 2)) {
      ValidationService.setInvalid(nameEl, 'Please enter your full name (at least 2 characters).');
      isValid = false;
    }

    // Headline: required min 3
    if (!ValidationService.isNotEmpty(headlineEl.value, 3)) {
      ValidationService.setInvalid(headlineEl, 'Please enter a professional headline.');
      isValid = false;
    }

    // Email: required valid format
    if (!ValidationService.isValidEmail(emailEl.value)) {
      ValidationService.setInvalid(emailEl, 'Please enter a valid email address.');
      isValid = false;
    }

    // College & Course
    if (!ValidationService.isNotEmpty(collegeEl.value, 2)) {
      ValidationService.setInvalid(collegeEl, 'Please enter your college/university name.');
      isValid = false;
    }

    // URLs validation
    if (githubEl.value && !ValidationService.isValidUrl(githubEl.value)) {
      ValidationService.setInvalid(githubEl, 'Please enter a valid URL starting with http:// or https://');
      isValid = false;
    }

    if (linkedinEl.value && !ValidationService.isValidUrl(linkedinEl.value)) {
      ValidationService.setInvalid(linkedinEl, 'Please enter a valid URL starting with http:// or https://');
      isValid = false;
    }

    if (avatarEl.value && !ValidationService.isValidUrl(avatarEl.value)) {
      ValidationService.setInvalid(avatarEl, 'Please enter a valid image URL starting with http:// or https://');
      isValid = false;
    }

    if (!isValid) return;

    const updatedProfile = {
      fullName: nameEl.value.trim(),
      headline: headlineEl.value.trim(),
      email: emailEl.value.trim(),
      college: collegeEl.value.trim(),
      course: courseEl.value.trim(),
      year: yearEl.value.trim(),
      bio: bioEl.value.trim(),
      github: githubEl.value.trim(),
      linkedin: linkedinEl.value.trim(),
      avatarUrl: avatarEl.value.trim()
    };

    StorageService.saveProfile(updatedProfile);
    ValidationService.showToast('Profile updated successfully!', 'success');
    this.updateDashboard();
    PortfolioModule.render();
  },

  // --- Certifications Management ---
  setupCertifications() {
    this.renderCertifications();

    const form = document.getElementById('certForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCertSubmit();
      });
    }

    const modalEl = document.getElementById('certModal');
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.resetCertForm();
      });
    }
  },

  renderCertifications() {
    const container = document.getElementById('certsListContainer');
    const emptyState = document.getElementById('certsEmptyState');
    if (!container) return;

    const certs = StorageService.getCertifications();
    if (!certs.length) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    let html = '';
    certs.forEach(c => {
      let urlButton = '';
      if (c.credentialUrl) {
        urlButton = `
          <a href="${ValidationService.escapeHtml(c.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-glass mt-2">
            <i class="bi bi-box-arrow-up-right me-1"></i> Verify Credential
          </a>
        `;
      }

      html += `
        <div class="col-md-6 mb-3">
          <div class="glass-card timeline-card h-100">
            <div class="timeline-icon stat-icon-purple">
              <i class="bi bi-award-fill"></i>
            </div>
            <div class="timeline-body">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="timeline-title">${ValidationService.escapeHtml(c.name)}</h5>
                <div class="d-flex gap-1">
                  <button type="button" class="btn btn-sm btn-icon-square text-muted" title="Edit" onclick="App.editCert('${c.id}')">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-icon-square text-danger" title="Delete" onclick="App.deleteCert('${c.id}')">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
              <div class="timeline-sub">${ValidationService.escapeHtml(c.organization)}</div>
              <div class="timeline-date"><i class="bi bi-calendar3"></i> ${ValidationService.escapeHtml(c.issueDate || 'N/A')}</div>
              ${urlButton}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  editCert(id) {
    const cert = StorageService.getCertifications().find(c => c.id === id);
    if (!cert) return;

    this.editingCertId = id;
    document.getElementById('certModalTitle').textContent = 'Edit Certification';
    document.getElementById('certNameInput').value = cert.name;
    document.getElementById('certOrgInput').value = cert.organization;
    document.getElementById('certDateInput').value = cert.issueDate || '';
    document.getElementById('certUrlInput').value = cert.credentialUrl || '';

    const modalEl = document.getElementById('certModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  },

  handleCertSubmit() {
    const nameEl = document.getElementById('certNameInput');
    const orgEl = document.getElementById('certOrgInput');
    const dateEl = document.getElementById('certDateInput');
    const urlEl = document.getElementById('certUrlInput');

    ValidationService.clearValidation(document.getElementById('certForm'));
    let isValid = true;

    if (!ValidationService.isNotEmpty(nameEl.value, 2)) {
      ValidationService.setInvalid(nameEl, 'Certification name must be at least 2 characters.');
      isValid = false;
    }

    if (!ValidationService.isNotEmpty(orgEl.value, 2)) {
      ValidationService.setInvalid(orgEl, 'Issuing organization is required.');
      isValid = false;
    }

    if (urlEl.value && !ValidationService.isValidUrl(urlEl.value)) {
      ValidationService.setInvalid(urlEl, 'Enter a valid URL starting with http:// or https://');
      isValid = false;
    }

    if (!isValid) return;

    if (this.editingCertId) {
      StorageService.updateCertification({
        id: this.editingCertId,
        name: nameEl.value.trim(),
        organization: orgEl.value.trim(),
        issueDate: dateEl.value,
        credentialUrl: urlEl.value.trim()
      });
      ValidationService.showToast('Updated certification!', 'success');
    } else {
      StorageService.addCertification({
        id: 'cert-' + Date.now(),
        name: nameEl.value.trim(),
        organization: orgEl.value.trim(),
        issueDate: dateEl.value,
        credentialUrl: urlEl.value.trim()
      });
      ValidationService.showToast('Added certification!', 'success');
    }

    const modalEl = document.getElementById('certModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    this.resetCertForm();
    this.renderCertifications();
    this.updateDashboard();
    PortfolioModule.render();
  },

  deleteCert(id) {
    const cert = StorageService.getCertifications().find(c => c.id === id);
    const name = cert ? cert.name : 'this certification';
    if (confirm(`Remove certification "${name}"?`)) {
      StorageService.deleteCertification(id);
      ValidationService.showToast(`Removed "${name}".`, 'info');
      this.renderCertifications();
      this.updateDashboard();
      PortfolioModule.render();
    }
  },

  resetCertForm() {
    this.editingCertId = null;
    const form = document.getElementById('certForm');
    if (form) form.reset();
    document.getElementById('certModalTitle').textContent = 'Add Certification';
    ValidationService.clearValidation(form);
  },

  // --- Achievements Management ---
  setupAchievements() {
    this.renderAchievements();

    const form = document.getElementById('achievementForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAchievementSubmit();
      });
    }

    const modalEl = document.getElementById('achievementModal');
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.resetAchievementForm();
      });
    }
  },

  renderAchievements() {
    const container = document.getElementById('achievementsListContainer');
    const emptyState = document.getElementById('achievementsEmptyState');
    if (!container) return;

    const achs = StorageService.getAchievements();
    if (!achs.length) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    let html = '';
    achs.forEach(a => {
      html += `
        <div class="col-md-6 mb-3">
          <div class="glass-card timeline-card h-100">
            <div class="timeline-icon stat-icon-amber">
              <i class="bi bi-trophy-fill"></i>
            </div>
            <div class="timeline-body">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="timeline-title">${ValidationService.escapeHtml(a.title)}</h5>
                <div class="d-flex gap-1">
                  <button type="button" class="btn btn-sm btn-icon-square text-muted" title="Edit" onclick="App.editAchievement('${a.id}')">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-icon-square text-danger" title="Delete" onclick="App.deleteAchievement('${a.id}')">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
              <div class="timeline-sub text-warning">${ValidationService.escapeHtml(a.organization || 'Organization')}</div>
              <div class="timeline-date"><i class="bi bi-calendar-event"></i> ${ValidationService.escapeHtml(a.date || 'N/A')}</div>
              <p class="text-secondary small mt-2 mb-0">${ValidationService.escapeHtml(a.description || '')}</p>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  editAchievement(id) {
    const ach = StorageService.getAchievements().find(a => a.id === id);
    if (!ach) return;

    this.editingAchId = id;
    document.getElementById('achievementModalTitle').textContent = 'Edit Achievement';
    document.getElementById('achievementTitleInput').value = ach.title;
    document.getElementById('achievementOrgInput').value = ach.organization;
    document.getElementById('achievementDateInput').value = ach.date || '';
    document.getElementById('achievementDescInput').value = ach.description || '';

    const modalEl = document.getElementById('achievementModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  },

  handleAchievementSubmit() {
    const titleEl = document.getElementById('achievementTitleInput');
    const orgEl = document.getElementById('achievementOrgInput');
    const dateEl = document.getElementById('achievementDateInput');
    const descEl = document.getElementById('achievementDescInput');

    ValidationService.clearValidation(document.getElementById('achievementForm'));
    let isValid = true;

    if (!ValidationService.isNotEmpty(titleEl.value, 3)) {
      ValidationService.setInvalid(titleEl, 'Achievement title must be at least 3 characters.');
      isValid = false;
    }

    if (!ValidationService.isNotEmpty(orgEl.value, 2)) {
      ValidationService.setInvalid(orgEl, 'Issuing organization or event is required.');
      isValid = false;
    }

    if (!isValid) return;

    if (this.editingAchId) {
      StorageService.updateAchievement({
        id: this.editingAchId,
        title: titleEl.value.trim(),
        organization: orgEl.value.trim(),
        date: dateEl.value,
        description: descEl.value.trim()
      });
      ValidationService.showToast('Updated achievement!', 'success');
    } else {
      StorageService.addAchievement({
        id: 'ach-' + Date.now(),
        title: titleEl.value.trim(),
        organization: orgEl.value.trim(),
        date: dateEl.value,
        description: descEl.value.trim()
      });
      ValidationService.showToast('Added achievement!', 'success');
    }

    const modalEl = document.getElementById('achievementModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    this.resetAchievementForm();
    this.renderAchievements();
    this.updateDashboard();
    PortfolioModule.render();
  },

  deleteAchievement(id) {
    const ach = StorageService.getAchievements().find(a => a.id === id);
    const title = ach ? ach.title : 'this achievement';
    if (confirm(`Remove achievement "${title}"?`)) {
      StorageService.deleteAchievement(id);
      ValidationService.showToast(`Removed "${title}".`, 'info');
      this.renderAchievements();
      this.updateDashboard();
      PortfolioModule.render();
    }
  },

  resetAchievementForm() {
    this.editingAchId = null;
    const form = document.getElementById('achievementForm');
    if (form) form.reset();
    document.getElementById('achievementModalTitle').textContent = 'Add Achievement';
    ValidationService.clearValidation(form);
  },

  // --- Global Demo & Reset Handlers ---
  setupGlobalActions() {
    // Load Demo Data button
    const loadDemoBtn = document.getElementById('loadDemoDataBtn');
    if (loadDemoBtn) {
      loadDemoBtn.addEventListener('click', () => {
        if (confirm('Load demo portfolio? This will populate skills, projects, certifications, and achievements with sample data.')) {
          StorageService.loadDemoData();
          this.loadProfileIntoForm();
          SkillsModule.renderSkills();
          SkillsModule.renderSuggestions();
          ProjectsModule.renderProjects();
          this.renderCertifications();
          this.renderAchievements();
          this.updateDashboard();
          PortfolioModule.render();
          AnalyticsModule.updateCharts();
        }
      });
    }

    // Reset Data button
    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all portfolio data? This action cannot be undone.')) {
          StorageService.resetAllData();
          this.loadProfileIntoForm();
          SkillsModule.renderSkills();
          SkillsModule.renderSuggestions();
          ProjectsModule.renderProjects();
          this.renderCertifications();
          this.renderAchievements();
          this.updateDashboard();
          PortfolioModule.render();
          AnalyticsModule.updateCharts();
          ValidationService.showToast('All portfolio data has been reset.', 'info');
        }
      });
    }
  }
};

// Launch application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
