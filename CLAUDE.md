# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a demo application for the `tiptap-pagination-plus` plugin that showcases how to create a paginated document editor using CSS floats for page layout. The application is built with:

- **React 19** with TypeScript
- **Vite** for development and building
- **TailwindCSS 4** for styling
- **TipTap editor** with custom pagination extension
- **Jest** for testing

## Development Commands

### Core Development
- `npm run dev` - Start development server (typically on http://localhost:5173)
- `npm run build` - Build for production (outputs to `docs/` directory)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Testing
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## Architecture

### Editor Integration
The core component is `TiptapEditor` (src/ui/tiptap-editor.tsx) which:
- Uses the `tiptap-pagination-plus` plugin for document pagination
- Implements custom paste handling for plain text to HTML conversion
- Manages editor loading states with proper initialization sequence
- Loads transcript content from `/transcript.txt` on startup
- Includes extensive DOM measurement and debugging capabilities

### Key Configuration
- Page height: 842px (A4-like dimensions)
- Page gap: 20px between pages
- Header height: 50px per page
- Content padding: 48px

### State Management
The editor follows a careful initialization sequence:
1. Load initial content from transcript.txt
2. Initialize TipTap editor core
3. Wait for pagination plugin to be ready
4. Show editor and focus

### File Structure
- `src/ui/tiptap-editor.tsx` - Main editor component with pagination
- `src/lib/editor-content.ts` - Sample editor content (JSON format)
- `src/lib/config.ts` - Base path configuration for deployment
- `src/__tests__/` - Jest tests focused on pagination height calculations
- `public/transcript.txt` - Content loaded into editor on startup

## Plugin Development Workflow

For developing the `tiptap-pagination-plus` plugin alongside this demo:

1. Clone the plugin repository separately
2. In plugin directory: `npm install && npm run build && npm link`
3. In this demo directory: `npm link tiptap-pagination-plus`
4. Start demo with `npm run dev`

Changes to the plugin require rebuilding it to reflect in the demo.

## Testing Strategy

Tests focus on pagination height calculations with mocked DOM elements. The test setup (src/__tests__/setup.ts) includes:
- Jest DOM matchers
- Mocked `getComputedStyle` and `requestAnimationFrame`
- Height calculation validation for single and multi-page scenarios

## Build Configuration

- Uses path alias `@/` pointing to `src/`
- Builds to `docs/` directory for GitHub Pages deployment
- Supports environment-based public URL configuration via `VITE_PUBLIC_URL`
- Tailwind configured with design system variables and dark mode support