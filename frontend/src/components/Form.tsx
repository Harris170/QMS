import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import your Firebase config

const Form: React.FC = () => {
  const [form, setForm] = useState({ name: "", phone: "", message: "" , timestamp: ""});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "responses"), form);
      alert("Form submitted successfully!");
      setForm({ name: "", phone: "", message: "", timestamp: "" });
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
          <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Message" name="message" value={form.message} onChange={handleChange} multiline rows={4} sx={{ mb: 3 }} required />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Form;