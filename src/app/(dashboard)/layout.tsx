// src/app/(dashboard)/layout.tsx
"use client";
import React from "react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Don't call useSidebar here — provider isn't mounted yet
	return (
		<SidebarProvider>
			<DashboardShell>{children}</DashboardShell>
		</SidebarProvider>
	);
}

function DashboardShell({ children }: { children: React.ReactNode }) {
	const { isExpanded, isHovered, isMobileOpen } = useSidebar();

	const mainContentMargin = isMobileOpen
		? "ml-0"
		: isExpanded || isHovered
		? "lg:ml-[290px]"
		: "lg:ml-[90px]";

	return (
		<div className="min-h-screen xl:flex">
			<AppSidebar />
			<Backdrop />
			<div
				className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
			>
				<AppHeader />
				<div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
					{children}
				</div>
			</div>
		</div>
	);
}
