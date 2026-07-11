'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Squares2X2Icon,
    CubeIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'; // Need generic fallback if not installed

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
        { name: 'Estoque', href: '/inventory', icon: CubeIcon },
        { name: 'Propostas', href: '/proposals', icon: DocumentTextIcon },
        { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
    ];

    return (
        <div className="flex h-full w-64 flex-col bg-[#121214] border-r border-[#323238] text-gray-300">
            {/* Logo Area */}
            <div className="flex h-20 items-center px-6 border-b border-[#323238]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[var(--color-primary)] rounded flex items-center justify-center text-white font-bold text-sm">
                        N
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-none">NorthWay</h1>
                        <p className="text-[10px] text-[var(--color-primary)] font-bold tracking-wider">SOLAR ENGINE™</p>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1 px-3 py-6">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${isActive
                                ? 'bg-[var(--color-primary)] text-white shadow-md'
                                : 'text-gray-400 hover:bg-[#202024] hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-[#323238] p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-400 hover:bg-[#202024] hover:text-red-400 transition-colors"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    Sair da Conta
                </button>
            </div>
        </div>
    );
}
