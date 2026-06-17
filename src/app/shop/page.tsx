import { Suspense } from "react";
import ShopClient from "./ShopClient";

export const metadata = {
  title: "Shop the Range",
  description:
    "Heavyweight hoodies, tees, flannels, caps and more — built for the bush, made for the long haul.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-void" />}>
      <ShopClient />
    </Suspense>
  );
}
