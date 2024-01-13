import Link from "next/link";
import KeyValue from "~~/components/KeyValue";

export default function Summary({
  heading,
  Icon,
  data,
  primaryButtonHref,
  primaryButtonText,
  secondaryButtonHref,
  secondaryButtonText,
}: any) {
  return (
    <>
      <div className="flex justify-center m-4 flex-col mx-auto">
        <h2 className="mx-auto text-lg font-black">{heading}</h2>
        <div className="flex w-full mx-auto mt-4">
          <KeyValue data={data} />
        </div>
        <div className="flex mx-auto justify-between">
          <Link href={secondaryButtonHref} className="btn btn-sm btn-secondary m-4">
            {secondaryButtonText}
          </Link>
          <Link href={primaryButtonHref} className="btn btn-sm btn-primary m-4">
            {Icon && <Icon className="h-4 w-4" />}
            {primaryButtonText}
          </Link>
        </div>
      </div>
    </>
  );
}
