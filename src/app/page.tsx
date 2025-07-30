"use client";
import React, { useEffect, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:4000/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setFilteredEvents(data);
      })
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  useEffect(() => {
    let result = [...events];
    if (filterType !== "all") {
      result = result.filter((e) => e.type === filterType);
    }
    if (searchQuery) {
      result = result.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredEvents(result);
    setCurrentPage(1);
  }, [filterType, searchQuery, events]);

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search events..."
        onChange={(e) => handleSearchChange(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

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
      <div className="space-y-4 mb-4">
        {currentEvents.map((event) => (
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

      {/* Pagination Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
}
