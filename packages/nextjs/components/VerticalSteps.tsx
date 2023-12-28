import { ReactNode } from "react";

interface Step {
  label: string;
  content: ReactNode;
  isDisabled?: boolean;
}

interface Summary {
  label: string;
  content: ReactNode;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onJumpToStep: (step: number) => void;
  summary: Summary;
  isSubmitButtonLoading: boolean;
}

export default function VerticalSteps({
  steps,
  currentStep,
  onNext,
  onPrev,
  onSubmit,
  onJumpToStep,
  summary,
  isSubmitButtonLoading,
}: StepsProps) {
  return (
    <div className="grid grid-cols-12 gap-4 w-full">
      <div className="col-span-4">
        <div className="steps steps-vertical w-full">
          {steps.map((step, index) => (
            <div key={step.label}>
              <div
                onClick={() => onJumpToStep(index)}
                className={`step cursor-pointer ${
                  index === currentStep
                    ? "step-primary text-lg font-extrabold transition-colors duration-500 ease-in-out delay-200"
                    : ""
                } ${step.isDisabled ? "step-disabled" : ""}`}
              >
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-8 border border-l-2 border-b-0 border-r-0 p-2 pl-4 border-t-0">
        {steps[currentStep].content}
      </div>
      {summary && (
        <div className="col-span-4 p-4 bg-secondary border-r-2 rounded-md">
          <div className="flex font-extrabold mb-2">{summary.label}</div>
          <div className="flex w-full">{summary.content}</div>
        </div>
      )}
      <div className={`col-span-${summary ? 8 : 12} pt-4 flex justify-end`}>
        {currentStep > 0 && (
          <button className="btn btn-sm btn-primary mr-2" onClick={onPrev}>
            Previous
          </button>
        )}
        {currentStep < steps.length - 1 && (
          <button className="btn btn-sm btn-primary" onClick={onNext}>
            Next
          </button>
        )}
        {currentStep === steps.length - 1 && (
          <button className="btn btn-sm btn-primary" onClick={() => onSubmit()}>
            {isSubmitButtonLoading && <span className="loading loading-spinner"></span>}
            {isSubmitButtonLoading ? "Creating deal ..." : "Create Deal"}
          </button>
        )}
      </div>
    </div>
  );
}
