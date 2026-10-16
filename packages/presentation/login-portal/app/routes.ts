import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	index("./routes/home.tsx"),
	route("/sign-in", "./routes/sign-in.tsx"),
	route("/sign-up", "./routes/sign-up.tsx"),
	route("/forgot-password", "./routes/forgot-password.tsx"),
	route("/reset-password", "./routes/reset-password.tsx"),
	route("/confirm-account", "./routes/confirm-account.tsx"),
] satisfies RouteConfig;
