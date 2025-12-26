# SuiteGen

A professional, offline-capable productivity suite built with React and Tailwind CSS. SuiteGen provides a collection of essential tools designed for developers and professionals to streamline their daily workflows.

## 🛠️ Tools Included

### 1. Markdown to PDF
A real-time Markdown editor with a live preview pane.
- **Features:** GFM (GitHub Flavored Markdown) support, syntax highlighting, and a dedicated "Save as PDF" button that leverages browser print functionality for high-quality export.

### 2. Invoice Generator
A client-side invoice creation tool.
- **Features:** real-time tax and total calculations, dynamic line item management, and a clean, professional print layout that hides editor controls when saving as PDF.

### 3. Focus Timer (Pomodoro)
A productivity timer to help manage work sessions.
- **Features:** Pre-set modes for Focus (25m), Short Break (5m), and Long Break (15m). Includes an integrated task list to track what you are working on during sessions.

### 4. JSON Beautifier
A developer utility for formatting JSON data.
- **Features:** Format (Beautify) raw JSON with proper indentation, Minify JSON for storage, and validate JSON syntax with error reporting.

### 5. Shared Clipboard (P2P)
A no-login, serverless clipboard sharing tool.
- **Features:** Generates a unique room URL and QR code. Uses WebRTC to sync text in real-time between devices on the same page. Perfect for quickly moving text from mobile to desktop.

## 🎨 Features
- **Dark Mode:** Fully supported system-wide dark theme.
- **Responsive Design:** Works seamlessly on desktop and mobile devices.
- **Privacy Focused:** All data processing happens locally in your browser (or via P2P encrypted channels for the clipboard).

## 🚀 Tech Stack
- React 19
- Tailwind CSS
- Lucide React (Icons)
- React Markdown
- Trystero (WebRTC)