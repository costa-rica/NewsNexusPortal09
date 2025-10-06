// // src/store/features/user/userSlice.ts
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export type UserState = {
// 	id?: string;
// 	email?: string;
// 	token?: string; // JWT or session token (optional)
// };

// const initialState: UserState = {};

// const userSlice = createSlice({
// 	name: "user",
// 	initialState,
// 	reducers: {
// 		setUser: (state, action: PayloadAction<UserState>) => ({
// 			...state,
// 			...action.payload,
// 		}),
// 		clearUser: () => ({}),
// 	},
// });

// export const { setUser, clearUser } = userSlice.actions;
// export default userSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export interface NavExpandObject {
// 	GetArticles: boolean;
// 	ManageArticles: boolean;
// 	ManageDb: boolean;
// 	AdminGeneral: boolean;
// 	ReportsAnalysis: boolean;
// }

export interface RequestTableBodyParams {
	includeIsFromAutomation: boolean;
	dateLimitOnRequestMade: string | null;
}

export interface ArticleTableBodyParams {
	returnOnlyThisPublishedDateOrAfter: string | null;
	returnOnlyThisCreatedAtDateOrAfter: string | null;
	returnOnlyIsNotApproved: boolean;
	returnOnlyIsRelevant: boolean;
}

export interface RequestsAnalysisTableBodyParams {
	dateRequestsLimit: string | null;
}

export interface UserState {
	token: string | null;
	username: string | null;
	email: string | null;
	isAdmin: boolean;
	stateArray: any[];
	articlesSummaryStatistics: Record<string, any>;
	hideIrrelevant: boolean;
	hideApproved?: boolean;
	// navExpandObject: NavExpandObject;
	requestTableBodyParams: RequestTableBodyParams;
	articleTableBodyParams: ArticleTableBodyParams;
	approvedArticlesArray: any[];
	requestsAnalysisTableBodyParams: RequestsAnalysisTableBodyParams;
}

const initialState: UserState = {
	token: null,
	username: null,
	email: null,
	isAdmin: false,
	stateArray: [],
	articlesSummaryStatistics: {},
	hideIrrelevant: false,
	hideApproved: false,
	// navExpandObject: {
	// 	GetArticles: false,
	// 	ManageArticles: false,
	// 	ManageDb: false,
	// 	AdminGeneral: false,
	// 	ReportsAnalysis: false,
	// },
	requestTableBodyParams: {
		includeIsFromAutomation: false,
		dateLimitOnRequestMade: null,
	},
	articleTableBodyParams: {
		returnOnlyThisPublishedDateOrAfter: null,
		returnOnlyThisCreatedAtDateOrAfter: null,
		returnOnlyIsNotApproved: true,
		returnOnlyIsRelevant: true,
	},
	approvedArticlesArray: [],
	requestsAnalysisTableBodyParams: {
		dateRequestsLimit: null,
	},
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		loginUser: (
			state,
			action: PayloadAction<{
				token: string;
				user: { username: string; email: string; isAdmin?: boolean };
			}>
		) => {
			state.token = action.payload.token;
			state.username = action.payload.user.username || "some_name";
			state.email = action.payload.user.email || "some_name@mail.com";
			state.isAdmin = action.payload.user.isAdmin || false;
		},

		logoutUser: (state) => {
			state.token = null;
			state.username = null;
			state.email = null;
		},

		updateStateArray: (state, action: PayloadAction<any[]>) => {
			state.stateArray = action.payload;
		},

		updateArticlesSummaryStatistics: (
			state,
			action: PayloadAction<Record<string, any>>
		) => {
			state.articlesSummaryStatistics = action.payload;
		},

		toggleHideIrrelevant: (state) => {
			state.hideIrrelevant = !state.hideIrrelevant;
			state.articleTableBodyParams.returnOnlyIsRelevant = state.hideIrrelevant;
		},

		toggleHideApproved: (state) => {
			state.hideApproved = !state.hideApproved;
			state.articleTableBodyParams.returnOnlyIsNotApproved = state.hideApproved;
		},

		// toggleNavExpandItem: (
		// 	state,
		// 	action: PayloadAction<keyof NavExpandObject>
		// ) => {
		// 	const item = action.payload;
		// 	state.navExpandObject[item] = !state.navExpandObject[item];
		// },

		updateRequestTableBodyParams: (
			state,
			action: PayloadAction<Partial<RequestTableBodyParams>>
		) => {
			state.requestTableBodyParams = {
				...state.requestTableBodyParams,
				...action.payload,
			};
		},

		updateArticleTableBodyParams: (
			state,
			action: PayloadAction<Partial<ArticleTableBodyParams>>
		) => {
			state.articleTableBodyParams = {
				...state.articleTableBodyParams,
				...action.payload,
			};
		},

		updateApprovedArticlesArray: (state, action: PayloadAction<any[]>) => {
			state.approvedArticlesArray = action.payload;
		},

		logoutUserFully: (state) => {
			state.token = null;
			state.username = null;
			state.email = null;
			state.isAdmin = false;
			state.stateArray = [];
			state.articlesSummaryStatistics = {};
			state.hideIrrelevant = false;
			state.hideApproved = false;
			state.requestTableBodyParams = {
				includeIsFromAutomation: false,
				dateLimitOnRequestMade: null,
			};
			state.articleTableBodyParams = {
				returnOnlyThisPublishedDateOrAfter: null,
				returnOnlyThisCreatedAtDateOrAfter: null,
				returnOnlyIsNotApproved: true,
				returnOnlyIsRelevant: true,
			};
			state.approvedArticlesArray = [];
			// state.navExpandObject = {
			// 	GetArticles: false,
			// 	ManageArticles: false,
			// 	ManageDb: false,
			// 	AdminGeneral: false,
			// 	ReportsAnalysis: false,
			// };
			console.log("-----> Finished Super Logout !!!");
		},

		updateRequestsAnalysisTableBodyParams: (
			state,
			action: PayloadAction<Partial<RequestsAnalysisTableBodyParams>>
		) => {
			state.requestsAnalysisTableBodyParams = {
				...state.requestsAnalysisTableBodyParams,
				...action.payload,
			};
		},
	},
});

export const {
	loginUser,
	logoutUser,
	updateStateArray,
	updateArticlesSummaryStatistics,
	toggleHideIrrelevant,
	toggleHideApproved,
	// toggleNavExpandItem,
	updateRequestTableBodyParams,
	updateArticleTableBodyParams,
	updateApprovedArticlesArray,
	logoutUserFully,
	updateRequestsAnalysisTableBodyParams,
} = userSlice.actions;

export default userSlice.reducer;
