export const metadata = {
  title: "Terms of Use | BSV Campaign",
  description:
    "Read the Terms of Use governing access to and use of the BSV Campaign website.",
};

const sections = [
  {
    id: 1,
    title: "Website Usage",
    content: [
      "Access to and use of this website is subject to these Terms of Use. Please do not use this website unless you agree with these conditions.",
      "This website has been developed and administered by BSV (A Mankind Group Company). BSV reserves the right to modify, discontinue or update any part of this website or these Terms of Use at any time without prior notice.",
      "Your continued use of this website after any changes indicates your acceptance of those changes.",
    ],
  },
  {
    id: 2,
    title: "Pharmacovigilance",
    content: [
      "This website is not intended to record or report adverse events.",
      "If you wish to report a suspected side effect or adverse reaction related to a BSV product, please contact the official Pharmacovigilance Unit using the communication channels provided by BSV.",
    ],
  },
  {
    id: 3,
    title: "No Warranty & Liability",
    content: [
      "BSV makes every reasonable effort to ensure that the information provided on this website is accurate and up to date.",
      "However, no warranty, express or implied, is provided regarding the completeness, reliability or suitability of the information available on this website.",
      "Users access and use this website entirely at their own risk. BSV shall not be liable for any direct, indirect, incidental or consequential damages resulting from the use of this website.",
    ],
  },
  {
    id: 4,
    title: "Forward-Looking Information",
    content: [
      "This website may contain forward-looking statements based on current assumptions and expectations.",
      "Actual results may differ due to known and unknown risks, uncertainties and other factors. BSV assumes no obligation to update these statements.",
    ],
  },
  {
    id: 5,
    title: "Third-Party Links",
    content: [
      "Links to external websites are provided solely for user convenience.",
      "BSV does not endorse or assume responsibility for third-party content, privacy practices or services.",
    ],
  },
  {
    id: 6,
    title: "Trademarks & Copyright",
    content: [
      "All trademarks, logos, graphics, text and intellectual property displayed on this website belong to BSV or their respective owners unless otherwise stated.",
      "Unauthorized copying, distribution or reproduction of website content is prohibited.",
    ],
  },
  {
    id: 7,
    title: "International Users",
    content: [
      "This website is operated from India and is intended for international access.",
      "Users accessing the website from outside India are responsible for complying with local laws applicable in their jurisdiction.",
    ],
  },
  {
    id: 8,
    title: "Indemnity",
    content: [
      "Users agree to indemnify and hold harmless BSV from any claims, liabilities, damages, losses or expenses arising from unauthorized or unlawful use of this website.",
    ],
  },
  {
    id: 9,
    title: "Applicable Law & Jurisdiction",
    content: [
      "These Terms of Use are governed by the laws of India.",
      "Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, India.",
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-slate-100">

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#0B3F8A] via-[#1658B8] to-[#2A78D2]">
        <div className="max-w-6xl mx-auto px-6 py-20">

          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            Legal Information
          </span>

          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            Terms of Use
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100">
            Please read these Terms carefully before accessing or using this
            website. By continuing to browse this website, you agree to comply
            with these Terms of Use.
          </p>

        </div>
      </section>

      {/* Document */}
      <section className="-mt-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">

          <div className="bg-white rounded-[28px] shadow-xl border border-slate-200 overflow-hidden">

            {/* Header */}
            <div className="border-b border-slate-200 px-10 py-8">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                

                <div className="rounded-xl bg-slate-100 px-5 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Last Updated
                  </p>

                  <p className="font-semibold text-slate-800">
                    July 2026
                  </p>
                </div>

              </div>

            </div>

            <div className="p-8 md:p-10 space-y-12">
              {sections.map((section) => (
                <section
                  key={section.id}
                  className="border-b border-slate-200 last:border-b-0 pb-10 last:pb-0"
                >
                  <div className="flex items-start gap-5">

                    {/* Number */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                      {String(section.id).padStart(2, "0")}
                    </div>

                    {/* Content */}
                    <div className="flex-1">

                      <h3 className="text-2xl font-bold text-slate-900">
                        {section.title}
                      </h3>

                      <div className="mt-5 space-y-5">
                        {section.content.map((paragraph, index) => (
                          <p
                            key={index}
                            className="text-[16px] leading-8 text-slate-600"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>

                    </div>
                  </div>
                </section>
              ))}

              {/* Disclaimer */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

                <h3 className="text-lg font-semibold text-blue-900">
                  Important Notice
                </h3>

                <p className="mt-3 leading-7 text-slate-700">
                  The information contained on this website is provided for
                  general informational purposes only. BSV reserves the right to
                  modify these Terms of Use without prior notice. Users are
                  encouraged to review this page periodically for any updates.
                </p>

              </div>

            </div>
          </div>

          {/* Bottom */}

          <div className="mt-8 text-center">

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Bharat Serums and Vaccines Ltd.
              All Rights Reserved.
            </p>

          </div>

        </div>
      </section>

    </main>
  );
}