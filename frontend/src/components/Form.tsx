import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, MenuItem, Select, InputLabel, FormControl, SelectChangeEvent } from "@mui/material";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import your Firebase config

const timeSlots = ["10-11 AM", "11-12 PM", "2-3 PM", "3-4 PM", "4-5 PM"];

const Form: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
    appointment: "", // This will store the date as a string
    timeSlot: "",
    queueNumber: 0,
  });
  const [dateError, setDateError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTimeSlotChange = async (e: SelectChangeEvent<string>) => {
    const selectedSlot = e.target.value as string;
    setForm({ ...form, timeSlot: selectedSlot });

    // Query to check how many people are already assigned to this timeslot
    const q = query(
      collection(db, "responses"),
      where("appointment", "==", form.appointment),
      where("timeSlot", "==", selectedSlot)
    );
    const querySnapshot = await getDocs(q);

    const assignedQueueNumber = querySnapshot.size < 10 ? querySnapshot.size + 1 : 0; // Max 10 users in the time slot
    setForm((prev) => ({ ...prev, queueNumber: assignedQueueNumber }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    const fourteenDaysFromNow = new Date(today);
    fourteenDaysFromNow.setDate(today.getDate() + 14);

    // Check if the selected date is within the range of today and 14 days from now
    if (selectedDate < today || selectedDate > fourteenDaysFromNow) {
      setDateError("Please select a date within the next 14 days.");
      setForm({ ...form, appointment: "" }); // Reset the appointment field if invalid
    } else {
      setDateError(""); // Clear error if the date is valid
      setForm({ ...form, appointment: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.queueNumber === 0) {
      alert("This time slot is full. Please choose another one.");
      return;
    }

    try {
      // Include timestamp and queue number in the form submission
      await addDoc(collection(db, "responses"), { ...form, timestamp: new Date() });
      alert("Form submitted successfully!");
      setForm({ name: "", phone: "", message: "", appointment: "", timeSlot: "", queueNumber: 0 });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ p: 4, mt: 10, alignItems: "center", boxShadow: 3, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
          Queue Form
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />

          {/* Date Picker for appointment scheduling */}
          <TextField
            fullWidth
            label="Appointment Date"
            name="appointment"
            value={form.appointment}
            onChange={handleDateChange}
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
            required
            error={!!dateError}
            helperText={dateError}
          />

          {/* Time Slot Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="timeSlot-label">Select Time Slot</InputLabel>
            <Select
              labelId="timeSlot-label"
              value={form.timeSlot}
              onChange={handleTimeSlotChange}
              label="Select Time Slot"
              required
            >
              {timeSlots.map((slot) => (
                <MenuItem key={slot} value={slot}>
                  {slot}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Message Field */}
          <TextField
            fullWidth
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 3 }}
            required
          />

          {form.queueNumber > 0 && (
            <Typography sx={{ mb: 2 }}>Your queue number: {form.queueNumber}</Typography>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Form;
