# Express Template Implementation

## Overview

InitMyRepo now supports Express.js scaffolding using `express-generator`, similar to how it handles Vite templates. This provides one-liner project creation for Express applications.

## How it Works

### Template Creation Commands

The app uses `express-generator` with different package managers:

```bash
# NPM (default)
npx express-generator my-app

# Yarn
yarn create express-generator my-app

# PNPM
pnpm dlx express-generator my-app

# Bun
bunx express-generator my-app
```

### Available Express Templates

1. **Express + EJS (Fast Setup)**

   - Command: `npx express-generator --view=ejs my-app`
   - Includes: EJS templating, JavaScript (no TypeScript setup needed)
   - Fast setup for web applications with server-side rendering

2. **Express + API Only (Fast Setup)**
   - Command: `npx express-generator --no-view my-app`
   - Includes: JavaScript API server (no view engine, no TypeScript setup)
   - Perfect for REST APIs and GraphQL servers with minimal configuration

## Technical Implementation

### Data Structure

```json
{
  "name": "Express + EJS (Fast Setup)",
  "isExpressTemplate": true,
  "expressOptions": "--view=ejs",
  "useTypeScript": false,
  "description": "Express with EJS templating (JavaScript - fast setup)",
  "iconType": "express"
}
```

### TypeScript Support

Templates now use JavaScript for faster setup:

- No TypeScript dependencies to install
- No `tsconfig.json` creation needed
- Standard Express.js workflow
- Much faster initialization (10-20 seconds vs 45-90 seconds)

### Package Manager Support

The implementation supports all major Node.js package managers:

- **npm**: Standard installation
- **yarn**: Uses `yarn create` and `yarn add`
- **pnpm**: Uses `pnpm dlx` and `pnpm add`
- **bun**: Uses `bunx` for creation, `bun add` for dependencies

## Benefits

1. **One-liner scaffolding**: Just like `create vite`, but for Express
2. **Package manager agnostic**: Respects user's chosen package manager
3. **TypeScript ready**: Automatic TypeScript setup when needed
4. **Modern TailwindCSS**: Uses TailwindCSS v4 Vite plugin for Vite templates (no PostCSS/Autoprefixer needed)
5. **Flexible templating**: Support for various view engines and CSS preprocessors
6. **Consistent workflow**: Same interface as Vite templates in the app

## Usage in InitMyRepo

1. Select an Express template from the template selector
2. Choose your preferred package manager
3. Select target directory
4. Click "Initialize" - the app handles everything:
   - Runs `express-generator` with appropriate options
   - Installs dependencies with chosen package manager
   - Sets up TypeScript if selected
   - Initializes git repository
   - Creates initial commit

## File Structure After Creation

### API Template (no view)

```
my-app/
├── bin/
│   └── www
├── public/
├── routes/
│   ├── index.js
│   └── users.js
├── app.js
├── package.json
└── tsconfig.json (if TypeScript)
```

### Full App Template (with views)

```
my-app/
├── bin/
│   └── www
├── public/
├── routes/
├── views/
├── app.js
└── package.json
```

This implementation provides developers with the same convenience for Express development that they enjoy with modern frontend frameworks like Vite.
