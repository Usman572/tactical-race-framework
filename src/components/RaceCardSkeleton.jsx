import Skeleton from "./Skeleton";

const RaceCardSkeleton = () => {
  return (
    <div className="backdrop-blur-xl border border-[var(--border-main)] rounded-[2rem] p-6 bg-[var(--glass-bg)] h-full overflow-hidden flex flex-col justify-between">
      <div className="relative z-10">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-6">
          <Skeleton className="w-16 h-5 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>

        {/* Title & Location Skeleton */}
        <div className="mb-6">
          <Skeleton className="w-48 h-6 mb-2" />
          <Skeleton className="w-32 h-4" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-[var(--bg-main)]">
            <Skeleton className="w-10 h-2 mb-2" />
            <Skeleton className="w-full h-4" />
          </div>
          <div className="p-3 rounded-2xl bg-[var(--bg-main)]">
            <Skeleton className="w-10 h-2 mb-2" />
            <Skeleton className="w-full h-4" />
          </div>
        </div>

        {/* Operatives Skeleton */}
        <div className="mb-8">
          <Skeleton className="w-24 h-2 mb-3" />
          <div className="bg-[var(--bg-main)] p-3 rounded-2xl">
            <div className="flex -space-x-2">
              <Skeleton className="w-6 h-6 rounded-full border-2 border-[var(--bg-main)]" />
              <Skeleton className="w-6 h-6 rounded-full border-2 border-[var(--bg-main)]" />
              <Skeleton className="w-6 h-6 rounded-full border-2 border-[var(--bg-main)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Area Skeleton */}
      <div className="pt-4 border-t border-[var(--border-main)]">
         <Skeleton className="w-full h-10 rounded-2xl" />
      </div>
    </div>
  );
};

export default RaceCardSkeleton;
