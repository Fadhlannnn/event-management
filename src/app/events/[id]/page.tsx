"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id ? Number(params.id) : null;

  const [eventData, setEventData] = useState<any>(null);
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewerName, setReviewerName] = useState(""); // ✅ nama reviewer
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!eventId) return;

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

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch reviews:", error.message);
      } else {
        setReviews(data);
      }
    };

    fetchEvent();
    fetchReviews();
  }, [eventId]);

  const handleBuyTicket = async () => {
    if (!eventData) return;

    setIsLoading(true);
    let priceToPay = finalPrice ?? eventData.price;

    if (referralCode.trim()) {
      const { data: referralData, error } = await supabase
        .from("referral_codes")
        .select("*")
        .ilike("code", referralCode.trim())
        .single();

      if (error || !referralData) {
        alert("Invalid referral code.");
        setIsLoading(false);
        return;
      }

      if (
        referralData.usage_limit &&
        referralData.used_count >= referralData.usage_limit
      ) {
        alert("Referral code has reached usage limit.");
        setIsLoading(false);
        return;
      }

      priceToPay = Math.max(0, priceToPay - referralData.discount);

      await supabase
        .from("referral_codes")
        .update({
          used_count: (referralData.used_count || 0) + 1,
        })
        .eq("id", referralData.id);
    }

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
      `Tiket berhasil dibeli! Total bayar: Rp ${priceToPay.toLocaleString(
        "id-ID"
      )}`
    );
    setEventData((prev: any) => ({
      ...prev,
      available_seats: prev.available_seats - 1,
    }));
    setIsLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!newReview.trim()) return;

    const { error } = await supabase.from("reviews").insert([
      {
        event_id: eventId,
        name: reviewerName || "Anonymous", // ✅ simpan nama
        comment: newReview,
        rating,
        user_email: "user@example.com",
      },
    ]);

    if (error) {
      console.error("Failed to submit review:", error.message);
      alert("Gagal mengirim review");
      return;
    }

    setReviews((prev) => [
      {
        name: reviewerName || "Anonymous",
        comment: newReview,
        rating,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setReviewerName("");
    setNewReview("");
    setRating(5);
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

      {eventData.type === "paid" && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Referral Code (optional)
          </label>
          <input
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

      <hr className="my-6" />

      <h2 className="text-lg font-bold mb-2">Review Pengunjung</h2>
      {reviews.length === 0 ? (
        <p>Belum ada review.</p>
      ) : (
        reviews.map((r, i) => (
          <div key={i} className="border p-2 rounded mb-2">
            <p className="font-semibold">{r.name || "Anonymous"}</p>
            <p className="text-yellow-500">Rating: {r.rating} ⭐</p>
            <p>{r.comment}</p>
            <p className="text-gray-500 text-sm">
              {new Date(r.created_at).toLocaleString()}
            </p>
          </div>
        ))
      )}

      <div className="mt-4">
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          placeholder="Nama Anda (optional)"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
        />
        <textarea
          className="w-full p-2 border rounded mb-2"
          placeholder="Tulis review..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
        />
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full p-2 border rounded mb-2"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ⭐
            </option>
          ))}
        </select>
        <button
          onClick={handleSubmitReview}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Kirim Review
        </button>
      </div>
    </main>
  );
}
