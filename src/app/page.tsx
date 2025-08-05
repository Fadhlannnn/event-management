"use client";
import { useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Event {
  id: number;
  name: string;
  location: string;
  date: string;
  price: number;
  type: "free" | "paid";
  available_seats: number;
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [locations, setLocations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) {
        console.error("Error fetching events:", error.message);
      } else {
        setEvents(data);
        setFilteredEvents(data);

        // Ambil lokasi unik
        const uniqueLocations = Array.from(
          new Set(data.map((e: Event) => e.location))
        );
        setLocations(uniqueLocations);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];

    // Filter berdasarkan tipe
    if (filterType !== "all") {
      result = result.filter((event) => event.type === filterType);
    }

    // Filter berdasarkan lokasi
    if (locationFilter !== "all") {
      result = result.filter((event) => event.location === locationFilter);
    }

    // Filter berdasarkan pencarian
    if (searchQuery) {
      result = result.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(result);
    setCurrentPage(1);
  }, [searchQuery, filterType, locationFilter, events]);

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search events..."
        onChange={(e) => handleSearchChange(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      {/* Filter Tipe */}
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1 rounded ${
            filterType === "all" ? "bg-gray-400" : "bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType("free")}
          className={`px-3 py-1 rounded ${
            filterType === "free" ? "bg-green-400" : "bg-green-200"
          }`}
        >
          Free
        </button>
        <button
          onClick={() => setFilterType("paid")}
          className={`px-3 py-1 rounded ${
            filterType === "paid" ? "bg-blue-400" : "bg-blue-200"
          }`}
        >
          Paid
        </button>
      </div>

      {/* Filter Lokasi */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by Location:</label>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Event List */}
      <div className="space-y-4 mb-4">
        {currentEvents.map((event) => (
          <div
            key={event.id}
            className="border p-4 rounded shadow bg-white flex flex-col gap-2"
          >
            <h2 className="text-xl font-bold">{event.name}</h2>
            <p>
              {event.location} – {event.date}
            </p>
            <p>
              {event.type === "free"
                ? "Free"
                : `Rp ${event.price.toLocaleString("id-ID")}`}
            </p>
            <p>Seats Available: {event.available_seats}</p>

            {/* Tombol Buy */}
            <Link
              href={`/events/${event.id}`}
              className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Buy Ticket
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4">
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
