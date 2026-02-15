import { Mail, Phone, Facebook, Instagram, Youtube } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background text-foreground">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Mobile Layout - single column, larger touch targets */}
        <div className="lg:hidden flex flex-col gap-8 sm:gap-6">
          {/* Brand Section - Centered on Mobile */}
          <div className="flex flex-col items-center text-center gap-3 pb-6 border-b border-border">
            <Image 
              src="/logo.png" 
              alt="CodePath" 
              width={80} 
              height={80} 
              className="w-16 h-16 sm:w-20 sm:h-20" 
            />
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs px-1">
              Train smarter, compete better, grow together
            </p>
          </div>

          {/* Links & Contact - stacked on mobile, 2 cols from sm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-6">
            {/* Explore Section */}
            <div className="flex flex-col">
              <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                Explore
              </h3>
              <ul className="space-y-0">
                <li>
                  <Link href="/" className="block py-2.5 text-foreground hover:text-accent active:text-accent transition-colors text-sm touch-manipulation -mx-1 px-1 rounded">
                    Homepage
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="block py-2.5 text-foreground hover:text-accent active:text-accent transition-colors text-sm touch-manipulation -mx-1 px-1 rounded">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="block py-2.5 text-foreground hover:text-accent active:text-accent transition-colors text-sm touch-manipulation -mx-1 px-1 rounded">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info Section */}
            <div className="flex flex-col">
              <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                Contact
              </h3>
              <ul className="space-y-0">
                <li>
                  <a 
                    href="mailto:info@codepath.com" 
                    className="flex items-center gap-3 py-2.5 text-foreground hover:text-accent active:text-accent transition-colors text-sm break-all touch-manipulation -mx-1 px-1 rounded"
                  >
                    <Mail className="w-4 h-4 text-accent shrink-0" />
                    info@codepath.com
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:+96394413524" 
                    className="flex items-center gap-3 py-2.5 text-foreground hover:text-accent active:text-accent transition-colors text-sm touch-manipulation -mx-1 px-1 rounded"
                  >
                    <Phone className="w-4 h-4 text-accent shrink-0" />
                    +96394413524
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media - larger tap targets on mobile */}
          <div className="flex flex-col items-center gap-4 pt-4 border-t border-border">
            <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">
              Follow Us
            </h3>
            <div className="flex gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 text-muted-foreground hover:text-accent hover:bg-muted transition-colors active:scale-95 touch-manipulation"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 text-muted-foreground hover:text-accent hover:bg-muted transition-colors active:scale-95 touch-manipulation"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 text-muted-foreground hover:text-accent hover:bg-muted transition-colors active:scale-95 touch-manipulation"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <Image 
              src="/logo.png" 
              alt="CodePath" 
              width={80} 
              height={80} 
              className="w-24 h-24" 
            />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Train smarter, compete better, grow together
            </p>
          </div>

          {/* Explore Section */}
          <div>
            <h3 className="text-foreground font-bold text-xl mb-6">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-base">
                  Homepage
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-base">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-base">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info Section */}
          <div>
            <h3 className="text-foreground font-bold text-xl mb-6">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a 
                  href="mailto:info@codepath.com" 
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm break-all"
                >
                  info@codepath.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a 
                  href="tel:+96394413524" 
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  +96394413524
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-foreground font-bold text-xl mb-6 text-center">Follow Us</h3>
            <div className="flex gap-4 justify-center">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6 text-accent" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6 text-accent" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-6 h-6 text-accent" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 text-center text-muted-foreground text-xs sm:text-sm leading-relaxed">
          © {currentYear} CodePath. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
