import { Badge } from "@/components/ui/badge";
import { availabilityLabel } from "@/lib/erp/format";
import type { AvailabilityStatus } from "@/types/erp";

function variantForStatus(
  status: AvailabilityStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "in_stock":
      return "default";
    case "low_stock":
      return "secondary";
    case "out_of_stock":
      return "destructive";
    case "coming_soon":
    case "enquire_only":
      return "outline";
    default:
      return "outline";
  }
}

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <Badge variant={variantForStatus(status)}>
      {availabilityLabel(status)}
    </Badge>
  );
}
