import React, { useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  TextField,
  SelectChangeEvent,
  Grid,
  CircularProgress,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Ensure the Firebase config is correct
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const timeSlots = ["10-11 AM", "11-12 PM", "2-3 PM", "3-4 PM", "4-5 PM"];
const queueSlots = 60; // Max number of available queue slots per time slot
const daysRange = 14; // Max number of next days available to queue on

const Form: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
    appointmentDate: null as Date | null,
    timeSlot: "",
    queueNumber: 0,
  });

  const [dateError, setDateError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // State to handle form submission

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDay = new Date();
  lastDay.setDate(today.getDate() + daysRange - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date: Date | null) => {
    if (date && (date < today || date > lastDay)) {
      setDateError(`Please select a date within the next ${daysRange} days.`);
      setForm({ ...form, appointmentDate: null });
    } else {
      setDateError("");
      setForm({ ...form, appointmentDate: date });
      checkQueueNumber(date, form.timeSlot);
    }
  };

  const handleTimeSlotChange = (e: SelectChangeEvent<string>) => {
    const timeSlot = e.target.value as string;
    setForm({ ...form, timeSlot });
    checkQueueNumber(form.appointmentDate, timeSlot);
  };

  const checkQueueNumber = async (date: Date | null, timeSlot: string) => {
    if (date && timeSlot) {
      // Get the current queue count for the selected time slot from Firestore
      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef,
        where("date", "==", date),
        where("timeSlot", "==", timeSlot)
      );
      const querySnapshot = await getDocs(q);

      // If the number of appointments in this time slot is greater than or equal to the maximum allowed queue slots
      if (querySnapshot.size < queueSlots) {
        const newQueueNumber = querySnapshot.size + 1;
        setForm((prevForm) => ({
          ...prevForm,
          queueNumber: newQueueNumber,
        }));
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          queueNumber: 0,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Set submitting to true when form is being submitted

    if (!form.appointmentDate || !form.timeSlot) {
      toast.error("Please select a date and time slot.");
      setIsSubmitting(false); // Reset submitting state if there's an error
      return;
    }

    // Get the current queue count for the selected time slot from Firestore
    const appointmentsRef = collection(db, "appointments");
    const q = query(
      appointmentsRef,
      where("date", "==", form.appointmentDate),
      where("timeSlot", "==", form.timeSlot)
    );
    const querySnapshot = await getDocs(q);

    // If the number of appointments in this time slot is greater than or equal to the maximum allowed queue slots
    if (querySnapshot.size >= queueSlots) {
      toast.error("This time slot is full. Please select a different time slot.");
      setIsSubmitting(false); // Reset submitting state if slot is full
      return;
    }

    const newQueueNumber = querySnapshot.size + 1;

    try {
      // Add the new appointment to Firestore
      await addDoc(collection(db, "appointments"), {
        name: form.name,
        phone: form.phone,
        message: form.message,
        appointmentDate: form.appointmentDate,
        timeSlot: form.timeSlot,
        queueNumber: newQueueNumber,
      });

      // Reset form state after successful submission
      setForm({
        name: "",
        phone: "",
        message: "",
        appointmentDate: null,
        timeSlot: "",
        queueNumber: 0,
      });

      // Show success toast
      toast.success("Appointment has been scheduled!");
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Error submitting the form. Please try again later.");
    } finally {
      setIsSubmitting(false); // Reset submitting state after form submission
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          p: 2,
          mt: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 1, fontWeight: "bold", textAlign: "center" }}
        >
          Queue Form
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <FormControl fullWidth sx={{ mb: 1 }}>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              Name
            </Typography>
            <TextField
              fullWidth
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              sx={{
                '& .MuiInputBase-root': {
                  padding: '0', // Set padding to 0 for consistency
                },
              }}
            />
          </FormControl>

          {/* Phone Field */}
          <FormControl fullWidth sx={{ mb: 1 }}>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              Phone
            </Typography>
            <TextField
              fullWidth
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              sx={{
                '& .MuiInputBase-root': {
                  padding: '0', // Set padding to 0 for consistency
                },
              }}
            />
          </FormControl>

          {/* Date and Time Slot Fields */}
          <Grid container spacing={2} sx={{ mb: 1 }}>
            {/* Date Picker */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 0.5,
                    color: dateError ? "error.main" : "text.primary",
                  }}
                >
                  Appointment Date
                </Typography>
                <DatePicker
                  selected={form.appointmentDate}
                  onChange={handleDateChange}
                  minDate={today}
                  maxDate={lastDay}
                  dateFormat="yyyy-MM-dd"
                  className="styled-date-picker"
                  wrapperClassName="styled-date-picker-wrapper"
                  popperClassName="styled-datepicker-popover"
                  calendarClassName="styled-calendar"
                  customInput={
                    <TextField
                      variant="outlined"
                      InputProps={{
                        style: {
                          padding: "0", // Set padding to 0 for consistency
                        },
                      }}
                    />
                  }
                />
                {dateError && <Typography color="error">{dateError}</Typography>}
              </FormControl>
            </Grid>

            {/* Time Slot */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  Time Slot
                </Typography>
                <Select
                  value={form.timeSlot}
                  onChange={handleTimeSlotChange}
                  required
                  sx={{
                    '& .MuiSelect-select': {
                    },
                  }}
                >
                  {timeSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Queue Number */}
          {form.queueNumber > 0 && (
            <Typography sx={{ mb: 2 }}>
              Your Queue Number is {form.queueNumber} of {queueSlots}
            </Typography>
          )}

          {/* Message Field */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              Message
            </Typography>
            <TextField
              fullWidth
              name="message"
              value={form.message}
              onChange={handleChange}
              multiline
              rows={2}
              required
              sx={{
                '& .MuiInputBase-root': {
                },
              }}
            />
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isSubmitting ? "lightblue" : undefined,
              "&:hover": {
                backgroundColor: isSubmitting ? "lightblue" : undefined,
              },
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Box>

      {/* Toast container */}
      <ToastContainer aria-label={undefined} />
    </Container>
  );
};

export default Form;
