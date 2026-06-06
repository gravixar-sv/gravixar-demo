import Image from "next/image";
import type { Scene } from "@/lib/scenes";
import { WindowBar } from "@/components/demo/WindowChrome";

// A real captured screenshot of the live scene, framed like an app window.
// The premium move (per Linear/Vercel/Stripe): show the actual product in a
// browser-style frame with depth, not a faked mock-up. The scene's own colour
// lives inside the shot, so the frame itself stays neutral — restraint — and
// the product does the talking. Captures live in /public/scenes/<slug>.png.
export function ScenePreview({
  scene,
  priority = false,
  sizes,
}: {
  scene: Scene;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b10] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.85)] transition-[transform,border-color,box-shadow] duration-500 ease-out group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-[0_36px_72px_-30px_rgba(0,0,0,0.9)]">
      <WindowBar
        title={scene.name}
        trailing={
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
            live
          </span>
        }
      />
      <div className="relative aspect-[1600/738] w-full overflow-hidden bg-black">
        <Image
          src={`/scenes/${scene.slug}.png`}
          alt={`${scene.name}: ${scene.whatItIs}`}
          fill
          sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"}
          priority={priority}
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.015]"
        />
      </div>
    </div>
  );
}
