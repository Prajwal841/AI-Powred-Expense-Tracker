# Expense Tracker Frontend

A modern, responsive React application for tracking personal expenses with beautiful UI, dark mode support, and AI-powered insights.

## Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 🌙 **Dark Mode** - Toggle between light and dark themes with localStorage persistence
- 📊 **Interactive Charts** - Visualize spending patterns with Recharts
- 💰 **Expense Management** - Full CRUD operations for expenses with filtering and search
- 🎯 **Budget Tracking** - Set and monitor monthly budgets with progress indicators
- 🤖 **AI Insights** - Smart recommendations and spending analysis
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast Performance** - Built with Vite for optimal development experience
- 🔒 **Authentication** - Secure login/register with form validation
- 🎭 **Animations** - Smooth transitions powered by Framer Motion

## Tech Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Framer Motion** - Animation library
- **Recharts** - Chart components
- **Lucide React** - Beautiful icons
- **date-fns** - Date manipulation utilities

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with sidebar
├── pages/              # Page components
│   ├── LandingPage.tsx # Landing page
│   ├── Dashboard.tsx   # Dashboard with charts
│   ├── Expenses.tsx    # Expense management
│   ├── Budgets.tsx     # Budget tracking
│   ├── Insights.tsx    # AI insights
│   ├── Login.tsx       # Authentication
│   └── Register.tsx    # User registration
├── redux/              # State management
│   ├── store.ts        # Redux store configuration
│   ├── hooks.ts        # TypeScript hooks
│   └── slices/         # Redux slices
│       ├── authSlice.ts
│       ├── expenseSlice.ts
│       ├── budgetSlice.ts
│       ├── categorySlice.ts
│       └── uiSlice.ts
├── utils/              # Utility functions
│   └── helpers.ts      # Helper functions
├── App.tsx             # Main app component
└── main.tsx           # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ExpenseTrackerFrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Configuration

### Backend API

The frontend is configured to connect to a Spring Boot backend running on `http://localhost:8080`. You can modify the API base URL in the Vite configuration:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Change this to your backend URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

### Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Expense Tracker
```

## Usage

### Authentication

1. **Register** - Create a new account with email and password
2. **Login** - Sign in with your credentials
3. **Demo Mode** - Use demo credentials for testing:
   - Email: `demo@example.com`
   - Password: `demo123`

### Managing Expenses

1. **Add Expense** - Click "Add Expense" button
2. **Edit Expense** - Click the edit icon on any expense
3. **Delete Expense** - Click the delete icon to remove expenses
4. **Filter Expenses** - Use search, category, and date range filters

### Setting Budgets

1. **Create Budget** - Set monthly budget for each category
2. **Monitor Progress** - View progress bars and spending alerts
3. **Track Remaining** - See how much budget is left

### Viewing Insights

1. **Dashboard** - Overview of spending patterns and trends
2. **Charts** - Visual representation of spending by category
3. **AI Recommendations** - Smart suggestions for saving money

## Features in Detail

### Dark Mode

- Toggle between light and dark themes
- Persists user preference in localStorage
- Automatically detects system preference on first visit

### Responsive Design

- Mobile-first approach
- Collapsible sidebar on mobile devices
- Touch-friendly interface
- Optimized for all screen sizes

### Charts and Analytics

- **Pie Chart** - Spending by category
- **Line Chart** - Weekly spending trends
- **Progress Bars** - Budget utilization
- **Interactive Tooltips** - Detailed information on hover

### Form Validation

- Real-time validation feedback
- Password strength indicator
- Email format validation
- Required field highlighting

## API Integration

The frontend integrates with the following backend endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/expenses` - Fetch expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/budgets` - Fetch budgets
- `POST /api/budgets` - Create budget
- `GET /api/categories` - Fetch categories

## Customization

### Styling

The app uses TailwindCSS with custom color schemes. You can customize colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... other shades
        900: '#1e3a8a',
      },
      // Add more custom colors
    }
  }
}
```

### Adding New Features

1. **New Page** - Create component in `src/pages/`
2. **New Component** - Create in `src/components/`
3. **New Redux Slice** - Add to `src/redux/slices/`
4. **Update Routes** - Add route in `src/App.tsx`

## Performance Optimization

- **Code Splitting** - Automatic route-based code splitting
- **Lazy Loading** - Components loaded on demand
- **Optimized Images** - WebP format with fallbacks
- **Bundle Analysis** - Use `npm run build` to analyze bundle size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Happy coding! 🚀**
