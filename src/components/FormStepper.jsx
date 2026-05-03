const steps = [
  { id: 1, title: "PAYMENT\nSCHEDULE", left: "0%" },
  { id: 2, title: "GENERAL\nINFORMATION", left: "50%" },
  { id: 3, title: "NOMINEE\nDETAILS", left: "100%" },
];

export default function FormStepper({ currentStep = 1 }) {
  return (
    <div className="relative mb-16 pt-10">
      <div className="relative w-full">
        <div className="absolute top-12.5 left-0 w-full h-0.5 bg-gray-300" />

        {steps.slice(0, -1).map((step, index) => {
          const nextStep = steps[index + 1];

          return (
            <div
              key={step.id}
              className={`absolute top-12.5 h-0.5 transition-colors duration-300
                ${currentStep > step.id ? "bg-[#ebb93a]" : "bg-transparent"}
              `}
              style={{
                left: step.left,
                width: `calc(${nextStep.left} - ${step.left})`,
              }}
            />
          );
        })}

        {/* Steps (UNCHANGED) */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                {/* Title */}
                <p
                  className={`mb-3 text-xs font-medium tracking-wide whitespace-pre-line
                    ${isActive ? "text-[#ebb93a]" : "text-gray-400"}
                  `}
                >
                  {step.title}
                </p>

                {/* Dot */}
                <div
                  className={`relative z-10 w-3 h-3 rounded-full
                    ${isActive || isCompleted ? "bg-[#ebb93a]" : "bg-gray-400"}
                  `}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
