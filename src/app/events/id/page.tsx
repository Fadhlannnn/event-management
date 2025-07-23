import { dummyEvents } from "@/app/data/dummyevents";
import { notFound } from "next/navigation";

type Props = {
  params: {
    id: string;
  };
};

export default function EventDetailPage({ params }: Props) {
  const event = dummyEvents.find((e) => e.id === parseInt(params.id));

  if (!event) return notFound();

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
      <p className="text-gray-600 mb-2">{event.description}</p>
      <p>📍 {event.location}</p>
      <p>📅 {new Date(event.date).toLocaleDateString()}</p>
      <p>
        💰{" "}
        {event.type === "free" ? "FREE" : `IDR ${event.price.toLocaleString()}`}
      </p>
    </main>
  );
}
