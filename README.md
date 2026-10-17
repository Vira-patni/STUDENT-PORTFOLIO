# SkillForge — Student Skill Portfolio Builder

A modern, responsive, full-stack client-side SaaS web application designed for university students to track technical competencies, curate hackathon project portfolios, record credentials, and generate professional PDF exportable CVs.

Built for the **College Mini-Hackathon Competition**, satisfying all four mandatory core objectives without requiring a backend framework or complex server runtime.

---

## 🌟 Live Demo & SaaS Visual Aesthetic

- **Design Aesthetic**: Dark navy (`#0b0f19`) canvas accented by vibrant purple-to-blue gradients (`linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)`).
- **Glassmorphic Surface**: Frosted glass panels (`backdrop-filter: blur(14px)`), luminous neon borders, micro-interactions, and smooth hover elevations.
- **Theme Adaptivity**: Full dark/light theme switch with real-time Chart.js palette adaptation and `localStorage` persistence.
- **Print & PDF Engine**: Dedicated `@media print` CSS engine transforming the interactive dashboard into a clean, executive, 1-page paper resume.

---

## 🏆 Fulfillment of Hackathon Objectives

| Objective | Requirement | SkillForge Implementation |
|---|---|---|
| **Objective 1 — JavaScript** | Dynamic CRUD, Form Validations, Modular Functions, Arrays, Objects, Event Listeners, DOM Manipulation | Clean ES6+ modular architecture across `app.js`, `storage.js`, `validation.js`, `skills.js`, `projects.js`, `analytics.js`, `portfolio.js`. Inline regex email/URL validation, duplicate skill prevention, XSS character escaping, real-time portfolio score computation. |
| **Objective 2 — Client-Server Communication** | Fetch JSON data, handle HTTP response codes, loading states, parsing errors | `data/skills.json` and `data/projects.json` loaded asynchronously using the native `fetch()` API with `async/await`, `response.ok` status validation, `try/catch` error capture, and offline fallback resilience. |
| **Objective 3 — Front-End UI** | Responsive UI, polished dashboard, desktop/mobile navigation | Bootstrap 5 grid and utility classes, mobile slide-out drawer, dynamic category filter pills, suggestion cloud, interactive modal dialogs, and auto-dismissing floating glass toasts. |
| **Objective 4 — Visualization & Static Deployment** | Chart.js integration, category distribution, proficiency metrics, static hosting ready | Multi-chart analytics suite (Category Doughnut, Category Bar, Horizontal Proficiency Bar, Dashboard Mini Doughnut) with automated instance teardown (`chart.destroy()`) to prevent canvas memory leaks. 100% static hosting compatible (GitHub Pages). |

---

## 📂 Project Directory Structure

```text
SkillForge/
├── index.html                  # Single-page application shell & modal structures
├── css/
│   └── style.css               # Glassmorphism, theme variables, micro-animations, and @media print
├── js/
│   ├── app.js                  # Master application orchestrator, routing, dashboard stats & certs/achievements CRUD
│   ├── storage.js              # LocalStorage CRUD persistence, demo dataset & portfolio score calculator
│   ├── validation.js           # Form validators (email/URL regex), XSS HTML sanitizer & custom toast notifications
│   ├── skills.js               # Skills CRUD, category filtering, suggestion pills, and duplicate prevention
│   ├── projects.js             # Projects CRUD, search, category/status filters & template picker
│   ├── analytics.js            # Chart.js visualization engine (Doughnut, Bar, Proficiency charts)
│   └── portfolio.js            # Live portfolio preview renderer & PDF export handler
├── data/
│   ├── skills.json             # Technical skill categories and suggested competencies dataset
│   └── projects.json           # Curated student hackathon project templates dataset
├── assets/
│   └── images/
│       ├── avatar.svg          # Local vector default avatar (offline fallback)
│       └── logo.svg            # Brand logo vector
└── README.md                   # Comprehensive documentation, setup guide & presentation pitch
```

---

## 🚀 Running the Application Locally

