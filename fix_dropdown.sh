sed -i 's/<div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">/<button type="button" onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1">/g' src/components/AdminDashboard.tsx
sed -i 's/{getStatusBadge(value)}/{getStatusBadge(value)}\n        <ChevronDown size={14} className="text-gray-500" \/>/g' src/components/AdminDashboard.tsx
sed -i 's/<\/div>\n      {isOpen && (/<\/button>\n      {isOpen && (/g' src/components/AdminDashboard.tsx
