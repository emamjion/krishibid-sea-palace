import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ChangePasswordModal = ({ open, onClose, token }) => {
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/update-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Password updated successfully");

      setPasswordData({
        oldPassword: "",
        newPassword: "",
      });

      onClose();
    } catch (error) {
      toast.error("Password update failed");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-scaleIn">
        <h2 className="text-xl font-semibold mb-6">Change Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password */}
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handleChange}
              placeholder="Old Password"
              className="w-full border p-3 pr-12 rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a] focus:outline-none transition"
            />

            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              placeholder="New Password"
              className="w-full border p-3 pr-12 rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a] focus:outline-none transition"
            />

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#ebb93a] font-semibold cursor-pointer shadow-md hover:shadow-lg text-[#131518] px-5 py-2 rounded-lg hover:bg-[#daa624] transition"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