> [!IMPORTANT]
> **Why a Local HTTP Server is Required:**
> Modern web browsers restrict `fetch()` requests to local files (`file:///c:/...`) due to the browser **Same-Origin Policy (CORS)**. To allow `fetch('data/skills.json')` and `fetch('data/projects.json')` to execute successfully, the application must be served over `http://` or `https://`.

### Recommended Method: VS Code Live Server Extension

1. Open **Visual Studio Code**.
2. Go to **File** ➔ **Open Folder...** and select the `SkillForge` directory.
3. Install the extension: **Live Server** (by *Ritwick Dey*) from the VS Code Extensions Marketplace (`Ctrl+Shift+X` or `Cmd+Shift+X`).
4. Right-click `index.html` in the VS Code Explorer and click **"Open with Live Server"** (or click **"Go Live"** in the bottom status bar).
5. The application will launch at `http://127.0.0.1:5500/index.html`.

### Alternative HTTP Servers (If Live Server is not installed)

- **Node.js `npx serve`**:
  ```bash
  npx serve .
  ```
- **Python 3 HTTP Server**:
  ```bash
  python -m http.server 8000
  ```
  *(Then open `http://localhost:8000` in your web browser)*

---

## 🧪 Comprehensive Testing Checklist

Verify every feature in sequence during evaluation:

- [x] **1. Dashboard Initialization**: Loads student greeting, 4 stat counters, dynamic completeness gauge, recent projects list, top skills widget, and mini category doughnut.
- [x] **2. JSON Fetch API**:
  - `data/skills.json` populates the category filter pills and Add Skill category dropdown.
  - `data/projects.json` populates the "Browse Templates" modal gallery.
- [x] **3. Form Validation**:
  - Empty or short inputs trigger red `.is-invalid` borders and inline descriptive text.
  - Malformed emails or invalid URL formats are flagged before submission.
- [x] **4. Duplicate Prevention**: Adding an existing skill name (e.g. "Python") triggers a duplicate warning and rejects duplicate insertion.
- [x] **5. Suggestion Cloud**: Clicking any skill in the "Quick Suggestions" pill cloud instantly adds it to the user's skills with appropriate category and proficiency.
- [x] **6. Projects CRUD & Filtering**:
  - Search input filters projects in real time across title, description, and tech stack tags.
  - Status and category dropdowns filter cards instantly.
  - "Browse Templates" allows 1-click cloning of pre-configured hackathon project templates.
- [x] **7. Certifications & Achievements**: Timeline cards with credential links, dates, and full edit/delete capabilities.
- [x] **8. Chart.js Dynamic Visualizations**:
  - Skills distribution Doughnut Chart updates on every skill addition or removal.
  - Bar chart and proficiency distribution update synchronously.
  - Shows an empty state graphic if all skills are deleted.
- [x] **9. LocalStorage Persistence**: Modifying profile details, adding skills, or changing the theme persists after a browser page refresh (`F5`).
- [x] **10. Dark / Light Theme Toggle**: Seamless transition between dark navy glow and modern crisp light theme; chart font and grid colors re-render cleanly.
- [x] **11. Print to PDF Export**: Clicking "Print / Save as PDF" strips the sidebar, topbar, and action buttons, formatting the portfolio into a clean resume printout.
- [x] **12. Responsive Layout**: Collapsible sidebar navigation with mobile hamburger toggle and fluid Bootstrap grid breakpoints.

---

## 🎙️ 2-Student Hackathon Demonstration Script (3-Minute Pitch)

Use this script to present SkillForge to the hackathon judges:

