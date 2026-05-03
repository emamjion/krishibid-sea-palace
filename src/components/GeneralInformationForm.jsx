import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaEdit } from "react-icons/fa";
import { Input } from "./Input";
import { PhoneInput } from "./PhoneInput";
import { Select } from "./Select";

export default function GeneralInformationForm({
  onNext,
  onPrevious,
  defaultValues,
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const [editable, setEditable] = useState({
    name: false,
    email: false,
    phone: false,
  });

  const presentAddress = watch("presentAddress");

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);

        reset({
          fullNameEn: user.name || "",
          email: user.email || "",
          mobile1: user.phone || "",
        });
      }
    }
  }, [defaultValues, reset]);

  // 🔥 address sync
  const handleSameAddress = (e) => {
    if (e.target.checked) {
      setValue("permanentAddress", presentAddress);
    } else {
      setValue("permanentAddress", "");
    }
  };

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <div className="bg-gray-100 py-14 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-10">
        <h2 className="text-2xl font-bold mb-10 text-gray-800">
          General Information
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 🔹 Name Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <Input
                label="Full Name (English)"
                error={errors.fullNameEn}
                required
                readOnly={!editable.name}
                {...register("fullNameEn", {
                  required: "Full Name is required",
                })}
              />
              <FaEdit
                onClick={() => setEditable((p) => ({ ...p, name: !p.name }))}
                className="absolute right-3 top-10 cursor-pointer text-gray-400 hover:text-[#ebb93a] duration-300"
              />
            </div>

            <Input
              label="Full Name (Bangla)"
              required
              error={errors.fullNameBn}
              {...register("fullNameBn", { required: "Full Name is required" })}
            />
          </div>

          {/* 🔹 Parents Row */}
          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="Father Name"
              required
              error={errors.fatherName}
              {...register("fatherName", {
                required: "Father name is Required",
              })}
            />
            <Input
              label="Mother Name"
              error={errors.motherName}
              required
              {...register("motherName", {
                required: "Mother name is required",
              })}
            />
            <Input label="Spouse Name" {...register("spouseName")} />
          </div>

          {/* 🔹 Address Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Present Address"
                error={errors.presentAddress}
                required
                {...register("presentAddress", {
                  required: "Present address is required",
                })}
              />
            </div>

            <div>
              <Input
                label="Permanent Address"
                error={errors.permanentAddress}
                required
                {...register("permanentAddress", {
                  required: "Permanent address is required",
                })}
              />

              <label className="flex items-center gap-2 mt-2 text-sm">
                <input type="checkbox" onChange={handleSameAddress} />
                Same as Present Address
              </label>
            </div>
          </div>

          {/* 🔹 Basic Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="Nationality"
              error={errors.nationality}
              required
              {...register("nationality", {
                required: "Nationality is Required",
              })}
            />
            <Input
              label="Date of Birth"
              required
              error={errors.dob}
              type="date"
              {...register("dob", { required: "Date of Birth is Required" })}
            />
            <Input
              label="NID / Passport"
              required
              error={errors.nid}
              {...register("nid", { required: "NID/Passport is Required" })}
            />
          </div>

          {/* 🔹 Marriage */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Marriage Date"
              type="date"
              {...register("marriageDate")}
            />
            <Input label="TIN No" {...register("tin")} />
          </div>

          {/* 🔹 Contact Row */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative">
              <Controller
                name="mobile1"
                rules={{ required: "Phone number is required" }}
                control={control}
                render={({ field, fieldState }) => (
                  <PhoneInput
                    label="Mobile No #1"
                    required
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    error={fieldState.error}
                    readOnly={!editable.phone}
                  />
                )}
              />
              <FaEdit
                onClick={() => setEditable((p) => ({ ...p, phone: !p.phone }))}
                className="absolute right-3 top-10 cursor-pointer text-gray-400 hover:text-[#ebb93a] duration-300"
              />
            </div>

            <Controller
              name="mobile2"
              control={control}
              render={({ field, fieldState }) => (
                <PhoneInput
                  label="Mobile No #2"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  error={fieldState.error}
                />
              )}
            />

            <div className="relative">
              <Input
                label="Email"
                error={errors.email}
                required
                readOnly={!editable.email}
                {...register("email", { required: "Email is required" })}
              />
              <FaEdit
                onClick={() => setEditable((p) => ({ ...p, email: !p.email }))}
                className="absolute right-3 top-10 cursor-pointer text-gray-400 hover:text-[#ebb93a] duration-300"
              />
            </div>
          </div>

          {/* 🔹 Profession Row */}
          <div className="grid md:grid-cols-3 gap-6">
            <Select
              label="Profession"
              required
              options={[
                "BUSINESS",
                "SERVICE",
                "GOVERNMENT SERVICE",
                "PRIVATE SERVICE",
                "STUDENT",
                "OTHERS",
              ]}
              error={errors.profession}
              {...register("profession", {
                required: "Profession is Required",
              })}
            />

            <Input
              label="Designation"
              required
              error={errors.designation}
              {...register("designation", {
                required: "Designation is Required",
              })}
            />

            <Input
              label="Organization"
              //   error={errors.organization}
              {...register("organization", {
                // required: "Organization is Required",
              })}
            />
          </div>

          {/* 🔹 File Upload Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              required
              error={errors.applicantPhoto}
              label="Applicant Photo"
              type="file"
              {...register("applicantPhoto", {
                required: "Applicant photo is required",
              })}
            />

            <Input
              label="Documents"
              type="file"
              multiple
              {...register("documents")}
              //   { required: true }
            />
          </div>

          {/* 🔹 Actions */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onPrevious}
              className="bg-gray-200 px-6 py-2 rounded cursor-pointer"
            >
              Previous
            </button>

            <button
              type="submit"
              className="bg-[#ebb93a] hover:bg-[#daa624] px-6 py-2 rounded font-semibold cursor-pointer"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
