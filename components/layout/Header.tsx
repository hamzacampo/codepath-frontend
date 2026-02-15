"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/Button";
import { UserCircle, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Homepage" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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
    <header className="sticky top-0 z-50 w-full min-h-14 sm:min-h-16 lg:min-h-18 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/50 lg:border-b-0">
      <div className="flex items-center justify-between h-14 sm:h-16 lg:h-auto lg:py-5 px-4 sm:px-6 md:px-8 lg:px-14 w-full max-w-[100vw]">
        <div className="flex items-center justify-between w-full gap-3">
          {/* Logo - smaller on mobile to leave room for menu */}
          <Link href="/" className="shrink-0 flex items-center min-w-0">
            <Image 
              src="/logo.png" 
              alt="CodePath" 
              width={80} 
              height={80}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-end gap-7 flex-1 ml-8">
            {/* Desktop Navigation Links */}
            <div className="flex items-center gap-4 md:gap-6 text-base md:text-xl font-normal">
              {navLinks.map(({ href, label }) => {
                const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`transition-colors hover:text-accent ${isActive ? "text-accent font-semibold" : ""}`}
                  >
                    <span>{label}</span>
                  </Link>
                );
              })}
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className={`transition-colors hover:text-accent ${pathname === "/dashboard" || pathname.startsWith("/dashboard/") ? "text-accent font-semibold" : ""}`}
                >
                  <span>Dashboard</span>
                </Link>
              )}
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

          {/* Mobile Menu Button - larger touch target */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-lg hover:bg-accent/10 active:scale-95 transition-colors touch-manipulation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 shrink-0" />
            ) : (
              <Menu className="h-6 w-6 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - slide down with proper spacing and touch targets */}
      <div
        className={`
          lg:hidden overflow-hidden transition-all duration-200 ease-out
          ${mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="border-t border-border bg-background/98 backdrop-blur-sm">
          <nav className="flex flex-col px-4 py-4 gap-0" aria-label="Mobile navigation">
            {navLinks.map(({ href, label }) => {
              const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`py-3.5 px-2 text-base font-medium rounded-lg transition-colors -mx-2 hover:text-accent active:bg-accent/10 ${isActive ? "text-accent font-semibold bg-accent/10" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`py-3.5 px-2 text-base font-medium rounded-lg transition-colors -mx-2 hover:text-accent active:bg-accent/10 ${pathname === "/dashboard" || pathname.startsWith("/dashboard/") ? "text-accent font-semibold bg-accent/10" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-3 px-2 py-3 mt-2 border-t border-border">
                  <UserCircle className="h-8 w-8 shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.email?.split("@")[0] || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                  </div>
                </div>
                <Button 
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full mt-2 h-11 font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2 shrink-0" />
                  Logout
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex flex-col gap-3 mt-4 pt-2 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={handleLoginClick}
                  className="w-full h-11 font-medium"
                >
                  Login
                </Button>
                <Button 
                  onClick={handleSignUpClick}
                  className="w-full h-11 font-medium"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
