sed -i "1i import { toast } from 'react-hot-toast';" src/components/AdminDashboard.tsx
sed -i "s/setApplications(applications.map(app => app.id === id ? { ...app, status } : app));/setApplications(applications.map(app => app.id === id ? { ...app, status } : app));\n    toast.success('Status updated successfully');/" src/components/AdminDashboard.tsx
sed -i "s/setApplications(applications.filter(app => app.id !== id));/setApplications(applications.filter(app => app.id !== id));\n      toast.success('Application deleted');/" src/components/AdminDashboard.tsx
sed -i "s/localStorage.setItem('app_settings', JSON.stringify(settings));/localStorage.setItem('app_settings', JSON.stringify(settings));\n    toast.success('Settings saved successfully');/" src/components/AdminDashboard.tsx
