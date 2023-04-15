import { auth, db } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { getDocs } from "firebase/firestore";
import BookAppointment from "./BookAppointment";
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
	}, []);
	const handleAmin = async () => {
		const querySnapshot = await getDocs(collection(db, "users"));
		querySnapshot.forEach((doc) => {
			console.log(doc.id, " => ", doc.data());
			setArray([...array, doc.data()]);
		});
	};
	if (loading) return <h1>Loading</h1>;
	if (!user) route.push("/auth/login");
	if (user)
		return (
			<>
				<div>
					<h1>Welcome to your dashboard {user.displayName}</h1>
					<button onClick={() => auth.signOut()}>Sign out</button>
					{array.map((el) => {
						return (
							<div key={el.id}>
								<h3>{el.username}</h3>
								<h4>{el.time}</h4>
								<h5>{el.email}</h5>
							</div>
						);
					})}
				</div>

				<BookAppointment />
			</>
		);
}
