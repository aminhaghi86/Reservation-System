import { useState, useEffect } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db, auth } from "../utils/firebase";
import { useRouter } from "next/router";
import {
	collection,
	addDoc,
	query,
	where,
	getDocs,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const APPOINTMENTS_COLLECTION = "appointments";
const TIME_FIELD = "time";
const USER_ID_FIELD = "userId";

function BookAppointment() {
	const router = useRouter();
	const [selectedTime, setSelectedTime] = useState(null);
	const [bookedAppointment, setBookedAppointment] = useState(null);
	const [loading, setLoading] = useState(true);
	const [bookedAppointments, error] = useCollectionData(
		collection(db, APPOINTMENTS_COLLECTION)
	);
	const [availableTimes, setAvailableTimes] = useState([
		{ time: "9:00am", available: true },
		{ time: "9:30am", available: true },
		{ time: "10:00am", available: true },
		{ time: "10:30am", available: true },
		{ time: "11:00am", available: true },
		{ time: "11:30am", available: true },
		{ time: "12:00pm", available: true },
		{ time: "12:30pm", available: true },
		{ time: "1:00pm", available: true },
		{ time: "1:30pm", available: true },
		{ time: "2:00pm", available: true },
		{ time: "2:30pm", available: true },
		{ time: "3:00pm", available: true },
		{ time: "3:30pm", available: true },
		{ time: "4:00pm", available: true },
		{ time: "4:30pm", available: true },
	]);
	useEffect(() => {
		const fetchBookedAppointment = async () => {
			const userAppointmentsQuery = query(
				collection(db, APPOINTMENTS_COLLECTION),
				where(USER_ID_FIELD, "==", auth.currentUser.uid)
			);
			const userAppointmentsSnapshot = await getDocs(userAppointmentsQuery);
			if (!userAppointmentsSnapshot.empty) {
				const appointmentDoc = userAppointmentsSnapshot.docs[0];
				const appointmentData = appointmentDoc.data();
				setBookedAppointment({
					...appointmentData,
					id: appointmentDoc.id, // Add the id property to the appointment data
				});
				// Disable all time slots except the booked one
				setAvailableTimes(
					availableTimes.map((time) => ({
						...time,
						available: time.time === appointmentData.time,
					}))
				);
			}
			setLoading(false);
		};
		fetchBookedAppointment();
	}, []);

	const handleTimeClick = (time) => {
		const selectedTime = availableTimes.find((t) => t.time === time);
		if (!selectedTime.available) {
			alert("This time is not available.");
			return;
		}
		setSelectedTime(time);
	};
	const handleBookAppointment = async (time) => {
		try {
			const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);
			const appointmentData = {
				[TIME_FIELD]: time,
				[USER_ID_FIELD]: auth.currentUser.uid,
			};
			const availableTimeQuery = query(
				collection(db, APPOINTMENTS_COLLECTION),
				where(TIME_FIELD, "==", time)
			);
			const availableTimeQuerySnapshot = await getDocs(availableTimeQuery);
			if (!availableTimeQuerySnapshot.empty) {
				alert("This time is not available.");
				return;
			}
			const docRef = await addDoc(appointmentsRef, appointmentData);
			console.log(
				"Appointment booked with ID: ",
				docRef.id,
				appointmentData.time
			);
			setBookedAppointment(appointmentData);
			// Disable all time slots except the booked one
			setAvailableTimes(
				availableTimes.map((t) => ({
					...t,
					available: t.time === time,
				}))
			);
			setSelectedTime(null);
			// alert("Appointment booked successfully.");
			setTimeout(() => {
				router.push("/");
			}, 1000);
		} catch (error) {
			console.error("Error adding appointment: ", error);
			alert(`Error booking appointment: ${error.message}`);
		}
	};

	const handleCancelAppointment = async () => {
		try {
			if (bookedAppointment) {
				await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, bookedAppointment.id));
				console.log("Appointment canceled: ", bookedAppointment[TIME_FIELD]);
				// Update the state of bookedAppointment
				setBookedAppointment(null);
				// Enable all time slots
				setAvailableTimes(
					availableTimes.map((t) => ({
						...t,
						available: true,
					}))
				);
				// alert("Appointment canceled successfully.");
				setTimeout(() => {
					router.push("/");
				}, 1000);
			} else {
				alert("No appointment to cancel.");
			}
		} catch (error) {
			console.error("Error canceling appointment: ", error);
			alert(`Error canceling appointment: ${error.message}`);
		}
	};

	const isTimeBooked = (time) => {
		return bookedAppointments.some(
			(appointment) => appointment[TIME_FIELD] === time
		);
	};

	return (
		<div>
			{loading && <p>Loading appointments...</p>}
			{!loading && (
				<div>
					<h2>Book an appointment</h2>
					<p>Please select a time:</p>
					{availableTimes.map((time) => (
						<button
							key={uuidv4()}
							disabled={!time.available}
							onClick={() => handleTimeClick(time.time)}
							style={{
								backgroundColor: isTimeBooked(time.time) ? "red" : "white",
							}}
						>
							{time.time}
						</button>
					))}
					{selectedTime && (
						<div>
							<p>Selected time: {selectedTime}</p>
							<button onClick={() => handleBookAppointment(selectedTime)}>
								Book
							</button>
							<button onClick={() => setSelectedTime(null)}>Cancel</button>
						</div>
					)}
					{bookedAppointment && (
						<div>
							<h2>Your appointment</h2>
							<p>Time: {bookedAppointment.time}</p>
							<button onClick={() => handleCancelAppointment()}>Cancel</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default BookAppointment;
