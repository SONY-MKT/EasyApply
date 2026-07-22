sed -i "1i import { Toaster } from 'react-hot-toast';" src/App.tsx
sed -i "s/import { motion, AnimatePresence }/import { motion, AnimatePresence } from 'motion\/react';/g" src/App.tsx
