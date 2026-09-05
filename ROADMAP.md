# Crove Post Roadmap

## 1. Frontend & UI/UX Modernization (Crove OS Standards)

- [ ] **Design System & Visual Refresh**:
  - Migrate legacy Postiz purple/neon styles to the unified Crove OS Design System (modern dark mode, refined zinc neutrals, subtle glassmorphism).
  - Standardize UI components with Tailwind and native primitives across Navigation, Modals, Forms, and Buttons.
- [ ] **Workspace & Organization Switcher Overhaul**:
  - Replace stock dropdown with a sleek, multi-tenant Workspace Selector featuring avatar/initials, active checkmarks, and Super-Admin/Role badges.
  - Optimize SWR cache invalidation for seamless zero-reload workspace switching.
- [ ] **Post Composer & Media Preview Rework**:
  - Redesign the post creation modal with live multi-channel previews (X, LinkedIn, Facebook, Instagram, TikTok, Threads).
  - Modernize character counters, hashtag generators, and AI assistant side panels.
- [ ] **Calendar & Analytics Experience**:
  - Implement a modern responsive calendar grid with smooth drag-and-drop post scheduling.
  - Redesign analytics dashboards with clean charts, engagement heatmaps, and exportable reports.

## 2. Provider Readiness & Integrations

### TikTok Content Posting API

- [ ] Wait for the production TikTok app revision containing `https://crove.com/integrations/social/tiktok` to become Live.
- [ ] Re-run TikTok Login Kit from Crove and verify the production callback end to end.
- [ ] Record a current end-to-end review video covering authorization, profile and statistics, video history, Direct Post, Upload Draft, and the post-action result on `crove.com`.
- [ ] Use a neutral, unbranded media asset and explicitly select `SELF_ONLY` with comments, Duet, and Stitch disabled for the audit demonstration.
- [ ] Resolve or document the stock Postiz defaults that preselect public visibility and enable comments before submitting the TikTok audit.
- [ ] Submit the Content Posting API audit only after the recorded behavior matches the requested products and scopes.

## 3. Media & Storage Architecture

- [ ] **Cloudflare R2 Direct Upload & Streaming**:
  - Optimize multipart chunked uploads for large video files (Reels, TikTok, YouTube Shorts).
  - Implement client-side video transcode checks and automatic thumbnail generation via Cloudflare CDN.

## 4. AI & Ecosystem Intelligence

- [ ] **Brand Voice & Copilot Enhancements**:
  - Integrate brand voice guidelines and tone-of-voice presets into the OpenAI-compatible AI Copilot engine.
  - Expand Mastra / MCP agent capabilities for autonomous multi-channel campaign scheduling.


