import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { listNotifications } from "@/lib/mysql/notifications";

export const instant = false;

export default async function NotificationsPage() {
  const current = await getCurrentStudentSession();
  if (!current) redirect("/login");
  let notifications: Awaited<ReturnType<typeof listNotifications>> = [];
  let unavailable = false;
  try { notifications = await listNotifications(current.profile._id); } catch { unavailable = true; }
  const unread = notifications.filter((notification) => !notification.read_at).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4"><PageHeader eyebrow="UPDATES" first="Your latest" second="activity." description="Private updates about claims and your lost and found reports." />{!unavailable && unread > 0 && <MarkAllReadButton />}</div>
      {unavailable ? <Card className="mt-6 p-6 text-sm text-danger" role="alert">Notifications are temporarily unavailable. Check the MySQL connection and try again.</Card>
        : notifications.length === 0 ? <Card className="mt-6 p-6 sm:p-8"><span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent-bright"><Bell size={20} aria-hidden="true" /></span><h2 className="mt-4 text-lg font-bold">You’re all caught up</h2><p className="mt-2 text-sm leading-6 text-muted">Updates about claims on your reports will appear here.</p></Card>
        : <div className="mt-6 space-y-3">{notifications.map((notification) => <Card key={notification.id} className={`p-5 ${notification.read_at ? "" : "border-accent/30"}`}><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{notification.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{notification.body}</p><p className="mt-2 text-xs text-subtle">{new Date(notification.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}{notification.read_at ? " · Read" : " · New"}</p><Link href={notification.href} className="focus-ring mt-3 inline-flex min-h-9 items-center rounded text-sm font-semibold text-accent-bright">Open update</Link></div>{!notification.read_at && <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}</div></Card>)}</div>}
    </div>
  );
}
