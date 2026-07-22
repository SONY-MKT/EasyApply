import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { LanguageContext, AppSettingsContext } from '../App';
import { Product } from '../types';
import ProductModal from './ProductModal';

export default function Promotions() {
  const { lang } = useContext(LanguageContext);
  const { settings } = useContext(AppSettingsContext);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState({ bg: '', text: '' });
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const promoImages = settings.promoImages || [];

  useEffect(() => {
    if (promoImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promoImages.length]);

  const getIcon = (iconName: string, product?: Product) => {
    if (
      iconName === 'Motorbike' || 
      product?.id === 'motorcycle' || 
      product?.nameKh?.includes('ម៉ូតូ') || 
      product?.nameEn?.toLowerCase().includes('motorcycle')
    ) {
      const MotoIcon = Icons.Motorbike || Icons.Bike;
      return <MotoIcon size={24} />;
    }
    const Icon = (Icons as any)[iconName] || Icons.Box;
    return <Icon size={24} />;
  };

  const colors = [
    { bg: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-green-50', text: 'text-green-600' },
    { bg: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'bg-orange-50', text: 'text-orange-600' },
    { bg: 'bg-pink-50', text: 'text-pink-600' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 pb-8"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{lang === 'EN' ? 'Promotions' : 'ប្រូម៉ូសិន'}</h2>
        <p className="text-sm text-gray-500 mt-1">{lang === 'EN' ? 'Special offers just for you.' : 'ការផ្តល់ជូនពិសេសសម្រាប់តែអ្នកប៉ុណ្ណោះ។'}</p>
      </div>

      {/* Featured Promotion Slideshow */}
      <div className="rounded-3xl shadow-lg relative overflow-hidden mb-8 h-48 bg-gray-100">
        <AnimatePresence initial={false}>
          {promoImages.length > 0 && (
            <motion.img
              key={currentSlide}
              src={promoImages[currentSlide]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Promotion Banner"
            />
          )}
        </AnimatePresence>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 right-5 z-20 flex gap-1.5">
          {promoImages.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-4 bg-red-500' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Loan Types */}
      <div className="space-y-4 pt-2">
        <h3 className="font-bold text-gray-900 text-lg px-1">{lang === 'EN' ? 'Products' : 'ផលិតផល'}</h3>
        
        {settings.products?.map((product: Product, index: number) => {
          const color = colors[index % colors.length];
          return (
            <button 
              key={product.id} 
              onClick={() => {
                setSelectedProduct(product);
                setSelectedColor(color);
                setIsModalOpen(true);
              }}
              className="group w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md flex items-center justify-between transition-all active:scale-[0.98]"
            >
              <div className="flex gap-4 items-center text-left">
                <div className={`w-14 h-14 rounded-2xl ${color.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                  <div className={color.text}>
                    {getIcon(product.icon, product)}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base mb-0.5">{lang === 'EN' ? product.nameEn : product.nameKh}</h4>
                  <p className="text-sm text-gray-500 font-medium line-clamp-1">
                    {((lang === 'EN' ? product.descEn : product.descKh) || '').replace(/<[^>]*>?/gm, '')}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                <Icons.ChevronRight size={18} className="text-gray-400 group-hover:text-red-500" />
              </div>
            </button>
          );
        })}
      </div>
      
      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        color={selectedColor}
      />
    </motion.div>
  );
}
