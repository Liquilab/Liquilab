import { useParams } from "react-router-dom";

export function LegalPage() {
  const { page } = useParams<{ page: string }>();

  const content = {
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          heading: "Introduction",
          content: "At Liquilab, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our DeFi analytics platform.",
        },
        {
          heading: "Information We Collect",
          content: "We collect wallet addresses you choose to monitor (read-only access), email addresses for notifications and account management, and usage data to improve our services. We never collect private keys or have access to move your funds.",
        },
        {
          heading: "How We Use Your Information",
          content: "We use your information to provide liquidity pool analytics, send notifications about your positions, improve our services, and communicate important updates. We do not sell or share your personal information with third parties for marketing purposes.",
        },
        {
          heading: "Data Security",
          content: "We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest. We regularly audit our security practices and comply with GDPR requirements.",
        },
        {
          heading: "Your Rights",
          content: "You have the right to access, correct, or delete your personal information at any time. You can manage your data through your Account settings or contact us at privacy@liquilab.io.",
        },
        {
          heading: "Contact Us",
          content: "If you have questions about this Privacy Policy, please contact us at privacy@liquilab.io.",
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      sections: [
        {
          heading: "Acceptance of Terms",
          content: "By accessing and using Liquilab, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.",
        },
        {
          heading: "Description of Service",
          content: "Liquilab provides non-custodial analytics for DeFi liquidity pools on Flare Network. We offer read-only monitoring of your positions across supported DEXs including Ēnosys and SparkDEX.",
        },
        {
          heading: "User Responsibilities",
          content: "You are responsible for maintaining the security of your wallet and private keys. Liquilab is not custodial and cannot recover lost keys or access your funds. You agree to use the service in compliance with all applicable laws.",
        },
        {
          heading: "Subscription and Billing",
          content: "Paid plans are billed monthly in EUR. You can cancel at any time, and your access will continue until the end of your billing period. Refunds are not provided for partial months.",
        },
        {
          heading: "Data Accuracy",
          content: "While we strive to provide accurate analytics, DeFi data can change rapidly. Liquilab is provided 'as is' without warranties. Always verify important decisions on-chain before taking action.",
        },
        {
          heading: "Limitation of Liability",
          content: "Liquilab is not liable for any losses resulting from your use of the platform, including but not limited to impermanent loss, transaction fees, or missed opportunities. You use the service at your own risk.",
        },
        {
          heading: "Changes to Terms",
          content: "We may update these Terms of Service from time to time. We will notify you of significant changes via email. Continued use of the service after changes constitutes acceptance of the new terms.",
        },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      sections: [
        {
          heading: "What Are Cookies",
          content: "Cookies are small text files stored on your device that help us provide and improve our services. They enable features like staying logged in and remembering your preferences.",
        },
        {
          heading: "Types of Cookies We Use",
          content: "Essential cookies: Required for the platform to function (authentication, security). Analytics cookies: Help us understand how users interact with Liquilab. Preference cookies: Remember your settings like view mode and theme.",
        },
        {
          heading: "Managing Cookies",
          content: "You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality. You can manage your cookie preferences through the banner at the bottom of the page.",
        },
        {
          heading: "Third-Party Cookies",
          content: "We use third-party services like analytics providers that may set their own cookies. These services have their own privacy policies governing their use of cookies.",
        },
        {
          heading: "Updates to This Policy",
          content: "We may update this Cookie Policy to reflect changes in our practices or for legal reasons. We will notify you of significant changes through our platform.",
        },
      ],
    },
  };

  const pageContent = content[page as keyof typeof content] || content.privacy;

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-[800px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-white mb-3">
            {pageContent.title}
          </h1>
          <p className="text-sm text-slate-400">
            Last updated: November 17, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#0F1A36] border border-white/10 rounded-lg p-8 space-y-8">
          {pageContent.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-white mb-3">
                {section.heading}
              </h2>
              <p className="text-slate-300 leading-relaxed">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          <p>
            Questions about our legal policies? Contact us at{" "}
            <a href="mailto:legal@liquilab.io" className="text-[#3B82F6] hover:underline">
              legal@liquilab.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}