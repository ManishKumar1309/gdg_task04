# CRM - AI Agent Documentation & Configuration

This directory contains system prompts, operational rules, and architecture guidelines for AI agents working on or integrating with **CRM**.

---

## 🤖 Agent Role & Responsibilities
The Agent acts as an intelligent CRM assistant and frontend developer capable of:
1. **Managing CRM Records:** Adding, updating, filtering, and converting leads, customers, tasks, and sales deals.
2. **Maintaining Architecture Integrity:** Strictly adhering to Vanilla JavaScript (ES6), HTML5, and CSS3 without external frameworks or dependencies.
3. **Data Consistency:** Ensuring all transactions maintain valid `localStorage` state schemas.

---

## 📊 LocalStorage Data Schemas

### 1. Customers (`crm_customers`)
```json
{
  "id": "cust-1",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "company": "TechNova",
  "status": "Active | Inactive | Pending",
  "createdAt": "2026-09-10"
}
```

### 2. Leads (`crm_leads`)
```json
{
  "id": "lead-1",
  "name": "Arjun Mehta",
  "company": "FinTech Pro",
  "contact": "9876500001",
  "status": "New | Contacted | Converted",
  "followUpDate": "2026-09-28"
}
```

### 3. Tasks (`crm_tasks`)
```json
{
  "id": "task-1",
  "task": "Call Rahul Sharma",
  "date": "2026-09-28",
  "priority": "High | Medium | Low",
  "status": "Pending | In Progress | Completed"
}
```

### 4. Sales / Deals (`crm_sales`)
```json
{
  "id": "sale-1",
  "customer": "Rahul Sharma",
  "company": "TechNova",
  "dealValue": 250000,
  "date": "2026-09-20",
  "status": "Won | Pending | Lost"
}
```

---

## ⚙️ Rules for Agents
- **No external frameworks:** Do NOT install or introduce React, Vue, Bootstrap, or Tailwind.
- **Path structure:** All stylesheets must be located in `src/css/` and scripts in `src/js/`.
- **Currency formatting:** Always format financial figures using Indian currency (`₹X,XX,XXX`).
- **Activity logging:** Any create/update/delete operation must call `CRMData.addActivity(text, type)`.
