"use client";

import EventCard from "./components/eventcard";
import SearchBar from "./components/searchbar";
import { dummyEvents } from "./data/dummyevents";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");

  const filteredEvents = dummyEvents.filter((event) =>
    event.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Upcoming Events</h1>
      <SearchBar onSearch={(val) => setQuery(val)} />

      {filteredEvents.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      )}
    </main>
  );
}
