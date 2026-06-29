import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type LayoutDensity = 'compact' | 'normal';

export const useTheme = () => {
    const [theme, setTheme] = useState<ThemeMode>(
        (localStorage.getItem('erp-theme') as ThemeMode) || 'system'
    );
    const [fontSize, setFontSize] = useState<FontSize>(
        (localStorage.getItem('erp-font-size') as FontSize) || 'medium'
    );
    const [density, setDensity] = useState<LayoutDensity>(
        (localStorage.getItem('erp-density') as LayoutDensity) || 'normal'
    );

    useEffect(() => {
        const root = document.documentElement;

        // Apply dark/light theme classes
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const activeTheme = theme === 'system' ? systemTheme : theme;
        
        if (activeTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('erp-theme', theme);
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-font-size', fontSize);
        localStorage.setItem('erp-font-size', fontSize);
    }, [fontSize]);

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-density', density);
        localStorage.setItem('erp-density', density);
    }, [density]);

    return {
        theme,
        fontSize,
        density,
        setTheme,
        setFontSize,
        setDensity,
    };
};