### **Student A (UI/UX, Problem Statement & User Flow) — 90 Seconds**
> *"Good morning respected judges! Many students build impressive hackathon projects, learn modern tech stacks, and earn certifications, but struggle to maintain an up-to-date, recruiter-ready portfolio. Traditional resume builders are either static, paywalled, or require complex backend hosting.*
>
> *We built **SkillForge — Student Skill Portfolio Builder**.*
>
> *(Navigating the app live)*
> *As you can see on our dashboard, SkillForge provides an instant SaaS-grade developer experience. Notice our Dark Navy glassmorphic design system with ambient glow. The dashboard aggregates our competencies in real time: Total Skills, Projects, Certifications, and an interactive **Portfolio Completeness Meter** with a step-by-step checklist.*
>
> *In the **Skills Manager**, students don't need to manually type everything: we feature a category-aware suggestion cloud where clicking any pill like 'Docker' or 'PostgreSQL' instantly adds it with automated proficiency meters.*
>
> *In the **Projects Showcase**, students can filter by tech stack or status, or click **'Browse Templates'** to clone curated hackathon projects into their profile with 1 click.*
>
> *Now, my teammate will explain the technical architecture, client-server communication, and Chart.js analytics."*

### **Student B (Architecture, Fetch API, Chart.js & Persistence) — 90 Seconds**
> *"Thank you! On the technical side, SkillForge strictly adheres to clean vanilla JavaScript ES6+ without relying on heavy frontend frameworks.*
>
> *For **Objective 1 & 2**, our application relies on a modular architecture: `storage.js` manages local data schemas, while `validation.js` protects against XSS injection by sanitizing all text and validating URLs and emails with strict regexes.*
>
> *For **Client-Server Communication**, we do not hardcode categories or templates. Instead, `skills.js` and `projects.js` make asynchronous `fetch()` calls to `data/skills.json` and `data/projects.json`. We handle HTTP response statuses, JSON parse states, and provide graceful fallbacks if network issues occur.*
>
> *For **Objective 4**, look at our **Skill Analytics** tab. We integrated Chart.js to render a responsive Category Distribution Doughnut, a Category Frequency Bar Chart, and a Proficiency Distribution Chart. Every time a skill is added or modified, our `AnalyticsModule` dynamically recalculates the dataset and updates the canvas without memory leaks.*
>
> *Finally, our **Live Portfolio Preview** synthesizes the entire portfolio into a public profile page. When a student clicks **'Print / Save as PDF'**, our `@media print` CSS engine strips the navigation chrome and prints a crisp, 1-page resume.*
>
> *Everything persists in `localStorage`, and the entire project is 100% static-host ready for GitHub Pages. Thank you!"*

---

## 🌐 Deploying to GitHub Pages (Static Hosting)

SkillForge has **zero server-side dependencies**, making it 100% compatible with free static hosting:

1. Create a new GitHub repository (e.g. `skillforge-portfolio`).
2. Push the project code to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial release of SkillForge"
   git branch -M main
   git remote add origin https://github.com/<your-username>/skillforge-portfolio.git
   git push -u origin main
   ```
3. In your GitHub repository, click **Settings** ➔ **Pages** (under the "Code and automation" sidebar).
4. Under **"Build and deployment"** ➔ **Source**, select **"Deploy from a branch"**.
5. Set branch to `main` and folder to `/ (root)`, then click **Save**.
6. Within 1-2 minutes, GitHub will provide a live URL: `https://<your-username>.github.io/skillforge-portfolio/`.

---

## ⚠️ Limitations & Internet-Dependent Features

- **CDN Libraries**: Bootstrap 5, Bootstrap Icons, and Chart.js are loaded via CDN for high performance and zero local bundle weight. An active internet connection is required on first load (or the CDN files can be downloaded locally for an offline-only intranet setup).
- **Google Fonts**: Uses 'Plus Jakarta Sans' from Google Fonts. If offline, the browser gracefully falls back to system sans-serif fonts (`-apple-system, Segoe UI, Roboto`).
- **External Image Avatars**: If custom external image URLs (e.g. Unsplash or GitHub avatar links) fail to load or are blocked by campus firewalls, SkillForge automatically falls back to the embedded vector SVG `assets/images/avatar.svg`.
- **Browser-Scoped Storage**: `localStorage` saves data on the user's specific browser and device. To move data across devices, the user can reset or reload sample data with the topbar controls.
