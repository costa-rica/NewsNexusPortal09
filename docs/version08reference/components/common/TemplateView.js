import styles from "../../styles/common/TemplateView.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../reducers/user";
import NavBarSideLink from "./navBarSide/NavBarSideLink";
import NavBarSideDropdown from "./navBarSide/NavBarSideDropdown";
import {
	// toggleNavExpandGetArticles,
	// toggleNavExpandManageArticles,
	// toggleNavExpandDb,
	// toggleNavExpandAdminGeneral,
	toggleNavExpandItem,
} from "../../reducers/user";
import { useSelector } from "react-redux";
export default function TemplateView({ children }) {
	const userReducer = useSelector((state) => state.user);
	const dispatch = useDispatch();

	const [menuOpen, setMenuOpen] = useState(true);
	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	const router = useRouter();

	// --- dynamic styles ---
	const menuWidth = "15rem";
	const { navigator } = router.query;
	const currentPath = navigator || router.pathname;

	return (
		<>
			<header
				className={`${styles.headerCustom} ${
					process.env.NEXT_PUBLIC_MODE !== "production"
						? styles.headerCustomNonProduction
						: ""
				}`}
			>
				<div className={styles.divHeaderLeft}>
					<img
						className={styles.imgNewsNexusLogo}
						src="/images/logoWhiteBackground.png"
						alt="NewsNexus Logo"
					/>
				</div>
				<div className={styles.divHeaderMiddle}>
					<div className={styles.divHeaderMiddleName}>
						{process.env.NEXT_PUBLIC_APP_NAME}
					</div>

					<div className={styles.divHeaderMiddleApiUrl}>
						{process.env.NEXT_PUBLIC_API_BASE_URL}
					</div>
				</div>
				<div className={styles.divHeaderRight}>
					{!menuOpen && (
						<button
							className={styles.hamburgerMenu}
							onClick={toggleMenu}
							aria-label="Toggle navigation menu"
						>
							<FontAwesomeIcon
								icon={faBars}
								className={styles.faHamburgerMenu}
							/>
						</button>
					)}
				</div>
			</header>
			<div className={styles.divMain}>
				<div
					className={styles.divLeftChildren}
					style={{ marginRight: menuOpen ? menuWidth : "0" }}
				>
					{children}
				</div>
				<div
					className={styles.divRightMenu}
					style={{
						display: menuOpen ? "block" : "none",
					}}
				>
					{menuOpen && (
						<div className={styles.divRightMenuClose}>
							<button
								className={styles.hamburgerMenu}
								onClick={toggleMenu}
								aria-label="Toggle navigation menu"
							>
								<FontAwesomeIcon icon={faXmark} className={styles.faXmark} />
							</button>
						</div>
					)}

					<div className={styles.divNavBarSideLinks}>
						<NavBarSideLink
							href="/"
							iconFilenameAndPath="/images/menu/house-solid.svg"
							label="Home"
						/>
						<NavBarSideLink
							href="/user-settings"
							iconFilenameAndPath="/images/menu/user-solid-white.svg"
							label="User Settings"
						/>
						{/* Get Articles */}
						<NavBarSideDropdown
							iconFilenameAndPath="/images/menu/satellite-dish-solid.svg"
							label="Get Articles"
							currentPath={currentPath}
							toggleFunction={() =>
								dispatch(toggleNavExpandItem("GetArticles"))
							}
							expanded={userReducer.navExpandObject.GetArticles}
						>
							<NavBarSideLink
								href="/articles/get-newsapi"
								style={{ padding: "0.25rem" }}
								label="News API"
								currentPath={currentPath}
							/>
							<NavBarSideLink
								href="/articles/get-gnews"
								style={{ padding: "0.25rem" }}
								label="GNews"
								currentPath={currentPath}
							/>
							<NavBarSideLink
								href="/articles/get-newsdataio"
								style={{ padding: "0.25rem" }}
								label="NewsDataIO"
								currentPath={currentPath}
							/>
							<NavBarSideLink
								href="/articles/automation"
								style={{ padding: "0.25rem" }}
								label="Automation & Browser Extension"
								currentPath={currentPath}
							/>
						</NavBarSideDropdown>

						{/* Manage Articles */}
						<NavBarSideDropdown
							iconFilenameAndPath="/images/menu/newspaper-solid-white.svg"
							label="Manage Articles"
							currentPath={currentPath}
							// toggleFunction={() => dispatch(toggleNavExpandManageArticles())}
							toggleFunction={() =>
								dispatch(toggleNavExpandItem("ManageArticles"))
							}
							expanded={userReducer.navExpandObject.ManageArticles}
						>
							<NavBarSideLink
								href="/articles/review"
								// iconFilenameAndPath="/images/menu/newspaper-solid-white.svg"
								label="Review Articles"
								style={{ padding: "0.25rem" }}
								currentPath={currentPath}
							/>
							<NavBarSideLink
								href="/articles/add-delete"
								// iconFilenameAndPath="/images/menu/newspaper-solid-white.svg"
								label="Add / Delete Article"
								style={{ padding: "0.25rem" }}
								currentPath={currentPath}
							/>
						</NavBarSideDropdown>

						{/* Reports & Analysis */}
						<NavBarSideDropdown
							iconFilenameAndPath="/images/menu/file-invoice-solid.svg"
							label="Reports & Analysis"
							currentPath={currentPath}
							// toggleFunction={() => dispatch(toggleNavExpandReportsAnalysis())}
							toggleFunction={() =>
								dispatch(toggleNavExpandItem("ReportsAnalysis"))
							}
							expanded={userReducer.navExpandObject.ReportsAnalysis}
						>
							<NavBarSideLink
								href="/reports-analysis/reports"
								label="Reports"
								style={{ padding: "0.25rem" }}
								currentPath={currentPath}
							/>
							<NavBarSideLink
								href="/reports-analysis/analysis-deduper"
								label="Duplicate Analysis"
								style={{ padding: "0.25rem" }}
								currentPath={currentPath}
							/>
							<NavBarSideLink
								href="/reports-analysis/analysis-requests"
								label="Requests Analysis"
								style={{ padding: "0.25rem" }}
								currentPath={currentPath}
							/>
							<NavBarSideLink
								href="/reports-analysis/analysis-counts-by-state"
								label="Counts By State Analysis"
								style={{ padding: "0.25rem" }}
								currentPath={currentPath}
								dateAdded="2025-05-28"
							/>
						</NavBarSideDropdown>

						{/* Manage DB */}
						{userReducer.isAdmin && (
							<NavBarSideDropdown
								iconFilenameAndPath="/images/menu/database-solid.svg"
								label="Manage DB"
								currentPath={currentPath}
								toggleFunction={() => dispatch(toggleNavExpandItem("ManageDb"))}
								expanded={userReducer.navExpandObject.ManageDb}
							>
								<NavBarSideLink
									href="/admin-db/manage-db-backups"
									label="Backups"
									style={{ padding: "0.25rem" }}
									currentPath={currentPath}
								/>
								<NavBarSideLink
									href="/admin-db/manage-db-uploads"
									label="Uploads"
									style={{ padding: "0.25rem" }}
									currentPath={currentPath}
								/>

								<NavBarSideLink
									href="/admin-db/manage-db-deletes"
									label="Deletes"
									style={{ padding: "0.25rem" }}
									currentPath={currentPath}
								/>
							</NavBarSideDropdown>
						)}

						{/* Admin General */}
						{userReducer.isAdmin && (
							<NavBarSideDropdown
								iconFilenameAndPath="/images/menu/user-tie-solid-white.svg"
								label="Admin"
								currentPath={currentPath}
								// toggleFunction={() => dispatch(toggleNavExpandAdminGeneral())}
								toggleFunction={() =>
									dispatch(toggleNavExpandItem("AdminGeneral"))
								}
								expanded={userReducer.navExpandObject.AdminGeneral}
							>
								<NavBarSideLink
									href="/admin-general/manage-users"
									label="Users"
									style={{ padding: "0.25rem" }}
									currentPath={currentPath}
								/>
								<NavBarSideLink
									href="/admin-general/manage-news-aggregators"
									label="News Aggregators"
									style={{ padding: "0.25rem" }}
									currentPath={currentPath}
								/>
							</NavBarSideDropdown>
						)}

						<NavBarSideLink
							href="/login"
							iconFilenameAndPath="/images/menu/logout.svg"
							label="Logout"
							onEnterFunction={() => dispatch(logoutUser())}
							currentPath={currentPath}
						/>
					</div>
					<div className={styles.divCredits}>
						<Link
							href="https://www.flaticon.com/free-icons/new"
							title="new icons"
						>
							New icons created by Pixel perfect - Flaticon
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}
