import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className='bg-white py-12 sm:py-16 lg:py-20'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h1 className='text-3xl font-extrabold text-indigo-800 sm:text-4xl lg:text-5xl mb-8'>Privacy Policy</h1>

        <div className='prose prose-indigo'>
          <p>Last updated: {new Date().toDateString()}</p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to Legal Scriber. We respect your privacy and are committed to protecting your personal data. This
            privacy policy will inform you about how we look after your personal data and tell you about your privacy
            rights and how the law protects you.
          </p>

          <h2>2. The Data We Collect About You</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped
            together as follows:
          </p>
          <ul>
            <li>Identity Data includes first name, last name, username or similar identifier.</li>
            <li>Contact Data includes email address and telephone numbers.</li>
            <li>
              Technical Data includes internet protocol (IP) address, your login data, browser type and version, time
              zone setting and location, browser plug-in types and versions, operating system and platform, and other
              technology on the devices you use to access this website.
            </li>
            <li>Usage Data includes information about how you use our website, products and services.</li>
          </ul>

          <h2>3. How We Use Your Personal Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data
            in the following circumstances:
          </p>
          <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>
              Where it is necessary for our legitimate interests (or those of a third party) and your interests and
              fundamental rights do not override those interests.
            </li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally
            lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your
            personal data to those employees, agents, contractors and other third parties who have a business need to
            know.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we
            collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or
            reporting requirements.
          </p>

          <h2>6. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data,
            including the right to request access, correction, erasure, restriction, transfer, to object to processing,
            to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
          </p>

          <h2>7. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
          <p>Email: thando@legalscriber.co.za</p>
          <p>Phone: +27 722 251 491</p>
          <p>Address: Fourways, Sandton</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
