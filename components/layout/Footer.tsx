import { Mail, Phone, Facebook, Instagram, Youtube } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background text-foreground">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Brand Section - Centered on Mobile */}
          <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-border">
            <Image 
              src="/logo.png" 
              alt="CodePath" 
              width={80} 
              height={80} 
              className="w-20 h-20" 
            />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Train smarter, compete better, grow together
            </p>
          </div>

          {/* Links Grid - 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-6">
            {/* Explore Section */}
            <div>
              <h3 className="text-foreground font-bold text-base mb-3 text-center">Explore</h3>
              <ul className="space-y-2 text-center">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Homepage
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info Section */}
            <div>
              <h3 className="text-foreground font-bold text-base mb-3 text-center">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-start justify-center gap-2">
                  <Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <a 
                    href="mailto:info@codepath.com" 
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm break-all"
                  >
                    info@codepath.com
                  </a>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <a 
                    href="tel:+96394413524" 
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    +96394413524
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media - Centered on Mobile */}
          <div className="flex flex-col items-center gap-3 pt-4 border-t border-border">
            <h3 className="text-foreground font-bold text-base">Follow Us</h3>
            <div className="flex gap-4">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 text-center text-muted-foreground text-xs sm:text-sm">
          © {currentYear} CodePath. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
