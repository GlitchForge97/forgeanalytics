// Configuration
const defaultConfig = {
  dashboard_title: "Forge Analytics",
  company_name: "Your Company",
  welcome_message: "Welcome to your advanced analytics workspace",
  tagline: "Data-driven insights for tomorrow"
};

let currentProjects = [];
let currentRecordCount = 0;
let activeCharts = {};

// Data handler for SDK
const dataHandler = {
  onDataChanged(data) {
    currentProjects = data;
    currentRecordCount = data.length;
    renderProjects(data);
  }
};

// Element SDK implementation
const element = {
  defaultConfig,
  render: async (config) => {
    const dashboardTitle = document.getElementById('dashboard-title');
    const companyName = document.getElementById('company-name');
    const welcomeMessage = document.getElementById('welcome-message');
    const tagline = document.getElementById('tagline');

    if (dashboardTitle) {
      dashboardTitle.textContent = config.dashboard_title || defaultConfig.dashboard_title;
    }
    if (companyName) {
      companyName.textContent = config.company_name || defaultConfig.company_name;
    }
    if (welcomeMessage) {
      welcomeMessage.textContent = config.welcome_message || defaultConfig.welcome_message;
    }
    if (tagline) {
      tagline.textContent = config.tagline || defaultConfig.tagline;
    }
  },
  mapToCapabilities: () => ({
    recolorables: [],
    borderables: [],
    fontEditable: undefined,
    fontSizeable: undefined
  }),
  mapToEditPanelValues: (config) => new Map([
    ["dashboard_title", config.dashboard_title || defaultConfig.dashboard_title],
    ["company_name", config.company_name || defaultConfig.company_name],
    ["welcome_message", config.welcome_message || defaultConfig.welcome_message],
    ["tagline", config.tagline || defaultConfig.tagline]
  ])
};

// Initialize SDKs
async function initializeApp() {
  try {
    if (window.elementSdk) {
      window.elementSdk.init(element);
    }

    if (window.dataSdk) {
      const result = await window.dataSdk.init(dataHandler);
      if (!result.isOk) {
        console.error("Failed to initialize data SDK");
      }
    }
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
}

// Theme toggle functionality
function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';

  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// Form submission
function initializeForm() {
  const form = document.getElementById('project-form');
  const createBtn = document.getElementById('create-btn');
  const btnText = document.getElementById('btn-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (currentRecordCount >= 999) {
      showMessage("Maximum limit of 999 projects reached. Please delete some projects first.", 'warning');
      return;
    }

    // Show loading state
    createBtn.disabled = true;
    btnText.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><span>Launching Project...</span></div>';

    const projectData = {
      id: generateId(),
      project_name: document.getElementById('project-name').value,
      analytics_type: document.getElementById('analytics-type').value,
      data_source: document.getElementById('data-source').value,
      time_range: document.getElementById('time-range').value,
      metrics: document.getElementById('metrics').value,
      target_revenue: parseFloat(document.getElementById('target-revenue').value) || 0,
      current_revenue: parseFloat(document.getElementById('current-revenue').value) || 0,
      target_users: parseInt(document.getElementById('target-users').value) || 0,
      current_users: parseInt(document.getElementById('current-users').value) || 0,
      target_conversion: parseFloat(document.getElementById('target-conversion').value) || 0,
      current_conversion: parseFloat(document.getElementById('current-conversion').value) || 0,
      budget: parseFloat(document.getElementById('budget').value) || 0,
      team_size: parseInt(document.getElementById('team-size').value) || 1,
      created_at: new Date().toISOString(),
      status: 'active'
    };

    try {
      if (window.dataSdk) {
        const result = await window.dataSdk.create(projectData);
        if (result.isOk) {
          showMessage("🚀 Analytics project launched successfully! Your data insights are now being processed.", 'success');
          form.reset();
        } else {
          showMessage("Failed to create project. Please try again.", 'error');
        }
      }
    } catch (error) {
      showMessage("An error occurred while creating the project.", 'error');
    } finally {
      // Reset button state
      createBtn.disabled = false;
      btnText.textContent = 'Launch Analytics Project';
    }
  });
}

