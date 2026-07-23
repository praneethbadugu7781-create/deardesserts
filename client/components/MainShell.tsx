'use client';

import { usePathname } from 'next/navigation';

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
  );
}
