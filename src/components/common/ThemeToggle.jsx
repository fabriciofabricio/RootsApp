import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';

const ThemeToggle = ({ className }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={clsx(
                "p-2 rounded-lg transition-colors duration-200",
                "text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-100 dark:bg-white/5",
                className
            )}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
};

export default ThemeToggle;


