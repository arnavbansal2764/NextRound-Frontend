"use client"

import { useState, useEffect } from "react"
import { BriefcaseIcon, Menu, X, ChevronDown, LogIn, LogOut, User, LucideLayoutDashboard } from 'lucide-react'
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: 'Interview', href: '/interview' },
    { name: 'Cultural Fit', href: '/cultural-fit' },
    {
      name: 'Resources',
      items: [
        { name: 'Blog', href: '/blog' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Support', href: '/support' },
      ]
    }
  ]

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-lg"
          : "bg-transparent"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xl font-bold cursor-pointer"
        >
          <BriefcaseIcon className="text-primary h-6 w-6" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            NextRound
          </span>
        </motion.div>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.items ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1">
                      {item.name} <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.items.map((subItem) => (
                      <DropdownMenuItem key={subItem.name}>
                        <Link href={subItem.href} className="w-full">
                          {subItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href={item.href}
                  className="relative font-medium text-gray-700 hover:text-primary transition-colors duration-300 group"
                >
                  {item.name}
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              )}
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {session ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex items-center gap-2"
              >
                <Avatar>
                  <AvatarImage src={session.user?.image || undefined} />
                  <AvatarFallback>{session.user?.name?.[0] || <User />}</AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {session.user?.name}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => router.push('/dashboard')}>
                      <LucideLayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4 text-red-600" />
                      <p className="text-red-600">Sign out</p>
                    </DropdownMenuItem>
                    
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Button
                  onClick={() => router.push('/auth')}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/80 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {item.items ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start">
                          {item.name} <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {item.items.map((subItem) => (
                          <DropdownMenuItem key={subItem.name}>
                            <Link href={subItem.href} className="w-full">
                              {subItem.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      href={item.href}
                      className="block py-2 font-medium text-gray-700 hover:text-primary transition-colors duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.div>
              ))}
              {!session && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Button
                    onClick={() => {
                      router.push('/auth')
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-primary text-white hover:bg-primary/90"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

