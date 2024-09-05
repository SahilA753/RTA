'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Logo from '../../../public/cypresslogo.svg';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface ListItemProps {
    href: string;
    title: string;
    children: React.ReactNode;
  }

// Define navigation routes and components
const routes = [
  { title: 'Features', href: '#features' },
  { title: 'Resources', href: '#resources' },
  { title: 'Pricing', href: '#pricing' },
  { title: 'Testimonials', href: '#testimonial' },
];

const components = [
  {
    title: 'Alert Dialog',
    href: '#',
    description:
      'A modal dialog that interrupts the user with important content and expects a response.',
  },
  {
    title: 'Hover Card',
    href: '#',
    description:
      'For sighted users to preview content available behind a link.',
  },
  {
    title: 'Progress',
    href: '#',
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
  },
  {
    title: 'Scroll-area',
    href: '#',
    description: 'Visually or semantically separates content.',
  },
  {
    title: 'Tabs',
    href: '#',
    description:
      'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
  },
  {
    title: 'Tooltip',
    href: '#',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
  },
];

const Header = () => {
  const [path, setPath] = useState('#products'); // To track the selected path

  return (
    <header className="p-4 flex justify-between items-center">

      <Link href="/" className="flex gap-2 items-center">
        <Image src={Logo} alt="Cypress Logo" width={25} height={25} />
        <span className="font-semibold dark:text-white">Kladbase</span>
      </Link>


      <NavigationMenu className="hidden md:block">
        <NavigationMenuList className="gap-6">
          {/* Resources Menu Item */}
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#resources')}
              className={cn({
                'dark:text-white': path === '#resources',
                'dark:text-white/40': path !== '#resources',
              })}
            >
              Resources
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 w-[400px]">
                <ListItem href="#" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="#" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="#" title="Typography">
                  Styles for headings, paragraphs, lists...etc.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Pricing Menu Item */}
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#pricing')}
              className={cn({
                'dark:text-white': path === '#pricing',
                'dark:text-white/40': path !== '#pricing',
              })}
            >
              Pricing
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4">
                <ListItem title="Pro Plan" href="#pricing">
                  Unlock full power with collaboration.
                </ListItem>
                <ListItem title="Free Plan" href="#pricing">
                  Great for teams just starting out.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Components List Menu */}
          <NavigationMenuItem>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Testimonial Link */}
          <NavigationMenuItem>
            <NavigationMenuLink className={cn({
              'dark:text-white': path === '#testimonials',
              'dark:text-white/40': path !== '#testimonials',
            })}>
              Testimonial
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Authentication Buttons */}
      <div className="flex gap-2">
        <Link href="/login">
          <Button variant="btn-secondary">Login</Button>
        </Link>
        <Link href="/signup">
          <Button variant="btn-secondary">Sign Up</Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;

// A simple list item component for the navigation links
const ListItem: React.FC<ListItemProps> = ({ href, title, children }) => {
    return (
      <li>
        <Link href={href} className="block space-y-1 p-4 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-800 hover:text-white rounded-lg">
          <div className="font-medium text-sm">{title}</div>
          <p className="text-xs text-gray-500 group-hover:text-gray-300">{children}</p>
        </Link>
      </li>
    );
  };
  
