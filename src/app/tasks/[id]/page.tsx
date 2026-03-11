"use client";
import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TaskDetailsModal } from "@/components/tasks/TaskDetailsModal";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function Page() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProtectedPage>
        <DashboardLayout>
          <TaskDetailsModal
            token={token || ""}
            taskId={id as string}
            onClose={handleBack}
            onSuccess={handleBack}
            commentId={searchParams.get("commentId") || ""}
          />
        </DashboardLayout>
      </ProtectedPage>
    </Suspense>
  );
}
