
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages: { code: Language; name: string; flag: string }[] = [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
    ];

    const selectedLanguage = languages.find(l => l.code === language) || languages[0];

    const toggleDropdown = () => setIsOpen(!isOpen);

    const selectLanguage = (langCode: Language) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center justify-center w-10 h-10 bg-white/20 dark:bg-gray-700 text-white dark:text-gray-200 rounded-full hover:bg-white/30 dark:hover:bg-gray-600 transition"
            >
                <span className="text-lg">{selectedLanguage.flag}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20">
                    <ul className="py-1">
                        {languages.map(lang => (
                            <li key={lang.code}>
                                <button
                                    onClick={() => selectLanguage(lang.code)}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <span className="mr-2">{lang.flag}</span>
                                    {lang.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
