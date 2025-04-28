
# Module Development Guide

This document provides guidelines and best practices for developing new modules for the neighborhood app.

## What is a Module?

A module is a self-contained feature that can be added to the neighborhood app. It typically consists of a main page and related components that serve a specific purpose, such as the Calendar, Skills, Goods, Safety, or Neighbors features.

## Module Structure

Each module should follow our standard pattern:

1. A main page component (e.g., `MyModulePage.tsx`)
2. Supporting components in a dedicated folder (e.g., `src/components/my-module/`)

## Using the Module System

### ModuleLayout Component

All module pages should use the `ModuleLayout` component as their root element:

```tsx
import ModuleLayout from "@/components/layout/ModuleLayout";

const MyModulePage = () => {
  return (
    <ModuleLayout
      title="My Module"
      themeColor="myModule" // Must be registered in moduleTheme.ts
      description="Description of what this module does for the community."
    >
      {/* Your module content here */}
    </ModuleLayout>
  );
};
```

### Module Registration

To register your module, add it to the `moduleThemeColors` and `coreModules` objects in `src/theme/moduleTheme.ts`:

1. Add the theme colors:
```ts
myModule: {
  primary: "#4CAF50", // Your module's primary color
  light: "#E8F5E9",
  variable: "--my-module-color", 
  lightVariable: "--my-module-light",
  icon: "Icon" // Lucide icon name
}
```

2. Add the module definition:
```ts
{
  id: 'myModule',
  name: 'My Module',
  description: 'Short description of the module',
  themeColor: 'myModule',
  path: '/my-module',
  icon: 'Icon',
  isEnabled: true
}
```

3. Add the CSS variables in `index.css`:
```css
--my-module-color: 142.1 76.2% 36.3%;
--my-module-light: 142.1 76.2% 96%;
```

### Styling Guidelines

1. **Consistent Layout**:
   - Use `ModuleLayout` for the page structure
   - Use `module-card` and `module-card-sm` classes for content cards
   - Follow the standardized spacing patterns (mt-4, mt-6, p-4, p-6)

2. **Theme Colors**:
   - Use the `ModuleButton` component for primary actions
   - Apply theme colors from your module's palette
   - Use `getModuleThemeColor()` to access theme colors programmatically

3. **Typography**:
   - Use standardized text classes (`heading-xl`, `heading-lg`, etc.)
   - Follow the established content hierarchy

## Testing Your Module

1. Test your module on different screen sizes to ensure responsive design
2. Verify that theme colors are applied consistently
3. Check for accessibility compliance

## Best Practices

1. Keep components small and focused
2. Use TypeScript for type safety
3. Follow the established pattern for state management
4. Implement proper loading and error states
5. Add thorough documentation
6. Use the provided utility components wherever possible

## Example Module

See `src/pages/CalendarPage.tsx` and related components for a well-structured example of a module implementation.
