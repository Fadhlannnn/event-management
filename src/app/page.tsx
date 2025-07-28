"use client";
import React, { useEffect, useState, useMemo } from "react";
import debounce from "lodash.debounce";

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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setFilteredEvents(data);
      })
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  const filterAndSearch = (term: string, type: string) => {
    let filtered = events;

    if (type !== "all") {
      filtered = filtered.filter((e) => e.type === type);
    }

    if (term.trim() !== "") {
      filtered = filtered.filter((e) =>
        e.name.toLowerCase().includes(term.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const debouncedSearch = useMemo(
    () => debounce((term: string) => filterAndSearch(term, filterType), 500),
    [events, filterType]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel(); // Cleanup debounce saat unmount
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    filterAndSearch(searchTerm, filterType); // Refresh saat filter berubah
  }, [filterType]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>

      <input
        type="text"
        placeholder="Search event..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border px-3 py-1 rounded mb-4 w-full"
      />

      <div className="mb-4 space-x-2">
        <button
          onClick={() => setFilterType("all")}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          All
        </button>
        <button
          onClick={() => setFilterType("free")}
          className="px-3 py-1 bg-green-200 rounded"
        >
          Free
        </button>
        <button
          onClick={() => setFilterType("paid")}
          className="px-3 py-1 bg-blue-200 rounded"
        >
          Paid
        </button>
      </div>

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
