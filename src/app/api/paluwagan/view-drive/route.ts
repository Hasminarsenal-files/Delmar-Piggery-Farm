import { NextResponse } from "next/server";
import { serverDriveCache } from "../upload-drive/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "Missing fileId parameter" },
        { status: 400 }
      );
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // 1. If real Google Drive Service Account credentials exist:
    if (clientEmail && privateKey && !fileId.startsWith("gdrive_")) {
      try {
        const { google } = await import("googleapis");
        const auth = new google.auth.JWT({
          email: clientEmail,
          key: privateKey.replace(/\\n/g, "\n"),
          scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        });

        const drive = google.drive({ version: "v3", auth });

        const metadata = await drive.files.get({
          fileId,
          fields: "name, mimeType",
        });

        const driveResponse = await drive.files.get(
          { fileId, alt: "media" },
          { responseType: "arraybuffer" }
        );

        const buffer = Buffer.from(driveResponse.data as ArrayBuffer);
        const fileName = metadata.data.name || `${fileId}.pdf`;

        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${fileName}"`,
            "Cache-Control": "private, no-store, max-age=0",
          },
        });
      } catch (gdriveErr: any) {
        console.warn("Error fetching from Google Drive API, falling back:", gdriveErr?.message || gdriveErr);
      }
    }

    // 2. Check server-side memory drive cache fallback
    const cachedItem = serverDriveCache._paluwaganPdfDriveMap?.get(fileId);
    if (cachedItem) {
      return new Response(new Uint8Array(cachedItem.buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${cachedItem.fileName}"`,
          "Cache-Control": "private, no-store, max-age=0",
        },
      });
    }

    // If file is not found in memory map, return a secure generated PDF stream
    return NextResponse.json(
      { error: "Google Drive File not found or access denied." },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Error retrieving PDF from Google Drive API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error retrieving PDF" },
      { status: 500 }
    );
  }
}
