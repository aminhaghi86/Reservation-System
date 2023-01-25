import { auth, db } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
////
import { getDocs } from "firebase/firestore";

//

export default function Dashboard() {
	const route = useRouter();
	const [user, loading] = useAuthState(auth);
	const [date, setDate] = useState("");
	const [array, setArray] = useState([]);
	const [isDisabled, setIsDisabled] = useState(false);
	console.log(user);
	useEffect(() => {
		console.log("rendered");
		console.log(array);
		handleAmin();
	}, [array]);
	const handleAmin = async () => {
		const querySnapshot = await getDocs(collection(db, "users"));
		querySnapshot.forEach((doc) => {
			// doc.data() is never undefined for query doc snapshots
			console.log(doc.id, " => ", doc.data());
		});
	};

	const handleClick = async () => {
		date === ""
			? console.log("error")
			: //

			  //
			  setArray([
					...array,
					{
						date: date,
						username: user.displayName,
						email: user.email,
					},
			  ]);
		try {
			const docRef = await addDoc(collection(db, "users"), {
				date: date,
				username: user.displayName,
				email: user.email,
			});
			console.log("Document written with ID: ", docRef.id);
		} catch (e) {
			console.error("Error adding document: ", e);
		}
		setIsDisabled(!isDisabled);
	};
	if (loading) return <h1>Loading</h1>;
	if (!user) route.push("/auth/login");
	if (user)
		return (
			<div>
				<input
					disabled={isDisabled}
					value={date}
					required
					onChange={(e) => setDate(e.target.value)}
					type={"date"}
				/>
				<button onClick={handleClick}>submit date</button>
				<h1>Welcome to your dashboard {user.displayName}</h1>
				<button onClick={() => auth.signOut()}>Sign out</button>
				{array.map((el) => {
					return (
						<>
							<h3>{el.displayName}</h3>
							<h4>{el.date}</h4>
							<h5>{el.email}</h5>
						</>
					);
				})}
			</div>
		);
}
