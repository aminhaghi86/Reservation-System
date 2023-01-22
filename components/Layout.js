import React from "react";
import Nav from "./Nav";

const Layout = ({ children }) => {
	return (
		<div className="mx-14">
			<Nav />
			<main>{children}</main>
		</div>
	);
};

export default Layout;
