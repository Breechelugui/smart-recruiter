import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Smart Recruiter ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our technical assessment platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Personal Information:</strong> When you register for an account, we collect:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name, email address, and contact information</li>
                  <li>Username and password</li>
                  <li>Company information (for recruiters)</li>
                  <li>Professional background and experience</li>
                </ul>
                
                <p>
                  <strong>Assessment Data:</strong> When you participate in assessments, we collect:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Assessment responses and answers</li>
                  <li>Performance metrics and scores</li>
                  <li>Time taken to complete assessments</li>
                  <li>Code submissions and technical solutions</li>
                </ul>
                
                <p>
                  <strong>Usage Data:</strong> We automatically collect:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>IP address and browser information</li>
                  <li>Pages visited and time spent on our service</li>
                  <li>Device information and operating system</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our assessment platform</li>
                  <li>Process assessment requests and generate results</li>
                  <li>Communicate with you about our services</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Analyze usage patterns and optimize performance</li>
                  <li>Ensure security and prevent fraudulent activity</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>With Your Consent:</strong> We share your information when you explicitly authorize us to do so.
                </p>
                <p>
                  <strong>With Recruiters:</strong> Assessment results and candidate profiles are shared with recruiters 
                  who have legitimate access to evaluate candidates for specific positions.
                </p>
                <p>
                  <strong>Service Providers:</strong> We share information with third-party service providers who 
                  perform services on our behalf, such as hosting, analytics, and customer support.
                </p>
                <p>
                  <strong>Legal Requirements:</strong> We may disclose your information when required by law or 
                  to protect our rights, property, or safety.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and testing</li>
                <li>Access controls and authentication systems</li>
                <li>Employee training on data protection</li>
                <li>Secure data storage and backup systems</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Access:</strong> You have the right to request access to your personal information.
                </p>
                <p>
                  <strong>Correction:</strong> You can request correction of inaccurate or incomplete information.
                </p>
                <p>
                  <strong>Deletion:</strong> You can request deletion of your personal information, subject to legal obligations.
                </p>
                <p>
                  <strong>Portability:</strong> You can request a copy of your data in a structured, machine-readable format.
                </p>
                <p>
                  <strong>Objection:</strong> You can object to certain processing of your personal information.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. 
                  You can control cookies through your browser settings.
                </p>
                <p>
                  <strong>Essential Cookies:</strong> Required for basic functionality and security.
                </p>
                <p>
                  <strong>Analytics Cookies:</strong> Help us understand how our service is used.
                </p>
                <p>
                  <strong>Marketing Cookies:</strong> Used to personalize advertising and content (with consent).
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this 
                policy, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our service is not intended for children under 13. We do not knowingly collect personal information 
                from children under 13. If we become aware of such information, we will delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure 
                appropriate safeguards are in place for such transfers in accordance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">Email: privacy@smartrecruiter.com</p>
                <p className="text-gray-700">Address: 123 Tech Street, San Francisco, CA 94105</p>
                <p className="text-gray-700">Phone: +1 (555) 123-4567</p>
              </div>
            </section>

            <div className="bg-purple-50 rounded-lg p-6 mt-8">
              <h3 className="font-bold text-purple-900 mb-2">GDPR Rights</h3>
              <p className="text-purple-800">
                If you are located in the EU, you have additional rights under GDPR, including the right to lodge 
                a complaint with a supervisory authority. We have appointed a Data Protection Officer to handle 
                privacy-related matters.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
              Contact Us
            </Link>
            <Link to="/about" className="text-purple-600 hover:text-purple-700 font-medium">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
