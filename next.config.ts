import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	webpack(config) {
		const assetRule = config.module.rules.find((r: any) =>
			r.test?.test?.(".svg")
		);
		if (assetRule) assetRule.exclude = /\.svg$/i;

		config.module.rules.push({
			test: /\.svg$/i,
			issuer: /\.[jt]sx?$/,
			use: ["@svgr/webpack"],
		});
		return config;
	},
};

export default nextConfig;
