import React from "react";
import { Document, Page, Text, View, Link, StyleSheet, pdf } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// ─── PDF Stylesheet (React-PDF compatible) ──────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 70,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#3A3F47", // Mountain Gray
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 1.5,
    borderBottomColor: "#2D5016", // Forest Green
    paddingBottom: 12,
  },
  brandName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#8B6F47", // Earth Brown
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: "Times-Bold",
    color: "#2D5016", // Forest Green
    lineHeight: 1.2,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F4F6F4", // Pale green tint
    padding: 12,
    marginBottom: 25,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metaItem: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#8B6F47", // Earth Brown
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#3A3F47",
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    color: "#2D5016",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 4,
  },
  dayContainer: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dayNumber: {
    backgroundColor: "#2D5016",
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
    textAlign: "center",
  },
  dayTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#3A3F47",
  },
  dayDetails: {
    paddingLeft: 42,
    fontSize: 9.5,
    color: "#4A5568",
    textAlign: "justify",
  },
  guideCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B35", // Accent Orange
    backgroundColor: "#FFF9F6", // Light orange tint
  },
  guideLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#FF6B35",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  guideName: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    color: "#2D5016",
    marginBottom: 6,
  },
  guideMeta: {
    flexDirection: "row",
    fontSize: 9,
    color: "#718096",
    marginBottom: 12,
  },
  guideMetaSeparator: {
    marginHorizontal: 6,
  },
  unlockButton: {
    backgroundColor: "#FF6B35",
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    textAlign: "center",
    textDecoration: "none",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 8,
    color: "#A0AEC0",
  },
  footerLink: {
    color: "#1E90FF", // Sky Blue
    textDecoration: "none",
  },
});

// ─── PDF Document Component ─────────────────────────────────────────────
interface PDFProps {
  itinerary: {
    title: string;
    duration: string;
    maxAltitude: string;
    difficulty: string;
    companions: string;
    days: Array<{ day: number; title: string; details: string }>;
    guide?: { name: string; rating: string; trips: string };
  };
  leadName: string;
  itineraryUrl: string;
  unlockUrl: string;
}

const ItineraryPDFDocument = ({ itinerary, leadName, itineraryUrl, unlockUrl }: PDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Brand & Title Header */}
      <View style={styles.header}>
        <Text style={styles.brandName}>Blue Sheep Adventures</Text>
        <Text style={styles.title}>{itinerary.title}</Text>
      </View>

      {/* Meta Specifications */}
      <View style={styles.metaSection}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Duration</Text>
          <Text style={styles.metaValue}>{itinerary.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Max Altitude</Text>
          <Text style={styles.metaValue}>{itinerary.maxAltitude}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Difficulty</Text>
          <Text style={styles.metaValue}>{itinerary.difficulty}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Traveler Type</Text>
          <Text style={styles.metaValue}>{itinerary.companions}</Text>
        </View>
      </View>

      {/* Days Breakdown */}
      <Text style={styles.sectionHeading}>Day-by-Day Trek Route</Text>
      <View>
        {itinerary.days.map((day) => (
          <View key={day.day} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayNumber}>Day {day.day}</Text>
              <Text style={styles.dayTitle}>{day.title}</Text>
            </View>
            <Text style={styles.dayDetails}>{day.details}</Text>
          </View>
        ))}
      </View>

      {/* Local Provider Info (Gated) */}
      {itinerary.guide && (
        <View style={styles.guideCard} break>
          <Text style={styles.guideLabel}>Verified Local Trek Guide</Text>
          <Text style={styles.guideName}>{itinerary.guide.name}</Text>
          <View style={styles.guideMeta}>
            <Text>Rating: {itinerary.guide.rating} ★</Text>
            <Text style={styles.guideMetaSeparator}>•</Text>
            <Text>{itinerary.guide.trips} Trips Guided</Text>
          </View>
          <Link style={styles.unlockButton} src={unlockUrl}>
            Unlock Guide's Direct Phone & WhatsApp Contact
          </Link>
        </View>
      )}

      {/* Fixed Footer */}
      <View style={styles.footer} fixed>
        <Text>Prepared for {leadName} · Powered by Blue Sheep Adventures</Text>
        <Link style={styles.footerLink} src={itineraryUrl}>
          View Live Itinerary
        </Link>
      </View>
    </Page>
  </Document>
);

// ─── API Router GET Handler ──────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Itinerary ID is required" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const leadIdParam = searchParams.get("leadId");

    const supabase = createServerClient();

    // 1. Resolve lead from query parameter or auth session
    let lead = null;
    let user = null;

    if (leadIdParam) {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadIdParam)
        .maybeSingle();
      if (data) {
        lead = data;
      }
    }

    // Try verifying user authentication to find the lead
    const authHeader = req.headers.get("Authorization");
    if (!lead && authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      if (authUser) {
        user = authUser;
        const { data } = await supabase
          .from("leads")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();
        if (data) {
          lead = data;
        }
      }
    }

    // 2. Gate PDF download on lead registration
    if (!lead) {
      return NextResponse.json(
        { error: "Lead profile required to download PDF", showLeadModal: true },
        { status: 402 }
      );
    }

    // 3. Fetch Itinerary
    const { data: itinerary, error: itineraryError } = await supabase
      .from("itineraries")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (itineraryError || !itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    const itineraryContent = itinerary.content as any;

    // 4. Log the PDF Download
    const { error: logError } = await supabase
      .from("pdf_downloads")
      .insert({
        itinerary_id: id,
        lead_id: lead.id,
        user_id: user?.id || lead.user_id || null,
      });

    if (logError) {
      console.error("Failed to log PDF download:", logError);
    }

    // 5. Generate PDF Document
    const host = req.headers.get("host") || "bluesheepadventures.com";
    const protocol = req.nextUrl.protocol || "https:";
    const itineraryUrl = `${protocol}//${host}/dashboard?itineraryId=${id}`;
    const unlockUrl = `${protocol}//${host}/dashboard?unlockProvider=true`;

    const doc = (
      <ItineraryPDFDocument
        itinerary={itineraryContent}
        leadName={lead.name}
        itineraryUrl={itineraryUrl}
        unlockUrl={unlockUrl}
      />
    );

    // Render components to PDF buffer
    const pdfStream = await pdf(doc).toBuffer();

    // 6. Return PDF stream response
    const filename = `${(itineraryContent.title || "Trek").replace(/\s+/g, "_")}_Itinerary.pdf`;

    return new Response(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("PDF download generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
