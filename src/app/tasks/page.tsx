import { Suspense } from "react";
import TasksPage from "./tasks";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksPage />
    </Suspense>
  );
}
