sed -i "s/saveApplications(newApps);/saveApplications(newApps);\n    toast.success('Status updated successfully');/" src/components/AdminDashboard.tsx
sed -i "s/saveApplications(applications.filter(app => app.id !== id));/saveApplications(applications.filter(app => app.id !== id));\n      toast.success('Application deleted');/" src/components/AdminDashboard.tsx