// Render projects
function renderProjects(projects) {
  const projectsGrid = document.getElementById('projects-grid');
  const projectsContainer = document.getElementById('projects-container');

  if (projects.length === 0) {
    projectsContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🚀</div>
                        <h3 class="empty-title">No Analytics Projects Yet</h3>
                        <p class="empty-description">Create your first analytics project to start tracking comprehensive data insights and performance metrics.</p>
                    </div>
                `;
    return;
  }

  projectsGrid.innerHTML = projects.map(project => {
    const revenueProgress = project.target_revenue > 0 ? (project.current_revenue / project.target_revenue * 100).toFixed(1) : 0;
    const userProgress = project.target_users > 0 ? (project.current_users / project.target_users * 100).toFixed(1) : 0;

    return `
                    <div class="project-card" data-project-id="${project.__backendId}">
                        <div class="project-header">
                            <div>
                                <h3 class="project-name">${escapeHtml(project.project_name)}</h3>
                                <span class="project-type">${escapeHtml(project.analytics_type)}</span>
                            </div>
                        </div>

                        <div class="project-metrics">
                            <div class="metric-item">
                                <div class="metric-value">$${formatNumber(project.current_revenue)}</div>
                                <div class="metric-label">Revenue</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">${formatNumber(project.current_users)}</div>
                                <div class="metric-label">Users</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">${project.current_conversion}%</div>
                                <div class="metric-label">Conversion</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">$${formatNumber(project.budget)}</div>
                                <div class="metric-label">Budget</div>
                            </div>
                        </div>

                        <div class="project-actions">
                            <button class="action-btn btn-view" onclick="viewAnalytics('${project.__backendId}')">
                                View Analytics
                            </button>
                            <button class="action-btn btn-edit" onclick="editProject('${project.__backendId}')">
                                Edit
                            </button>
                            <button class="action-btn btn-delete" onclick="deleteProject('${project.__backendId}')">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
  }).join('');

  projectsContainer.innerHTML = `<div class="projects-grid">${projectsGrid.innerHTML}</div>`;
}

// Project actions
async function deleteProject(projectId) {
  const project = currentProjects.find(p => p.__backendId === projectId);
  if (!project) return;

  const card = document.querySelector(`[data-project-id="${projectId}"]`);
  if (card) {
    card.style.opacity = '0.5';
    card.style.pointerEvents = 'none';
  }

  try {
    if (window.dataSdk) {
      const result = await window.dataSdk.delete(project);
      if (result.isOk) {
        showMessage("Project deleted successfully!", 'success');
      } else {
        showMessage("Failed to delete project. Please try again.", 'error');
        if (card) {
          card.style.opacity = '1';
          card.style.pointerEvents = 'auto';
        }
      }
    }
  } catch (error) {
    showMessage("An error occurred while deleting the project.", 'error');
    if (card) {
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
    }
  }
}

function editProject(projectId) {
  const project = currentProjects.find(p => p.__backendId === projectId);
  if (!project) return;

  // Populate form with project data
  document.getElementById('project-name').value = project.project_name;
  document.getElementById('analytics-type').value = project.analytics_type;
  document.getElementById('data-source').value = project.data_source;
  document.getElementById('time-range').value = project.time_range;
  document.getElementById('metrics').value = project.metrics;
  document.getElementById('target-revenue').value = project.target_revenue || '';
  document.getElementById('current-revenue').value = project.current_revenue || '';
  document.getElementById('target-users').value = project.target_users || '';
  document.getElementById('current-users').value = project.current_users || '';
  document.getElementById('target-conversion').value = project.target_conversion || '';
  document.getElementById('current-conversion').value = project.current_conversion || '';
  document.getElementById('budget').value = project.budget || '';
  document.getElementById('team-size').value = project.team_size || '';

  // Scroll to form
  document.querySelector('.create-project-section').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });

  showMessage("📝 Project data loaded for editing. Modify the fields and launch a new version.", 'success');
}

