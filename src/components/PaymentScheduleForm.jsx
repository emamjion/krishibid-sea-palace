import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "./Input";

const BASE_SHARE_PRICE = 480000;

const PaymentScheduleForm = ({
  onPrevious,
  onNext,
  loading,
  offer,
  applyOffer,
  setApplyOffer,
  defaultValues
}) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      sharePrice: BASE_SHARE_PRICE,
      shareCalculationResult: 0,
      salesmanInput: "",
       ...defaultValues,
    },
  });

  const numberOfShare = watch("numberOfShare");

  const discountedPrice =
    offer && applyOffer
      ? BASE_SHARE_PRICE - (offer.discountPrice || 0)
      : BASE_SHARE_PRICE;

  useEffect(() => {
    const total = Number(numberOfShare || 0) * discountedPrice;

    setValue("sharePrice", discountedPrice);
    setValue("shareCalculationResult", total);
  }, [numberOfShare, discountedPrice, setValue]);

  const submitHandler = (data) => {
    onNext(data);
  };

  return (
    <div className="bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg px-10 py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-10">
          PAYMENT SCHEDULE
        </h2>

        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <Input
              label="No of Share"
              required
              type="number"
              {...register("numberOfShare", { required: true })}
            />

            <div>
              <Input
                label="Share Price"
                type="number"
                suffix="BDT"
                readOnly
                {...register("sharePrice")}
              />

              {offer && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setApplyOffer(!applyOffer)}
                    className="text-sm cursor-pointer"
                  >
                    {applyOffer ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-400">
                          ৳{BASE_SHARE_PRICE}
                        </span>
                        <span className="text-green-600 font-semibold">
                          ৳{discountedPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="text-blue-600 hover:underline">
                        Apply Offer
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            <Input
              label="Share Calculation Result"
              type="number"
              suffix="BDT"
              readOnly
              {...register("shareCalculationResult")}
            />

            {/* 🔥 NEW FIELD (SAFE) */}
            <Input
              label="Salesman (Optional)"
              placeholder="Enter salesman name / phone / ID"
              {...register("salesmanInput")}
            />
          </div>

          <div className="flex justify-between mt-12">
            <button
              type="button"
              onClick={onPrevious}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-2.5 text-sm rounded"
            >
              Previous
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`bg-[#ebb93a] font-semibold px-6 py-2.5 text-sm rounded
              ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#daa624]"
              }`}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentScheduleForm;
