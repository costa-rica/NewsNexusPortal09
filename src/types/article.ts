// Shared Article type for the application
export interface Article {
	id: number;
	title: string;
	publicationName: string;
	publishedDate: string;
	description: string;
	url: string;
	content?: string;
	isApproved?: boolean;
	isBeingReviewed?: boolean;
	isRelevant?: boolean;
	States?: Array<{ id: number; name: string }>;
	statesStringCommaSeparated?: string;
	requestQueryString?: string;
	nameOfOrg?: string;
	semanticRatingMax?: number | string;
	locationClassifierScore?: number | string;
}