function viewAnalytics(projectId) {
  const project = currentProjects.find(p => p.__backendId === projectId);
  if (!project) return;

  const overlay = document.getElementById('analytics-overlay');
  const projectName = document.getElementById('analytics-project-name');

  projectName.textContent = `${project.project_name} - Advanced Analytics`;
  overlay.classList.add('active');

  // Generate KPIs and charts after overlay is visible
  setTimeout(() => {
    generateKPIs(project);
    generateAdvancedCharts(project);
  }, 300);
}

// Analytics functionality
function initializeAnalytics() {
  const overlay = document.getElementById('analytics-overlay');
  const closeBtn = document.getElementById('close-analytics');

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    // Destroy existing charts
    Object.values(activeCharts).forEach(chart => {
      if (chart) chart.destroy();
    });
    activeCharts = {};
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      Object.values(activeCharts).forEach(chart => {
        if (chart) chart.destroy();
      });
      activeCharts = {};
    }
  });
}

// Generate KPI cards
function generateKPIs(project) {
  const kpiGrid = document.getElementById('kpi-grid');

  const revenueProgress = project.target_revenue > 0 ? (project.current_revenue / project.target_revenue * 100) : 0;
  const userProgress = project.target_users > 0 ? (project.current_users / project.target_users * 100) : 0;
  const conversionDiff = project.current_conversion - project.target_conversion;
  const budgetUsed = project.budget > 0 ? Math.random() * 70 + 20 : 0; // Simulated

  kpiGrid.innerHTML = `
                <div class="kpi-card">
                    <div class="kpi-value">$${formatNumber(project.current_revenue)}</div>
                    <div class="kpi-label">Current Revenue</div>
                    <div class="kpi-change ${revenueProgress >= 100 ? 'kpi-positive' : 'kpi-negative'}">
                        ${revenueProgress.toFixed(1)}% of target
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">${formatNumber(project.current_users)}</div>
                    <div class="kpi-label">Active Users</div>
                    <div class="kpi-change ${userProgress >= 100 ? 'kpi-positive' : 'kpi-negative'}">
                        ${userProgress.toFixed(1)}% of target
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">${project.current_conversion}%</div>
                    <div class="kpi-label">Conversion Rate</div>
                    <div class="kpi-change ${conversionDiff >= 0 ? 'kpi-positive' : 'kpi-negative'}">
                        ${conversionDiff >= 0 ? '+' : ''}${conversionDiff.toFixed(1)}% vs target
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">${budgetUsed.toFixed(1)}%</div>
                    <div class="kpi-label">Budget Used</div>
                    <div class="kpi-change ${budgetUsed < 80 ? 'kpi-positive' : 'kpi-negative'}">
                        $${formatNumber(project.budget * budgetUsed / 100)} spent
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">${project.team_size}</div>
                    <div class="kpi-label">Team Members</div>
                    <div class="kpi-change kpi-positive">
                        ${Math.floor(Math.random() * 5 + 1)} active today
                    </div>
                </div>
            `;
}

