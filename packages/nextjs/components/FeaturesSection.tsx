import { CheckCircleIcon } from "@heroicons/react/24/solid";

const features = [
  {
    name: "Seamless Trading Experience",
    description:
      "Trade with unparalleled ease on dOTC. Our intuitive interface is designed to simplify your trading journey, allowing you to execute transactions smoothly and efficiently. Experience the future of OTC trading with a platform that adapts to your needs.",
  },
  {
    name: "Decentralized and Secure",
    description:
      "Your security is our top priority. dOTC leverages the power of blockchain technology to provide a decentralized trading environment. Enjoy peace of mind with end-to-end encryption and smart contract-powered settlements that ensure your trades are secure and tamper-proof.",
  },
  // Add more features as needed
];

export default function Features() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">dOTC Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Effortless OTC Transactions
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Navigate the new era of asset exchange with dOTC's streamlined trading experience. Our platform is the
            epitome of sophistication, offering a frictionless path to transacting large-scale digital assets. Say
            goodbye to complexity and hello to effortless trading.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map(feature => (
              <div key={feature.name} className="relative">
                <dt>
                  <CheckCircleIcon className="absolute h-6 w-6 text-green-500" aria-hidden="true" />
                  <p className="ml-9 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-9 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
