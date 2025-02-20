module.exports = {
	content: ["./**/*.{html,js,ts}", "!./node_modules/**/*"],
	theme: {
		screens: {
			sm: '640px',
			md: '768px',
			md2: '900px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				heading: ["The Seasons", "serif"],
				body: ["Beiruti", "sans-serif"],
			},
		},
	},
	plugins: [],
};
