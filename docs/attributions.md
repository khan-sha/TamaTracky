# Tama Tracky - Attributions and Credits

## Third-Party Libraries and Tools

This document provides proper attribution for all third-party libraries, tools, and resources used in the Tama Tracky application, as required by FBLA competition guidelines.

### Core Framework and Libraries

#### React
- **Library**: React
- **Version**: 18.2.0
- **License**: MIT
- **Website**: https://react.dev/
- **Usage**: UI library for building component-based user interfaces
- **Attribution**: Copyright (c) Facebook, Inc. and its affiliates.

#### React DOM
- **Library**: react-dom
- **Version**: 18.2.15
- **License**: MIT
- **Website**: https://react.dev/
- **Usage**: React rendering for web browsers
- **Attribution**: Copyright (c) Facebook, Inc. and its affiliates.

#### TypeScript
- **Library**: TypeScript
- **Version**: 5.2.2
- **License**: Apache-2.0
- **Website**: https://www.typescriptlang.org/
- **Usage**: Type-safe JavaScript for better code quality
- **Attribution**: Copyright (c) Microsoft Corporation

#### Vite
- **Library**: Vite
- **Version**: 5.0.0
- **License**: MIT
- **Website**: https://vitejs.dev/
- **Usage**: Build tool and development server
- **Attribution**: Copyright (c) 2021-present, Yuxi (Evan) You and Vite contributors

### Routing

#### React Router DOM
- **Library**: react-router-dom
- **Version**: 6.20.0
- **License**: MIT
- **Website**: https://reactrouter.com/
- **Usage**: Client-side routing for single-page application navigation
- **Attribution**: Copyright (c) React Training 2016-2018, Remix Software 2020-2023

### Styling

#### Tailwind CSS
- **Library**: Tailwind CSS
- **Version**: 3.3.5
- **License**: MIT
- **Website**: https://tailwindcss.com/
- **Usage**: Utility-first CSS framework for rapid UI development
- **Attribution**: Copyright (c) Tailwind Labs, Inc.

#### PostCSS
- **Library**: PostCSS
- **Version**: 8.4.31
- **License**: MIT
- **Website**: https://postcss.org/
- **Usage**: CSS processing tool
- **Attribution**: Copyright (c) 2013 Andrey Sitnik and other contributors

#### Autoprefixer
- **Library**: Autoprefixer
- **Version**: 10.4.16
- **License**: MIT
- **Website**: https://github.com/postcss/autoprefixer
- **Usage**: Automatic vendor prefixing for CSS
- **Attribution**: Copyright (c) 2013 Andrey Sitnik

### Data Persistence

#### Browser localStorage API
- **API**: Web Storage API (localStorage)
- **Standard**: W3C Web Storage API
- **Usage**: Client-side storage for save slots and game data
- **Implementation**: Native browser API, no external library required
- **Attribution**: W3C Web Storage API standard, implemented by all modern browsers

**Note**: The `idb` package is listed in package.json but is not currently used in the codebase. The project uses the native localStorage API directly via `core/storage.ts`.

### Data Visualization

#### Chart.js
- **Library**: Chart.js
- **Version**: 4.4.0
- **License**: MIT
- **Website**: https://www.chartjs.org/
- **Usage**: Charting library for data visualization
- **Attribution**: Copyright (c) 2014-2023 Chart.js Contributors

#### React Chart.js 2
- **Library**: react-chartjs-2
- **Version**: 5.2.0
- **License**: MIT
- **Website**: https://react-chartjs-2.js.org/
- **Usage**: React wrapper for Chart.js
- **Attribution**: Copyright (c) 2020 Jeremy Ayerst

### Progressive Web App

#### Vite Plugin PWA
- **Library**: vite-plugin-pwa
- **Version**: 0.17.0
- **License**: MIT
- **Website**: https://vite-pwa-org.netlify.app/
- **Usage**: Vite plugin for Progressive Web App features
- **Attribution**: Copyright (c) 2021-present, Anthony Fu

#### Workbox Window
- **Library**: workbox-window
- **Version**: 7.0.0
- **License**: MIT
- **Website**: https://developers.google.com/web/tools/workbox
- **Usage**: Service worker management
- **Attribution**: Copyright 2018 Google LLC

### Development Tools

#### ESLint
- **Library**: ESLint
- **Version**: 8.53.0
- **License**: MIT
- **Website**: https://eslint.org/
- **Usage**: JavaScript linter for code quality
- **Attribution**: Copyright (c) OpenJS Foundation and other contributors

#### TypeScript ESLint
- **Library**: @typescript-eslint/eslint-plugin, @typescript-eslint/parser
- **Version**: 6.10.0
- **License**: MIT
- **Website**: https://typescript-eslint.io/
- **Usage**: TypeScript linting rules
- **Attribution**: Copyright (c) 2019 typescript-eslint and other contributors

### Icons and Emojis

#### Emoji Icons
- **Source**: Unicode Emoji Standard
- **Usage**: Visual icons throughout the application (🐾, 🐱, 🐶, etc.)
- **Attribution**: Unicode, Inc. - Unicode Standard

### Fonts

#### System Fonts
- **Source**: Operating system default fonts
- **Usage**: Typography throughout the application
- **Font Stack**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
- **Attribution**: Various font foundries (Apple, Microsoft, Google, etc.)

## License Summary

All libraries used in this project are open-source and licensed under permissive licenses (MIT, Apache-2.0), allowing for commercial and educational use without restrictions.

## Compliance

This project complies with all license requirements:
- All MIT-licensed libraries: Attribution included in this document
- All Apache-2.0 licensed libraries: License notices included
- No proprietary or restricted licenses used
- All dependencies are publicly available and auditable

## Additional Resources

### Documentation References
- React Documentation: https://react.dev/
- TypeScript Documentation: https://www.typescriptlang.org/docs/
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Chart.js Documentation: https://www.chartjs.org/docs/
- Vite Documentation: https://vitejs.dev/guide/

### Learning Resources
- MDN Web Docs: https://developer.mozilla.org/
- Web.dev: https://web.dev/
- React Router Tutorial: https://reactrouter.com/en/main/start/tutorial

## Contact

For questions about third-party library usage or licensing, please refer to the individual library documentation and license files in the node_modules directory.

