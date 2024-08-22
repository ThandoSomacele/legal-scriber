import React from 'react';
import ReactMarkdown from 'react-markdown';

const TermsAndConditions = () => {
  const termsContent = `
# Terms and Conditions

Last updated: ${new Date().toDateString()}

## 1. Introduction

Welcome to Legal Scriber. These Terms and Conditions govern your use of our website and services. By using our website or services, you agree to these Terms and Conditions in full. If you disagree with any part of these terms, please do not use our website or services.

## 2. Intellectual Property Rights

Unless otherwise stated, we own the intellectual property rights for all material on Legal Scriber. All intellectual property rights are reserved. You may view and/or print pages from our website for your own personal use subject to restrictions set in these terms and conditions.

## 3. Restrictions

You are specifically restricted from all of the following:

- Publishing any website material in any other media
- Selling, sublicensing and/or otherwise commercializing any website material
- Publicly performing and/or showing any website material
- Using this website in any way that is or may be damaging to this website
- Using this website in any way that impacts user access to this website
- Using this website contrary to applicable laws and regulations, or in any way may cause harm to the website, or to any person or business entity
- Engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this website
- Using this website to engage in any advertising or marketing

## 4. Your Content

In these terms and conditions, "Your Content" shall mean any audio, video, text, images or other material you choose to display on this website. By displaying Your Content, you grant Legal Scriber a non-exclusive, worldwide irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.

## 5. No Warranties

This website is provided "as is," with all faults, and Legal Scriber makes no express or implied representations or warranties, of any kind related to this website or the materials contained on this website.

## 6. Limitation of Liability

In no event shall Legal Scriber, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this website.

## 7. Indemnification

You hereby indemnify to the fullest extent Legal Scriber from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.

## 8. Severability

If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.

## 9. Variation of Terms

Legal Scriber is permitted to revise these Terms at any time as it sees fit, and by using this website you are expected to review these Terms on a regular basis.

## 10. Governing Law & Jurisdiction

These Terms will be governed by and interpreted in accordance with the laws of South Africa, and you submit to the non-exclusive jurisdiction of the state and federal courts located in South Africa for the resolution of any disputes.
  `;

  return (
    <div className='bg-white py-12 sm:py-16 lg:py-20'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='prose prose-indigo'>
          <ReactMarkdown>{termsContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
