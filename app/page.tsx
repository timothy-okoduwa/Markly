// app/page.tsx

import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to login page
  // Users will be automatically redirected to dashboard if authenticated
  redirect("/login");
}
