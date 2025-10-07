import type { Metadata } from "next";
import React from "react";
import { SummaryStatistics } from "@/components/common/SummaryStatistics";

export const metadata: Metadata = {
	title: "Review Articles",
	description: "The articles that need to be reviewed",
};

export default function ReviewArticles() {
	return (
		<div className="flex flex-col gap-4 md:gap-6">
			<h1 className="text-title-xl text-gray-700 dark:text-gray-300">
				Review Articles
			</h1>
			<SummaryStatistics />
		</div>
	);
}
