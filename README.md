# CRM - Modern SaaS CRM Dashboard

CRM is a complete, fully functional Customer Relationship Management (CRM) web application built strictly with **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6)**. It requires **no backend, no database, and no third-party JavaScript/CSS frameworks**.

All application states, CRUD operations, dynamic metrics, and recent activities persist locally using the browser's `localStorage` and `sessionStorage`.

---

## 🚀 Key Features

### 1. Authentication & Route Protection (`index.html` & `login.js`)
- **Centered SaaS Login Card** with smooth entry animations and glassmorphism styling.
- **Show / Hide Password** toggle with eye icons.
- **Remember Me** support (persists session in `localStorage` vs. `sessionStorage`).
- **One-Click Demo Autofill** button for instant evaluation.
- **Form Validation & Visual Error Feedback** with animated card shake.
- **Route Guard**: Unauthorized direct access to internal pages redirects to `index.html`; logged-in users visiting `index.html` are redirected to `dashboard.html`.
- **Demo Credentials:**
  - **Email / Username:** `admin@crm.com`
  - **Password:** `admin123`

### 2. Main CRM Layout & Navigation
- **Persistent Left Sidebar:**
  - Dynamic active page highlighting.
  - Quick links: Dashboard, Customers, Leads, Sales, Tasks, Sign Out.
  - Interactive confirmation modal before sign-out.
- **Top Header:**
  - Page title and descriptive subtitle.
  - Global search field.
  - Interactive Notifications Bell with animated unread badge and dropdown menu.
  - Administrator profile pill.
  - Responsive hamburger drawer for mobile viewports.

### 3. Dashboard (`dashboard.html` & `dashboard.js`)
- **4 Dynamic Metric Cards** with animated counter rollups:
  - **Total Customers:** `customers.length`
  - **Total Leads:** `leads.length`
  - **Total Sales (Won Deals):** Formatted in Indian Rupees (`₹8,45,000`)
  - **Pending Tasks:** Dynamically filtered pending follow-ups
- **Pure CSS/JS Sales Overview Chart:**
  - 100% custom-built bar chart (Jan - Jun) with no chart libraries.
  - Hover tooltips displaying exact monthly revenue formatted in Rupees.
  - Proportional animated bar heights and Y-axis guidelines.
- **Recent Activities Feed:**
  - Real-time logging of customer creation, deal closing, lead conversion, and task updates.
  - Color-coded icons and relative timestamps.
- **Quick Action Modals:**
  - Direct creation of Customers, Leads, and Tasks from the dashboard.

### 4. Customers Management (`customers.html` & `customers.js`)
- Live search across Name, Email, Phone, and Company.
- Status filter dropdown (`All`, `Active`, `Inactive`, `Pending`).
- Full CRUD: Add, Edit, and Delete customers.
- Color-coded status badges and user initials avatars.
- Confirmation dialog modal before deletion.
- Empty states with one-click filter reset.

### 5. Leads Pipeline (`leads.html` & `leads.js`)
- Summary metric cards (Total Leads, New, Contacted, Converted).
- Lead tracking with follow-up dates and contact numbers.
- **One-Click Lead Conversion:** Automatically converts a lead to an active customer, logs an activity, and notifies the user.
- Status filtering (`New`, `Contacted`, `Converted`).
- Add, Edit, and Delete lead modals.

### 6. Tasks & Follow-ups (`tasks.html` & `tasks.js`)
- Filter by Priority (`High`, `Medium`, `Low`) and Status (`Pending`, `In Progress`, `Completed`).
- Interactive checkbox / button to mark tasks completed with strikethrough styling.
- Due date indicators and priority badges.
- Add, Edit, and Delete task modals.

### 7. Sales & Deals (`sales.html` & `sales.js`)
- Financial KPI cards:
  - Total Revenue (Won deals) formatted as Indian Currency (`₹8,45,000`).
  - Closed Deals count.
  - Pending Deals count.
  - Win Conversion Rate percentage (`(Won / Total) * 100%`).
- Search and filter by deal status (`Won`, `Pending`, `Lost`).
- Add, Edit, and Delete deal modals.

---

## 📁 Project Structure

```
CRM/
│
├── .gitignore          # Git ignore rules for node, logs, and OS files
├── README.md           # Documentation & Demo Guide
├── server.js           # Lightweight zero-dependency local Node server
│
├── agent/              # AI Agent guidelines & architecture documentation
│   └── README.md
│
├── assets/             # Media and vector assets
│   ├── icons/
│   │   └── logo.svg    # Vector brand logo icon
│   └── images/         # Image assets directory
│
├── src/                # Project Source Code
│   ├── css/
│   │   └── style.css   # Complete Vanilla CSS design system
│   └── js/
│       ├── app.js      # Core data layer, auth guard, toast & modals
│       ├── login.js    # Login form handler & validation
│       ├── dashboard.js# Dashboard analytics, CSS chart, quick actions
│       ├── customers.js# Customer CRUD & filtering
│       ├── leads.js    # Lead pipeline & conversion
│       ├── tasks.js    # Tasks status toggle & filtering
│       └── sales.js    # Sales revenue calculation & deals CRUD
│
├── index.html          # Authentication / Login page
├── dashboard.html      # Overview, stats, custom bar chart, activities
├── customers.html      # Customer directory with search & filters
├── leads.html          # Leads pipeline with conversion workflow
├── tasks.html          # Tasks and follow-up management
└── sales.html          # Sales revenue and deals tracker
```

---

## 💻 How to Run

### Option 1: Direct File Opening
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Using the Built-in Node Server
1. Open terminal in the project directory:
   ```bash
   node server.js
   ```
2. Navigate to:
   ```
   http://localhost:3000
   ```

---

## 🛡️ Technical Highlights
- **Zero Frameworks:** No React, Vue, Angular, Bootstrap, Tailwind, or jQuery.
- **Clean Architecture:** Proper separation of concerns with page-specific scripts and a shared data layer (`app.js`).
- **UI/UX Polish:** Toast notification system, custom modal dialogs, smooth transitions, responsive mobile drawer, and accessible markup.
