import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PRODUCTS as FALLBACK_PRODUCTS } from './constants';
import md5 from 'blueimp-md5';

// Lazy Load Heavy Components to split bundle
const UserHub = React.lazy(() => import('./components/UserHub').then(module => ({ default: module.UserHub })));
const ProductPage = React.lazy(() => import('./components/ProductPage').then(module => ({ default: module.ProductPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));

// Regular imports for lightweight components
import { SizeGuide } from './components/SizeGuide';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CartDrawer } from './components/CartDrawer';
// Import new modal
import { CategoryPage } from './components/CategoryPage';
import { IconRuler, IconHeart, IconSearch, IconArrowRight, IconSpinner, IconCrown } from './components/Icons';
import { Product, User, CartItem } from './types';
import { supabase } from './services/supabase';
import { productService } from './services/products';
import { WhatsAppButton } from './components/WhatsAppButton';
import { BackToTop } from './components/BackToTop';
import { BrandNike, BrandPuma, BrandUmbro, BrandJoma } from './components/BrandLogos';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';

type ViewState = 'home' | 'hub' | 'category' | 'product' | 'checkout';
type HubTab = 'wishlist' | 'tracking' | 'profile';

const App: React.FC = () => {
    // Navigation State
    const [currentView, setCurrentView] = useState<ViewState>('home');
    const [activeHubTab, setActiveHubTab] = useState<HubTab>('tracking');
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Context Hooks
    const { user, loading: authLoading, signOut } = useAuth();
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal
    } = useCart();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);

    // Video State



    // Video State
    const videoRef = useRef<HTMLVideoElement>(null);
    const mobileVideoRef = useRef<HTMLVideoElement>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const [loginMessage, setLoginMessage] = useState('');

    // UI States
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Persisted States (Wishlist only now)
    const [wishlist, setWishlist] = useState<number[]>(() => {
        try {
            const saved = localStorage.getItem('bdv_wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // --- 0. FORCE VIDEO AUTOPLAY & FADE IN ---
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.defaultMuted = true;
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => { });
        }
        if (mobileVideoRef.current) {
            mobileVideoRef.current.play().catch(() => { });
        }
    }, []);

    // --- 1. FETCH PRODUCTS ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await productService.getProducts();
                setProducts(fetchedProducts);
                localStorage.setItem('bdv_last_sync', Date.now().toString());
            } catch (err) {
                setProducts(FALLBACK_PRODUCTS);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        fetchProducts();

        const syncInterval = setInterval(() => {
            const lastSync = localStorage.getItem('bdv_last_sync');
            const now = Date.now();
            if (!lastSync || (now - parseInt(lastSync) > 12 * 60 * 60 * 1000)) {
                fetchProducts();
            }
        }, 60 * 60 * 1000);

        const channel = supabase
            .channel('products-realtime')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
                const mappedProduct = productService.mapDatabaseProductToFrontend(payload.new as any);
                setProducts(prev => prev.map(p => p.id === mappedProduct.id ? mappedProduct : p));
                setSelectedProduct(prev => prev && prev.id === mappedProduct.id ? mappedProduct : prev);
            }
            ).subscribe();

        return () => {
            clearInterval(syncInterval);
            supabase.removeChannel(channel);
        };
    }, []);

    // --- 1.5. SORT HIGHLIGHTS ---
    const displayedProducts = React.useMemo(() => {
        if (!products.length) return [];

        const highlightNames = [
            'Umbro Pro 5 Bump Futsal',
            'Nike Zoom Mercurial Vapor 16 Elite MBAPPE',
            'Society Nike Phantom 6 Reactx Pro',
            'Umbro Pro 5 Stable'
        ];

        const highlights: Product[] = [];
        const others: Product[] = [];

        products.forEach(p => {
            // Normalizing string comparison just in case
            if (highlightNames.some(h => h.trim() === p.name.trim())) {
                highlights.push(p);
            } else {
                others.push(p);
            }
        });

        // Ensure exact order
        highlights.sort((a, b) => {
            return highlightNames.indexOf(a.name.trim()) - highlightNames.indexOf(b.name.trim());
        });

        return [...highlights, ...others];
    }, [products]);

    // --- 2. WISHLIST SYNC & AUTH TOAST ---
    useEffect(() => {
        if (user) {
            // Fetch Wishlist
            const fetchWishlist = async () => {
                const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', user.uid);
                if (data) setWishlist(data.map(i => i.product_id));
            };
            fetchWishlist();

            // Login Message
            setLoginMessage(`Bem-vindo, ${user.displayName}!`);
            const timer = setTimeout(() => setLoginMessage(''), 5000);
            return () => clearTimeout(timer);
        } else {
            setWishlist([]);
        }
    }, [user]);

    // --- 3. PERSISTENCE EFFECTS (Wishlist) ---
    useEffect(() => {
        if (!user) {
            localStorage.setItem('bdv_wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, user]);


    // --- HANDLERS ---
    const handleOpenLogin = () => navigateToHub('profile');



    const handleLogout = async () => {
        await signOut();
        setCurrentView('home');
        clearCart();
    };

    const toggleWishlist = async (productId: number) => {
        const isRemoving = wishlist.includes(productId);
        const newWishlist = isRemoving
            ? wishlist.filter(id => id !== productId)
            : [...wishlist, productId];

        setWishlist(newWishlist);

        if (user) {
            try {
                if (isRemoving) {
                    await supabase.from('wishlist').delete().match({ user_id: user.uid, product_id: productId });
                } else {
                    await supabase.from('wishlist').insert({ user_id: user.uid, product_id: productId });
                }
            } catch (e) {
                // Ignore offline errors
            }
        }
    };



    // HANDLERS
    // We use useCallback to prevent Navbar re-renders which would re-trigger the search debounce effect
    const navigateToHub = React.useCallback((tab: HubTab) => {
        setActiveHubTab(tab);
        setCurrentView('hub');
    }, []);

    const navigateToHome = React.useCallback(() => {
        setCurrentView('home');
        setSearchQuery(''); // Clear search when going home
        setActiveCategory(''); // Optional: clear category too
    }, []);

    const navigateToCategory = React.useCallback((category: string) => {
        setActiveCategory(category);
        setSearchQuery('');
        setCurrentView('category');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSearch = React.useCallback((query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            setActiveCategory('BUSCA');
            setCurrentView('category');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (activeCategory === 'BUSCA') {
            navigateToHome();
        }
    }, [activeCategory, navigateToHome]); // Added dependencies

    // NEW HANDLERS FOR PRODUCT PAGE
    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setCurrentView('product');
        window.scrollTo(0, 0);
    };

    const handleBackToStore = () => {
        setCurrentView('home');
        setSelectedProduct(null);
    };


    if (isLoadingProducts) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <IconSpinner size={48} className="text-brand-gold" />
                    <div className="h-4 w-32 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-brand-black flex flex-col selection:bg-brand-gold selection:text-brand-black">
            {currentView !== 'hub' && (
                <Navbar
                    onOpenWishlist={() => setIsWishlistOpen(true)}
                    onOpenCart={() => setIsCartOpen(true)}
                    onOpenAccount={() => navigateToHub('profile')}
                    onNavigateHome={navigateToHome}
                    onNavigateCategory={navigateToCategory}
                    wishlistCount={wishlist.length}
                    cartCount={cart.length}
                    isLoggedIn={!!user}
                    userImage={user?.photoURL}
                    userName={user?.displayName}
                    searchQuery={searchQuery} // Pass valid search query
                    onSearch={handleSearch}
                />
            )}

            {/* DEBUG / WELCOME TOAST */}
            {loginMessage && (
                <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
                    <div className="bg-white rounded-full p-1 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <span className="font-bold">{loginMessage}</span>
                </div>
            )}









            {/* Lazy Load Removed for Stability */}
            <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
            <WishlistDrawer
                isOpen={isWishlistOpen}
                onClose={() => setIsWishlistOpen(false)}
                onProductSelect={handleProductSelect}
                onRemove={toggleWishlist}
                wishlistItems={products.filter(p => wishlist.includes(p.id))}
            />
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onUpdateQuantity={updateCartQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={() => {
                    setIsCartOpen(false);
                    setCurrentView('checkout');
                    window.scrollTo(0, 0);
                }}
            />
            {/* Modal removed in favor of page, but keeping import commented if needed revert */}
            {/* <CheckoutModal ... /> */}


            {/* VIEW ROUTING */}
            <React.Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <IconSpinner size={48} className="text-brand-gold animate-spin" />
                </div>
            }>
                {currentView === 'hub' ? (
                    <UserHub
                        activeTab={activeHubTab}
                        onTabChange={setActiveHubTab}
                        onBackToStore={navigateToHome}
                        cart={cart}
                        wishlistIds={wishlist}
                        allProducts={products}
                        onRemoveFromCart={removeFromCart}
                        onRemoveFromWishlist={toggleWishlist}
                        user={user}
                        onLogin={handleOpenLogin}
                        onLogout={handleLogout}
                        onProductClick={handleProductSelect}
                    />
                ) : currentView === 'category' ? (
                    <CategoryPage
                        category={activeCategory}
                        searchQuery={searchQuery}
                        products={products} // Pass products to avoid breaking if prop still exists or ignored
                        onProductClick={handleProductSelect}
                        onToggleWishlist={toggleWishlist}
                        wishlistIds={wishlist}
                        onBack={navigateToHome}
                        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                    />
                ) : currentView === 'product' && selectedProduct ? (
                    <ProductPage
                        product={selectedProduct}
                        onBack={handleBackToStore}
                        onAddToWishlist={toggleWishlist}
                        onAddToCart={addToCart}
                        isWishlisted={wishlist.includes(selectedProduct.id)}
                        user={user}
                        onLogin={handleOpenLogin}
                        allProducts={products}
                        onProductSelect={handleProductSelect}
                        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                    />
                ) : currentView === 'checkout' ? (
                    <CheckoutPage
                        cart={cart}
                        cartTotal={cartTotal}
                        user={user}
                        onSuccess={clearCart}
                        onBack={navigateToHome}
                    />
                ) : (
                    <main className="flex-1 w-full max-w-[1920px] mx-auto bg-white overflow-x-hidden">
                        {/* HERO SECTION - PARALLAX & CINEMATIC */}
                        <section className="relative w-full h-[95vh] md:h-screen bg-brand-black overflow-hidden group">

                            {/* Video Background with overlay */}
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-brand-black/20 z-10" /> {/* Subtle tint */}
                                <video
                                    ref={videoRef}
                                    onLoadedData={() => setIsVideoLoaded(true)}
                                    className={`hidden md:block w-full h-full object-cover ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                >
                                    <source src={`${import.meta.env.VITE_SUPABASE_STORAGE_URL}/Imagens%20do%20site/COMPUTADOR.webm`} type="video/webm" />
                                </video>
                                {/* Mobile Video */}
                                <video
                                    ref={mobileVideoRef}
                                    className={`block md:hidden w-full h-full object-cover ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                >
                                    <source src={`${import.meta.env.VITE_SUPABASE_STORAGE_URL}/Imagens%20do%20site/CELULAR.webm`} type="video/webm" />
                                </video>
                            </div>

                            {/* Cinematic Gradients */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />

                            {/* Hero Content - Bottom Aligned & Impactful */}
                            <div className="absolute bottom-16 left-6 md:bottom-24 md:left-24 max-w-5xl z-20">
                                <div className="overflow-hidden mb-6">
                                    <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-brand-gold backdrop-blur-sm bg-black/30 w-fit px-4 py-2 rounded-full border border-white/10">
                                        Nova Coleção Elite Pack 2025
                                    </p>
                                </div>

                                <h1 className="text-6xl md:text-[8rem] font-serif font-medium leading-[0.85] tracking-tighter uppercase mb-10 text-white drop-shadow-2xl">
                                    Domine <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">O Jogo</span>
                                </h1>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <button
                                        onClick={() => navigateToCategory('FUTEBOL')}
                                        className="group relative bg-brand-gold text-brand-black px-10 py-4 md:px-14 md:py-6 text-base md:text-lg font-black uppercase tracking-[0.3em] hover:bg-white rounded-full border-2 border-brand-black"
                                    >
                                        <span className="relative z-10 flex items-center gap-4">
                                            COMPRAR AGORA <IconArrowRight className="w-5 h-5" />
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => navigateToCategory('PROMOÇÕES')}
                                        className="md:hidden group relative bg-transparent border-2 border-white/60 backdrop-blur-md text-white px-10 py-4 text-sm font-black uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold rounded-full shadow-xl"
                                    >
                                        VER OFERTAS
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* SHOP CAROUSEL SECTION - ELEVATED DESIGN */}
                        <section className="py-24 px-4 md:px-12 lg:px-24 bg-white relative">
                            {/* Section Header */}
                            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-100 pb-6 gap-4">
                                <div>
                                    <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-3 block">Escolha sua Arma</span>
                                    <h2 className="text-4xl md:text-5xl font-serif font-medium uppercase tracking-tight text-brand-black leading-none">Destaques da Semana</h2>
                                </div>

                                <div className="flex gap-6 items-center">
                                    <button
                                        onClick={() => setIsSizeGuideOpen(true)}
                                        className="hidden md:flex items-center gap-2 text-gray-400 text-[11px] font-bold uppercase hover:text-brand-black"
                                    >
                                        <IconRuler size={16} /> Guia de Tamanhos
                                    </button>
                                    <button
                                        onClick={() => navigateToCategory('PROMOÇÕES')}
                                        className="flex items-center gap-2 text-brand-black text-xs font-bold uppercase hover:text-brand-gold group border-b border-transparent hover:border-brand-gold pb-1"
                                    >
                                        Ver Coleção Completa <IconArrowRight size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                                {displayedProducts.slice(0, 4).map((product) => {
                                    const isInWishlist = wishlist.includes(product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            className="group cursor-pointer flex flex-col h-full relative"
                                            onClick={() => handleProductSelect(product)}
                                        >
                                            {/* Image Container with Hover Zoom & Lift */}
                                            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-6 group-hover:shadow-2xl">
                                                {/* Slight gray background for premium product contrast */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 opacity-50" />

                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    loading="eager"
                                                    decoding="async"
                                                    className="w-full h-full object-cover mix-blend-multiply"
                                                />

                                                {product.freeShipping && (
                                                    <div className="absolute top-0 left-0 bg-brand-gold text-brand-black text-[9px] font-extrabold px-4 py-2 uppercase tracking-widest z-20 shadow-lg border-r-2 border-b-2 border-brand-black">
                                                        Frete Grátis
                                                    </div>
                                                )}

                                                {/* Floating Action Buttons */}
                                                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleWishlist(product.id);
                                                        }}
                                                        className="p-3 rounded-full bg-white text-brand-black hover:bg-brand-gold hover:text-white shadow-lg"
                                                    >
                                                        <IconHeart size={18} filled={isInWishlist} />
                                                    </button>
                                                </div>

                                                {/* Quick Add Overlay */}
                                                <div className="absolute bottom-0 left-0 w-full p-4 group-hover:block hidden z-20">
                                                    <button className="w-full bg-brand-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-gold shadow-xl">
                                                        Ver Detalhes
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.brand}</span>
                                                    {product.isPromotion && <span className="text-[10px] font-bold text-red-600 uppercase">Oferta</span>}
                                                </div>

                                                <h3 className="uppercase font-bold text-lg leading-tight group-hover:text-gray-600 py-1">
                                                    {product.name}
                                                </h3>

                                                <p className="text-xs text-gray-500 mb-3 line-clamp-1">{product.surface}</p>

                                                <div className="mt-2 flex items-center gap-3">
                                                    <span className="font-serif font-medium text-xl text-brand-black tracking-wide">{product.price}</span>
                                                    {/* Installment info could go here */}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* SPLIT PROMO GRID */}
                        <section className="grid grid-cols-1 md:grid-cols-2">
                            <div className="relative h-[500px] md:h-[550px] overflow-hidden group bg-brand-black">
                                <img
                                    src="https://olqbvraizyneplodvncb.supabase.co/storage/v1/object/public/Imagens%20do%20site/toWEBP/bolaola.webp"
                                    alt="Speed Category"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-80" />
                                <div className="absolute inset-0 flex flex-col justify-end p-12 md:p-24 items-start">
                                    <p className="text-[10px] font-bold uppercase text-brand-gold tracking-[0.3em] mb-4 border-l-2 border-brand-gold pl-3">Velocidade</p>
                                    <h2 className="text-4xl md:text-6xl text-white font-serif font-medium uppercase tracking-tighter mb-8 leading-none">
                                        Aceleração <br /> Pura
                                    </h2>
                                    <button
                                        onClick={() => navigateToCategory('FUTEBOL')}
                                        className="border border-white/30 bg-white/5 backdrop-blur-md text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-brand-black hover:border-white"
                                    >
                                        Explorar Speed
                                    </button>
                                </div>
                            </div>

                            <div className="relative h-[500px] md:h-[550px] overflow-hidden group bg-brand-black border-t border-white/5 md:border-t-0 md:border-l">
                                <img src="https://olqbvraizyneplodvncb.supabase.co/storage/v1/object/public/Imagens%20do%20site/toWEBP/TOQUE%20DE%20MAESTRO%20(1).webp" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-60" alt="Control" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-80" />
                                <div className="absolute inset-0 flex flex-col justify-end p-12 md:p-24 items-start">
                                    <p className="text-[10px] font-bold uppercase text-brand-gold tracking-[0.3em] mb-4 border-l-2 border-brand-gold pl-3">Controle</p>
                                    <h2 className="text-4xl md:text-6xl text-white font-serif font-medium uppercase tracking-tighter mb-8 leading-none">
                                        Toque de <br /> Maestro
                                    </h2>
                                    <button
                                        onClick={() => navigateToCategory('FUTEBOL')}
                                        className="border border-white/30 bg-white/5 backdrop-blur-md text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold"
                                    >
                                        Explorar Control
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="bg-brand-black py-12 md:py-20 px-4">
                            <div className="relative flex flex-col justify-center p-6 md:p-32 w-full max-w-[1600px] mx-auto shadow-2xl border-y-4 border-brand-gold bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 relative overflow-hidden group-hover:border-white">
                                {/* Decorative Background Texture */}
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-transparent to-transparent pointer-events-none" />
                                <div className="absolute top-0 right-0 p-12 opacity-5">
                                    <IconCrown size={400} />
                                </div>
                                <p className="text-xs md:text-sm font-bold uppercase text-brand-gold tracking-[0.4em] mb-4">Quadras Indoor & Rua</p>
                                <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter mb-8 leading-[0.8]">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-brand-black to-gray-800 [-webkit-text-stroke:2px_white] drop-shadow-xl block">FUTSAL</span>
                                    <span className="text-3xl md:text-6xl text-brand-gold font-serif italic tracking-wide block mt-2">Pro Series</span>
                                </h2>
                                <p className="text-gray-600 mb-10 max-w-2xl leading-relaxed text-base md:text-xl font-medium">
                                    Domine a quadra com nossa seleção premium de calçados indoor. Aderência superior, amortecimento responsivo e durabilidade para o jogo rápido.
                                </p>
                                <div>
                                    <button
                                        onClick={() => navigateToCategory('FUTSAL')}
                                        className="bg-brand-black text-brand-gold px-12 py-5 text-sm md:text-base font-black uppercase tracking-[0.25em] hover:bg-brand-gold hover:text-brand-black shadow-xl hover:shadow-2xl"
                                    >
                                        Comprar Coleção Futsal
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* BRAND DISCOVERY SECTION (MAIS BUSCADOS REPLACEMENT) */}
                        <section className="py-20 px-4 md:px-12 bg-white border-t border-gray-100">
                            <div className="flex flex-col items-center mb-12">
                                <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Marcas Oficiais</span>
                                <h3 className="text-2xl font-serif font-medium uppercase tracking-tight text-brand-black">Navegue por Marca</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                                {[
                                    { name: 'NIKE', Icon: BrandNike, label: 'Inovação', bgClass: 'bg-neutral-100' },
                                    { name: 'PUMA', Icon: BrandPuma, label: 'Velocidade', bgClass: 'bg-neutral-100' },
                                    { name: 'UMBRO', Icon: BrandUmbro, label: 'Tradição', bgClass: 'bg-neutral-100' },
                                    { name: 'JOMA', Icon: BrandJoma, label: 'Performance', bgClass: 'bg-neutral-100' },
                                ].map((brand) => (
                                    <div
                                        key={brand.name}
                                        className={`group relative h-64 overflow-hidden cursor-pointer ${brand.bgClass} flex items-center justify-center bg-gray-50 border border-gray-100`}
                                        onClick={() => navigateToCategory(brand.name)}
                                    >

                                        {/* Logo */}
                                        <div className="relative z-10">
                                            <brand.Icon width="140" className="text-brand-black group-hover:text-brand-gold" />
                                        </div>

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-6 items-center text-center opacity-0 group-hover:opacity-100">
                                            <p className="text-[10px] text-brand-black uppercase tracking-[0.2em] mb-1 translate-y-4 group-hover:translate-y-0">{brand.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main >
                )
                }
            </React.Suspense>

            {
                currentView === 'home' && (
                    <Footer
                        onOpenAccount={() => navigateToHub('profile')}
                        onOpenOrders={() => navigateToHub('tracking')}
                        onOpenWishlist={() => setIsWishlistOpen(true)}
                    />
                )
            }
            <WhatsAppButton />
            <BackToTop />
        </div >
    );
};

export default App;
