/**
 * Shared Components
 * Reusable components used across the application
 */

// Layout
export { default as Header } from './layout/Header';

// Error Handling
export { ErrorBoundary } from './error-boundary';

// Loading States
export { Loading, LoadingSpinner } from './loading';

// UI Components (re-export from ui folder)
export * from './ui/button';
export * from './ui/card';
export * from './ui/input';
export * from './ui/label';
export * from './ui/dialog';
export * from './ui/tabs';
export * from './ui/table';
export * from './ui/avatar';
