import { CheckCircle, X } from "lucide-react";

const SuccessModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-[scaleIn_.25s_ease]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Thank You!
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">
          Thank you for your submission.
          <br />
          Price is fixed after discussion.
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full cursor-pointer bg-[#ebb93a] hover:bg-[#daa624] text-[#131518] font-medium py-2 rounded duration-300 transition"
        >
          Close
        </button>
      </div>

      {/* animation style */}
      <style>
        {`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default SuccessModal;
