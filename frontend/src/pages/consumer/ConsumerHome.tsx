import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, ArrowRight, Heart, ShoppingBag, Leaf, 
  ChevronRight, Star, ShieldCheck, Sprout, TrendingUp,
  Package, Users, Store, Play, Menu
} from 'lucide-react';
import { Product, Category, Farm } from '../../types';
import { Language } from '../../i18n/translations';
import { LocationState } from '../../components/LocationSelectorModal';

// --- Types ---
interface ConsumerHomeProps {
  products: Product[];
  categories: Category[];
  farms: Farm[];
  activeLocation: LocationState;
  onOpenLocationModal: () => void;
  lang: Language;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void;
  cartItemQuantities?: Record<string, number>;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
  onNavigateToCatalogue: (categoryId?: string) => void;
  onNavigateToNearbyFarms: () => void;
  onSelectFarm?: (farmId: string) => void;
  currentProfile?: any;
  onOpenAuthModal?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  onNavigateToProfile?: () => void;
}

export const ConsumerHome: React.FC<ConsumerHomeProps> = ({
  products,
  categories,
  farms,
  activeLocation,
  onOpenLocationModal,
  lang,
  onSelectProduct,
  onAddToCart,
  onUpdateCartQuantity,
  cartItemQuantities = {},
  wishlistIds = [],
  onToggleWishlist,
  onNavigateToCatalogue,
  onNavigateToNearbyFarms,
  onSelectFarm,
  currentProfile,
  onOpenAuthModal,
  onOpenCart,
  cartCount = 0,
  onNavigateToProfile,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const prevScrollPos = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrolled(currentScroll > 40);

      // Hide on scroll down, show on scroll up
      if (currentScroll < 60) {
        setNavVisible(true);
      } else if (currentScroll > prevScrollPos.current + 8) {
        setNavVisible(false);
      } else if (currentScroll < prevScrollPos.current - 8) {
        setNavVisible(true);
      }
      prevScrollPos.current = currentScroll;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Deduplicate products so no repeated produce is displayed
  const uniqueProducts = Array.from(
    new Map(products.filter((p) => p.status === 'active').map((p) => [p.name, p])).values()
  );
  const featuredProducts = uniqueProducts.slice(0, 8);
  const featuredFarms = farms.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F8F8F2] font-sans selection:bg-[#75A85A]/30 selection:text-[#1F6B45] overflow-x-hidden">
      
      {/* --- FLOATING LIQUID GLASS NAVIGATION --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          navVisible ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0 pointer-events-none'
        } ${scrolled ? 'py-2.5' : 'py-4 sm:py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          <div 
            className={`flex items-center justify-between mx-auto transition-all duration-300 ease-out bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,107,69,0.12)] ring-1 ring-[#245C3A]/5 ${
              scrolled ? 'rounded-2xl px-5 py-2.5 max-w-5xl' : 'rounded-3xl px-6 sm:px-8 py-3.5 max-w-7xl'
            }`}
          >
            {/* Logo */}
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/logo.png" alt="FarmBridge Logo" className="w-8 h-8 rounded-xl object-cover shadow-md shadow-[#245C3A]/20 group-hover:scale-105 transition-transform duration-300" />
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#202820]">
                Farm<span className="text-[#2C7248]">Bridge</span>
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[13px] font-bold text-[#1F6B45] bg-[#E8F2E5] px-3 py-1 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs">
                <span>Home</span>
              </button>
              <button onClick={() => onNavigateToCatalogue()} className="text-[13px] font-bold text-[#202820] hover:text-[#367B4B] transition-colors">Marketplace</button>
              <button onClick={() => onNavigateToNearbyFarms()} className="text-[13px] font-bold text-[#202820] hover:text-[#367B4B] transition-colors">Nearby Farms</button>
              <a href="http://localhost:5000" target="_blank" rel="noreferrer" className="text-[13px] font-bold text-[#245C3A] bg-[#EAF3E7] hover:bg-[#D4E8CF] px-3 py-1 rounded-xl flex items-center gap-1.5 transition-colors border border-[#C4DFC0]">
                <span>🚜</span>
                <span>Farmer Portal</span>
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={onOpenLocationModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F8F2] hover:bg-[#E8F2E5] transition-colors text-xs font-semibold text-[#367B4B] border border-[#DDE8DA]"
                title="Your active delivery location"
              >
                <MapPin className="w-3.5 h-3.5 text-[#2C7248]" />
                <span className="truncate max-w-[120px]">{activeLocation.label.split(',')[0]}</span>
              </button>
              
              <button onClick={() => onNavigateToCatalogue()} className="w-9 h-9 rounded-xl hover:bg-[#F4F8F2] flex items-center justify-center transition-colors text-[#202820]" title="Search produce">
                <Search className="w-4 h-4" />
              </button>
              
              <button 
                onClick={onOpenCart}
                className="w-9 h-9 rounded-xl bg-[#F8F8F2] hover:bg-[#EAF3E7] flex items-center justify-center transition-colors text-[#202820] relative cursor-pointer"
                title="View cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#245C3A] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => currentProfile && onNavigateToProfile ? onNavigateToProfile() : onOpenAuthModal?.()}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202820] text-white text-xs font-bold hover:bg-[#245C3A] hover:shadow-lg hover:shadow-[#245C3A]/20 transition-all duration-300 cursor-pointer"
              >
                {currentProfile ? currentProfile.display_name : 'Profile'}
                <div className="w-1.5 h-1.5 rounded-full bg-[#75A85A]"></div>
              </button>
              
              <button className="md:hidden w-10 h-10 rounded-xl hover:bg-[#F8F8F2] flex items-center justify-center text-[#202820]">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative w-screen min-h-[92vh] flex items-center justify-center pt-36 sm:pt-40 lg:pt-44 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#245C3A]">
        {/* Cinematic Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02] transform transition-transform duration-[20s] ease-linear hover:scale-110"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2670&auto=format&fit=crop')", // Lush Indian agricultural fields
          }}
        />
        
        {/* Soft Green Overlays for text readability while preserving the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#202820]/90 via-[#245C3A]/60 to-[#245C3A]/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F6B45]/60 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#245C3A]/40 to-transparent" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl w-full mx-auto grid lg:grid-cols-12 gap-12 items-center pb-8">
          
          {/* Typography side */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.05]">
              FROM FARM
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#75A85A] to-[#F8F8F2]">DIRECTLY</span>
              <br />
              TO YOU.
            </h1>
            
            <p className="text-lg sm:text-xl text-[#F8F8F2]/90 font-medium max-w-xl leading-relaxed">
              Fresh produce. Trusted farmers. One connected marketplace bringing the finest harvest of Pollachi straight to your table.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={() => onNavigateToCatalogue()}
                className="group relative px-8 py-4 bg-white text-[#202820] rounded-full font-bold text-sm overflow-hidden flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02] active:scale-95"
              >
                <div className="absolute inset-0 bg-[#F8F8F2] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Explore Marketplace</span>
                <div className="relative z-10 w-8 h-8 rounded-full bg-[#EAF3E7] flex items-center justify-center group-hover:bg-[#245C3A] group-hover:text-white transition-colors duration-300">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
              
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-3">
                  <img src="/images/farmer-avatar-1.jpg" className="w-10 h-10 rounded-full border-2 border-[#202820] object-cover shadow-sm" alt="Farmer avatar" />
                  <img src="https://images.unsplash.com/photo-1560416313-414b33c856a9?w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-[#202820] object-cover shadow-sm" alt="Farmer avatar" />
                  <div className="w-10 h-10 rounded-full border-2 border-[#202820] bg-[#367B4B] flex items-center justify-center text-white text-[10px] font-bold">
                    +2.4k
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-white text-xs font-bold leading-none">2,400+ Farmers</p>
                  <p className="text-emerald-300/80 text-[10px] uppercase tracking-wider leading-none">18,000+ Products</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Clean Free Floating Farmer Image */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 pt-6">
            <div className="relative group p-3 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-2">
              <div className="w-full max-w-[360px] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-inner">
                <img 
                  src="/hero-farmer.png" 
                  alt="Village Farmer with Basket" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
            {/* THOPPUKARAN below the image */}
            <div className="mt-5 text-center relative z-20">
              <h2 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#75A85A] to-[#F8F8F2] tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] uppercase">
                THOPPUKARAN SRI
              </h2>
            </div>
          </div>
        </div>

        {/* Organic curved mask at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 1440 100" className="absolute bottom-0 w-full h-full preserve-3d" preserveAspectRatio="none">
            <path 
              d="M0,100 C240,100 480,20 720,20 C960,20 1200,100 1440,100 L1440,100 L0,100 Z" 
              fill="#F8F8F2" 
            />
          </svg>
        </div>
      </section>

      {/* --- LIVE MARKET ACTIVITY --- */}
      <section className="bg-[#F8F8F2] pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-[#245C3A]/10 pb-12">
            
            <div className="flex-1 w-full grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#778177] uppercase tracking-widest">Today</p>
                <p className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter">2,482</p>
                <p className="text-xs font-semibold text-[#367B4B]">FARMERS</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#778177] uppercase tracking-widest">Active</p>
                <p className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter">18k+</p>
                <p className="text-xs font-semibold text-[#367B4B]">PRODUCTS</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#778177] uppercase tracking-widest">Delivered</p>
                <p className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter">94k</p>
                <p className="text-xs font-semibold text-[#367B4B]">ORDERS</p>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-white p-5 rounded-3xl border border-[#245C3A]/10 shadow-[0_4px_20px_rgb(36,92,58,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAF3E7] rounded-full blur-2xl opacity-50" />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="w-2 h-2 rounded-full bg-[#367B4B] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#245C3A]">Live Market</span>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 text-xs font-medium text-[#202820]">
                  <div className="w-6 h-6 rounded-full bg-[#EAF3E7] flex items-center justify-center">🍅</div>
                  <p>12kg Fresh tomatoes added</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-[#202820]">
                  <div className="w-6 h-6 rounded-full bg-[#EAF3E7] flex items-center justify-center">👨‍🌾</div>
                  <p>New organic farm verified</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-[#202820]">
                  <div className="w-6 h-6 rounded-full bg-[#EAF3E7] flex items-center justify-center">📦</div>
                  <p>24 orders dispatched in Anaimalai</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- MARKETPLACE EDITORIAL SECTION --- */}
      <section className="bg-[#F8F8F2] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter leading-none">
                FRESH
                <br />
                <span className="text-[#367B4B]">FROM NEARBY FARMS</span>
              </h2>
            </div>
            
            {/* Elegant Pill Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-5 py-2.5 rounded-full bg-[#202820] text-white text-xs font-bold shadow-lg shadow-[#202820]/10 transition-transform active:scale-95">
                All Fresh
              </button>
              <button className="px-5 py-2.5 rounded-full bg-white border border-[#245C3A]/10 text-[#202820] text-xs font-bold hover:bg-[#EAF3E7] hover:border-[#75A85A]/30 transition-all">
                Organic Only
              </button>
              <button className="px-5 py-2.5 rounded-full bg-white border border-[#245C3A]/10 text-[#202820] text-xs font-bold hover:bg-[#EAF3E7] hover:border-[#75A85A]/30 transition-all">
                Vegetables
              </button>
              <button className="px-5 py-2.5 rounded-full bg-white border border-[#245C3A]/10 text-[#202820] text-xs font-bold hover:bg-[#EAF3E7] hover:border-[#75A85A]/30 transition-all flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#367B4B]" /> {activeLocation.label.split(',')[0]}
              </button>
            </div>
          </div>

          {/* Compact Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featuredProducts.map((prod) => {
              const imgUrl = prod.image_paths?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop';
              const inCart = (cartItemQuantities[prod.id] || 0) > 0;

              return (
                <div 
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="group relative rounded-2xl sm:rounded-3xl bg-white border border-[#E2ECE0] hover:border-[#2C7248]/50 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(36,92,58,0.12)] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                >
                  {/* Compact Image Container */}
                  <div className="relative w-full h-40 sm:h-44 overflow-hidden bg-[#F4F8F2] shrink-0">
                    <img 
                      src={imgUrl} 
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none z-10">
                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[9px] font-bold tracking-wide border border-white/20 flex items-center gap-1 shadow-xs">
                        <MapPin className="w-2.5 h-2.5 text-[#85C85A]" />
                        {(prod.distance_km || 2.4).toFixed(1)} km
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-10 pointer-events-auto">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(prod.id); }}
                        className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer ${
                          wishlistIds.includes(prod.id)
                            ? 'bg-rose-500 text-white shadow-rose-500/30'
                            : 'bg-white/80 hover:bg-white text-gray-600 hover:text-rose-500 hover:scale-105'
                        }`}
                        title="Add to Wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${wishlistIds.includes(prod.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Compact Info Section */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-2 bg-white">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2C7248] truncate mb-0.5">
                        {prod.farm_name || 'Pollachi Farm'}
                      </div>
                      <h3 className="text-xs sm:text-[13px] font-bold text-[#1B221C] group-hover:text-[#245C3A] transition-colors line-clamp-1 leading-snug">
                        {prod.name}
                      </h3>
                    </div>

                    {/* Price & Action Row */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0F5EE]">
                      <div className="leading-tight">
                        <span className="text-sm font-black text-[#1B221C]">₹{prod.price}</span>
                        <span className="text-[10.5px] font-medium text-[#7A8879] ml-0.5">/{prod.unit}</span>
                      </div>

                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inCart && onUpdateCartQuantity) {
                            onUpdateCartQuantity(prod.id, (cartItemQuantities[prod.id] || 0) + 1);
                          } else {
                            onAddToCart(prod.id, 1);
                          }
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer ${
                          inCart
                            ? 'bg-[#245C3A] text-white'
                            : 'bg-[#E8F2E5] text-[#245C3A] hover:bg-[#245C3A] hover:text-white'
                        }`}
                        title="Add to basket"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>{inCart ? `${cartItemQuantities[prod.id]} in cart` : '+ Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- COMPACT FARMER DISCOVERY --- */}
      <section className="bg-[#1E251E] text-white py-12 sm:py-14 rounded-3xl mx-3 sm:mx-6 lg:mx-8 mb-16 relative overflow-hidden shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#245C3A]/20 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative z-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#75A85A]">
                100% Direct From Verified Growers
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none mt-1">
                MEET THE PEOPLE <span className="text-[#75A85A]">BEHIND YOUR FOOD.</span>
              </h2>
            </div>
            <button 
              onClick={() => onNavigateToNearbyFarms()}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>View verified farm directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compact Farmer Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
            {featuredFarms.slice(0, 2).map((farm, idx) => {
              const farmNameLower = (farm.farm_name || '').toLowerCase();
              const farmImg = farmNameLower.includes('thennam') || farmNameLower.includes('coconut') || farmNameLower.includes('thoppu')
                ? '/images/farm-thennam-thoppu.jpg'
                : '/images/farm-anaimalai-valley.jpg';

              const farmerName = farmNameLower.includes('thennam')
                ? 'Murugan Palanisamy'
                : 'Lakshmi Ramasamy';

              return (
                <div 
                  key={farm.id} 
                  className="h-56 sm:h-64 rounded-2xl overflow-hidden relative group cursor-pointer border border-white/10 shadow-lg hover:border-[#75A85A]/50 transition-all duration-300"
                  onClick={() => onSelectFarm?.(farm.id)}
                >
                  <img 
                    src={farmImg} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    alt={farm.farm_name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/farm-thennam-thoppu.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[9.5px] font-extrabold uppercase tracking-wider border border-white/20 shadow-xs">
                      ● 100% Direct Farm
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{farmerName}</h3>
                      <p className="text-[#85C85A] text-xs font-bold">{farm.farm_name}</p>
                      <p className="text-gray-300 text-[11px] mt-0.5">{farm.region || 'Pollachi, Tamil Nadu'}</p>
                    </div>

                    <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-1 rounded-xl border border-white/20 text-xs font-bold text-white">
                      <Star className="w-3.5 h-3.5 text-[#E7A83E] fill-[#E7A83E]" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FARM-TO-CUSTOMER STORY --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-[10px] font-black text-[#75A85A] uppercase tracking-widest">The Process</span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter">
              Morning Harvest to Your Table.
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#EAF3E7] via-[#245C3A] to-[#EAF3E7] -translate-y-1/2 opacity-30" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              
              <div className="space-y-6 text-center group">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#F8F8F2] overflow-hidden border-4 border-white shadow-xl relative transition-transform duration-500 group-hover:-translate-y-4">
                  <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Farm"/>
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#202820] mb-2">1. Farm</h3>
                  <p className="text-sm text-[#778177] px-4">Local growers nurture crops using traditional methods.</p>
                </div>
              </div>

              <div className="space-y-6 text-center group md:mt-12">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#F8F8F2] overflow-hidden border-4 border-white shadow-xl relative transition-transform duration-500 group-hover:-translate-y-4">
                  <img src="/images/harvest-dawn.jpg" className="w-full h-full object-cover" alt="Harvest" />
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#202820] mb-2">2. Harvest</h3>
                  <p className="text-sm text-[#778177] px-4">Plucked at dawn when flavor and nutrients peak.</p>
                </div>
              </div>

              <div className="space-y-6 text-center group">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#F8F8F2] overflow-hidden border-4 border-white shadow-xl relative transition-transform duration-500 group-hover:-translate-y-4">
                  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Order" />
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#202820] mb-2">3. Ordered</h3>
                  <p className="text-sm text-[#778177] px-4">You purchase directly via our marketplace.</p>
                </div>
              </div>

              <div className="space-y-6 text-center group md:mt-12">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#F8F8F2] overflow-hidden border-4 border-white shadow-xl relative transition-transform duration-500 group-hover:-translate-y-4">
                  <img src="https://images.unsplash.com/photo-1628102491629-778571d893a3?w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Delivery" />
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#202820] mb-2">4. Delivered</h3>
                  <p className="text-sm text-[#778177] px-4">Fresh to your door the very same morning.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- FARM MAP EXPERIENCE --- */}
      <section className="bg-[#F8F8F2] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-[#245C3A]/5 border border-[#245C3A]/10 grid lg:grid-cols-2 min-h-[600px]">
            
            <div className="p-12 lg:p-20 flex flex-col justify-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAF3E7] rounded-full blur-[60px] opacity-60 pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter leading-none">
                  FARMS
                  <br />
                  <span className="text-[#367B4B]">AROUND YOU.</span>
                </h2>
                <p className="text-base text-[#778177] max-w-sm">
                  Discover exactly where your food comes from. We map every verified farm so you can buy hyper-local.
                </p>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-4 bg-[#F8F8F2] p-4 rounded-2xl border border-[#E5E9E1]">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-xl">🍅</div>
                  <div>
                    <p className="text-xs text-[#778177] font-semibold">Closest Farm</p>
                    <p className="text-sm font-bold text-[#202820]">Murugan Grove · 2.4 km</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-[#F8F8F2] p-4 rounded-2xl border border-[#E5E9E1]">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-xl">🥥</div>
                  <div>
                    <p className="text-xs text-[#778177] font-semibold">Tender Coconuts</p>
                    <p className="text-sm font-bold text-[#202820]">Anaimalai Farms · 5.1 km</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenLocationModal}
                  className="px-6 py-3.5 bg-[#245C3A] hover:bg-[#1E5233] text-white rounded-full font-bold text-xs shadow-md shadow-[#245C3A]/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="text-sm">📍</span>
                  <span>Locate Me</span>
                </button>
                <button 
                  type="button"
                  onClick={onNavigateToNearbyFarms}
                  className="px-6 py-3.5 bg-[#202820] text-white rounded-full font-bold text-xs hover:bg-[#245C3A] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" /> Open Full Map
                </button>
              </div>
            </div>

            {/* Clear Roadmap View with Live Location */}
            <div className="bg-gray-100 relative overflow-hidden min-h-[400px] lg:min-h-full">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0, minHeight: '400px', height: '100%' }} 
                src={`https://maps.google.com/maps?q=${activeLocation.latitude || 10.6609},${activeLocation.longitude || 77.0048}&z=13&ie=UTF8&iwloc=&output=embed`} 
                allowFullScreen
                title="Map of Pollachi Farms"
              ></iframe>
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1B221C] border border-[#DDE8DA] flex items-center gap-2 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-[#245C3A] animate-pulse"></span>
                <span>📍 Location: {activeLocation.label.split(',')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE SECTION --- */}
      <section className="bg-white py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 max-w-lg">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF3E7] flex items-center justify-center">
                <Store className="w-8 h-8 text-[#245C3A]" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter leading-tight">
                Direct From Farm. <br/><span className="text-[#367B4B]">No Middlemen.</span>
              </h2>
              <p className="text-lg text-[#778177] leading-relaxed">
                By purchasing directly from verified growers, you ensure farmers keep 100% of the produce value while you get fresher food at better prices.
              </p>
              <button className="px-6 py-3 rounded-full border-2 border-[#202820] font-bold text-sm hover:bg-[#202820] hover:text-white transition-colors">
                Learn our model
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#EAF3E7] rounded-[3rem] translate-x-4 translate-y-4 -z-10" />
              <img src="/images/direct-from-farm.jpg" className="rounded-[3rem] w-full object-cover aspect-square shadow-2xl" alt="Direct from farm" />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-[#F8F8F2] rounded-[3rem] -translate-x-4 translate-y-4 -z-10" />
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop" className="rounded-[3rem] w-full object-cover aspect-square shadow-2xl" alt="Harvested today" />
            </div>
            <div className="order-1 lg:order-2 space-y-6 max-w-lg lg:ml-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#F8F8F2] flex items-center justify-center">
                <Leaf className="w-8 h-8 text-[#245C3A]" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter leading-tight">
                Harvested Today. <br/><span className="text-[#367B4B]">Eaten Today.</span>
              </h2>
              <p className="text-lg text-[#778177] leading-relaxed">
                Our platform syncs with morning harvests. Order by 8 PM, and farmers will pluck your produce at dawn for delivery within hours.
              </p>
              <button className="px-6 py-3 rounded-full border-2 border-[#202820] font-bold text-sm hover:bg-[#202820] hover:text-white transition-colors">
                View delivery times
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* --- TRUST SECTION --- */}
      <section className="bg-[#245C3A] text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#367B4B]/50 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center divide-x divide-white/10">
            <div className="space-y-3 px-4">
              <ShieldCheck className="w-8 h-8 mx-auto text-[#75A85A]" />
              <h3 className="font-bold text-lg">Verified Farmers</h3>
              <p className="text-xs text-emerald-100/70">100% physically vetted</p>
            </div>
            <div className="space-y-3 px-4">
              <Store className="w-8 h-8 mx-auto text-[#75A85A]" />
              <h3 className="font-bold text-lg">Transparent Pricing</h3>
              <p className="text-xs text-emerald-100/70">Uzhavar Sandhai rates</p>
            </div>
            <div className="space-y-3 px-4">
              <Leaf className="w-8 h-8 mx-auto text-[#75A85A]" />
              <h3 className="font-bold text-lg">Fresh Guarantee</h3>
              <p className="text-xs text-emerald-100/70">Plucked same morning</p>
            </div>
            <div className="space-y-3 px-4">
              <MapPin className="w-8 h-8 mx-auto text-[#75A85A]" />
              <h3 className="font-bold text-lg">Hyper Local</h3>
              <p className="text-xs text-emerald-100/70">Sourced within 20km</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- BIG FOOTER --- */}
      <footer className="bg-[#202820] pt-32 pb-12 border-t border-white/10 rounded-t-[3rem] mt-2 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 mb-24">
            <div>
              <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-6">
                Growing a<br/>
                <span className="text-[#75A85A]">better way</span><br/>
                to connect.
              </h2>
              <p className="text-emerald-100/60 max-w-sm font-medium">
                FarmBridge is the next-generation digital marketplace connecting you directly to local agricultural heritage.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 lg:ml-auto text-sm">
              <div className="space-y-6">
                <h4 className="font-bold text-white uppercase tracking-widest text-xs">Platform</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Marketplace</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Farmers</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">How it works</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">AI Pricing</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-bold text-white uppercase tracking-widest text-xs">Company</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <Leaf className="w-5 h-5 text-[#75A85A]" /> FarmBridge
            </div>
            <p className="text-xs text-emerald-100/50">
              © {new Date().getFullYear()} FarmBridge Technology. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
    </div>
  );
};
