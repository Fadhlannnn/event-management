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
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];
    if (filterType !== "all") {
      result = result.filter((event) => event.type === filterType);
    }
    if (searchQuery) {
      result = result.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredEvents(result);
    setCurrentPage(1);
  }, [searchQuery, filterType, events]);

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const buyTicket = async (eventId: number) => {
    const buyerName = prompt("Enter your name:");
    const buyerEmail = prompt("Enter your email:");

    if (!buyerName || !buyerEmail) {
      alert("Name and email are required.");
      return;
    }

    // Cek seats
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("available_seats")
      .eq("id", eventId)
      .single();

    if (eventError || eventData?.available_seats <= 0) {
      alert("No seats available.");
      return;
    }

    // Update seats
    const { error: updateError } = await supabase
      .from("events")
      .update({ available_seats: eventData.available_seats - 1 })
      .eq("id", eventId);

    if (updateError) {
      alert("Failed to update seats.");
      return;
    }

    // Simpan transaksi
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        event_id: eventId,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
      });

    if (transactionError) {
      alert("Failed to record transaction.");
      return;
    }

    alert("Ticket purchased successfully!");
    location.reload();
  };

  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Upcoming Events</h1>
        <Link href="/events/create">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create Event
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search events..."
        onChange={(e) => handleSearchChange(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      {/* Filter */}
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

      {/* Event List */}
      <div className="space-y-4 mb-4">
        {currentEvents.map((event) => (
          <div
            key={event.id}
            className="border p-4 rounded shadow-sm bg-white hover:bg-gray-50 transition"
          >
            <Link href={`/events/${event.id}`}>
              <h2 className="text-lg font-bold cursor-pointer hover:underline">
                {event.name}
              </h2>
            </Link>
            <p>
              {event.location} – {event.date}
            </p>
            <p>
              {event.type === "free"
                ? "Free"
                : `Rp ${event.price.toLocaleString("id-ID")}`}
            </p>
            <p>Seats Available: {event.available_seats}</p>

            {/* Buy Ticket Button */}
            <div className="mt-3">
              <button
                onClick={async () => {
                  if (event.available_seats <= 0) return;

                  const { data, error } = await supabase
                    .from("events")
                    .update({ available_seats: event.available_seats - 1 })
                    .eq("id", event.id);

                  if (error) {
                    console.error("Failed to update seats:", error.message);
                    alert("Gagal membeli tiket");
                  } else {
                    alert("Tiket berhasil dibeli");
                    setEvents((prev) =>
                      prev.map((e) =>
                        e.id === event.id
                          ? { ...e, available_seats: e.available_seats - 1 }
                          : e
                      )
                    );
                  }
                }}
                disabled={event.available_seats <= 0}
                className={`px-4 py-2 rounded text-white ${
                  event.available_seats <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {event.available_seats <= 0 ? "Sold Out" : "Buy Ticket"}
              </button>
            </div>
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
