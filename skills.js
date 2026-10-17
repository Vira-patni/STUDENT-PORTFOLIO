/**
 * SkillForge - Skills Management Module
 * Handles loading skills from data/skills.json, CRUD operations, duplicate checks, and category filtering.
 */

const SkillsModule = {
  categoriesData: [],
  selectedFilter: 'all',
  editingSkillId: null,

  // Initialize skills module
  async init() {
    await this.fetchCategories();
    this.setupEventListeners();
    this.renderSkills();
    this.renderSuggestions();
  },

  // Fetch skill categories from data/skills.json via Fetch API (Objective 2)
  async fetchCategories() {
    const categorySelect = document.getElementById('skillCategoryInput');
    const categoryFilterContainer = document.getElementById('skillFilterPills');

    try {
      const response = await fetch('data/skills.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      this.categoriesData = data.categories || [];
      this.populateCategorySelect(categorySelect);
      this.populateFilterPills(categoryFilterContainer);
    } catch (error) {
      console.warn('Fetch note: Running without an HTTP server or network issue:', error);
      ValidationService.showToast('Using local category dataset. (Run via Live Server for external JSON fetch)', 'info');
      this.categoriesData = [
        { id: "languages", name: "Programming Languages", icon: "bi-code-slash", suggestedSkills: [{ name: "Python", defaultProficiency: "Advanced" }, { name: "JavaScript (ES6+)", defaultProficiency: "Expert" }, { name: "TypeScript", defaultProficiency: "Intermediate" }, { name: "Java", defaultProficiency: "Intermediate" }, { name: "C++", defaultProficiency: "Intermediate" }] },
        { id: "web-dev", name: "Web Development", icon: "bi-globe", suggestedSkills: [{ name: "React.js", defaultProficiency: "Advanced" }, { name: "Node.js & Express", defaultProficiency: "Intermediate" }, { name: "HTML5 & CSS3", defaultProficiency: "Expert" }, { name: "Bootstrap 5", defaultProficiency: "Expert" }] },
        { id: "database", name: "Database", icon: "bi-database", suggestedSkills: [{ name: "PostgreSQL", defaultProficiency: "Intermediate" }, { name: "MongoDB", defaultProficiency: "Advanced" }, { name: "MySQL", defaultProficiency: "Intermediate" }] },
        { id: "tools", name: "Tools", icon: "bi-tools", suggestedSkills: [{ name: "Git & GitHub", defaultProficiency: "Expert" }, { name: "Docker", defaultProficiency: "Intermediate" }, { name: "VS Code", defaultProficiency: "Expert" }] },
        { id: "other", name: "Other", icon: "bi-stars", suggestedSkills: [{ name: "Data Structures & Algorithms", defaultProficiency: "Advanced" }, { name: "Machine Learning", defaultProficiency: "Beginner" }] }
      ];
      this.populateCategorySelect(categorySelect);
      this.populateFilterPills(categoryFilterContainer);
    }
  },

  populateCategorySelect(categorySelect) {
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Select a Category</option>';
      this.categoriesData.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
    }
  },

  populateFilterPills(categoryFilterContainer) {
    if (categoryFilterContainer) {
      let filterHtml = `
        <button type="button" class="btn btn-sm ${this.selectedFilter === 'all' ? 'btn-gradient' : 'btn-glass'} filter-pill" data-category="all">
          All Skills
        </button>
      `;
      this.categoriesData.forEach(cat => {
        const isActive = this.selectedFilter === cat.name;
        filterHtml += `
          <button type="button" class="btn btn-sm ${isActive ? 'btn-gradient' : 'btn-glass'} filter-pill" data-category="${ValidationService.escapeHtml(cat.name)}">
            <i class="bi ${cat.icon || 'bi-tag'} me-1"></i>${ValidationService.escapeHtml(cat.name)}
          </button>
        `;
      });
      categoryFilterContainer.innerHTML = filterHtml;
    }
  },

  // Setup UI event listeners
  setupEventListeners() {
    // Category filter click delegation
    const filterContainer = document.getElementById('skillFilterPills');
    if (filterContainer) {
      filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-pill');
        if (!btn) return;
        this.selectedFilter = btn.dataset.category;

        // Update active class
        filterContainer.querySelectorAll('.filter-pill').forEach(b => {
          b.className = 'btn btn-sm btn-glass filter-pill';
        });
        btn.className = 'btn btn-sm btn-gradient filter-pill';

        this.renderSkills();
      });
    }

    // Skill Form submit
    const skillForm = document.getElementById('skillForm');
    if (skillForm) {
      skillForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // Modal reset when closed
    const skillModalEl = document.getElementById('skillModal');
    if (skillModalEl) {
      skillModalEl.addEventListener('hidden.bs.modal', () => {
        this.resetForm();
      });
    }
  },

  // Render suggested skills pill cloud
  renderSuggestions() {
    const container = document.getElementById('skillSuggestionsContainer');
    if (!container || !this.categoriesData.length) return;

    const currentSkills = StorageService.getSkills();
    const currentSkillNames = new Set(currentSkills.map(s => s.name.toLowerCase().trim()));

    let html = '';
    this.categoriesData.forEach(cat => {
      (cat.suggestedSkills || []).forEach(item => {
        if (!currentSkillNames.has(item.name.toLowerCase().trim())) {
          html += `
            <span class="suggestion-pill" data-name="${ValidationService.escapeHtml(item.name)}" data-category="${ValidationService.escapeHtml(cat.name)}" data-proficiency="${ValidationService.escapeHtml(item.defaultProficiency || 'Intermediate')}">
              <i class="bi bi-plus"></i> ${ValidationService.escapeHtml(item.name)}
            </span>
          `;
        }
      });
    });

    if (html.trim() === '') {
      container.innerHTML = '<span class="text-muted small">You have added all suggested skills! Great job!</span>';
    } else {
      container.innerHTML = html;
      container.querySelectorAll('.suggestion-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const name = pill.dataset.name;
          const category = pill.dataset.category;
          const proficiency = pill.dataset.proficiency;
          this.quickAddSkill(name, category, proficiency);
        });
      });
    }
  },

  // Quick 1-click add from suggestions
  quickAddSkill(name, category, proficiency) {
    const skills = StorageService.getSkills();
    const isDuplicate = skills.some(s => s.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (isDuplicate) {
      ValidationService.showToast(`"${name}" is already in your skills!`, 'warning');
      return;
    }

    const newSkill = {
      id: 'sk-' + Date.now(),
      name,
      category,
      proficiency
    };

    StorageService.addSkill(newSkill);
    ValidationService.showToast(`Added "${name}" to ${category}!`, 'success');
    this.renderSkills();
    this.renderSuggestions();
    App.updateDashboard();
    if (typeof AnalyticsModule !== 'undefined') AnalyticsModule.updateCharts();
    if (typeof PortfolioModule !== 'undefined') PortfolioModule.render();
  },

  // Render skills grid
  renderSkills() {
    const container = document.getElementById('skillsListContainer');
    const emptyState = document.getElementById('skillsEmptyState');
    if (!container) return;

    let skills = StorageService.getSkills();

    // Apply category filter
    if (this.selectedFilter !== 'all') {
      skills = skills.filter(s => s.category === this.selectedFilter);
    }

    if (skills.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    let html = '';
    skills.forEach(skill => {
      const profLower = (skill.proficiency || 'intermediate').toLowerCase();
      let badgeClass = 'badge-soft-purple';
      let fillWidth = '50%';

      if (profLower === 'beginner') {
        badgeClass = 'badge-soft-blue';
        fillWidth = '25%';
      } else if (profLower === 'intermediate') {
        badgeClass = 'badge-soft-purple';
        fillWidth = '50%';
      } else if (profLower === 'advanced') {
        badgeClass = 'badge-soft-emerald';
        fillWidth = '75%';
      } else if (profLower === 'expert') {
        badgeClass = 'badge-soft-amber';
        fillWidth = '100%';
      }

      html += `
        <div class="col-md-6 col-lg-4">
          <div class="glass-card skill-card h-100">
            <div class="skill-header">
              <div>
                <span class="badge ${badgeClass} skill-category-badge mb-1">${ValidationService.escapeHtml(skill.category)}</span>
                <h5 class="skill-name mb-0">${ValidationService.escapeHtml(skill.name)}</h5>
              </div>
              <div class="skill-actions">
                <button type="button" class="btn btn-sm btn-icon-square text-muted" title="Edit Skill" onclick="SkillsModule.editSkill('${skill.id}')">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button type="button" class="btn btn-sm btn-icon-square text-danger" title="Delete Skill" onclick="SkillsModule.deleteSkill('${skill.id}')">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </div>

            <div class="proficiency-meter">
              <div class="proficiency-bar">
                <div class="proficiency-fill ${profLower}" style="width: ${fillWidth};"></div>
              </div>
              <span class="proficiency-text">${ValidationService.escapeHtml(skill.proficiency)}</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // Open modal for editing
  editSkill(id) {
    const skill = StorageService.getSkills().find(s => s.id === id);
    if (!skill) return;

    this.editingSkillId = id;
    document.getElementById('skillModalTitle').textContent = 'Edit Technical Skill';
    document.getElementById('skillNameInput').value = skill.name;
    document.getElementById('skillCategoryInput').value = skill.category;
    document.getElementById('skillProficiencyInput').value = skill.proficiency;

    const modalEl = document.getElementById('skillModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  },

  // Handle form submission (Add or Edit)
  handleFormSubmit() {
    const nameInput = document.getElementById('skillNameInput');
    const categoryInput = document.getElementById('skillCategoryInput');
    const proficiencyInput = document.getElementById('skillProficiencyInput');

    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const proficiency = proficiencyInput.value;

    let isValid = true;
    ValidationService.clearValidation(document.getElementById('skillForm'));

    // Validate Name
    if (!ValidationService.isNotEmpty(name, 2)) {
      ValidationService.setInvalid(nameInput, 'Skill name must be at least 2 characters.');
      isValid = false;
    }

    // Validate Category
    if (!category) {
      ValidationService.setInvalid(categoryInput, 'Please select a skill category.');
      isValid = false;
    }

    // Validate Proficiency
    if (!proficiency) {
      ValidationService.setInvalid(proficiencyInput, 'Please choose a proficiency level.');
      isValid = false;
    }

    if (!isValid) return;

    // Check duplicate name (case-insensitive)
    const skills = StorageService.getSkills();
    const isDuplicate = skills.some(s =>
      s.name.toLowerCase().trim() === name.toLowerCase() &&
      s.id !== this.editingSkillId
    );

    if (isDuplicate) {
      ValidationService.setInvalid(nameInput, 'This skill already exists in your portfolio.');
      ValidationService.showToast(`Skill "${name}" already exists!`, 'warning');
      return;
    }

    if (this.editingSkillId) {
      // Update existing
      const updated = {
        id: this.editingSkillId,
        name,
        category,
        proficiency
      };
      StorageService.updateSkill(updated);
      ValidationService.showToast(`Updated "${name}" successfully!`, 'success');
    } else {
      // Add new
      const newSkill = {
        id: 'sk-' + Date.now(),
        name,
        category,
        proficiency
      };
      StorageService.addSkill(newSkill);
      ValidationService.showToast(`Added "${name}" to skills!`, 'success');
    }

    // Close modal
    const modalEl = document.getElementById('skillModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    this.resetForm();
    this.renderSkills();
    this.renderSuggestions();
    App.updateDashboard();
    if (typeof AnalyticsModule !== 'undefined') AnalyticsModule.updateCharts();
    if (typeof PortfolioModule !== 'undefined') PortfolioModule.render();
  },

  // Delete skill
  deleteSkill(id) {
    const skill = StorageService.getSkills().find(s => s.id === id);
    const skillName = skill ? skill.name : 'this skill';
    if (confirm(`Are you sure you want to remove "${skillName}" from your skills?`)) {
      StorageService.deleteSkill(id);
      ValidationService.showToast(`Removed "${skillName}" from skills.`, 'info');
      this.renderSkills();
      this.renderSuggestions();
      App.updateDashboard();
      if (typeof AnalyticsModule !== 'undefined') AnalyticsModule.updateCharts();
      if (typeof PortfolioModule !== 'undefined') PortfolioModule.render();
    }
  },

  // Reset form
  resetForm() {
    this.editingSkillId = null;
    const form = document.getElementById('skillForm');
    if (form) form.reset();
    document.getElementById('skillModalTitle').textContent = 'Add Technical Skill';
    ValidationService.clearValidation(form);
  }
};
