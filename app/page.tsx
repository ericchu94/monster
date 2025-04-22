import Image from "next/image";

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-end justify-center m-20">
        <h1 className="text-8xl">Monster</h1>
        <small>By Eric Chu</small>
      </div>
      <a href="https://github.com/ericchu94/monster" target="_blank" rel="noopener noreferrer"><Image src="https://img.shields.io/badge/GitHub-%23121011.svg" alt="Github" width={47} height={20} /></a>
    </div>
  );
}