// Generate advanced charts
function generateAdvancedCharts(project) {
  // Performance Overview Chart (Mixed Chart)
  const performanceCtx = document.getElementById('performance-chart');
  if (performanceCtx && activeCharts.performance) {
    activeCharts.performance.destroy();
  }

  if (performanceCtx) {
    activeCharts.performance = new Chart(performanceCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue',
          type: 'line',
          data: generateTrendData(project.current_revenue, 12),
          borderColor: '#00ffff',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        }, {
          label: 'Users',
          type: 'bar',
          data: generateTrendData(project.current_users, 12),
          backgroundColor: 'rgba(139, 92, 246, 0.7)',
          borderColor: '#8b5cf6',
          borderWidth: 2,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff',
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#a8b3cf'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#a8b3cf'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: '#a8b3cf'
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  // Growth Chart (Doughnut)
  const growthCtx = document.getElementById('growth-chart');
  if (growthCtx && activeCharts.growth) {
    activeCharts.growth.destroy();
  }

  if (growthCtx) {
    const revenueProgress = project.target_revenue > 0 ? (project.current_revenue / project.target_revenue * 100) : 0;
    activeCharts.growth = new Chart(growthCtx, {
      type: 'doughnut',
      data: {
        labels: ['Achieved', 'Remaining'],
        datasets: [{
          data: [Math.min(revenueProgress, 100), Math.max(100 - revenueProgress, 0)],
          backgroundColor: ['#00ffff', 'rgba(255, 255, 255, 0.1)'],
          borderWidth: 0,
          cutout: '75%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              padding: 20,
              usePointStyle: true
            }
          }
        },
        animation: {
          animateRotate: true,
          duration: 2000
        }
      }
    });
  }

  // Goals Chart (Radar)
  const goalsCtx = document.getElementById('goals-chart');
  if (goalsCtx && activeCharts.goals) {
    activeCharts.goals.destroy();
  }

  if (goalsCtx) {
    activeCharts.goals = new Chart(goalsCtx, {
      type: 'radar',
      data: {
        labels: ['Revenue', 'Users', 'Conversion', 'Engagement', 'Retention', 'Growth'],
        datasets: [{
          label: 'Current',
          data: [
            Math.min(project.current_revenue / project.target_revenue * 100, 100),
            Math.min(project.current_users / project.target_users * 100, 100),
            Math.min(project.current_conversion / project.target_conversion * 100, 100),
            Math.random() * 40 + 60,
            Math.random() * 30 + 70,
            Math.random() * 50 + 50
          ],
          borderColor: '#00ffff',
          backgroundColor: 'rgba(0, 255, 255, 0.2)',
          pointBackgroundColor: '#00ffff',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#00ffff'
        }, {
          label: 'Target',
          data: [100, 100, 100, 90, 85, 80],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#8b5cf6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff',
              usePointStyle: true
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: '#a8b3cf'
            },
            ticks: {
              color: '#a8b3cf',
              backdropColor: 'transparent'
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  // Metrics Chart (Polar Area)
  const metricsCtx = document.getElementById('metrics-chart');
  if (metricsCtx && activeCharts.metrics) {
    activeCharts.metrics.destroy();
  }

  if (metricsCtx) {
    activeCharts.metrics = new Chart(metricsCtx, {
      type: 'polarArea',
      data: {
        labels: ['Revenue', 'Users', 'Conversion', 'Engagement'],
        datasets: [{
          data: [
            project.current_revenue / 1000,
            project.current_users / 100,
            project.current_conversion * 10,
            Math.random() * 50 + 50
          ],
          backgroundColor: [
            'rgba(0, 255, 255, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(245, 158, 11, 0.7)'
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              padding: 20,
              usePointStyle: true
            }
          }
        },
        scales: {
          r: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#a8b3cf',
              backdropColor: 'transparent'
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000
        }
      }
    });
  }

  // Time Series Chart
  const timeseriesCtx = document.getElementById('timeseries-chart');
  if (timeseriesCtx && activeCharts.timeseries) {
    activeCharts.timeseries.destroy();
  }

  if (timeseriesCtx) {
    activeCharts.timeseries = new Chart(timeseriesCtx, {
      type: 'line',
      data: {
        labels: generateDateLabels(30),
        datasets: [{
          label: 'Daily Revenue',
          data: generateTrendData(project.current_revenue / 30, 30),
          borderColor: '#00ffff',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Daily Users',
          data: generateTrendData(project.current_users / 30, 30),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Conversion Rate',
          data: generateTrendData(project.current_conversion, 30, 0.5),
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff',
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#a8b3cf'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#a8b3cf'
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }
}

// Utility functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function generateTrendData(baseValue, points, variance = 0.3) {
  const data = [];
  for (let i = 0; i < points; i++) {
    const trend = baseValue * (0.7 + (i / points) * 0.6); // Upward trend
    const noise = (Math.random() - 0.5) * variance * baseValue;
    data.push(Math.max(0, trend + noise));
  }
  return data;
}

function generateDateLabels(days) {
  const labels = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
}

function showMessage(message, type = 'success') {
  const messageId = type === 'success' ? 'success-message' : 'warning-message';
  const messageDiv = document.getElementById(messageId);
  const className = `message message-${type}`;

  messageDiv.className = className;
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';

  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  initializeTheme();
  initializeForm();
  initializeAnalytics();
});
