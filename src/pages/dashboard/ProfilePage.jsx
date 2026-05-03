import axios from "axios";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ChangePasswordModal from "../../components/ChangePasswordModal";

const ProfilePage = () => {
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    avatar: null,
  });

  const [preview, setPreview] = useState("");

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUser(res.data.user);

      setFormData({
        fullName: res.data.user.fullName,
        phone: res.data.user.phone,
        avatar: null,
      });

      setPreview(res.data.user.avatar?.url);

      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle change
  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];

      setFormData({ ...formData, avatar: file });

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("fullName", formData.fullName);
      data.append("phone", formData.phone);

      if (formData.avatar) {
        data.append("avatar", formData.avatar);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/update`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUser(res.data.user);
      setOpenModal(false);

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="h-32 bg-linear-to-r from-[#ebb93a] to-[#daa624]" />

        <div className="p-8 relative">
          {/* Avatar */}
          <div className="flex flex-col items-center -mt-16">
            <img
              src={user.avatar?.url}
              alt="avatar"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />

            <h2 className="text-xl font-bold mt-3">{user.fullName}</h2>

            <span
              className={`mt-1 text-xs px-3 py-1 rounded-full ${
                user.isVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {user.isVerified ? "Verified" : "Not Verified"}
            </span>
          </div>

          {/* Edit Button */}
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-2 bg-[#ebb93a] text-black px-4 py-2 rounded-xl font-semibold duration-300 hover:bg-[#daa624] transition cursor-pointer shadow-md hover:shadow-lg"
            >
              <Pencil size={16} />
              Edit Profile
            </button>

            <button
              onClick={() => setOpenPasswordModal(true)}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-black transition cursor-pointer shadow-sm"
            >
              Change Password
            </button>
          </div>

          {/* Info */}
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <Info label="Email" value={user.email} />
            <Info label="Phone" value={user.phone} />
            <Info label="Role" value={user.role} />
            <Info label="Total Bookings" value={user.bookings?.length || 0} />
            <Info
              label="Account Created"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
            <Info
              label="Last Updated"
              value={new Date(user.updatedAt).toLocaleDateString()}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-scaleIn">
            <h2 className="text-xl font-semibold mb-6">Update Profile</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={preview}
                  className="w-24 h-24 rounded-full object-cover border border-gray-200"
                />
              </div>

              <input
                type="file"
                name="avatar"
                onChange={handleChange}
                className="w-full border p-2 border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a] focus:outline-none transition duration-300 rounded-lg"
              />

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border p-3 rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a] focus:outline-none transition duration-300"
              />

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ebb93a] focus:outline-none transition duration-300 p-3 rounded-lg"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 duration-300 cursor-pointer rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#ebb93a] text-[#131518] shadow-md hover:shadow-lg font-semibold px-5 cursor-pointer duration-300 py-2 rounded-lg hover:bg-[#daa624]"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
        token={token}
      />
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 p-6 rounded-xl border border-gray-300">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default ProfilePage;
