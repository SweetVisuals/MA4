"use client";

import { Link } from "react-router-dom";
import { SearchBar } from "@/components/homepage/search-bar";
import { Button } from "@/components/@/ui/button";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/@/ui/navigation-menu";
import { Menu, MoveRight, X } from "lucide-react";
import { useState } from "react";

function Header1() {
    const navigationItems = [
        {
            title: "Home",
            href: "/",
            description: "",
        }
    ];

    const [isOpen, setOpen] = useState(false);
    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-background">
            <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
                <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
                    <NavigationMenu className="flex justify-start items-start">
                        <NavigationMenuList className="flex justify-start gap-4 flex-row">
                            {navigationItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    <NavigationMenuLink>
                                        <Button 
  variant="ghost"
  className="relative group transition-colors duration-300"
>
  <span>{item.title}</span>
  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
</Button>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex lg:justify-center w-full max-w-md">
                    <SearchBar />
                </div>
                <div className="flex justify-end w-full gap-4">
<Button 
  variant="ghost" 
  className="hidden md:inline relative transition-colors duration-300 group"
>
  <span>Upload</span>
  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
</Button>
                    <div className="border-r hidden md:inline"></div>
                    <Link to="/auth/login">
                      <Button variant="outline" className="hover:bg-gray-800 hover:text-white transition-colors duration-300">Sign in</Button>
                    </Link>
                </div>
                <div className="flex w-12 shrink lg:hidden items-end justify-end">
<Button 
  variant="ghost" 
  className="hover:bg-gray-800 hover:text-white transition-all duration-300 hover:scale-[1.02]" 
  onClick={() => setOpen(!isOpen)}
>
  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
</Button>
                    {isOpen && (
                        <div className="absolute top-20 border-t flex flex-col w-full right-0 bg-background shadow-lg py-4 container gap-8">
                            {navigationItems.map((item) => (
                                <div key={item.title}>
                                  <Link
                                    to={item.href}
                                    className="flex justify-between items-center group"
                                  >
                                    <span className="text-lg relative">
                                      {item.title}
                                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                                    </span>
                                    <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                  </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export { Header1 };
