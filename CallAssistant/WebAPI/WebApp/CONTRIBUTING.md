# Contributing to Call Assistant

Thank you for your interest in contributing to the Call Assistant project! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Azure account with Communication Services and Azure AD access

### Quick Setup
1. Clone the repository
2. Run the setup script:
   - **Windows**: `setup.bat`
   - **Linux/Mac**: `chmod +x setup.sh && ./setup.sh`
3. Configure your `.env.local` file
4. Start development: `npm run dev`

## Development Workflow

### 1. Setting Up Your Development Environment
```bash
# Clone the repository
git clone [repository-url]
cd CallAssistant/WebAPI/WebApp

# Install dependencies
npm install

# Copy environment template
cp .env.local.template .env.local

# Edit .env.local with your Azure credentials
# Start development server
npm run dev
```

### 2. Making Changes
1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards below

3. Test your changes thoroughly

4. Commit your changes with clear, descriptive messages:
   ```bash
   git commit -m "feat: add participant monitoring feature"
   ```

### 3. Submitting Changes
1. Push your branch to your fork
2. Create a Pull Request with:
   - Clear description of changes
   - Screenshots (if UI changes)
   - Testing notes
   - Any breaking changes

## Coding Standards

### JavaScript/React
- Use modern ES6+ syntax
- Follow React Hooks best practices
- Use functional components over class components
- Implement proper error handling
- Add comments for complex logic

### Code Style
- Use ESLint configuration (run `npm run lint`)
- Use meaningful variable and function names
- Keep functions small and focused
- Avoid deep nesting

### File Organization
- Components in `src/components/`
- Utilities in `src/utils/`
- Styles using Tailwind CSS classes
- Keep related files together

## Testing Guidelines

### Manual Testing
1. Test all user interactions
2. Verify Azure integration works
3. Test different meeting scenarios:
   - Joining/leaving meetings
   - Recording start/stop
   - Participant changes
   - Auto-disconnect functionality

### Browser Testing
- Chrome (primary)
- Firefox
- Safari
- Edge

## Common Development Tasks

### Adding New Features
1. Create component in appropriate directory
2. Add proper prop types and documentation
3. Handle loading and error states
4. Update README if user-facing

### Working with Azure Services
- Test with real Azure resources
- Handle authentication errors gracefully
- Log relevant information for debugging
- Never commit credentials

### UI Changes
- Follow existing design patterns
- Use Tailwind CSS utilities
- Ensure responsive design
- Test on different screen sizes

## Environment Variables

Required for development:
- `VITE_CLIENT_ID` - Azure AD Application ID
- `VITE_TENANT_ID` - Azure AD Tenant ID
- `VITE_ACS_CONNECTION_EP` - ACS Endpoint
- `VITE_ACS_CONNECTION_KEY` - ACS Access Key

## Debugging Tips

### Common Issues
1. **Authentication failures**: Check Azure AD configuration
2. **Meeting join issues**: Verify ACS credentials
3. **Build errors**: Clear node_modules and reinstall
4. **Environment issues**: Verify .env.local format

### Useful Commands
```bash
# Clear cache and restart
rm -rf node_modules package-lock.json
npm install
npm run dev

# Check for linting issues
npm run lint

# Build for production testing
npm run build
npm run preview
```

## Release Process

### Version Updates
1. Update version in `package.json`
2. Update CHANGELOG.md with new features
3. Create git tag for release
4. Deploy to production environment

### Deployment
- Production builds go to `/dist` folder
- Set production environment variables
- Ensure HTTPS is enabled
- Test authentication flows in production

## Code Review Guidelines

### For Reviewers
- Check for security issues (no hardcoded credentials)
- Verify Azure integration works correctly
- Test UI changes thoroughly
- Ensure code follows project standards

### For Contributors
- Test thoroughly before submitting
- Include clear PR description
- Respond to feedback promptly
- Update documentation if needed

## Getting Help

### Resources
- [Azure Communication Services Docs](https://docs.microsoft.com/en-us/azure/communication-services/)
- [React Documentation](https://reactjs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Contact
- Check existing issues before creating new ones
- Include relevant code snippets in bug reports
- Provide steps to reproduce issues
- Tag maintainers for urgent issues

## Security

### Reporting Security Issues
- Do not open public issues for security vulnerabilities
- Contact maintainers directly
- Provide detailed information about the issue

### Security Best Practices
- Never commit credentials or secrets
- Use environment variables for configuration
- Validate all user inputs
- Follow Azure security guidelines

---

Thank you for contributing to Call Assistant! 🙏