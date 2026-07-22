sed -i "1i import { toast } from 'react-hot-toast';" src/components/Profile.tsx
sed -i "s/localStorage.clear();/localStorage.clear();\n    toast.success(lang === 'EN' ? 'Data cleared' : '\u1791\u17b7\u1793\u17d2\u1793\u1793\u17d0\u1799\u178f\u17d2\u179a\u17bc\u179c\u1794\u17b6\u1793\u179b\u17bb\u1794');/" src/components/Profile.tsx
sed -i "s/onNavigate('home');/onNavigate('home');\n    toast.success(lang === 'EN' ? 'Logged out' : '\u1794\u17b6\u1793\u1785\u17c1\u1789\u1796\u17b8\u1782\u1793\u178e\u17b8');/" src/components/Profile.tsx
