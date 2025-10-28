"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateStateArray } from "@/store/features/user/userSlice";
import { SummaryStatistics } from "@/components/common/SummaryStatistics";
import TableReviewArticles from "@/components/tables/TableReviewArticles";
import MultiSelect from "@/components/form/MultiSelect";
import { Modal } from "@/components/ui/modal";
import type { Article } from "@/types/article";

interface State {
	id: number;
	name: string;
}

interface NewArticle {
	id?: number;
	publicationName?: string;
	title?: string;
	url?: string;
	publishedDate?: string;
	content?: string;
	States?: State[];
}

export default function AddDeleteArticle() {
	const dispatch = useAppDispatch();
	const { token, stateArray = [], articleTableBodyParams } = useAppSelector(
		(state) => state.user
	);

	const [newArticle, setNewArticle] = useState<NewArticle>({});
	const [articlesArray, setArticlesArray] = useState<Article[]>([]);
	const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
	const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
	const [inputErrors, setInputErrors] = useState({
		publicationName: false,
		title: false,
		publishedDate: false,
		content: false,
	});
	const [loadingTable, setLoadingTable] = useState(false);

	const updateStateArrayWithArticleState = useCallback((article: { States?: State[] }) => {
		if (!article?.States) {
			const tempStatesArray = stateArray.map((stateObj) => ({
				...stateObj,
				selected: false,
			}));
			dispatch(updateStateArray(tempStatesArray));
			return;
		}
		const articleStateIds = article.States.map((state) => state.id);
		const tempStatesArray = stateArray.map((stateObj) => {
			if (articleStateIds.includes(stateObj.id)) {
				return { ...stateObj, selected: true };
			} else {
				return { ...stateObj, selected: false };
			}
		});
		dispatch(updateStateArray(tempStatesArray));
	}, [dispatch, stateArray]);

	const fetchArticlesArray = useCallback(async () => {
		if (!token) return;

		try {
			setLoadingTable(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/articles`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					method: "POST",
					body: JSON.stringify(articleTableBodyParams),
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			const result = await response.json();

			if (result.articlesArray && Array.isArray(result.articlesArray)) {
				setArticlesArray(result.articlesArray);
			} else {
				setArticlesArray([]);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			setArticlesArray([]);
		} finally {
			setLoadingTable(false);
		}
	}, [token, articleTableBodyParams]);

	useEffect(() => {
		fetchArticlesArray();
		updateStateArrayWithArticleState({ States: [] });
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchArticlesArray]);

	const handleAddAndSubmitArticle = async () => {
		if (!token) return;

		const selectedStateObjs = stateArray.filter((st) => st.selected);
		const errors = {
			publicationName: !newArticle.publicationName,
			title: !newArticle.title,
			publishedDate: !newArticle.publishedDate,
			content: !newArticle.content,
		};
		setInputErrors(errors);

		if (
			!newArticle.publicationName ||
			!newArticle.title ||
			!newArticle.publishedDate ||
			!newArticle.content
		) {
			alert(
				"Please fill in all required fields: publication name, title, published date, content"
			);
			return;
		}

		if (selectedStateObjs.length === 0) {
			alert("Please select at least one state");
			return;
		}

		const updatedArticle = {
			...newArticle,
			stateObjArray: selectedStateObjs,
			isApproved: true,
			kmNotes: "added manually",
		};

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/add-article`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(updatedArticle),
				}
			);

			const resJson = await response.json();

			if (response.status === 400) {
				alert(resJson.message);
				return;
			} else {
				alert("Successfully added article");
				const blankArticle = {
					publicationName: "",
					title: "",
					url: "",
					publishedDate: "",
					content: "",
					States: [],
				};
				setNewArticle(blankArticle);
				updateStateArrayWithArticleState(blankArticle);
			}
		} catch (error) {
			console.error("Error adding article:", error);
		}
		fetchArticlesArray();
	};

	const handleSelectArticleFromTable = async (article: Article) => {
		if (!token) return;

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/get-approved/${article.id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			const result = await response.json();

			if (result.article && result.article.id) {
				setSelectedArticle({
					...result.article,
					...article,
					content: result.content,
				});
				setNewArticle({
					...result.article,
					...article,
					content: result.content,
				});
				updateStateArrayWithArticleState(article);
			} else {
				setSelectedArticle({ ...article, content: article.description });
				setNewArticle({ ...article, content: article.description });
				updateStateArrayWithArticleState(article);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const handleDeleteArticle = async (article: Article) => {
		setArticleToDelete(article);
		setIsOpenDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!token || !articleToDelete) return;

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/${articleToDelete.id}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.status !== 200) {
				console.log(`There was a server error: ${response.status}`);
				return;
			}

			const tempArticlesArray = articlesArray.filter(
				(article) => article.id !== articleToDelete.id
			);
			setArticlesArray(tempArticlesArray);
			setSelectedArticle(null);
			setNewArticle({});
			updateStateArrayWithArticleState({ States: [] });
			alert("Article deleted successfully!");
		} catch (error) {
			console.error("Error deleting article:", error);
		} finally {
			setIsOpenDeleteModal(false);
			setArticleToDelete(null);
		}
	};

	return (
		<div className="flex flex-col gap-4 md:gap-6">
			{/* Summary Statistics */}
			<SummaryStatistics />

			<h1 className="text-title-xl text-gray-700 dark:text-gray-300">
				Add / Delete Article
			</h1>

			{/* Form Section */}
			<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
				<div className="space-y-4">
					{/* Publication Name */}
					<div className="flex flex-col gap-2">
						<label
							htmlFor="publicationName"
							className="text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Publication Name: <span className="text-red-500">*</span>
						</label>
						<input
							id="publicationName"
							type="text"
							value={newArticle?.publicationName || ""}
							className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white max-w-2xl ${
								inputErrors.publicationName
									? "border-red-500"
									: "border-gray-300 dark:border-gray-700"
							}`}
							onChange={(e) =>
								setNewArticle({
									...newArticle,
									publicationName: e.target.value,
								})
							}
						/>
					</div>

					{/* Title */}
					<div className="flex flex-col gap-2">
						<label
							htmlFor="title"
							className="text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Title: <span className="text-red-500">*</span>
						</label>
						<input
							id="title"
							type="text"
							value={newArticle?.title || ""}
							className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white max-w-2xl ${
								inputErrors.title
									? "border-red-500"
									: "border-gray-300 dark:border-gray-700"
							}`}
							onChange={(e) =>
								setNewArticle({ ...newArticle, title: e.target.value })
							}
						/>
					</div>

					{/* URL */}
					<div className="flex flex-col gap-2">
						<label
							htmlFor="url"
							className="text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							URL:
						</label>
						<input
							id="url"
							type="text"
							value={newArticle?.url || ""}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white max-w-2xl"
							onChange={(e) =>
								setNewArticle({ ...newArticle, url: e.target.value })
							}
						/>
					</div>

					{/* Published Date */}
					<div className="flex flex-col gap-2">
						<label
							htmlFor="publishedDate"
							className="text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Published Date: <span className="text-red-500">*</span>
						</label>
						<input
							id="publishedDate"
							type="date"
							value={newArticle?.publishedDate || ""}
							className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white max-w-xs ${
								inputErrors.publishedDate
									? "border-red-500"
									: "border-gray-300 dark:border-gray-700"
							}`}
							onChange={(e) =>
								setNewArticle({ ...newArticle, publishedDate: e.target.value })
							}
						/>
					</div>

					{/* Article State */}
					<div className="flex flex-col gap-2">
						<div className="max-w-xs">
							<MultiSelect
								label="Article State"
								options={stateArray.map((state) => ({
									value: state.id.toString(),
									text: state.name,
									selected: state.selected,
								}))}
								defaultSelected={stateArray
									.filter((s) => s.selected)
									.map((s) => s.id.toString())}
								onChange={(selectedValues) => {
									const updated = stateArray.map((state) => ({
										...state,
										selected: selectedValues.includes(state.id.toString()),
									}));
									dispatch(updateStateArray(updated));
								}}
							/>
						</div>
					</div>

					{/* Content */}
					<div className="flex flex-col gap-2">
						<label
							htmlFor="content"
							className="text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Content: <span className="text-red-500">*</span>
						</label>
						<textarea
							id="content"
							value={newArticle?.content || ""}
							className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white min-h-[200px] ${
								inputErrors.content
									? "border-red-500"
									: "border-gray-300 dark:border-gray-700"
							}`}
							onChange={(e) =>
								setNewArticle({
									...newArticle,
									content: e.target.value,
								})
							}
						/>
					</div>

					{/* Buttons */}
					<div className="flex gap-3 pt-2">
						{newArticle?.id ? (
							<button
								onClick={() => {
									setNewArticle({});
									updateStateArrayWithArticleState({ States: [] });
								}}
								className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							>
								Clear
							</button>
						) : (
							<button
								onClick={handleAddAndSubmitArticle}
								className="px-6 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700"
							>
								Submit
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Articles Table */}
			<TableReviewArticles
				data={articlesArray}
				selectedRowId={selectedArticle?.id}
				loading={loadingTable}
				showDeleteColumn={true}
				onSelectArticle={handleSelectArticleFromTable}
				onDeleteArticle={handleDeleteArticle}
			/>

			{/* Delete Confirmation Modal */}
			{isOpenDeleteModal && articleToDelete && (
				<Modal
					isOpen={isOpenDeleteModal}
					onClose={() => setIsOpenDeleteModal(false)}
				>
					<div className="p-6">
						<h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
							Are you sure?
						</h2>
						<div className="mb-6 space-y-2">
							<p className="text-gray-700 dark:text-gray-300">
								Delete Article ID: {articleToDelete.id}
							</p>
							<p className="font-bold text-gray-800 dark:text-white">
								{articleToDelete.title}
							</p>
							<p className="text-gray-600 dark:text-gray-400">
								This action cannot be undone.
							</p>
						</div>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setIsOpenDeleteModal(false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							>
								Cancel
							</button>
							<button
								onClick={confirmDelete}
								className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
							>
								Delete
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
}
