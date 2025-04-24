import Image from "next/image";

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-end justify-center mb-10">
        <h1 className="text-8xl">Monster</h1>
        <small>By Eric Chu</small>
      </div>
      <a href="https://github.com/ericchu94/monster" target="_blank" rel="noopener noreferrer"><Image src="https://img.shields.io/badge/GitHub-%23121011.svg" alt="Github" width={94} height={40} /></a>
      <Image src="/bmc_qr.png" alt="Buy Me A Coffee QR Code" height={150} width={150} className="m-4" />
      <a href="https://www.buymeacoffee.com/ericchu" target="_blank"><Image src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height={60} width={217} /></a>
    </div>
  );
}
