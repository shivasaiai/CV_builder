# Resume Builder Design System

A comprehensive design system built for the resume builder application, providing consistent UI components, design tokens, and accessibility features.

## Overview

This design system follows industry best practices and provides:

- **Consistent Design Tokens**: Colors, typography, spacing, and more
- **Accessible Components**: WCAG 2.1 AA compliant components
- **Theme Support**: Light and dark mode with system preference detection
- **Modern UI Patterns**: Loading states, form validation, and interactive feedback
- **Responsive Design**: Mobile-first approach with consistent breakpoints

## Getting Started

```typescript
import { Button, Input, Form, useTheme } from '@/lib/design-system';

// Use components with consistent styling
<Button variant="primary" size="lg">
  Get Started
</Button>

// Access theme context
const { theme, setTheme, actualTheme } = useTheme();
```

## Design Tokens

### Colors

The color system uses HSL values for better manipulation and accessibility:

```typescript
import { colors } from '@/lib/design-system/tokens';

// Primary brand colors
colors.primary[500] // Main brand color
colors.primary[400] // Lighter variant
colors.primary[600] // Darker variant

// Semantic colors
colors.semantic.success[500]
colors.semantic.warning[500]
colors.semantic.error[500]
```

### Typography

Consistent typography scale with proper line heights:

```typescript
import { typography } from '@/lib/design-system/tokens';

typography.fontSize.lg // [1.125rem, { lineHeight: 1.75rem }]
typography.fontWeight.semibold // 600
typography.fontFamily.sans // ['Inter', 'system-ui', 'sans-serif']
```

### Spacing

Consistent spacing scale based on rem units:

```typescript
import { spacing } from '@/lib/design-system/tokens';

spacing[4] // 1rem
spacing[8] // 2rem
spacing[16] // 4rem
```

## Components

### Button

Enhanced button component with multiple variants and states:

```typescript
<Button 
  variant="default" // default | destructive | outline | secondary | ghost | link | gradient
  size="md" // sm | default | lg | xl | icon
  loading={isLoading}
  leftIcon={<Icon />}
  rightIcon={<Icon />}
>
  Click me
</Button>
```

### Input

Form input with validation states and accessibility features:

```typescript
<Input
  label="Email Address"
  type="email"
  required
  error={errors.email}
  success="Email is valid"
  helperText="We'll never share your email"
  leftIcon={<EmailIcon />}
/>
```

### Form

Comprehensive form system with validation:

```typescript
<Form onSubmit={handleSubmit}>
  <FormSection title="Personal Information">
    <FormField name="email">
      <FormLabel required>Email</FormLabel>
      <Input type="email" />
      <FormMessage />
    </FormField>
  </FormSection>
</Form>
```

### Loading States

Various loading components for better UX:

```typescript
// Skeleton loading
<Skeleton className="h-4 w-3/4" />
<CardSkeleton />
<ListSkeleton items={5} />

// Spinners
<Spinner size="lg" variant="dots" />

// Progress bars
<Progress value={75} variant="success" showLabel />

// Loading overlay
<LoadingOverlay isLoading={true} message="Processing...">
  <YourContent />
</LoadingOverlay>
```

## Theme System

### Theme Provider

Wrap your app with the theme provider:

```typescript
import { ThemeProvider } from '@/lib/design-system';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <YourApp />
    </ThemeProvider>
  );
}
```

### Using Themes

```typescript
import { useTheme } from '@/lib/design-system';

function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();
  
  return (
    <Button 
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {actualTheme === 'dark' ? 'Light' : 'Dark'} Mode
    </Button>
  );
}
```

## Accessibility

### WCAG 2.1 AA Compliance

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 contrast ratio
- **Focus Management**: Clear focus indicators
- **Reduced Motion**: Respects user motion preferences

### Accessibility Features

```typescript
// Screen reader only content
<span className="sr-only">Loading...</span>

// Proper ARIA labels
<Button aria-label="Close dialog">×</Button>

// Focus management
<Input aria-describedby="email-error" aria-invalid={hasError} />
```

## Responsive Design

### Breakpoints

Mobile-first responsive design with consistent breakpoints:

```typescript
import { breakpoints } from '@/lib/design-system/tokens';

// Usage in Tailwind classes
'sm:text-lg md:text-xl lg:text-2xl'

// Breakpoint values
breakpoints.sm // 640px
breakpoints.md // 768px
breakpoints.lg // 1024px
```

### Responsive Components

Components automatically adapt to different screen sizes:

```typescript
<Button size="sm" className="sm:size-md lg:size-lg">
  Responsive Button
</Button>
```

## Best Practices

### Component Usage

1. **Use semantic HTML**: Always use appropriate HTML elements
2. **Provide labels**: All form inputs should have labels
3. **Handle loading states**: Show loading indicators for async operations
4. **Validate forms**: Provide clear validation feedback
5. **Support keyboard navigation**: Ensure all interactions work with keyboard

### Performance

1. **Use loading states**: Prevent layout shifts with skeletons
2. **Optimize animations**: Respect reduced motion preferences
3. **Lazy load**: Load components only when needed
4. **Cache tokens**: Reuse design tokens instead of hardcoding values

### Accessibility

1. **Test with screen readers**: Regularly test with assistive technology
2. **Check color contrast**: Ensure sufficient contrast ratios
3. **Provide alternative text**: All images should have alt text
4. **Use semantic markup**: Structure content with proper headings

## Migration Guide

### From Existing Components

Replace existing components gradually:

```typescript
// Before
import { Button } from '@/components/ui/button';

// After
import { Button } from '@/lib/design-system';
```

### Updating Styles

Use design tokens instead of hardcoded values:

```typescript
// Before
className="text-blue-500 p-4 rounded-lg"

// After
className="text-primary p-4 rounded-lg"
```

## Contributing

When adding new components:

1. Follow existing patterns and conventions
2. Include proper TypeScript types
3. Add accessibility features
4. Support both light and dark themes
5. Include comprehensive documentation
6. Add tests for critical functionality

## Version History

- **v1.0.0**: Initial design system implementation
  - Core design tokens
  - Enhanced components
  - Theme system
  - Accessibility features
  - Responsive design