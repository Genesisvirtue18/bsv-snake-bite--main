export const metadata = {
    title: "Privacy & Cookie Policy | BSV Campaign",
    description:
        "Learn how BSV collects, uses, stores and protects your personal information.",
};

const sections = [
    {
        id: 1,
        title: "Data Privacy",
        content: [
            "BSV (A Mankind Group Company) collects, uses and processes personal information only for legitimate business purposes and in accordance with applicable data protection laws.",
            "Personal information includes any information capable of identifying an individual directly or indirectly.",
            "Sensitive personal information may include financial information, health information, biometric information and passwords wherever applicable.",
        ],
    },
    {
        id: 2,
        title: "Information We Collect",
        content: [
            "We may collect personal identification information.",
            "Employment-related information where applicable.",
            "Device, browser and analytics information.",
            "Cookies and usage information to improve website performance.",
        ],
    },
    {
        id: 3,
        title: "Purpose of Collection",
        content: [
            "To comply with applicable laws and regulations.",
            "To provide requested services.",
            "To improve website functionality.",
            "To maintain security and prevent misuse.",
            "To support business operations.",
        ],
    },
    {
        id: 4,
        title: "Consent",
        content: [
            "By providing your personal information, you consent to its collection, processing, storage and use in accordance with this Privacy Policy.",
            "Where required by law, explicit consent may be obtained through written or electronic means.",
        ],
    },
    {
        id: 5,
        title: "Protection of Personal Information",
        content: [
            "BSV maintains appropriate administrative, technical and physical safeguards to protect personal information against unauthorized access, disclosure, loss or misuse.",
            "Only the minimum information necessary for legitimate business purposes is collected.",
        ],
    },
    {
        id: 6,
        title: "Third-Party Transfers",
        content: [
            "Personal information may be shared with authorized service providers where legally permitted and protected by appropriate safeguards.",
        ],
    },
    {
        id: 7,
        title: "Data Retention",
        content: [
            "Personal information is retained only as long as necessary to meet legal, regulatory and business requirements.",
        ],
    },
    {
        id: 8,
        title: "Your Rights",
        content: [
            "You may request access to your personal information.",
            "You may request corrections where applicable.",
            "You may withdraw consent where legally permitted.",
            "You may raise concerns with the designated grievance officer.",
        ],
    },
    {
        id: 9,
        title: "Cookie Policy",
        content: [
            "Cookies are small text files stored on your browser that improve website functionality and user experience.",
            "Cookies may remember preferences, analyse website traffic and enhance website performance.",
            "Most browsers allow users to manage or disable cookies through browser settings.",
        ],
    },
];

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-slate-100">

            {/* Hero */}
            <section className="bg-gradient-to-r from-[#0B3F8A] via-[#1658B8] to-[#2A78D2]">
                <div className="max-w-6xl mx-auto px-6 py-20">

                    <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                        Legal Information
                    </span>

                    <h1 className="mt-6 text-4xl md:text-5xl font-bold text-white">
                        Privacy & Cookie Policy
                    </h1>

                    <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100">
                        Learn how we collect, use, store and protect your personal
                        information while you use the BSV Campaign website.
                    </p>

                </div>
            </section>

            {/* Content */}

            <section className="-mt-12 pb-20">

                <div className="max-w-6xl mx-auto px-6">

                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">

                        <div className="border-b border-slate-200 px-10 py-8">

                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

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

                        <div className="space-y-12 p-8 md:p-10">
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

                            {/* Cookie Information */}

                            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-8">

                                <h3 className="text-2xl font-bold text-blue-900 mb-5">
                                    Managing Cookies
                                </h3>

                                <div className="space-y-4 text-slate-700 leading-8">

                                    <p>
                                        Most modern web browsers allow you to control cookies
                                        through their settings. You can choose to block or delete
                                        cookies at any time.
                                    </p>

                                    <p>
                                        Please note that disabling cookies may affect certain
                                        website features and reduce your browsing experience.
                                    </p>

                                </div>

                            </section>

                            {/* Contact */}

                            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-8">

                                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                    Privacy Questions
                                </h3>

                                <p className="leading-8 text-slate-700">
                                    If you have any questions regarding this Privacy & Cookie
                                    Policy or the handling of your personal information, you may
                                    contact the designated BSV grievance officer through the
                                    official communication channels.
                                </p>

                            </section>

                        </div>

                    </div>

                    {/* Footer */}

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