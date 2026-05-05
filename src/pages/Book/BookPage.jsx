import { useState } from "react";
import FormStepper from "../../components/FormStepper";
import GeneralInformationForm from "../../components/GeneralInformationForm";
import HeroBanner from "../../components/HeroBanner";
import NomineeInformation from "../../components/NomineeInformation";
import PaymentScheduleForm from "../../components/PaymentScheduleForm";
import SuccessModal from "../../components/SuccessModal";

const BookPage = () => {
  const [step, setStep] = useState(1);

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [generalInfo, setGeneralInfo] = useState(null);
  const [nomineeInfo, setNomineeInfo] = useState(null);

  const [loading, setLoading] = useState(false);

  const [activeOffer, setActiveOffer] = useState(null);
  const [applyOffer, setApplyOffer] = useState(false);

  const [showModal, setShowModal] = useState(false);

  // ============================
  // FINAL SUBMIT (FIXED)
  // ============================
  const handleFinalSubmit = async (nomineeData) => {
    try {
      setLoading(true);

      const formData = new FormData();

      // ============================
      // GENERAL INFO
      // ============================
      const { applicantPhoto, documents, ...restGeneral } = generalInfo;

      // ============================
      // NOMINEE INFO
      // ============================
      const { nomineePhoto, ...restNominee } = nomineeData;

      formData.append("generalInformation", JSON.stringify(restGeneral));
      formData.append("nomineeInformation", JSON.stringify(restNominee));

      // ============================
      // 🔥 PAYMENT INFO FIX
      // ============================
      const { salesmanInput, ...restPayment } = paymentInfo || {};

      formData.append(
        "paymentSchedule",
        JSON.stringify({
          ...restPayment,
          appliedOffer: applyOffer ? activeOffer?._id : null,
        })
      );

      // 🔥 IMPORTANT (separate field)
      formData.append("salesmanInput", salesmanInput || "");

      // ============================
      // FILES
      // ============================
      if (applicantPhoto?.[0]) {
        formData.append("applicantPhoto", applicantPhoto[0]);
      }

      if (nomineePhoto?.[0]) {
        formData.append("nomineePhoto", nomineePhoto[0]);
      }

      const docsArray = Array.from(documents || []);
      docsArray.forEach((doc) => {
        formData.append("documents", doc);
      });

      // ============================
      // API CALL
      // ============================
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/booking/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      setLoading(false);

      if (!response.ok) {
        throw new Error(result.message);
      }

      // ============================
      // SUCCESS
      // ============================
      setShowModal(true);
      setStep(1);

      setPaymentInfo(null);
      setGeneralInfo(null);
      setNomineeInfo(null);
      setApplyOffer(false);
    } catch (error) {
      setLoading(false);
      console.error("Booking Error:", error.message);
    }
  };

  return (
    <div>
      <HeroBanner onOfferLoad={setActiveOffer} />

      <div className="max-w-6xl mx-auto px-4">
        <FormStepper currentStep={step} />
      </div>

      {step === 1 && (
        <PaymentScheduleForm
          defaultValues={paymentInfo}
          offer={activeOffer}
          applyOffer={applyOffer}
          setApplyOffer={setApplyOffer}
          onNext={(data) => {
            setPaymentInfo(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <GeneralInformationForm
          defaultValues={generalInfo}
          onNext={(data) => {
            setGeneralInfo(data);
            setStep(3);
          }}
          onPrevious={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <NomineeInformation
          defaultValues={nomineeInfo}
          onPrevious={() => setStep(2)}
          onSubmit={(data) => {
            setNomineeInfo(data);
            handleFinalSubmit(data);
          }}
          loading={loading}
        />
      )}

      <SuccessModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default BookPage;