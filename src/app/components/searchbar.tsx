"use client";

import { useState, useEffect } from "react";

type Props = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, onSearch]);

  return (
    <input
      type="text"
      placeholder="Search events..."
      className="w-full p-2 border rounded-xl mb-4"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}
