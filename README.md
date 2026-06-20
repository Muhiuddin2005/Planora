# Planora - Frontend Portal

Planora is a premium event management and moderation platform that empowers users to create, participate in, review, and manage events. The platform is built using a modern, responsive interface featuring interactive dashboards, beautiful transitions, and real-time operations.

This repository hosts the **Frontend Application** built with Next.js (App Router).

## 🚀 Live URL & Repositories

- **Live URL (Vercel)**: [https://planora-fronend.vercel.app](https://planora-fronend.vercel.app)
- **Backend Repository**: [Planora Backend Repo](https://github.com/yourusername/planora-backend)
- **Frontend Repository**: [Planora Frontend Repo](https://github.com/yourusername/planora-frontend)

---

## 🔑 Key Features

### 📅 User & Event Portal
- **Interactive Event Discovery**: Search, browse, and filter public events. Includes a dynamic Framer Motion carousel showcasing premium event visuals.
- **Event Creation & Workspace**: Create public/private and free/paid events. Event hostings require moderator approval before publishing.
- **Participation & Check-in**: Join events, obtain ticket check-in codes, and pay for paid tickets via secure checkouts.
- **Invitations**: Send direct email and platform invitations to other members.
- **Review System**: Rate and write comments for hosted events after completion.
- **Real-Time Notification Hub**: Toast messages (Sonner) and navbar alerts trigger automatically using WebSocket.io connections.

### 🛡️ Moderator & Admin Control Center
- **Overview Dashboard**: Rich data visualizations (Recharts) showing user status statistics, monthly growth, and revenue statistics.
- **Event Moderation Table**: Review pending event requests with **Approve** and **Reject** controls (including promptable rejection justifications).
- **User Management Control**: 
  - Ban and unban users.
  - Promote regular `USER` accounts to `MODERATOR` role.
  - Delete user accounts entirely (cascading cleanup).
- **Contact Messages Desk**: View contact submissions, trigger a direct Gmail compose layout, or delete messages.
- **Audit Logs Visualizer**: A secure, filterable chronological logging table displaying admin/moderator actions (who, what, target, details, and timestamps).

### 🚨 Access Warning & Auto-Ban System
- **Self-Service Violation Warning**: If a non-admin/non-moderator tries to navigate to the Admin Dashboard area, they are blocked and warned with an on-screen countdown before being logged out.
- **Auto-Ban**: If a user attempts to bypass security more than once, their account is automatically and permanently **BANNED** by the security gateway, and they are shown a strict violation notice upon redirection.

---

## 🛠️ Technologies Used

- **Framework**: Next.js 15 (React 19) with App Router
- **Styling**: Tailwind CSS & Vanilla CSS (harmonious, vibrant dark-mode gradients and micro-animations)
- **State Management & Caching**: TanStack React Query (v5)
- **HTTP Client**: Axios (configured with interceptors to handle automatic token wipeouts on 401/403 errors)
- **Icons**: Lucide React
- **Alerts & Modals**: SweetAlert2 & Sonner (Toasts)
- **Charts & Data**: Recharts
- **Animations**: Framer Motion
- **Token Decoding**: jwt-decode

---

## 🚀 Local Setup Instructions

Follow these steps to run the frontend application locally:

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed.

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/planora-frontend.git
cd planora-frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Build for Production
```bash
npm run build
npm run start
```
