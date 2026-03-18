'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LucideIcon, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface PageItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permissions?: string[];
}

interface PageDropDownProps {
  pages: PageItem[];
}

export function PageDropDown({ pages }: PageDropDownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          title="Navigate to other pages"
        >
          <Menu className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Navigation</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {pages.length === 0 ? (
          <div className="px-2 py-1.5 text-xs text-gray-500">
            No pages available
          </div>
        ) : (
          pages.map((page) => {
            const Icon = page.icon;
            return (
              <DropdownMenuItem
                key={page.href}
                onClick={() => handleNavigate(page.href)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Icon className="h-4 w-4" />
                <span>{page.name}</span>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
