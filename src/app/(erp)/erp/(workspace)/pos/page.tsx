import { redirect } from "next/navigation";

/** Legacy POS route → light Counter desk */
export default function PosRedirect() {
  redirect("/erp/counter");
}
