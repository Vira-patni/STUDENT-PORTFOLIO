/**
 * SkillForge - LocalStorage Data Management Module
 * Handles persistence for Profile, Skills, Projects, Certifications, and Achievements.
 */

const STORAGE_KEYS = {
  PROFILE: 'skillforge_profile',
  SKILLS: 'skillforge_skills',
  PROJECTS: 'skillforge_projects',
  CERTIFICATIONS: 'skillforge_certifications',
  ACHIEVEMENTS: 'skillforge_achievements',
  THEME: 'skillforge_theme'
};

// Rich, realistic default demo dataset
const DEMO_DATA = {
  profile: {
    fullName: "Alex Rivera",
    headline: "Aspiring Full-Stack Developer & Cloud Enthusiast",
    email: "alex.rivera@cs.university.edu",
    college: "Institute of Technology & Computer Science",
    course: "B.Tech in Computer Science & Engineering",
    year: "3rd Year (Class of 2027)",
    bio: "Passionate computer science undergraduate focusing on high-performance web systems, distributed architectures, and UI/UX design. Hackathon enthusiast, open-source contributor, and lead developer of campus peer projects.",
    github: "https://github.com/alexrivera-dev",
    linkedin: "https://linkedin.com/in/alexrivera-tech",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  skills: [
    { id: "sk-1", name: "JavaScript (ES6+)", category: "Programming Languages", proficiency: "Expert" },
    { id: "sk-2", name: "Python", category: "Programming Languages", proficiency: "Advanced" },
    { id: "sk-3", name: "TypeScript", category: "Programming Languages", proficiency: "Intermediate" },
    { id: "sk-4", name: "React.js", category: "Web Development", proficiency: "Advanced" },
    { id: "sk-5", name: "Node.js & Express", category: "Web Development", proficiency: "Intermediate" },
    { id: "sk-6", name: "HTML5 & CSS3", category: "Web Development", proficiency: "Expert" },
    { id: "sk-7", name: "PostgreSQL", category: "Database", proficiency: "Intermediate" },
    { id: "sk-8", name: "MongoDB", category: "Database", proficiency: "Advanced" },
    { id: "sk-9", name: "Git & GitHub", category: "Tools", proficiency: "Expert" },
    { id: "sk-10", name: "Docker", category: "Tools", proficiency: "Intermediate" },
    { id: "sk-11", name: "Data Structures & Algorithms", category: "Other", proficiency: "Advanced" }
  ],
  projects: [
    {
      id: "prj-1",
      title: "SkillForge - Student Portfolio Builder",
      description: "Full-stack client-side SaaS dashboard for university students to track competencies, showcase hackathon project portfolios, and export clean PDF resumes.",
      techStack: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "Chart.js"],
      category: "Web Development",
      githubUrl: "https://github.com/alexrivera-dev/skillforge-portfolio",
      liveUrl: "https://skillforge-showcase.vercel.app",
      status: "Completed"
    },
    {
      id: "prj-2",
      title: "AI Resume & ATS Readability Analyzer",
      description: "Automated resume evaluation platform that extracts keywords, checks semantic match with tech job descriptions, and highlights missing skills.",
      techStack: ["Python", "Flask", "React", "Chart.js", "Bootstrap"],
      category: "Web Development",
      githubUrl: "https://github.com/alexrivera-dev/ai-resume-ats-analyzer",
      liveUrl: "https://ai-resume.demo.app",
      status: "Completed"
    },
    {
      id: "prj-3",
      title: "CampusMart - Student Peer Marketplace",
      description: "Campus-focused peer trading platform enabling students to exchange textbooks, electronics, and dorm appliances with campus-verified email auth.",
      techStack: ["Node.js", "Express", "MongoDB", "Tailwind CSS"],
      category: "Web Development",
      githubUrl: "https://github.com/alexrivera-dev/campusmart-marketplace",
      liveUrl: "",
      status: "In Progress"
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Cloud Practitioner",
      organization: "Amazon Web Services (AWS)",
      issueDate: "2024-04-15",
      credentialUrl: "https://aws.amazon.com/verification"
    },
    {
      id: "cert-2",
      name: "Meta Front-End Developer Professional Certificate",
      organization: "Meta / Coursera",
      issueDate: "2023-11-20",
      credentialUrl: "https://coursera.org/verify/professional-cert"
    },
    {
      id: "cert-3",
      name: "PostgreSQL Database Administration & SQL Mastery",
      organization: "Udemy",
      issueDate: "2024-01-10",
      credentialUrl: ""
    }
  ],
  achievements: [
    {
      id: "ach-1",
      title: "1st Place Winner — University HackCode 2024",
      organization: "ACM Student Chapter & GDG On Campus",
      date: "2024-03-02",
      description: "Built an accessibility-first campus navigation app for visually impaired students in 36 hours among 65 competing inter-college teams."
    },
    {
      id: "ach-2",
      title: "Google Developer Student Clubs (GDSC) Core Member",
      organization: "GDSC Campus Chapter",
      date: "2023-09-01",
      description: "Mentored 120+ first-year students in web development fundamentals and organized 3 hands-on Git & GitHub workshops."
    },
    {
      id: "ach-3",
      title: "Dean's Academic Excellence Honor Roll",
      organization: "School of Computing",
      date: "2023-12-18",
      description: "Awarded top 3% GPA recognition in Semester IV for outstanding performance in Data Structures and Algorithms."
    }
  ]
};

