"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
	BoxCubeIcon,
	CalenderIcon,
	ChevronDownIcon,
	CloseIcon,
	DatabaseIcon,
	GridIcon,
	HorizontaLDots,
	ListIcon,
	NewspaperIcon,
	PageIcon,
	PieChartIcon,
	PlugInIcon,
	TableIcon,
	UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";

type NavItem = {
	name: string;
	icon: React.ReactNode;
	path?: string;
	subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
	{
		icon: <NewspaperIcon />,
		name: "Articles",
		subItems: [{ name: "Review", path: "/articles/review", pro: false }],
	},
	{
		name: "Analysis",
		icon: <PieChartIcon />,
		subItems: [
			{ name: "Request", path: "/analysis/request", pro: false },
			{ name: "State", path: "/analysis/state", pro: false },
		],
	},
];

const othersItems: NavItem[] = [
	{
		icon: <DatabaseIcon />,
		name: "Database",
		subItems: [
			{ name: "Backup", path: "/admin-database/backup", pro: false },
			{ name: "Upload", path: "/admin-database/upload", pro: false },
			{ name: "Delete", path: "/admin-database/delete", pro: false },
		],
	},
];

const AppSidebar: React.FC = () => {
	const {
		isExpanded,
		isMobileOpen,
		isHovered,
		setIsHovered,
		toggleSidebar,
		toggleMobileSidebar,
	} = useSidebar();
	const pathname = usePathname();

	const renderMenuItems = (
		navItems: NavItem[],
		menuType: "main" | "others"
	) => (
		<ul className="flex flex-col gap-4">
			{navItems.map((nav, index) => (
				<li key={nav.name}>
					{nav.subItems ? (
						<button
							onClick={() => handleSubmenuToggle(index, menuType)}
							className={`menu-item group  ${
								openSubmenu?.type === menuType && openSubmenu?.index === index
									? "menu-item-active"
									: "menu-item-inactive"
							} cursor-pointer ${
								!isExpanded && !isHovered
									? "lg:justify-center"
									: "lg:justify-start"
							}`}
						>
							<span
								className={` ${
									openSubmenu?.type === menuType && openSubmenu?.index === index
										? "menu-item-icon-active"
										: "menu-item-icon-inactive"
								}`}
							>
								{nav.icon}
							</span>
							{(isExpanded || isHovered || isMobileOpen) && (
								<span className={`menu-item-text`}>{nav.name}</span>
							)}
							{(isExpanded || isHovered || isMobileOpen) && (
								<ChevronDownIcon
									className={`ml-auto w-5 h-5 transition-transform duration-200  ${
										openSubmenu?.type === menuType &&
										openSubmenu?.index === index
											? "rotate-180 text-brand-500"
											: ""
									}`}
								/>
							)}
						</button>
					) : (
						nav.path && (
							<Link
								href={nav.path}
								className={`menu-item group ${
									isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
								}`}
							>
								<span
									className={`${
										isActive(nav.path)
											? "menu-item-icon-active"
											: "menu-item-icon-inactive"
									}`}
								>
									{nav.icon}
								</span>
								{(isExpanded || isHovered || isMobileOpen) && (
									<span className={`menu-item-text`}>{nav.name}</span>
								)}
							</Link>
						)
					)}
					{nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
						<div
							ref={(el) => {
								subMenuRefs.current[`${menuType}-${index}`] = el;
							}}
							className="overflow-hidden transition-all duration-300"
							style={{
								height:
									openSubmenu?.type === menuType && openSubmenu?.index === index
										? `${subMenuHeight[`${menuType}-${index}`]}px`
										: "0px",
							}}
						>
							<ul className="mt-2 space-y-1 ml-9">
								{nav.subItems.map((subItem) => (
									<li key={subItem.name}>
										<Link
											href={subItem.path}
											className={`menu-dropdown-item ${
												isActive(subItem.path)
													? "menu-dropdown-item-active"
													: "menu-dropdown-item-inactive"
											}`}
										>
											{subItem.name}
											<span className="flex items-center gap-1 ml-auto">
												{subItem.new && (
													<span
														className={`ml-auto ${
															isActive(subItem.path)
																? "menu-dropdown-badge-active"
																: "menu-dropdown-badge-inactive"
														} menu-dropdown-badge `}
													>
														new
													</span>
												)}
												{subItem.pro && (
													<span
														className={`ml-auto ${
															isActive(subItem.path)
																? "menu-dropdown-badge-active"
																: "menu-dropdown-badge-inactive"
														} menu-dropdown-badge `}
													>
														pro
													</span>
												)}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</li>
			))}
		</ul>
	);

	const [openSubmenu, setOpenSubmenu] = useState<{
		type: "main" | "others";
		index: number;
	} | null>(null);
	const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
		{}
	);
	const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

	// const isActive = (path: string) => path === pathname;
	const isActive = useCallback((path: string) => path === pathname, [pathname]);

	useEffect(() => {
		// Check if the current path matches any submenu item
		let submenuMatched = false;
		["main", "others"].forEach((menuType) => {
			const items = menuType === "main" ? navItems : othersItems;
			items.forEach((nav, index) => {
				if (nav.subItems) {
					nav.subItems.forEach((subItem) => {
						if (isActive(subItem.path)) {
							setOpenSubmenu({
								type: menuType as "main" | "others",
								index,
							});
							submenuMatched = true;
						}
					});
				}
			});
		});

		// If no submenu item matches, close the open submenu
		if (!submenuMatched) {
			setOpenSubmenu(null);
		}
	}, [pathname, isActive]);

	useEffect(() => {
		// Set the height of the submenu items when the submenu is opened
		if (openSubmenu !== null) {
			const key = `${openSubmenu.type}-${openSubmenu.index}`;
			if (subMenuRefs.current[key]) {
				setSubMenuHeight((prevHeights) => ({
					...prevHeights,
					[key]: subMenuRefs.current[key]?.scrollHeight || 0,
				}));
			}
		}
	}, [openSubmenu]);

	const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
		setOpenSubmenu((prevOpenSubmenu) => {
			if (
				prevOpenSubmenu &&
				prevOpenSubmenu.type === menuType &&
				prevOpenSubmenu.index === index
			) {
				return null;
			}
			return { type: menuType, index };
		});
	};

	const handleCloseSidebar = () => {
		if (window.innerWidth >= 1024) {
			toggleSidebar();
		} else {
			toggleMobileSidebar();
		}
	};

	return (
		<aside
			className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 right-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-l border-gray-200 
        ${
					isExpanded || isMobileOpen
						? "w-[290px]"
						: isHovered
						? "w-[290px]"
						: "w-[90px]"
				}
        ${isMobileOpen ? "translate-x-0" : "translate-x-full"}
        lg:translate-x-0`}
			onMouseEnter={() => !isExpanded && setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="absolute top-6 left-5 right-5 z-10 flex items-center justify-between">
				{(isExpanded || isMobileOpen) && (
					<button
						onClick={handleCloseSidebar}
						className="hidden lg:flex items-center justify-center text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
						aria-label="Close Sidebar"
					>
						<CloseIcon className="w-6 h-6" />
					</button>
				)}
				{(!isExpanded && !isMobileOpen) && <div />}
				<ThemeToggleButton />
			</div>
			<div className="pt-20 flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
				<nav className="mb-6">
					<div className="flex flex-col gap-4">
						<div>
							<h2
								className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
									!isExpanded && !isHovered
										? "lg:justify-center"
										: "justify-start"
								}`}
							>
								{isExpanded || isHovered || isMobileOpen ? (
									"Main"
								) : (
									<HorizontaLDots />
								)}
							</h2>
							{renderMenuItems(navItems, "main")}
						</div>

						<div className="">
							<h2
								className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
									!isExpanded && !isHovered
										? "lg:justify-center"
										: "justify-start"
								}`}
							>
								{isExpanded || isHovered || isMobileOpen ? (
									"Admin"
								) : (
									<HorizontaLDots />
								)}
							</h2>
							{renderMenuItems(othersItems, "others")}
						</div>
					</div>
				</nav>
				{isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
			</div>
		</aside>
	);
};

export default AppSidebar;
