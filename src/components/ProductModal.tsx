import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Product } from '../types';
import { LanguageContext } from '../App';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  color: { bg: string, text: string };
}

export default function ProductModal({ product, isOpen, onClose, color }: ProductModalProps) {
  const { lang } = useContext(LanguageContext);

  if (!product) return null;

  const getIcon = (iconName: string, productObj?: Product) => {
    if (
      iconName === 'Motorbike' || 
      productObj?.id === 'motorcycle' || 
      productObj?.nameKh?.includes('ម៉ូតូ') || 
      productObj?.nameEn?.toLowerCase().includes('motorcycle')
    ) {
      const MotoIcon = Icons.Motorbike || Icons.Bike;
      return <MotoIcon size={48} />;
    }
    const Icon = (Icons as any)[iconName] || Icons.Box;
    return <Icon size={48} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-[110] bg-white rounded-3xl p-6 shadow-2xl flex flex-col w-full max-w-sm mx-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <Icons.X size={18} strokeWidth={2.5} />
            </button>

            <div className={`w-24 h-24 rounded-3xl ${color.bg} flex items-center justify-center shrink-0 mb-6 mx-auto`}>
              <div className={color.text}>
                {getIcon(product.icon, product)}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              {lang === 'EN' ? product.nameEn : product.nameKh}
            </h3>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 max-h-[50vh] overflow-y-auto text-left">
              <div 
                className="text-gray-700 font-medium leading-relaxed text-sm prose prose-sm max-w-none [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:my-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:my-1.5 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:my-1 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2 [&_li]:my-0.5 [&_a]:text-red-600 [&_a]:underline [&_table]:w-full [&_table]:my-2 [&_table]:border-collapse [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-200/60 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_s]:line-through [&_s]:text-gray-400"
                dangerouslySetInnerHTML={{ __html: (lang === 'EN' ? product.descEn : product.descKh) || '' }}
              />
            </div>
            
            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm tracking-wide transition-colors"
            >
              {lang === 'EN' ? 'Close' : 'បិទ'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