const StorageService = {
  // Initialize storage with demo data if empty
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      this.loadDemoData(false);
    }
  },

  // Profile operations
  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : { ...DEMO_DATA.profile };
    } catch (e) {
      console.error("Error loading profile from storage:", e);
      return { ...DEMO_DATA.profile };
    }
  },

  saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  // Skills operations
  getSkills() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SKILLS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading skills:", e);
      return [];
    }
  },

  saveSkills(skills) {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  },

  addSkill(skill) {
    const skills = this.getSkills();
    skills.push(skill);
    this.saveSkills(skills);
    return skills;
  },

  updateSkill(updatedSkill) {
    const skills = this.getSkills().map(s => s.id === updatedSkill.id ? updatedSkill : s);
    this.saveSkills(skills);
    return skills;
  },

  deleteSkill(id) {
    const skills = this.getSkills().filter(s => s.id !== id);
    this.saveSkills(skills);
    return skills;
  },

  // Projects operations
  getProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading projects:", e);
      return [];
    }
  },

  saveProjects(projects) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  addProject(project) {
    const projects = this.getProjects();
    projects.unshift(project);
    this.saveProjects(projects);
    return projects;
  },

  updateProject(updatedProject) {
    const projects = this.getProjects().map(p => p.id === updatedProject.id ? updatedProject : p);
    this.saveProjects(projects);
    return projects;
  },

  deleteProject(id) {
    const projects = this.getProjects().filter(p => p.id !== id);
    this.saveProjects(projects);
    return projects;
  },

  // Certifications operations
  getCertifications() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading certifications:", e);
      return [];
    }
  },

  saveCertifications(certs) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(certs));
  },

  addCertification(cert) {
    const certs = this.getCertifications();
    certs.unshift(cert);
    this.saveCertifications(certs);
    return certs;
  },

  updateCertification(updatedCert) {
    const certs = this.getCertifications().map(c => c.id === updatedCert.id ? updatedCert : c);
    this.saveCertifications(certs);
    return certs;
  },

  deleteCertification(id) {
    const certs = this.getCertifications().filter(c => c.id !== id);
    this.saveCertifications(certs);
    return certs;
  },

  // Achievements operations
  getAchievements() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading achievements:", e);
      return [];
    }
  },

  saveAchievements(achievements) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  },

  addAchievement(ach) {
    const achievements = this.getAchievements();
    achievements.unshift(ach);
    this.saveAchievements(achievements);
    return achievements;
  },

  updateAchievement(updatedAch) {
    const achievements = this.getAchievements().map(a => a.id === updatedAch.id ? updatedAch : a);
    this.saveAchievements(achievements);
    return achievements;
  },

  deleteAchievement(id) {
    const achievements = this.getAchievements().filter(a => a.id !== id);
    this.saveAchievements(achievements);
    return achievements;
  },

  // Theme preference
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  },

  saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Load demo data
  loadDemoData(notify = true) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEMO_DATA.profile));
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(DEMO_DATA.skills));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEMO_DATA.projects));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(DEMO_DATA.certifications));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(DEMO_DATA.achievements));
    if (notify && typeof ValidationService !== 'undefined') {
      ValidationService.showToast("Demo portfolio loaded successfully!", "success");
    }
  },

  // Reset all application data
  resetAllData() {
    const blankProfile = {
      fullName: "",
      headline: "",
      email: "",
      college: "",
      course: "",
      year: "",
      bio: "",
      github: "",
      linkedin: "",
      avatarUrl: ""
    };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(blankProfile));
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify([]));
  },

  // Calculate portfolio completeness score (0 to 100%)
  calculateCompletion() {
    const profile = this.getProfile();
    const skills = this.getSkills();
    const projects = this.getProjects();
    const certs = this.getCertifications();
    const achievements = this.getAchievements();

    let score = 0;
    const breakdown = [];

    // Profile checks (35% total)
    if (profile.fullName && profile.fullName.trim().length > 0) {
      score += 10;
      breakdown.push({ label: "Full Name provided", done: true, points: 10 });
    } else {
      breakdown.push({ label: "Add Full Name", done: false, points: 10 });
    }

    if (profile.headline && profile.headline.trim().length > 0) {
      score += 10;
      breakdown.push({ label: "Professional Headline added", done: true, points: 10 });
    } else {
      breakdown.push({ label: "Add Headline", done: false, points: 10 });
    }

    if (profile.bio && profile.bio.trim().length >= 20) {
      score += 10;
      breakdown.push({ label: "Biography written", done: true, points: 10 });
    } else {
      breakdown.push({ label: "Write a bio (at least 20 chars)", done: false, points: 10 });
    }

    if (profile.email && profile.email.includes("@")) {
      score += 5;
      breakdown.push({ label: "Contact email provided", done: true, points: 5 });
    } else {
      breakdown.push({ label: "Add Contact Email", done: false, points: 5 });
    }

    // Skills check (25% total: >=4 skills gives full 25%, else proportional)
    const skillsCount = skills.length;
    if (skillsCount >= 4) {
      score += 25;
      breakdown.push({ label: `Skills added (${skillsCount} skills)`, done: true, points: 25 });
    } else if (skillsCount > 0) {
      const partial = Math.round((skillsCount / 4) * 25);
      score += partial;
      breakdown.push({ label: `Add at least 4 skills (current: ${skillsCount})`, done: false, points: partial });
    } else {
      breakdown.push({ label: "Add your technical skills", done: false, points: 0 });
    }

    // Projects check (25% total: >=2 projects gives 25%)
    const projectCount = projects.length;
    if (projectCount >= 2) {
      score += 25;
      breakdown.push({ label: `Projects showcased (${projectCount} projects)`, done: true, points: 25 });
    } else if (projectCount === 1) {
      score += 15;
      breakdown.push({ label: "Showcase at least 2 projects (current: 1)", done: false, points: 15 });
    } else {
      breakdown.push({ label: "Add at least 1-2 projects", done: false, points: 0 });
    }

    // Certifications or Achievements check (15% total)
    const credsCount = certs.length + achievements.length;
    if (credsCount >= 2) {
      score += 15;
      breakdown.push({ label: `Certifications & Achievements (${credsCount} items)`, done: true, points: 15 });
    } else if (credsCount === 1) {
      score += 8;
      breakdown.push({ label: "Add certifications & achievements", done: false, points: 8 });
    } else {
      breakdown.push({ label: "Add at least 1 certification or achievement", done: false, points: 0 });
    }

    return {
      percentage: Math.min(100, Math.max(0, score)),
      breakdown
    };
  }
};
