"use client";

import Link from "next/link";

type Props = {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  price: number;
  type: string; // "free" atau "paid"
};

export default function EventCard({
  id,
  name,
  description,
  location,
  date,
  price,
  type,
}: Props) {
  return (
    <Link href={`/events/${id}`}>
      <div className="border rounded-2xl shadow p-4 hover:shadow-md transition bg-white cursor-pointer">
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="mt-2 text-sm">📍 {location}</p>
        <p className="text-sm">📅 {new Date(date).toLocaleDateString()}</p>
        <p className="text-sm">
          💰 {type === "free" ? "FREE" : `IDR ${price.toLocaleString()}`}
        </p>
      </div>
    </Link>
  );
}
