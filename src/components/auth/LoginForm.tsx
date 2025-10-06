"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { loginUser } from "@/store/features/user/userSlice";

// export default function SignInForm() {
export default function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [email, emailSetter] = useState(
		process.env.NEXT_PUBLIC_MODE === "workstation"
			? "nickrodriguez@kineticmetrics.com"
			: ""
	);
	const [password, passwordSetter] = useState(
		process.env.NEXT_PUBLIC_MODE === "workstation" ? "test" : ""
	);
	const dispatch = useAppDispatch();
	const router = useRouter();
	// const userReducer = useSelector((state) => state.user);
	const userReducer = useAppSelector((s) => s.user);

	const handleClickLogin = async () => {
		console.log(
			"Login ---> API URL:",
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`
		);
		console.log("- handleClickLogin 👀");
		console.log("- email:", email);

		const bodyObj = { email, password };

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(bodyObj),
			}
		);

		console.log("Received response:", response.status);

		let resJson = null;
		const contentType = response.headers.get("Content-Type");

		if (contentType?.includes("application/json")) {
			resJson = await response.json();
		}

		if (response.ok) {
			// if (resJson.user.isAdminForKvManagerWebsite) {
			console.log(resJson);
			resJson.email = email;
			try {
				dispatch(loginUser(resJson));
				router.push("/articles/review");
			} catch (error) {
				console.error("Error logging in:", error);
				alert("Error logging in");
			}
		} else {
			const errorMessage =
				resJson?.error || `There was a server error: ${response.status}`;
			alert(errorMessage);
		}
	};

	return (
		<div className="flex flex-col flex-1 lg:w-1/2 w-full">
			<div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
				<Link
					href="/"
					className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
				>
					<ChevronLeftIcon />
					Back to dashboard
				</Link>
			</div>
			<div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
				<div>
					<div className="mb-5 sm:mb-8">
						<h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
							Sign In
						</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Enter your email and password to sign in!
						</p>
					</div>
					<div>
						<form>
							<div className="space-y-6">
								<div>
									<Label>
										Email <span className="text-error-500">*</span>{" "}
									</Label>
									<Input
										placeholder="info@gmail.com"
										type="email"
										value={email}
										onChange={(e) => emailSetter(e.target.value)}
									/>
								</div>
								<div>
									<Label>
										Password <span className="text-error-500">*</span>{" "}
									</Label>
									<div className="relative">
										<Input
											type={showPassword ? "text" : "password"}
											placeholder="Enter your password"
										/>
										<span
											onClick={() => setShowPassword(!showPassword)}
											className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
										>
											{showPassword ? (
												<EyeIcon className="fill-gray-500 dark:fill-gray-400" />
											) : (
												<EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
											)}
										</span>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Checkbox checked={isChecked} onChange={setIsChecked} />
										<span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
											Keep me logged in
										</span>
									</div>
									<Link
										href="/reset-password"
										className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
									>
										Forgot password?
									</Link>
								</div>
								<div>
									<Button
										type="button"
										className="w-full"
										size="sm"
										// onClick={handleClickLogin}
										onClick={() => {
											console.log("Submitted email:", email);
											console.log("Submitted password:", password);
											handleClickLogin();
											// You can call your submit logic or dispatch here
										}}
									>
										Sign in
									</Button>
								</div>
							</div>
						</form>

						<div className="mt-5">
							<p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
								Don&apos;t have an account? {""}
								<Link
									href="/signup"
									className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
								>
									Sign Up
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
