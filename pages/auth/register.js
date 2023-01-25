import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../utils/firebase";
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
} from "firebase/auth";
export default function register() {
	const googleProvider = new GoogleAuthProvider();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const signUp = () => {
		createUserWithEmailAndPassword(auth, email, password).then((response) => {
			console.log(response.user);
			console.log(response.user.uid);
			sessionStorage.setItem(
				"Token",
				JSON.stringify({
					token: response.user.accessToken,
					userid: response.user.uid,
				})
			);
			router.push("/");
		});
	};
	const signUpwithGoogle = () => {
		signInWithPopup(auth, googleProvider).then((response) => {
			console.log(response.user);
		});
	};

	useEffect(() => {
		let token = sessionStorage.getItem("Token");
		if (token) {
			router.push("/dashboard");
		} else {
			router.push("/auth/register");
		}
	}, []);
	return (
		<>
			<h1>Register page</h1>
			<div className="container">
				<input
					placeholder="email"
					type={"email"}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					placeholder="password"
					type={"password"}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button onClick={signUp}>sign up with email</button>
				<button onChange={signUpwithGoogle}>signup with google</button>
			</div>
		</>
	);
}
