import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";

import { Navigation } from "@/components/navigation";
import { ProfileClient } from "./client-wrapper";
import { ProfileSkeleton } from "@/components/loaders/profile-skeleton";

export default async function ProfilePage() {
  const session = await getSession();

  // Protect the page
  if (!session || !session.user) {
    redirect("/auth"); // Redirect to unified auth page
  }

  // Fetch dynamic stats
  const completedHarvests = await prisma.basket.count({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
  });

  const aggregateResult = await prisma.basket.aggregate({
    where: {
      userId: session.user.id,
    },
    _sum: {
      currentAmount: true,
    },
  });

  const totalSaved = aggregateResult._sum.currentAmount || 0;

  return (
    <>
      <Navigation />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileClient
          stats={{
            completedHarvests,
            totalSaved: Number(totalSaved),
          }}
        />
      </Suspense>
    </>
  );
}
