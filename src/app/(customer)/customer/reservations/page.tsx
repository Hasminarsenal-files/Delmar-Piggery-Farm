"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerReservationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/customer/orders");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 font-sans text-xs">
      <p>Redirecting to unified My Orders hub...</p>
    </div>
  );
}
