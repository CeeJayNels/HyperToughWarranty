import React, { useState } from 'react';

/**
 * Product definitions used by the warranty claim form. Each item
 * represents an SKU and a human‑friendly name. Keeping this list
 * centralized makes it easier to display choices and validate
 * submissions in the future.
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

/**
 * Helper to determine whether a purchase date is within the last
 * 365 calendar days (inclusive). Returns false for invalid dates
 * or dates in the future. The calculation uses a simple
 * difference in milliseconds divided by the number of milliseconds
 * in a day.
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
 * Utility function to combine class names, filtering out falsy
 * values. Useful when conditionally applying Tailwind classes.
 */
export function classNames(
  ...args: (string | false | undefined | null)[]
): string {
  return args.filter(Boolean).join(' ');
}

// Self‑executing anonymous function containing lightweight
// run‑time assertions. These tests help catch regressions if you
// modify utility functions or product data. They will only run
// once at module load time and do not impact the UI.
(() => {
  // Helper to format a date string (YYYY-MM-DD) from a Date
  const format = (date: Date) => date.toISOString().split('T')[0];
  const today = format(new Date());
  const oneYearAgo = format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
  const older = format(new Date(Date.now() - 366 * 24 * 60 * 60 * 1000));
  const future = format(new Date(Date.now() + 24 * 60 * 60 * 1000));

  console.assert(
    within365Days(today) === true,
    'within365Days should accept today as valid'
  );
  console.assert(
    within365Days(oneYearAgo) === true,
    'within365Days should accept exactly 365 days ago as valid'
  );
  console.assert(
    within365Days(older) === false,
    'within365Days should reject dates older than 365 days'
  );
  console.assert(
    within365Days(future) === false,
    'within365Days should reject future dates'
  );

  console.assert(
    classNames('a', false, 'b', undefined, '', 'c') === 'a b c',
    'classNames should filter out falsy values'
  );
  console.assert(
    classNames(false, undefined, null) === '',
    'classNames should return an empty string when all values are falsy'
  );

  const creeper = PRODUCTS.find((p) => p.sku === 'HT-CREEPER');
  console.assert(
    creeper?.name === '40" MECHANIC\'S CREEPER',
    'Product name for creeper should be correctly quoted'
  );

  // Verify SKUs are unique
  const skuSet = new Set(PRODUCTS.map((p) => p.sku));
  console.assert(
    skuSet.size === PRODUCTS.length,
    'All product SKUs should be unique'
  );
})();

/**
 * Main component for the Hyper Tough warranty intake. Presents a
 * simple flow: choose between troubleshooting or submitting a
 * warranty claim. The claim form collects basic customer and
 * product information, validates purchase date, and acknowledges
 * receipt. This component uses Tailwind CSS utility classes for
 * styling, but you can adapt it to your own styling system.
 */
export default function HyperToughWarranty() {
  type Step = 'choose' | 'troubleshoot' | 'warranty' | 'submitted';
  const [step, setStep] = useState<Step>('choose');
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

  // Generic change handler for inputs. If the field is a
  // checkbox, use the checked property instead of value.
  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = field === 'injury' && 'checked' in e.target ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handles submission of the warranty form. Performs basic
  // validation on the purchase date and sets the submitted state.
  const handleSubmit = () => {
    if (!within365Days(form.purchaseDate)) {
      alert('Purchase date must be within the last 365 days.');
      return;
    }
    // In a real application you would POST the data to Zendesk
    // or your backend here. The injury flag could be used to
    // triage or route the claim differently. For now, we simply
    // mark the claim as submitted.
    setSubmitted(true);
    setStep('submitted');
  };

  if (step === 'submitted') {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Warranty Claim Submitted</h1>
        <p className="mb-4">
          Thank you for contacting Hyper Tough warranty support. Your claim has been
          received and will be processed. You will receive an email confirmation
          shortly. If you flagged an injury, a representative will contact you
          directly.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Hyper Tough Warranty</h1>
      {step === 'choose' && (
        <div>
          <p className="mb-4">How can we help you today?</p>
          <div className="flex space-x-2">
            <button
              className="p-2 bg-gray-200 rounded"
              onClick={() => setStep('troubleshoot')}
            >
              Troubleshoot
            </button>
            <button
              className="p-2 bg-red-600 text-white rounded"
              onClick={() => setStep('warranty')}
            >
              Start Warranty Claim
            </button>
          </div>
        </div>
      )}
      {step === 'troubleshoot' && (
        <div>
          <h2 className="text-xl font-bold mb-2">Troubleshooting Guide</h2>
          <ul className="list-disc pl-5 mb-4">
            <li>Ensure the jack or stand is on a level surface before use.</li>
            <li>Inspect for oil leaks or worn components and replace as necessary.</li>
            <li>Refer to the included manual for setup, safety and maintenance.</li>
          </ul>
          <button className="p-2 bg-gray-200 rounded" onClick={() => setStep('choose')}>
            Back
          </button>
        </div>
      )}
      {step === 'warranty' && (
        <div>
          <h2 className="text-xl font-bold mb-2">Warranty Claim</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="mb-3">
              <label className="block font-semibold mb-1">Name</label>
              <input
                className="w-full border p-2 rounded"
                value={form.name}
                onChange={handleChange('name')}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full border p-2 rounded"
                value={form.email}
                onChange={handleChange('email')}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Phone</label>
              <input
                className="w-full border p-2 rounded"
                value={form.phone}
                onChange={handleChange('phone')}
                required
              />
            </div>
            <div className="mb-3">
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
            <div className="mb-3">
              <label className="block font-semibold mb-1">Purchase Date</label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={form.purchaseDate}
                onChange={handleChange('purchaseDate')}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Description of Issue</label>
              <textarea
                className="w-full border p-2 rounded"
                value={form.description}
                onChange={handleChange('description')}
              />
            </div>
            <div className="mb-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={form.injury}
                  onChange={handleChange('injury')}
                />
                <span className="ml-2">This issue involves a personal injury</span>
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                className="p-2 bg-gray-200 rounded"
                onClick={() => setStep('choose')}
              >
                Back
              </button>
              <button
                type="submit"
                className="p-2 bg-red-600 text-white rounded"
              >
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
