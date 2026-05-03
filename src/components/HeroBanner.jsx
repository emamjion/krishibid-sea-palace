import { useEffect, useState } from "react";
import heroBanner from "../assets/images/hero-banner.jpg";

export default function HeroBanner({ onOfferLoad }) {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/offer/active`,
        );
        const data = await res.json();

        if (data?.success && data?.data?.isActive) {
          const offerData = data.data;

          // ✅ expiry check
          const isExpired = new Date(offerData.expiresAt) < new Date();

          if (!isExpired) {
            setOffer(offerData);
            onOfferLoad?.(offerData);
          } else {
            onOfferLoad?.(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch offer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [onOfferLoad]);

  // ✅ Loading UI
  if (loading) {
    return (
      <section className="w-full h-75 md:h-80 bg-gray-200 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading banner...</p>
      </section>
    );
  }

  return (
    <section className="relative w-full h-75 md:h-80 overflow-hidden">
      <img
        src={offer ? offer.image : heroBanner}
        alt="Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        {offer ? (
          <>
            <h1 className="text-white text-2xl md:text-5xl font-bold">
              {offer.title}
            </h1>

            <p className="text-white mt-3 mb-4">
              Discount: ৳{offer.discountPrice}
            </p>

            <button
              className="bg-[#ebb93a] hover:bg-[#daa624] text-black px-6 py-2.5 rounded font-semibold"
              onClick={() => onOfferLoad?.(offer)}
            >
              Get Offer
            </button>
          </>
        ) : (
          <h1 className="text-white text-3xl md:text-5xl font-semibold">
            Book Now
          </h1>
        )}
      </div>
    </section>
  );
}
