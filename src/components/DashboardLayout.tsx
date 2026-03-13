"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Avatar";
import { Menu, X } from "lucide-react";
import { NotificationButton } from "./notifications/NotificationButton";
import Image from "next/image";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/tasks", label: "Tasks" },
    ...(isAdminOrManager ? [{ href: "/users", label: "Users" }] : []),
    { href: "/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-white/10 bg-slate-900/60 px-6 py-4 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-screen items-center justify-between">
          <Link href="/">
            <div className="flex gap-4 items-center">
              <Image
                alt=""
                src="/logo.png"
                width={50}
                height={50}
                className="rounded-lg"
              />
              <div>
                <p className="text-sm">Good day,</p>{" "}
                <p className="font-semibold text-secondary-400">
                  {user?.fullName}
                </p>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-secondary-400 transition"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <NotificationButton />
              {/* <Avatar
                src={user?.profilePicture}
                alt={user?.fullName}
                size={32}
              /> */}
              <button
                onClick={logout}
                className="rounded-full border border-white/10 px-3 py-1 text-xs hover:text-primary-400 transition"
              >
                Logout
              </button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex gap-2 md:hidden">
            <NotificationButton />
            <button
              className="p-2 text-slate-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-white/10 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-slate-300 active:text-primary-400"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-white/5 my-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.profilePicture}
                  alt={user?.fullName}
                  size={32}
                />
                <span className="text-sm">{user?.fullName}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-primary-400 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-screen px-6 py-10 flex-1">
        {children}
      </main>
    </div>
  );
};
