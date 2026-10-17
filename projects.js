/**
 * SkillForge - Projects Management Module
 * Handles loading project templates from data/projects.json, CRUD, search, and category/status filtering.
 */

const ProjectsModule = {
  templatesData: [],
  searchQuery: '',
  selectedCategory: 'all',
  selectedStatus: 'all',
  editingProjectId: null,

  async init() {
    await this.fetchTemplates();
    this.setupEventListeners();
    this.renderProjects();
  },

  // Fetch project templates from data/projects.json via Fetch API (Objective 2)
  async fetchTemplates() {
    try {
      const response = await fetch('data/projects.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      this.templatesData = data.templates || [];
      this.renderTemplatesModal();
    } catch (error) {
      console.warn('Fetch note: Running without an HTTP server or network issue:', error);
      ValidationService.showToast('Using local project templates. (Run via Live Server for external JSON fetch)', 'info');
      this.templatesData = [
        {
          id: "tpl-1",
          title: "AI Resume & Portfolio Analyzer",
          category: "Web Development",
          description: "An intelligent web app that parses PDF resumes, scores ATS readability, and generates recommendations.",
          techStack: ["Python", "Flask", "JavaScript", "Bootstrap 5", "Chart.js"],
          githubUrl: "https://github.com/example/ai-resume-analyzer",
          liveUrl: "https://ai-resume-analyzer.demo.app",
          status: "Completed",
          difficulty: "Intermediate"
        },
        {
          id: "tpl-2",
          title: "SkillForge - Student Skill Portfolio Builder",
          category: "Web Development",
          description: "Full-stack client-side SaaS dashboard for university students to track competencies, curate projects, and export CVs.",
          techStack: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "Chart.js", "LocalStorage"],
          githubUrl: "https://github.com/example/skillforge-portfolio",
          liveUrl: "https://skillforge-showcase.vercel.app",
          status: "Completed",
          difficulty: "Intermediate"
        },
        {
          id: "tpl-3",
          title: "CampusMart - Student Peer Marketplace",
          category: "Web Development",
          description: "Hyper-local peer-to-peer campus marketplace allowing verified college students to buy, sell, or trade textbooks.",
          techStack: ["Node.js", "Express", "MongoDB", "Tailwind CSS"],
          githubUrl: "https://github.com/example/campusmart-peer-market",
          liveUrl: "https://campusmart.demo.site",
          status: "In Progress",
          difficulty: "Advanced"
        }
      ];
      this.renderTemplatesModal();
    }
  },

  // Setup event listeners for filtering, searching, and submitting
  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('projectSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderProjects();
      });
    }

    // Category filter select
    const categoryFilter = document.getElementById('projectCategoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.renderProjects();
      });
    }

    // Status filter select
    const statusFilter = document.getElementById('projectStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.selectedStatus = e.target.value;
        this.renderProjects();
      });
    }

    // Project form submit
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
      projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // Modal reset on close
    const modalEl = document.getElementById('projectModal');
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.resetForm();
      });
    }
  },

  // Render project templates inside the Templates modal
  renderTemplatesModal() {
    const container = document.getElementById('templatesListContainer');
    if (!container) return;

    if (!this.templatesData.length) {
      container.innerHTML = '<div class="text-center py-4 text-muted">No templates available.</div>';
      return;
    }

    let html = '';
    this.templatesData.forEach(tpl => {
      const techTags = (tpl.techStack || []).map(t => `<span class="tech-tag">${ValidationService.escapeHtml(t)}</span>`).join('');

      html += `
        <div class="col-md-6 mb-3">
          <div class="glass-card p-3 h-100 d-flex flex-direction-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge badge-soft-purple">${ValidationService.escapeHtml(tpl.category)}</span>
                <span class="badge badge-soft-blue">${ValidationService.escapeHtml(tpl.difficulty || 'Intermediate')}</span>
              </div>
              <h6 class="fw-bold mb-1 text-white">${ValidationService.escapeHtml(tpl.title)}</h6>
              <p class="text-secondary small mb-2">${ValidationService.escapeHtml(tpl.description)}</p>
              <div class="tech-tags-wrapper mb-3">
                ${techTags}
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-gradient w-100 mt-2" onclick="ProjectsModule.useTemplate('${tpl.id}')">
              <i class="bi bi-box-arrow-in-down-right me-1"></i> Use This Template
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // Apply a template to the add project modal
  useTemplate(templateId) {
    const tpl = this.templatesData.find(t => t.id === templateId);
    if (!tpl) return;

    // Close templates modal
    const tplModalEl = document.getElementById('projectTemplatesModal');
    const tplModal = bootstrap.Modal.getInstance(tplModalEl);
    if (tplModal) tplModal.hide();

    // Prefill project form
    this.resetForm();
    document.getElementById('projectModalTitle').textContent = 'Add Project from Template';
    document.getElementById('projectTitleInput').value = tpl.title;
    document.getElementById('projectCategoryInput').value = tpl.category || 'Web Development';
    document.getElementById('projectStatusInput').value = tpl.status || 'Completed';
    document.getElementById('projectTechInput').value = (tpl.techStack || []).join(', ');
    document.getElementById('projectGithubInput').value = tpl.githubUrl || '';
    document.getElementById('projectLiveInput').value = tpl.liveUrl || '';
    document.getElementById('projectDescInput').value = tpl.description;

    // Open project form modal
    const prjModalEl = document.getElementById('projectModal');
    const prjModal = bootstrap.Modal.getOrCreateInstance(prjModalEl);
    prjModal.show();
  },

  // Render projects grid
  renderProjects() {
    const container = document.getElementById('projectsListContainer');
    const emptyState = document.getElementById('projectsEmptyState');
    if (!container) return;

    let projects = StorageService.getProjects();

    // Search filter
    if (this.searchQuery) {
      projects = projects.filter(p => {
        const titleMatch = p.title.toLowerCase().includes(this.searchQuery);
        const descMatch = p.description.toLowerCase().includes(this.searchQuery);
        const techMatch = (p.techStack || []).some(t => t.toLowerCase().includes(this.searchQuery));
        return titleMatch || descMatch || techMatch;
      });
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      projects = projects.filter(p => p.category === this.selectedCategory);
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      projects = projects.filter(p => p.status === this.selectedStatus);
    }

    if (projects.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    let html = '';
    projects.forEach(project => {
      // Status badge styling
      let statusBadge = 'badge-soft-emerald';
      if (project.status === 'In Progress') statusBadge = 'badge-soft-amber';
      if (project.status === 'Planned') statusBadge = 'badge-soft-blue';

      const techBadges = (project.techStack || []).map(t => `<span class="tech-tag">${ValidationService.escapeHtml(t)}</span>`).join('');

      let linksHtml = '';
      if (project.githubUrl) {
        linksHtml += `
          <a href="${ValidationService.escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-link-btn" title="View Source Code">
            <i class="bi bi-github"></i> GitHub
          </a>
        `;
      }
      if (project.liveUrl) {
        linksHtml += `
          <a href="${ValidationService.escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-link-btn" title="View Live Demo">
            <i class="bi bi-box-arrow-up-right"></i> Demo
          </a>
        `;
      }

      html += `
        <div class="col-md-6 col-xl-4 mb-4">
          <div class="glass-card project-card">
            <div class="project-card-header">
              <div>
                <span class="badge ${statusBadge} mb-1">${ValidationService.escapeHtml(project.status || 'Completed')}</span>
                <span class="badge badge-soft-purple mb-1 ms-1">${ValidationService.escapeHtml(project.category || 'Web')}</span>
                <h4 class="project-title mt-1">${ValidationService.escapeHtml(project.title)}</h4>
              </div>
              <div class="d-flex gap-1">
                <button type="button" class="btn btn-sm btn-icon-square text-muted" title="Edit Project" onclick="ProjectsModule.editProject('${project.id}')">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button type="button" class="btn btn-sm btn-icon-square text-danger" title="Delete Project" onclick="ProjectsModule.deleteProject('${project.id}')">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </div>

            <p class="project-desc">${ValidationService.escapeHtml(project.description)}</p>

            <div class="tech-tags-wrapper">
              ${techBadges}
            </div>

            <div class="project-card-footer">
              <div class="project-links">
                ${linksHtml || '<span class="text-muted small">No links attached</span>'}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // Edit existing project
  editProject(id) {
    const project = StorageService.getProjects().find(p => p.id === id);
    if (!project) return;

    this.editingProjectId = id;
    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    document.getElementById('projectTitleInput').value = project.title;
    document.getElementById('projectCategoryInput').value = project.category || 'Web Development';
    document.getElementById('projectStatusInput').value = project.status || 'Completed';
    document.getElementById('projectTechInput').value = (project.techStack || []).join(', ');
    document.getElementById('projectGithubInput').value = project.githubUrl || '';
    document.getElementById('projectLiveInput').value = project.liveUrl || '';
    document.getElementById('projectDescInput').value = project.description;

    const modalEl = document.getElementById('projectModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  },

  // Handle Form Submit
  handleFormSubmit() {
    const titleInput = document.getElementById('projectTitleInput');
    const categoryInput = document.getElementById('projectCategoryInput');
    const statusInput = document.getElementById('projectStatusInput');
    const techInput = document.getElementById('projectTechInput');
    const githubInput = document.getElementById('projectGithubInput');
    const liveInput = document.getElementById('projectLiveInput');
    const descInput = document.getElementById('projectDescInput');

    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const status = statusInput.value;
    const techRaw = techInput.value.trim();
    const githubUrl = githubInput.value.trim();
    const liveUrl = liveInput.value.trim();
    const description = descInput.value.trim();

    let isValid = true;
    ValidationService.clearValidation(document.getElementById('projectForm'));

    // Validate Title
    if (!ValidationService.isNotEmpty(title, 3)) {
      ValidationService.setInvalid(titleInput, 'Project title must be at least 3 characters.');
      isValid = false;
    }

    // Validate Category
    if (!category) {
      ValidationService.setInvalid(categoryInput, 'Please choose a category.');
      isValid = false;
    }

    // Validate Status
    if (!status) {
      ValidationService.setInvalid(statusInput, 'Please choose a status.');
      isValid = false;
    }

    // Validate Tech stack
    if (!ValidationService.isNotEmpty(techRaw, 2)) {
      ValidationService.setInvalid(techInput, 'Enter at least one technology (e.g. React, Node.js).');
      isValid = false;
    }

    // Validate Description
    if (!ValidationService.isNotEmpty(description, 10)) {
      ValidationService.setInvalid(descInput, 'Please provide a descriptive overview (at least 10 characters).');
      isValid = false;
    }

    // Validate URLs if provided
    if (githubUrl && !ValidationService.isValidUrl(githubUrl)) {
      ValidationService.setInvalid(githubInput, 'Please enter a valid URL starting with http:// or https://');
      isValid = false;
    }

    if (liveUrl && !ValidationService.isValidUrl(liveUrl)) {
      ValidationService.setInvalid(liveInput, 'Please enter a valid URL starting with http:// or https://');
      isValid = false;
    }

    if (!isValid) return;

    // Convert comma-separated string to clean array
    const techStack = techRaw.split(',').map(t => t.trim()).filter(t => t.length > 0);

    if (this.editingProjectId) {
      // Update
      const updated = {
        id: this.editingProjectId,
        title,
        category,
        status,
        techStack,
        githubUrl,
        liveUrl,
        description
      };
      StorageService.updateProject(updated);
      ValidationService.showToast(`Updated project "${title}"!`, 'success');
    } else {
      // Add
      const newProject = {
        id: 'prj-' + Date.now(),
        title,
        category,
        status,
        techStack,
        githubUrl,
        liveUrl,
        description
      };
      StorageService.addProject(newProject);
      ValidationService.showToast(`Added project "${title}"!`, 'success');
    }

    // Hide modal
    const modalEl = document.getElementById('projectModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    this.resetForm();
    this.renderProjects();
    App.updateDashboard();
    if (typeof PortfolioModule !== 'undefined') PortfolioModule.render();
  },

  // Delete project
  deleteProject(id) {
    const project = StorageService.getProjects().find(p => p.id === id);
    const title = project ? project.title : 'this project';
    if (confirm(`Are you sure you want to delete project "${title}"?`)) {
      StorageService.deleteProject(id);
      ValidationService.showToast(`Deleted project "${title}".`, 'info');
      this.renderProjects();
      App.updateDashboard();
      if (typeof PortfolioModule !== 'undefined') PortfolioModule.render();
    }
  },

  // Reset form
  resetForm() {
    this.editingProjectId = null;
    const form = document.getElementById('projectForm');
    if (form) form.reset();
    document.getElementById('projectModalTitle').textContent = 'Add New Project';
    ValidationService.clearValidation(form);
  }
};
