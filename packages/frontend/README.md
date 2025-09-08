# UltraChat - Next.js Chat Application

A modern, responsive chat application built with Next.js 14, featuring beautiful UI, authentication, and real-time messaging capabilities.

![UltraChat Preview](https://via.placeholder.com/800x400/4f46e5/ffffff?text=UltraChat+Preview)

## ✨ Features

- 🎨 **Multi-theme Support** - Light, Dark, Cupcake, and Dracula themes with DaisyUI
- 🔐 **Complete Authentication** - Email/password and Google OAuth integration  
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- ♿ **Accessible** - Proper ARIA attributes and keyboard navigation
- 🎭 **Smooth Animations** - Beautiful micro-interactions with Framer Motion
- 🍞 **Toast Notifications** - User feedback with Sonner
- 📋 **Form Validation** - Robust validation with React Hook Form + Zod
- 🌐 **API Integration** - Data fetching and caching with TanStack Query
- 3️⃣ **3D Hero Section** - Eye-catching visuals with React Three Fiber
- 🎯 **TypeScript** - Full type safety throughout the application

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Animation**: Framer Motion
- **3D Graphics**: React Three Fiber + Drei
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner
- **Authentication**: Custom hooks with API integration

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ultrachat.git
   cd ultrachat
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── conversations/     
│       └── page.tsx       # Protected chat page
├── components/            # Reusable components
│   ├── Header.tsx         # Navigation header
│   ├── Hero.tsx           # Landing page hero section
│   ├── ThemeToggle.tsx    # Theme switching component
│   ├── ProfileModal.tsx   # User profile editor
│   └── Auth/              # Authentication components
│       ├── LoginModal.tsx
│       ├── RegisterModal.tsx
│       └── LogoutConfirm.tsx
├── hooks/                 # Custom React hooks
│   └── useAuth.ts         # Authentication logic
├── lib/                   # Utility libraries
│   ├── api.ts            # API client setup
│   └── validations.ts    # Zod schemas
└── types/                 # TypeScript type definitions
    └── index.ts
```

## 🔌 API Integration

The application expects a backend API with the following endpoints:

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user  
- `GET /api/auth/google` - Start Google OAuth flow
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token

### User Management
- `PATCH /api/users` - Update user name
- `PATCH /api/users/image` - Update profile image (multipart)

### API Response Format
```typescript
interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}
```

## 🎨 Theming

The app supports multiple DaisyUI themes:
- **Light** - Clean, minimal light theme
- **Dark** - Modern dark theme  
- **Cupcake** - Soft, pastel colors
- **Dracula** - Popular dark theme with purple accents

Themes persist in localStorage and can be changed via the header toggle.

## 🔒 Authentication Flow

1. **Email/Password Auth**
   - Registration with name, email, password validation
   - Login with email/password
   - Form validation with inline error messages

2. **Google OAuth**
   - One-click Google sign-in
   - Redirects to backend OAuth flow
   - Automatic account linking

3. **Session Management**
   - HTTP-only cookies for security
   - Automatic token refresh
   - Protected route handling

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Collapsible navigation on small screens
- Touch-friendly interactions
- Optimized layouts for all screen sizes

## ♿ Accessibility

- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance
- Screen reader friendly

## 🚧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build  
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

### Code Style

- Functional components with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- Consistent naming conventions

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [DaisyUI](https://daisyui.com/) - Tailwind components
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D graphics
- [TanStack Query](https://tanstack.com/query) - Data fetching

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [documentation](https://nextjs.org/docs)
- Join our [Discord community](https://discord.gg/your-server)

---

Made with ❤️ using Next.js and modern web technologies.