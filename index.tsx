import React, { useState } from 'react';

/**
 * Product definitions used by the warranty claim form and product listing. Each item
 * represents an SKU and a human-friendly name.
 */
interface Product {
  sku: string;
  name: string;
}

const PRODUCTS: Product[] = [
  { sku: 'HT-JACK', name: '2 TON FLOOR JACK' },
  { sku: 'HT-STAND', name: '2 TON JACK STANDS' },
  { sku: 'HT-CREEPER', name: '40" MECHANIC\'S CREEPER' },
];

// Zendesk configuration. Replace the placeholders with your actual Zendesk subdomain, user email, and API token.
const ZENDESK_SUBDOMAIN = 'your_subdomain';
const ZENDESK_EMAIL = 'your_email@example.com';
const ZENDESK_API_TOKEN = 'your_api_token';

/**
 * Helper to determine whether a purchase date is within the last
 * 365 calendar days (inclusive). Returns false for invalid dates
 * or dates in the future.
 */
export function within365Days(dateString: string): boolean {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 365;
}

/**
 * Utility function to combine class names, filtering out falsy values.
 */
export function classNames(...args: (string | false | undefined | null)[]): string {
  return args.filter(Boolean).join(' ');
}

/**
 * HyperToughWarranty component renders the landing page, product list,
 * troubleshooting & safety tips, and warranty claim form.
 */
export default function HyperToughWarranty() {
  type Step = 'home' | 'troubleshoot' | 'warranty' | 'submitted';
  const [step, setStep] = useState<Step>('home');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    sku: '',
    purchaseDate: '',
    description: '',
    injury: false,
  });

  // Generic change handler for form inputs. Handles checkboxes and text inputs.
  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value =
      field === 'injury' && 'checked' in e.target
        ? (e.target as HTMLInputElement).checked
        : (e.target as HTMLInputElement).value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handles submission of the warranty form. Performs basic validation on the purchase date,
  // then posts the data to Zendesk. Marks the claim as submitted and shows confirmation message.
  const handleSubmit = async () => {
    if (!within365Days(form.purchaseDate)) {
      alert('Purchase date must be within the last 365 days.');
      return;
    }
    // Build the ticket body
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `SKU: ${form.sku}`,
      `Purchase Date: ${form.purchaseDate}`,
      `Description: ${form.description}`,
      `Personal Injury: ${form.injury ? 'Yes' : 'No'}`,
    ].join('\n');

    const payload = {
      request: {
        subject: `Hyper Tough Warranty Claim for ${form.sku}`,
        comment: { body },
      },
    };

    try {
      await fetch(`https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/requests.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`),
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error creating Zendesk ticket:', error);
    } finally {
      setSubmitted(true);
      setStep('submitted');
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero section */}
      <header className="bg-[#C91235] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Get It Done. Fast. Easy. Tough.</h1>
          <p className="text-lg md:text-xl">Essential tools for every job.</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Featured products */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Featured Under‑car Essentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRODUCTS.map((p) => (
              <div key={p.sku} className="border rounded-lg p-4 shadow">
                <h3 className="font-bold text-lg mb-2">{p.name}</h3>
                <p className="text-sm text-gray-500">SKU: {p.sku}</p>
                <button
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                  onClick={() => setStep('warranty')}
                >
                  Warranty & Claim
                </button>
              </div>
            ))}
          </div>
        </section>
        {/* Troubleshooting & safety */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Troubleshooting & Safety</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Ensure the jack or stand is on a level surface before use.</li>
            <li>Inspect for oil leaks or worn components and replace as needed.</li>
            <li>Refer to the included manual for setup, safety and maintenance.</li>
          </ul>
          <div className="space-x-2">
            <button
              className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
              onClick={() => setStep('troubleshoot')}
            >
              More Safety Tips
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
              onClick={() => setStep('warranty')}
            >
              Start Warranty Claim
            </button>
          </div>
        </section>
        {/* Troubleshoot details */}
        {step === 'troubleshoot' && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-2">Troubleshooting Guide</h2>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Ensure the jack or stand is on a level surface before use.</li>
              <li>Inspect for oil leaks or worn components and replace as needed.</li>
              <li>Refer to the included manual for setup, safety and maintenance.</li>
            </ul>
            <button
              className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
              onClick={() => setStep('home')}
            >
              Back
            </button>
          </section>
        )}
        {/* Warranty claim form */}
        {(step === 'warranty' || step === 'submitted') && (
          <section className="mt-12">
            {step === 'warranty' && !submitted && (
              <div>
                <h2 className="text-xl font-bold mb-2">Warranty Claim</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block font-semibold mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full border p-2 rounded"
                      value={form.name}
                      onChange={handleChange('name')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border p-2 rounded"
                      value={form.email}
                      onChange={handleChange('email')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full border p-2 rounded"
                      value={form.phone}
                      onChange={handleChange('phone')}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Product SKU</label>
                    <select
                      className="w-full border p-2 rounded"
                      value={form.sku}
                      onChange={handleChange('sku')}
                      required
                    >
                      <option value="">Select SKU</option>
                      {PRODUCTS.map((p) => (
                        <option key={p.sku} value={p.sku}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Purchase Date</label>
                    <input
                      type="date"
                      className="w-full border p-2 rounded"
                      value={form.purchaseDate}
                      onChange={handleChange('purchaseDate')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Description of Issue</label>
                    <textarea
                      className="w-full border p-2 rounded"
                      value={form.description}
                      onChange={handleChange('description')}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="injury"
                      checked={form.injury}
                      onChange={handleChange('injury')}
                      className="mr-2"
                    />
                    <label htmlFor="injury">This issue involves a personal injury</label>
                  </div>
                  <div className="space-x-2">
                    <button
                      type="button"
                      className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
                      onClick={() => setStep('home')}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                    >
                      Submit Claim
                    </button>
                  </div>
                </form>
              </div>
            )}
            {step === 'submitted' && submitted && (
              <div>
                <h2 className="text-xl font-bold mb-2">Warranty Claim Submitted</h2>
                <p className="mb-4">
                  Thank you for contacting Hyper Tough warranty support. Your claim has been
                  received and will be processed. You will receive an email confirmation shortly. If
                  you flagged an injury, a representative will contact you directly.
                </p>
                <button
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
                  onClick={() => setStep('home')}
                >
                  Back to Home
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// Lightweight runtime tests to catch regressions in helper functions and data.
(() => {
  const format = (date: Date) => date.toISOString().split('T')[0];
  const today = format(new Date());
  const oneYearAgo = format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
  const older = format(new Date(Date.now() - 366 * 24 * 60 * 60 * 1000));
  const future = format(new Date(Date.now() + 24 * 60 * 60 * 1000));

  console.assert(within365Days(today) === true, 'within365Days should accept today');
  console.assert(within365Days(oneYearAgo) === true, 'within365Days should accept exactly 365 days ago');
  console.assert(within365Days(older) === false, 'within365Days should reject dates older than 365 days');
  console.assert(within365Days(future) === false, 'within365Days should reject future dates');

  console.assert(classNames('a', false, 'b', undefined, '', 'c') === 'a b c', 'classNames should filter out falsy values');
  console.assert(classNames(false, undefined, null) === '', 'classNames should return an empty string when all inputs are falsy');

  // Check that all product SKUs are unique
  const skuSet = new Set(PRODUCTS.map((p) => p.sku));
  console.assert(skuSet.size === PRODUCTS.length, 'Product SKUs should be unique');
})();
