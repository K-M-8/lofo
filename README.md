# LoFo — Universal Lost & Found Platform

A full stack web application that digitizes lost & found management for any organization — colleges, offices, housing societies, and airports.

**Live Demo:** (https://lofo.mahajankhwaish650.workers.dev/)

---

## 🚀 Features

- **Multi-Organization Support** — Any organization can register and manage their own lost & found system independently
- **Secure Claim Protection** — Secret question system prevents false claims. Only the real owner can answer correctly
- **Photo Uploads** — Attach photos to lost and found items for faster identification
- **Role-Based Access** — Super admin, org admin, and member roles with different permissions
- **Org-Only Visibility** — Items are only visible to members of the same organization
- **Department Desk Mode** *(coming soon)* — Staff can log items at the L&F desk, owners collect with a digital token
- **Private Chat** *(coming soon)* — Secure messaging between finder and claimer

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Routing | TanStack Router |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Deployment | Cloudflare Pages |
| Version Control | Git + GitHub |

---

## 📱 Pages

- **Landing Page** — Public marketing page explaining the platform
- **Authentication** — Sign up and sign in
- **Home Dashboard** — Organization-specific feed with stats
- **Browse Items** — Search and filter lost & found listings
- **Report Item** — Form to report lost or found items with photo upload
- **Join Organization** — Search and join your organization
- **Register Organization** — Register a new organization

---

## 🗄️ Database Schema
organizations   — org name, type, location, join method, status
profiles        — user info, org membership, role
items           — title, type, category, photo, secret question
claims          — claim requests with secret answer verification
notifications   — user alerts

---

## 🔐 Security

- Row Level Security (RLS) on all Supabase tables
- Organization-scoped data access
- Secret question verification for item claims
- Role-based permissions (super_admin, org_admin, member)

---

## 🏃 Running Locally

```bash
# Clone the repo
git clone https://github.com/K-M-8/lofo.git
cd lofo

# Install dependencies
npm install --legacy-peer-deps

# Add environment variables
cp .env.example .env
# Fill in your Supabase credentials

# Start development server
npm run dev
```

---

## 🌍 Supported Organization Types

- 🎓 Universities & Colleges
- 🏢 Offices & Workplaces  
- 🏘️ Housing Societies
- ✈️ Airports & Transport Hubs

---

## 🗺️ Roadmap

- [x] Multi-organization system
- [x] User authentication
- [x] Lost & found reporting
- [x] Photo uploads
- [x] Claim protection with secret questions
- [ ] Private chat between finder & claimer
- [ ] Department desk mode with pickup tokens
- [ ] Email notifications
- [ ] Super admin dashboard
- [ ] Mobile app (React Native)

---

## 👨‍💻 Built By

**Khwaish Mahajan** — [@K-M-8](https://github.com/K-M-8)

*Built from scratch — frontend, backend, database design, and deployment.*