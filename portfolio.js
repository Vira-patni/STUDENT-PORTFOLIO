/**
 * SkillForge - Live Portfolio Preview Module
 * Dynamically aggregates profile, skills, projects, certifications, and achievements into a public portfolio preview.
 * Supports clean Print to PDF export.
 */

const PortfolioModule = {
  init() {
    this.setupEventListeners();
    this.render();
  },

  setupEventListeners() {
    // Print / PDF Export button
    const printBtn = document.getElementById('printPortfolioBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  },

  // Render complete portfolio
  render() {
    const profile = StorageService.getProfile();
    const skills = StorageService.getSkills();
    const projects = StorageService.getProjects();
    const certs = StorageService.getCertifications();
    const achievements = StorageService.getAchievements();

    this.renderHero(profile);
    this.renderSkillsSection(skills);
    this.renderProjectsSection(projects);
    this.renderCertificationsSection(certs);
    this.renderAchievementsSection(achievements);
  },

  // 1. Render Hero Banner
  renderHero(profile) {
    const avatarEl = document.getElementById('previewAvatar');
    const nameEl = document.getElementById('previewName');
    const headlineEl = document.getElementById('previewHeadline');
    const collegeEl = document.getElementById('previewCollege');
    const courseEl = document.getElementById('previewCourse');
    const bioEl = document.getElementById('previewBio');
    const emailEl = document.getElementById('previewEmail');
    const githubEl = document.getElementById('previewGithub');
    const linkedinEl = document.getElementById('previewLinkedin');

    if (avatarEl) {
      avatarEl.src = profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
      avatarEl.alt = profile.fullName || 'Student Avatar';
      avatarEl.onerror = function() {
        this.onerror = null;
        this.src = 'assets/images/avatar.svg';
      };
    }

    if (nameEl) nameEl.textContent = profile.fullName || 'Student Portfolio';
    if (headlineEl) headlineEl.textContent = profile.headline || 'Full-Stack Developer & Student';

    if (collegeEl) {
      collegeEl.innerHTML = profile.college ? `<i class="bi bi-mortarboard-fill me-1"></i> ${ValidationService.escapeHtml(profile.college)}` : '';
    }

    if (courseEl) {
      const yearText = profile.year ? ` • ${profile.year}` : '';
      courseEl.innerHTML = profile.course ? `<i class="bi bi-book-fill me-1"></i> ${ValidationService.escapeHtml(profile.course)}${ValidationService.escapeHtml(yearText)}` : '';
    }

    if (bioEl) {
      bioEl.textContent = profile.bio || 'Welcome to my technical portfolio showcasing projects, competencies, and engineering journey.';
    }

    if (emailEl) {
      if (profile.email) {
        emailEl.href = `mailto:${profile.email}`;
        emailEl.innerHTML = `<i class="bi bi-envelope-fill me-1"></i> ${ValidationService.escapeHtml(profile.email)}`;
        emailEl.classList.remove('d-none');
      } else {
        emailEl.classList.add('d-none');
      }
    }

    if (githubEl) {
      if (profile.github) {
        githubEl.href = profile.github;
        githubEl.classList.remove('d-none');
      } else {
        githubEl.classList.add('d-none');
      }
    }

    if (linkedinEl) {
      if (profile.linkedin) {
        linkedinEl.href = profile.linkedin;
        linkedinEl.classList.remove('d-none');
      } else {
        linkedinEl.classList.add('d-none');
      }
    }
  },

  // 2. Render Skills Section
  renderSkillsSection(skills) {
    const container = document.getElementById('previewSkillsContainer');
    if (!container) return;

    if (!skills.length) {
      container.innerHTML = '<div class="text-muted small py-2">No technical skills added yet.</div>';
      return;
    }

    // Group by category
    const grouped = {};
    skills.forEach(s => {
      const cat = s.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });

    let html = '';
    for (const [catName, catSkills] of Object.entries(grouped)) {
      html += `
        <div class="col-md-6 mb-3">
          <div class="glass-card p-3 h-100">
            <h6 class="fw-bold mb-3 text-gradient"><i class="bi bi-cpu me-1"></i> ${ValidationService.escapeHtml(catName)}</h6>
            <div class="d-flex flex-column gap-2">
      `;

      catSkills.forEach(s => {
        let width = '50%';
        const prof = (s.proficiency || 'Intermediate').toLowerCase();
        if (prof === 'beginner') width = '25%';
        if (prof === 'intermediate') width = '50%';
        if (prof === 'advanced') width = '75%';
        if (prof === 'expert') width = '100%';

        html += `
          <div>
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

      html += `
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  },

  // 3. Render Projects Section
  renderProjectsSection(projects) {
    const container = document.getElementById('previewProjectsContainer');
    if (!container) return;

    if (!projects.length) {
      container.innerHTML = '<div class="text-muted small py-2">No projects added yet.</div>';
      return;
    }

    let html = '';
    projects.forEach(p => {
      const techTags = (p.techStack || []).map(t => `<span class="tech-tag">${ValidationService.escapeHtml(t)}</span>`).join('');
      let links = '';
      if (p.githubUrl) {
        links += `<a href="${ValidationService.escapeHtml(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-link-btn me-2"><i class="bi bi-github"></i> Source</a>`;
      }
      if (p.liveUrl) {
        links += `<a href="${ValidationService.escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-link-btn"><i class="bi bi-box-arrow-up-right"></i> Live Demo</a>`;
      }

      html += `
        <div class="col-md-6 mb-3">
          <div class="glass-card p-3 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge badge-soft-purple">${ValidationService.escapeHtml(p.category || 'Project')}</span>
                <span class="badge badge-soft-emerald">${ValidationService.escapeHtml(p.status || 'Completed')}</span>
              </div>
              <h5 class="fw-bold mb-2 text-white">${ValidationService.escapeHtml(p.title)}</h5>
              <p class="text-secondary small mb-3">${ValidationService.escapeHtml(p.description)}</p>
              <div class="tech-tags-wrapper mb-3">
                ${techTags}
              </div>
            </div>
            <div class="border-top pt-2 mt-auto" style="border-color: var(--border-color) !important;">
              ${links || '<span class="text-muted small">No links available</span>'}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // 4. Render Certifications Section
  renderCertificationsSection(certs) {
    const container = document.getElementById('previewCertsContainer');
    if (!container) return;

    if (!certs.length) {
      container.innerHTML = '<div class="text-muted small py-2">No certifications added yet.</div>';
      return;
    }

    let html = '';
    certs.forEach(c => {
      let linkHtml = '';
      if (c.credentialUrl) {
        linkHtml = `
          <a href="${ValidationService.escapeHtml(c.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-glass mt-2">
            <i class="bi bi-patch-check-fill text-primary me-1"></i> Verify Credential
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
              <h6 class="timeline-title">${ValidationService.escapeHtml(c.name)}</h6>
              <div class="timeline-sub">${ValidationService.escapeHtml(c.organization)}</div>
              <div class="timeline-date"><i class="bi bi-calendar3"></i> Issued: ${ValidationService.escapeHtml(c.issueDate || 'N/A')}</div>
              ${linkHtml}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // 5. Render Achievements Section
  renderAchievementsSection(achievements) {
    const container = document.getElementById('previewAchievementsContainer');
    if (!container) return;

    if (!achievements.length) {
      container.innerHTML = '<div class="text-muted small py-2">No achievements added yet.</div>';
      return;
    }

    let html = '';
    achievements.forEach(a => {
      html += `
        <div class="col-md-6 mb-3">
          <div class="glass-card timeline-card h-100">
            <div class="timeline-icon stat-icon-amber">
              <i class="bi bi-trophy-fill"></i>
            </div>
            <div class="timeline-body">
              <h6 class="timeline-title">${ValidationService.escapeHtml(a.title)}</h6>
              <div class="timeline-sub text-warning">${ValidationService.escapeHtml(a.organization || 'Hackathon / Event')}</div>
              <div class="timeline-date"><i class="bi bi-calendar-event"></i> ${ValidationService.escapeHtml(a.date || 'N/A')}</div>
              <p class="text-secondary small mt-2 mb-0">${ValidationService.escapeHtml(a.description || '')}</p>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
};
