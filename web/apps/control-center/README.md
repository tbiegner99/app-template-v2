# __DISPLAY_NAME__ Web Application

React web application for the __DISPLAY_NAME__ project.

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety
- **Rspack** - Fast bundler (Rust-based Webpack alternative)
- **Material-UI (MUI)** - React component library
- **CSS Modules** - Scoped styling
- **React Router** - Client-side routing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build

Build for production:

```bash
npm run build
```

### Lint & Format

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

## Project Structure

```
web/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # Reusable components
│   │   └── Layout.tsx
│   ├── pages/             # Page components
│   │   ├── Home.tsx
│   │   ├── Home.module.css
│   │   └── About.tsx
│   ├── App.tsx            # Root component
│   ├── routes.tsx         # Route definitions
│   ├── index.tsx          # Entry point
│   └── index.css          # Global styles
├── rspack.config.js       # Rspack configuration
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc.json       # Prettier configuration
└── package.json
```

## CSS Modules

CSS Modules are configured and ready to use. Create files with `.module.css` extension:

```tsx
import styles from './Component.module.css';

function Component() {
  return <div className={styles.myClass}>Content</div>;
}
```

## MUI Theming

The app uses MUI's theming system. Customize the theme in `src/App.tsx`:

```tsx
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    // Add more customization
  },
});
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
