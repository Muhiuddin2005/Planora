import { Metadata } from "next";
import EventDetailsClient from "@/components/events/EventDetailsClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/events/${id}`);
    const data = await res.json();
    const event = data.data;

    let shortDescription = "Secure Event Management";
    let imageUrl = "/favicon.png";

    try {
      const parsed = JSON.parse(event.description);
      shortDescription = parsed.shortDescription || shortDescription;
      imageUrl = parsed.imageUrl || imageUrl;
    } catch {}

    return {
      title: `${event.title} | Planora`,
      description: shortDescription,
      openGraph: {
        title: event.title,
        description: shortDescription,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description: shortDescription,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Event Details | Planora",
      description: "Secure Event Management",
    };
  }
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/events/${id}`, {
      cache: "no-store",
    });
    const data = await res.json();
    event = data.data;
  } catch (err) {
    console.error("Failed to fetch event details on server side:", err);
  }

  return <EventDetailsClient event={event} />;
}
