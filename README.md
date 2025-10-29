🧭 Product Requirements Document (PRD) — Lore
1. Overview

Product Name: Lore
Type: Web Application (self-hosted, cloud-integrated)
Stage: MVP / Prototype
Tech Stack (proposed):

Backend: Supabase (Auth, Database, Storage, Realtime)

Frontend: React (Next.js or Remix)

UI: TailwindCSS / Shadcn UI (modern minimal aesthetic)

Deployment: Coolify (self-hosted)

Integrations: Supabase Cloud Storage, optional social login

2. Vision & Purpose

Vision:
To make family and community archiving effortless, meaningful, and beautifully visual — empowering people to document, share, and preserve their stories for generations.

Core Purpose:
Lore combines visual storytelling, cloud storage, and social connection into one seamless experience. It eliminates the fragmentation of existing tools (social media for sharing, Google Drive for storage, genealogy apps for family trees) by merging them into one unified archive platform.

3. Problem Statement

People want to preserve their family or community histories but face challenges:

Fragmented Tools: Photos, videos, and memories are spread across multiple platforms.

Low Accessibility: Traditional genealogy tools are clunky and data-heavy.

Lack of Engagement: Most archival tools don’t encourage daily interaction or community storytelling.

Opportunity:
Lore simplifies digital preservation through an intuitive, connected platform — merging archiving, social networking, and memory sharing.

4. Goals & Success Metrics
Goal	Success Metric
Simplify family/community archiving	80% of users successfully create a family tree and upload media within first week
Encourage daily engagement	40% of users perform daily check-ins or timeline updates
Enable seamless sharing and connection	50% of users belong to at least one community or shared group
Provide reliable, scalable hosting	99% uptime via Coolify + Supabase integration
5. Target Users & Personas

Primary Users:

Family Archivists: Individuals documenting family history or ancestry.

Community Leaders: Organizers or cultural groups preserving collective memories.

Casual Users: People who simply want to share personal timelines or life events with close circles.

User Needs:

Easy uploading and tagging of photos/videos

Visual, navigable timelines and family trees

Secure cloud storage with ownership controls

Ability to connect or collaborate with others on shared archives

6. Core Features
MVP Must-Have Features

Personal Profile:

Display name, bio, and profile image

View personal media uploads and posts

Privacy settings (public/private/family-only)

Visual Family Tree:

Interactive tree layout (drag-and-drop or auto-arranged)

Ability to add members, relationships, and basic info (DOB, description, photos)

Link members to timelines and shared memories

Timeline View:

Chronological feed of posts, media, and milestones

Filtering by tags, event types, or people

Shared group timelines for communities/families

Community Spaces:

Join or create communities (e.g., “Huynh Family,” “Vietnamese Heritage Group”)

Members can post updates, media, and shared milestones

Commenting and reacting

Cloud Storage:

Backed by Supabase Storage

Organized by date, tags, or albums

Supports image, video, and document uploads

Daily Check-In Feed:

Dashboard showing updates from communities and followed members

Quick post option (“Add a Memory,” “Share a Photo”)

7. Optional / Phase 2 Features

AI-powered “Memory Recap” (auto-generate highlight reels or story summaries)

Advanced privacy settings (granular sharing control per post/tree branch)

In-app chat or messaging

Custom domain or exportable archives (PDF/JSON)

8. UX / Design Principles

Aesthetic: Warm, human-centered design — soft tones, minimalist UI.

Interaction: Visual-first, intuitive drag/drop and scrolling experiences.

Accessibility: WCAG-compliant design, large touch targets, readable fonts.

Emotion-driven UX: Focus on memory, connection, and storytelling.

9. Technical Requirements
Category	Requirement
Backend	Supabase (Postgres DB, Auth, Storage)
Hosting	Coolify self-hosted server
Frontend	React with TailwindCSS and component library
Storage	Supabase buckets with role-based access
Authentication	Supabase Auth (email + social login)
Scalability	Modular microservice-friendly setup
Backup	Daily database + storage backups
10. Launch Plan (MVP Roadmap)
Phase	Description	Deliverable
Phase 1 – Core Architecture	Set up Supabase project, DB schema, and storage buckets	Working backend
Phase 2 – User Profiles & Auth	Implement Supabase Auth, profile creation, and storage	Basic user system
Phase 3 – Timeline & Media Uploads	Enable posting and media uploads	Functional timeline
Phase 4 – Family Tree View	Develop interactive visualization	Dynamic family tree
Phase 5 – Community Spaces	Add group pages, posts, and membership	Connected experience
Phase 6 – UI Polish & Deployment	Finalize UI/UX, deploy via Coolify	Live MVP
11. Risks & Assumptions

Users may require large storage capacities (need flexible quota model).

Visualization of family trees can be complex (performance optimization needed).

Self-hosting on Coolify assumes stable infrastructure and admin expertise.

12. Future Vision

Lore could evolve into a decentralized heritage network — connecting family lines and communities globally, allowing users to trace stories, collaborate on cultural archives, and even integrate AI-generated oral histories from old photos or documents.