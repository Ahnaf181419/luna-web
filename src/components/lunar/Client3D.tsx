import { Suspense, lazy, useSyncExternalStore, type ComponentType } from "react";
import type { SiteId } from "@/lib/lunarvoid-data";

const LunarGlobe = lazy(() => import("./LunarGlobe")) as ComponentType<{
  activeSite: SiteId | null;
  onSelect: (id: SiteId) => void;
}>;

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-[460px] w-full items-center justify-center rounded-lg border border-border bg-surface/40 sm:h-[540px]">
      <span className="label-mono animate-pulse">{label}</span>
    </div>
  );
}

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/**
 * Client wrapper: defers WebGL initialisation until after first paint and
 * code-splits the three.js bundle out of the main chunk.
 */
export function GlobeClient(props: {
  activeSite: SiteId | null;
  onSelect: (id: SiteId) => void;
}) {
  const mounted = useMounted();
  if (!mounted) return <Placeholder label="Initialising lunar basemap…" />;
  return (
    <Suspense fallback={<Placeholder label="Initialising lunar basemap…" />}>
      <LunarGlobe {...props} />
    </Suspense>
  );
}
