import { Loader2 } from "lucide-react";

export default function Spinner() {
  return (
    <div className="flex justify-center py-6">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}
