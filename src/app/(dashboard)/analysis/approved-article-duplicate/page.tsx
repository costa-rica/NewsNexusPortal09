import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "Approved Article Duplicate",
	description: "Approved article duplicate operations",
};

export default function ApprovedArticleDuplicate() {
	return (
		<div className="grid grid-cols-12 gap-4 md:gap-6">
			<h1 className="text-title-xl text-gray-700 dark:text-gray-300">
				Approved Article Duplicate
			</h1>
		</div>
	);
}
