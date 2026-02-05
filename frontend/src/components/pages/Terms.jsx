import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Please read these terms carefully before using Smart Recruiter
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Smart Recruiter, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Smart Recruiter is a technical assessment platform that provides:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Technical assessment creation and management</li>
                <li>Candidate evaluation and skill testing</li>
                <li>Performance analytics and reporting</li>
                <li>Feedback and communication tools</li>
                <li>Integration with recruitment workflows</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>3.1 Account Registration:</strong> To use certain features of the service, you must register for an account. 
                  You agree to provide accurate, current, and complete information during registration.
                </p>
                <p>
                  <strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. 
                  You agree to notify us immediately of any unauthorized use of your account.
                </p>
                <p>
                  <strong>3.3 Account Termination:</strong> We reserve the right to suspend or terminate your account at any time 
                  for violations of these terms or for any other reason we deem appropriate.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to use the service to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use the service for fraudulent or deceptive purposes</li>
                <li>Share assessment content with unauthorized parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>5.1 Our Content:</strong> All content, features, and functionality of the service are owned by Smart Recruiter 
                  and are protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  <strong>5.2 User Content:</strong> You retain ownership of content you submit to the service. However, by submitting content, 
                  you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content 
                  for the purpose of providing the service.
                </p>
                <p>
                  <strong>5.3 Assessment Content:</strong> Assessment questions and materials created by recruiters remain the 
                  intellectual property of the creating party but are licensed to us for the purpose of providing the service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
                to understand our practices regarding your personal information.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We collect and process personal information in accordance with applicable data protection laws, including 
                GDPR where applicable. You have rights regarding your personal data, including access, correction, and deletion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>7.1 Subscription Fees:</strong> Certain features of the service may require payment of subscription fees. 
                  All fees are non-refundable unless otherwise specified.
                </p>
                <p>
                  <strong>7.2 Payment Method:</strong> You agree to provide current, complete, and accurate payment information. 
                  You authorize us to charge the applicable fees to your chosen payment method.
                </p>
                <p>
                  <strong>7.3 Changes to Fees:</strong> We reserve the right to modify our fees at any time. Any changes will be 
                  communicated to you in advance and will become effective at the start of the next billing cycle.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>8.1 Availability:</strong> We strive to maintain high availability of the service but do not guarantee 
                  uninterrupted access. The service may be temporarily unavailable for maintenance, updates, or other reasons.
                </p>
                <p>
                  <strong>8.2 Service Modifications:</strong> We reserve the right to modify, suspend, or discontinue any aspect 
                  of the service at any time without prior notice.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-gray-600 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                IN NO EVENT SHALL SMART RECRUITER, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE 
                FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, 
                LOSS OF PROFITS, DATA, USE, OR OTHER LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to indemnify and hold Smart Recruiter and its affiliates harmless from any claims, damages, 
                or expenses arising from your use of the service or violation of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>12.1 Termination by You:</strong> You may terminate your account at any time by following the account 
                  deletion process in your account settings.
                </p>
                <p>
                  <strong>12.2 Termination by Us:</strong> We may terminate or suspend your account immediately for any reason, 
                  including breach of these terms.
                </p>
                <p>
                  <strong>12.3 Effect of Termination:</strong> Upon termination, your right to use the service ceases immediately. 
                  Certain provisions of these terms shall survive termination.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of the State of California, 
                United States, without regard to its conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                Your continued use of the service constitutes acceptance of any modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-gray-700">Email: legal@smartrecruiter.com</p>
                <p className="text-gray-700">Address: 123 Tech Street, San Francisco, CA 94105</p>
                <p className="text-gray-700">Phone: +1 (555) 123-4567</p>
              </div>
            </section>

            <div className="bg-purple-50 rounded-lg p-6 mt-8">
              <p className="text-purple-800 text-center">
                By using Smart Recruiter, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
              Privacy Policy
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
