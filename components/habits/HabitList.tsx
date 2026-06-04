"use client";
import React from "react"; // Forcing IDE re-parse

import HabitItem from "./HabitItem";

interface HabitDTO {
  _id: string;
  title: string;
  description?: string;
  targetTime?: string | null;
  completedDates: string[];
}

export default function HabitList({ initialHabits }: { initialHabits: HabitDTO[] }) {
  return (
    <div className="space-y-4">
      {initialHabits.map((habit) => (
        <HabitItem key={habit._id} habit={habit} />
      ))}
    </div>
  );
}
