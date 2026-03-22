"use client";

import { Suspense } from "react";
import { CompareContent } from "./CompareContent";
import { MobileNav } from "@/components/MobileNav";

export default function ComparePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 skeleton rounded" />
            <div className="h-12 skeleton rounded-lg" />
            <div className="aspect-square max-w-[600px] mx-auto skeleton rounded-lg" />
          </div>
        }
      >
        <CompareContent />
      </Suspense>
      <MobileNav />
    </>
  );
}
