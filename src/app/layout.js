import "./globals.css";

export const metadata = {
  title: "FormalCraft AI — Executive Email & Letter Assistant",
  description:
    "Transform informal bullet points and notes into impeccably formatted, executive-grade business emails, official college applications, and formal dispute notices.",
  keywords: [
    "formal email assistant",
    "executive letter generator",
    "college leave application",
    "business correspondence",
    "professional letter templates",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}