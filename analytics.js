/**
 * SkillForge - Analytics & Chart.js Visualization Module
 * Implements category doughnut, bar chart, proficiency distribution, and dynamic updates.
 */

const AnalyticsModule = {
  categoryDoughnutInstance: null,
  categoryBarInstance: null,
  proficiencyChartInstance: null,
  dashboardMiniDoughnutInstance: null,

  init() {
    this.updateCharts();
  },

  // Color palette for charts
  getColors() {
    const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
    return {
      textColor: isDark ? '#f8fafc' : '#0f172a',
      mutedColor: isDark ? '#94a3b8' : '#64748b',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      doughnutColors: [
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#3b82f6', // Blue
        '#06b6d4', // Cyan
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ec4899'  // Pink
      ],
      proficiencyColors: {
        Beginner: '#3b82f6',
        Intermediate: '#8b5cf6',
        Advanced: '#06b6d4',
        Expert: '#10b981'
      }
    };
  },

  // Process data from storage
  getAnalyticsData() {
    const skills = StorageService.getSkills();

    // Group by Category
    const categoryCounts = {};
    skills.forEach(s => {
      const cat = s.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Group by Proficiency
    const proficiencyCounts = {
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0,
      Expert: 0
    };
    skills.forEach(s => {
      const prof = s.proficiency || 'Intermediate';
      if (proficiencyCounts[prof] !== undefined) {
        proficiencyCounts[prof]++;
      } else {
        proficiencyCounts['Intermediate']++;
      }
    });

    return {
      total: skills.length,
      categoryLabels: Object.keys(categoryCounts),
      categoryValues: Object.values(categoryCounts),
      proficiencyLabels: Object.keys(proficiencyCounts),
      proficiencyValues: Object.values(proficiencyCounts)
    };
  },

  // Re-render all charts with current data
  updateCharts() {
    const data = this.getAnalyticsData();
    const colors = this.getColors();

    const emptyContainer = document.getElementById('analyticsEmptyState');
    const contentContainer = document.getElementById('analyticsContent');

    if (data.total === 0) {
      if (emptyContainer) emptyContainer.classList.remove('d-none');
      if (contentContainer) contentContainer.classList.add('d-none');
      this.destroyCharts();
      return;
    }

    if (emptyContainer) emptyContainer.classList.add('d-none');
    if (contentContainer) contentContainer.classList.remove('d-none');

    this.renderCategoryDoughnut(data, colors);
    this.renderCategoryBar(data, colors);
    this.renderProficiencyChart(data, colors);
    this.renderDashboardMiniChart(data, colors);
    this.renderSkillMatrixTable(data);
  },

  // 1. Category Distribution Doughnut Chart
  renderCategoryDoughnut(data, colors) {
    const canvas = document.getElementById('categoryDoughnutChart');
    if (!canvas) return;

    if (this.categoryDoughnutInstance) {
      this.categoryDoughnutInstance.destroy();
    }

    this.categoryDoughnutInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.categoryLabels,
        datasets: [{
          data: data.categoryValues,
          backgroundColor: colors.doughnutColors.slice(0, data.categoryLabels.length),
          borderWidth: 2,
          borderColor: (document.documentElement.getAttribute('data-theme') === 'light') ? '#ffffff' : '#111827'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colors.textColor,
              font: { family: 'Plus Jakarta Sans', size: 12, weight: 500 },
              padding: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const val = ctx.parsed;
                const pct = Math.round((val / total) * 100);
                return ` ${ctx.label}: ${val} skills (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  },

  // 2. Category Bar Chart
  renderCategoryBar(data, colors) {
    const canvas = document.getElementById('categoryBarChart');
    if (!canvas) return;

    if (this.categoryBarInstance) {
      this.categoryBarInstance.destroy();
    }

    this.categoryBarInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.categoryLabels,
        datasets: [{
          label: 'Number of Skills',
          data: data.categoryValues,
          backgroundColor: '#8b5cf6',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.mutedColor,
              font: { family: 'Plus Jakarta Sans', size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: colors.mutedColor,
              font: { family: 'Plus Jakarta Sans', size: 11 }
            },
            grid: { color: colors.gridColor }
          }
        }
      }
    });
  },

  // 3. Proficiency Distribution Chart (Horizontal Bar)
  renderProficiencyChart(data, colors) {
    const canvas = document.getElementById('proficiencyBarChart');
    if (!canvas) return;

    if (this.proficiencyChartInstance) {
      this.proficiencyChartInstance.destroy();
    }

    const profColors = data.proficiencyLabels.map(label => colors.proficiencyColors[label] || '#8b5cf6');

    this.proficiencyChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.proficiencyLabels,
        datasets: [{
          label: 'Skills',
          data: data.proficiencyValues,
          backgroundColor: profColors,
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: colors.mutedColor,
              font: { family: 'Plus Jakarta Sans', size: 11 }
            },
            grid: { color: colors.gridColor }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 }
            }
          }
        }
      }
    });
  },

  // 4. Mini chart for the overview dashboard
  renderDashboardMiniChart(data, colors) {
    const canvas = document.getElementById('dashboardCategoryMiniChart');
    if (!canvas) return;

    if (this.dashboardMiniDoughnutInstance) {
      this.dashboardMiniDoughnutInstance.destroy();
    }

    if (data.total === 0) return;

    this.dashboardMiniDoughnutInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.categoryLabels,
        datasets: [{
          data: data.categoryValues,
          backgroundColor: colors.doughnutColors.slice(0, data.categoryLabels.length),
          borderWidth: 2,
          borderColor: (document.documentElement.getAttribute('data-theme') === 'light') ? '#ffffff' : '#111827'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: colors.textColor,
              font: { family: 'Plus Jakarta Sans', size: 11 },
              boxWidth: 12,
              padding: 10
            }
          }
        },
        cutout: '65%'
      }
    });
  },

  // Render Skill Matrix Breakdown Table in analytics
  renderSkillMatrixTable(data) {
    const tbody = document.getElementById('skillMatrixTableBody');
    if (!tbody) return;

    const skills = StorageService.getSkills();
    let rows = '';

    skills.forEach(s => {
      let badge = 'badge-soft-purple';
      if (s.proficiency === 'Beginner') badge = 'badge-soft-blue';
      if (s.proficiency === 'Advanced') badge = 'badge-soft-emerald';
      if (s.proficiency === 'Expert') badge = 'badge-soft-amber';

      rows += `
        <tr>
          <td class="fw-semibold text-white">${ValidationService.escapeHtml(s.name)}</td>
          <td><span class="badge badge-soft-blue">${ValidationService.escapeHtml(s.category)}</span></td>
          <td><span class="badge ${badge}">${ValidationService.escapeHtml(s.proficiency)}</span></td>
        </tr>
      `;
    });

    tbody.innerHTML = rows;
  },

  // Clean up all charts
  destroyCharts() {
    if (this.categoryDoughnutInstance) {
      this.categoryDoughnutInstance.destroy();
      this.categoryDoughnutInstance = null;
    }
    if (this.categoryBarInstance) {
      this.categoryBarInstance.destroy();
      this.categoryBarInstance = null;
    }
    if (this.proficiencyChartInstance) {
      this.proficiencyChartInstance.destroy();
      this.proficiencyChartInstance = null;
    }
    if (this.dashboardMiniDoughnutInstance) {
      this.dashboardMiniDoughnutInstance.destroy();
      this.dashboardMiniDoughnutInstance = null;
    }
  }
};
