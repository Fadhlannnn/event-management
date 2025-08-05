"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateEvent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    time: "",
    price: "",
    type: "free",
    description: "",
    available_seats: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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

    const { error } = await supabase.from("events").insert([
      {
        name: formData.name,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        price: parseInt(formData.price),
        type: formData.type,
        description: formData.description,
        available_seats: parseInt(formData.available_seats),
      },
    ]);

    if (error) {
      console.error("Failed to create event:", error.message);
      alert("Failed to create event");
    } else {
      alert("Event created successfully!");
      router.push("/");
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Event Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price (IDR)"
          className="w-full p-2 border rounded"
          required={formData.type === "paid"}
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Event Description"
          className="w-full p-2 border rounded"
        />
        <input
          name="available_seats"
          type="number"
          value={formData.available_seats}
          onChange={handleChange}
          placeholder="Available Seats"
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Event
        </button>
      </form>
    </main>
  );
}
