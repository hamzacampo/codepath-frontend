"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/Button";
import { UserCircle, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
    setMobileMenuOpen(false);
  };

  const handleSignUpClick = () => {
    router.push("/auth/register");
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-14 w-full">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image 
              src="/logo.png" 
              alt="CodePath" 
              width={80} 
              height={80}
              className="w-16 h-16 md:w-20 md:h-20"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-end gap-7 flex-1 ml-8">
            {/* Desktop Navigation Links */}
            <div className="flex items-center gap-4 md:gap-6 text-base md:text-xl font-normal">
              <Link href="/" className="hover:text-accent transition-colors">
                <span>Homepage</span>
              </Link>
              <Link href="/" className="hover:text-accent transition-colors">
                <span>About Us</span>
              </Link>
              <Link href="/" className="hover:text-accent transition-colors">
                <span>Contact Us</span>
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    <UserCircle className="h-[41px] w-[41px] cursor-pointer text-primary hover:text-accent transition-colors" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{user?.email?.split("@")[0] || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleLoginClick}
                    className="cursor-pointer"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={handleSignUpClick}
                    className="cursor-pointer"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="flex flex-col px-4 py-4 space-y-4">
            <Link 
              href="/" 
              className="text-lg font-normal hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Homepage
            </Link>
            <Link 
              href="/" 
              className="text-lg font-normal hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/" 
              className="text-lg font-normal hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2 px-2 py-2 border-t border-border mt-2">
                  <UserCircle className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user?.email?.split("@")[0] || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                  </div>
                </div>
                <Button 
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full mt-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex flex-col gap-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleLoginClick}
                  className="w-full"
                >
                  Login
                </Button>
                <Button 
                  onClick={handleSignUpClick}
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
