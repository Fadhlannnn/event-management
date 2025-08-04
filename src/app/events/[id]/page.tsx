"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Event {
  id: number;
  name: string;
  location: string;
  date: string;
  price: number;
  type: "free" | "paid";
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`http://localhost:4000/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch event:", err);
        setLoading(false);
        setEvent(null);
      });
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!event) return <div className="p-6">Event not found.</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">{event.name}</h1>
      <p>
        {event.location} – {event.date}
      </p>
      <p className="font-medium">
        {event.type === "free"
          ? "Free"
          : `Rp ${event.price.toLocaleString("id-ID")}`}
      </p>
    </main>
  );
}
