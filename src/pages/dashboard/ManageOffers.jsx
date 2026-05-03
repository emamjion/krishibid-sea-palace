import { useEffect, useState } from "react";
import { toast } from "sonner";

const API = import.meta.env.VITE_BACKEND_API_URL;

const ManageOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    discountPrice: "",
    expiresAt: "",
    image: null,
  });

  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setOpen(false);
    setPreviewImage(null);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // ================= FETCH =================
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/offer`, {
        headers: getAuthHeader(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOffers(data.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // ================= CHANGE =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
      setPreviewImage(URL.createObjectURL(files[0])); // 👈 এখানে
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("discountPrice", form.discountPrice);
    fd.append("expiresAt", form.expiresAt);
    if (form.image) fd.append("image", form.image);

    try {
      const url = editId ? `${API}/offer/${editId}` : `${API}/offer/create`;

      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(editId ? "Offer updated" : "Offer created");

      setForm({ title: "", discountPrice: "", expiresAt: "", image: null });
      setEditId(null);
      setOpen(false);
      fetchOffers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/offer/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Deleted successfully");
      fetchOffers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ================= TOGGLE =================
  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API}/offer/toggle/${id}`, {
        method: "PATCH",
        headers: getAuthHeader(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      fetchOffers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEdit = (offer) => {
    setEditId(offer._id);
    setForm({
      title: offer.title,
      discountPrice: offer.discountPrice,
      expiresAt: offer.expiresAt?.slice(0, 10),
      image: null,
    });

    setPreviewImage(offer.image);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Manage Offers
          </h1>
        </div>

        <button
          onClick={() => {
            setEditId(null);
            setForm({
              title: "",
              discountPrice: "",
              expiresAt: "",
              image: null,
            });
            setOpen(true);
          }}
          className="px-5 py-2 bg-black cursor-pointer text-white rounded-xl 
                     hover:bg-gray-800 transition shadow-md"
        >
          + New Offer
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
            >
              {/* image skeleton */}
              <div className="h-44 w-full bg-gray-200" />

              <div className="p-5 space-y-3">
                {/* title */}
                <div className="h-4 w-3/4 bg-gray-200 rounded" />

                {/* price */}
                <div className="h-3 w-1/2 bg-gray-200 rounded" />

                {/* date */}
                <div className="h-3 w-2/3 bg-gray-200 rounded" />

                {/* buttons */}
                <div className="flex justify-between pt-4">
                  <div className="w-10 h-5 bg-gray-200 rounded-full" />

                  <div className="flex gap-2">
                    <div className="w-12 h-6 bg-gray-200 rounded-lg" />
                    <div className="w-12 h-6 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && offers.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No offers found</p>
          <p className="text-sm">Create your first offer now</p>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm
                       hover:shadow-xl transition duration-300"
          >
            <div className="relative">
              <img
                src={offer.image}
                className="h-36 sm:h-44 w-full object-cover"
              />

              <span
                className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full text-white
                ${offer.isActive ? "bg-green-500" : "bg-gray-500"}`}
              >
                {offer.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {offer.title}
              </h2>

              <p className="text-gray-600">
                Discount:{" "}
                <span className="font-bold text-black">
                  ৳{offer.discountPrice}
                </span>
              </p>

              <p className="text-xs text-gray-400">
                Expires: {new Date(offer.expiresAt).toDateString()}
              </p>

              {/* ACTIONS */}
              <div className="flex items-center justify-between pt-3">
                {/* toggle */}
                <button
                  onClick={() => handleToggle(offer._id)}
                  className={`w-12 h-6 rounded-full flex cursor-pointer items-center p-1 transition
                    ${offer.isActive ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow transform transition
                      ${offer.isActive ? "translate-x-6" : ""}`}
                  />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(offer)}
                    className="px-3 py-1.5 text-sm rounded-lg
                               border border-gray-300 cursor-pointer hover:bg-gray-100 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setConfirmDeleteId(offer._id)}
                    className="px-3 py-1.5 text-sm rounded-lg cursor-pointer
             bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PREMIUM MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scaleIn">
            <h2 className="text-xl font-semibold mb-5">
              {editId ? "Update Offer" : "Create Offer"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Offer Title"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none
                           focus:ring-2 focus:ring-black/20"
              />

              <input
                name="discountPrice"
                type="number"
                value={form.discountPrice}
                onChange={handleChange}
                placeholder="Discount Price"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none
                           focus:ring-2 focus:ring-black/20"
              />

              <input
                name="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              />

              {previewImage && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Current Image</p>
                  <img
                    src={previewImage}
                    className="h-32 w-full object-cover rounded-xl border"
                  />
                </div>
              )}

              <input
                name="image"
                type="file"
                onChange={handleChange}
                className="w-full text-sm"
              />

              {/* buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 cursor-pointer py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl cursor-pointer bg-black text-white
                             hover:bg-gray-800"
                >
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-scaleIn">
            <h2 className="text-lg font-semibold text-gray-800">
              Are you sure?
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. This will permanently delete the
              offer.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="w-1/2 py-2 cursor-pointer rounded-xl border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="w-1/2 py-2 cursor-pointer rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOffers;
