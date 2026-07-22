sed -i 's/<a href={`tel/${"<motion.a initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} href={`tel"}/' src/components/Contact.tsx
sed -i 's/<\/a>/<\/motion.a>/g' src/components/Contact.tsx
sed -i 's/<a href={`mailto/${"<motion.a initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} href={`mailto"}/' src/components/Contact.tsx
sed -i 's/<a href={settings.contactLiveChatUrl}/${"<motion.a initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} href={settings.contactLiveChatUrl}"}/' src/components/Contact.tsx
sed -i 's/<a href={settings.contactBranchUrl}/${"<motion.a initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} href={settings.contactBranchUrl}"}/' src/components/Contact.tsx
