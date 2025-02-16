"use client"

import { StudyTimer } from "@/components/timer/StudyTimer";

export default function TimerPage() {
  return (
    <div className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-10 bg-[#EFE9D5] min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Study Timer
        </h1>
        <span className="text-sm sm:text-base text-gray-600">
          Track your focus sessions and boost productivity
        </span>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <StudyTimer />
      </div>
    </div>
  );
}