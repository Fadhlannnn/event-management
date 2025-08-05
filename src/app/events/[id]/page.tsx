"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Event {
  id: number;
  name: string;
  location: string;
  date: string;
  price: number;
  type: "free" | "paid";
  available_seats: number;
  description?: string;
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", Number(id))
        .single(); // <- important

      if (error) {
        console.error("Failed to fetch event:", error.message);
        setEvent(null);
      } else {
        setEvent(data);
      }

      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!event) return <div className="p-6">Event not found.</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">{event.name}</h1>
      <p>
        {event.location} – {event.date}
      </p>
      <p className="mt-2 font-medium">
        {event.type === "free"
          ? "Free"
          : `Rp ${event.price.toLocaleString("id-ID")}`}
      </p>
      <p className="mt-2">Seats: {event.available_seats}</p>
      {event.description && <p className="mt-2">{event.description}</p>}
    </main>
  );
}
