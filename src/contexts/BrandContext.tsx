import React, { createContext, useContext, useState, useCallback } from 'react';

type Tab = 'dashboard' | 'names' | 'logo' | 'content' | 'sentiment' | 'assistant' | 'palette' | 'audit' | 'analytics' | 'checker' | 'collections';


interface BrandContextValue {
    /** The currently selected brand name (pre-fill) */
    selectedBrand: string;
    setSelectedBrand: (name: string) => void;
    /** The currently selected color palette (e.g. "Deep Blue and Gold") */
    selectedPalette: string;
    setSelectedPalette: (palette: string) => void;
    /** Navigate to a tab with an optional brand name prefilled */
    navigateTo: (tab: Tab, brandName?: string) => void;
    /** Register the navigation handler (called once from App) */
    registerNavigate: (fn: (tab: Tab) => void) => void;
}

const BrandContext = createContext<BrandContextValue>({
    selectedBrand: '',
    setSelectedBrand: () => { },
    selectedPalette: '',
    setSelectedPalette: () => { },
    navigateTo: () => { },
    registerNavigate: () => { },
});

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedPalette, setSelectedPalette] = useState('');
    const [navFn, setNavFn] = useState<((tab: Tab) => void) | null>(null);

    const registerNavigate = useCallback((fn: (tab: Tab) => void) => {
        setNavFn(() => fn);
    }, []);

    const navigateTo = useCallback((tab: Tab, brandName?: string) => {
        if (brandName !== undefined) setSelectedBrand(brandName);
        navFn?.(tab);
    }, [navFn]);

    return (
        <BrandContext.Provider value={{
            selectedBrand, setSelectedBrand,
            selectedPalette, setSelectedPalette,
            navigateTo, registerNavigate
        }}>
            {children}
        </BrandContext.Provider>
    );
};

export const useBrand = () => useContext(BrandContext);
