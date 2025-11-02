# Frontend - Startup Document Analyzer

This directory contains the React frontend application for the Startup Document Analyzer.

## 🏗️ Structure

```
frontend/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── components/         # React components
│   │   ├── AnalysisResults.js    # Results display component
│   │   ├── FactCheckInput.js     # Fact-checking interface
│   │   ├── FileUpload.js         # Drag-and-drop file upload
│   │   ├── TextInput.js          # Text input for emails/calls
│   │   └── ThemeToggle.js        # Theme switcher
│   ├── contexts/
│   │   └── ThemeContext.js       # Theme management context
│   ├── services/
│   │   └── api.js                # API service layer
│   ├── App.js                    # Main application component
│   ├── index.js                  # React entry point
│   └── index.css                 # Global styles and design tokens
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+**
- **npm** or **yarn**

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🎨 Features

### Modern UI/UX
- **Glass morphism effects** with backdrop blur
- **Gradient backgrounds** and smooth animations
- **Responsive design** for all screen sizes
- **Dark/light theme** support with system preference detection
- **Floating animations** and hover effects

### Accessibility (A11y)
- **WCAG AA/AAA compliance** with proper contrast ratios
- **Keyboard navigation** with Tab/Enter/Space support
- **ARIA roles and labels** for screen readers
- **Focus management** with visible focus indicators
- **Reduced motion support** for sensitive users
- **High contrast mode** support

### Advanced Functionality
- **Drag-and-drop** file upload with visual feedback
- **Speech-to-text** integration using browser APIs
- **Auto-save drafts** to prevent data loss
- **Progress indicators** for uploads and analysis
- **Form validation** with real-time feedback
- **Predefined templates** for quick fact-checking

## 🛠️ Technologies Used

### Core Framework
- **React 18**: Modern frontend framework with hooks
- **JavaScript ES6+**: Modern JavaScript features

### UI/UX Libraries
- **Lucide React**: Beautiful icon library
- **React Dropzone**: Drag-and-drop file upload
- **Custom CSS**: Glass morphism effects and animations

### HTTP & State Management
- **Axios**: HTTP client for API communication
- **React Context**: Theme and state management
- **React Hooks**: Local state management

### Styling
- **CSS Variables**: Design token system
- **Responsive Design**: Mobile-first approach
- **Custom Animations**: Smooth transitions and effects

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8000

# Development settings
REACT_APP_DEBUG=true
REACT_APP_VERSION=1.0.0
```

### Theme Configuration
The app supports both light and dark themes with automatic system preference detection. Themes are managed through CSS variables in `src/index.css`.

### API Configuration
The API service is configured in `src/services/api.js` and automatically connects to the backend server.

## 🎯 Component Overview

### App.js
- Main application component with tab navigation
- Theme provider and accessibility features
- Keyboard navigation and screen reader support

### FileUpload.js
- Drag-and-drop file upload with progress bar
- File preview and validation
- Accessibility features for keyboard users

### TextInput.js
- Auto-resizing textarea with character counting
- Speech-to-text integration
- Auto-save functionality

### FactCheckInput.js
- Predefined templates for different content types
- Form validation with error messages
- Analysis type selection

### AnalysisResults.js
- Results display with proper formatting
- Fact-checking result visualization
- Responsive layout

### ThemeToggle.js
- Theme switcher with proper ARIA labels
- System preference detection
- Smooth transitions

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (not recommended)
npm run eject
```

### Development Features
- **Hot reload** for instant updates
- **Error overlay** for debugging
- **Source maps** for easy debugging
- **ESLint integration** for code quality

### Code Structure
- **Components**: Modular React components with clear separation of concerns
- **Services**: API service layer with error handling
- **Contexts**: Global state management for themes
- **Styling**: Utility-first CSS with custom animations

## 🎨 Design System

### Color Palette
- **Primary Blue**: #4e8df5
- **Primary Purple**: #8a4ef5
- **Primary Emerald**: #10b981
- **Primary Teal**: #14b8a6

### Spacing System
- **8px grid system** for consistent spacing
- **CSS variables** for easy customization
- **Responsive spacing** that scales with screen size

### Typography
- **Inter font family** for modern readability
- **Responsive typography** using clamp() functions
- **Consistent font weights** and line heights

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- **Touch-friendly** interface
- **Swipe gestures** for navigation
- **Optimized layouts** for small screens
- **Fast loading** on mobile networks

## 🔍 Accessibility Features

### Keyboard Navigation
- **Tab order** follows logical flow
- **Arrow keys** for tab navigation
- **Enter/Space** for button activation
- **Escape** for modal dismissal

### Screen Reader Support
- **ARIA labels** for all interactive elements
- **Live regions** for dynamic content
- **Semantic HTML** structure
- **Skip links** for main content

### Visual Accessibility
- **High contrast** mode support
- **Focus indicators** for keyboard users
- **Reduced motion** for sensitive users
- **Scalable text** and interface elements

## 🐛 Troubleshooting

### Common Issues

1. **Build errors:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are installed

2. **API connection issues:**
   - Ensure backend is running on port 8000
   - Check CORS configuration
   - Verify API URL in environment variables

3. **Theme issues:**
   - Clear browser cache and localStorage
   - Check CSS variable definitions
   - Verify theme context is properly wrapped

### Debug Mode
Enable debug logging by setting environment variables:
```bash
export REACT_APP_DEBUG=true
export REACT_APP_LOG_LEVEL=debug
```

## 📊 Performance

### Optimization Features
- **Code splitting** for faster loading
- **Lazy loading** of components
- **Image optimization** for document previews
- **Efficient re-renders** with React hooks

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx serve -s build
```

## 🔒 Security

### Best Practices
- **Input sanitization** for user content
- **XSS protection** with React's built-in features
- **HTTPS enforcement** in production
- **Content Security Policy** headers

### Data Handling
- **No sensitive data** stored in localStorage
- **Secure API communication** with HTTPS
- **Input validation** on all forms
- **Error sanitization** to prevent information leakage

## 📈 Roadmap

### Planned Features
- [ ] **Progressive Web App** (PWA) support
- [ ] **Offline functionality** with service workers
- [ ] **Advanced animations** and micro-interactions
- [ ] **Internationalization** (i18n) support
- [ ] **Advanced theming** with custom color schemes
- [ ] **Component library** documentation
- [ ] **Performance monitoring** and analytics

### Performance Improvements
- [ ] **Virtual scrolling** for large result sets
- [ ] **Image lazy loading** and optimization
- [ ] **Bundle size optimization** with tree shaking
- [ ] **Caching strategies** for API responses

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- **JavaScript**: Use ESLint configuration
- **CSS**: Follow design token conventions
- **Components**: Use functional components with hooks
- **Commits**: Use conventional commit messages

## 📄 License

This project is for educational and development purposes.
