import { index, route,type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/auth', 'routes/auth.tsx'),
  route('/upload', 'routes/upload.tsx'),
  route('/dashboard', 'routes/dashboard.tsx'),
  route('/cv/:id', 'routes/cv.tsx'),
] satisfies RouteConfig;
