"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Menu, X, ChevronDown, LogIn, LogOut, User, LucideLayoutDashboard } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

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

  // Define the navigation structure with nested routes
  const navItems = [
    {
      name: "Coding",
      children: [
        { name: "Technical Interview", href: "/interview" },
        { name: "Cultural Fit (HR)", href: "/cultural-fit" },
        { name: "Coding Practice", href: "/practice" },
      ],
    },
    { name: "Guidance", href: "/guidance" },
    { name: "Resume Enhancer", href: "/resume-enhancer" },
    { name: "Cold Approach", href: "/cold-approach" },
    { name: "Group Discussion", href: "/group-discussion" },
    {
      name: "UPSC",
      children: [
        { name: "Main Interview", href: "/upsc/main" },
        {
          name: "Subject-Wise",
          children: [
            { name: "CSAT", href: "/upsc/subjects/csat" },
            { name: "Economics", href: "/upsc/subjects/eco" },
            { name: "Geography", href: "/upsc/subjects/geo" },
            { name: "History", href: "/upsc/subjects/history" },
            { name: "Polity", href: "/upsc/subjects/polity" },
            { name: "Ethics", href: "/upsc/subjects/ethics" },
          ],
        },
      ],
    },
    {
      name: "State Exams",
      children: [
        { name: "PCS", href: "/pcs" },
        { name: "HCS", href: "/hcs" }
      ],
    },
    {
      name: "AI Tutor",
      children: [
        { name: "Class 10th", href: "/tutor/10th" }
      ],
    },
  ]

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-md shadow-lg"
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
          className="flex items-center gap-2 text-2xl font-bold cursor-pointer"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">NextRound</span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.children ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative font-medium text-gray-700 dark:text-gray-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-colors duration-300 group flex items-center gap-1">
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                    {item.children.map((child) =>
                      child.children ? (
                        <DropdownMenuSub key={child.name}>
                          <DropdownMenuSubTrigger className="hover:bg-purple-100 dark:hover:bg-gray-700">
                            {child.name}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                            {child.children.map((subChild) => (
                              <DropdownMenuItem
                                key={subChild.name}
                                className="hover:bg-purple-100 dark:hover:bg-gray-700"
                                onSelect={() => router.push(subChild.href)}
                              >
                                {subChild.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ) : (
                        <DropdownMenuItem
                          key={child.name}
                          className="hover:bg-purple-100 dark:hover:bg-gray-700"
                          onSelect={() => router.push(child.href)}
                        >
                          {child.name}
                        </DropdownMenuItem>
                      ),
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href={item.href || "#"}
                  className="relative font-medium text-gray-700 dark:text-gray-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-colors duration-300 group"
                >
                  {item.name}
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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
                  <AvatarFallback>{session.user?.name?.[0] || <User className="text-gray-400" />}</AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-purple-100 dark:hover:bg-gray-800">
                      {session.user?.name}
                      <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                    <DropdownMenuItem
                      onSelect={() => router.push("/dashboard")}
                      className="hover:bg-purple-100 dark:hover:bg-gray-700"
                    >
                      <LucideLayoutDashboard className="mr-2 h-4 w-4 text-purple-500" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => signOut()} className="hover:bg-red-100 dark:hover:bg-red-900">
                      <LogOut className="mr-2 h-4 w-4 text-red-500" />
                      <p className="text-red-500">Sign out</p>
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
                  onClick={() => router.push("/auth")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
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
            className="lg:hidden text-purple-600 dark:text-blue-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-md overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navItems.map((item, index) => (
                <div key={item.name}>
                  {item.children ? (
                    <MobileAccordion title={item.name} delay={index * 0.05}>
                      <div className="pl-4 space-y-2 mt-2">
                        {item.children.map((child) => (
                          <div key={child.name}>
                            {child.children ? (
                              <MobileAccordion title={child.name} delay={(index + 1) * 0.05}>
                                <div className="pl-4 space-y-2 mt-2">
                                  {child.children.map((subChild) => (
                                    <motion.div
                                      key={subChild.name}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -20 }}
                                      transition={{ delay: (index + 2) * 0.05 }}
                                    >
                                      <Link
                                        href={subChild.href}
                                        className="block py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-colors duration-300"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                      >
                                        {subChild.name}
                                      </Link>
                                    </motion.div>
                                  ))}
                                </div>
                              </MobileAccordion>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: (index + 1) * 0.05 }}
                              >
                                <Link
                                  href={child.href}
                                  className="block py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-colors duration-300"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {child.name}
                                </Link>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </MobileAccordion>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href || "#"}
                        className="block py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-colors duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  )}
                </div>
              ))}
              {!session && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Button
                    onClick={() => {
                      router.push("/auth")
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
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

// Mobile accordion component for nested navigation on mobile
function MobileAccordion({
  title,
  children,
  delay = 0,
}: {
  title: string
  children: React.ReactNode
  delay?: number
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay }}
      className="border-b border-gray-200 dark:border-gray-700 pb-2"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-colors duration-300"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

