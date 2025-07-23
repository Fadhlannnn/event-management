"use client";
import React, { useEffect, useState } from "react";

interface Event {
  id: number;
  name: string;
  location: string;
  date: string;
  price: number;
  type: "free" | "paid";
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("all");

  useEffect(() => {
    fetch("http://localhost:4000/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setFilteredEvents(data); // default
      })
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter((e) => e.type === filterType));
    }
  }, [filterType, events]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>

      {/* Filter Buttons */}
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setFilterType("all")}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          All
        </button>
        <button
          onClick={() => setFilterType("free")}
          className="px-3 py-1 bg-green-200 hover:bg-green-300 rounded"
        >
          Free
        </button>
        <button
          onClick={() => setFilterType("paid")}
          className="px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded"
        >
          Paid
        </button>
      </div>

      {/* Event List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <div key={event.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{event.name}</h2>
            <p>
              {event.location} – {event.date}
            </p>
            <p className="font-medium">
              {event.type === "free"
                ? "Free"
                : `Rp ${event.price.toLocaleString("id-ID")}`}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
