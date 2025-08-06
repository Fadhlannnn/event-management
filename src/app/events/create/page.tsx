"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CreateEventPage() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState(0);
  const [type, setType] = useState<"free" | "paid">("free");
  const [availableSeats, setAvailableSeats] = useState(0);
  const [description, setDescription] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleReferralCheck = async () => {
    if (!referralCode) return;

    const { data, error } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("code", referralCode.trim());

    if (error) {
      alert("Error checking referral code");
      return;
    }

    if (!data || data.length === 0) {
      alert("Invalid referral code.");
      setDiscountAmount(0);
    } else {
      setDiscountAmount(data[0].discount);
      alert(`Referral applied! Discount: Rp ${data[0].discount}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPrice = type === "free" ? 0 : price - discountAmount;

    const { error } = await supabase.from("events").insert([
      {
        name,
        location,
        date,
        time,
        price: finalPrice,
        type,
        available_seats: availableSeats,
        description,
      },
    ]);

    if (error) {
      console.error("Failed to create event:", error.message);
      alert("Failed to create event");
    } else {
      alert("Event created successfully!");
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Event Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Available Seats"
          value={availableSeats}
          onChange={(e) => setAvailableSeats(Number(e.target.value))}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              name="type"
              value="free"
              checked={type === "free"}
              onChange={() => setType("free")}
            />
            Free
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="paid"
              checked={type === "paid"}
              onChange={() => setType("paid")}
            />
            Paid
          </label>
        </div>
        {type === "paid" && (
          <input
            type="number"
            placeholder="Price (IDR)"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            className="w-full p-2 border rounded"
          />
        )}

        {/* Referral Code Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Referral Code (optional)"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            type="button"
            onClick={handleReferralCheck}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Apply
          </button>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit Event
        </button>
      </form>
    </main>
  );
}
