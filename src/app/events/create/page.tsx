"use client";
import { useState } from "react";

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    date: "",
    time: "",
    location: "",
    description: "",
    seats: "",
    ticketType: "",
    type: "free", // default: free
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      price: Number(formData.price),
      seats: Number(formData.seats),
    };

    try {
      const res = await fetch("http://localhost:4000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!res.ok) throw new Error("Failed to create event");

      alert("Event created successfully!");
      setFormData({
        name: "",
        price: "",
        date: "",
        time: "",
        location: "",
        description: "",
        seats: "",
        ticketType: "",
        type: "free",
      });
    } catch (error) {
      alert("Failed to create event");
      console.error(error);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Name */}
        <div>
          <label className="block font-medium">Event Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block font-medium">Price (IDR)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required={formData.type === "paid"}
            disabled={formData.type === "free"}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block font-medium">Event Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
            rows={4}
            required
          />
        </div>

        {/* Available Seats */}
        <div>
          <label className="block font-medium">Available Seats</label>
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Ticket Type */}
        <div>
          <label className="block font-medium">Ticket Type</label>
          <input
            type="text"
            name="ticketType"
            value={formData.ticketType}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Event
        </button>
      </form>
    </main>
  );
}
