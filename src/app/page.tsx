import { Badge } from "@/components/ui/badge";
import Iphone15Pro from "@/components/ui/iphone-mockup";
import { StarsIcon } from "lucide-react";
import Image from "next/image";

export default async function Page() {
  return (
    <main className="w-2/3 flex flex-col gap-6 mx-auto items-center py-16">
      <Badge variant={"outline"}>
        <StarsIcon className="size-6 fill-amber-400 text-amber-400" />
        Transform Your Experience
      </Badge>
      <h1 className="text-6xl text-center">
        Indulge in the World of
        <br /> Luxurious Fashion!
      </h1>
      <p className="text-center">
        Download Luxique for exclusive collections and
        <br /> a seamless luxury shopping experience
      </p>
      <div className="flex items-center-justify-center gap-4">
        <div className="group relative cursor-pointer">
          <Image
            src="/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
            alt="Download on the App Store"
            width={160}
            height={60}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded">
            <span className="text-white font-medium">Coming soon</span>
          </div>
        </div>
      </div>
      {/* <div className="py-8">
        <Iphone15Pro />
      </div> */}
    </main>
  );
}
