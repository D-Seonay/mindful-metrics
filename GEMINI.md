# Gemini CLI Guidelines for Mindful Metrics Project

This document outlines guidelines and useful commands for the Gemini CLI when interacting with the `mindful-metrics` project.

## Project Overview

`mindful-metrics` is a web application designed to help users test and track their cognitive abilities, specifically focusing on reflexes and typing speed. It provides a user-friendly interface for various tests and visualizes performance over time.

## Development Environment

- **Language**: TypeScript
- **Framework**: React
- **Build Tool**: Vite
- **Package Manager**: npm
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS

## Useful Commands

Here are some common commands you might need to use:

- **Install Dependencies**:
  ```bash
  npm install
  ```

- **Run Development Server**:
  ```bash
  npm run dev
  ```

- **Build for Production**:
  ```bash
  npm run build
  ```

- **Run Tests**:
  ```bash
  npm test
  ```
  (Note: If `npm test` doesn't work, try `npm run test` or check `package.json` for the correct script.)

- **Linting/Formatting**:
  ```bash
  npm run lint
  ```
  (Check `package.json` for specific linting scripts.)

## Coding Conventions

- **Adhere to existing code style**: Always follow the existing formatting, naming conventions, and architectural patterns found in the project.
- **TypeScript first**: Utilize TypeScript for type safety and code clarity.
- **Component-based architecture**: Components should be modular and reusable.
- **Comments**: Add comments sparingly, focusing on *why* complex logic is implemented, rather than *what* it does.

## Interaction with Gemini CLI

- When making changes, always consider adding or updating relevant tests.
- Before suggesting significant changes, investigate the codebase using `codebase_investigator` to ensure a holistic understanding.
- Prioritize user safety and project integrity. Always explain commands that modify the file system or project state before execution.