'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function NavigationLink({ href, children, className, onClick }: NavigationLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setLoading } = useLoading();

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger loading if navigating to a different page
    if (href !== pathname) {
      setLoading(true);
      
      // Add small delay to show skeleton effect
      setTimeout(() => {
        if (onClick) onClick();
      }, 50);
    } else {
      if (onClick) onClick();
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}