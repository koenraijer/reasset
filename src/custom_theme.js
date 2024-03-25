export const custom_theme = {
    name: 'custom_theme',
    properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-family-heading": `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "9999px",
		"--theme-rounded-container": "6px",
		"--theme-border-base": "2px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "255 255 255",
		"--on-secondary": "0 0 0",
		"--on-tertiary": "0 0 0",
		"--on-success": "255 255 255",
		"--on-warning": "255 255 255",
		"--on-error": "255 255 255",
		"--on-surface": "255 255 255",
		// =~= Theme Colors  =~=
		// primary | #3a0ca3 
		"--color-primary-50": "225 219 241", // #e1dbf1
		"--color-primary-100": "216 206 237", // #d8ceed
		"--color-primary-200": "206 194 232", // #cec2e8
		"--color-primary-300": "176 158 218", // #b09eda
		"--color-primary-400": "117 85 191", // #7555bf
		"--color-primary-500": "58 12 163", // #3a0ca3
		"--color-primary-600": "52 11 147", // #340b93
		"--color-primary-700": "44 9 122", // #2c097a
		"--color-primary-800": "35 7 98", // #230762
		"--color-primary-900": "28 6 80", // #1c0650
		// secondary | #4cc9f0 
		"--color-secondary-50": "228 247 253", // #e4f7fd
		"--color-secondary-100": "219 244 252", // #dbf4fc
		"--color-secondary-200": "210 242 251", // #d2f2fb
		"--color-secondary-300": "183 233 249", // #b7e9f9
		"--color-secondary-400": "130 217 245", // #82d9f5
		"--color-secondary-500": "76 201 240", // #4cc9f0
		"--color-secondary-600": "68 181 216", // #44b5d8
		"--color-secondary-700": "57 151 180", // #3997b4
		"--color-secondary-800": "46 121 144", // #2e7990
		"--color-secondary-900": "37 98 118", // #256276
		// tertiary | #f9e84d 
		"--color-tertiary-50": "254 252 228", // #fefce4
		"--color-tertiary-100": "254 250 219", // #fefadb
		"--color-tertiary-200": "254 249 211", // #fef9d3
		"--color-tertiary-300": "253 246 184", // #fdf6b8
		"--color-tertiary-400": "251 239 130", // #fbef82
		"--color-tertiary-500": "249 232 77", // #f9e84d
		"--color-tertiary-600": "224 209 69", // #e0d145
		"--color-tertiary-700": "187 174 58", // #bbae3a
		"--color-tertiary-800": "149 139 46", // #958b2e
		"--color-tertiary-900": "122 114 38", // #7a7226
		// success | #72fa78 
		"--color-success-50": "234 254 235", // #eafeeb
		"--color-success-100": "227 254 228", // #e3fee4
		"--color-success-200": "220 254 221", // #dcfedd
		"--color-success-300": "199 253 201", // #c7fdc9
		"--color-success-400": "156 252 161", // #9cfca1
		"--color-success-500": "114 250 120", // #72fa78
		"--color-success-600": "103 225 108", // #67e16c
		"--color-success-700": "86 188 90", // #56bc5a
		"--color-success-800": "68 150 72", // #449648
		"--color-success-900": "56 123 59", // #387b3b
		// warning | #ff9300 
		"--color-warning-50": "255 239 217", // #ffefd9
		"--color-warning-100": "255 233 204", // #ffe9cc
		"--color-warning-200": "255 228 191", // #ffe4bf
		"--color-warning-300": "255 212 153", // #ffd499
		"--color-warning-400": "255 179 77", // #ffb34d
		"--color-warning-500": "255 147 0", // #ff9300
		"--color-warning-600": "230 132 0", // #e68400
		"--color-warning-700": "191 110 0", // #bf6e00
		"--color-warning-800": "153 88 0", // #995800
		"--color-warning-900": "125 72 0", // #7d4800
		// error | #ff2600 
		"--color-error-50": "255 222 217", // #ffded9
		"--color-error-100": "255 212 204", // #ffd4cc
		"--color-error-200": "255 201 191", // #ffc9bf
		"--color-error-300": "255 168 153", // #ffa899
		"--color-error-400": "255 103 77", // #ff674d
		"--color-error-500": "255 38 0", // #ff2600
		"--color-error-600": "230 34 0", // #e62200
		"--color-error-700": "191 29 0", // #bf1d00
		"--color-error-800": "153 23 0", // #991700
		"--color-error-900": "125 19 0", // #7d1300
		// surface | #212121 
		"--color-surface-50": "222 222 222", // #dedede
		"--color-surface-100": "211 211 211", // #d3d3d3
		"--color-surface-200": "200 200 200", // #c8c8c8
		"--color-surface-300": "166 166 166", // #a6a6a6
		"--color-surface-400": "100 100 100", // #646464
		"--color-surface-500": "33 33 33", // #212121
		"--color-surface-600": "30 30 30", // #1e1e1e
		"--color-surface-700": "25 25 25", // #191919
		"--color-surface-800": "20 20 20", // #141414
		"--color-surface-900": "16 16 16", // #101010
		
	}
}
