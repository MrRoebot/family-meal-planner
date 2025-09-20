'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Plan', href: '/plan', icon: '📅' },
  { name: 'Recipes', href: '/recipes', icon: '📖' },
  { name: 'Shop', href: '/shop', icon: '🛒' },
  { name: 'Family', href: '/family', icon: '👥' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
