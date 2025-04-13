"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
  className,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  className?: string;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      <div className={cn("relative h-full", className)}>
        {children}
      </div>
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      {/* Only render one sidebar based on screen size using client-side detection */}
      <div className="hidden md:block">
        <DesktopSidebar {...props} />
      </div>
      <div className="block md:hidden">
        <MobileSidebar {...props} />
      </div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <div className="mobile-sidebar-container">
      <motion.div
        className={cn(
          "mobile-sidebar h-full flex flex-col bg-neutral-900 dark:bg-[#13132b] border-l border-[#3a3a5c] fixed right-0",
          open ? "w-[300px] px-4 py-4" : "w-[60px] px-0 py-4",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "60px",
        }}
        style={{ height: 'calc(100vh - 61px)' }}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <div className="relative hidden md:block h-full">
      <motion.div
        className={cn(
          "h-full hidden md:flex md:flex-col bg-neutral-900 dark:bg-[#13132b] w-[300px] flex-shrink-0 border-l border-[#3a3a5c] absolute right-0 overflow-y-auto",
          open ? "px-4 py-4" : "px-0 py-4",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        style={{ height: 'calc(100vh - 60px)' }}
        {...props}
      >
        {children}
      </motion.div>
      {/* Toggle button moved to header */}
    </div>
  );
};

// Old MobileSidebar removed to fix duplicate declaration

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();

  const handleClick = (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
  };

  return (
    <Link
      href={link.href}
      className={cn(
        "inline-flex items-center text-neutral-200 hover:text-white",
        open ? "px-2 py-2 justify-start" : "px-0 py-3 justify-center",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className={cn(
        "inline-flex items-center justify-center",
        open ? "mr-3" : "text-xl w-full sidebar-icon-collapsed"
      )}>
        <span className="sidebar-icon">{link.icon}</span>
      </span>
      {open && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="inline-flex items-center text-neutral-200 dark:text-neutral-200 text-sm transition duration-150"
        >
          {link.label}
        </motion.span>
      )}
    </Link>
  );
};
