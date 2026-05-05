import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./Input";
import { PhoneInput } from "./PhoneInput";
import { Textarea } from "./Textarea";

export default function NomineeInformation({
  onSubmit,
  onPrevious,
  loading,
  defaultValues,
}) {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues,
  });

  const submitHandler = (data) => {
    onSubmit(data);
  };

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <div className="bg-gray-100 py-14 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-10">
        {/* 🔹 Header */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Nominee Information
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Please provide nominee details carefully
          </p>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
          {/* 🔹 Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Nominee Name"
              required
              placeholder="Enter full name"
              {...register("name", { required: true })}
            />

            <Input
              label="Relation with Applicant"
              required
              placeholder="e.g. Father, Spouse"
              {...register("relation", { required: true })}
            />
          </div>

          {/* 🔹 Address */}
          <div>
            <Textarea
              label="Permanent Address"
              required
              placeholder="Enter full address"
              {...register("address", { required: true })}
            />
          </div>

          {/* 🔹 Identity Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="NID / Passport No"
              required
              placeholder="Enter ID number"
              {...register("nid", { required: true })}
            />

            <Input
              label="Date of Birth"
              required
              type="date"
              {...register("dob", { required: true })}
            />
          </div>

          {/* 🔹 Contact Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Controller
              name="mobile1"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <PhoneInput label="Mobile No #1" required {...field} />
              )}
            />

            <Controller
              name="mobile2"
              control={control}
              render={({ field }) => (
                <PhoneInput label="Mobile No #2" {...field} />
              )}
            />
          </div>
          {/* 🔹 Nominee Photo */}
          <div>
            <Input
              label="Nominee Photo"
              type="file"
              required
              {...register("nomineePhoto", { required: true })}
            />
          </div>

          {/* 🔹 Actions */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium transition"
            >
              Previous
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition
              ${
                loading
                  ? "bg-yellow-300 cursor-not-allowed"
                  : "bg-[#ebb93a] hover:bg-[#daa624]"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
