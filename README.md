# 🌿 Lore

**Lore** is a modern web application that makes family and community archiving effortless and meaningful.  
It combines visual storytelling, cloud storage, and social connection into one seamless platform.

---

## 🧭 Overview

**Type:** Web Application (self-hosted, cloud-integrated)  
**Stage:** MVP / Prototype  
**Stack:**  
- **Backend:** [Supabase](https://supabase.com) (Auth, Database, Storage, Realtime)  
- **Frontend:** React (Next.js or Remix)  
- **UI:** TailwindCSS + Shadcn UI  
- **Deployment:** [Coolify](https://coolify.io) (self-hosted)  
- **Integrations:** Supabase Cloud Storage, optional social login

---

## 🎯 Vision

> To make family and community archiving effortless, meaningful, and beautifully visual — empowering people to document, share, and preserve their stories for generations.

### Core Purpose
Lore combines **visual storytelling**, **cloud storage**, and **social connection** into one unified archive platform.  
It eliminates the need for fragmented tools (social media for sharing, Google Drive for storage, genealogy apps for trees).

---

## 💡 Problem Statement

People want to preserve family or community histories but face challenges:
- Fragmented tools and platforms
- Limited accessibility of traditional genealogy tools
- Lack of engagement or emotional connection

### Opportunity
Lore simplifies digital preservation through an intuitive, connected experience merging **archiving**, **social networking**, and **memory sharing**.

---

## 🧍‍♀️ Target Users

**Primary Personas**
1. **Family Archivists:** Individuals documenting family history or ancestry  
2. **Community Leaders:** Organizers or cultural groups preserving collective memories  
3. **Casual Users:** People sharing life updates and personal timelines

**User Needs**
- Easy photo/video uploading  
- Visual family trees & timelines  
- Secure cloud storage  
- Collaborative communities

---

## ✨ Core Features (MVP)

### 1. Personal Profiles
- Display name, bio, avatar  
- View uploads & posts  
- Privacy settings (public/private/family-only)

### 2. Visual Family Tree
- Interactive drag-and-drop layout  
- Add members, relationships, photos, and info  
- Link members to shared memories and timelines

### 3. Timeline View
- Chronological feed of milestones and media  
- Filter by tags, people, or events  
- Shared group timelines

### 4. Community Spaces
- Create or join communities (e.g., “Huynh Family”)  
- Members can post updates & media  
- Commenting and reacting

### 5. Cloud Storage
- Supabase-backed media storage  
- Organized by tags, albums, or dates  
- Supports images, videos, and documents

### 6. Daily Check-In Feed
- Dashboard of community updates  
- Quick “Add Memory” or “Share Photo” actions  

---

## 🚀 Future Features (Phase 2+)

- AI-powered memory recaps (highlight reels, story summaries)  
- Granular privacy and sharing controls  
- In-app messaging or chat  
- Exportable archives (PDF/JSON)  
- Custom domain hosting options  

---

## 🎨 UX & Design Principles

- **Aesthetic:** Warm, nostalgic, human-centered  
- **Layout:** Visual-first; intuitive drag/drop  
- **Accessibility:** WCAG-compliant  
- **Emotion:** Designed to evoke connection & memory  

---

## ⚙️ Technical Requirements

| Category | Requirement |
|-----------|--------------|
| Backend | Supabase (Postgres DB, Auth, Storage) |
| Frontend | React + TailwindCSS |
| Hosting | Coolify self-hosted |
| Storage | Supabase buckets w/ RBAC |
| Authentication | Supabase Auth (email/social) |
| Scalability | Modular architecture |
| Backup | Daily DB + storage snapshots |

---

## 🗓️ MVP Roadmap

| Phase | Description | Deliverable |
|--------|--------------|--------------|
| **1. Core Architecture** | Set up Supabase + schema + storage buckets | Working backend |
| **2. Auth & Profiles** | Implement Supabase Auth and profiles | Basic user system |
| **3. Timeline & Uploads** | Enable media uploads and timeline | Interactive feed |
| **4. Family Tree View** | Build visual relationship map | Dynamic family tree |
| **5. Communities** | Add group pages, posts, and memberships | Connected platform |
| **6. UI Polish & Deploy** | Final design + Coolify deployment | Live MVP |

---

## ⚠️ Risks & Assumptions

- Large storage requirements → need scalable quota model  
- Family tree visualization may require optimization  
- Self-hosted setup assumes technical proficiency with Coolify  

---

## 🌍 Future Vision

Lore will evolve into a **decentralized heritage network** — connecting families, communities, and cultures worldwide.  
Users will be able to trace stories, collaborate on archives, and even generate digital oral histories using AI from old media.

---
