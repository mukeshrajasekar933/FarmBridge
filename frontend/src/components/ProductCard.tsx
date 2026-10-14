import React from 'react';
import {
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  MapPin,
  Check
} from 'lucide-react';
import { Product } from '../types';
import { Language, translations } from '../i18n/translations';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void;
  cartQuantity?: number;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  onSelectProduct,
  onAddToCart,
  onUpdateCartQuantity,
  cartQuantity = 0,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const t = translations[lang];
  const isOutOfStock = product.available_quantity <= 0 || product.status === 'sold_out';
  const isPaused = product.status === 'paused';

  const defaultImg =
    product.image_paths && product.image_paths.length > 0
      ? product.image_paths[0]
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop';

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group relative rounded-2xl bg-white border border-[#E2ECE0] hover:border-[#2C7248]/50 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(36,92,58,0.12)] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Compact Image Container */}
      <div className="relative w-full h-40 sm:h-44 overflow-hidden bg-[#F4F8F2] shrink-0">
        <img 
          src={defaultImg} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop';
          }}
        />
        
        {/* Subtle Gradient Shade at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none z-10">
          {product.distance_km !== undefined ? (
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[9px] font-bold tracking-wide border border-white/20 flex items-center gap-1 shadow-xs">
              <MapPin className="w-2.5 h-2.5 text-[#85C85A]" />
              {product.distance_km < 1 ? '< 1 km' : `${product.distance_km.toFixed(1)} km`}
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[9px] font-bold tracking-wide border border-white/20 shadow-xs">
              📍 Pollachi
            </span>
          )}

          {isOutOfStock || isPaused ? (
            <span className="px-2 py-0.5 bg-rose-600/90 backdrop-blur-md rounded-full text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs self-start">
              {isPaused ? 'Paused' : 'Sold Out'}
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-emerald-700/80 backdrop-blur-md rounded-full text-white text-[8.5px] font-bold tracking-wide shadow-xs self-start">
              ● Fresh Harvest
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-auto">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product.id); }}
            className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer ${
              isWishlisted 
                ? 'bg-rose-500 text-white shadow-rose-500/30' 
                : 'bg-white/80 hover:bg-white text-gray-600 hover:text-rose-500 hover:scale-105'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Compact Info Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-white">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2C7248] truncate mb-0.5">
            {product.farm_name || 'Pollachi Family Farm'}
          </div>
          <h3 className="text-xs sm:text-[13px] font-bold text-[#1B221C] group-hover:text-[#245C3A] transition-colors line-clamp-1 leading-snug">
            {lang === 'ta' && product.name_ta ? product.name_ta : product.name}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0F5EE]">
          <div className="leading-tight">
            <span className="text-sm font-black text-[#1B221C]">
              ₹{product.price}
            </span>
            <span className="text-[10.5px] font-medium text-[#7A8879] ml-0.5">
              /{product.unit}
            </span>
          </div>

          <div>
            {isOutOfStock || isPaused ? (
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                Unavailable
              </span>
            ) : cartQuantity > 0 ? (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 bg-[#F4F8F2] border border-[#CDE0C9] rounded-xl px-1 py-0.5 shadow-2xs"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cartQuantity === 1) onUpdateCartQuantity?.(product.id, 0);
                    else onUpdateCartQuantity?.(product.id, cartQuantity - 1);
                  }}
                  className="w-6 h-6 rounded-lg bg-white text-[#245C3A] flex items-center justify-center hover:bg-[#EAF3E7] transition-colors cursor-pointer shadow-2xs"
                  title="Reduce quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="min-w-4 text-center font-black text-xs text-[#1B221C]">
                  {cartQuantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateCartQuantity?.(product.id, cartQuantity + 1);
                  }}
                  className="w-6 h-6 rounded-lg bg-[#245C3A] text-white flex items-center justify-center hover:bg-[#1E5233] transition-colors cursor-pointer shadow-2xs"
                  title="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product.id, product.minimum_order_quantity || 1);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E8F2E5] text-[#245C3A] hover:bg-[#245C3A] hover:text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                title="Add produce to basket"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
