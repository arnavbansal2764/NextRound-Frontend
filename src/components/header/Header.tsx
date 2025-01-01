// "use client"

// import { useState, useEffect } from "react"
// import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
// import { BriefcaseIcon, Menu, X } from "lucide-react"
// import Link from "next/link"
// import { motion, AnimatePresence } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import useMentor from "@/hooks/useMentor"
// import useRecruiter from "@/hooks/useRecruiter"
// import useJobSeeker from "@/hooks/useJobSeeker"
// import { useRouter } from "next/navigation"

// export default function Header() {
//   const [isScrolled, setIsScrolled] = useState(false)
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
//   const mentor = useMentor();
//   const recruiter = useRecruiter();
//   const jobSeeker = useJobSeeker();
//   const router = useRouter()
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10)
//     }
//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   const navItems = [
//     { name: "Features", href: "#" },
//     { name: "About", href: "#" },
//     { name: "Jobs", dropdown: [
//       { name: "Recommended", href: "/jobs/recommended" },
//       { name: "Private", href: "/jobs/private" },
//       { name: "Government", href: "/jobs/gov" },
//       { name: "External", href: "/jobs/external" },
//     ],
//   },

//   ]

//   if (!mentor.isMentor) {
//     if (jobSeeker.isJobSeeker) {
//       navItems.push(
//         { name: 'Interview', href: '/interview' },
//         { name: 'Mentor', href: '/mentor' },
//         { name: "Guidance", href: "/guidance" },
//       );
//     }
//     if (recruiter.isRecruiter) {
//       navItems.push({ name: 'Cultural Fit', href: '/cultural-fit' });
//     }
//   }

//   return (
//     <motion.header
//       className={`group fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4 transition-all duration-300 ${isScrolled ? "bg-white shadow-md text-white" : "bg-transparent text-transparent hover:bg-white group-hover:text-gray-700"
//         }`}
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       transition={{ type: "spring", stiffness: 300, damping: 30 }}
//     >
//       <div className="container mx-auto flex items-center justify-between">
//         <motion.div
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => router.push("/")}
//           className=" flex items-center gap-2 text-lg font-semibold cursor-pointer"
//         >
//           <BriefcaseIcon className={isScrolled ? "text-primary" : "text-white group-hover:text-primary"} />
//           <span className={isScrolled ? "text-primary" : "text-white group-hover:text-primary"}>CareerBridge</span>
//         </motion.div>

//         <nav className="hidden lg:flex items-center gap-6">
//           {navItems.map((item, index) => (
//             <motion.div
//               key={item.name}
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//             >
//               {item.dropdown ? (
//                 <DropdownMenu>
//                   <DropdownMenuTrigger className={`font-medium hover:text-primary transition-colors ${isScrolled ? "text-gray-700" : "text-white group-hover:text-gray-700"
//                     }`}>
//                     {item.name}
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent>
//                     {item.dropdown.map((dropdownItem) => (
//                       <DropdownMenuItem
//                         key={dropdownItem.name}
//                         onClick={() => router.push(dropdownItem.href)}
//                       >
//                         {dropdownItem.name}
//                       </DropdownMenuItem>
//                     ))}
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               ) : (
//                 <Link
//                   href={item.href}
//                   className={`font-medium hover:text-primary transition-colors ${isScrolled ? "text-gray-700" : "text-white group-hover:text-gray-700"
//                     }`}
//                 >
//                   {item.name}
//                 </Link>
//               )}
//             </motion.div>
//           ))}
//         </nav>

//         <div className="flex items-center gap-4">
//           <SignedOut>
//             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//               <SignInButton>
//                 <Button variant={isScrolled ? "default" : "secondary"}>Sign In</Button>
//               </SignInButton>
//             </motion.div>
//           </SignedOut>
//           <SignedIn>
//             <UserButton
//               appearance={{
//                 elements: {
//                   avatarBox: "w-10 h-10",
//                 },
//               }}
//             />
//             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//               <Button
//                 variant={isScrolled ? "default" : "secondary"}
//                 onClick={() => router.push("/profile")}
//                 className={`${isScrolled ? " text-white" : "bg-transparent text-transparent group-hover:text-white group-hover:bg-blue-600"}`}
//               >
//                 Profile
//               </Button>
//             </motion.div>
//           </SignedIn>

//           <motion.button
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//             className="lg:hidden"
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           >
//             {isMobileMenuOpen ? (
//               <X className={isScrolled ? "text-primary" : "text-white group-hover:text-primary"} />
//             ) : (
//               <Menu className={isScrolled ? "text-primary" : "text-white group-hover:text-primary"} />
//             )}
//           </motion.button>
//         </div>
//       </div>

//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="lg:hidden mt-4"
//           >
//             {navItems.map((item) => (
//               <motion.div
//                 key={item.name}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 className="py-2"
//               >
//                 {item.dropdown ? (
//                   <DropdownMenu>
//                     <DropdownMenuTrigger className="font-medium text-gray-700 hover:text-primary transition-colors">
//                       {item.name}
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent>
//                       {item.dropdown.map((dropdownItem) => (
//                         <DropdownMenuItem
//                           key={dropdownItem.name}
//                           onClick={() => {
//                             router.push(dropdownItem.href)
//                             setIsMobileMenuOpen(false)
//                           }}
//                         >
//                           {dropdownItem.name}
//                         </DropdownMenuItem>
//                       ))}
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 ) : (
//                   <Link
//                     href={item.href}
//                     className="font-medium text-gray-700 hover:text-primary transition-colors"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                   >
//                     {item.name}
//                   </Link>
//                 )}
//               </motion.div>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.header>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { BriefcaseIcon, Menu, X } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: 'Interview', href: '/interview' },
    { name: 'Cultural Fit', href: '/cultural-fit' }
  ]

  return (
    <motion.header
      className={`group fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4 transition-all duration-300 ${isScrolled ? "bg-white shadow-md text-white" : "bg-transparent text-transparent hover:bg-white group-hover:text-gray-700"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/")}
          className=" flex items-center gap-2 text-lg font-semibold cursor-pointer"
        >
          <BriefcaseIcon className={isScrolled ? "text-primary" : "text-white group-hover:text-primary"} />
          <span className={isScrolled ? "text-primary" : "text-white group-hover:text-primary"}>CareerBridge</span>
        </motion.div>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={`font-medium hover:text-primary transition-colors ${isScrolled ? "text-gray-700" : "text-white group-hover:text-gray-700"
                  }`}
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <SignedOut>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <SignInButton>
                <Button variant={isScrolled ? "default" : "secondary"}>Sign In</Button>
              </SignInButton>
            </motion.div>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={isScrolled ? "default" : "secondary"}
                onClick={() => router.push("/profile")}
                className={`${isScrolled ? " text-white" : "bg-transparent text-transparent group-hover:text-white group-hover:bg-blue-600"}`}
              >
                Profile
              </Button>
            </motion.div>
          </SignedIn>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? "text-primary" : "text-white group-hover:text-primary"} />
            ) : (
              <Menu className={isScrolled ? "text-primary" : "text-white group-hover:text-primary"} />
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
            className="lg:hidden mt-4"
          >
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-2"
              >

                <Link
                  href={item.href}
                  className="font-medium text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>

              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}