import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSoundSystem } from "@/hooks/useSoundSystem";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AudioSettings() {
  const { volume, setVolume, isMuted, toggleMute } = useSoundSystem();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <span className="sr-only">Paramètres Audio</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Audio</h4>
            <p className="text-sm text-muted-foreground">
              Ajustez le volume des effets sonores.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="shrink-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={setVolume}
              className="flex-1"
            />
            <span className="w-12 text-sm text-right font-mono">
              {isMuted ? 0 : Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
