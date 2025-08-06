"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id;
  const [eventData, setEventData] = useState<any>(null);
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Failed to fetch event:", error.message);
        return;
      }

      setEventData(data);

      if (data.type === "paid") {
        const now = new Date();
        const start = data.discount_start
          ? new Date(data.discount_start)
          : null;
        const end = data.discount_end ? new Date(data.discount_end) : null;

        const isTimeDiscountActive = start && end && now >= start && now <= end;

        const price =
          isTimeDiscountActive && data.discount_price
            ? data.discount_price
            : data.price;

        setFinalPrice(price);
      } else {
        setFinalPrice(0);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleBuyTicket = async () => {
    if (!eventData) return;

    setIsLoading(true);
    let priceToPay = finalPrice;

    // Validate referral
    if (referralCode.trim()) {
      const { data: referralData, error } = await supabase
        .from("referral_codes")
        .select("*")
        .ilike("code", referralCode.trim()) // case-insensitive
        .single();

      if (error || !referralData) {
        alert("Invalid referral code.");
        setIsLoading(false);
        return;
      }

      // Check usage limit
      if (
        referralData.usage_limit &&
        referralData.used_count >= referralData.usage_limit
      ) {
        alert("Referral code has reached usage limit.");
        setIsLoading(false);
        return;
      }

      // Apply referral discount
      priceToPay = Math.max(
        0,
        (priceToPay ?? eventData.price) - referralData.discount
      );

      // Update referral usage
      await supabase
        .from("referral_codes")
        .update({
          used_count: (referralData.used_count || 0) + 1,
        })
        .eq("id", referralData.id);
    }

    // Update available seats
    const { error: seatError } = await supabase
      .from("events")
      .update({
        available_seats: eventData.available_seats - 1,
      })
      .eq("id", eventId);

    if (seatError) {
      alert("Failed to update seats.");
      console.error(seatError.message);
      setIsLoading(false);
      return;
    }

    alert(
      `Tiket berhasil dibeli! Total bayar: Rp ${priceToPay?.toLocaleString(
        "id-ID"
      )}`
    );
    setIsLoading(false);
  };

  if (!eventData) return <p className="p-4">Loading event...</p>;

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{eventData.name}</h1>
      <p className="text-gray-600 mb-2">
        {eventData.location} – {eventData.date}
      </p>
      <p className="mb-2">{eventData.description}</p>
      <p className="font-semibold mb-2">
        Harga:{" "}
        {eventData.type === "free"
          ? "Gratis"
          : `Rp ${finalPrice?.toLocaleString("id-ID")}`}
      </p>
      <p className="mb-4">Seat Tersedia: {eventData.available_seats}</p>

      {/* Referral Code */}
      {eventData.type === "paid" && (
        <div className="mb-4">
          <label htmlFor="referral" className="block mb-1 font-medium">
            Referral Code (optional)
          </label>
          <input
            id="referral"
            type="text"
            className="w-full p-2 border rounded"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
          />
        </div>
      )}

      <button
        onClick={handleBuyTicket}
        disabled={isLoading}
        className={`w-full py-2 rounded text-white ${
          isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? "Processing..." : "Buy Ticket"}
      </button>
    </main>
  );
}
