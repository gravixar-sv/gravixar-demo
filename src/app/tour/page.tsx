import { redirect } from "next/navigation";

// The 60-second guided tour has been retired in favour of the
// identity-fork entry screen (Session 1, 2026-05-29). All /tour
// traffic redirects to the new entry screen.
export default function TourRedirect() {
  redirect("/");
}
