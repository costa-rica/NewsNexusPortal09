import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "Database Backup",
	description: "Backup database operations",
};

export default function DatabaseBackup() {
	return (
		<div className="grid grid-cols-12 gap-4 md:gap-6">
			<h1 className="text-title-xl text-gray-700 dark:text-gray-300">
				Database Backup
			</h1>
		</div>
	);
}
