"use client";
import { useEffect, useState } from "react";

type Event = {
  id: number;
  name: string;
  location: string;
  date: string;
  price: number;
  type: string;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/events") // Ganti port sesuai backend kamu
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched events:", data); // cek apakah dapet
        setEvents(data);
      })
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
      <div className="grid gap-4">
        {events.map((event) => (
          <div key={event.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{event.name}</h2>
            <p>
              {event.location} – {event.date}
            </p>
            <p>
              {event.type === "free"
                ? "Gratis"
                : `Rp ${event.price.toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
